"""
Assembly config for ownership-cost LinkedIn.
Uses landscape slides (16:9). Audio derived from Instagram.
SLIDE_ORDER is a subset of Instagram slide names whose short keys
exist in content_types/ownership_cost/slides/landscape.py SLIDES dict.
"""

# LinkedIn audio comes from Instagram output — no TTS generation needed.
# See narrations/linkedin.py for AUDIO_FROM declaration.

SLIDE_ORDER = [
    "06-service",
    "11-overhauls",
    "13-depreciation",
    "15-vs-segment",
    "17-verdict",
]

SLIDE_SHORT = {
    "06-service":       "06",   # landscape SLIDES["06"] ✓
    "11-overhauls":     "11",   # landscape SLIDES["11"] ✓
    "13-depreciation":  "13",   # landscape SLIDES["13"] ✓
    "15-vs-segment":    "15",   # landscape SLIDES["15"] ✓
    "17-verdict":       "17",   # landscape SLIDES["17"] ✓
}

CHAPTER_LABELS = {}   # LinkedIn doesn't support chapters

DESCRIPTION_TEMPLATES = {
    "en": """{brand} {name} — 5-Year Ownership Cost

The real cost of owning this motorcycle: {total_5yr} over 5 years — that's {multiplier}x the ex-showroom price.

What we cover:
\u2022 Annual cost breakdown (fuel + service + insurance + tyres)
\u2022 Year-by-year spend with overhaul spikes
\u2022 Depreciation curve — the right time to sell
\u2022 Segment ranking vs rivals

Full interactive calculator: bikencars.com/ownership-calculator/{slug}

{hashtags}""",
    "hi": """{brand} {name} — 5 साल की ownership cost

5 साल में {total_5yr}। Ex-showroom price का {multiplier}x।

Full breakdown: bikencars.com/ownership-calculator/{slug}

{hashtags}""",
}
