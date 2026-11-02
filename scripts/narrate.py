#!/usr/bin/env python3
"""
narrate.py — Generic narration audio generator with --type and --platform flags.

Loads narration templates dynamically from content_types/{type}/narrations/{platform}.py.
Renders Jinja2 templates with vehicle data, optionally rewords (EN) or translates
(other languages) the script with an LLM, then produces one WAV per slide.

Every LLM output is checked by scripts/lib/guard.py (numbers match the source
text, no URLs, no banned phrases) before it is cached or voiced.

Audio sources (--tts):
    gemini    Gemini TTS (needs GEMINI_API_KEY, or GOOGLE_CLOUD_PROJECT + ADC)
    prebaked  decode pre-generated narration from sample_data/narration/<slug>/<lang>/
    silent    silent WAVs sized to the script length (zero credentials; for render tests)

Usage:
    python scripts/narrate.py --slug ktm-250-duke --type ownership-cost --platform instagram-reels --lang en --reword
    python scripts/narrate.py --slug ktm-250-duke --type ownership-cost --platform instagram-reels --lang hi
    python scripts/narrate.py --slug ktm-250-duke --type ownership-cost --platform instagram-reels --lang en --tts silent
"""

import argparse
import importlib
import json
import os
import re
import subprocess
import sys
import time
import wave
from datetime import datetime
from pathlib import Path
from typing import Optional

from jinja2 import Template

ROOT = Path(__file__).resolve().parent.parent

# Add project root to path for dynamic imports
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.lib.guard import (  # noqa: E402
    NarrationGuardError, banned_phrases, identity_numbers, number_mismatch, url_mentions,
)
from scripts.lib.number_format import speech_friendly, spoken_model_name  # noqa: E402
from scripts.lib.reword import (  # noqa: E402
    load_script_cache, reword_slide, save_script_cache, scripts_dir, translate_slide,
)
from scripts.lib.tts import TTS_SAMPLE_RATE, generate_tts, load_env, save_wav  # noqa: E402
from scripts.lib.vehicle_data import brand_slug, cli_id, load_vehicle, output_dir  # noqa: E402

PREBAKED_ROOT = ROOT / "sample_data" / "narration"
WORDS_PER_SEC = 2.5      # observed pace of the Gemini narrator at 1.2x
MIN_SILENT_SEC = 2.5     # floor for --tts silent placeholder clips
SILENT_PAD_SEC = 0.6     # breathing room added to the word-count estimate


def render_narration(template_str: str, vehicle_data: dict) -> str:
    """Render a Jinja2 narration template string with vehicle data."""
    tmpl = Template(template_str)
    rendered = tmpl.render(vehicle=vehicle_data)
    return speech_friendly(rendered)


def _wav_duration(path: Path) -> float:
    """Get WAV file duration in seconds."""
    with wave.open(str(path), "rb") as wf:
        return wf.getnframes() / wf.getframerate()


# -- Field name regex: matches {{ vehicle.field_name }} in Jinja2 templates --
_VEHICLE_FIELD_RE = re.compile(r'\{\{\s*vehicle\.(\w+)\s*\}\}')


def extract_template_fields(template_str: str) -> list[str]:
    """Extract vehicle field names referenced in a Jinja2 template string.

    Parses raw template text with regex (before Jinja2 rendering) to find
    all occurrences of {{ vehicle.field_name }}.  Returns deduplicated list
    in order of first appearance.
    """
    seen = set()
    fields = []
    for m in _VEHICLE_FIELD_RE.finditer(template_str):
        name = m.group(1)
        if name not in seen:
            seen.add(name)
            fields.append(name)
    return fields


def build_field_snapshot(narrations: dict, vehicle: dict) -> dict:
    """Build per-slide snapshot of referenced vehicle field values.

    Returns::
        {
            "00-what-you-will-learn": {"brand_name": "KTM", ...},
            "02-intro-hook": {"net_5yr_display": "...", ...},
        }
    """
    snapshot = {}
    for slide_name, template_str in narrations.items():
        if template_str is None:
            continue
        fields = extract_template_fields(template_str)
        slide_vals = {}
        for f in fields:
            val = vehicle.get(f)
            # Coerce to string for stable comparison (numeric values, etc.)
            slide_vals[f] = str(val) if val is not None else None
        snapshot[slide_name] = slide_vals
    return snapshot


