#!/usr/bin/env python3
"""
remotion_render.py -- Render slide clips via Remotion.

Builds a render queue from content_types/<type>/remotion.json (platform -> format
-> composition set), writes per-slide props, then hands the queue to
remotion/scripts/render-batch.mjs which bundles once and renders N jobs in parallel.

Usage:
    # Batch render (one vehicle, one platform, one language):
    python scripts/remotion_render.py --batch \
        --slug ktm-250-duke --type ownership-cost --platform instagram-reels --lang en

    # Single composition with explicit props:
    python scripts/remotion_render.py --composition HookReels \
        --props '{"vehicle": {...}, "durationSec": 5}' --out /tmp/hook.mp4

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

from scripts.lib.vehicle_data import load_vehicle, stage_image, output_dir
REMOTION_DIR = ROOT / "remotion"
REMOTION_ENTRY = "src/index.ts"

# ── Platform CLI shorthands → registry keys ──────────────────────
PLATFORM_SHORTHANDS = {
    "youtube": "youtube",
    "instagram": "instagram-posts",
    "instagram-reels": "instagram-reels",
    "youtube-shorts": "youtube-shorts",
    "facebook": "facebook-posts",
    "threads": "threads-posts",
}

def get_wav_duration(path):
    """Get WAV duration using wave module."""
    with wave.open(str(path), "rb") as wf:
        return wf.getnframes() / wf.getframerate()


def get_speech_end(wav_path, silence_db=-40, silence_min=0.15):
    """Return the time when speech effectively ends by detecting trailing silence."""
    result = subprocess.run([
        "ffmpeg", "-i", str(wav_path),
        "-af", f"silencedetect=noise={silence_db}dB:d={silence_min}",
        "-f", "null", "-"
    ], capture_output=True, text=True)

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
        if last_start < 0.05:
            # Entirely silent clip (e.g. narrate.py --tts silent): keep full length.
            return get_wav_duration(wav_path)
        return max(last_start, 1.0)

    return get_wav_duration(wav_path)


def render_composition(comp_id, props_json, out_path, width=3840, height=2160, fps=60, concurrency=None):
    """Render a single Remotion composition to MP4."""
    cmd = [
        "npx", "remotion", "render",
        REMOTION_ENTRY,
        comp_id,
        str(out_path),
        "--props", props_json,
        "--width", str(width),
        "--height", str(height),
        "--fps", str(fps),
        "--codec", "h264",
        "--crf", "18",
        "--log", "error",
    ]
    if concurrency:
        cmd += ["--concurrency", str(concurrency)]

    result = subprocess.run(
        cmd,
        cwd=str(REMOTION_DIR),
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        print(f"  ERROR rendering {comp_id}:")
        stderr_lines = result.stderr.strip().split("\n")
        for line in stderr_lines[-15:]:
            print(f"    {line}")
        return False

    return True


def single_render(args):
    """Render a single composition with explicit props."""
    comp_id = args.composition
    props_json = args.props
    out_path = Path(args.out).resolve()

    out_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"Rendering {comp_id} -> {out_path}")
    ok = render_composition(comp_id, props_json, out_path)
    if ok:
        size_mb = out_path.stat().st_size / (1024 * 1024)
        print(f"  Done: {out_path} ({size_mb:.1f} MB)")
    else:
        print(f"  FAILED: {comp_id}")
    return ok


# ══════════════════════════════════════════════════════════════════
#  Batch mode — reads remotion.json, builds queue, invokes Node
# ══════════════════════════════════════════════════════════════════

def resolve_platform(platform_arg):
    """Resolve platform CLI shorthand to registry key."""
    return PLATFORM_SHORTHANDS.get(platform_arg, platform_arg)


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
        print("ERROR: --slug, --data-file, or --vehicles is required with --batch")
        sys.exit(1)


def build_render_queue(vehicles, content_type, theme_name, platform, lang,
                       allow_partial_narration=False, scale=None):
    """Build render-queue.json for all vehicles x slides.

    Vehicle/theme data written to separate JSON files (referenced by path
    in queue) to keep queue JSON small.

    Narration guard: by default, refuses to build a queue when any non-thumbnail
    slide is missing its narration WAV. Without this guard, missing WAVs
    silently fall back to "still" render mode, producing PNG instead of MP4
    and breaking downstream assemble.py. Pass allow_partial_narration=True to
    intentionally render stills for un-narrated slides (rare).
    """
    missing_narration = []  # list[(slug, slide_id, expected_wav_path)]
    registry = load_registry(content_type)

    # Load theme
    theme_path = ROOT / "design-systems" / theme_name / "theme.json"
    if theme_path.exists():
        theme = json.loads(theme_path.read_text())
    else:
        print(f"WARN: theme.json not found for '{theme_name}', using empty theme")
        theme = {"name": theme_name}

    # Resolve platform → format → composition set
    platform_key = resolve_platform(platform)
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

    # Select composition set (base or themed variant)
    base_comp_set = format_config["compositionSet"]
    comp_key = f"{base_comp_set}-{theme_name}" if theme_name != "default" else base_comp_set
    compositions = registry.get(comp_key, registry.get(base_comp_set, {}))

    if not compositions:
        print(f"ERROR: No compositions found for key '{comp_key}' (or '{base_comp_set}')")
        sys.exit(1)

    # Exclude thumbnail from slide count (it's a still, not part of the video)
    video_compositions = {k: v for k, v in compositions.items() if k != "thumbnail"}
    total_slides = len(video_compositions) if "portrait" in format_name else None
    width = format_config["width"]
    height = format_config["height"]
    fps = format_config["fps"]

    # Props directory for per-slide JSON files
    props_dir = ROOT / "output" / "_work" / "props"
    props_dir.mkdir(parents=True, exist_ok=True)

    queue = []
    skipped_vehicles = []

    for vehicle in vehicles:
        slug = vehicle["slug"]
        brand = vehicle.get("brand_slug", slug.split("-")[0])

        # Pre-render image validation — HARD FAIL, do not skip silently.
        # Every reel needs a transparent-background (nobg) vehicle image.
        nobg = vehicle.get("primary_nobg_url")
        if not nobg or "placeholder" in (nobg or ""):
            print(f"\n{'='*70}")
            print(f"  RENDER BLOCKED: {slug} has no primary_nobg_url")
            print(f"  Add a transparent PNG and set primary_nobg_url to an https:// URL")
            print(f"  or to 'vehicles/{slug}.png' with the file in VEHICLE_IMAGE_DIR.")
            print(f"{'='*70}")
            sys.exit(1)
        stage_image(vehicle)

        lang_dir = output_dir(vehicle, content_type, platform_key, lang, theme_name)
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
                "theme": theme,
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
            job_scale = scale if scale else (2 if format_config["width"] <= 1080 else 1)

            queue.append({
                "compositionId": comp_config["component"],
                "propsPath": str(slide_props_path),
                "outputPath": str(output_path),
                "renderMode": render_mode,
                "animationFrames": anim_frames,
                "scale": job_scale,
                "durationSec": duration,
            })

    if skipped_vehicles:
        print(f"\nWARN: {len(skipped_vehicles)} vehicles skipped due to errors")

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
            print(f"\n    Generate the missing WAVs first:")
            print(f"      python scripts/narrate.py --slug {slug} --type {content_type} \\")
            print(f"          --platform {resolve_platform(platform)} --lang {lang}"
                  + ("  --reword" if lang == "en" else ""))
        print(f"\n  Once narration is complete, re-run this --batch command.")
        print(f"  To intentionally render stills for un-narrated slides "
              f"(rare), pass --allow-partial-narration.")
        print(f"{'='*70}\n")
        sys.exit(1)

    return queue


def invoke_batch_renderer(queue, concurrency=3, resume=False, dry_run=False, test=False, gl=None):
    """Write queue to JSON, invoke Node batch renderer."""
    queue_path = ROOT / "output" / "_work" / "render-queue.json"
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
    result = subprocess.run(cmd, cwd=str(ROOT / "remotion"))

    # Read results if available
    results_path = str(queue_path).replace(".json", "-results.json")
    if Path(results_path).exists():
        results = json.loads(Path(results_path).read_text())
        return results.get("failed", 0) == 0
    return result.returncode == 0


def batch_render(args):
    """Batch render: read registry, build queue, invoke Node renderer."""
    content_type = args.type or "ownership-cost"
    theme_name = args.theme or "default"
    platform = args.platform or "youtube"
    lang = args.lang or "en"

    if args.validate_registry:
        registry = load_registry(content_type)
        print(f"Registry for {content_type}:")
        for key in ["compositions", "portraitCompositions"]:
            if key in registry:
                print(f"  {key}: {len(registry[key])} slides")
        print("Registry valid.")
        return True

    if args.list_types:
        # Discover all content types with remotion.json
        ct_dir = ROOT / "content_types"
        for d in sorted(ct_dir.iterdir()):
            rj = d / "remotion.json"
            if rj.exists():
                reg = json.loads(rj.read_text())
                parts = []
                for key, comps in reg.items():
                    if key.endswith("Compositions") or key == "compositions":
                        parts.append(f"{len(comps)} {key}")
                print(f"  {reg.get('contentType', d.name)}: {', '.join(parts)}")
        return True

    vehicles = load_vehicles(args)
    print(f"Loaded {len(vehicles)} vehicle(s)")

    queue = build_render_queue(
        vehicles, content_type, theme_name, platform, lang,
        allow_partial_narration=getattr(args, "allow_partial_narration", False),
        scale=args.scale,
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
    parser = argparse.ArgumentParser(
        description="Render slide clips via Remotion"
    )
    subparsers = parser.add_subparsers(dest="mode")

    # Single render mode (default when --composition is used)
    parser.add_argument("--composition", help="Remotion composition ID (single mode)")
    parser.add_argument("--props", help="JSON props string (single mode)")
    parser.add_argument("--out", help="Output MP4 path (single mode)")

    # Batch mode (new — fast path via render-batch.mjs)
    parser.add_argument("--batch", action="store_true",
                        help="Batch render via render-batch.mjs (fast path)")
    parser.add_argument("--type", default="ownership-cost",
                        help="Content type (default: ownership-cost)")
    parser.add_argument("--theme", default="default",
                        help="Theme name (default: default)")
    parser.add_argument("--platform", default="youtube",
                        help="Platform (youtube, instagram, youtube-shorts, etc.)")
    parser.add_argument("--vehicles",
                        help="File with vehicle slugs, one per line")
    parser.add_argument("--resume", action="store_true",
                        help="Skip already-rendered outputs (--batch mode)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Validate and print queue without rendering")
    parser.add_argument("--test", action="store_true",
                        help="Render one job only to verify setup")
    parser.add_argument("--validate-registry", action="store_true",
                        help="Check remotion.json validity, no rendering")
    parser.add_argument("--list-types", action="store_true",
                        help="List registered content types and composition counts")
    parser.add_argument("--allow-partial-narration", action="store_true",
                        help="Render stills for slides whose narration WAV is missing. "
                             "By default --batch refuses to start unless every non-thumbnail "
                             "slide has its WAV in place — without this guard, missing WAVs "
                             "silently fall back to PNG stills and break assemble.py.")

    # Shared flags
    parser.add_argument("--slug", help="Vehicle slug")
    parser.add_argument("--data-file", help="Vehicle JSON file (skip DB)")
    parser.add_argument("--lang", default="en", help="Language code (default: en)")
    parser.add_argument("--concurrency", type=int, default=None,
                        help="Render concurrency (default: 3)")
    parser.add_argument("--scale", type=int, default=None,
                        help="Render scale factor (default: 2 for portrait, 1 for landscape)")
    parser.add_argument("--gl", default=None,
                        help="Chromium GL backend passed to Remotion (default: angle)")

    args = parser.parse_args()

    from scripts.lib.tts import load_env
    load_env(ROOT / ".env")

    # Check remotion dir exists
    if not REMOTION_DIR.exists():
        print(f"ERROR: Remotion project not found at {REMOTION_DIR}")
        print("Run: cd remotion && npm install")
        sys.exit(1)

    # Check node_modules
    if not (REMOTION_DIR / "node_modules").exists():
        print(f"ERROR: node_modules not found. Run: cd remotion && npm install")
        sys.exit(1)

    if args.batch or args.validate_registry or args.list_types:
        ok = batch_render(args)
        sys.exit(0 if ok else 1)
    elif args.composition:
        if not args.props or not args.out:
            print("ERROR: --props and --out are required with --composition")
            sys.exit(1)
        ok = single_render(args)
        sys.exit(0 if ok else 1)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
