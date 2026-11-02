#!/usr/bin/env python3
"""
publish.py — hand a finished video to the social-publisher service.

This repo does not talk to social networks directly. It uploads each finished
video to a separate publishing service (configured by URL), which owns channel
credentials, the admin review gate, scheduling and per-network upload quirks.

Given an output folder that holds video.mp4 (+ description.txt, thumbnail.jpg),
it works out which targets that video fans out to (config/platforms.json),
maps each target's network onto a social-publisher platform name, and sends
ONE request for the video carrying every platform that takes this language.
The service turns it into one post in pending_review; nothing is published
until an admin approves it there.

Dry run is the default: the request is printed, nothing is sent. With --send:
  * the service URL must be https:// unless it points at this machine
    (localhost / 127.0.0.1 / ::1), so the bearer token never crosses a network
    in clear text; --allow-insecure-http overrides this for a trusted LAN;
  * TLS certificates are verified (requests default), every request has a
    connect and a read timeout, and redirects are refused, not followed;
  * the token is sent only in the Authorization header and never printed.

Usage:
    python scripts/publish.py output/royal-enfield/royal-enfield-classic-350-2024/ownership_cost/default/instagram-reels/en
    python scripts/publish.py <dir> --send          # upload to $SOCIAL_PUBLISHER_URL
    python scripts/publish.py <dir> --target youtube-shorts --send

HTTP contract (social-publisher POST /api/v1/external/videos):
    POST {SOCIAL_PUBLISHER_URL}/api/v1/external/videos     multipart/form-data
      Authorization: Bearer {SOCIAL_PUBLISHER_TOKEN}   API key with posts:create
      Idempotency-Key: sha256(slug|content_type|lang|sorted platforms|video sha256)
      parts:  metadata   JSON {title, description, target_platforms,
                               platform_posts: {platform: {text}}, tags}
              video      video/mp4
              thumbnail  image/jpeg (optional)
    201 {post_id, video_id, status: "pending_review", replayed: false}
    200 same body with replayed: true   (same key, same payload: no new post)
    409 same key, different payload      (reported as a failure)
"""

import argparse
import hashlib
import ipaddress
import json
import os
import sys
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.lib.platforms import load_platforms, targets_for  # noqa: E402
from scripts.lib.tts import load_env  # noqa: E402
from scripts.lib.vehicle_data import safe_id, safe_lang  # noqa: E402

INGEST_PATH = "/api/v1/external/videos"
CONNECT_TIMEOUT_SEC = 10
UPLOAD_TIMEOUT_SEC = 600      # read timeout: the service stores the upload before answering
MAX_TITLE_CHARS = 300         # social-publisher rejects longer titles
DRY_RUN_PREVIEW_CHARS = 80
ELLIPSIS = "…"

# config/platforms.json network -> social-publisher platform name.
NETWORK_TO_PLATFORM = {
    "instagram": "instagram",
    "facebook": "facebook",
    "threads": "threads",
    "youtube": "youtube",
    "linkedin": "linkedin",
    "x": "twitter",
    "twitter": "twitter",
}


def parse_output_dir(path: Path) -> dict:
    """output/{brand}/{slug}/{content_type}/{ds}/{platform}/{lang} -> validated parts."""
    parts = path.resolve().parts
    if "output" not in parts:
        sys.exit(f"ERROR: expected a path under output/: {path}")
    last_output = len(parts) - 1 - parts[::-1].index("output")
    rel = parts[last_output + 1:]
    if len(rel) != 6:
        sys.exit(f"ERROR: expected output/<brand>/<slug>/<type>/<ds>/<platform>/<lang>, got {path}")
    brand, slug, content_type, ds, platform, lang = rel
    try:
        for value, what in ((brand, "brand"), (slug, "slug"), (content_type, "content type"),
                            (ds, "design system"), (platform, "platform")):
            safe_id(value, what)
        safe_lang(lang)
    except ValueError as e:
        sys.exit(f"ERROR: {e}")
    return {"brand": brand, "slug": slug, "content_type": content_type,
            "ds": ds, "platform": platform, "lang": lang}


def check_service_url(url: str, allow_insecure_http: bool = False) -> str:
    """Return the base URL if it is safe to send a bearer token to, else raise ValueError."""
    parts = urlsplit(url)
    if parts.scheme not in ("https", "http") or not parts.hostname:
        raise ValueError(f"SOCIAL_PUBLISHER_URL must be an http(s) URL with a host, got {url!r}")
    if parts.username or parts.password:
        raise ValueError("SOCIAL_PUBLISHER_URL must not embed credentials; use SOCIAL_PUBLISHER_TOKEN")
    if parts.scheme == "http" and not allow_insecure_http:
        host = parts.hostname
        try:
            loopback = ipaddress.ip_address(host).is_loopback
        except ValueError:
            loopback = host == "localhost"
        if not loopback:
            raise ValueError("refusing plain http:// to a non-local host; use https:// "
                             "or pass --allow-insecure-http")
    return url.rstrip("/")


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def platform_for(network: str) -> str:
    """The social-publisher platform name for a platforms.json network."""
    try:
        return NETWORK_TO_PLATFORM[network]
    except KeyError:
        sys.exit(f"ERROR: network {network!r} has no social-publisher platform; "
                 f"known: {', '.join(sorted(NETWORK_TO_PLATFORM))}")


def clip(text: str, limit: int) -> str:
    """text, cut to at most `limit` characters with an ellipsis when cut."""
    return text if len(text) <= limit else text[:limit - 1].rstrip() + ELLIPSIS


