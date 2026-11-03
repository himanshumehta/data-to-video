"""The numeric guard eval (evals/numeric_guard) holds its thresholds and its committed results.

Offline and seeded: correct scripts come from the sample data and the repo's own
templates, wrong ones from deterministic mutations. No model is called.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from evals.numeric_guard import run  # noqa: E402


def test_guard_meets_eval_thresholds():
    results = run.evaluate()
    print(run.markdown(results))
    assert results["correct"]["scripts"] == 50
    assert run.failures(results) == [], run.markdown(results)


def test_committed_results_match_a_fresh_run():
    """results.json (and the README table built from it) must be regenerated when the guard changes."""
    committed = json.loads((ROOT / "evals" / "numeric_guard" / "results.json").read_text())
    assert committed == run.evaluate(), "re-run: .venv/bin/python evals/numeric_guard/run.py"
