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
"""

import json
import os
import shutil
import sys
from pathlib import Path
from typing import List, Optional

ROOT = Path(__file__).resolve().parents[2]
REMOTION_PUBLIC = ROOT / "remotion" / "public"


def data_dir() -> Path:
    return Path(os.environ.get("VEHICLE_DATA_DIR") or ROOT / "sample_data" / "vehicles")


def image_dir() -> Path:
    return Path(os.environ.get("VEHICLE_IMAGE_DIR") or ROOT / "sample_data" / "images")


def list_slugs() -> List[str]:
    return sorted(p.stem for p in data_dir().glob("*.json"))


def load_vehicle(slug: Optional[str] = None, data_file: Optional[str] = None) -> dict:
    """Load one vehicle dict by slug (from VEHICLE_DATA_DIR) or from an explicit JSON file."""
    if data_file:
        return json.loads(Path(data_file).read_text())
    if not slug:
        sys.exit("ERROR: provide a vehicle slug or --data-file")
    path = data_dir() / f"{slug}.json"
    if not path.exists():
        available = ", ".join(list_slugs()) or "(none)"
        sys.exit(f"ERROR: no vehicle data for '{slug}' in {data_dir()}\n  Available: {available}")
    return json.loads(path.read_text())


def brand_slug(vehicle: dict) -> str:
    slug = vehicle.get("slug", "unknown")
    return vehicle.get("brand_slug") or vehicle.get("manufacturer_slug") or slug.split("-")[0]


def output_dir(vehicle: dict, content_type: str, platform: str, lang: str, ds: str = "default") -> Path:
    """output/{brand}/{slug}/{content_type}/{ds}/{platform}/{lang} — content_type uses underscores."""
    return (ROOT / "output" / brand_slug(vehicle) / vehicle["slug"]
            / content_type.replace("-", "_") / ds / platform / lang)


def stage_image(vehicle: dict) -> None:
    """Copy a local vehicle image into remotion/public/ so staticFile() can serve it."""
    url = vehicle.get("primary_nobg_url") or ""
    if not url or "://" in url:
        return
    dst = REMOTION_PUBLIC / url
    if dst.exists():
        return
    src = image_dir() / Path(url).name
    if not src.exists():
        sys.exit(f"ERROR: image for {vehicle.get('slug')} not found: {src}")
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)
