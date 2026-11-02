"""
Assembly config for ownership-cost YouTube videos.
16:9 landscape. 12 slides. en/hi/mr/te chapters and descriptions.
"""

SLIDE_ORDER = [
    "00-what-you-will-learn",
    "02-intro-hook",
    "04-annual-breakdown",
    "06-service-deep-dive",
    "07-insurance-breakdown",
    "11-major-overhauls",
    "13-depreciation",
    "15-vs-segment",
    "17-verdict",
    "17A-review-summary",
    "17B-review-cta",
    "18-end-card",
]

SLIDE_SHORT = {
    "00-what-you-will-learn": "00",
    "02-intro-hook":          "02",
    "04-annual-breakdown":    "04",
    "06-service-deep-dive":   "06",
    "07-insurance-breakdown": "07",
    "11-major-overhauls":     "11",
    "13-depreciation":        "13",
    "15-vs-segment":          "15",
    "17-verdict":             "17",
    "17A-review-summary":     "17A",
    "17B-review-cta":         "17B",
    "18-end-card":            "18",
}

CHAPTER_LABELS = {
    "en": {
        "intro":                  "Intro",
        "00-what-you-will-learn": "What You Will Learn",
        "02-intro-hook":          "Total Cost Overview",
        "04-annual-breakdown":    "Annual Breakdown",
        "06-service-deep-dive":   "Service Cost",
        "07-insurance-breakdown": "Insurance",
        "11-major-overhauls":     "Major Overhauls",
        "13-depreciation":        "Depreciation",
        "15-vs-segment":          "Vs Segment",
        "17-verdict":             "Verdict",
        "17A-review-summary":     "Expert Rating",
        "17B-review-cta":         "Full Review",
        "cta":                    "Ownership Calculator",
        "18-end-card":            "Subscribe",
    },
    "hi": {
        "intro":                  "Intro",
        "00-what-you-will-learn": "क्या सीखेंगे / What You Will Learn",
        "02-intro-hook":          "कुल खर्चा / Total Cost",
        "04-annual-breakdown":    "सालाना खर्चा / Annual Breakdown",
        "06-service-deep-dive":   "सर्विस खर्चा / Service Cost",
        "07-insurance-breakdown": "इंश्योरेंस / Insurance",
        "11-major-overhauls":     "बड़े खर्चे / Major Overhauls",
        "13-depreciation":        "डेप्रीसिएशन / Depreciation",
        "15-vs-segment":          "सेगमेंट तुलना / Vs Segment",
        "17-verdict":             "निर्णय / Verdict",
        "17A-review-summary":     "एक्सपर्ट रेटिंग / Expert Rating",
        "17B-review-cta":         "पूरी समीक्षा / Full Review",
        "cta":                    "Calculator / कैलकुलेटर",
        "18-end-card":            "Subscribe",
    },
    "mr": {
        "intro":                  "Intro",
        "00-what-you-will-learn": "काय शिकाल / What You Will Learn",
        "02-intro-hook":          "एकूण खर्च / Total Cost",
        "04-annual-breakdown":    "वार्षिक खर्च / Annual Breakdown",
        "06-service-deep-dive":   "सर्व्हिस खर्च / Service Cost",
        "07-insurance-breakdown": "विमा / Insurance",
        "11-major-overhauls":     "मोठे दुरुस्ती खर्च / Major Overhauls",
        "13-depreciation":        "घसारा / Depreciation",
        "15-vs-segment":          "सेगमेंट तुलना / Vs Segment",
        "17-verdict":             "निष्कर्ष / Verdict",
        "17A-review-summary":     "तज्ञ रेटिंग / Expert Rating",
        "17B-review-cta":         "संपूर्ण परीक्षण / Full Review",
        "cta":                    "Calculator / कॅल्क्युलेटर",
        "18-end-card":            "Subscribe",
    },
    "te": {
        "intro":                  "Intro",
        "00-what-you-will-learn": "మీరు నేర్చుకునేది / What You Will Learn",
        "02-intro-hook":          "మొత్తం ఖర్చు / Total Cost",
        "04-annual-breakdown":    "వార్షిక వివరాలు / Annual Breakdown",
        "06-service-deep-dive":   "సర్వీస్ ఖర్చు / Service Cost",
        "07-insurance-breakdown": "ఇన్సూరెన్స్ / Insurance",
        "11-major-overhauls":     "పెద్ద మరమ్మత్తు / Major Overhauls",
        "13-depreciation":        "విలువ తగ్గుదల / Depreciation",
        "15-vs-segment":          "పోలిక / Vs Segment",
        "17-verdict":             "నిర్ణయం / Verdict",
        "17A-review-summary":     "నిపుణుల రేటింగ్ / Expert Rating",
        "17B-review-cta":         "పూర్తి సమీక్ష / Full Review",
        "cta":                    "Calculator / కాల్క్యులేటర్",
        "18-end-card":            "Subscribe",
    },
}

