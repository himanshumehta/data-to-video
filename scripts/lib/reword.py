"""
reword.py: narration reword and translation via the Claude Code CLI.

Gives each vehicle its own narration voice while preserving every data value.
Runs `claude -p` as a subprocess with all tools disabled, so the model can only
return text; it cannot read or write files.

Two operations:
  reword_slide(text, slide_name, vehicle)
      → rewrites EN narration in different words, same facts/numbers

  translate_slide(en_text, slide_name, target_lang, vehicle)
      → translates unique EN script to hi/te/mr/ta/kn/ml/bn

Rules stated in the prompts, then checked in code (scripts/lib/guard.py) before
any text reaches TTS:
  - Every number in the source text appears in the output, and no new number
    appears (amounts, distances, ratios, ratings). Indic digits count as digits.
  - No URLs, domains or "dot com"
  - No banned stock phrases (EN reword only)
A failed check re-prompts the model with the exact problems; if it still fails,
NarrationGuardError is raised and nothing is cached or voiced.

Script caching:
  Scripts are saved to output/{brand}/{slug}/{type}/{ds}/{platform}/scripts/{lang}.json
  EN script is always generated first (via --reword flag).
  Non-EN scripts are always translated FROM the cached EN script, never from templates directly.
  This guarantees all languages share the same unique personality for each bike.
"""

import json
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Callable, List

from scripts.lib.guard import (
    NarrationGuardError, banned_phrases, identity_numbers, number_mismatch, url_mentions,
)

CLAUDE_TIMEOUT_SEC = 180
MAX_FIX_ATTEMPTS = 2

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
5. No URLs, domains or "dot com"
6. Technical terms (service, insurance, depreciation) use common Indian {lang_name} equivalents
7. Write every number in Western digits exactly as it appears in the English (2.51 stays 2.51,
   90 stays 90). Never round, convert or spell out a number, and never add a new one.

ENGLISH NARRATION:
{en_text}

Output the {lang_name} translation only — no explanation, no quotes around it."""


def _run_claude(prompt: str) -> str:
    """Send `prompt` to `claude -p` (tools disabled) and return the reply text.

    The prompt goes over stdin, not argv, so it never shows up in `ps`.
    Raises RuntimeError if the CLI is missing, fails or times out.
    """
    try:
        result = subprocess.run(
            ["claude", "-p", "--tools", ""],
            input=prompt, capture_output=True, text=True,
            timeout=CLAUDE_TIMEOUT_SEC, check=False,
        )
    except FileNotFoundError as e:
        raise RuntimeError("`claude` CLI not found: install Claude Code or drop --reword") from e
    except subprocess.TimeoutExpired as e:
        raise RuntimeError(f"claude CLI timed out after {CLAUDE_TIMEOUT_SEC}s") from e
    if result.returncode != 0:
        raise RuntimeError(
            f"claude CLI error (exit {result.returncode}):\n{result.stderr.strip()[:500]}"
        )
    return result.stdout.strip()


def _guarded(prompt: str, slide_name: str, check: Callable[[str], List[str]]) -> str:
    """Run the model, then re-prompt with the exact problems until `check` passes."""
    result = _run_claude(prompt)
    for attempt in range(MAX_FIX_ATTEMPTS):
        problems = check(result)
        if not problems:
            return result
        print(f"    [guard] {slide_name} retry {attempt + 1}: {'; '.join(problems)}")
        result = _run_claude(
            "Your previous output broke these rules:\n- " + "\n- ".join(problems)
            + f"\n\nPREVIOUS OUTPUT:\n{result}\n\nORIGINAL TASK:\n{prompt}\n\n"
            "Fix only those problems. Output ONLY the corrected text."
        )
    problems = check(result)
    if problems:
        raise NarrationGuardError(slide_name, problems, result)
    return result


def reword_slide(rendered_text: str, slide_name: str, vehicle: dict) -> str:
    """Reword one rendered EN narration slide: same numbers, new wording.

    The output must keep exactly the numbers of `rendered_text` (which came from
    the vehicle data via the Jinja2 template), contain no URL and no banned
    phrase; otherwise the model is re-prompted, then NarrationGuardError is raised.
    """
    prompt = REWORD_PROMPT.format(
        brand=vehicle.get("brand_name", ""),
        model=vehicle.get("short_name", vehicle.get("name", "")),
        slide_name=slide_name,
        rendered_text=rendered_text,
        vehicle_character=_get_vehicle_character(vehicle),
    )

    allowed = identity_numbers(vehicle)

    def check(text: str) -> List[str]:
        return (number_mismatch(rendered_text, text, allowed) + url_mentions(text)
                + [f"banned phrase {p!r}" for p in banned_phrases(text)])

    return _guarded(prompt, slide_name, check)


def translate_slide(en_text: str, slide_name: str, target_lang: str, vehicle: dict) -> str:
    """Translate one EN narration slide (hi, te, mr, ...), keeping every number.

    The translation must carry exactly the numbers of the English text (Indic
    digits are normalised first) and no URL; otherwise NarrationGuardError.
    """
    prompt = TRANSLATE_PROMPT.format(
        lang_name=LANG_NAMES.get(target_lang, target_lang),
        brand=vehicle.get("brand_name", ""),
        model=vehicle.get("short_name", vehicle.get("name", "")),
        slide_name=slide_name,
        en_text=en_text,
    )

    allowed = identity_numbers(vehicle)

    def check(text: str) -> List[str]:
        return number_mismatch(en_text, text, allowed) + url_mentions(text)

    return _guarded(prompt, slide_name, check)


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
