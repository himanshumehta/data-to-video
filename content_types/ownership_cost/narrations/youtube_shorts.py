"""
Ownership Cost narrations for YouTube Shorts (9:16).
9 slides. Target 4–7s per slide at 1.2x TTS speed.
Same portrait slide set as Instagram Reels but own TTS generation.

Each slide has a UNIQUE angle — no two slides repeat the same message.
Use {{ vehicle.spoken_name }} for TTS-safe model name.
"""

NARRATIONS = {
    "en": {
        "00-what-you-will-learn": (
            "{{ vehicle.brand_name }} {{ vehicle.spoken_name or vehicle.short_name }}. "
            "Fuel, service, insurance, depreciation, and every hidden cost. "
            "All in the next sixty seconds."
        ),
        "01-hook": (
            "{{ vehicle.net_5yr_display }}. "
            "That's {{ vehicle.multiplier }} times the sticker price. "
            "Here's where your money actually goes."
        ),
        "02-annual-breakdown": (
            "Fuel takes the biggest chunk at {{ vehicle.annual_fuel_display }} a year. "
            "Then insurance at {{ vehicle.annual_insurance_display }}. "
            "Total annual bill, about {{ vehicle.annual_total_display }}."
        ),
        "03-service-deep-dive": (
            "Oil changes, chain, brakes, coolant. "
            "Service alone costs {{ vehicle.annual_service_display }} every year. "
            "Skip maintenance and you pay double in repairs."
        ),
        "04-year-by-year": (
            "Year one is the cheapest. "
            "By year three, chain and sprocket replacements hit. "
            "Year five, expect the biggest bills."
        ),
        "05-depreciation": (
            "Your {{ vehicle.spoken_name or vehicle.short_name }} loses the most value in year one. "
            "After five years, about half the price is gone. "
            "Sell at the right time to save lakhs."
        ),
        "07-vs-segment": (
            "Cheapest to own or most expensive? "
            "Every rival ranked side by side. "
            "Cost per kilometer tells the real story."
        ),
        "10-review-cta": (
            "Performance, design, features, value. "
            "Detailed category ratings at bikencars dot com."
        ),
        "11-end-card": (
            "Save this for when you need it. "
            "Follow for more breakdowns."
        ),
    },
    "te": {
        "00-what-you-will-learn": (
            "{{ vehicle.brand_name }} {{ vehicle.spoken_name or vehicle.short_name }}. "
            "Fuel, service, insurance, depreciation, మరియు ప్రతి దాగిన ఖర్చు. "
            "అంతా అరవై సెకన్లలో."
        ),
        "01-hook": (
            "{{ vehicle.net_5yr_display }}. "
            "ఇది sticker price కి {{ vehicle.multiplier }} రెట్లు. "
            "మీ డబ్బు ఎక్కడికి వెళ్తుందో చూడండి."
        ),
        "02-annual-breakdown": (
            "Fuel అతి పెద్ద భాగం, సంవత్సరానికి {{ vehicle.annual_fuel_display }}. "
            "తర్వాత insurance {{ vehicle.annual_insurance_display }}. "
            "మొత్తం వార్షిక బిల్లు, దాదాపు {{ vehicle.annual_total_display }}."
        ),
        "03-service-deep-dive": (
            "Oil changes, chain, brakes, coolant. "
            "Service ఒక్కటే సంవత్సరానికి {{ vehicle.annual_service_display }}. "
            "Maintenance వదిలేస్తే repairs లో రెట్టింపు చెల్లిస్తారు."
        ),
        "04-year-by-year": (
            "మొదటి సంవత్సరం అతి చవక. "
            "మూడవ సంవత్సరానికి chain మరియు sprocket replacements వస్తాయి. "
            "ఐదవ సంవత్సరంలో అతి పెద్ద బిల్లులు ఎదురవుతాయి."
        ),
        "05-depreciation": (
            "మీ {{ vehicle.spoken_name or vehicle.short_name }} మొదటి సంవత్సరంలో అతిగా విలువ కోల్పోతుంది. "
            "ఐదు సంవత్సరాల తర్వాత, దాదాపు సగం ధర పోతుంది. "
            "సరైన సమయంలో అమ్మితే లక్షలు ఆదా."
        ),
        "07-vs-segment": (
            "Own చేయడానికి చవక లేదా ఖరీదైనది? "
            "ప్రతి rival పక్కపక్కన rank చేశాం. "
            "Cost per kilometer నిజమైన కథ చెబుతుంది."
        ),
        "10-review-cta": (
            "Performance, design, features, value. "
            "వివరమైన category ratings bikencars dot com లో."
        ),
        "11-end-card": (
            "అవసరానికి save చేసుకోండి. "
            "మరిన్ని breakdowns కోసం follow చేయండి."
        ),
    },
}
