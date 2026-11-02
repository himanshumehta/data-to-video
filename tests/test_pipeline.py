"""Offline tests: sample data, narration templates, curation and the publisher fan-out."""
import importlib
import json
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from scripts.lib import vehicle_data  # noqa: E402
from scripts.lib.number_format import speech_friendly, spoken_model_name  # noqa: E402
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
    from content_types.ownership_cost import curation
    from scripts.lib.curate import curate
    from scripts.lib.platforms import load_platforms, max_duration
    order = importlib.import_module("content_types.ownership_cost.assembly.instagram_reels").SLIDE_ORDER
    limit = max_duration("instagram-reels", load_platforms())
    assert limit == 90  # shortest limit among the 9:16 targets
    res = curate(order, {s: 12.0 for s in order},
                 curation.interest_scores(vehicle_data.load_vehicle(slug)), curation.PINNED, limit)
    assert res["totalDuration"] <= limit
    assert set(curation.PINNED) <= set(res["selectedSlides"])
    assert res["selectedSlides"] == [s for s in order if s in res["selectedSlides"]]  # story order kept
    assert set(res["selectedSlides"]) | set(res["excludedSlides"]) == set(order)


def test_curation_without_limit_keeps_everything():
    from scripts.lib.curate import curate
    res = curate(["a", "b"], {"a": 100.0, "b": 100.0}, {}, [], None)
    assert res["selectedSlides"] == ["a", "b"] and res["excludedSlides"] == []


def test_number_formatting():
    assert speech_friendly("₹ 4,28,321 over five years") == "rupees 4.3 lakh over five years"
    assert speech_friendly("₹ 89,685 a year") == "rupees about 90 thousand a year"
    assert spoken_model_name("Classic 350") == "Classic three fifty"


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


def test_four_networks_configured():
    cfg = json.loads((ROOT / "config" / "platforms.json").read_text())
    networks = {t["network"] for t in cfg["targets"].values()}
    assert networks == {"youtube", "instagram", "facebook", "threads"}


def test_registry_components_exist():
    """Every component named in remotion.json is exported by the reel slide barrel."""
    reg = json.loads((ROOT / "content_types" / "ownership_cost" / "remotion.json").read_text())
    barrel = (ROOT / "remotion" / "src" / "slides" / "reels" / "index.ts").read_text()
    order = importlib.import_module("content_types.ownership_cost.assembly.instagram_reels").SLIDE_ORDER
    comps = reg["reelsCompositions"]
    assert set(order) | {"thumbnail"} == set(comps)
    for cfg in comps.values():
        assert f"export {{ {cfg['component']} }}" in barrel
