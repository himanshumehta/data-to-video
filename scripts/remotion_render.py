#!/usr/bin/env python3
"""
remotion_render.py -- Render slide clips via Remotion.

Builds a render queue from content_types/<type>/remotion.json (platform -> format
-> composition set), writes per-slide props, then hands the queue to
remotion/scripts/render-batch.mjs which bundles once and renders N jobs in parallel.

Each slide's length is the end of speech in its narration WAV; the render is
refused if any slide is missing its WAV.

Usage:
    python scripts/remotion_render.py \
        --slug ktm-250-duke --type ownership-cost --platform instagram-reels --lang en

Requires: Node.js, ffmpeg, and `npm ci` inside remotion/.
"""

import argparse
import json
import subprocess
import sys
import wave
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.lib.tts import load_env  # noqa: E402
from scripts.lib.vehicle_data import cli_id, load_vehicle, output_dir, stage_image  # noqa: E402

REMOTION_DIR = ROOT / "remotion"
WORK_DIR = ROOT / "output" / "_work"
SILENCE_DB = -40           # silencedetect threshold for "speech has ended"
SILENCE_MIN_SEC = 0.15
MIN_SLIDE_SEC = 1.0        # never cut a slide shorter than this
ALL_SILENT_SEC = 0.05      # trailing silence starting before this = silent placeholder clip
PORTRAIT_MAX_WIDTH = 1080  # formats this narrow render at 2x by default for sharper text

def get_wav_duration(path):
    """Get WAV duration using wave module."""
    with wave.open(str(path), "rb") as wf:
        return wf.getnframes() / wf.getframerate()


def get_speech_end(wav_path, silence_db=SILENCE_DB, silence_min=SILENCE_MIN_SEC):
    """Return the time when speech effectively ends by detecting trailing silence."""
    result = subprocess.run([
        "ffmpeg", "-i", str(wav_path),
        "-af", f"silencedetect=noise={silence_db}dB:d={silence_min}",
        "-f", "null", "-"
    ], capture_output=True, text=True, check=False)

    last_start = None
    last_end = None
    for line in result.stderr.split("\n"):
        if "silence_start:" in line:
            try:
                last_start = float(line.split("silence_start:")[1].strip())
            except ValueError:
                pass
        elif "silence_end:" in line:
            try:
                last_end = float(line.split("silence_end:")[1].split("|")[0].strip())
            except ValueError:
                pass

    if last_start is not None and (last_end is None or last_start > last_end):
        if last_start < ALL_SILENT_SEC:
            # Entirely silent clip (e.g. narrate.py --tts silent): keep full length.
            return get_wav_duration(wav_path)
        return max(last_start, MIN_SLIDE_SEC)

    return get_wav_duration(wav_path)


def load_registry(content_type):
    """Load remotion.json for a content type."""
    ct_dir = content_type.replace("-", "_")
    registry_path = ROOT / "content_types" / ct_dir / "remotion.json"
    if not registry_path.exists():
        print(f"ERROR: Registry not found: {registry_path}")
        sys.exit(1)
    return json.loads(registry_path.read_text())


def load_vehicles(args):
    """Load vehicle list from --slug, --data-file, or --vehicles."""
    if args.vehicles:
        vehicles_path = Path(args.vehicles)
        if not vehicles_path.exists():
            print(f"ERROR: Vehicles file not found: {vehicles_path}")
            sys.exit(1)
        slugs = [
            line.strip()
            for line in vehicles_path.read_text().splitlines()
            if line.strip() and not line.startswith("#")
        ]
        vehicles = []
        for slug in slugs:
            vehicles.append(load_vehicle(slug=slug))
        return vehicles
    elif args.data_file:
        return [load_vehicle(data_file=args.data_file)]
    elif args.slug:
        return [load_vehicle(slug=args.slug)]
    else:
        print("ERROR: --slug, --data-file, or --vehicles is required")
        sys.exit(1)