STATE_FILENAME = ".narrate_state.json"


def load_state(audio_dir: Path) -> Optional[dict]:
    """Load narrate state JSON from audio dir, or None if missing / corrupt."""
    state_path = audio_dir / STATE_FILENAME
    if not state_path.exists():
        return None
    try:
        return json.loads(state_path.read_text())
    except (json.JSONDecodeError, OSError):
        return None


def save_state(audio_dir: Path, slug: str, content_type: str, platform: str,
               lang: str, snapshot: dict) -> None:
    """Write narrate state JSON to audio dir."""
    state = {
        "slug": slug,
        "type": content_type,
        "platform": platform,
        "lang": lang,
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "vehicle_field_snapshot": snapshot,
    }
    state_path = audio_dir / STATE_FILENAME
    state_path.write_text(json.dumps(state, ensure_ascii=False, indent=2))


def check_staleness(narrations: dict, vehicle: dict, audio_dir: Path) -> list[dict]:
    """Compare current vehicle data against saved snapshot.

    Returns a list of dicts, one per slide::

        {
            "slide": "02-intro-hook",
            "stale": True,
            "reason": "price_formatted: ... -> ...",
            "fields": ["brand_name", "price_formatted"],
        }
    """
    state = load_state(audio_dir)
    old_snapshot = state.get("vehicle_field_snapshot", {}) if state else {}

    results = []
    for slide_name, template_str in narrations.items():
        if template_str is None:
            continue

        fields = extract_template_fields(template_str)
        old_vals = old_snapshot.get(slide_name, {})
        changed = []

        if not old_vals:
            # No prior snapshot for this slide
            results.append({
                "slide": slide_name,
                "stale": True,
                "reason": "no previous snapshot",
                "fields": fields,
            })
            continue

        for f in fields:
            cur_val = str(vehicle.get(f)) if vehicle.get(f) is not None else None
            prev_val = old_vals.get(f)
            if cur_val != prev_val:
                changed.append((f, prev_val, cur_val))

        if changed:
            reasons = ", ".join(f"{f}: {old} -> {new}" for f, old, new in changed)
            results.append({
                "slide": slide_name,
                "stale": True,
                "reason": reasons,
                "fields": fields,
            })
        else:
            field_list = ", ".join(fields) if fields else "(no vehicle fields)"
            results.append({
                "slide": slide_name,
                "stale": False,
                "reason": f"{field_list} unchanged",
                "fields": fields,
            })

    return results


def print_staleness_table(results: list[dict], slug: str, content_type: str,
                          platform: str, lang: str) -> int:
    """Print a formatted staleness report. Returns count of stale slides."""
    total = len(results)
    stale_count = sum(1 for r in results if r["stale"])

    print(f"\nStaleness check: {slug} / {content_type} / {platform} / {lang}")
    for r in results:
        slide = r["slide"]
        if r["stale"]:
            print(f"  {slide:<30} STALE   {r['reason']}")
        else:
            print(f"  {slide:<30} fresh   ({r['reason']})")

    print(f"\nStale slides: {stale_count} / {total}")
    if stale_count > 0:
        print("Run with --force to regenerate all, or delete specific WAVs to regenerate selectively.")
    return stale_count


def write_silent_wav(path: Path, text: str) -> float:
    """Write a 48kHz stereo silent WAV whose length approximates the spoken text."""
    words = len(text.split())
    duration = max(MIN_SILENT_SEC, words / WORDS_PER_SEC + SILENT_PAD_SEC)
    path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-f", "lavfi",
         "-i", "anullsrc=r=48000:cl=stereo", "-t", f"{duration:.2f}", str(path)],
        check=True,
    )
    return duration


def decode_prebaked(src: Path, dst: Path) -> float:
    """Decode a pre-generated narration clip (mp3/wav) to 48kHz stereo WAV."""
    dst.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(src), "-ar", "48000", "-ac", "2", str(dst)],
        check=True,
    )
    return _wav_duration(dst)


def _prebaked_dir(slug: str, lang: str) -> Path:
    return Path(os.environ.get("PREBAKED_NARRATION_DIR") or PREBAKED_ROOT) / slug / lang


def find_prebaked(slug: str, lang: str, slide_name: str):
    base = _prebaked_dir(slug, lang)
    for ext in (".mp3", ".wav", ".m4a"):
        p = base / f"{slide_name}{ext}"
        if p.exists():
            return p
    return None


