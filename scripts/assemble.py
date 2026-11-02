#!/usr/bin/env python3
"""
assemble.py — Generic final video assembler with --type and --platform flags.

Loads assembly config dynamically from content_types/{type}/assembly/{platform}.py.
Combines slide MP4s + narration WAVs (+ optional intro, CTA, background music)
into a final video.mp4, and writes description.txt / chapters.txt / thumbnail.jpg.

Usage:
    python scripts/assemble.py ktm-250-duke --type ownership-cost --platform instagram-reels --lang en
    python scripts/assemble.py ktm-250-duke --type ownership-cost --platform instagram-reels --lang hi --bgm my-music.mp3

Background music is NOT included in this repository. Pass --bgm <file>, set
BGM_PATH, or drop tracks into assets/music/ (gitignored) to enable it.
"""

import argparse
import importlib
import json
import os
import shutil
import subprocess
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Add project root to path for dynamic imports
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.lib.vehicle_data import load_vehicle, brand_slug

DEFAULT_BGM_GAIN = 0.25
BRAND_HASHTAG = os.environ.get("BRAND_HASHTAG", "#BikeNCars")


def get_duration(path) -> float:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        capture_output=True, text=True,
    )
    if r.returncode != 0:
        raise RuntimeError(f"ffprobe failed on {path}: {r.stderr.strip()}")
    return float(r.stdout.strip())


def get_video_info(path):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height,r_frame_rate",
         "-of", "default=noprint_wrappers=1", str(path)],
        capture_output=True, text=True,
    )
    info = dict(line.split("=") for line in r.stdout.strip().splitlines() if "=" in line)
    w = int(info.get("width", 3840))
    h = int(info.get("height", 2160))
    try:
        num, den = info.get("r_frame_rate", "30/1").split("/")
        fps = round(int(num) / int(den))
    except Exception:
        fps = 30
    return w, h, fps


def scale_filter(input_idx, label, w, h, fps):
    return (
        f"[{input_idx}:v]scale={w}:{h}:force_original_aspect_ratio=decrease,"
        f"pad={w}:{h}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps={fps}[{label}]"
    )


def has_audio(path) -> bool:
    """Check if a video file has an audio stream."""
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "a",
         "-show_entries", "stream=index",
         "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        capture_output=True, text=True,
    )
    return bool(r.stdout.strip())


def collect_slides(slug: str, audio_dir: Path, slides_root: Path,
                   slide_order: list, slide_short: dict) -> list:
    """Collect slide MP4s + matching narration WAVs.

    Supports two path patterns:
    1. SVG pipeline:   slides_root/slide-{short}/slide-{short}.mp4
    2. Remotion batch:  slides_root/{slide_id}.mp4  (flat)
    """
    slides = []
    for slide_id in slide_order:
        short = slide_short[slide_id]

        # Try Remotion flat path first, then SVG nested path
        mp4_flat = slides_root / f"{slide_id}.mp4"
        mp4_nested = slides_root / f"slide-{short}" / f"slide-{short}.mp4"
        if mp4_flat.exists():
            mp4 = mp4_flat
        elif mp4_nested.exists():
            mp4 = mp4_nested
        else:
            print(f"  SKIP {slide_id} — no MP4")
            continue

        audio = audio_dir / f"{slide_id}.wav"
        if not audio.exists():
            print(f"  SKIP {slide_id} — no narration WAV")
            continue

        duration = get_duration(mp4)
        click_ok = has_audio(mp4)
        tag = " [clicks+video]" if click_ok else " [video only]"
        print(f"  {slide_id:40s} {duration:.1f}s{tag}")
        slides.append({
            "id":         slide_id,
            "short":      short,
            "path":       mp4,
            "duration":   duration,
            "audio_path": audio,
            "has_clicks": click_ok,
        })
    return slides


