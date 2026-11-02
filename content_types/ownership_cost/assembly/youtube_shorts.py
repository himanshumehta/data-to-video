"""
Assembly config for ownership-cost YouTube Shorts (9:16, 1080x1920).
Same 9 portrait slides as Instagram Reels (reelsCompositions).
Audio: own TTS via narrations/youtube_shorts.py (independent from posts/reels).
No chapters (Shorts don't support them).

Workflow:
  python scripts/remotion_render.py --batch --slug <slug> --type ownership-cost --platform youtube-shorts --lang en
  python scripts/narrate.py --slug <slug> --type ownership-cost --platform youtube-shorts --lang en --reword
  python scripts/assemble.py <slug> --type ownership-cost --platform youtube-shorts --lang en --curate
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

# Shorts don't support chapters — empty dict
CHAPTER_LABELS = {}

DESCRIPTION_TEMPLATES = {
    "en": """{brand} {name} — real ownership cost 💰 #Shorts

{total_5yr} over 5 years. That's {multiplier}x the purchase price.

Full breakdown at bikencars.com

{hashtags} #Shorts""",

    "hi": """{brand} {name} — असली ownership cost 💰 #Shorts

5 साल में {total_5yr}। यानी {multiplier}x से भी ज़्यादा।

Full breakdown — bikencars.com

{hashtags} #Shorts""",
}
