#!/usr/bin/env python3
"""
ownership_pipeline.py -- End-to-end pipeline for ownership-cost reels (9:16).

Steps:
  1. preview  -- Load + validate vehicle data, write remotion/public/current-vehicle.json
  2. narrate  -- Narration script (templates, optional LLM reword/translate) + audio (narrate.py)
  3. render   -- Render Remotion slides via remotion_render.py --batch
  4. assemble -- Drift check, then assemble the final video via assemble.py
  5. publish  -- Hand the video to the social-publisher service (dry run unless --publish)

Usage:
    # Zero credentials: pre-generated narration shipped in sample_data/
    python scripts/ownership_pipeline.py --slug royal-enfield-classic-350-2024 --lang en --tts prebaked
    # Zero credentials, any sample vehicle: silent placeholder narration
    python scripts/ownership_pipeline.py --slug ktm-250-duke --lang en --tts silent
    # Full path: LLM reword + Gemini TTS (needs `claude` CLI + GEMINI_API_KEY)
    python scripts/ownership_pipeline.py --slug ktm-250-duke --lang en --tts gemini --reword
    python scripts/ownership_pipeline.py --slug ktm-250-duke --lang hi --tts gemini
    # One step only
    python scripts/ownership_pipeline.py --slug ktm-250-duke --lang en --step render
"""

import argparse
import json
import os
import subprocess
import sys
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Add project root to path for imports
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


from scripts.lib.vehicle_data import load_vehicle, output_dir

CONTENT_TYPE = "ownership-cost"
PLATFORM = "instagram-reels"


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------

REQUIRED_FIELDS = [
    "brand_name",
    "short_name",
    "net_5yr_display",
    "primary_nobg_url",
]

WARN_FIELDS = [
    ("annual_total_display", "Annual total display missing -- annual breakdown slide will be incomplete"),
    ("annual_service_display", "Annual service display missing -- service slide will be incomplete"),
    ("annual_insurance_display", "Annual insurance display missing -- breakdown slide will be incomplete"),
    ("cost_per_km_display", "Cost per km missing -- vs-segment slide will be incomplete"),
    ("multiplier", "Multiplier missing -- hook slide will be incomplete"),
]


def validate_vehicle(vehicle):
    """Validate vehicle has all required fields for ownership cost content.
    Returns True if valid, exits with error if critical data is missing.
    """
    errors = []
    warnings = []

    for field in REQUIRED_FIELDS:
        val = vehicle.get(field)
        if not val or (isinstance(val, str) and "placeholder" in val.lower()):
            if field == "primary_nobg_url":
                errors.append(
                    f"Missing {field}: every reel needs a transparent-background vehicle image "
                    f"(set it in the vehicle JSON)."
                )
            else:
                errors.append(f"Missing required field: {field}")

    for field, msg in WARN_FIELDS:
        if not vehicle.get(field):
            warnings.append(msg)

    for w in warnings:
        print(f"  WARN: {w}")

    if errors:
        print(f"\n  BLOCKED -- cannot produce content:")
        for e in errors:
            print(f"  ERROR: {e}")
        sys.exit(1)

    slug = vehicle.get("slug", "?")
    brand = vehicle.get("brand_name", "?")
    name = vehicle.get("short_name", "?")
    print(f"  Vehicle: {brand} {name} ({slug})")
    print(f"  Net 5yr: {vehicle.get('net_5yr_display', 'N/A')}")
    print(f"  NoBG:    {vehicle.get('primary_nobg_url', 'N/A')[:80]}")
    print(f"  Validated OK")
    return True


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _wav_duration(path):
    """Get WAV file duration in seconds."""
    try:
        with wave.open(str(path), "rb") as wf:
            return wf.getnframes() / wf.getframerate()
    except Exception:
        return 0.0


def _mp4_duration(path):
    """Get MP4 file duration in seconds via ffprobe."""
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
            capture_output=True, text=True,
        )
        return float(result.stdout.strip())
    except Exception:
        return 0.0


def get_output_dir(vehicle, lang, platform=PLATFORM, ds="default"):
    """Build output directory path matching remotion_render.py batch output layout."""
    return output_dir(vehicle, CONTENT_TYPE, platform, lang, ds)


def run_cmd(cmd, label, cwd=None, check=True):
    """Run a subprocess command with clear status messaging."""
    print(f"\n{'=' * 70}")
    print(f"  {label}")
    print(f"{'=' * 70}")
    cmd_str = " ".join(str(c) for c in cmd)
    print(f"  $ {cmd_str}\n")

    result = subprocess.run(cmd, cwd=cwd)

    if check and result.returncode != 0:
        print(f"\n  FAILED: {label} (exit code {result.returncode})")
        sys.exit(result.returncode)

    return result


