"""
claude_step.py — Run Claude Code CLI as pipeline steps.

Claude handles judgment calls (data validation, narration writing,
visual QA, metadata generation). Scripts handle mechanical work.

Usage in pipeline:
    from scripts.lib.claude_step import run_claude_step, STEP_PROMPTS

    result = run_claude_step("validate", slug="ktm-390-duke")
    if not result.get("approved"):
        print(f"Data issues: {result['issues']}")
"""

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent


def run_claude_step(prompt: str, output_path: str = None, timeout: int = 120) -> dict:
    """Run a Claude CLI step. Returns parsed JSON output.

    Falls back gracefully if Claude CLI is not available.
    """
    cmd = ["claude", "--print", "--output-format", "json", "-p", prompt]
    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=timeout
        )
        if result.returncode != 0:
            return {"error": result.stderr.strip(), "fallback": True}
        # Parse Claude CLI output (--output-format json wraps in {type, result, ...})
        try:
            wrapper = json.loads(result.stdout)
            # Claude CLI wraps the actual response in a 'result' field
            inner = wrapper.get("result", result.stdout)
            # The inner result may contain a JSON code block
            if isinstance(inner, str):
                # Extract JSON from markdown code block if present
                import re
                json_match = re.search(r'```json\s*(.*?)\s*```', inner, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group(1))
                # Try parsing as raw JSON
                try:
                    return json.loads(inner)
                except json.JSONDecodeError:
                    return {"text": inner, "approved": True}
            return wrapper
        except json.JSONDecodeError:
            return {"text": result.stdout.strip(), "approved": True}
    except FileNotFoundError:
        return {"error": "Claude CLI not installed", "fallback": True}
    except subprocess.TimeoutExpired:
        return {"error": f"Claude step timed out ({timeout}s)", "fallback": True}


def build_validate_prompt(slug: str, vehicle: dict) -> str:
    """Build prompt for claude:validate step."""
    return f"""You are a data quality validator for bikencars.com vehicle content.

Read this vehicle data and check:
1. price_ex_showroom is reasonable for the segment (not 0, not absurdly high)
2. At least 3 competitors with cost data exist
3. pros and cons each have 2-3 word titles (not long sentences)
4. expert_breakdown has 6 categories with scores 1-10
5. All cost fields are populated (not 0 or null)

Vehicle: {slug}
Data: {json.dumps(vehicle, default=str)[:3000]}

Respond with JSON: {{"approved": true/false, "issues": ["issue1", "issue2"]}}"""


def build_narrate_prompt(slug: str, vehicle: dict, platform: str, lang: str) -> str:
    """Build prompt for claude:narrate step."""
    brand = vehicle.get("brand_name", "")
    model = vehicle.get("short_name", slug)

    return f"""You are a narration writer for bikencars.com vehicle videos.
Write narrations for each slide of the {platform} {lang} ownership-cost video for {brand} {model}.

=== TTS PRONUNCIATION RULES (CRITICAL) ===
The narration text goes directly to Gemini TTS. Write EXACTLY how it should be SPOKEN:

1. MODEL NUMBERS → write as words: "390" → "three ninety", "310" → "three ten",
   "457" → "four fifty seven", "1290" → "twelve ninety", "650" → "six fifty"
   Write "{brand} {model}" as "{brand} {''.join(
       [_number_to_spoken(w) if w.isdigit() else w for w in model.split()]
   )}" in every narration.

2. MONEY → round to spoken form:
   - ₹2,99,888 → "about 3 lakh"
   - ₹7,55,084 → "7.5 lakh"
   - ₹89,685 → "about 90 thousand"
   - ₹42,352 → "42 thousand"
   - ₹352 → "three fifty two rupees"
   - Never say "rupees seven lakh fifty five thousand eighty four"

3. PERCENTAGES → "forty seven percent" not "4 7 percent"

4. ABBREVIATIONS → always spell out:
   "km" → "kilometer", "kmpl" → "kilometers per liter", "cc" → "CC",
   "hp"/"bhp" → "horsepower", "Nm" → "newton meters", "kg" → "kilograms",
   "/km" → "per kilometer", "/day" → "per day", "/yr" → "per year"

5. NEVER read: URLs, hashtags, "bikencars.com", slide numbers

6. DECIMALS → "8.1 out of 10" not "eight point one out of ten"
   Cost per km: "about 13 rupees per kilometer"

=== CONTENT RULES ===
- Indian English, confident, data-driven tone
- 15-25 words per slide (target 5-8 seconds at 1.2x speed)
- Every number spoken MUST match the data shown on screen
- No filler words ("well", "so", "basically")
- Hook slide: lead with the shocking number
- Verdict slide: summarize with daily cost (most relatable)
- End card: short CTA, 3-4 seconds max

=== SLIDE IDS ===
00-what-you-will-learn, 01-hook, 02-annual-breakdown, 03-service-deep-dive,
04-year-by-year, 05-depreciation, 07-vs-segment,
10-review-cta, 11-end-card

Vehicle data:
  Brand: {brand}
  Model: {model}
  Price: {vehicle.get('price_formatted', '')}
  5yr Cost: {vehicle.get('net_5yr_display', '')}
  Annual: {vehicle.get('annual_total_display', vehicle.get('annual_total', ''))}
  Daily: {vehicle.get('cost_per_day_display', '')}
  Monthly: {vehicle.get('monthly_cost_display', '')}
  Per km: {vehicle.get('cost_per_km', '')}
  Multiplier: {vehicle.get('multiplier', '')}x
  Rating: {vehicle.get('expert_rating', '')}
  Fuel: {vehicle.get('annual_fuel_display', '')}
  Service: {vehicle.get('annual_service_display', '')}
  Insurance: {vehicle.get('annual_insurance_display', '')}

Respond with JSON: {{"narrations": {{"00-what-you-will-learn": "text...", "01-hook": "text...", ...}}}}"""


