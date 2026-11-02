"""
ownership_cost_demo narrations — instagram-reels.

Scripts are matched to scenario step IDs (see scenarios/demo-basic.json).
Each string is a Jinja2 template rendered against the vehicle data dict
returned by the vehicle data loader (scripts/lib/vehicle_data.py).

Narration duration drives scenario timing — keep each line 15-30 words
(2.5-4s at 1.2x speed).
"""

NARRATIONS = {
    "en": {
        "00-intro": (
            "Visit bikencars dot com. "
            "India's only vehicle ownership cost calculator."
        ),
        "00-hook": (
            "What does your {{ vehicle.short_name or vehicle.name }} really cost? "
            "Not the sticker. The real five-year number. "
            "Let me show you."
        ),
        "01-slider-km": (
            "Drag your yearly kilometers. "
            "Ride twenty thousand a year and the cost climbs — "
            "more fuel, more service, more tyres."
        ),
        "02-slider-years": (
            "Now change the duration. "
            "Planning to keep it for seven years? "
            "The depreciation math shifts — see that number move."
        ),
        "03-slider-city": (
            "Eighty percent city riding? "
            "Worse mileage, more stop-start service. "
            "Your real cost is NOT what the brochure says."
        ),
        "04-scroll-breakdown": (
            "Here's the year-by-year. "
            "Year one hurts the most — registration, insurance, first service. "
            "Year five drops by nearly half. "
            "Check ownership cost for your vehicle at bikencars dot com."
        ),
    },
    "hi": {
        "00-intro": (
            "bikencars dot com par jaiye "
            "aur apni gaadi ka asli ownership cost dekhiye."
        ),
        "00-hook": (
            "{{ vehicle.short_name or vehicle.name }} — sticker price toh sabko pata hai. "
            "Par asli paanch saal ka kharcha kya hai? "
            "Dekhiye."
        ),
        "01-slider-km": (
            "Apne saalana kilometers drag kijiye. "
            "Bees hazaar kilometer chalayenge toh fuel, service, tyre — sab badhega. "
            "Number dekhiye kaise bhaagta hai."
        ),
        "02-slider-years": (
            "Ab duration badliye. "
            "Saat saal tak rakhna hai? "
            "Depreciation ka maths badal jaata hai — number khud dekh lijiye."
        ),
        "03-slider-city": (
            "Assi percent city riding? "
            "Mileage kam, service bhi ziyaada. "
            "Brochure jo dikhata hai, woh asli kharcha nahi hai."
        ),
        "04-scroll-breakdown": (
            "Ye rahi saal-dar-saal breakdown. "
            "Pehla saal sabse bhaari — registration, insurance, first service. "
            "Paanchve saal tak ye aadha ho jaata hai. "
            "Apni gaadi ka ownership cost dekhiye bikencars dot com par."
        ),
    },
}