# ---------------------------------------------------------------------------
# Pipeline steps
# ---------------------------------------------------------------------------

def step_preview(vehicle, lang):
    """Write vehicle data to remotion/public/current-vehicle.json for preview."""
    import datetime
    import decimal

    def _json_default(o):
        if isinstance(o, (datetime.datetime, datetime.date)):
            return o.isoformat()
        if isinstance(o, decimal.Decimal):
            return float(o)
        raise TypeError(f"Object of type {o.__class__.__name__} is not JSON serializable")

    public_dir = ROOT / "remotion" / "public"
    public_dir.mkdir(parents=True, exist_ok=True)

    vehicle_path = public_dir / "current-vehicle.json"
    vehicle_path.write_text(json.dumps(vehicle, indent=2, default=_json_default, ensure_ascii=False))
    print(f"  Vehicle data written to {vehicle_path}")
    from scripts.lib.vehicle_data import stage_image
    stage_image(vehicle)

    print(f"\n  Optional live preview: cd remotion && npm run gallery  (http://localhost:5173)")
    print(f"  Brand: {vehicle.get('brand_name', '?')}")
    print(f"  Name:  {vehicle.get('short_name', '?')}")
    print(f"  Net 5yr: {vehicle.get('net_5yr_display', 'N/A')}")


def resolve_tts(slug, lang, tts):
    """'auto' -> prebaked if sample narration exists, gemini if credentials exist, else silent."""
    if tts != "auto":
        return tts
    if (ROOT / "sample_data" / "narration" / slug / lang).is_dir():
        return "prebaked"
    if os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_CLOUD_PROJECT"):
        return "gemini"
    return "silent"


def step_narrate(vehicle, lang, tts="auto", reword=False, force=False):
    """Generate narration via narrate.py."""
    slug = vehicle.get("slug", "unknown")
    tts = resolve_tts(slug, lang, tts)

    cmd = [
        sys.executable, str(ROOT / "scripts" / "narrate.py"),
        "--slug", slug,
        "--type", CONTENT_TYPE,
        "--platform", PLATFORM,
        "--lang", lang,
        "--speed", "1.2",
        "--tts", tts,
    ]

    # EN: optional LLM reword for a unique per-vehicle script.
    # Non-EN: narrate.py translates from the cached EN script when one exists.
    if lang == "en" and reword:
        cmd.append("--reword")

    if force:
        cmd.append("--force")

    run_cmd(cmd, f"NARRATE: {slug} [{lang}]")


def step_render(vehicle, lang, scale=None):
    """Render Remotion slides via remotion_render.py --batch."""
    slug = vehicle.get("slug", "unknown")

    cmd = [
        sys.executable, str(ROOT / "scripts" / "remotion_render.py"),
        "--batch",
        "--slug", slug,
        "--type", CONTENT_TYPE,
        "--platform", PLATFORM,
        "--theme", "default",
        "--lang", lang,
    ]
    if scale:
        cmd += ["--scale", str(scale)]

    run_cmd(cmd, f"RENDER: {slug} [{lang}]")


def step_assemble(vehicle, lang, force=False):
    """Assemble final video via assemble.py, with drift validation first."""
    slug = vehicle.get("slug", "unknown")
    out_dir = get_output_dir(vehicle, lang)
    audio_dir = out_dir / "audio"
    slides_dir = out_dir / "slides"

    # --- Drift validation (block assembly if slide MP4 vs WAV drift > 2s) ---
    print(f"\n  Checking slide/narration drift...")

    # Load slide order from assembly config
    from content_types.ownership_cost.assembly.instagram_reels import SLIDE_ORDER

    drift_issues = []
    max_drift = 0.0
    slide_count = 0

    for slide_id in SLIDE_ORDER:
        mp4 = slides_dir / f"{slide_id}.mp4"
        wav = audio_dir / f"{slide_id}.wav"

        if not mp4.exists() or not wav.exists():
            continue

        mp4_dur = _mp4_duration(mp4)
        wav_dur = _wav_duration(wav)
        drift = abs(mp4_dur - wav_dur)
        max_drift = max(max_drift, drift)
        slide_count += 1

        flag = ""
        if drift > 2.0:
            flag = " << BLOCKED"
            drift_issues.append(slide_id)
        elif drift > 1.0:
            flag = " << WARNING"

        print(f"    {slide_id:35s} mp4={mp4_dur:.1f}s  wav={wav_dur:.1f}s  drift={drift:.1f}s{flag}")

    if slide_count == 0:
        sys.exit(
            f"\n  BLOCKED: No matching slide MP4 + WAV pairs found in {out_dir}\n"
            f"  Run --step render and --step narrate first."
        )

    if drift_issues:
        print(f"\n  BLOCKED: {len(drift_issues)} slide(s) have drift > 2s: {', '.join(drift_issues)}")
        print(f"  Max drift: {max_drift:.1f}s")
        print(f"  Re-render stale slides: python scripts/ownership_pipeline.py --slug {slug} --lang {lang} --step render")
        sys.exit(1)

    if max_drift > 1.0:
        print(f"\n  WARNING: max drift {max_drift:.1f}s (threshold 2s). Proceeding with assembly.")
    else:
        print(f"  Drift OK (max {max_drift:.1f}s, {slide_count} slides checked)")

    # --- Run assemble.py ---
    cmd = [
        sys.executable, str(ROOT / "scripts" / "assemble.py"),
        slug,
        "--type", CONTENT_TYPE,
        "--platform", PLATFORM,
        "--lang", lang,
    ]

    run_cmd(cmd, f"ASSEMBLE: {slug} [{lang}]")

    # Report output
    video_path = out_dir / "video.mp4"
    if video_path.exists():
        size_mb = video_path.stat().st_size / (1024 * 1024)
        print(f"\n  Final video: {video_path}")
        print(f"  Size: {size_mb:.1f} MB")
        print(f"  Duration: {_mp4_duration(video_path):.1f}s")


