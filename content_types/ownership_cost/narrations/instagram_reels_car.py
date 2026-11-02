"""
Ownership Cost narrations for Instagram Reels (9:16) — CARS ONLY.

Isolated from motorcycle narrations. Uses car-specific vocabulary:
  - "filters" not "chain"
  - "clutch/AC/suspension" not "chain sprocket"
  - Mentions variant, engine cc, fuel type, NA/turbo in intro
  - No motorcycle terms anywhere

9 slides. Target 4-7s per slide at 1.2x TTS speed.
"""

NARRATIONS = {
    "en": {
        "00-what-you-will-learn": (
            "Thinking of buying a {{ vehicle.brand_name }} {{ vehicle.spoken_name or vehicle.short_name }}? "
            "{% if vehicle.variant %}"
            "The {{ vehicle.variant }} — "
            "{% endif %}"
            "{% if vehicle.is_turbo %}"
            "{{ vehicle.engine_cc or '' }}cc turbo {{ vehicle.fuel_type or 'petrol' }}. "
            "{% elif vehicle.engine_cc %}"
            "{{ vehicle.engine_cc }}cc naturally aspirated {{ vehicle.fuel_type or 'petrol' }}. "
            "{% endif %}"
            "{% if vehicle.data_confidence == 'verified' %}"
            "Here's the complete ownership cost. "
            "{% else %}"
            "Here's the estimated ownership cost. "
            "{% endif %}"
            "Not just the showroom price. The total cost over five years."
        ),
        "01-hook": (
            "{{ vehicle.net_5yr_display }} over five years. "
            "That's {{ vehicle.multiplier }} times the purchase price. "
            "Here's how it breaks down."
        ),
        "02-annual-breakdown": (
            "{{ vehicle.annual_total_display }} per year in running costs. "
            "Insurance at {{ vehicle.annual_insurance_display }}, "
            "fuel at {{ vehicle.cost_per_day_display }} a day."
        ),
        "03-service-deep-dive": (
            "Oil changes, filters, brakes, coolant, AC service. "
            "Service adds up to {{ vehicle.annual_service_display }} every year. "
            "Here's what each component costs."
        ),
        "04-year-by-year": (
            "Year {{ vehicle.cheapest_year }} is the lightest at {{ vehicle.cheapest_year_display }}. "
            "{% if vehicle.first_overhaul_year %}"
            "Year {{ vehicle.first_overhaul_year }}, {{ vehicle.first_overhaul_component }} replacement adds to the cost. "
            "{% endif %}"
            "Year {{ vehicle.costliest_year }} sees the highest bill at {{ vehicle.costliest_year_display }}."
        ),
        "05-depreciation": (
            "The {{ vehicle.spoken_name or vehicle.short_name }} loses the most value in year one. "
            "After five years, roughly half the purchase price is gone. "
            "Timing the sale right can save you lakhs."
        ),
        "07-vs-segment": (
            "How does it compare to the segment? "
            "Every rival ranked by cost per kilometer. "
            "Side by side, same assumptions."
        ),
        "10-review-cta": (
            "Performance, design, features, value. "
            "Detailed category ratings at bikencars dot com."
        ),
        "11-end-card": (
            "Save this for when you need it. "
            "Follow for more ownership breakdowns."
        ),
    },
    "hi": {
        "00-what-you-will-learn": (
            "{{ vehicle.brand_name }} {{ vehicle.spoken_name or vehicle.short_name }} khareedne ka soch rahe hain? "
            "{% if vehicle.variant %}"
            "{{ vehicle.variant }} — "
            "{% endif %}"
            "{% if vehicle.is_turbo %}"
            "{{ vehicle.engine_cc or '' }}cc turbo {{ vehicle.fuel_type or 'petrol' }}. "
            "{% elif vehicle.engine_cc %}"
            "{{ vehicle.engine_cc }}cc naturally aspirated {{ vehicle.fuel_type or 'petrol' }}. "
            "{% endif %}"
            "{% if vehicle.data_confidence == 'verified' %}"
            "Pehle jaaniye poori ownership cost. "
            "{% else %}"
            "Pehle jaaniye anumaanit ownership cost. "
            "{% endif %}"
            "Sirf showroom price nahi. Paanch saal ka poora khurcha."
        ),
        "01-hook": (
            "Paanch saal mein {{ vehicle.net_5yr_display }}. "
            "Yeh purchase price se {{ vehicle.multiplier }} guna hai. "
            "Aaiye dekhte hain poora breakdown."
        ),
        "02-annual-breakdown": (
            "Saalana running cost {{ vehicle.annual_total_display }}. "
            "Insurance {{ vehicle.annual_insurance_display }}, "
            "aur fuel {{ vehicle.cost_per_day_display }} roz."
        ),
        "03-service-deep-dive": (
            "Oil change, filter, brake, coolant, AC service. "
            "Service ka saalana khurcha {{ vehicle.annual_service_display }}. "
            "Har component ka cost yahan dekhiye."
        ),
        "04-year-by-year": (
            "Saal {{ vehicle.cheapest_year }} sabse halka, {{ vehicle.cheapest_year_display }}. "
            "{% if vehicle.first_overhaul_year %}"
            "Saal {{ vehicle.first_overhaul_year }} mein {{ vehicle.first_overhaul_component }} replacement aata hai. "
            "{% endif %}"
            "Saal {{ vehicle.costliest_year }} ka bill sabse bada, {{ vehicle.costliest_year_display }}."
        ),
        "05-depreciation": (
            "{{ vehicle.spoken_name or vehicle.short_name }} ki value pehle saal sabse zyada girti hai. "
            "Paanch saal baad, lagbhag aadhi kimat khatam. "
            "Sahi waqt pe bechein toh lakho bach sakte hain."
        ),
        "07-vs-segment": (
            "Segment mein kahan khada hai? "
            "Har rival, cost per kilometer ke hisaab se. "
            "Ek saath, same assumptions."
        ),
        "10-review-cta": (
            "Performance, design, features, value. "
            "Detailed ratings bikencars dot com pe."
        ),
        "11-end-card": (
            "Zaroorat ke liye save karein. "
            "Aur ownership breakdowns ke liye follow karein."
        ),
    },
    "te": {
        "00-what-you-will-learn": (
            "{{ vehicle.brand_name }} {{ vehicle.spoken_name or vehicle.short_name }} కొనాలని ఆలోచిస్తున్నారా? "
            "{% if vehicle.variant %}"
            "{{ vehicle.variant }} — "
            "{% endif %}"
            "{% if vehicle.is_turbo %}"
            "{{ vehicle.engine_cc or '' }}cc turbo {{ vehicle.fuel_type or 'petrol' }}. "
            "{% elif vehicle.engine_cc %}"
            "{{ vehicle.engine_cc }}cc naturally aspirated {{ vehicle.fuel_type or 'petrol' }}. "
            "{% endif %}"
            "{% if vehicle.data_confidence == 'verified' %}"
            "మొదట పూర్తి ownership cost తెలుసుకోండి. "
            "{% else %}"
            "మొదట అంచనా ownership cost తెలుసుకోండి. "
            "{% endif %}"
            "కేవలం showroom price కాదు. ఐదు సంవత్సరాల మొత్తం ఖర్చు."
        ),
        "01-hook": (
            "ఐదు సంవత్సరాలలో {{ vehicle.net_5yr_display }}. "
            "ఇది కొనుగోలు ధరకు {{ vehicle.multiplier }} రెట్లు. "
            "పూర్తి breakdown చూద్దాం."
        ),
        "02-annual-breakdown": (
            "వార్షిక running cost {{ vehicle.annual_total_display }}. "
            "Insurance {{ vehicle.annual_insurance_display }}, "
            "fuel రోజుకు {{ vehicle.cost_per_day_display }}."
        ),
        "03-service-deep-dive": (
            "Oil change, filter, brake, coolant, AC service. "
            "Service వార్షిక ఖర్చు {{ vehicle.annual_service_display }}. "
            "ప్రతి component ఖర్చు ఇక్కడ చూడండి."
        ),
        "04-year-by-year": (
            "సంవత్సరం {{ vehicle.cheapest_year }} అతి తక్కువ, {{ vehicle.cheapest_year_display }}. "
            "{% if vehicle.first_overhaul_year %}"
            "సంవత్సరం {{ vehicle.first_overhaul_year }}లో {{ vehicle.first_overhaul_component }} replacement వస్తుంది. "
            "{% endif %}"
            "సంవత్సరం {{ vehicle.costliest_year }} బిల్లు అతి ఎక్కువ, {{ vehicle.costliest_year_display }}."
        ),
        "05-depreciation": (
            "{{ vehicle.spoken_name or vehicle.short_name }} విలువ మొదటి సంవత్సరంలో అతిగా తగ్గుతుంది. "
            "ఐదు సంవత్సరాల తర్వాత, దాదాపు సగం ధర పోతుంది. "
            "సరైన సమయంలో అమ్మితే లక్షలు ఆదా చేయవచ్చు."
        ),
        "07-vs-segment": (
            "segment లో ఎక్కడ ఉంది? "
            "ప్రతి rival, cost per kilometer ప్రకారం. "
            "పక్కపక్కనే, same assumptions."
        ),
        "10-review-cta": (
            "Performance, design, features, value. "
            "వివరమైన ratings bikencars dot com లో."
        ),
        "11-end-card": (
            "అవసరానికి save చేసుకోండి. "
            "మరిన్ని ownership breakdowns కోసం follow చేయండి."
        ),
    },
}
