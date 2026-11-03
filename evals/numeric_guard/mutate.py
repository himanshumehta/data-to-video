"""
mutate.py: inject one wrong number into a copy of a correct script.

Each mutation copies the candidate and changes one data figure the way a model
gets numbers wrong. Every type that applies to a script is applied to its own
copy, so each type has its own denominator.

  digit_swap          two adjacent digits trade places          54 -> 45
  off_by_10pct        the value moves by about 10%, kept at     54 thousand -> 59 thousand
                      the source's precision (7 -> 6)
  unit_scale          right digits, wrong unit                  5.2 lakh -> 5.2 crore, 54 thousand -> 54 million
  rounding            rounded past the precision the data has   2.44 times -> 2 times, 173 -> 170
  number_in_words     a wrong value spelled out                 2.44 times -> two point six eight times
  swapped_field       two figures trade places (right numbers,  insurance 14 thousand, fuel 173 a day ->
                      wrong attributes)                         insurance 173 thousand, fuel 14 a day
  dropped_separator   the decimal point is lost                 5.2 lakh -> 52 lakh

Only data figures are mutated: the model's own number ("Classic 350") is left
alone, and so is a figure the slide says twice ("Year 4 ... Year 4"), because
changing one copy of it changes no single fact. speech_friendly() has already
removed thousands separators before text reaches the guard, so the only
separator a narration carries is the decimal point.
"""

import random
import re
from decimal import ROUND_HALF_UP, Decimal

from evals.numeric_guard.generate import NUMBER_TOKEN, ascii_digits, to_script

MUTATION_TYPES = [
    "digit_swap", "off_by_10pct", "unit_scale", "rounding",
    "number_in_words", "swapped_field", "dropped_separator",
]

_UNIT_AFTER = re.compile(r"\s*(lakh|crore|thousand|million)\b")
_RATIO_AFTER = re.compile(r"\s*(times|guna|గుణా|రెట్లు)")
_SPEC_AFTER = re.compile(r"\s*(cc|Petrol)\b")
_AMOUNT_BEFORE = re.compile(r"(rupees|about)\s*$")
_INDEX_BEFORE = re.compile(r"(Year|year|Saal|సంవత్సరం)\s*$")
_UNIT_SWAP = {"lakh": ["crore"], "crore": ["lakh"], "thousand": ["lakh", "million"], "million": ["thousand"]}
_MAGNITUDE_ROLES = ("amount", "ratio", "spec")

_ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
         "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"]
_TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]


