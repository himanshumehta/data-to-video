"""
reword.py — Narration reword and translation via Claude CLI.

Gives each bike a unique narration voice while preserving all data values.
Uses `claude -p` subprocess — no API key required, runs inside Claude CLI session.

Two operations:
  reword_slide(text, slide_name, vehicle)
      → rewrites EN narration in different words, same facts/numbers

  translate_slide(en_text, slide_name, target_lang, vehicle)
      → translates unique EN script to hi/te/mr/ta/kn/ml/bn

Rules enforced by prompts (never breakable):
  - All money amounts stay exactly as-is ("rupees about 3 lakh")
  - All distances stay exactly as-is ("10 thousand Kilometers")
  - All ratios/multipliers stay exactly as-is ("2.29 times the purchase price")
  - No URLs
  - ±15% word count (keeps audio duration predictable)
  - Brand names and model names unchanged in translations

Script caching:
  Scripts are saved to output/{brand}/{slug}/{type}/{ds}/{platform}/scripts/{lang}.json
  EN script is always generated first (via --reword flag).
  Non-EN scripts are always translated FROM the cached EN script, never from templates directly.
  This guarantees all languages share the same unique personality for each bike.
"""

import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path

LANG_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "te": "Telugu",
    "ta": "Tamil",
    "kn": "Kannada",
    "ml": "Malayalam",
    "bn": "Bengali",
}

REWORD_PROMPT = """\
Rewrite this slide narration for an ownership-cost video. Same facts, sharper delivery.

VEHICLE: {brand} {model}
SLIDE: {slide_name}
CHARACTER: {vehicle_character}

HARD RULES (violating ANY = rejected):
1. Money amounts stay EXACTLY as-is ("rupees about 3 lakh", "rupees 14 thousand")
2. Distances stay EXACTLY as-is ("10 thousand Kilometers")
3. Ratios/multipliers stay EXACTLY as-is ("2.29 times the purchase price")
4. Ratings stay EXACTLY as-is ("7.5 out of 10")
5. Same data points — never add or remove facts. Engine type, fuel type, variant names = keep.
6. NEVER say any URL, domain, "dot com", "dot in", or web address. Say the brand name only ("on bikencars", never "bikencars dot com").
7. NEVER use these BANNED WORDS/PHRASES — instant rejection:
   - "cheap to buy", "adds up", "yearly damage", "bookmark", "coming your way"
   - "So you're", "Let's break", "Here's what", "Over five years", "Here's how"
   - "Let me tell you", "Did you know", "Ever wondered"
   - "wallet", "pocket", "piggy bank", "deep dive", "the real cost"
   - "bang for buck", "value for money", "worth every rupee"
   - "no-nonsense", "eye-opening", "game-changer", "sticker shock"
   - "drumroll", "spoiler alert", "plot twist"
   - "without further ado", "bottom line", "at the end of the day"

STYLE:
- MAX 15 words per sentence. Aim for 10. If you wrote 20, cut 5.
- Spoken Indian English — conversational, confident, zero filler.
- Match the vehicle personality: {vehicle_character}
- If your draft could describe ANY vehicle, rewrite until it couldn't.

SLIDE-SPECIFIC GUIDANCE:
- "00-what-you-will-learn" / "01-hook": Open with something ONLY this vehicle could claim. A surprising number, a bold contrast, a question only its buyer faces.
- "02" through "05": Pure data delivery — state the fact, move on. No transitions between slides.
- "07-vs-segment": Let the numbers talk. Don't editorialize ("clear winner", "no contest").
- "10-review-cta": One short call to action. Just the brand name, never a URL.
- "11-end-card": One line. Punchy. No "bookmark", "save", "coming your way".

ORIGINAL:
{rendered_text}

Rewrite. Output ONLY the new text — no explanation, no quotes."""