def assemble(slides, output_path,
             bgm_path=None, bgm_gain=DEFAULT_BGM_GAIN,
             intro_path=None, cta_path=None, cta_narr_path=None,
             bg_video_path=None, bg_opacity=0.2,
             thumbnail_path=None, thumbnail_dur=0.3):
    """Build ffmpeg filter_complex and render final video."""
    for s in slides:
        s["narr_dur"] = get_duration(s["audio_path"])
        s["eff_dur"]  = max(s["duration"], s["narr_dur"])
        s["pad_dur"]  = s["eff_dur"] - s["duration"]

    intro_dur  = get_duration(intro_path) if intro_path else 0.0
    cta_dur    = get_duration(cta_path)   if cta_path   else 0.0
    thumb_dur  = thumbnail_dur if (thumbnail_path and Path(thumbnail_path).exists()) else 0.0
    slides_dur = sum(s["eff_dur"] for s in slides)
    total_dur  = intro_dur + thumb_dur + slides_dur + cta_dur

    infos = [get_video_info(s["path"]) for s in slides]
    res_counts = Counter((w, h) for w, h, _ in infos)
    out_w, out_h = res_counts.most_common(1)[0][0]
    fps_counts = Counter(f for _, _, f in infos)
    out_fps = fps_counts.most_common(1)[0][0]

    N = len(slides)

    print(f"\n{'Intro:':<18} {f'{intro_dur:.1f}s' if intro_path else 'none'}")
    for s in slides:
        print(f"  {s['id']:40s} anim={s['duration']:.1f}s  narr={s['narr_dur']:.1f}s  eff={s['eff_dur']:.1f}s")
    print(f"{'Slides:':<18} {slides_dur:.1f}s  ({N} clips)")
    print(f"{'CTA:':<18} {f'{cta_dur:.1f}s' if cta_path else 'none'}")
    print(f"{'Total:':<18} {total_dur:.1f}s  ({int(total_dur // 60)}m {total_dur % 60:.0f}s)")
    print(f"{'Output:':<18} {output_path}\n")

    inputs       = []
    filter_parts = []
    idx          = 0

    intro_idx = None
    if intro_path:
        inputs += ["-i", str(intro_path)]
        intro_idx = idx; idx += 1

    thumb_idx = None
    if thumbnail_path and Path(thumbnail_path).exists():
        inputs += ["-loop", "1", "-t", f"{thumbnail_dur:.3f}", "-i", str(thumbnail_path)]
        thumb_idx = idx; idx += 1

    slide_start = idx
    for s in slides:
        inputs += ["-i", str(s["path"])]
        idx += 1

    cta_idx = None
    if cta_path:
        inputs += ["-i", str(cta_path)]
        cta_idx = idx; idx += 1

    narr_inputs = {}
    for s in slides:
        key = str(s["audio_path"])
        if key not in narr_inputs:
            narr_inputs[key] = idx
            inputs += ["-i", key]
            idx += 1

    cta_narr_idx = None
    if cta_narr_path and Path(cta_narr_path).exists():
        cta_narr_idx = idx
        inputs += ["-i", str(cta_narr_path)]
        idx += 1

    bgm_idx = None
    if bgm_path and bgm_path.exists():
        bgm_idx = idx
        inputs += ["-stream_loop", "-1", "-i", str(bgm_path)]
        idx += 1

    bg_video_idx = None
    if bg_video_path and Path(bg_video_path).exists():
        bg_video_idx = idx
        inputs += ["-stream_loop", "-1", "-i", str(bg_video_path)]
        idx += 1

    # VIDEO filters
    if intro_idx is not None:
        filter_parts.append(scale_filter(intro_idx, "intrv", out_w, out_h, out_fps))

    if thumb_idx is not None:
        filter_parts.append(
            f"[{thumb_idx}:v]scale={out_w}:{out_h}:force_original_aspect_ratio=decrease,"
            f"pad={out_w}:{out_h}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps={out_fps}[thumbv]"
        )

    for i in range(N):
        s = slides[i]
        pad_part = (f",tpad=stop_mode=clone:stop_duration={s['pad_dur']:.3f}"
                    if s["pad_dur"] > 0.001 else "")
        filter_parts.append(
            f"[{slide_start + i}:v]scale={out_w}:{out_h}:force_original_aspect_ratio=decrease,"
            f"pad={out_w}:{out_h}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps={out_fps}{pad_part}[sv{i}]"
        )

    if cta_idx is not None:
        filter_parts.append(scale_filter(cta_idx, "ctav", out_w, out_h, out_fps))

    thumb_prefix = "[thumbv]" if thumb_idx is not None else ""
    thumb_n = 1 if thumb_idx is not None else 0

    if cta_idx is not None and N > 1:
        pre  = "".join(f"[sv{i}]" for i in range(N - 1))
        last = f"[sv{N-1}]"
        filter_parts.append(f"{thumb_prefix}{pre}concat=n={thumb_n + N - 1}:v=1:a=0[pre_v]")
        filter_parts.append(f"[pre_v][ctav]{last}concat=n=3:v=1:a=0[content_v]")
    else:
        all_v = "".join(f"[sv{i}]" for i in range(N))
        filter_parts.append(f"{thumb_prefix}{all_v}concat=n={thumb_n + N}:v=1:a=0[content_v]")

    if intro_idx is not None:
        filter_parts.append("[intrv][content_v]concat=n=2:v=1:a=0[concat_v]")
    else:
        filter_parts.append("[content_v]setpts=PTS[concat_v]")

    # Background video overlay: screen blend in RGB space to avoid YUV chroma crosstalk.
    # Converting both inputs to gbrp (planar RGB) before blend prevents the purple cast
    # that occurs when FFmpeg blend operates on YUV chroma channels directly.
    if bg_video_idx is not None:
        total_dur = intro_dur + thumb_dur + slides_dur + cta_dur
        filter_parts.append(
            f"[{bg_video_idx}:v]scale={out_w}:{out_h}:force_original_aspect_ratio=increase,"
            f"crop={out_w}:{out_h},trim=end={total_dur:.3f},setpts=PTS-STARTPTS,"
            f"hue=s=0,format=gbrp[bg_scaled]"  # desaturate + convert to planar RGB
        )
        filter_parts.append(
            f"[concat_v]format=gbrp[slides_rgb]"
        )
        filter_parts.append(
            f"[slides_rgb][bg_scaled]blend=all_mode=screen:all_opacity={bg_opacity},"
            f"format=yuv420p[vout]"
        )
    else:
        filter_parts.append("[concat_v]copy[vout]")

    # AUDIO filters
    content_t  = 0.0
    click_segs = []
    for i, s in enumerate(slides):
        if cta_idx is not None and i == N - 1:
            content_t += cta_dur
        if s["has_clicks"]:
            delay_ms = int(content_t * 1000)
            label    = f"clk{i}"
            filter_parts.append(
                f"[{slide_start + i}:a]adelay={delay_ms}|{delay_ms}[{label}]"
            )
            click_segs.append(label)
        content_t += s["eff_dur"]

    if click_segs:
        click_in = "".join(f"[{c}]" for c in click_segs)
        filter_parts.append(
            f"{click_in}amix=inputs={len(click_segs)}:duration=longest:normalize=0[clicks]"
        )
    else:
        content_dur_for_null = slides_dur + cta_dur
        filter_parts.append(f"anullsrc=r=48000:cl=stereo:d={content_dur_for_null:.3f}[clicks]")

    narr_parts = []
    for i, s in enumerate(slides[:-1]):
        key   = str(s["audio_path"])
        label = f"narrp{i}"
        filter_parts.append(
            f"[{narr_inputs[key]}:a]apad=whole_dur={s['eff_dur']:.3f}[{label}]"
        )
        narr_parts.append(label)

    if cta_idx is not None and N > 1:
        if cta_narr_idx is not None:
            filter_parts.append(
                f"[{cta_narr_idx}:a]apad=whole_dur={cta_dur:.3f}[cta_narr]"
            )
            narr_parts.append("cta_narr")
        else:
            filter_parts.append(
                f"anullsrc=r=48000:cl=stereo,atrim=duration={cta_dur:.3f},"
                f"asetpts=PTS-STARTPTS[cta_sil]"
            )
            narr_parts.append("cta_sil")

    last_key   = str(slides[-1]["audio_path"])
    last_label = f"narrp{N-1}"
    filter_parts.append(
        f"[{narr_inputs[last_key]}:a]apad=whole_dur={slides[-1]['eff_dur']:.3f}[{last_label}]"
    )
    narr_parts.append(last_label)

    concat_in = "".join(f"[{p}]" for p in narr_parts)
    filter_parts.append(
        f"{concat_in}concat=n={len(narr_parts)}:v=0:a=1[narration]"
    )

    content_dur = slides_dur + cta_dur
    if bgm_idx is not None:
        filter_parts.append(
            f"[{bgm_idx}:a]volume={bgm_gain},"
            f"atrim=duration={content_dur:.3f},asetpts=PTS-STARTPTS[bgm]"
        )
        filter_parts.append(
            "[clicks][narration][bgm]amix=inputs=3:duration=longest:normalize=0[content_audio]"
        )
    else:
        filter_parts.append(
            "[clicks][narration]amix=inputs=2:duration=longest:normalize=0[content_audio]"
        )

    # Prepend silence for thumbnail + intro audio before content audio
    pre_audio_parts = []
    if thumb_idx is not None:
        filter_parts.append(
            f"anullsrc=r=48000:cl=stereo,atrim=duration={thumb_dur:.3f},"
            f"asetpts=PTS-STARTPTS[thumb_sil]"
        )
        pre_audio_parts.append("thumb_sil")
    if intro_idx is not None:
        pre_audio_parts.append(f"{intro_idx}:a")

    if pre_audio_parts:
        pre_in = "".join(f"[{p}]" for p in pre_audio_parts)
        filter_parts.append(
            f"{pre_in}[content_audio]concat=n={len(pre_audio_parts) + 1}:v=0:a=1[aout]"
        )
    else:
        filter_parts.append("[content_audio]acopy[aout]")

    filter_complex = ";\n".join(filter_parts)

    cmd = ["ffmpeg", "-y"] + inputs + [
        "-filter_complex", filter_complex,
        "-map", "[vout]",
        "-map", "[aout]",
        "-c:v", "libx264",
        "-crf", "8",
        "-preset", "slow",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-ar", "48000",
        "-movflags", "+faststart",
        str(output_path),
    ]

    print("Running ffmpeg...")
    r = subprocess.run(cmd, capture_output=True, text=True)

    if r.returncode != 0:
        print(f"ERROR: ffmpeg failed (exit {r.returncode})")
        for line in r.stderr.strip().split("\n")[-30:]:
            print(f"  {line}")
        return False

    mb = output_path.stat().st_size / (1024 * 1024)
    print(f"\nDone: {output_path}  ({mb:.1f} MB)")
    return True