_SPOKEN_NUMBERS = {
    "110": "one ten", "125": "one twenty five", "150": "one fifty",
    "160": "one sixty", "180": "one eighty", "200": "two hundred",
    "220": "two twenty", "250": "two fifty", "300": "three hundred",
    "310": "three ten", "350": "three fifty", "390": "three ninety",
    "400": "four hundred", "401": "four oh one", "450": "four fifty",
    "457": "four fifty seven", "500": "five hundred", "650": "six fifty",
    "660": "six sixty", "750": "seven fifty", "790": "seven ninety",
    "900": "nine hundred", "1000": "thousand",
    "1090": "ten ninety", "1190": "eleven ninety",
    "1200": "twelve hundred", "1250": "twelve fifty",
    "1290": "twelve ninety", "1390": "thirteen ninety",
}


def _number_to_spoken(num_str: str) -> str:
    """Convert a number string to spoken English for model names."""
    return _SPOKEN_NUMBERS.get(num_str, num_str)


def build_review_renders_prompt(slug: str, slides_dir: str) -> str:
    """Build prompt for claude:review-renders step."""
    slides = list(Path(slides_dir).glob("*.png"))
    slide_list = "\n".join(f"  - {s.name}" for s in sorted(slides))
    return f"""You are a visual QA reviewer for bikencars.com slides.

Review these rendered portrait slides (1080x1350) for {slug}:
{slide_list}

Check each slide:
1. Text is readable at mobile size
2. No text overflow or clipping
3. Numbers are properly formatted (Indian numbering)
4. Layout matches expected design
5. No visual artifacts

Respond with JSON: {{"slides": {{"slide-name": {{"approved": true/false, "issues": ["issue1"]}} }}}}"""


def build_metadata_prompt(slug: str, vehicle: dict) -> str:
    """Build prompt for claude:metadata step."""
    return f"""You are a social media metadata writer for bikencars.com.

Generate publishing metadata for {vehicle.get('brand_name', '')} {vehicle.get('short_name', slug)} ownership cost video.

Generate for each platform:
- YouTube: title (<=70 chars), description (with chapters placeholder), 20 tags
- Instagram: caption (<=2200 chars), 30 hashtags
- Shorts: title (<=40 chars, hook-style)
- Threads: short caption (<=500 chars)

Vehicle data:
  Brand: {vehicle.get('brand_name', '')}
  Model: {vehicle.get('short_name', '')}
  Price: {vehicle.get('price_formatted', '')}
  5yr Cost: {vehicle.get('net_5yr_display', '')}
  Rating: {vehicle.get('expert_rating', '')}

Respond with JSON: {{"youtube": {{"title": "...", "description": "...", "tags": [...]}}, "instagram": {{"caption": "...", "hashtags": [...]}}, "shorts": {{"title": "..."}}, "threads": {{"caption": "..."}}}}"""


