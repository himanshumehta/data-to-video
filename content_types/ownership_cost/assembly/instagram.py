"""
Assembly config for ownership-cost Instagram (portrait, 1080x1350).
12 slides rendered via Remotion batch (remotion.json portraitCompositions).
Audio: own TTS via narrations/instagram.py (reword applies).
LinkedIn derives audio from this via AUDIO_FROM = "instagram".

Workflow:
  python scripts/remotion_render.py --batch --slug <slug> --type ownership-cost --theme default --platform instagram --lang en
  python scripts/narrate.py --slug <slug> --type ownership-cost --platform instagram --lang en --reword
  python scripts/assemble.py <slug> --type ownership-cost --platform instagram --lang en
"""

# Slide IDs match remotion.json portraitCompositions keys
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

# SLIDE_SHORT maps slide ID → short name (used by SVG pipeline collect_slides).
# For Remotion batch, collect_slides finds flat {slide_id}.mp4 directly.
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

CHAPTER_LABELS = {}   # Instagram doesn't support chapters

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