def build_render_queue(vehicles, content_type, platform, lang,
                       allow_partial_narration=False, scale=None, ds="default"):
    """Build render-queue.json for all vehicles x slides.

    Vehicle data is written to one props JSON file per slide (referenced by
    path in the queue) to keep the queue small.

    Narration guard: by default, refuses to build a queue when any non-thumbnail
    slide is missing its narration WAV. Without this guard, missing WAVs
    silently fall back to "still" render mode, producing PNG instead of MP4
    and breaking downstream assemble.py. Pass allow_partial_narration=True to
    intentionally render stills for un-narrated slides (rare).
    """
    missing_narration = []  # list[(slug, slide_id, expected_wav_path)]
    registry = load_registry(content_type)

    # Resolve platform → format → composition set
    platform_key = platform
    platform_config = registry.get("platforms", {}).get(platform_key)
    if not platform_config:
        available = ", ".join(registry.get("platforms", {}).keys())
        print(f"ERROR: Unknown platform '{platform_key}'. Available: {available}")
        sys.exit(1)

    format_name = platform_config["format"]
    format_config = registry["formats"].get(format_name)
    if not format_config:
        print(f"ERROR: Format '{format_name}' not found in registry")
        sys.exit(1)

    comp_key = format_config["compositionSet"]
    compositions = registry.get(comp_key, {})
    if not compositions:
        print(f"ERROR: No compositions found for key '{comp_key}'")
        sys.exit(1)

    # Exclude thumbnail from slide count (it's a still, not part of the video)
    video_compositions = {k: v for k, v in compositions.items() if k != "thumbnail"}
    total_slides = len(video_compositions) if "portrait" in format_name else None

    # Props directory for per-slide JSON files
    props_dir = WORK_DIR / "props"
    props_dir.mkdir(parents=True, exist_ok=True)

    queue = []

    for vehicle in vehicles:
        slug = vehicle["slug"]

        # Pre-render image validation — HARD FAIL, do not skip silently.
        # Every reel needs a transparent-background (nobg) vehicle image.
        nobg = vehicle.get("primary_nobg_url")
        if not nobg or "placeholder" in (nobg or ""):
            print(f"\n{'='*70}")
            print(f"  RENDER BLOCKED: {slug} has no primary_nobg_url")
            print("  Add a transparent PNG and set primary_nobg_url to an https:// URL")
            print(f"  or to 'vehicles/{slug}.png' with the file in VEHICLE_IMAGE_DIR.")
            print(f"{'='*70}")
            sys.exit(1)
        stage_image(vehicle)

        lang_dir = output_dir(vehicle, content_type, platform_key, lang, ds)
        audio_dir = lang_dir / "audio"

        video_idx = 0
        for slide_id, comp_config in compositions.items():
            wav = audio_dir / f"{slide_id}.wav"
            has_narration = wav.exists()
            duration = (
                get_speech_end(wav) if has_narration else comp_config["defaultDuration"]
            )

            is_thumbnail = slide_id == "thumbnail"
            if not is_thumbnail:
                video_idx += 1
                # Track missing narration so we can refuse below. Only
                # non-thumbnail slides need a WAV — thumbnail is a still by design.
                if not has_narration:
                    missing_narration.append((slug, slide_id, wav))

            props = {
                "vehicle": vehicle,
                "durationSec": duration,
                "contentMonthYear": datetime.now().strftime("%B %Y"),
                "lang": lang,
            }

            # Portrait slides get slide counter info (not for thumbnail)
            if total_slides is not None and not is_thumbnail:
                props["slideNumber"] = video_idx
                props["totalSlides"] = total_slides

            # Write per-slide props file
            slide_props_path = props_dir / f"{slug}_{slide_id}.json"
            slide_props_path.write_text(json.dumps(props, default=str))

            # Determine render mode
            anim_frames = comp_config.get("animationFrames", 0)
            if not has_narration:
                render_mode = "still"
            elif anim_frames > 0:
                render_mode = "animation"
            else:
                render_mode = "full"

            output_path = lang_dir / "slides" / f"{slide_id}.mp4"

            # Default: 2x scale for portrait formats (sharper text on mobile)
            job_scale = scale if scale else (2 if format_config["width"] <= PORTRAIT_MAX_WIDTH else 1)

            queue.append({
                "compositionId": comp_config["component"],
                "propsPath": str(slide_props_path),
                "outputPath": str(output_path),
                "renderMode": render_mode,
                "animationFrames": anim_frames,
                "scale": job_scale,
                "durationSec": duration,
            })

    # Narration guard. Without this, missing WAVs silently degrade slides to
    # "still" render mode (PNG instead of MP4) — assemble.py then can't find
    # the slide clips it expects, and the resulting "video" is a mix of
    # animated and still slides.
    if missing_narration and not allow_partial_narration:
        print(f"\n{'='*70}")
        print(f"  RENDER REFUSED: {len(missing_narration)} slide(s) missing narration WAVs")
        print(f"  lang={lang}  platform={platform}  type={content_type}")
        print(f"{'='*70}")
        # Group by slug for readability.
        by_slug = {}
        for slug, slide_id, wav_path in missing_narration:
            by_slug.setdefault(slug, []).append((slide_id, wav_path))
        for slug, items in by_slug.items():
            print(f"\n  {slug}: missing {len(items)} narration WAV(s)")
            for slide_id, wav_path in items[:10]:
                rel = wav_path.relative_to(ROOT) if wav_path.is_relative_to(ROOT) else wav_path
                print(f"    [{slide_id}]  expected: {rel}")
            if len(items) > 10:
                print(f"    (+ {len(items) - 10} more)")
            print("\n    Generate the missing WAVs first:")
            print(f"      python scripts/narrate.py --slug {slug} --type {content_type} \\")
            print(f"          --platform {platform} --lang {lang}"
                  + ("  --reword" if lang == "en" else ""))
        print("\n  Once narration is complete, re-run this render command.")
        print("  To intentionally render stills for un-narrated slides "
              "(rare), pass --allow-partial-narration.")
        print(f"{'='*70}\n")
        sys.exit(1)

    return queue


