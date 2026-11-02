"""
Assembly config for owner-verdict YouTube videos.
16:9 landscape. 9 slides. en/hi chapters and descriptions.
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

CHAPTER_LABELS = {
    "en": {
        "intro":              "Intro",
        "00-hook":            "What Owners Say",
        "01-rating-overview": "Owner Rating",
        "02-what-owners-love":"What They Love",
        "03-top-complaints":  "Top Complaints",
        "04-owner-profile":   "Who Buys This",
        "05-sentiment-split": "Sentiment Breakdown",
        "06-deal-breakers":   "Deal Breakers",
        "07-verdict":         "Final Verdict",
        "08-end-card":        "Subscribe",
    },
    "hi": {
        "intro":              "Intro",
        "00-hook":            "Owners ka Verdict",
        "01-rating-overview": "Owner Rating",
        "02-what-owners-love":"Kya Pasand Hai",
        "03-top-complaints":  "Shikayatein",
        "04-owner-profile":   "Kaun Khareedta Hai",
        "05-sentiment-split": "Sentiment Breakdown",
        "06-deal-breakers":   "Deal Breakers",
        "07-verdict":         "Final Verdict",
        "08-end-card":        "Subscribe",
    },
}

DESCRIPTION_TEMPLATES = {
    "en": """{brand} {name} — Real Owner Verdict | {year}

Should you buy the {brand} {name}?
We analysed {total_reviews} real owner reviews from Reddit, Team-BHP, and owner forums.

In this video:
{positive_pct}% positive | {negative_pct}% negative
Top 3 things owners LOVE
Top 3 owner complaints
Typical buyer profile & use cases
Deal breakers you must know
Final verdict: buy or skip?

Full interactive owner data: https://bikencars.com/bikes/{slug}

{hashtags}""",

    "hi": """{brand} {name} — Asli Owner Verdict | {year}

{brand} {name} khareedna chahiye ya nahi?
Humne {total_reviews} real owner reviews analyse kiye — Reddit, Team-BHP, aur owner forums se.

Is video mein:
{positive_pct}% khush | {negative_pct}% naaraz
Top 3 cheezein jo owners ko pasand hain
Top 3 shikayatein
Kaun khareedta hai — buyer profile
Deal breakers jo aapko jaanne chahiye
Final verdict: khareedein ya chhodein?

Poora owner data: https://bikencars.com/bikes/{slug}

{hashtags}""",
}