def fmt_ts(secs: float) -> str:
    """Format seconds as YouTube chapter timestamp (M:SS or H:MM:SS)."""
    secs = int(secs)
    h = secs // 3600
    m = (secs % 3600) // 60
    s = secs % 60
    if h > 0:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


def write_metadata(slides, intro_dur, cta_dur, lang, output_dir, vehicle,
                   chapter_labels, description_templates):
    """Write chapters.txt and description.txt to output_dir after assembly."""
    labels = chapter_labels.get(lang, chapter_labels.get("en", {}))

    chapters = []
    t = 0.0

    if intro_dur > 0:
        chapters.append((t, labels.get("intro", "Intro")))
        t += intro_dur

    N = len(slides)
    for i, s in enumerate(slides[:-1]):
        chapters.append((t, labels.get(s["id"], s["id"])))
        t += s["eff_dur"]

    if cta_dur > 0:
        chapters.append((t, labels.get("cta", "Calculator")))
        t += cta_dur

    if slides:
        chapters.append((t, labels.get(slides[-1]["id"], slides[-1]["id"])))

    chapters_path = output_dir / "chapters.txt"
    with open(chapters_path, "w", encoding="utf-8") as f:
        for ts, label in chapters:
            f.write(f"{fmt_ts(ts)} {label}\n")
    print(f"  chapters.txt → {chapters_path}")

    if not vehicle:
        return

    tmpl_str = description_templates.get(lang, description_templates.get("en", ""))
    if not tmpl_str:
        return

    brand     = vehicle.get("brand_name", "")
    name      = vehicle.get("short_name", "")
    slug      = vehicle.get("slug", "")
    year      = vehicle.get("year", "")
    price     = vehicle.get("price_formatted", "N/A")
    total_5yr = vehicle.get("net_5yr_display", vehicle.get("total_cost_5yr_display", "N/A"))
    cost_per_km = vehicle.get("cost_per_km_display", "N/A")
    price_ex  = vehicle.get("price_ex_showroom", 0) or 0
    total_cost = vehicle.get("net_5yr", vehicle.get("total_cost_5yr", 0)) or 0
    multiplier = f"{total_cost / price_ex:.1f}" if price_ex else "?"

    brand_tag = brand.replace(" ", "").replace("-", "")
    model_tag = name.replace(" ", "").replace("-", "")
    hashtags  = (
        f"#{brand_tag} #{model_tag} #OwnershipCost "
        f"#BikeOwnership {BRAND_HASHTAG} #MotorcycleCost #MotorbikeIndia"
    )

    try:
        description = tmpl_str.format(
            brand=brand, name=name, year=year,
            price=price, total_5yr=total_5yr,
            multiplier=multiplier, cost_per_km=cost_per_km,
            slug=slug, hashtags=hashtags,
        )
        desc_path = output_dir / "description.txt"
        with open(desc_path, "w", encoding="utf-8") as f:
            f.write(description)
        print(f"  description.txt → {desc_path}")
    except KeyError as e:
        print(f"  WARN: description template missing key {e} — skipping description.txt")