def _int_words(n: int) -> str:
    if n < 20:
        return _ONES[n]
    if n < 100:
        return _TENS[n // 10] + ("" if n % 10 == 0 else "-" + _ONES[n % 10])
    if n < 1000:
        rest = n % 100
        return _ONES[n // 100] + " hundred" + ("" if rest == 0 else " and " + _int_words(rest))
    rest = n % 1000
    return _int_words(n // 1000) + " thousand" + ("" if rest == 0 else " " + _int_words(rest))


def number_words(text: str) -> str:
    """'68' -> 'sixty-eight', '2.69' -> 'two point six nine' (as a narrator says it)."""
    whole, _, frac = text.partition(".")
    words = _int_words(int(whole))
    return words + (" point " + " ".join(_ONES[int(d)] for d in frac) if frac else "")


def _script_of(token: str) -> str:
    for ch in token:
        if ch.isdecimal() and not ch.isascii():
            return "devanagari" if 0x0966 <= ord(ch) <= 0x096F else "telugu"
    return "ascii"


def _in_script(ascii_text: str, script: str) -> str:
    return ascii_text if script == "ascii" else to_script(ascii_text, script)


def figures(text: str, allowed) -> list[dict]:
    """Number tokens a mutation may target, with their span, value and role."""
    tokens = []
    for m in NUMBER_TOKEN.finditer(text):
        value = ascii_digits(m.group(0)).replace(",", "")
        canon = format(Decimal(value).normalize(), "f")
        before, after = text[:m.start()], text[m.end():]
        if _UNIT_AFTER.match(after) or _AMOUNT_BEFORE.search(before):
            role = "amount"
        elif _RATIO_AFTER.match(after):
            role = "ratio"
        elif _SPEC_AFTER.match(after):
            role = "spec"
        elif _INDEX_BEFORE.search(before):
            role = "year_index"
        else:
            role = "other"
        unit = _UNIT_AFTER.match(after)
        tokens.append({
            "start": m.start(), "end": m.end(), "text": m.group(0), "value": value, "canon": canon,
            "role": role, "script": _script_of(m.group(0)),
            "unit": unit.group(1) if unit else None,
            "unit_span": (m.end() + unit.start(1), m.end() + unit.end(1)) if unit else None,
        })
    counts = {}
    for t in tokens:
        counts[t["canon"]] = counts.get(t["canon"], 0) + 1
    return [t for t in tokens if t["canon"] not in set(allowed) and counts[t["canon"]] == 1]


def _decimals(value: str) -> int:
    return len(value.partition(".")[2])


def _fmt(value: Decimal, places: int) -> str:
    return str(value.quantize(Decimal(1).scaleb(-places), rounding=ROUND_HALF_UP))


def _off_by_10pct(value: str, rng: random.Random) -> str:
    """The value moved 10% up or down, kept at the source precision (one more place if needed)."""
    original = Decimal(value)
    factor = Decimal("1.1") if rng.random() < 0.5 else Decimal("0.9")
    places = _decimals(value)
    new = _fmt(original * factor, places)
    if Decimal(new) == original:
        new = _fmt(original * factor, places + 1)
    return new


def _rounded(value: str) -> str | None:
    """Rounded one step coarser than the data: decimals to a whole number, whole numbers to tens."""
    original = Decimal(value)
    if _decimals(value):
        new = _fmt(original, 0)
    elif original >= 10:
        new = str(int((original / 10).quantize(Decimal(1), rounding=ROUND_HALF_UP) * 10))
    else:
        return None
    return None if Decimal(new) == original or Decimal(new) == 0 else new


def _digit_swap(value: str, rng: random.Random) -> str | None:
    digits = [i for i in range(len(value) - 1) if value[i].isdigit() and value[i + 1].isdigit()
              and value[i] != value[i + 1] and not (i == 0 and value[i + 1] == "0")]
    if not digits:
        return None
    i = rng.choice(digits)
    return value[:i] + value[i + 1] + value[i] + value[i + 2:]


def _single(case: dict, kind: str, pick, rng: random.Random) -> dict | None:
    """Apply a one-figure mutation: `pick(token)` returns the new ASCII value or None."""
    options = []
    for token in figures(case["candidate"], case["allowed"]):
        new = pick(token)
        if new is not None and Decimal(new) != Decimal(token["value"]):
            options.append((token, new))
    if not options:
        return None
    token, new = rng.choice(options)
    said = number_words(new) if kind == "number_in_words" else _in_script(new, token["script"])
    text = case["candidate"]
    return {"change": f"{token['text']} -> {said}", "text": text[:token["start"]] + said + text[token["end"]:]}


def mutate(case: dict, kind: str, rng: random.Random) -> dict | None:
    """One wrong copy of `case['candidate']` for mutation `kind`, or None if it does not apply."""
    text = case["candidate"]
    if kind == "digit_swap":
        return _single(case, kind, lambda t: _digit_swap(t["value"], rng), rng)
    if kind == "off_by_10pct":
        return _single(case, kind, lambda t: _off_by_10pct(t["value"], rng) if t["role"] in _MAGNITUDE_ROLES
                       else None, rng)
    if kind == "rounding":
        return _single(case, kind, lambda t: _rounded(t["value"]) if t["role"] in _MAGNITUDE_ROLES else None, rng)
    if kind == "number_in_words":
        return _single(case, kind, lambda t: _off_by_10pct(t["value"], rng) if t["role"] in _MAGNITUDE_ROLES
                       else None, rng)
    if kind == "dropped_separator":
        return _single(case, kind, lambda t: t["value"].replace(".", "") if "." in t["value"] else None, rng)
    if kind == "unit_scale":
        options = [t for t in figures(text, case["allowed"]) if t["unit"]]
        if not options:
            return None
        token = rng.choice(options)
        new_unit = rng.choice(_UNIT_SWAP[token["unit"]])
        a, b = token["unit_span"]
        return {"change": f"{token['text']} {token['unit']} -> {token['text']} {new_unit}",
                "text": text[:a] + new_unit + text[b:]}
    if kind == "swapped_field":
        tokens = figures(text, case["allowed"])
        pairs = [(x, y) for i, x in enumerate(tokens) for y in tokens[i + 1:] if x["canon"] != y["canon"]]
        same_role = [(x, y) for x, y in pairs if x["role"] == y["role"]]
        if not pairs:
            return None
        x, y = rng.choice(same_role or pairs)
        mutated = text[:x["start"]] + y["text"] + text[x["end"]:y["start"]] + x["text"] + text[y["end"]:]
        return {"change": f"{x['text']} <-> {y['text']}", "text": mutated}
    raise ValueError(f"unknown mutation type {kind!r}")


def mutants(case: dict, rng: random.Random) -> list[dict]:
    """Every applicable mutation of one correct script, one copy per type."""
    out = []
    for kind in MUTATION_TYPES:
        m = mutate(case, kind, rng)
        if m is None:
            continue
        if m["text"] == case["candidate"]:
            raise AssertionError(f"no-op mutation {kind} on {case['id']}")
        out.append({"id": f"{case['id']}/{kind}", "type": kind, "change": m["change"],
                    "source": case["source"], "candidate": m["text"], "allowed": case["allowed"]})
    return out
