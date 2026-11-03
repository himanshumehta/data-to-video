"""
run.py: score the numeric guard on correct and mutated scripts, fully offline.

    .venv/bin/python evals/numeric_guard/run.py           # print the table, write results
    .venv/bin/python evals/numeric_guard/run.py --check   # also exit 1 below the thresholds

The check is the one the pipeline runs on model output:
guard.number_mismatch(source, candidate, identity_numbers(vehicle)). A script is
flagged when it returns any problem. URL and banned-phrase checks are out of
scope here (the templates themselves contain phrases the reword prompt bans).

  recall               wrong scripts flagged / wrong scripts, overall and per mutation type
  false-positive rate  correct scripts flagged / correct scripts

Writes results.json and results.md next to this file. Same seed, same output.
"""

import argparse
import json
import random
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from evals.numeric_guard.generate import SEED, STYLES, correct_scripts  # noqa: E402
from evals.numeric_guard.mutate import MUTATION_TYPES, mutants  # noqa: E402
from scripts.lib import guard  # noqa: E402

# What the current guard is held to. The two gap types are invisible to a
# comparison of number sets, so they carry no recall floor; they are reported.
KNOWN_GAPS = {
    "unit_scale": "the digits are unchanged, only the unit word differs, and the guard compares numbers only",
    "swapped_field": "the same numbers in other places give the same set of numbers, and the guard compares sets",
}
MIN_RECALL = {kind: 1.0 for kind in MUTATION_TYPES if kind not in KNOWN_GAPS}
MIN_OVERALL_RECALL = 0.67   # measured 180/266 = 67.7% at seed 1; the gaps cap it
MAX_FALSE_POSITIVE_RATE = 0.0


def flagged(case: dict) -> list[str]:
    return guard.number_mismatch(case["source"], case["candidate"], case["allowed"])


def _rate(hits: int, n: int) -> float:
    return round(hits / n, 4) if n else 0.0


def evaluate(seed: int = SEED) -> dict:
    correct = correct_scripts(seed)
    rng = random.Random(seed)
    wrong = [m for case in correct for m in mutants(case, rng)]

    false_positives = [{**c, "problems": p} for c in correct if (p := flagged(c))]
    caught, misses = [], []
    for m in wrong:
        (caught if (p := flagged(m)) else misses).append({**m, "problems": p})

    by_type = {}
    for kind in MUTATION_TYPES:
        n = sum(m["type"] == kind for m in wrong)
        hit = sum(m["type"] == kind for m in caught)
        by_type[kind] = {"mutants": n, "caught": hit, "recall": _rate(hit, n)}
    by_style = {}
    for style in STYLES:
        n = sum(c["style"] == style for c in correct)
        fp = sum(c["style"] == style for c in false_positives)
        by_style[style] = {"scripts": n, "flagged": fp, "false_positive_rate": _rate(fp, n)}

    gaps = []
    for kind, reason in KNOWN_GAPS.items():
        missed = [m for m in misses if m["type"] == kind]
        if missed:
            ex = missed[0]
            gaps.append({"type": kind, "recall": by_type[kind]["recall"], "missed": len(missed), "why": reason,
                         "example": {k: ex[k] for k in ("id", "change", "source", "candidate", "problems")}})
    unexpected = sorted({m["type"] for m in misses} - set(KNOWN_GAPS))
    for kind in unexpected:
        missed = [m for m in misses if m["type"] == kind]
        ex = missed[0]
        gaps.append({"type": kind, "recall": by_type[kind]["recall"], "missed": len(missed), "why": "not yet analysed",
                     "example": {k: ex[k] for k in ("id", "change", "source", "candidate", "problems")}})

    return {
        "seed": seed,
        "check": "scripts/lib/guard.py number_mismatch(source, candidate, identity_numbers(vehicle))",
        "correct": {"scripts": len(correct), "flagged": len(false_positives),
                    "false_positive_rate": _rate(len(false_positives), len(correct)), "by_style": by_style},
        "mutated": {"scripts": len(wrong), "caught": len(caught),
                    "recall": _rate(len(caught), len(wrong)), "by_type": by_type},
        "known_gaps": gaps,
        "false_positives": [{k: c[k] for k in ("id", "source", "candidate", "problems")} for c in false_positives],
        "misses": [{k: m[k] for k in ("id", "type", "change", "source", "candidate")} for m in misses],
    }


def _pct(x: float) -> str:
    return f"{x * 100:.1f}%"


def markdown(results: dict) -> str:
    mut, cor = results["mutated"], results["correct"]
    lines = [
        f"Numeric guard eval, seed {results['seed']}: {cor['scripts']} correct scripts, "
        f"{mut['scripts']} mutated copies.",
        "",
        "| Mutation type | Mutants | Caught | Recall |",
        "|---|---:|---:|---:|",
    ]
    for kind, row in mut["by_type"].items():
        gap = " (known gap)" if kind in KNOWN_GAPS else ""
        lines.append(f"| `{kind}`{gap} | {row['mutants']} | {row['caught']} | {_pct(row['recall'])} |")
    lines += [
        f"| **All mutations** | **{mut['scripts']}** | **{mut['caught']}** | **{_pct(mut['recall'])}** |",
        "",
        "| Correct scripts | Scripts | Flagged | False-positive rate |",
        "|---|---:|---:|---:|",
    ]
    for style, row in cor["by_style"].items():
        lines.append(f"| `{style}` | {row['scripts']} | {row['flagged']} | {_pct(row['false_positive_rate'])} |")
    lines.append(f"| **All correct scripts** | **{cor['scripts']}** | **{cor['flagged']}** | "
                 f"**{_pct(cor['false_positive_rate'])}** |")
    if results["known_gaps"]:
        lines += ["", "Known gaps:", ""]
        for gap in results["known_gaps"]:
            ex = gap["example"]
            lines.append(f"- `{gap['type']}` ({gap['missed']} missed): {gap['why']}. "
                         f"Example `{ex['id']}`: {ex['change']} gives no problem.")
    return "\n".join(lines) + "\n"


def failures(results: dict) -> list[str]:
    """Threshold breaches; empty means the guard meets them."""
    out = []
    fpr = results["correct"]["false_positive_rate"]
    if fpr > MAX_FALSE_POSITIVE_RATE:
        out.append(f"false-positive rate {_pct(fpr)} > {_pct(MAX_FALSE_POSITIVE_RATE)}")
    overall = results["mutated"]["recall"]
    if overall < MIN_OVERALL_RECALL:
        out.append(f"overall recall {_pct(overall)} < {_pct(MIN_OVERALL_RECALL)}")
    for kind, floor in MIN_RECALL.items():
        row = results["mutated"]["by_type"][kind]
        if row["mutants"] == 0:
            out.append(f"{kind}: no mutants generated")
        elif row["recall"] < floor:
            out.append(f"{kind}: recall {_pct(row['recall'])} < {_pct(floor)}")
    return out


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--seed", type=int, default=SEED)
    ap.add_argument("--check", action="store_true", help="exit 1 if a threshold is not met")
    ap.add_argument("--out", type=Path, default=HERE, help="folder for results.json and results.md")
    args = ap.parse_args(argv)

    results = evaluate(args.seed)
    table = markdown(results)
    args.out.mkdir(parents=True, exist_ok=True)
    (args.out / "results.json").write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n")
    (args.out / "results.md").write_text(table)
    print(table)
    problems = failures(results)
    for p in problems:
        print(f"FAIL {p}")
    return 1 if args.check and problems else 0


if __name__ == "__main__":
    sys.exit(main())