# ── Convenience wrappers ─────────────────────────────────────────────

def validate(slug: str, vehicle: dict = None) -> dict:
    """Run claude:validate. Returns {approved, issues}."""
    if vehicle is None:
        vehicle = json.loads((ROOT / "preview" / f"{slug}-full.json").read_text())
    prompt = build_validate_prompt(slug, vehicle)
    result = run_claude_step(prompt, timeout=60)
    if result.get("fallback"):
        # Fallback: basic field-existence check
        issues = []
        if not vehicle.get("price_ex_showroom"):
            issues.append("Missing price_ex_showroom")
        if not vehicle.get("competitors_ownership"):
            issues.append("No competitors")
        if not vehicle.get("expert_breakdown"):
            issues.append("No expert_breakdown")
        return {"approved": len(issues) == 0, "issues": issues, "fallback": True}
    return result


def narrate(slug: str, vehicle: dict = None, platform: str = "instagram", lang: str = "en") -> dict:
    """Run claude:narrate. Returns {narrations: {slide_id: text}}."""
    if vehicle is None:
        vehicle = json.loads((ROOT / "preview" / f"{slug}-full.json").read_text())
    prompt = build_narrate_prompt(slug, vehicle, platform, lang)
    return run_claude_step(prompt, timeout=120)


def build_review_narration_prompt(slug: str, vehicle: dict, narrations: dict) -> str:
    """Build prompt for claude:review-narration step."""
    brand = vehicle.get("brand_name", "")
    model = vehicle.get("short_name", slug)
    spoken_model = " ".join(
        _number_to_spoken(w) if w.isdigit() else w for w in model.split()
    )

    narration_list = "\n".join(
        f"  {sid}: \"{text}\"" for sid, text in narrations.items()
    )

    return f"""You are a TTS quality reviewer for bikencars.com.

Review these narration scripts BEFORE they go to Gemini TTS.
Vehicle: {brand} {model}

=== NARRATIONS ===
{narration_list}

=== CHECK EACH NARRATION FOR ===

1. MODEL NAME PRONUNCIATION
   "{model}" must be written as "{spoken_model}" (spoken form)
   Flag if any narration has raw digits like "390" instead of "three ninety"

2. MONEY FORMAT
   - ₹2,99,888 should be "about 3 lakh" not "two lakh ninety nine thousand"
   - ₹89,685 should be "about 90 thousand" or "89 thousand"
   - ₹352 should be "three fifty two rupees"
   Flag if any amount would sound unnatural when spoken

3. NUMBER-DATA MATCH
   Every number spoken must match what's shown on screen:
   - 5yr cost: {vehicle.get('net_5yr_display', '')}
   - Daily: {vehicle.get('cost_per_day_display', '')}
   - Annual: {vehicle.get('annual_total_display', '')}
   - Rating: {vehicle.get('expert_rating', '')}

4. DURATION CHECK
   Each narration should be 15-25 words (5-8s at 1.2x).
   Flag if any is too long (>30 words) or too short (<10 words).

5. ABBREVIATIONS → spell out for TTS:
   - "km" → "kilometer" or "kilometers"
   - "kmpl" → "kilometers per liter"
   - "cc" → "CC" (say the letters)
   - "hp" or "bhp" → "horsepower" or "brake horsepower"
   - "Nm" → "newton meters"
   - "kg" → "kilograms"
   - "yr" → "year"
   - "/km" → "per kilometer"
   - "/day" → "per day"

6. BANNED CONTENT
   Flag if any narration reads: URLs, hashtags, "dot com", slide numbers

7. NATURALNESS
   Flag awkward phrasing that would sound robotic when spoken aloud.

Respond with JSON:
{{
  "approved": true/false,
  "issues": [
    {{"slide": "01-hook", "issue": "Says '390' — should be 'three ninety'", "severity": "high"}},
    ...
  ],
  "fixes": {{
    "01-hook": "The real ownership cost of the KTM three ninety Duke...",
    ...
  }}
}}

Only include slides that need fixes. If all narrations are good, return approved: true with empty issues and fixes."""


