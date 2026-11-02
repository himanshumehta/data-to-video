#!/usr/bin/env python3
"""
assemble.py: generic final-video assembler, driven by --type and --platform.

Loads the slide order and description templates from
content_types/{type}/assembly/{platform}.py, then joins the rendered slide
clips, the narration WAVs, the UI clicks baked into each clip and (optionally)
background music into video.mp4. Also writes description.txt and thumbnail.jpg.

Each slide is held on its last frame (ffmpeg tpad) until its narration ends, so
narration sets the timing. Reels are first curated to the shortest time limit of
the targets they fan out to (config/platforms.json).

Usage:
    python scripts/assemble.py ktm-250-duke --type ownership-cost --platform instagram-reels --lang en
    python scripts/assemble.py ktm-250-duke --type ownership-cost --platform instagram-reels --lang hi --bgm music.mp3

Background music is NOT included in this repository. Pass --bgm <file>, set
BGM_PATH, or drop tracks into assets/music/ (gitignored) to enable it.
"""

import argparse
import importlib
import os
import random
import subprocess
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Add project root to path for dynamic imports
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.lib.curate import curate  # noqa: E402
from scripts.lib.platforms import load_platforms, max_duration  # noqa: E402
from scripts.lib.tts import OUTPUT_SAMPLE_RATE, load_env  # noqa: E402
from scripts.lib.vehicle_data import cli_id, load_vehicle, output_dir  # noqa: E402

DEFAULT_BGM_GAIN = 0.25
THUMBNAIL_FLASH_SEC = 0.3     # cover frame for networks that use frame 0 as the thumbnail
FFPROBE_TIMEOUT_SEC = 60
VIDEO_CRF = "8"               # near-lossless master; networks re-encode on upload
THUMBNAIL_JPEG_QUALITY = 92
MIN_PAD_SEC = 0.001          # below this a slide already covers its narration
BRAND_HASHTAG = os.environ.get("BRAND_HASHTAG", "#BikeNCars")
MUSIC_SUFFIXES = (".mp3", ".wav", ".m4a", ".aac")


def _probe(args) -> str:
    r = subprocess.run(["ffprobe", "-v", "error", *args], capture_output=True, text=True,
                       timeout=FFPROBE_TIMEOUT_SEC, check=False)
    if r.returncode != 0:
        raise RuntimeError(f"ffprobe failed on {args[-1]}: {r.stderr.strip()}")
    return r.stdout.strip()


def get_duration(path) -> float:
    return float(_probe(["-show_entries", "format=duration",
                         "-of", "default=noprint_wrappers=1:nokey=1", str(path)]))


def get_video_info(path):
    out = _probe(["-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate",
                  "-of", "default=noprint_wrappers=1", str(path)])
    info = dict(line.split("=", 1) for line in out.splitlines() if "=" in line)
    num, _, den = info.get("r_frame_rate", "30/1").partition("/")
    fps = round(int(num) / int(den or 1)) if num.isdigit() else 30
    return int(info["width"]), int(info["height"]), fps


def has_audio(path) -> bool:
    """Check if a video file has an audio stream (the UI clicks)."""
    return bool(_probe(["-select_streams", "a", "-show_entries", "stream=index",
                        "-of", "default=noprint_wrappers=1:nokey=1", str(path)]))


def fit_filter(input_label: str, w: int, h: int, fps: int) -> str:
    """Scale + letterbox an input to the output frame."""
    return (f"[{input_label}]scale={w}:{h}:force_original_aspect_ratio=decrease,"
            f"pad={w}:{h}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps={fps}")


def collect_slides(audio_dir: Path, slides_root: Path, slide_order: list) -> list:
    """Collect slide MP4s (slides_root/{slide_id}.mp4) with their narration WAVs."""
    slides = []
    for slide_id in slide_order:
        mp4 = slides_root / f"{slide_id}.mp4"
        if not mp4.exists():
            print(f"  SKIP {slide_id}: no MP4")
            continue
        audio = audio_dir / f"{slide_id}.wav"
        if not audio.exists():
            print(f"  SKIP {slide_id}: no narration WAV")
            continue
        duration = get_duration(mp4)
        clicks = has_audio(mp4)
        print(f"  {slide_id:40s} {duration:.1f}s{' [clicks+video]' if clicks else ' [video only]'}")
        slides.append({"id": slide_id, "path": mp4, "duration": duration,
                       "audio_path": audio, "has_clicks": clicks})
    return slides