def _get_vehicle_character(vehicle: dict) -> str:
    """Generate a short character description based on vehicle attributes."""
    brand = vehicle.get("brand_name", "")
    vtype = vehicle.get("vehicle_type", "motorcycle")
    price = vehicle.get("price_ex_showroom", 0)
    best_for = vehicle.get("best_for", "")
    cc = vehicle.get("engine_cc", 0)

    # Price tier
    if price > 1000000:
        tier = "premium"
    elif price > 400000:
        tier = "mid-range"
    elif price > 150000:
        tier = "affordable"
    else:
        tier = "budget"

    # Personality from brand + segment
    # Bike brand personalities
    bike_personalities = {
        "KTM": "aggressive, raw, track-day energy",
        "Royal Enfield": "old-soul, touring spirit, weekend highway vibes",
        "Kawasaki": "Japanese precision, green machine legacy, streetfighter DNA",
        "Ducati": "Italian exotic, premium, heart-over-head choice",
        "Triumph": "British sophistication, refined performance",
        "Honda": "reliable workhorse, practical, trusted",
        "Suzuki": "value champion, underrated, sensible pick",
        "Bajaj": "bang-for-buck, street smart, Indian pride",
        "TVS": "tech-forward, race-bred DNA, ambitious",
        "Hero": "India's commuter king, dependable, everywhere",
        "Harley-Davidson": "American muscle, rumble and attitude",
        "BMW": "German engineering, touring excellence, premium tech",
        "Aprilia": "Italian sportbike DNA, track-sharp, exotic",
        "Husqvarna": "Swedish minimalism, cafe racer cool",
    }
    # Car brand personalities
    car_personalities = {
        "Hyundai": "feature-loaded, family-first, segment leader",
        "Tata": "safety champion, value-for-money, built tough",
        "Maruti Suzuki": "India's default car, resale king, practical",
        "Kia": "design-forward, premium feel, connected tech",
        "Mahindra": "SUV specialist, rugged DNA, adventure-ready",
        "Toyota": "bulletproof reliability, low maintenance, boring but brilliant",
        "Honda": "refined engineering, trusted, resale-friendly",
        "Skoda": "European driving dynamics, TSI turbo fun, enthusiast pick",
        "Volkswagen": "German build quality, solid platform, understated premium",
        "MG": "tech-loaded, value disruptor, EV pioneer",
        "BMW": "ultimate driving machine, premium luxury, performance",
        "Mercedes-Benz": "luxury benchmark, prestige, three-pointed star",
        "Audi": "tech sophistication, quattro heritage, understated luxury",
        "Citroen": "French comfort, quirky design, value play",
        "Renault": "French flair, turbo power, value-conscious",
    }
    if vtype == "car":
        personality = car_personalities.get(brand, "reliable, family-friendly")
    else:
        personality = bike_personalities.get(brand, "distinctive, confident")

    return f"{tier} {vtype}, {personality}. Best for: {best_for or 'enthusiast riders'}"

TRANSLATE_PROMPT = """\
Translate the following English narration to {lang_name} for an Indian audience.

VEHICLE: {brand} {model}
SLIDE: {slide_name}

RULES:
1. Keep money amounts intact — translate surrounding words but keep "rupees about 3 lakh" etc
2. Keep brand names and model names in English (do not translate "{brand}" or "{model}")
3. Natural conversational {lang_name} — not a word-for-word literal translation
4. Same approximate length as the English
5. No URLs
6. Technical terms (service, insurance, depreciation) use common Indian {lang_name} equivalents

ENGLISH NARRATION:
{en_text}

Output the {lang_name} translation only — no explanation, no quotes around it."""