def prebaked_script(slug: str, lang: str):
    p = _prebaked_dir(slug, lang) / "script.json"
    if p.exists():
        return json.loads(p.read_text()).get("slides")
    return None


def audit_script(slides: dict, reference: Optional[dict], allowed=()) -> int:
    """Run the guard over a script whose audio already exists (prebaked). Warns only.

    `reference` is the EN script for a translation (numbers must match it), or None.
    Returns the number of slides with findings.
    """
    flagged = 0
    for slide, text in slides.items():
        problems = url_mentions(text) + [f"banned phrase {p!r}" for p in banned_phrases(text)
                                         if reference is None]
        if reference and slide in reference:
            problems += number_mismatch(reference[slide], text, allowed)
        if problems:
            flagged += 1
            print(f"  WARN [guard] {slide}: {'; '.join(problems)}")
    return flagged


def _guard_or_exit(fn, *args):
    """Run reword_slide/translate_slide; stop the run (nothing cached) if the guard fails."""
    try:
        return fn(*args)
    except NarrationGuardError as e:
        sys.exit(f"BLOCKED by narration guard: {e}\n  Last model output: {e.text[:300]!r}\n"
                 "  Nothing was cached or voiced. Re-run, or fix the template.")
    except RuntimeError as e:
        sys.exit(f"ERROR: {e}")


def parse_args(argv=None):
    parser = argparse.ArgumentParser(
        description="Generate per-slide narration audio via Gemini TTS"
    )
    parser.add_argument("--slug", type=lambda v: cli_id(v, "slug"),
                        help="Vehicle slug (a file in VEHICLE_DATA_DIR)")
    parser.add_argument("--data-file", help="Vehicle JSON file")
    parser.add_argument("--type", required=True, type=lambda v: cli_id(v, "content type"),
                        help="Content type (e.g. ownership-cost)")
    parser.add_argument("--platform", required=True, type=lambda v: cli_id(v, "platform"),
                        help="Platform (e.g. instagram-reels)")
    parser.add_argument("--ds", default="default", type=lambda v: cli_id(v, "design system"),
                        help="Output variant folder (default: default)")
    parser.add_argument("--lang", default="en", type=lambda v: cli_id(v, "lang"),
                        help="Language code (default: en)")
    parser.add_argument("--voice", default="Achird",
                        help="Gemini TTS voice (default: Achird — Indian English male)")
    parser.add_argument(
        "--env",
        default=str(ROOT / ".env"),
        help="Path to .env file (default: repo-root .env)",
    )
    parser.add_argument(
        "--tts", default="silent", choices=["gemini", "prebaked", "silent"],
        help="Audio source: silent (default; zero-credential placeholder audio), "
             "prebaked (sample_data/narration), gemini (paid; needs credentials)",
    )
    parser.add_argument("--force", action="store_true",
                        help="Regenerate existing audio files")
    parser.add_argument(
        "--delay", type=int, default=25,
        help="Seconds to wait between TTS calls for rate limiting (default: 25)",
    )
    parser.add_argument(
        "--speed", type=_speed, default=1.2,
        help="Narration playback speed via ffmpeg atempo (default: 1.2, e.g. 1.0 = normal)",
    )
    parser.add_argument(
        "--check-staleness", action="store_true",
        help="Check which slides have stale narration (vehicle data changed since last generation). "
             "Prints a table and exits unless combined with --force.",
    )
    parser.add_argument(
        "--reword", action="store_true",
        help="Generate unique EN narration via an LLM (Claude Code CLI) before TTS. "
             "EN only: rewrites template text into bike-specific voice. "
             "Non-EN: translates from cached EN script automatically.",
    )
    parser.add_argument(
        "--retranslate", action="store_true",
        help="Re-translate from cached EN script without re-rewording. "
             "Only valid for non-EN languages.",
    )
    return parser.parse_args(argv)


def _speed(value: str) -> float:
    v = float(value)
    if not 0.5 <= v <= 2.0:  # ffmpeg atempo's single-filter range
        raise argparse.ArgumentTypeError("--speed must be between 0.5 and 2.0")
    return v