def assemble(slides, output_path, bgm_path=None, bgm_gain=DEFAULT_BGM_GAIN, thumbnail_path=None):
    """Build the ffmpeg filter graph and render the final video. Returns True on success.

    Video: [thumbnail flash] + each slide, padded (last frame cloned) to its narration length.
    Audio: [silence under the thumbnail] + (narration track + click track + optional BGM).
    """
    for s in slides:
        s["narr_dur"] = get_duration(s["audio_path"])
        s["eff_dur"] = max(s["duration"], s["narr_dur"])
        s["pad_dur"] = s["eff_dur"] - s["duration"]

    thumb_dur = THUMBNAIL_FLASH_SEC if thumbnail_path else 0.0
    slides_dur = sum(s["eff_dur"] for s in slides)

    infos = [get_video_info(s["path"]) for s in slides]
    out_w, out_h = Counter((w, h) for w, h, _ in infos).most_common(1)[0][0]
    out_fps = Counter(f for _, _, f in infos).most_common(1)[0][0]

    for s in slides:
        print(f"  {s['id']:40s} anim={s['duration']:.1f}s  narr={s['narr_dur']:.1f}s  eff={s['eff_dur']:.1f}s")
    print(f"{'Total:':<18} {thumb_dur + slides_dur:.1f}s  ({len(slides)} clips)")
    print(f"{'Output:':<18} {output_path}\n")

    inputs, graph = [], []
    idx = 0
    if thumbnail_path:
        inputs += ["-loop", "1", "-t", f"{thumb_dur:.3f}", "-i", str(thumbnail_path)]
        graph.append(fit_filter("0:v", out_w, out_h, out_fps) + "[thumbv]")
        idx = 1
    slide_idx = list(range(idx, idx + len(slides)))
    narr_idx = list(range(idx + len(slides), idx + 2 * len(slides)))
    for s in slides:
        inputs += ["-i", str(s["path"])]
    for s in slides:
        inputs += ["-i", str(s["audio_path"])]
    bgm_idx = None
    if bgm_path:
        bgm_idx = idx + 2 * len(slides)
        inputs += ["-stream_loop", "-1", "-i", str(bgm_path)]

    # Video: slides held on their last frame for the rest of their narration.
    for i, s in enumerate(slides):
        pad = (f",tpad=stop_mode=clone:stop_duration={s['pad_dur']:.3f}"
               if s["pad_dur"] > MIN_PAD_SEC else "")
        graph.append(fit_filter(f"{slide_idx[i]}:v", out_w, out_h, out_fps) + f"{pad}[sv{i}]")
    video_in = ("[thumbv]" if thumbnail_path else "") + "".join(f"[sv{i}]" for i in range(len(slides)))
    graph.append(f"{video_in}concat=n={len(slides) + (1 if thumbnail_path else 0)}:v=1:a=0[vout]")

    # Clicks: each slide's own audio, delayed to where the slide starts.
    clicks, t = [], 0.0
    for i, s in enumerate(slides):
        if s["has_clicks"]:
            ms = int(t * 1000)
            graph.append(f"[{slide_idx[i]}:a]adelay={ms}|{ms}[clk{i}]")
            clicks.append(f"[clk{i}]")
        t += s["eff_dur"]
    if clicks:
        graph.append(f"{''.join(clicks)}amix=inputs={len(clicks)}:duration=longest:normalize=0[clicks]")
    else:
        graph.append(f"anullsrc=r={OUTPUT_SAMPLE_RATE}:cl=stereo:d={slides_dur:.3f}[clicks]")

    # Narration: each WAV padded with silence to its slide's length, then concatenated.
    for i, s in enumerate(slides):
        graph.append(f"[{narr_idx[i]}:a]apad=whole_dur={s['eff_dur']:.3f}[narr{i}]")
    graph.append("".join(f"[narr{i}]" for i in range(len(slides)))
                 + f"concat=n={len(slides)}:v=0:a=1[narration]")

    if bgm_idx is not None:
        graph.append(f"[{bgm_idx}:a]volume={bgm_gain},atrim=duration={slides_dur:.3f},"
                     "asetpts=PTS-STARTPTS[bgm]")
        graph.append("[clicks][narration][bgm]amix=inputs=3:duration=longest:normalize=0[content_audio]")
    else:
        graph.append("[clicks][narration]amix=inputs=2:duration=longest:normalize=0[content_audio]")

    if thumbnail_path:
        graph.append(f"anullsrc=r={OUTPUT_SAMPLE_RATE}:cl=stereo,atrim=duration={thumb_dur:.3f},"
                     "asetpts=PTS-STARTPTS[thumb_sil]")
        graph.append("[thumb_sil][content_audio]concat=n=2:v=0:a=1[aout]")
    else:
        graph.append("[content_audio]acopy[aout]")

    cmd = ["ffmpeg", "-y", *inputs,
           "-filter_complex", ";\n".join(graph),
           "-map", "[vout]", "-map", "[aout]",
           "-c:v", "libx264", "-crf", VIDEO_CRF, "-preset", "slow", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "192k", "-ar", str(OUTPUT_SAMPLE_RATE),
           "-movflags", "+faststart", str(output_path)]

    print("Running ffmpeg...")
    r = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if r.returncode != 0:
        print(f"ERROR: ffmpeg failed (exit {r.returncode})")
        for line in r.stderr.strip().split("\n")[-30:]:
            print(f"  {line}")
        return False

    print(f"\nDone: {output_path}  ({output_path.stat().st_size / (1024 * 1024):.1f} MB)")
    return True