def _run_claude(prompt: str) -> str:
    """Call `claude -p` with the given prompt and return the response text.

    Raises RuntimeError if the claude CLI is not available or returns an error.
    """
    result = subprocess.run(
        ["claude", "-p", prompt],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(
            f"claude CLI error (exit {result.returncode}):\n{result.stderr.strip()}"
        )
    return result.stdout.strip()


BANNED_PHRASES = [
    "cheap to buy", "adds up", "yearly damage", "bookmark", "coming your way",
    "so you're", "let's break", "here's what", "over five years", "here's how",
    "let me tell you", "did you know", "ever wondered",
    "wallet", "pocket", "piggy bank", "deep dive", "the real cost",
    "bang for buck", "value for money", "worth every rupee",
    "no-nonsense", "eye-opening", "game-changer", "sticker shock",
    "drumroll", "spoiler alert", "plot twist",
    "without further ado", "bottom line", "at the end of the day",
    "dot com", "dot in", ".com", ".in",
]


def _validate_reword(text: str) -> list[str]:
    """Return list of banned phrases found in text (case-insensitive)."""
    lower = text.lower()
    return [p for p in BANNED_PHRASES if p in lower]


def reword_slide(rendered_text: str, slide_name: str, vehicle: dict,
                 max_retries: int = 2) -> str:
    """Reword a single rendered EN narration slide.

    Runs a post-validation pass: if any banned phrase survives the reword,
    re-prompts Claude with explicit correction (up to max_retries times).

    Args:
        rendered_text: Already speech_friendly()-processed narration text.
        slide_name: Slide ID e.g. "02-intro-hook" (used in prompt for context).
        vehicle: Vehicle dict (for brand/model in prompt).
        max_retries: Number of times to re-prompt if banned phrases slip through.

    Returns:
        Reworded narration text — same data, different wording, no banned phrases.
    """
    brand = vehicle.get("brand_name", "")
    model = vehicle.get("short_name", vehicle.get("name", ""))
    character = _get_vehicle_character(vehicle)
    prompt = REWORD_PROMPT.format(
        brand=brand,
        model=model,
        slide_name=slide_name,
        rendered_text=rendered_text,
        vehicle_character=character,
    )
    result = _run_claude(prompt)

    # Post-validation: catch any banned phrases that slipped through.
    for attempt in range(max_retries):
        violations = _validate_reword(result)
        if not violations:
            break
        print(f"    [reword] retry {attempt + 1}: found banned phrases {violations}")
        fix_prompt = (
            f"Your rewrite contains BANNED phrases that must be removed: {violations}\n\n"
            f"CURRENT TEXT:\n{result}\n\n"
            f"Rewrite again, removing those exact phrases. Keep all facts/numbers intact. "
            f"Output ONLY the fixed text."
        )
        result = _run_claude(fix_prompt)

    return result


def translate_slide(en_text: str, slide_name: str, target_lang: str,
                    vehicle: dict) -> str:
    """Translate a unique EN narration slide to another language.

    Args:
        en_text: The unique (already reworded) EN narration for this slide.
        slide_name: Slide ID e.g. "02-intro-hook".
        target_lang: Language code e.g. "hi", "te", "mr".
        vehicle: Vehicle dict (for brand/model in prompt).

    Returns:
        Translated narration text.
    """
    lang_name = LANG_NAMES.get(target_lang, target_lang)
    brand = vehicle.get("brand_name", "")
    model = vehicle.get("short_name", vehicle.get("name", ""))
    prompt = TRANSLATE_PROMPT.format(
        lang_name=lang_name,
        brand=brand,
        model=model,
        slide_name=slide_name,
        en_text=en_text,
    )
    return _run_claude(prompt)


# ── Script cache helpers ──────────────────────────────────────────────────────

def scripts_dir(output_root: Path, brand: str, slug: str,
                content_type: str, ds: str, platform: str) -> Path:
    """Return the scripts/ cache directory path for a given platform."""
    return output_root / "output" / brand / slug / content_type / ds / platform / "scripts"


def load_script_cache(scripts_path: Path, lang: str):
    """Load cached script JSON for a language. Returns None if not found."""
    p = scripts_path / f"{lang}.json"
    if not p.exists():
        return None
    try:
        return json.loads(p.read_text())
    except (json.JSONDecodeError, OSError):
        return None


def save_script_cache(scripts_path: Path, lang: str, slug: str,
                      content_type: str, platform: str,
                      slides: dict) -> None:
    """Save reworded/translated scripts to cache JSON."""
    scripts_path.mkdir(parents=True, exist_ok=True)
    data = {
        "slug": slug,
        "type": content_type,
        "platform": platform,
        "lang": lang,
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "slides": slides,
    }
    p = scripts_path / f"{lang}.json"
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2))
    print(f"  Saved script cache → scripts/{lang}.json")