def review_narration(slug: str, vehicle: dict = None, narrations: dict = None) -> dict:
    """Run claude:review-narration. Returns {approved, issues, fixes}."""
    if vehicle is None:
        vehicle = json.loads((ROOT / "preview" / f"{slug}-full.json").read_text())
    if narrations is None:
        narrations = {}
    prompt = build_review_narration_prompt(slug, vehicle, narrations)
    result = run_claude_step(prompt, timeout=90)
    if result.get("fallback"):
        # Basic fallback: check for raw digit patterns in model name
        model = vehicle.get("short_name", "")
        issues = []
        for sid, text in narrations.items():
            for word in model.split():
                if word.isdigit() and word in text:
                    issues.append({
                        "slide": sid,
                        "issue": f"Raw digits '{word}' — should be spoken form",
                        "severity": "high",
                    })
        return {"approved": len(issues) == 0, "issues": issues, "fixes": {}, "fallback": True}
    return result


def review_renders(slug: str, slides_dir: str) -> dict:
    """Run claude:review-renders. Returns {slides: {name: {approved, issues}}}."""
    prompt = build_review_renders_prompt(slug, slides_dir)
    return run_claude_step(prompt, timeout=120)


def metadata(slug: str, vehicle: dict = None) -> dict:
    """Run claude:metadata. Returns {youtube, instagram, shorts, threads}."""
    if vehicle is None:
        vehicle = json.loads((ROOT / "preview" / f"{slug}-full.json").read_text())
    prompt = build_metadata_prompt(slug, vehicle)
    return run_claude_step(prompt, timeout=120)


# ══════════════════════════════════════════════════════════════════
#  claude:curate-competitors — pick the right segment rivals
# ══════════════════════════════════════════════════════════════════

def _fallback_select(candidates, price, displacement_cc, max_picks):
    """Pick competitors by cc + price proximity when Claude is unavailable."""
    non_ev = [c for c in candidates if c.get("cost_per_km", 0) > 2.0]
    if not non_ev:
        non_ev = list(candidates)

    cc_values = [c.get("displacement_cc", 0) or 0 for c in non_ev]
    price_values = [c.get("price_ex_showroom", 0) or 0 for c in non_ev]
    cc_range = max(max(cc_values) - min(cc_values), 1)
    price_range = max(max(price_values) - min(price_values), 1)

    for c in non_ev:
        c_cc = c.get("displacement_cc", 0) or 0
        c_price = c.get("price_ex_showroom", 0) or 0
        c["_score"] = (abs(c_cc - displacement_cc) / cc_range * 0.6 +
                       abs(c_price - price) / price_range * 0.4)

    non_ev.sort(key=lambda c: c["_score"])
    selected = [c["slug"] for c in non_ev[:max_picks]]
    for c in non_ev:
        c.pop("_score", None)
    return selected


def curate_competitors(vehicle_name: str, vehicle_slug: str, vehicle_type: str,
                       price: int, candidates: list, max_picks: int = 5,
                       displacement_cc: int = 0) -> dict:
    """Use Claude CLI to pick the best segment competitors from SQL candidates.

    Returns {"selected": ["slug1", ...], "reasoning": {...}, "fallback": bool}
    """
    candidate_list = "\n".join(
        f"  - {c['name']} ({c['slug']}): ₹{c['price_ex_showroom']:,}, "
        f"cost/km=₹{c['cost_per_km']}, 5yr=₹{c['total_cost_5yr']:,}"
        for c in candidates
    )

    prompt = f"""You are a motorcycle segment analyst for bikencars.com.

Pick exactly {max_picks} competitors for the {vehicle_name} ({vehicle_slug}) from this candidate list.

Vehicle: {vehicle_name}
Type: {vehicle_type}
Price: ₹{price:,}

Candidates:
{candidate_list}

Rules:
1. Pick bikes that a BUYER would cross-shop — same segment, similar use case
2. Exclude electric vehicles unless the target bike is also electric
3. Exclude bikes from completely different segments (e.g. cruisers vs sportbikes)
4. Prefer bikes with similar engine class (single vs twin, cc range)
5. Include at least 1 cheaper and 1 more expensive option if available
6. The comparison should be useful to someone deciding between these bikes

Respond with JSON only:
{{"selected": ["slug1", "slug2", ...], "reasoning": {{"slug1": "why this is a good competitor", ...}}}}"""

    result = run_claude_step(prompt, timeout=60)

    if result.get("fallback") or result.get("error"):
        selected = _fallback_select(candidates, price, displacement_cc, max_picks)
        return {"selected": selected, "reasoning": {}, "fallback": True}

    selected = result.get("selected", [])
    if not selected or not isinstance(selected, list):
        selected = _fallback_select(candidates, price, displacement_cc, max_picks)
        return {"selected": selected, "reasoning": {}, "fallback": True}

    return {"selected": selected[:max_picks], "reasoning": result.get("reasoning", {}), "fallback": False}


