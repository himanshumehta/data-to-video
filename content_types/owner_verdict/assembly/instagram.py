"""
Assembly config for owner-verdict Instagram Posts (portrait, 1080x1350).
9 slides rendered via Remotion batch (remotion.json portraitCompositions).
Audio: own TTS via narrations/instagram.py (reword applies).
LinkedIn derives audio from this via AUDIO_FROM = "instagram".

Workflow:
  python scripts/remotion_render.py --batch --slug <slug> --type owner-verdict --platform instagram --lang en
  python scripts/narrate.py --slug <slug> --type owner-verdict --platform instagram --lang en --reword
  python scripts/assemble.py <slug> --type owner-verdict --platform instagram --lang en
"""

# Slide IDs match remotion.json portraitCompositions keys
SLIDE_ORDER = [
    "00-hook",
    "01-rating-overview",
    "02-what-owners-love",
    "03-top-complaints",
    "04-owner-profile",
    "05-sentiment-split",
    "06-deal-breakers",
    "07-verdict",
    "08-end-card",
]

SLIDE_SHORT = {
    "00-hook":              "00",
    "01-rating-overview":   "01",
    "02-what-owners-love":  "02",
    "03-top-complaints":    "03",
    "04-owner-profile":     "04",
    "05-sentiment-split":   "05",
    "06-deal-breakers":     "06",
    "07-verdict":           "07",
    "08-end-card":          "08",
}

CHAPTER_LABELS = {}   # Instagram doesn't support chapters

DESCRIPTION_TEMPLATES = {
    "en": """{brand} {name} — real owner verdict

{total_reviews} owners reviewed. {rating} rating.
What they love. What they hate. Should you buy?

Full owner data at bikencars.com

{hashtags}""",

    "hi": """{brand} {name} — asli owner verdict

{total_reviews} owners ne review diya. {rating} rating.

Poora data — bikencars.com

{hashtags}""",
}
