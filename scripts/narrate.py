#!/usr/bin/env python3
"""
narrate.py — Generic narration audio generator with --type and --platform flags.

Loads narration templates dynamically from content_types/{type}/narrations/{platform}.py.
Renders Jinja2 templates with vehicle data, optionally rewords (EN) or translates
(other languages) the script with an LLM, then produces one WAV per slide.

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

from scripts.lib.tts import load_env, generate_tts, save_wav
from scripts.lib.number_format import speech_friendly
from scripts.lib.vehicle_data import load_vehicle, brand_slug, output_dir

PREBAKED_ROOT = ROOT / "sample_data" / "narration"
WORDS_PER_SEC = 2.5  # observed pace of the Gemini narrator at 1.2x


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
    duration = max(2.5, words / WORDS_PER_SEC + 0.6)
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


def find_prebaked(slug: str, lang: str, slide_name: str):
    base = Path(os.environ.get("PREBAKED_NARRATION_DIR") or PREBAKED_ROOT) / slug / lang
    for ext in (".mp3", ".wav", ".m4a"):
        p = base / f"{slide_name}{ext}"
        if p.exists():
            return p
    return None


def prebaked_script(slug: str, lang: str):
    p = Path(os.environ.get("PREBAKED_NARRATION_DIR") or PREBAKED_ROOT) / slug / lang / "script.json"
    if p.exists():
        return json.loads(p.read_text()).get("slides")
    return None


def main():
    parser = argparse.ArgumentParser(
        description="Generate per-slide narration audio via Gemini TTS"
    )
    parser.add_argument("--slug", help="Vehicle slug (fetches from DB or cache)")
    parser.add_argument("--data-file", help="Cached vehicle JSON file")
    parser.add_argument("--type", required=True,
                        help="Content type (e.g. ownership-cost)")
    parser.add_argument("--platform", required=True,
                        help="Platform (e.g. youtube, instagram)")
    parser.add_argument("--ds", default="default",
                        help="Design system (default: default)")
    parser.add_argument("--lang", default="en",
                        help="Language code (default: en)")
    parser.add_argument("--voice", default="Achird",
                        help="Gemini TTS voice (default: Achird — Indian English male)")
    parser.add_argument(
        "--env",
        default=str(ROOT / ".env"),
        help="Path to .env file (default: repo-root .env)",
    )
    parser.add_argument(
        "--tts", default="gemini", choices=["gemini", "prebaked", "silent"],
        help="Audio source: gemini (needs credentials), prebaked (sample_data/narration), "
             "silent (zero-credential placeholder audio)",
    )
    parser.add_argument("--force", action="store_true",
                        help="Regenerate existing audio files")
    parser.add_argument(
        "--delay", type=int, default=25,
        help="Seconds to wait between TTS calls for rate limiting (default: 25)",
    )
    parser.add_argument(
        "--speed", type=float, default=1.2,
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
    args = parser.parse_args()

    # Load environment (.env is optional)
    load_env(args.env)

    # Load vehicle data
    vehicle = load_vehicle(slug=args.slug, data_file=args.data_file)

    # Add spoken_name for TTS — converts digits to words (390 → three ninety)
    if "spoken_name" not in vehicle:
        _spoken_numbers = {
            "110": "one ten", "125": "one twenty five", "150": "one fifty",
            "160": "one sixty", "180": "one eighty", "200": "two hundred",
            "250": "two fifty", "300": "three hundred", "310": "three ten",
            "350": "three fifty", "390": "three ninety", "400": "four hundred",
            "450": "four fifty", "457": "four fifty seven", "500": "five hundred",
            "650": "six fifty", "660": "six sixty", "750": "seven fifty",
            "790": "seven ninety", "1290": "twelve ninety", "1390": "thirteen ninety",
        }
        short_name = vehicle.get("short_name", "")
        spoken_parts = []
        for word in short_name.split():
            spoken_parts.append(_spoken_numbers.get(word, word))
        vehicle["spoken_name"] = " ".join(spoken_parts)
        print(f"  Spoken name: {vehicle['spoken_name']}")

    # Dynamically load narrations module: content_types/{type}/narrations/{platform}.py
    # Auto-select car-specific narrations if vehicle is a car
    type_ = args.type.replace("-", "_")
    platform_module = args.platform.replace("-", "_")
    vehicle_type = vehicle.get("vehicle_type") or vehicle.get("type", "motorcycle")
    if vehicle_type == "car":
        car_module_path = f"content_types.{type_}.narrations.{platform_module}_car"
        try:
            narr_module = importlib.import_module(car_module_path)
            print(f"  Using car-specific narrations: {car_module_path}")
        except ModuleNotFoundError:
            # Fallback to shared narrations if car-specific doesn't exist
            module_path = f"content_types.{type_}.narrations.{platform_module}"
            narr_module = importlib.import_module(module_path)
    else:
        module_path = f"content_types.{type_}.narrations.{platform_module}"
        try:
            narr_module = importlib.import_module(module_path)
        except ModuleNotFoundError as e:
            sys.exit(f"ERROR: Cannot load narrations module '{module_path}': {e}")

    # Check if this platform derives audio from another platform
    audio_from = getattr(narr_module, "AUDIO_FROM", None)
    if audio_from:
        print(f"NOTE: {args.platform} uses AUDIO_FROM='{audio_from}' — no TTS needed.")
        print(f"Run assemble.py --platform {args.platform} to copy audio from {audio_from} output.")
        sys.exit(0)

    # Get narration templates for this language
    narrations_dict = getattr(narr_module, "NARRATIONS", {})
    narrations = narrations_dict.get(args.lang, {})
    if not narrations:
        print(f"No narration templates for {args.type}/{args.platform}/{args.lang}")
        sys.exit(1)

    # Output directory
    brand = brand_slug(vehicle)
    slug = vehicle["slug"]
    audio_dir = output_dir(vehicle, args.type, args.platform, args.lang, args.ds) / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)

    # -- Staleness check (may exit early) --
    if args.check_staleness:
        results = check_staleness(narrations, vehicle, audio_dir)
        stale_count = print_staleness_table(
            results, slug, args.type, args.platform, args.lang
        )
        if not args.force:
            sys.exit(0)
        # --force was also passed: continue to regenerate everything
        if stale_count == 0:
            print("\nAll slides fresh — nothing to regenerate.")
            sys.exit(0)
        print(f"\n--force passed — proceeding to regenerate all slides.\n")

    # ── Reword / translate script resolution ─────────────────────────────────
    from scripts.lib.reword import (
        reword_slide, translate_slide,
        scripts_dir, load_script_cache, save_script_cache,
    )

    sc_dir = scripts_dir(ROOT, brand, slug, type_, args.ds, args.platform)
    is_en = (args.lang == "en")

    if args.tts == "prebaked":
        # Pre-generated audio ships with its own script — use it verbatim.
        baked = prebaked_script(slug, args.lang)
        if baked:
            save_script_cache(sc_dir, args.lang, slug, args.type, args.platform, baked)
        script_texts = baked
    elif args.tts == "silent" and not args.reword and not (not is_en and args.retranslate):
        # Zero-credential mode: never call the LLM; render templates directly.
        script_texts = None
        cached = load_script_cache(sc_dir, args.lang)
        if cached is not None:
            script_texts = cached["slides"]
    elif is_en and args.reword:
        # EN + --reword: render each slide, reword via Claude CLI, cache, then TTS
        print(f"Reword mode: generating unique EN script via Claude CLI...")
        reworded_slides = {}
        for slide_name, template_str in narrations.items():
            if template_str is None:
                continue
            base_text = render_narration(template_str, vehicle)
            print(f"  [reword] {slide_name}...")
            reworded_slides[slide_name] = reword_slide(base_text, slide_name, vehicle)
        save_script_cache(sc_dir, "en", slug, args.type, args.platform, reworded_slides)
        script_texts = reworded_slides

    elif not is_en:
        # Non-EN: always translate from cached reworded EN for variety.
        # Templates are only used as fallback when no EN cache exists.
        en_cache = load_script_cache(sc_dir, "en")
        if en_cache is None:
            if narrations:
                # No EN cache but templates exist — use them as fallback
                script_texts = None
                en_cache = None
                print(f"  WARN: No cached EN script — using {args.lang} templates (no variety)")
            else:
                sys.exit(
                    f"ERROR: No cached EN script found at {sc_dir}/en.json\n"
                    f"Run first: narrate.py --slug {slug} --type {args.type} "
                    f"--platform {args.platform} --lang en --reword"
                )
        if en_cache is not None:
            # Translate from cached EN script via Claude CLI
            if args.retranslate or load_script_cache(sc_dir, args.lang) is None:
                action = "Retranslating" if args.retranslate else "Translating"
                print(f"{action} from EN script to {args.lang} via Claude CLI...")
                translated_slides = {}
                for slide_name, en_text in en_cache["slides"].items():
                    print(f"  [translate→{args.lang}] {slide_name}...")
                    translated_slides[slide_name] = translate_slide(
                        en_text, slide_name, args.lang, vehicle
                    )
                save_script_cache(sc_dir, args.lang, slug, args.type,
                                  args.platform, translated_slides)
                script_texts = translated_slides
            else:
                # Use cached translation
                lang_cache = load_script_cache(sc_dir, args.lang)
                script_texts = lang_cache["slides"]
                print(f"Using cached {args.lang} script from scripts/{args.lang}.json")

    else:
        # EN without --reword: use cached EN script if available, else render template directly
        en_cache = load_script_cache(sc_dir, "en")
        if en_cache is not None:
            script_texts = en_cache["slides"]
            print(f"Using cached EN script from scripts/en.json")
        else:
            script_texts = None  # will render from templates per-slide below

    # ── TTS generation ────────────────────────────────────────────────────────
    print(f"Generating narration: {brand}/{slug} — {args.type}/{args.platform}")
    print(f"Language: {args.lang}  Voice: {args.voice}  Speed: {args.speed}x")
    print(f"Output: {audio_dir}\n")

    success = 0
    skipped = 0
    tts_call_count = 0

    for slide_name, template_str in narrations.items():
        if template_str is None:
            print(f"  [{slide_name}] No narration (skipped)")
            continue

        wav_path = audio_dir / f"{slide_name}.wav"
        if wav_path.exists() and not args.force:
            duration = _wav_duration(wav_path)
            print(f"  [{slide_name}] Already exists ({duration:.1f}s) — skipping (use --force to regenerate)")
            skipped += 1
            continue

        # Resolve narration text: from script cache or rendered template
        if script_texts is not None and slide_name in script_texts:
            narration_text = script_texts[slide_name]
        else:
            narration_text = render_narration(template_str, vehicle)

        if args.tts == "silent":
            duration = write_silent_wav(wav_path, narration_text)
            print(f"  [{slide_name}] silent {duration:.1f}s  \"{narration_text[:70]}...\"")
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

        if tts_call_count > 0:
            print(f"  ... waiting {args.delay}s (rate limit)...")
            time.sleep(args.delay)

        print(f"  [{slide_name}] \"{narration_text[:80]}...\"")
        print(f"  [{slide_name}] Generating TTS ({len(narration_text)} chars)...")

        try:
            pcm_data = generate_tts(narration_text, voice=args.voice, lang=args.lang)
            save_wav(pcm_data, wav_path, speed=args.speed)
            duration = len(pcm_data) / (24000 * 2)  # 24kHz, 16-bit mono
            print(f"  [{slide_name}] Saved: {wav_path.name} ({duration:.1f}s)")
            success += 1
            tts_call_count += 1
        except Exception as e:
            print(f"  [{slide_name}] ERROR: {e}")
            tts_call_count += 1

    print(f"\nDone: {success} generated, {skipped} skipped → {audio_dir}")

    # -- Write staleness state file after successful generation --
    if success > 0:
        snapshot = build_field_snapshot(narrations, vehicle)
        save_state(audio_dir, slug, args.type, args.platform, args.lang, snapshot)
        print(f"Updated {STATE_FILENAME} ({len(snapshot)} slides tracked)")


if __name__ == "__main__":
    main()