# ══════════════════════════════════════════════════════════════════
#  claude:curate — intelligent slide selection per platform
# ══════════════════════════════════════════════════════════════════

ALL_SLIDE_IDS = [
    "00-what-you-will-learn", "01-hook", "02-annual-breakdown",
    "03-service-deep-dive", "04-year-by-year", "05-depreciation",
    "07-vs-segment",
    "10-review-cta", "11-end-card",
]

PLATFORM_LIMITS = {
    "instagram-reels": 90,
    "facebook-reels": 90,
    "threads-reels": 90,
    "youtube-shorts": 180,
    "instagram-posts": None,  # no limit
    "facebook-posts": None,
    "threads-posts": None,
    "youtube": None,
}

# Story arc positions — ensures narrative coherence
STORY_ARC = {
    "opener": ["00-what-you-will-learn", "01-hook"],
    "body": ["02-annual-breakdown", "03-service-deep-dive", "04-year-by-year",
             "05-depreciation"],
    "compare": ["07-vs-segment"],
    "close": ["11-end-card"],
    "cta": ["10-review-cta"],
}


def _vehicle_interest_scores(vehicle: dict) -> dict:
    """Score each slide's interestingness for THIS specific vehicle (0.0–1.5)."""
    scores = {}

    # Hook — always interesting (shows total cost shock)
    multiplier = vehicle.get("multiplier", 2.0)
    scores["01-hook"] = min(1.5, multiplier / 2.0)  # 2.5x = 1.25, 3x = 1.5

    # Annual breakdown — interesting if one category dominates
    fuel_pct = vehicle.get("fuel_pct", 47)
    scores["02-annual-breakdown"] = 0.8 if fuel_pct > 40 else 1.0 if fuel_pct > 55 else 0.6

    # Service — interesting if unusually expensive
    annual_service = vehicle.get("annual_service", 15000)
    scores["03-service-deep-dive"] = min(1.3, annual_service / 20000)

    # Year by year — interesting if costs spike significantly
    first_5 = vehicle.get("first_5_years", [])
    if len(first_5) >= 5:
        yr1 = first_5[0].get("total", 0)
        yr5 = first_5[4].get("total", 0)
        growth = (yr5 - yr1) / max(yr1, 1)
        scores["04-year-by-year"] = min(1.3, 0.5 + growth * 2)
    else:
        scores["04-year-by-year"] = 0.5

    # Depreciation — interesting if first-year loss is dramatic
    first_year_dep = vehicle.get("first_year_dep", vehicle.get("depreciation_1yr", 25))
    scores["05-depreciation"] = min(1.5, first_year_dep / 25)  # 30% = 1.2, 40% = 1.6→1.5

    # VS Segment — interesting if vehicle ranks very well or very poorly
    competitors = vehicle.get("competitors_ownership", [])
    if competitors:
        all_costs = [c.get("cost_per_km", 99) for c in competitors]
        self_cost = vehicle.get("cost_per_km", 99)
        all_costs_with_self = sorted(all_costs + [self_cost])
        rank = all_costs_with_self.index(self_cost) + 1
        total = len(all_costs_with_self)
        # #1 or #2 = very interesting, middle = less, last = also interesting
        if rank <= 2 or rank >= total - 1:
            scores["07-vs-segment"] = 1.3
        else:
            scores["07-vs-segment"] = 0.7
    else:
        scores["07-vs-segment"] = 0.3

    # Intro — always included, sets context for the video
    scores["00-what-you-will-learn"] = 1.5
    # CTA — lowest value for short formats
    scores["10-review-cta"] = 0.3
    scores["11-end-card"] = 0.4

    return scores