def load_narrations(vehicle: dict, content_type: str, platform: str, lang: str) -> dict:
    """Templates for one language from content_types/{type}/narrations/{platform}[_car].py."""
    module_path = f"content_types.{content_type.replace('-', '_')}.narrations.{platform.replace('-', '_')}"
    module = None
    if (vehicle.get("vehicle_type") or vehicle.get("type")) == "car":
        try:
            module = importlib.import_module(module_path + "_car")
            print(f"  Using car-specific narrations: {module_path}_car")
        except ModuleNotFoundError:
            pass
    if module is None:
        try:
            module = importlib.import_module(module_path)
        except ModuleNotFoundError as e:
            sys.exit(f"ERROR: Cannot load narrations module '{module_path}': {e}")
    narrations = getattr(module, "NARRATIONS", {}).get(lang, {})
    if not narrations:
        sys.exit(f"No narration templates for {content_type}/{platform}/{lang}")
    return narrations


def _translate_all(en_slides: dict, lang: str, vehicle: dict) -> dict:
    print(f"Translating EN script to {lang} via Claude CLI...")
    out = {}
    for slide_name, en_text in en_slides.items():
        print(f"  [translate->{lang}] {slide_name}...")
        out[slide_name] = _guard_or_exit(translate_slide, en_text, slide_name, lang, vehicle)
    return out


def _reword_all(narrations: dict, vehicle: dict) -> dict:
    print("Reword mode: generating unique EN script via Claude CLI...")
    out = {}
    for slide_name, template_str in narrations.items():
        if template_str is None:
            continue
        print(f"  [reword] {slide_name}...")
        out[slide_name] = _guard_or_exit(
            reword_slide, render_narration(template_str, vehicle), slide_name, vehicle)
    return out


def _check_cached(cached: dict, sources: dict, label: str, allowed=()) -> None:
    """A cached LLM script is only reused if its numbers still match the current sources.

    Catches vehicle data that changed after the script was written.
    """
    stale = {k: number_mismatch(sources[k], v, allowed) for k, v in cached.items() if k in sources}
    stale = {k: v for k, v in stale.items() if v}
    if stale:
        detail = "; ".join(f"{k}: {', '.join(v)}" for k, v in stale.items())
        sys.exit(f"BLOCKED: cached {label} script no longer matches the data ({detail}).\n"
                 "  Re-run with --reword (EN) or --retranslate (other languages).")


def resolve_script(args, vehicle: dict, narrations: dict, sc_dir: Path) -> Optional[dict]:
    """Decide the text for each slide. None means: render the templates directly.

    prebaked  -> the script that ships with the audio (audited, warnings only)
    silent    -> cached script if any, else templates; never calls the LLM
    EN        -> --reword: LLM reword (guarded); else cached EN script or templates
    other     -> translation of the EN script (guarded), cached per language
    """
    slug, is_en = vehicle["slug"], args.lang == "en"
    rendered = {k: render_narration(t, vehicle) for k, t in narrations.items() if t is not None}
    allowed = identity_numbers(vehicle)

    if args.tts == "prebaked":
        baked = prebaked_script(slug, args.lang)
        if baked:
            reference = None if is_en else prebaked_script(slug, "en")
            if audit_script(baked, reference, allowed):
                print("  NOTE: prebaked audio is played as shipped; regenerate with "
                      "--tts gemini to apply the guard.")
            save_script_cache(sc_dir, args.lang, slug, args.type, args.platform, baked)
        return baked

    if args.tts == "silent" and not args.reword and not args.retranslate:
        cached = load_script_cache(sc_dir, args.lang)
        return cached["slides"] if cached else None

    if is_en:
        if args.reword:
            script = _reword_all(narrations, vehicle)
            save_script_cache(sc_dir, "en", slug, args.type, args.platform, script)
            return script
        cached = load_script_cache(sc_dir, "en")
        if cached is None:
            return None
        _check_cached(cached["slides"], rendered, "EN", allowed)
        print("Using cached EN script from scripts/en.json")
        return cached["slides"]

    en_cache = load_script_cache(sc_dir, "en")
    if en_cache is None:
        print(f"  WARN: No cached EN script; using {args.lang} templates (no LLM translation)")
        return None
    _check_cached(en_cache["slides"], rendered, "EN", allowed)
    cached = load_script_cache(sc_dir, args.lang)
    if cached is not None and not args.retranslate:
        _check_cached(cached["slides"], en_cache["slides"], args.lang, allowed)
        print(f"Using cached {args.lang} script from scripts/{args.lang}.json")
        return cached["slides"]
    script = _translate_all(en_cache["slides"], args.lang, vehicle)
    save_script_cache(sc_dir, args.lang, slug, args.type, args.platform, script)
    return script


