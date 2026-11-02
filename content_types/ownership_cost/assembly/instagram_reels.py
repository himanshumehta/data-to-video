"""
Assembly config for the ownership-cost reel (9:16, 1080x1920): slide order and
post descriptions. The same master is published to every 9:16 target in
config/platforms.json.

Workflow (scripts/ownership_pipeline.py runs these in order):
  python scripts/narrate.py --slug <slug> --type ownership-cost --platform instagram-reels --lang en
  python scripts/remotion_render.py --slug <slug> --type ownership-cost --platform instagram-reels --lang en
  python scripts/assemble.py <slug> --type ownership-cost --platform instagram-reels --lang en
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
