"""
vehicle_data.py — the single place the pipeline reads vehicle data from.

The original project pulled vehicles from a live Postgres database. This public
version reads pre-computed vehicle JSON files instead, so the whole pipeline runs
offline. Point VEHICLE_DATA_DIR at your own folder of `<slug>.json` files (same
shape as `sample_data/vehicles/*.json`) to use your own data, or replace
`load_vehicle()` with a database/API call.

Images: `primary_nobg_url` may be an https:// URL or a path relative to
`remotion/public/` (e.g. "vehicles/<slug>.png"). Local images are staged from
VEHICLE_IMAGE_DIR (default: sample_data/images/) into remotion/public/ before
rendering.

Every value that becomes part of a filesystem path (slug, brand, content type,
platform, language, design-system name) goes through `safe_id()` first, so a
crafted slug or vehicle file cannot read or write outside the repo folders.
"""

import json
import os
import re
import shutil
import sys
from pathlib import Path
from typing import List, Optional

ROOT = Path(__file__).resolve().parents[2]
REMOTION_PUBLIC = ROOT / "remotion" / "public"

# Lowercase letters, digits, '-' and '_'; must start with a letter or digit.
_SAFE_ID = re.compile(r"[a-z0-9][a-z0-9_-]{0,79}")
_LANG = re.compile(r"[a-z]{2,3}")
_LOCAL_IMAGE = re.compile(r"vehicles/[A-Za-z0-9][A-Za-z0-9._-]{0,120}\.(png|webp)")


def safe_id(value, what: str = "identifier") -> str:
    """Return `value` if it is a safe path segment, else raise ValueError."""
    if not isinstance(value, str) or not _SAFE_ID.fullmatch(value):
        raise ValueError(f"invalid {what} {value!r}: use lowercase letters, digits, '-' or '_'")
    return value


def safe_lang(value) -> str:
    if not isinstance(value, str) or not _LANG.fullmatch(value):
        raise ValueError(f"invalid language code {value!r}: expected e.g. 'en' or 'hi'")
    return value


def cli_id(value, what: str = "identifier") -> str:
    """safe_id() for argparse/CLI boundaries: exit with a message instead of a traceback."""
    try:
        return safe_lang(value) if what == "lang" else safe_id(value, what)
    except ValueError as e:
        sys.exit(f"ERROR: {e}")


def data_dir() -> Path:
    return Path(os.environ.get("VEHICLE_DATA_DIR") or ROOT / "sample_data" / "vehicles")


def image_dir() -> Path:
    return Path(os.environ.get("VEHICLE_IMAGE_DIR") or ROOT / "sample_data" / "images")


def list_slugs() -> List[str]:
    return sorted(p.stem for p in data_dir().glob("*.json"))


def load_vehicle(slug: Optional[str] = None, data_file: Optional[str] = None) -> dict:
    """Load one vehicle dict by slug (from VEHICLE_DATA_DIR) or from an explicit JSON file."""
    if data_file:
        vehicle = json.loads(Path(data_file).read_text())
    else:
        if not slug:
            sys.exit("ERROR: provide a vehicle slug or --data-file")
        slug = cli_id(slug, "slug")
        path = data_dir() / f"{slug}.json"
        if not path.exists():
            available = ", ".join(list_slugs()) or "(none)"
            sys.exit(f"ERROR: no vehicle data for '{slug}' in {data_dir()}\n  Available: {available}")
        vehicle = json.loads(path.read_text())
    if not isinstance(vehicle, dict):
        sys.exit("ERROR: vehicle file must hold a JSON object")
    try:
        validate_vehicle_ids(vehicle)
    except ValueError as e:
        sys.exit(f"ERROR: {e}")
    if slug and vehicle["slug"] != slug:
        sys.exit(f"ERROR: {slug}.json declares slug {vehicle['slug']!r}")
    return vehicle


def validate_vehicle_ids(vehicle: dict) -> None:
    """Check the fields that end up in paths: slug, brand slug and a local image path."""
    safe_id(vehicle.get("slug"), "vehicle slug")
    safe_id(brand_slug(vehicle), "brand slug")
    url = vehicle.get("primary_nobg_url") or ""
    if url and not url.startswith("https://") and not _LOCAL_IMAGE.fullmatch(url):
        raise ValueError(
            f"primary_nobg_url must be an https:// URL or 'vehicles/<file>.png', got {url!r}")


def brand_slug(vehicle: dict) -> str:
    slug = vehicle.get("slug", "unknown")
    return vehicle.get("brand_slug") or vehicle.get("manufacturer_slug") or slug.split("-")[0]


def output_dir(vehicle: dict, content_type: str, platform: str, lang: str, ds: str = "default") -> Path:
    """output/{brand}/{slug}/{content_type}/{ds}/{platform}/{lang}; content_type uses underscores."""
    return (ROOT / "output" / safe_id(brand_slug(vehicle), "brand slug")
            / safe_id(vehicle["slug"], "vehicle slug")
            / safe_id(content_type.replace("-", "_"), "content type") / safe_id(ds, "design system")
            / safe_id(platform, "platform") / safe_lang(lang))


def stage_image(vehicle: dict) -> None:
    """Copy a local vehicle image into remotion/public/vehicles/ so staticFile() can serve it."""
    url = vehicle.get("primary_nobg_url") or ""
    if not url or url.startswith("https://"):
        return
    if not _LOCAL_IMAGE.fullmatch(url):
        sys.exit(f"ERROR: refusing to stage image path {url!r}")
    dst = REMOTION_PUBLIC / url
    if dst.exists():
        return
    src = image_dir() / Path(url).name
    if not src.is_file():
        sys.exit(f"ERROR: image for {vehicle.get('slug')} not found: {src}")
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)
