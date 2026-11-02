"""
Assembly config for owner-verdict LinkedIn.
Same slides as Instagram. Audio derived from Instagram.
"""

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

CHAPTER_LABELS = {}

DESCRIPTION_TEMPLATES = {
    "en": """{brand} {name} — Owner Verdict

We analysed {total_reviews} real owner reviews.
{positive_pct}% positive | {negative_pct}% negative.

Top praise: {top_praise}
Top complaint: {top_complaint}

Full data: bikencars.com/bikes/{slug}

#OwnerVerdict #BikeNCars #{brand_tag} #{name_tag}""",
}
