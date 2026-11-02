#!/usr/bin/env python3
"""
publish.py — hand a finished video to the social-publisher service.

This repo does not talk to social networks directly. It posts each finished
video to a separate publishing service (configured by URL), which owns channel
credentials, scheduling and per-network upload quirks.

Given an output folder that holds video.mp4 (+ description.txt, thumbnail.jpg),
it works out which targets that video fans out to (config/platforms.json) and
builds one post per (target, language).

Dry run is the default: payloads are printed, nothing is sent.

Usage:
    python scripts/publish.py output/royal-enfield/royal-enfield-classic-350-2024/ownership_cost/default/instagram-reels/en
    python scripts/publish.py <dir> --send          # POST to $SOCIAL_PUBLISHER_URL
    python scripts/publish.py <dir> --target youtube-shorts --send

HTTP contract (one request per target):
    POST {SOCIAL_PUBLISHER_URL}/v1/posts            multipart/form-data
      Authorization: Bearer {SOCIAL_PUBLISHER_TOKEN}  (if set)
      Idempotency-Key: sha256(slug, content_type, target, lang, video sha256)
      fields: target, network, lang, title, description, slug, content_type
      files:  video (video/mp4), thumbnail (image/jpeg, optional)
"""

import argparse
import hashlib
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.lib.tts import load_env

PLATFORMS_JSON = ROOT / "config" / "platforms.json"


def load_platforms() -> dict:
    return json.loads(PLATFORMS_JSON.read_text())


def parse_output_dir(path: Path) -> dict:
    """output/{brand}/{slug}/{content_type}/{ds}/{platform}/{lang} -> parts."""
    parts = path.resolve().parts
    if "output" not in parts:
        sys.exit(f"ERROR: expected a path under output/: {path}")
    rel = parts[parts.index("output") + 1:]
    if len(rel) != 6:
        sys.exit(f"ERROR: expected output/<brand>/<slug>/<type>/<ds>/<platform>/<lang>, got {path}")
    brand, slug, content_type, ds, platform, lang = rel
    return {"brand": brand, "slug": slug, "content_type": content_type,
            "ds": ds, "platform": platform, "lang": lang}


def fan_out(rendered_platform: str, lang: str, cfg: dict) -> list:
    """Targets that the video rendered for `rendered_platform` is reused on."""
    for fmt in cfg["formats"].values():
        if rendered_platform == fmt.get("rendered_as") or rendered_platform in fmt["targets"]:
            targets = fmt["targets"]
            break
    else:
        targets = [rendered_platform]
    return [t for t in targets if lang in cfg["targets"].get(t, {}).get("languages", [])]


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def build_posts(out_dir: Path, only_target=None) -> list:
    meta = parse_output_dir(out_dir)
    video = out_dir / "video.mp4"
    if not video.exists():
        sys.exit(f"ERROR: no video.mp4 in {out_dir} — run the assemble step first")
    desc_path = out_dir / "description.txt"
    description = desc_path.read_text().strip() if desc_path.exists() else ""
    title = description.split("\n", 1)[0].strip() if description else meta["slug"]
    thumb = out_dir / "thumbnail.jpg"

    cfg = load_platforms()
    video_sha = sha256_file(video)
    posts = []
    for target in fan_out(meta["platform"], meta["lang"], cfg):
        if only_target and target != only_target:
            continue
        key_src = "|".join([meta["slug"], meta["content_type"], target, meta["lang"], video_sha])
        posts.append({
            "target": target,
            "network": cfg["targets"][target]["network"],
            "lang": meta["lang"],
            "slug": meta["slug"],
            "content_type": meta["content_type"],
            "title": title,
            "description": description,
            "video": str(video),
            "thumbnail": str(thumb) if thumb.exists() else None,
            "idempotency_key": hashlib.sha256(key_src.encode()).hexdigest(),
        })
    return posts


def send(post: dict, base_url: str, token: str = None, timeout: int = 600) -> dict:
    import requests  # only needed for real sends

    headers = {"Idempotency-Key": post["idempotency_key"]}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    fields = {k: post[k] for k in ("target", "network", "lang", "title", "description",
                                   "slug", "content_type")}
    files = {"video": ("video.mp4", open(post["video"], "rb"), "video/mp4")}
    if post.get("thumbnail"):
        files["thumbnail"] = ("thumbnail.jpg", open(post["thumbnail"], "rb"), "image/jpeg")
    try:
        r = requests.post(f"{base_url.rstrip('/')}/v1/posts", data=fields, files=files,
                          headers=headers, timeout=timeout)
    finally:
        for _, fh, _ in files.values():
            fh.close()
    r.raise_for_status()
    return r.json() if r.content else {}


def main():
    parser = argparse.ArgumentParser(description="Send a finished video to the social-publisher service")
    parser.add_argument("output_dir", help="output/<brand>/<slug>/<type>/<ds>/<platform>/<lang>")
    parser.add_argument("--target", help="Only this target (e.g. youtube-shorts)")
    parser.add_argument("--send", action="store_true",
                        help="Actually POST to SOCIAL_PUBLISHER_URL (default: dry run)")
    args = parser.parse_args()

    load_env(ROOT / ".env")
    posts = build_posts(Path(args.output_dir), args.target)
    if not posts:
        print("No targets configured for this platform/language in config/platforms.json")
        return

    if not args.send:
        print(f"DRY RUN — {len(posts)} post(s) would be sent to "
              f"{os.environ.get('SOCIAL_PUBLISHER_URL') or '$SOCIAL_PUBLISHER_URL (unset)'}:")
        for p in posts:
            shown = dict(p, description=(p["description"][:80] + "…") if len(p["description"]) > 80 else p["description"])
            print(json.dumps(shown, indent=2, ensure_ascii=False))
        print("Re-run with --send to publish.")
        return

    base_url = os.environ.get("SOCIAL_PUBLISHER_URL")
    if not base_url:
        sys.exit("ERROR: SOCIAL_PUBLISHER_URL is not set (see .env.example)")
    token = os.environ.get("SOCIAL_PUBLISHER_TOKEN")
    failed = 0
    for p in posts:
        try:
            res = send(p, base_url, token)
            print(f"  sent {p['target']}/{p['lang']}: {json.dumps(res)[:200]}")
        except Exception as e:  # keep going; report at the end
            failed += 1
            print(f"  FAILED {p['target']}/{p['lang']}: {e}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
