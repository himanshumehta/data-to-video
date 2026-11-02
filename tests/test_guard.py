"""The narration guard: LLM output must keep the source numbers, with no URLs.

The LLM itself is never called: a fake `claude` executable on PATH plays back
scripted replies, so the retry/refuse loop in reword.py runs for real.
"""
import json
import stat
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from scripts.lib import guard, reword  # noqa: E402

PREBAKED = ROOT / "sample_data" / "narration" / "royal-enfield-classic-350-2024"
VEHICLE = {"brand_name": "Royal Enfield", "short_name": "Classic 350", "slug": "x"}


def test_extracts_indian_grouping_decimals_and_indic_digits():
    assert guard.extract_numbers("rupees 2,99,888 and 2.51 times") == {"299888", "2.51"}
    assert guard.extract_numbers("३.० गुना, २.५१") == {"3", "2.51"}      # Devanagari
    assert guard.extract_numbers("౪౩ వేలు") == {"43"}                    # Telugu
    assert guard.extract_numbers("Year 4. Done.") == {"4"}               # sentence full stop


def test_known_hindi_ratio_drift_is_caught():
    # A private run once said "2.69 times" where the data said 2.51.
    problems = guard.number_mismatch("That is 2.51 times the price.", "यह कीमत का 2.69 गुना है।")
    assert problems == ["missing or changed numbers: 2.51", "numbers not in the source: 2.69"]


def test_model_number_is_allowed_but_other_new_numbers_are_not():
    allowed = guard.identity_numbers(VEHICLE)
    assert guard.number_mismatch("Ranked by cost.", "Classic 350, ranked by cost.", allowed) == []
    assert guard.number_mismatch("Ranked by cost.", "Ranked by cost, 3 rivals.", allowed)


def test_url_detection():
    assert guard.url_mentions("full breakdown at bikencars dot com")
    assert guard.url_mentions("see https://example.org")
    assert guard.url_mentions("bikencars.com has it")
    assert guard.url_mentions("rupees 4.3 lakh. In year two") == []
    assert guard.url_mentions("per kilometer.In year two") == []   # missing space is not a domain


def test_guard_flags_issues_in_the_shipped_prebaked_scripts():
    """The sample audio predates the guard; the audit must surface its known problems."""
    en = json.loads((PREBAKED / "en" / "script.json").read_text())["slides"]
    hi = json.loads((PREBAKED / "hi" / "script.json").read_text())["slides"]
    assert guard.url_mentions(en["10-review-cta"])                  # "bikencars dot com"
    assert "bookmark" in guard.banned_phrases(en["11-end-card"])
    # Hindi says the year numbers as words ("Pehla saal"), so they count as missing.
    assert guard.number_mismatch(en["04-year-by-year"], hi["04-year-by-year"])


@pytest.fixture
def fake_claude(tmp_path, monkeypatch):
    """Install a `claude` stub that returns the given replies in order and logs its stdin."""
    def install(*replies):
        replies_file = tmp_path / "replies.json"
        replies_file.write_text(json.dumps(list(replies)))
        stub = tmp_path / "claude"
        stub.write_text(
            f"#!{sys.executable}\n"
            "import json, sys, pathlib\n"
            f"p = pathlib.Path({str(replies_file)!r})\n"
            "r = json.loads(p.read_text())\n"
            f"pathlib.Path({str(tmp_path / 'log.txt')!r}).open('a').write(sys.stdin.read() + '\\n====\\n')\n"
            "print(r.pop(0)); p.write_text(json.dumps(r))\n"
        )
        stub.chmod(stub.stat().st_mode | stat.S_IEXEC)
        monkeypatch.setenv("PATH", f"{tmp_path}:{__import__('os').environ['PATH']}")
        return tmp_path / "log.txt"
    return install


def test_translation_is_retried_with_the_exact_problem(fake_claude):
    log = fake_claude("यह कीमत का 2.69 गुना है।", "यह कीमत का 2.51 गुना है।")
    out = reword.translate_slide("That is 2.51 times the price.", "01-hook", "hi", VEHICLE)
    assert out == "यह कीमत का 2.51 गुना है।"
    prompts = log.read_text().split("====")
    assert "missing or changed numbers: 2.51" in prompts[1]


def test_translation_that_never_complies_is_refused(fake_claude):
    fake_claude(*["कीमत का 2.69 गुना, bikencars dot com"] * (reword.MAX_FIX_ATTEMPTS + 1))
    with pytest.raises(guard.NarrationGuardError) as err:
        reword.translate_slide("That is 2.51 times the price.", "01-hook", "hi", VEHICLE)
    assert err.value.slide == "01-hook"
    assert any("2.69" in p for p in err.value.problems)
    assert any("URL" in p for p in err.value.problems)


def test_reword_rejects_banned_phrases(fake_claude):
    fake_claude("Bookmark this: 2.51 times.", "Two point five one? No: 2.51 times the sticker.")
    out = reword.reword_slide("That is 2.51 times the purchase price.", "01-hook", VEHICLE)
    assert out.endswith("2.51 times the sticker.")


def test_claude_cli_runs_with_tools_disabled_and_prompt_on_stdin(monkeypatch):
    seen = {}

    def fake_run(cmd, **kw):
        seen.update(cmd=cmd, kw=kw)
        return type("R", (), {"returncode": 0, "stdout": "ok\n", "stderr": ""})()

    monkeypatch.setattr(reword.subprocess, "run", fake_run)
    assert reword._run_claude("secret prompt") == "ok"
    assert seen["cmd"] == ["claude", "-p", "--tools", ""]
    assert seen["kw"]["input"] == "secret prompt" and seen["kw"]["timeout"] > 0