def invoke_batch_renderer(queue, concurrency=3, resume=False, dry_run=False, test=False, gl=None):
    """Write queue to JSON, invoke Node batch renderer."""
    queue_path = WORK_DIR / "render-queue.json"
    queue_path.parent.mkdir(parents=True, exist_ok=True)
    queue_path.write_text(json.dumps(queue, indent=2, default=str))

    cmd = [
        "node", str(ROOT / "remotion" / "scripts" / "render-batch.mjs"),
        str(queue_path),
        f"--concurrency={concurrency}",
    ]
    if resume:
        cmd.append("--resume")
    if dry_run:
        cmd.append("--dry-run")
    if test:
        cmd.append("--test")
    if gl:
        cmd.append(f"--gl={gl}")

    print(f"\nInvoking batch renderer: {len(queue)} jobs, concurrency={concurrency}")
    result = subprocess.run(cmd, cwd=str(REMOTION_DIR), check=False)

    # Read results if available
    results_path = str(queue_path).replace(".json", "-results.json")
    if Path(results_path).exists():
        results = json.loads(Path(results_path).read_text())
        return results.get("failed", 0) == 0
    return result.returncode == 0


def batch_render(args):
    """Batch render: read registry, build queue, invoke Node renderer."""
    vehicles = load_vehicles(args)
    print(f"Loaded {len(vehicles)} vehicle(s)")

    queue = build_render_queue(
        vehicles, args.type, args.platform, args.lang,
        allow_partial_narration=args.allow_partial_narration,
        scale=args.scale, ds=args.ds,
    )
    print(f"Built queue: {len(queue)} jobs")

    if not queue:
        print("Nothing to render.")
        return True

    return invoke_batch_renderer(
        queue,
        concurrency=args.concurrency or 3,
        resume=args.resume,
        dry_run=args.dry_run,
        test=args.test,
        gl=args.gl,
    )


def main():
    parser = argparse.ArgumentParser(description="Render slide clips via Remotion")
    parser.add_argument("--type", default="ownership-cost", type=lambda v: cli_id(v, "content type"),
                        help="Content type (default: ownership-cost)")
    parser.add_argument("--platform", default="instagram-reels", type=lambda v: cli_id(v, "platform"),
                        help="Platform key in remotion.json (default: instagram-reels)")
    parser.add_argument("--ds", default="default", type=lambda v: cli_id(v, "design system"),
                        help="Output variant folder (default: default)")
    parser.add_argument("--slug", type=lambda v: cli_id(v, "slug"), help="Vehicle slug")
    parser.add_argument("--data-file", help="Vehicle JSON file")
    parser.add_argument("--vehicles", help="File with vehicle slugs, one per line")
    parser.add_argument("--lang", default="en", type=lambda v: cli_id(v, "lang"),
                        help="Language code (default: en)")
    parser.add_argument("--resume", action="store_true", help="Skip already-rendered outputs")
    parser.add_argument("--dry-run", action="store_true", help="Print the queue without rendering")
    parser.add_argument("--test", action="store_true", help="Render one job only to verify setup")
    parser.add_argument("--allow-partial-narration", action="store_true",
                        help="Render stills for slides whose narration WAV is missing. "
                             "By default the batch refuses to start unless every non-thumbnail "
                             "slide has its WAV: missing WAVs would silently become PNG stills "
                             "and break assemble.py.")
    parser.add_argument("--concurrency", type=int, default=None, help="Render concurrency (default: 3)")
    parser.add_argument("--scale", type=int, default=None,
                        help="Render scale factor (default: 2 for portrait, 1 for landscape)")
    parser.add_argument("--gl", default=None, choices=["angle", "egl", "swangle", "swiftshader", "vulkan"],
                        help="Chromium GL backend passed to Remotion (default: angle)")
    args = parser.parse_args()

    load_env(ROOT / ".env")

    if not (REMOTION_DIR / "node_modules").exists():
        sys.exit("ERROR: remotion/node_modules not found. Run: make setup")

    sys.exit(0 if batch_render(args) else 1)


if __name__ == "__main__":
    main()