DESCRIPTION_TEMPLATES = {
    "en": """{brand} {name} — Real Ownership Cost | {year}

The {brand} {name} costs {price} to buy — but what does it really cost to own?
Over 5 years you'll spend {total_5yr} running this bike. That's {multiplier}x the purchase price.

In this video:
✅ Fuel, Service, Insurance, Tyres — full breakdown
✅ Major overhauls — when and how much?
✅ Depreciation curve — best time to sell?
✅ Every rival ranked by 5-year ownership cost
✅ Cost per km: {cost_per_km}/km
✅ Calculate your exact ownership cost at bikencars.com

🔗 Full Calculator: https://bikencars.com/ownership-calculator/{slug}
🔗 Full Review: https://bikencars.com/bikes/{slug}

{hashtags}""",
    "hi": """{brand} {name} — असली ओनरशिप कॉस्ट | {year}

{brand} {name} की कीमत {price} है — लेकिन इसे चलाने का असली खर्चा क्या है?
5 साल में कुल {total_5yr} खर्च होंगे। यानी खरीद कीमत का {multiplier}x से भी ज़्यादा।

इस वीडियो में:
✅ Fuel, Service, Insurance, Tyres का पूरा breakdown
✅ Major overhauls — कब और कितना?
✅ Depreciation curve — बेचने का सही समय?
✅ Segment में हर rival से तुलना
✅ Cost per km: {cost_per_km}/km
✅ Bikencars.com पर अपना exact ownership cost calculate करें

🔗 Full Calculator: https://bikencars.com/ownership-calculator/{slug}
🔗 Full Review: https://bikencars.com/bikes/{slug}

{hashtags}""",
    "mr": """{brand} {name} — खरी Ownership Cost | {year}

{brand} {name} ची किंमत {price} आहे — पण ते चालवायला खरंच किती खर्च येतो?
५ वर्षांत तुम्ही या बाईकवर {total_5yr} खर्च कराल. म्हणजे खरेदी किमतीच्या {multiplier}x पट.

या व्हिडिओत:
✅ Petrol, Service, Insurance, Tyres — संपूर्ण breakdown
✅ मोठे दुरुस्ती खर्च — कधी आणि किती?
✅ Depreciation — विकण्याची योग्य वेळ कधी?
✅ सेगमेंटमधील प्रत्येक प्रतिस्पर्ध्याची तुलना
✅ Cost per km: {cost_per_km}/km
✅ bikencars.com वर तुमचा नेमका ownership cost काढा

🔗 Full Calculator: https://bikencars.com/ownership-calculator/{slug}
🔗 Full Review: https://bikencars.com/bikes/{slug}

{hashtags}""",
    "te": """{brand} {name} — నిజమైన Ownership Cost | {year}

{brand} {name} ధర {price} — కానీ నడపడానికి నిజంగా ఎంత ఖర్చవుతుంది?
5 సంవత్సరాలలో మీరు ఈ బైక్‌పై {total_5yr} ఖర్చు చేస్తారు. అంటే కొనుగోలు ధరకు {multiplier}x రెట్లు.

ఈ వీడియోలో:
✅ Petrol, Service, Insurance, Tyres — పూర్తి breakdown
✅ పెద్ద మరమ్మత్తు ఖర్చులు — ఎప్పుడు మరియు ఎంత?
✅ Depreciation — అమ్మడానికి సరైన సమయం ఎప్పుడు?
✅ సెగ్మెంట్‌లో ప్రతి పోటీదారుతో పోలిక
✅ Cost per km: {cost_per_km}/km
✅ bikencars.com లో మీ సొంత ownership cost లెక్కించండి

🔗 Full Calculator: https://bikencars.com/ownership-calculator/{slug}
🔗 Full Review: https://bikencars.com/bikes/{slug}

{hashtags}""",
}
