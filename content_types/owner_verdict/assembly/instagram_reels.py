"""
Assembly config for owner-verdict Instagram Reels (9:16, 1080x1920).
9 slides rendered via Remotion batch (remotion.json reelsCompositions).
Audio: own TTS via narrations/instagram_reels.py (independent from posts).

Workflow:
  python scripts/remotion_render.py --batch --slug <slug> --type owner-verdict --platform instagram-reels --lang en
  python scripts/narrate.py --slug <slug> --type owner-verdict --platform instagram-reels --lang en --reword
  python scripts/assemble.py <slug> --type owner-verdict --platform instagram-reels --lang en --curate
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

CHAPTER_LABELS = {}   # Reels don't support chapters

DESCRIPTION_TEMPLATES = {
    "en": """{brand} {name} — real owner verdict

{total_reviews} owners reviewed. {rating} rating.
What they love. What they hate. Should you buy?

Full owner data at bikencars.com

#OwnerVerdict #RealOwnerReview #{brand_tag} #{name_tag} #BikeNCars #ShouldYouBuy {hashtags}""",

    "hi": """{brand} {name} — asli owner verdict

{total_reviews} owners ne review diya. {rating} rating.
Kya pasand. Kya nahi. Khareedna chahiye?

Poora data — bikencars.com

#OwnerVerdict #{brand_tag} #{name_tag} #BikeNCars {hashtags}""",
}