def voice_slides(args, vehicle: dict, narrations: dict, script: Optional[dict], audio_dir: Path):
    """Write one WAV per slide. Returns (generated, skipped)."""
    slug = vehicle["slug"]
    success = skipped = tts_calls = 0
    for slide_name, template_str in narrations.items():
        if template_str is None:
            print(f"  [{slide_name}] No narration (skipped)")
            continue

        wav_path = audio_dir / f"{slide_name}.wav"
        if wav_path.exists() and not args.force:
            print(f"  [{slide_name}] Already exists ({_wav_duration(wav_path):.1f}s); "
                  "skipping (use --force to regenerate)")
            skipped += 1
            continue

        text = script[slide_name] if script and slide_name in script \
            else render_narration(template_str, vehicle)

        if args.tts == "silent":
            duration = write_silent_wav(wav_path, text)
            print(f"  [{slide_name}] silent {duration:.1f}s  \"{text[:70]}...\"")
            success += 1
            continue
        if args.tts == "prebaked":
            src = find_prebaked(slug, args.lang, slide_name)
            if src is None:
                sys.exit(f"ERROR: no pre-generated narration for {slug}/{args.lang}/{slide_name} "
                         f"under {PREBAKED_ROOT}. Use --tts silent or --tts gemini.")
            duration = decode_prebaked(src, wav_path)
            print(f"  [{slide_name}] prebaked {duration:.1f}s  ({src.name})")
            success += 1
            continue

        if tts_calls > 0:
            print(f"  ... waiting {args.delay}s (rate limit)...")
            time.sleep(args.delay)
        tts_calls += 1
        print(f"  [{slide_name}] Generating TTS ({len(text)} chars): \"{text[:80]}...\"")
        try:
            pcm = generate_tts(text, voice=args.voice, lang=args.lang)
            save_wav(pcm, wav_path, speed=args.speed)
            print(f"  [{slide_name}] Saved: {wav_path.name} "
                  f"({len(pcm) / (TTS_SAMPLE_RATE * 2) / args.speed:.1f}s)")
            success += 1
        except Exception as e:  # one failed slide must not stop the others; render refuses gaps
            print(f"  [{slide_name}] ERROR: {type(e).__name__}: {e}")
    return success, skipped


def main(argv=None):
    args = parse_args(argv)
    load_env(args.env)  # .env is optional
    vehicle = load_vehicle(slug=args.slug, data_file=args.data_file)

    # spoken_name for TTS: model numbers as words (350 -> three fifty)
    if "spoken_name" not in vehicle:
        vehicle["spoken_name"] = spoken_model_name(vehicle.get("short_name", ""))
        print(f"  Spoken name: {vehicle['spoken_name']}")

    narrations = load_narrations(vehicle, args.type, args.platform, args.lang)
    brand, slug = brand_slug(vehicle), vehicle["slug"]
    audio_dir = output_dir(vehicle, args.type, args.platform, args.lang, args.ds) / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)

    if args.check_staleness:
        results = check_staleness(narrations, vehicle, audio_dir)
        stale_count = print_staleness_table(results, slug, args.type, args.platform, args.lang)
        if not args.force or stale_count == 0:
            sys.exit(0)
        print("\n--force passed: regenerating all slides.\n")

    sc_dir = scripts_dir(ROOT, brand, slug, args.type.replace("-", "_"), args.ds, args.platform)
    script = resolve_script(args, vehicle, narrations, sc_dir)

    print(f"Generating narration: {brand}/{slug} | {args.type}/{args.platform}")
    print(f"Language: {args.lang}  Voice: {args.voice}  Speed: {args.speed}x  Source: {args.tts}")
    print(f"Output: {audio_dir}\n")
    success, skipped = voice_slides(args, vehicle, narrations, script, audio_dir)
    print(f"\nDone: {success} generated, {skipped} skipped -> {audio_dir}")

    if success > 0:
        snapshot = build_field_snapshot(narrations, vehicle)
        save_state(audio_dir, slug, args.type, args.platform, args.lang, snapshot)
        print(f"Updated {STATE_FILENAME} ({len(snapshot)} slides tracked)")


if __name__ == "__main__":
    main()
