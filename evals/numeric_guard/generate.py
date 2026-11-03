"""
generate.py: correct narration scripts, in the shape the numeric guard checks.

The guard compares a model's output (the candidate) with the text it was asked
to reword or translate (the source), allowing the model name's own number. This
builds those triples the way the pipeline does:

  source     render_narration(EN template, vehicle), with spoken_name set as in
             narrate.main ("Classic 350" -> "Classic three fifty")
  allowed    identity_numbers(vehicle)
  candidate  a correct rewrite of the source, one of five styles:
               en_reword       English paraphrase: new wording, same figures
               hi              the repo's Hindi template for the same slide
               hi_devanagari   the same, digits written in Devanagari (२.५१)
               te              the repo's Telugu template for the same slide
               te_telugu       the same, digits written in Telugu script

Only slides with at least one data number (not just the model number) are used.
A fixed seed picks 10 candidates per style (50 in all). No model is called.
"""

import importlib
import random
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.lib import guard, vehicle_data  # noqa: E402
from scripts.lib.number_format import spoken_model_name  # noqa: E402
from scripts.narrate import render_narration  # noqa: E402

SEED = 1
N_SCRIPTS = 50
SAMPLE_DIR = ROOT / "sample_data" / "vehicles"
STYLES = ["en_reword", "hi", "hi_devanagari", "te", "te_telugu"]

# Any decimal digit, in any script; thousands separators and one decimal point.
NUMBER_TOKEN = re.compile(r"\d+(?:,\d+)*(?:\.\d+)?")
_ZERO = {"devanagari": 0x0966, "telugu": 0x0C66}

# English paraphrases of the template sentences. Every number is carried over
# verbatim through a capture group; the stock phrases the reword prompt bans are dropped.
_AMOUNT = r"(?:about )?[\d.]+ (?:thousand|lakh)"
_PARAPHRASES = [
    (r"Thinking of buying a (.+?)\? ", [r"Shortlisting the \1? ", r"Considering a \1? "]),
    (r"Here's the complete ownership cost\. Not just the showroom price\. The total cost over five years\.",
     ["This is what it costs to own across five years, not just to buy.",
      "Five years of owning it, beyond the showroom price."]),
    (r"(rupees [\d.]+ lakh) over five years\.",
     [r"Five years of ownership comes to \1.", r"Plan for \1 across five years."]),
    (r"That's ([\d.]+) times the purchase price\.",
     [r"That is \1 times what you pay up front.", r"It works out to \1 times the purchase price."]),
    (r" ?Here's how it breaks down\.", ["", " Here is the split."]),
    (rf"(rupees {_AMOUNT}) per year in running costs\.",
     [r"Running it costs \1 a year.", r"Every year, \1 goes into running costs."]),
    (r"Insurance at (rupees about [\d.]+ thousand), fuel at (rupees [\d.]+) a day\.",
     [r"Insurance is \1. Fuel runs \2 a day.", r"Fuel takes \2 a day, and insurance \1."]),
    (r"Oil changes, (.+?)\. Service adds up to (rupees about [\d.]+ thousand) every year\.",
     [r"Servicing covers oil changes, \1. It costs \2 a year.", r"Budget \2 a year for service: oil, \1."]),
    (r" ?Here's what each component costs\.", ["", " Each part is priced next."]),
    (rf"Year (\d+) is the lightest at ({_AMOUNT})\.",
     [r"The lightest year is year \1, at \2.", r"Year \1 costs the least: \2."]),
    (r"Year (\d+), chain sprocket set replacement adds to the cost\.",
     [r"In year \1 the chain and sprockets are due.", r"Year \1 brings a new chain sprocket set."]),
    (rf"Year (\d+) sees the highest bill at ({_AMOUNT})\.",
     [r"The biggest bill lands in year \1, at \2.", r"Year \1 is the most expensive: \2."]),
]


def to_script(text: str, script: str) -> str:
    """Write every ASCII digit of `text` in `script` ('devanagari' or 'telugu')."""
    zero = _ZERO[script]
    return "".join(chr(zero + int(ch)) if ch.isascii() and ch.isdigit() else ch for ch in text)