def step_publish(vehicle, lang, send=False):
    """Hand the assembled video to the social-publisher service (dry run by default)."""
    cmd = [
        sys.executable, str(ROOT / "scripts" / "publish.py"),
        str(get_output_dir(vehicle, lang)),
    ]
    if send:
        cmd.append("--send")
    run_cmd(cmd, f"PUBLISH ({'send' if send else 'dry run'}): {vehicle.get('slug')} [{lang}]")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Ownership cost reels pipeline (preview -> narrate -> render -> assemble)"
    )
    parser.add_argument("--slug", required=True, help="Vehicle slug (see sample_data/vehicles/)")
    parser.add_argument("--lang", default="en", help="Language code (en, hi, te, etc.)")
    parser.add_argument(
        "--step", default="all",
        choices=["all", "preview", "narrate", "render", "assemble", "publish"],
        help="Run a specific step (default: all)",
    )
    parser.add_argument("--tts", default="auto", choices=["auto", "gemini", "prebaked", "silent"],
                        help="Narration audio source (default: auto)")
    parser.add_argument("--reword", action="store_true",
                        help="EN only: LLM-reword the narration script (needs the `claude` CLI)")
    parser.add_argument("--scale", type=int, default=None,
                        help="Render scale (default 2 = 2160x3840 master; 1 = faster 1080x1920)")
    parser.add_argument("--publish", action="store_true",
                        help="Actually POST to SOCIAL_PUBLISHER_URL (default: dry run)")
    parser.add_argument("--force", action="store_true", help="Force regenerate narration")
    args = parser.parse_args()

    from scripts.lib.tts import load_env
    load_env(ROOT / ".env")

    print(f"\n  Ownership Cost Pipeline")
    print(f"  Slug: {args.slug}")
    print(f"  Lang: {args.lang}")
    print(f"  Step: {args.step}")
    if args.force:
        print(f"  Force: yes")
    print()

    # Load vehicle data
    vehicle = load_vehicle(args.slug)

    # Validate before any production step (skip for preview -- that is for QA)
    if args.step != "preview":
        validate_vehicle(vehicle)

    # Execute steps
    if args.step == "preview" or args.step == "all":
        step_preview(vehicle, args.lang)

    if args.step == "narrate" or args.step == "all":
        step_narrate(vehicle, args.lang, tts=args.tts, reword=args.reword, force=args.force)

    if args.step == "render" or args.step == "all":
        step_render(vehicle, args.lang, scale=args.scale)

    if args.step == "assemble" or args.step == "all":
        step_assemble(vehicle, args.lang, force=args.force)

    if args.step == "publish" or args.step == "all":
        step_publish(vehicle, args.lang, send=args.publish)

    # Summary
    if args.step == "all":
        out_dir = get_output_dir(vehicle, args.lang)
        video = out_dir / "video.mp4"
        print(f"\n{'=' * 70}")
        print(f"  PIPELINE COMPLETE")
        print(f"{'=' * 70}")
        print(f"  Vehicle: {vehicle.get('brand_name', '?')} {vehicle.get('short_name', '?')}")
        print(f"  Lang:    {args.lang}")
        if video.exists():
            dur = _mp4_duration(video)
            size_mb = video.stat().st_size / (1024 * 1024)
            print(f"  Video:   {video}")
            print(f"  Duration: {dur:.1f}s  Size: {size_mb:.1f} MB")
        print(f"  Output:  {out_dir}")


if __name__ == "__main__":
    main()
