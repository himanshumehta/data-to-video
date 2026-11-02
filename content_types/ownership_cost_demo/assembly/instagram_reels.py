"""
ownership_cost_demo assembly config for instagram-reels.

Step order matches the scenario. Each step is an (id, narration_template_key)
pair — the assembler concats WAVs in this order with inter-step gaps from
config.json, then muxes against the captured video.
"""

STEP_ORDER = [
    "00-intro",
    "00-hook",
    "01-slider-km",
    "02-slider-years",
    "03-slider-city",
    "04-scroll-breakdown",
]

CHAPTER_LABELS = {
    "en": {
        "00-intro": "Visit bikencars.com",
        "00-hook": "Hook",
        "01-slider-km": "Annual KM",
        "02-slider-years": "Duration",
        "03-slider-city": "City / highway mix",
        "04-scroll-breakdown": "Year-by-year",
    },
    "hi": {
        "00-intro": "bikencars.com par jaiye",
        "00-hook": "Hook",
        "01-slider-km": "Saalana KM",
        "02-slider-years": "Duration",
        "03-slider-city": "City / Highway",
        "04-scroll-breakdown": "Saal-dar-saal",
    },
}

DESCRIPTION_TEMPLATES = {
    "en": """{brand} {name} — the real 5-year cost

Sticker price lies. This is what you'll actually pay over five years of ownership — fuel, service, insurance, tyres, depreciation.

Try the calculator yourself: https://bikencars.com/ownership-cost/{slug}

{hashtags}
""",
    "hi": """{brand} {name} — asli paanch saal ka kharcha

Sticker price sab kuch nahi hai. Ye rahi paanch saal ki asli cost — fuel, service, insurance, tyre, depreciation.

Calculator khud try kijiye: https://bikencars.com/ownership-cost/{slug}

{hashtags}
""",
}

HASHTAGS = {
    "en": "#bikencars #ownershipcost #carcosts #bikecosts #5yearcost #howmuchitcosts",
    "hi": "#bikencars #costofownership #kharcha #bikecost #carcost #bharat",
}
