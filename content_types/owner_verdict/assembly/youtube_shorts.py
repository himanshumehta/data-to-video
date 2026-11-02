"""
Assembly config for owner-verdict YouTube Shorts (9:16, 1080x1920).
Same 9 portrait slides as Instagram Reels (reelsCompositions).
Audio: own TTS via narrations/youtube_shorts.py (independent from posts/reels).
No chapters (Shorts don't support them).

Workflow:
  python scripts/remotion_render.py --batch --slug <slug> --type owner-verdict --platform youtube-shorts --lang en
  python scripts/narrate.py --slug <slug> --type owner-verdict --platform youtube-shorts --lang en --reword
  python scripts/assemble.py <slug> --type owner-verdict --platform youtube-shorts --lang en --curate
"""

# Slide IDs match remotion.json reelsCompositions keys
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

# Shorts don't support chapters — empty dict
CHAPTER_LABELS = {}

DESCRIPTION_TEMPLATES = {
    "en": """{brand} {name} — owner verdict #Shorts

{total_reviews} owners reviewed. {rating} rating.
Love it or hate it? Full data at bikencars.com

#OwnerVerdict #{brand_tag} #{name_tag} #BikeNCars #Shorts {hashtags}""",

    "hi": """{brand} {name} — owner verdict #Shorts

{total_reviews} owners ne review diya. {rating} rating.
Poora data — bikencars.com

#{brand_tag} #{name_tag} #BikeNCars #Shorts {hashtags}""",
}
