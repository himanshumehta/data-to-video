"""
guard.py: checks that LLM-written narration still says what the data says.

The model only rewords or translates text that was rendered from the vehicle
data, so the numbers in that source text are the ground truth. Before any
model output is cached or sent to TTS it must:

  * contain exactly the same set of numbers as its source text: none missing,
    none changed ("2.51 times" -> "2.69 times" fails), none invented;
  * not mention a URL, domain or "dot com";
  * (EN reword) not use a banned stock phrase.

Digits in Indic scripts (Devanagari, Telugu, Tamil, ...) are normalised to
ASCII first, so "२.५१" counts as 2.51. Numbers written as words are not
recognised and therefore count as missing; the prompts ask for digits.
"""

import re
import unicodedata
from decimal import Decimal, InvalidOperation
from typing import Iterable, List, Set

# 2,99,888 / 1,000 / 2.51 / 90. Thousands separators are dropped before comparing.
_NUMBER = re.compile(r"\d+(?:,\d+)*(?:\.\d+)?")
_URL_SPOKEN = re.compile(r"https?://|www\.|\bdot\s+(?:com|in|net|org)\b", re.IGNORECASE)
# Case-sensitive on purpose: "kilometer.In year two" (missing space) is not a domain.
_DOMAIN = re.compile(r"\b[a-z0-9-]+\.(?:com|in|net|org|io|co)\b")

BANNED_PHRASES = [
    "cheap to buy", "adds up", "yearly damage", "bookmark", "coming your way",
    "so you're", "let's break", "here's what", "over five years", "here's how",
    "let me tell you", "did you know", "ever wondered",
    "wallet", "pocket", "piggy bank", "deep dive", "the real cost",
    "bang for buck", "value for money", "worth every rupee",
    "no-nonsense", "eye-opening", "game-changer", "sticker shock",
    "drumroll", "spoiler alert", "plot twist",
    "without further ado", "bottom line", "at the end of the day",
]


class NarrationGuardError(RuntimeError):
    """Model output still failed the checks after every retry."""

    def __init__(self, slide: str, problems: List[str], text: str):
        self.slide, self.problems, self.text = slide, problems, text
        super().__init__(f"{slide}: " + "; ".join(problems))


def _ascii_digits(text: str) -> str:
    """Map every Unicode decimal digit (any script) to its ASCII digit."""
    return "".join(
        str(unicodedata.decimal(ch)) if ch.isdecimal() and not ch.isascii() else ch
        for ch in text
    )


def extract_numbers(text: str) -> Set[str]:
    """Canonical numbers in `text`: '2,99,888' -> '299888', '3.0' -> '3', '२.५१' -> '2.51'."""
    found = set()
    for m in _NUMBER.finditer(_ascii_digits(text)):
        try:
            value = Decimal(m.group(0).replace(",", ""))
        except InvalidOperation:
            continue
        found.add(format(value.normalize(), "f"))
    return found


def identity_numbers(vehicle: dict) -> Set[str]:
    """Numbers that are part of the vehicle's name ("Classic 350"): allowed in any slide."""
    return extract_numbers(" ".join(str(vehicle.get(k) or "") for k in ("brand_name", "short_name", "name")))


def number_mismatch(source: str, candidate: str, allowed: Iterable[str] = ()) -> List[str]:
    """Problems found comparing the numbers of `candidate` against `source` (empty = OK).

    `allowed` numbers (the model name) may appear in the candidate even if the
    source does not say them.
    """
    want, got = extract_numbers(source), extract_numbers(candidate)
    extra = got - want - set(allowed)
    problems = []
    if want - got:
        problems.append("missing or changed numbers: " + ", ".join(sorted(want - got)))
    if extra:
        problems.append("numbers not in the source: " + ", ".join(sorted(extra)))
    return problems


def url_mentions(text: str) -> List[str]:
    hits = [m.group(0) for rx in (_URL_SPOKEN, _DOMAIN) for m in rx.finditer(text)]
    return [f"mentions a URL or domain ({h!r})" for h in hits]


def banned_phrases(text: str) -> List[str]:
    lower = text.lower()
    return [p for p in BANNED_PHRASES if p in lower]
