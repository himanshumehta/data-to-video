"""Input validation at the trust boundaries: CLI identifiers and vehicle files."""
import json
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from scripts.lib import vehicle_data  # noqa: E402


@pytest.mark.parametrize("bad", ["../etc/passwd", "a/b", "..", "", "A-Upper", "x" * 81, "slug;rm -rf", "-flag"])
def test_safe_id_rejects_traversal_and_shell_metacharacters(bad):
    with pytest.raises(ValueError):
        vehicle_data.safe_id(bad)


def test_load_vehicle_rejects_traversal_slug():
    with pytest.raises(SystemExit):
        vehicle_data.load_vehicle("../../etc/passwd")


def _vehicle_file(tmp_path, **overrides):
    v = json.loads((ROOT / "sample_data" / "vehicles" / "ktm-250-duke.json").read_text())
    v.update(overrides)
    p = tmp_path / "v.json"
    p.write_text(json.dumps(v))
    return str(p)


@pytest.mark.parametrize("field,value", [
    ("slug", "../../outside"),
    ("brand_slug", "../x"),
    ("primary_nobg_url", "../../../../tmp/evil.png"),
    ("primary_nobg_url", "/etc/passwd"),
    ("primary_nobg_url", "file:///etc/passwd"),
    ("primary_nobg_url", "http://169.254.169.254/latest/meta-data"),
])
def test_vehicle_file_cannot_steer_paths_or_fetches(tmp_path, field, value):
    with pytest.raises(SystemExit):
        vehicle_data.load_vehicle(data_file=_vehicle_file(tmp_path, **{field: value}))


def test_https_image_url_is_allowed(tmp_path):
    v = vehicle_data.load_vehicle(data_file=_vehicle_file(tmp_path, primary_nobg_url="https://cdn.example.com/a.png"))
    assert v["primary_nobg_url"].startswith("https://")


def test_output_dir_validates_every_segment():
    v = vehicle_data.load_vehicle("ktm-250-duke")
    assert vehicle_data.output_dir(v, "ownership-cost", "instagram-reels", "en").parts[-6:] == (
        "ktm", "ktm-250-duke", "ownership_cost", "default", "instagram-reels", "en")
    for args in [("ownership-cost", "../up", "en"), ("ownership-cost", "instagram-reels", "e/n")]:
        with pytest.raises(ValueError):
            vehicle_data.output_dir(v, *args)