def build_request(out_dir: Path, only_target=None):
    """The one ingest request for this video, or None when no target takes it."""
    meta = parse_output_dir(out_dir)
    video = out_dir / "video.mp4"
    if not video.exists():
        sys.exit(f"ERROR: no video.mp4 in {out_dir} — run the assemble step first")
    desc_path = out_dir / "description.txt"
    description = desc_path.read_text().strip() if desc_path.exists() else ""
    title = clip(description.split("\n", 1)[0].strip() if description else meta["slug"], MAX_TITLE_CHARS)
    thumb = out_dir / "thumbnail.jpg"

    cfg = load_platforms()
    targets = [t for t in targets_for(meta["platform"], meta["lang"], cfg)
               if not only_target or t == only_target]
    if not targets:
        return None

    # Several targets can share a platform; the strictest caption limit wins.
    limits = {}
    for t in targets:
        spec = cfg["targets"][t]
        p = platform_for(spec["network"])
        limits[p] = min(limits.get(p, spec["caption_max_chars"]), spec["caption_max_chars"])
    platforms = list(limits)
    text = description or title
    metadata = {
        "title": title,
        "description": description,
        "target_platforms": platforms,
        "platform_posts": {p: {"text": clip(text, limits[p])} for p in platforms},
        "tags": [meta["content_type"], meta["slug"], meta["lang"]],
    }

    video_sha = sha256_file(video)
    key_src = "|".join([meta["slug"], meta["content_type"], meta["lang"],
                        ",".join(sorted(platforms)), video_sha])
    return {
        "targets": targets,
        "lang": meta["lang"],
        "metadata": metadata,
        "video": str(video),
        "thumbnail": str(thumb) if thumb.exists() else None,
        "idempotency_key": hashlib.sha256(key_src.encode()).hexdigest(),
    }


def send(req: dict, base_url: str, token: str = None) -> dict:
    import requests  # only needed for real sends

    headers = {"Idempotency-Key": req["idempotency_key"]}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    # metadata goes first: the service validates it before reading the video.
    data = {"metadata": json.dumps(req["metadata"], ensure_ascii=False)}
    files = {"video": ("video.mp4", open(req["video"], "rb"), "video/mp4")}
    if req.get("thumbnail"):
        files["thumbnail"] = ("thumbnail.jpg", open(req["thumbnail"], "rb"), "image/jpeg")
    try:
        r = requests.post(f"{base_url}{INGEST_PATH}", data=data, files=files, headers=headers,
                          timeout=(CONNECT_TIMEOUT_SEC, UPLOAD_TIMEOUT_SEC), allow_redirects=False)
    finally:
        for _, fh, _ in files.values():
            fh.close()
    if r.is_redirect:
        # requests would replay the bearer token to the new host; refuse instead.
        raise RuntimeError(f"publisher answered with a redirect ({r.status_code}); not following")
    if r.status_code == 409:
        raise RuntimeError("409: this video was already sent with a different payload "
                           "(same Idempotency-Key); not creating a second post")
    r.raise_for_status()
    return r.json() if r.content else {}


def main():
    parser = argparse.ArgumentParser(description="Send a finished video to the social-publisher service")
    parser.add_argument("output_dir", help="output/<brand>/<slug>/<type>/<ds>/<platform>/<lang>")
    parser.add_argument("--target", help="Only this target (e.g. youtube-shorts)")
    parser.add_argument("--send", action="store_true",
                        help="Actually upload to SOCIAL_PUBLISHER_URL (default: dry run)")
    parser.add_argument("--allow-insecure-http", action="store_true",
                        help="Allow http:// to a non-local publisher (token sent in clear text)")
    args = parser.parse_args()

    load_env(ROOT / ".env")
    req = build_request(Path(args.output_dir), args.target)
    if req is None:
        print("No targets configured for this platform/language in config/platforms.json")
        return
    platforms = req["metadata"]["target_platforms"]

    if not args.send:
        url = os.environ.get("SOCIAL_PUBLISHER_URL") or "$SOCIAL_PUBLISHER_URL (unset)"
        print(f"DRY RUN — 1 request for {len(platforms)} platform(s) would be sent to {url}{INGEST_PATH}:")
        shown = json.loads(json.dumps(req))
        for pp in shown["metadata"]["platform_posts"].values():
            if len(pp["text"]) > DRY_RUN_PREVIEW_CHARS:
                pp["text"] = pp["text"][:DRY_RUN_PREVIEW_CHARS] + ELLIPSIS
        desc = shown["metadata"]["description"]
        if len(desc) > DRY_RUN_PREVIEW_CHARS:
            shown["metadata"]["description"] = desc[:DRY_RUN_PREVIEW_CHARS] + ELLIPSIS
        print(json.dumps(shown, indent=2, ensure_ascii=False))
        print("Re-run with --send to publish.")
        return

    base_url = os.environ.get("SOCIAL_PUBLISHER_URL")
    if not base_url:
        sys.exit("ERROR: SOCIAL_PUBLISHER_URL is not set (see .env.example)")
    try:
        base_url = check_service_url(base_url, args.allow_insecure_http)
    except ValueError as e:
        sys.exit(f"ERROR: {e}")
    token = os.environ.get("SOCIAL_PUBLISHER_TOKEN")
    label = f"{','.join(platforms)}/{req['lang']}"
    try:
        res = send(req, base_url, token)
    except Exception as e:
        # Only the exception type and message: they never include request headers.
        print(f"  FAILED {label}: {type(e).__name__}: {str(e)[:300]}")
        sys.exit(1)
    kind = "replayed, no new post" if res.get("replayed") else "new post"
    print(f"  sent {label}: post_id={res.get('post_id')} video_id={res.get('video_id')} "
          f"status={res.get('status')} ({kind})")
    print("  The post waits for admin approval in social-publisher before anything is published.")


if __name__ == "__main__":
    main()
