"""Offline tests: sample data, narration templates, curation and the publisher fan-out."""
import importlib
import json
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from scripts.lib import vehicle_data  # noqa: E402
from scripts.lib.number_format import format_inr, speech_friendly  # noqa: E402
from scripts.narrate import render_narration  # noqa: E402
from scripts.ownership_pipeline import REQUIRED_FIELDS  # noqa: E402

SLUGS = vehicle_data.list_slugs()


def test_five_sample_vehicles():
    assert len(SLUGS) == 5


@pytest.mark.parametrize("slug", SLUGS)
def test_sample_vehicle_is_complete(slug):
    v = vehicle_data.load_vehicle(slug)
    assert v["slug"] == slug
    for field in REQUIRED_FIELDS:
        assert v.get(field), f"{slug} missing {field}"
    img = vehicle_data.image_dir() / Path(v["primary_nobg_url"]).name
    assert img.exists(), img
    # no database identifiers leak into the sample data
    text = json.dumps(v)
    assert '"id"' not in text and "vehicle_id" not in text


def _narrations_for(vehicle):
    name = "instagram_reels_car" if vehicle.get("vehicle_type") == "car" else "instagram_reels"
    return importlib.import_module(f"content_types.ownership_cost.narrations.{name}").NARRATIONS


@pytest.mark.parametrize("slug", SLUGS)
@pytest.mark.parametrize("lang", ["en", "hi"])
def test_narration_templates_render(slug, lang):
    v = vehicle_data.load_vehicle(slug)
    v.setdefault("spoken_name", v["short_name"])
    templates = _narrations_for(v)[lang]
    asm = importlib.import_module("content_types.ownership_cost.assembly.instagram_reels")
    assert set(templates) == set(asm.SLIDE_ORDER)
    for slide, tmpl in templates.items():
        text = render_narration(tmpl, v)
        assert text.strip(), slide
        assert "None" not in text and "{{" not in text, (slide, text)
        assert "http" not in text and ".com" not in text, (slide, text)


@pytest.mark.parametrize("slug", SLUGS)
def test_reels_curation_respects_platform_limit(slug):
    from scripts.lib.claude_step import curate, PLATFORM_LIMITS
    v = vehicle_data.load_vehicle(slug)
    durations = {s: 12.0 for s in importlib.import_module(
        "content_types.ownership_cost.assembly.instagram_reels").SLIDE_ORDER}
    res = curate(slug, v, durations, "instagram-reels")
    assert res["totalDuration"] <= PLATFORM_LIMITS["instagram-reels"]
    assert "00-what-you-will-learn" in res["selectedSlides"]


def test_number_formatting():
    assert format_inr(771102) == "7,71,102"
    assert "lakh" in speech_friendly("₹ 4,28,321 over five years")


def test_publish_fan_out_and_dry_run(tmp_path):
    from scripts import publish
    out = tmp_path / "output" / "royal-enfield" / "x-350" / "ownership_cost" / "default" / "instagram-reels" / "en"
    out.mkdir(parents=True)
    (out / "video.mp4").write_bytes(b"not really a video")
    (out / "description.txt").write_text("Title line\n\nBody")
    posts = publish.build_posts(out)
    targets = {p["target"] for p in posts}
    assert targets == {"instagram-reels", "facebook-reels", "threads-reels", "youtube-shorts"}
    assert all(p["title"] == "Title line" for p in posts)
    assert len({p["idempotency_key"] for p in posts}) == len(posts)


def test_six_networks_configured():
    cfg = json.loads((ROOT / "config" / "platforms.json").read_text())
    networks = {t["network"] for t in cfg["targets"].values()}
    assert networks == {"youtube", "instagram", "facebook", "threads", "linkedin", "twitter"}