def resolve_path(arg, default_rel=None):
    if arg:
        p = Path(arg)
        return p if p.is_absolute() else ROOT / p
    if default_rel:
        p = ROOT / default_rel
        return p if p.exists() else None
    return None


def pick_bgm(explicit=None):
    """Return a BGM path, or None (music is not shipped with this repo).

    Priority:
    1. Explicit --bgm argument (if passed)
    2. BGM_PATH environment variable
    3. Random pick from assets/music/ (gitignored, bring your own tracks)
    """
    import random
    explicit = explicit or os.environ.get("BGM_PATH")
    if explicit:
        p = Path(explicit)
        return p if p.is_absolute() else ROOT / p

    bgm_dir = ROOT / "assets" / "music"
    if bgm_dir.is_dir():
        tracks = sorted(bgm_dir.glob("*.mp3")) + sorted(bgm_dir.glob("*.wav")) + \
                 sorted(bgm_dir.glob("*.m4a")) + sorted(bgm_dir.glob("*.aac"))
        if tracks:
            chosen = random.choice(tracks)
            print(f"BGM (random): {chosen.name}")
            return chosen
    return None


def main():
    parser = argparse.ArgumentParser(
        description="Assemble final MP4 from slides + narration + intro + CTA + BGM"
    )
    parser.add_argument("slug", help="Vehicle slug (e.g. ktm-390-duke)")
    parser.add_argument("--type", required=True,
                        help="Content type (e.g. ownership-cost)")
    parser.add_argument("--platform", default="youtube",
                        help="Platform (default: youtube)")
    parser.add_argument("--lang", default="en",
                        help="Language code (default: en)")
    parser.add_argument("--ds", default="default")
    parser.add_argument("--no-thumbnail", action="store_true",
                        help="Skip thumbnail generation after assembly")
    parser.add_argument("--bgm", default=None,
                        help="Background music file (default: $BGM_PATH, else assets/music/, else none)")
    parser.add_argument("--bgm-gain", type=float, default=DEFAULT_BGM_GAIN)
    parser.add_argument("--bg-video", default="assets/bg-loop.mp4",
                        help="Background video looped under all slides (default: assets/bg-loop.mp4)")
    parser.add_argument("--bg-opacity", type=float, default=0.2,
                        help="Background video opacity 0.0–1.0 (default: 0.2)")
    parser.add_argument("--no-bg-video", action="store_true",
                        help="Disable background video overlay")
    parser.add_argument("--intro", default=None)
    parser.add_argument("--cta-video", default=None)
    parser.add_argument("--cta-narration", default=None)
    parser.add_argument("--no-intro", action="store_true")
    parser.add_argument("--no-cta", action="store_true")
    parser.add_argument("--output", default=None)
    parser.add_argument("--dry-run", action="store_true",
                        help="Show slide plan without rendering")
    parser.add_argument("--curate", action="store_true", default=False,
                        help="Run curation to drop slides that exceed platform time limit")
    parser.add_argument("--no-curate", action="store_true",
                        help="Disable auto-curation (overrides reels default)")
    args = parser.parse_args()

    from scripts.lib.tts import load_env
    load_env(ROOT / ".env")

    # Auto-enable curation for reels/shorts platforms (unless --no-curate)
    if not args.no_curate and any(x in args.platform for x in ("reels", "shorts")):
        args.curate = True

    # Dynamically load assembly module: content_types/{type}/assembly/{platform}.py
    type_ = args.type.replace("-", "_")
    platform_module = args.platform.replace("-", "_")
    asm_module_path = f"content_types.{type_}.assembly.{platform_module}"
    try:
        asm_module = importlib.import_module(asm_module_path)
    except ModuleNotFoundError as e:
        sys.exit(f"ERROR: Cannot load assembly module '{asm_module_path}': {e}")

    slide_order = asm_module.SLIDE_ORDER
    slide_short = asm_module.SLIDE_SHORT
    chapter_labels = getattr(asm_module, "CHAPTER_LABELS", {})
    description_templates = getattr(asm_module, "DESCRIPTION_TEMPLATES", {})

    # Check if this platform derives audio from another platform
    narr_module_path = f"content_types.{type_}.narrations.{platform_module}"
    try:
        narr_module = importlib.import_module(narr_module_path)
        audio_from = getattr(narr_module, "AUDIO_FROM", None)
    except ModuleNotFoundError:
        audio_from = None

    # Resolve platform shorthand (instagram → instagram-posts, etc.)
    # Matches remotion_render.py PLATFORM_SHORTHANDS for output path consistency
    platform_shorthands = {
        "instagram": "instagram-posts",
        "facebook": "facebook-posts",
        "threads": "threads-posts",
    }
    platform_key = platform_shorthands.get(args.platform, args.platform)

    # Load vehicle data (brand slug drives the output path; fields feed metadata)
    vehicle = load_vehicle(slug=args.slug)
    brand_guess = brand_slug(vehicle)
    # Try resolved platform key first (Remotion batch path), then raw platform
    lang_dir = ROOT / "output" / brand_guess / args.slug / type_ / args.ds / platform_key / args.lang
    if not lang_dir.exists():
        lang_dir_alt = ROOT / "output" / brand_guess / args.slug / args.type / args.ds / args.platform / args.lang
        if lang_dir_alt.exists():
            lang_dir = lang_dir_alt

    if audio_from:
        # Copy audio from the source platform's output directory
        src_audio_dir = ROOT / "output" / brand_guess / args.slug / type_ / args.ds / audio_from / args.lang / "audio"
        audio_dir = lang_dir / "audio"
        if src_audio_dir.exists():
            audio_dir.mkdir(parents=True, exist_ok=True)
            for wav in src_audio_dir.glob("*.wav"):
                dst = audio_dir / wav.name
                if not dst.exists():
                    shutil.copy2(wav, dst)
                    print(f"  Copied audio: {wav.name}")
            print(f"Audio copied from {audio_from} → {args.platform}")
        else:
            print(f"  WARN: Source audio dir not found: {src_audio_dir}")
            print(f"  Run narrate.py --platform {audio_from} first.")
    else:
        audio_dir = lang_dir / "audio"

    # ── Curation: drop slides that exceed platform time limit ──
    if args.curate:
        from scripts.lib.claude_step import curate, PLATFORM_LIMITS
        max_dur = PLATFORM_LIMITS.get(platform_key) or PLATFORM_LIMITS.get(args.platform)
        if max_dur is not None:
            # Build real durations from narration WAVs
            slide_durations = {}
            for sid in slide_order:
                wav = audio_dir / f"{sid}.wav"
                if wav.exists():
                    slide_durations[sid] = get_duration(wav)

            curation = curate(args.slug, vehicle, slide_durations, platform_key)
            selected = curation["selectedSlides"]
            excluded = curation["excludedSlides"]

            if excluded:
                print(f"\n  Curation ({platform_key}, max {max_dur}s):")
                print(f"    Selected: {', '.join(selected)} ({curation['totalDuration']}s)")
                print(f"    Excluded: {', '.join(excluded)}")
                print(f"    Headroom: {curation['headroom']}s")

            # Filter slide_order and slide_short to only selected slides
            slide_order = [s for s in slide_order if s in selected]
            slide_short = {k: v for k, v in slide_short.items() if k in selected}
        else:
            print(f"  No time limit for {platform_key} — all slides included")

    # Slides rendered by remotion_render.py --batch:
    #   output/{brand}/{slug}/{type}/{ds}/{platform}/{lang}/slides/
    slides_root = lang_dir / "slides"
    print(f"  Slides: {slides_root}")

    bgm_path = pick_bgm(args.bgm)

    platform_suffix = f"-{args.platform}" if args.platform != "youtube" else "-youtube"
    intro_path = None if args.no_intro else resolve_path(
        args.intro, f"assets/intros/intro{platform_suffix}.mp4"
    )
    cta_path = None if args.no_cta else resolve_path(
        args.cta_video, f"assets/slides/calculator-cta{platform_suffix}.mp4"
    )
    cta_narr_path = None if args.no_cta else resolve_path(
        args.cta_narration,
        f"assets/slides/calculator-cta-narration{'-hi' if args.lang == 'hi' else ''}.wav"
    )

    output_path = Path(args.output) if args.output else lang_dir / "video.mp4"
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Reels/shorts don't use background video overlay — portrait content fills the frame
    is_reels = args.platform in ("instagram-reels", "youtube-shorts", "facebook-reels", "threads-reels")
    bg_video_path = None if (args.no_bg_video or is_reels) else (Path(args.bg_video) if args.bg_video else None)

    print(f"Vehicle : {args.slug}  [{args.lang}]")
    print(f"Type    : {args.type}  Platform: {args.platform}")
    print(f"Audio   : {audio_dir}")
    print(f"BGM     : {bgm_path or 'none'}")
    if bg_video_path:
        bg_exists = bg_video_path.exists()
        print(f"BG video: {bg_video_path}  opacity={args.bg_opacity:.0%}  {'✓' if bg_exists else '✗ NOT FOUND'}")
    else:
        print(f"BG video: none  (pass --bg-video to enable)")
    print(f"Intro   : {intro_path or 'none'}")
    print(f"CTA     : {cta_path or 'none'}")
    print()

    slides = collect_slides(args.slug, audio_dir, slides_root, slide_order, slide_short)

    if not slides:
        print("\nERROR: No slides. Render slides first with remotion_render.py --batch")
        sys.exit(1)

    total_dur = sum(s["duration"] for s in slides)
    print(f"\n  Total slides: {total_dur:.1f}s  ({len(slides)} slides)")

    if args.dry_run:
        print("\n(dry-run — no files written)")
        sys.exit(0)

    effective_intro = intro_path if intro_path and intro_path.exists() else None
    effective_cta   = cta_path   if cta_path   and cta_path.exists()   else None

    thumb_png = lang_dir / "slides" / "thumbnail.png"

    ok = assemble(
        slides, output_path,
        bgm_path=bgm_path,
        bgm_gain=args.bgm_gain,
        intro_path=effective_intro,
        cta_path=effective_cta,
        cta_narr_path=cta_narr_path,
        bg_video_path=bg_video_path,
        bg_opacity=args.bg_opacity,
        thumbnail_path=thumb_png if thumb_png.exists() else None,
    )

    if ok:
        meta_intro_dur = get_duration(effective_intro) if effective_intro else 0.0
        meta_cta_dur   = get_duration(effective_cta)   if effective_cta   else 0.0

        print("\nWriting metadata...")
        write_metadata(slides, meta_intro_dur, meta_cta_dur, args.lang,
                       lang_dir, vehicle, chapter_labels, description_templates)

        # Thumbnail — always from Remotion (rendered by remotion_render.py)
        if not args.no_thumbnail:
            thumb_png = lang_dir / "slides" / "thumbnail.png"
            thumb_jpg = lang_dir / "thumbnail.jpg"
            if thumb_png.exists() and not thumb_jpg.exists():
                print("\nConverting thumbnail PNG → JPEG...")
                try:
                    from PIL import Image
                    img = Image.open(thumb_png).convert("RGB")
                    img.save(thumb_jpg, "JPEG", quality=92, optimize=True)
                    print(f"  Thumbnail → {thumb_jpg}")
                except Exception as e:
                    print(f"  WARNING: Thumbnail conversion failed: {e}")
            elif thumb_jpg.exists():
                print(f"\nThumbnail → {thumb_jpg}")
            else:
                print(f"\n  NOTE: No thumbnail. Render with remotion_render.py first.")

    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