def curate(
    slug: str,
    vehicle: dict = None,
    slide_durations: dict = None,
    platform: str = "instagram-reels",
    default_duration: float = 5.0,
) -> dict:
    """Intelligently select slides for a platform's time limit.

    Uses vehicle-specific interest scoring + story arc preservation +
    value-per-second optimization to pick the best subset of slides.

    Returns:
        {
            "platform": "instagram-reels",
            "maxDuration": 90,
            "selectedSlides": ["01-hook", ...],
            "excludedSlides": ["00-what-you-will-learn", ...],
            "totalDuration": 78.3,
            "headroom": 11.7,
            "reasoning": {"01-hook": "2.5x multiplier = strong shock value", ...}
        }
    """
    if vehicle is None:
        vehicle = json.loads((ROOT / "preview" / f"{slug}-full.json").read_text())

    if slide_durations is None:
        slide_durations = {}

    max_dur = PLATFORM_LIMITS.get(platform)

    # If no time limit, include all slides
    if max_dur is None:
        total = sum(slide_durations.get(s, default_duration) for s in ALL_SLIDE_IDS)
        return {
            "platform": platform,
            "maxDuration": None,
            "selectedSlides": list(ALL_SLIDE_IDS),
            "excludedSlides": [],
            "totalDuration": round(total, 1),
            "headroom": None,
            "reasoning": {s: "No time limit — all slides included" for s in ALL_SLIDE_IDS},
        }

    # Score each slide for this vehicle
    interest = _vehicle_interest_scores(vehicle)

    # Value per second = interest / duration
    vps = {}
    for sid in ALL_SLIDE_IDS:
        dur = slide_durations.get(sid, default_duration)
        vps[sid] = interest.get(sid, 0.5) / max(dur, 1.0)

    # Step 1: always include mandatory slides + best opener + best closer
    selected = []
    reasoning = {}

    # Slide 00 is ALWAYS included — sets context for the video
    selected.append("00-what-you-will-learn")
    reasoning["00-what-you-will-learn"] = "Always included — sets context for the video"

    # Best opener (from remaining opener candidates)
    opener_candidates = [(s, vps.get(s, 0)) for s in STORY_ARC["opener"] if s not in selected]
    if opener_candidates:
        best_opener = max(opener_candidates, key=lambda x: x[1])[0]
        selected.append(best_opener)
        reasoning[best_opener] = "Opener — hooks the viewer"

    # Best closer
    close_candidates = [(s, vps.get(s, 0)) for s in STORY_ARC["close"]]
    best_close = max(close_candidates, key=lambda x: x[1])[0]
    selected.append(best_close)
    reasoning[best_close] = "Closer — wraps the story"

    # Step 2: fill body + compare + cta by value-per-second
    remaining = [s for s in ALL_SLIDE_IDS if s not in selected]
    remaining.sort(key=lambda s: vps.get(s, 0), reverse=True)

    current_dur = sum(slide_durations.get(s, default_duration) for s in selected)

    for sid in remaining:
        dur = slide_durations.get(sid, default_duration)
        if current_dur + dur <= max_dur:
            selected.append(sid)
            current_dur += dur

            # Generate reasoning
            score = interest.get(sid, 0.5)
            if score >= 1.2:
                reasoning[sid] = f"High interest ({score:.1f}) — standout data for this vehicle"
            elif score >= 0.8:
                reasoning[sid] = f"Good value ({score:.1f}) — worth the {dur:.0f}s"
            else:
                reasoning[sid] = f"Fills remaining headroom ({dur:.0f}s)"

    # Step 3: sort selected by slide order (not by score)
    selected.sort(key=lambda s: ALL_SLIDE_IDS.index(s))

    excluded = [s for s in ALL_SLIDE_IDS if s not in selected]
    excluded_reasoning = {}
    for sid in excluded:
        dur = slide_durations.get(sid, default_duration)
        score = interest.get(sid, 0.5)
        excluded_reasoning[sid] = (
            f"Cut — interest {score:.1f}, {dur:.0f}s. "
            f"Adding would exceed {max_dur}s limit"
        )

    return {
        "platform": platform,
        "maxDuration": max_dur,
        "selectedSlides": selected,
        "excludedSlides": excluded,
        "totalDuration": round(current_dur, 1),
        "headroom": round(max_dur - current_dur, 1),
        "reasoning": {**reasoning, **excluded_reasoning},
    }