def write_description(output_dir: Path, vehicle: dict, lang: str, templates: dict) -> None:
    """Write description.txt from the content type's DESCRIPTION_TEMPLATES (EN fallback)."""
    tmpl = templates.get(lang) or templates.get("en")
    if not tmpl:
        return
    brand, name = vehicle.get("brand_name", ""), vehicle.get("short_name", "")
    price_ex = vehicle.get("price_ex_showroom") or 0
    total = vehicle.get("net_5yr", vehicle.get("total_cost_5yr", 0)) or 0
    hashtags = (f"#{brand.replace(' ', '').replace('-', '')} #{name.replace(' ', '').replace('-', '')} "
                f"#OwnershipCost #BikeOwnership {BRAND_HASHTAG} #MotorcycleCost #MotorbikeIndia")
    try:
        text = tmpl.format(
            brand=brand, name=name, year=vehicle.get("year", ""),
            price=vehicle.get("price_formatted", "N/A"),
            total_5yr=vehicle.get("net_5yr_display", vehicle.get("total_cost_5yr_display", "N/A")),
            multiplier=f"{total / price_ex:.1f}" if price_ex else "?",
            cost_per_km=vehicle.get("cost_per_km_display", "N/A"),
            slug=vehicle.get("slug", ""), hashtags=hashtags,
        )
    except KeyError as e:
        print(f"  WARN: description template missing key {e}; skipping description.txt")
        return
    path = output_dir / "description.txt"
    path.write_text(text, encoding="utf-8")
    print(f"  description.txt -> {path}")


def pick_bgm(explicit=None):
    """Return a background-music path, or None (no music ships with this repo).

    Priority: --bgm, then $BGM_PATH, then a random track from assets/music/.
    """
    explicit = explicit or os.environ.get("BGM_PATH")
    if explicit:
        p = Path(explicit)
        p = p if p.is_absolute() else ROOT / p
        if not p.is_file():
            sys.exit(f"ERROR: background music file not found: {p}")
        return p
    bgm_dir = ROOT / "assets" / "music"
    tracks = sorted(p for p in bgm_dir.glob("*") if p.suffix.lower() in MUSIC_SUFFIXES) \
        if bgm_dir.is_dir() else []
    if not tracks:
        return None
    chosen = random.choice(tracks)  # nosec B311 - picks a music track, not a secret
    print(f"BGM (random): {chosen.name}")
    return chosen


def write_thumbnail_jpg(png: Path, jpg: Path) -> None:
    from PIL import Image

    with Image.open(png) as img:
        img.convert("RGB").save(jpg, "JPEG", quality=THUMBNAIL_JPEG_QUALITY, optimize=True)
    print(f"  Thumbnail -> {jpg}")


