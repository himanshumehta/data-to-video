"""
Ownership Cost narrations for Instagram (portrait + reels).
11 slides. Target 4–7s per slide at 1.2x TTS speed.

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
}
