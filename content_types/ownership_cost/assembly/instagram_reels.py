"""
Assembly config for ownership-cost Instagram Reels (9:16, 1080x1920).
9 slides rendered via Remotion batch (remotion.json reelsCompositions).
Audio: own TTS via narrations/instagram_reels.py (independent from posts).

Workflow:
  python scripts/remotion_render.py --batch --slug <slug> --type ownership-cost --platform instagram-reels --lang en
  python scripts/narrate.py --slug <slug> --type ownership-cost --platform instagram-reels --lang en --reword
  python scripts/assemble.py <slug> --type ownership-cost --platform instagram-reels --lang en --curate
"""

# Slide IDs match remotion.json reelsCompositions keys
SLIDE_ORDER = [
    "00-what-you-will-learn",
    "01-hook",
    "02-annual-breakdown",
    "03-service-deep-dive",
    "04-year-by-year",
    "05-depreciation",
    "07-vs-segment",
    "10-review-cta",
    "11-end-card",
]

SLIDE_SHORT = {
    "00-what-you-will-learn": "00",
    "01-hook":                "01",
    "02-annual-breakdown":    "02",
    "03-service-deep-dive":   "03",
    "04-year-by-year":        "04",
    "05-depreciation":        "05",
    "07-vs-segment":          "07",
    "10-review-cta":          "10",
    "11-end-card":            "11",
}

CHAPTER_LABELS = {}   # Reels don't support chapters

DESCRIPTION_TEMPLATES = {
    "en": """{brand} {name} — real ownership cost

{total_5yr} over 5 years. That's {multiplier}x the purchase price.

Full breakdown at bikencars.com

{hashtags}""",

    "hi": """{brand} {name} — ownership cost

5 sal mein {total_5yr}. {multiplier}x se bhi zyada.

Full breakdown — bikencars.com

{hashtags}""",
}
