"""Input validation at the trust boundaries: CLI identifiers, vehicle files, publish target."""
import json
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from scripts import publish  # noqa: E402
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


@pytest.mark.parametrize("url", ["http://localhost:8080", "http://127.0.0.1:9000/", "http://[::1]:80",
                                 "https://publisher.example.com"])
def test_publisher_url_accepted(url):
    assert publish.check_service_url(url) == url.rstrip("/")


@pytest.mark.parametrize("url", ["http://publisher.example.com", "ftp://x", "https://user:pw@host",
                                 "not a url", "http://10.0.0.5"])
def test_publisher_url_rejected(url):
    with pytest.raises(ValueError):
        publish.check_service_url(url)


def test_plain_http_to_lan_needs_explicit_opt_in():
    assert publish.check_service_url("http://10.0.0.5", allow_insecure_http=True) == "http://10.0.0.5"


def test_publish_dry_run_is_default_and_sends_nothing(tmp_path, monkeypatch, capsys):
    out = tmp_path / "output" / "ktm" / "ktm-250-duke" / "ownership_cost" / "default" / "instagram-reels" / "en"
    out.mkdir(parents=True)
    (out / "video.mp4").write_bytes(b"x")
    monkeypatch.setenv("SOCIAL_PUBLISHER_TOKEN", "tok-should-never-print")
    monkeypatch.setattr(sys, "argv", ["publish.py", str(out)])
    monkeypatch.setattr(publish, "send", lambda *_a, **_k: pytest.fail("dry run must not send"))
    publish.main()
    printed = capsys.readouterr().out
    assert "DRY RUN" in printed and "tok-should-never-print" not in printed


def test_publish_rejects_crafted_output_path(tmp_path):
    bad = tmp_path / "output" / "a" / "b" / "c" / "d" / "e" / "EN"
    bad.mkdir(parents=True)
    with pytest.raises(SystemExit):
        publish.parse_output_dir(bad)


def _reel_dir(tmp_path, video=b"\x00\x00\x00\x18ftypmp42 fake"):
    out = tmp_path / "output" / "ktm" / "ktm-250-duke" / "ownership_cost" / "default" / "instagram-reels" / "en"
    out.mkdir(parents=True)
    (out / "video.mp4").write_bytes(video)
    (out / "description.txt").write_text("KTM 250 Duke — real ownership cost\n\nBody")
    return out


class _Resp:
    def __init__(self, status=201, body=None, redirect=False):
        self.status_code, self.is_redirect = status, redirect
        self._body = body if body is not None else {"post_id": "p1", "video_id": "v1",
                                                    "status": "pending_review", "replayed": False}
        self.content = json.dumps(self._body).encode()

    def json(self):
        return self._body

    def raise_for_status(self):
        if self.status_code >= 400:
            raise RuntimeError(f"HTTP {self.status_code}")


def _capture_post(monkeypatch, resp):
    import requests
    calls = []

    def fake_post(url, **kw):
        calls.append(dict(kw, url=url, field_order=list(kw["data"]) + list(kw["files"])))
        return resp
    monkeypatch.setattr(requests, "post", fake_post)
    return calls


def test_send_uses_ingest_contract_and_safe_transport(tmp_path, monkeypatch):
    req = publish.build_request(_reel_dir(tmp_path))
    calls = _capture_post(monkeypatch, _Resp())
    res = publish.send(req, "https://publisher.example.com", "tok")
    (call,) = calls
    assert call["url"] == "https://publisher.example.com/api/v1/external/videos"
    assert call["allow_redirects"] is False
    assert call["timeout"] == (publish.CONNECT_TIMEOUT_SEC, publish.UPLOAD_TIMEOUT_SEC)
    assert call["headers"] == {"Idempotency-Key": req["idempotency_key"], "Authorization": "Bearer tok"}
    assert call["field_order"][0] == "metadata"  # validated before the video is read
    meta = json.loads(call["data"]["metadata"])
    assert set(meta) == {"title", "description", "target_platforms", "platform_posts", "tags"}
    assert call["files"]["video"][2] == "video/mp4"
    assert res["status"] == "pending_review"


def test_send_refuses_redirects_and_reports_conflicts(tmp_path, monkeypatch):
    req = publish.build_request(_reel_dir(tmp_path))
    _capture_post(monkeypatch, _Resp(status=307, redirect=True))
    with pytest.raises(RuntimeError, match="redirect"):
        publish.send(req, "https://publisher.example.com", "tok")
    _capture_post(monkeypatch, _Resp(status=409, body={"error": "conflict"}))
    with pytest.raises(RuntimeError, match="409"):
        publish.send(req, "https://publisher.example.com", "tok")


def test_send_cli_never_prints_token(tmp_path, monkeypatch, capsys):
    out = _reel_dir(tmp_path)
    monkeypatch.setenv("SOCIAL_PUBLISHER_URL", "http://127.0.0.1:8081")
    monkeypatch.setenv("SOCIAL_PUBLISHER_TOKEN", "tok-should-never-print")
    monkeypatch.setattr(sys, "argv", ["publish.py", str(out), "--send"])
    _capture_post(monkeypatch, _Resp(body={"post_id": "p1", "video_id": "v1",
                                           "status": "pending_review", "replayed": True}))
    publish.main()
    printed = capsys.readouterr().out
    assert "replayed, no new post" in printed and "tok-should-never-print" not in printed


def test_idempotency_key_tracks_video_bytes(tmp_path):
    a = publish.build_request(_reel_dir(tmp_path / "a"))
    a2 = publish.build_request(_reel_dir(tmp_path / "a2"))
    b = publish.build_request(_reel_dir(tmp_path / "b", video=b"\x00\x00\x00\x18ftypmp42 other"))
    assert a["idempotency_key"] == a2["idempotency_key"]
    assert a["idempotency_key"] != b["idempotency_key"]


def test_network_names_map_to_publisher_platforms():
    assert publish.platform_for("x") == "twitter"
    assert publish.platform_for("youtube") == "youtube"
    with pytest.raises(SystemExit):
        publish.platform_for("myspace")