def main():
    parser = argparse.ArgumentParser(
        description="Assemble the final MP4 from slide clips + narration (+ optional BGM)")
    parser.add_argument("slug", type=lambda v: cli_id(v, "slug"), help="Vehicle slug")
    parser.add_argument("--type", required=True, type=lambda v: cli_id(v, "content type"),
                        help="Content type (e.g. ownership-cost)")
    parser.add_argument("--platform", default="instagram-reels",
                        type=lambda v: cli_id(v, "platform"), help="Rendered platform")
    parser.add_argument("--lang", default="en", type=lambda v: cli_id(v, "lang"))
    parser.add_argument("--ds", default="default", type=lambda v: cli_id(v, "design system"))
    parser.add_argument("--bgm", default=None,
                        help="Background music file (default: $BGM_PATH, else assets/music/, else none)")
    parser.add_argument("--bgm-gain", type=float, default=DEFAULT_BGM_GAIN)
    parser.add_argument("--no-thumbnail", action="store_true", help="Skip the thumbnail flash and JPEG")
    parser.add_argument("--no-curate", action="store_true",
                        help="Keep every slide even if the reel exceeds a target's time limit")
    parser.add_argument("--dry-run", action="store_true", help="Show the slide plan without rendering")
    args = parser.parse_args()

    load_env(ROOT / ".env")

    # Content-type config: content_types/{type}/assembly/{platform}.py (+ optional curation.py)
    type_ = args.type.replace("-", "_")
    asm_path = f"content_types.{type_}.assembly.{args.platform.replace('-', '_')}"
    try:
        asm = importlib.import_module(asm_path)
    except ModuleNotFoundError as e:
        sys.exit(f"ERROR: Cannot load assembly module '{asm_path}': {e}")
    slide_order = list(asm.SLIDE_ORDER)

    vehicle = load_vehicle(slug=args.slug)
    lang_dir = output_dir(vehicle, args.type, args.platform, args.lang, args.ds)
    audio_dir, slides_root = lang_dir / "audio", lang_dir / "slides"

    limit = max_duration(args.platform, load_platforms())
    if limit is not None and not args.no_curate:
        try:
            scoring = importlib.import_module(f"content_types.{type_}.curation")
        except ModuleNotFoundError:
            scoring = None
        durations = {sid: get_duration(audio_dir / f"{sid}.wav")
                     for sid in slide_order if (audio_dir / f"{sid}.wav").exists()}
        result = curate(slide_order, durations,
                        scoring.interest_scores(vehicle) if scoring else {},
                        getattr(scoring, "PINNED", []), limit)
        if result["excludedSlides"]:
            print(f"\n  Curation (max {limit:g}s): kept {len(result['selectedSlides'])}, "
                  f"cut {', '.join(result['excludedSlides'])} ({result['totalDuration']}s)")
        slide_order = result["selectedSlides"]

    print(f"Vehicle : {args.slug}  [{args.lang}]")
    print(f"Type    : {args.type}  Platform: {args.platform}")
    print(f"Slides  : {slides_root}")
    print(f"Audio   : {audio_dir}")
    bgm_path = pick_bgm(args.bgm)
    print(f"BGM     : {bgm_path or 'none'}\n")

    slides = collect_slides(audio_dir, slides_root, slide_order)
    if not slides:
        sys.exit("\nERROR: No slides. Render slides first with remotion_render.py")
    print(f"\n  Total slides: {sum(s['duration'] for s in slides):.1f}s  ({len(slides)} slides)")
    if args.dry_run:
        print("\n(dry-run: no files written)")
        return

    thumb_png = slides_root / "thumbnail.png"
    use_thumb = thumb_png.exists() and not args.no_thumbnail
    output_path = lang_dir / "video.mp4"
    if not assemble(slides, output_path, bgm_path=bgm_path, bgm_gain=args.bgm_gain,
                    thumbnail_path=thumb_png if use_thumb else None):
        sys.exit(1)

    print("\nWriting metadata...")
    write_description(lang_dir, vehicle, args.lang, getattr(asm, "DESCRIPTION_TEMPLATES", {}))
    if use_thumb:
        write_thumbnail_jpg(thumb_png, lang_dir / "thumbnail.jpg")


if __name__ == "__main__":
    main()