def ascii_digits(token: str) -> str:
    return "".join(str(unicodedata.decimal(ch)) if ch.isdecimal() else ch for ch in token)


def number_tokens(text: str) -> list[str]:
    """Number tokens in order, digits mapped to ASCII. Independent of the guard's own parser."""
    return [ascii_digits(m.group(0)) for m in NUMBER_TOKEN.finditer(text)]


def load_sample_vehicles() -> list[dict]:
    """The sample vehicles with spoken_name set the way narrate.main sets it."""
    vehicles = []
    for path in sorted(SAMPLE_DIR.glob("*.json")):
        v = vehicle_data.load_vehicle(data_file=str(path))
        v["spoken_name"] = spoken_model_name(v.get("short_name", ""))
        vehicles.append(v)
    return vehicles


def _templates(vehicle: dict) -> dict:
    name = "instagram_reels_car" if vehicle.get("vehicle_type") == "car" else "instagram_reels"
    return importlib.import_module(f"content_types.ownership_cost.narrations.{name}").NARRATIONS


def paraphrase(source: str, vehicle: dict, rng: random.Random) -> str:
    """A deterministic English reword of `source` that keeps every figure."""
    text = source
    for pattern, options in _PARAPHRASES:
        text = re.sub(pattern, rng.choice(options), text)
    if guard.identity_numbers(vehicle) and rng.random() < 0.5:
        # A reword often names the model; its own number ("Classic 350") is allowed.
        text = f"On the {vehicle['brand_name']} {vehicle['short_name']}, {text[0].lower()}{text[1:]}"
    return text.strip()


def _candidate(style: str, source: str, templates: dict, slide: str, vehicle: dict, rng: random.Random) -> str:
    if style == "en_reword":
        return paraphrase(source, vehicle, rng)
    lang = style[:2]
    text = render_narration(templates[lang][slide], vehicle)
    if style == "hi_devanagari":
        return to_script(text, "devanagari")
    if style == "te_telugu":
        return to_script(text, "telugu")
    return text


def _same_figures(source: str, candidate: str, allowed: set[str]) -> bool:
    """Sanity check on the generator itself: identical number tokens, ignoring the model number."""
    def figures(text):
        return sorted(t for t in number_tokens(text) if guard.extract_numbers(t) - allowed)
    return figures(source) == figures(candidate)


def all_candidates(seed: int = SEED) -> list[dict]:
    """Every (vehicle, slide, style) correct script, in a stable order."""
    rng = random.Random(seed)
    pool = []
    for vehicle in load_sample_vehicles():
        templates = _templates(vehicle)
        allowed = guard.identity_numbers(vehicle)
        for slide in sorted(templates["en"]):
            if templates["en"][slide] is None:
                continue
            source = render_narration(templates["en"][slide], vehicle)
            if not guard.extract_numbers(source) - allowed:
                continue   # nothing but the model number: no data figure to get wrong
            for style in STYLES:
                if templates.get(style[:2], {}).get(slide) is None:
                    continue
                candidate = _candidate(style, source, templates, slide, vehicle, rng)
                if candidate == source or not _same_figures(source, candidate, allowed):
                    raise AssertionError(f"generator produced a bad correct script: {vehicle['slug']} {slide} {style}")
                pool.append({
                    "id": f"{vehicle['slug']}/{slide}/{style}",
                    "slug": vehicle["slug"],
                    "slide": slide,
                    "style": style,
                    "source": source,
                    "candidate": candidate,
                    "allowed": sorted(allowed),
                })
    return pool


def correct_scripts(seed: int = SEED, n: int = N_SCRIPTS) -> list[dict]:
    """`n` correct scripts, an equal share per style, drawn with a fixed seed, in pool order."""
    pool = all_candidates(seed)
    rng = random.Random(seed)
    picked = set()
    for style in STYLES:
        ids = [i for i, case in enumerate(pool) if case["style"] == style]
        picked.update(rng.sample(ids, min(n // len(STYLES), len(ids))))
    return [case for i, case in enumerate(pool) if i in picked]
