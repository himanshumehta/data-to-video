"""
Service Bill Breakdown narrations for Instagram Reels (9:16).
Natural, conversational, free-flowing. Numbers rounded. Dates spoken naturally.

Rules:
- Dates: "3rd November 2025" not "03 Nov 2025"
- Numbers: round to nearest thousand/lakh — "about 25 thousand" not "₹25,291"
- Optional items: "these are optional, you can skip them" — never "not needed"
- Kilometers: "85 thousand kilometers" not "85000 km"
- All amounts use spoken format from bill.*_display fields (already formatted)

Slide IDs match Gallery BILL_REELS_SLIDES.
"""

# Month names for natural date reading
_MONTHS = {
    "01": "January", "02": "February", "03": "March", "04": "April",
    "05": "May", "06": "June", "07": "July", "08": "August",
    "09": "September", "10": "October", "11": "November", "12": "December",
}

# Ordinal suffixes
_ORDINAL = {
    "1": "1st", "2": "2nd", "3": "3rd", "21": "21st", "22": "22nd", "23": "23rd", "31": "31st",
}


def _spoken_date(iso_date):
    """Convert '2025-11-03' to '3rd November 2025' for TTS."""
    if not iso_date:
        return None
    try:
        parts = str(iso_date).split("-")
        if len(parts) != 3:
            return None
        year, month, day = parts
        day_int = str(int(day))  # remove leading zero
        ordinal = _ORDINAL.get(day_int, f"{day_int}th")
        month_name = _MONTHS.get(month, month)
        return f"{ordinal} {month_name} {year}"
    except Exception:
        return None


NARRATIONS = {
    "en": {
        "00-thumbnail": (
            "Service bill breakdown. "
            "For {% if bill.vehicle_year %}{{ bill.vehicle_year }} {% endif %}"
            "{{ bill.manufacturer_name }} {{ bill.vehicle_name }}"
            "{% if bill.fuel_type %}, {{ bill.fuel_type | capitalize }}{% endif %}. "
            "{% if bill.odometer_km %}"
            "At about {{ (bill.odometer_km / 1000) | round | int }} thousand kilometers. "
            "{% endif %}"
            "Let's inspect this one."
        ),
        "01-bill-overview": (
            "This is a {{ bill.service_type_label | lower }}"
            "{% if bill.is_authorized %} at an authorized center{% endif %}. "
            "The total comes to {{ bill.total_spoken }}. "
            "{{ bill.item_count }} items on the bill — "
            "{{ bill.essential_count }} essential"
            "{% if bill.upsell_count + bill.grey_area_count > 0 %}"
            ", {{ bill.upsell_count + bill.grey_area_count }} to review"
            "{% endif %}. "
            "Let's go through it."
        ),
        "02-essential": (
            "{{ bill.parts_count }} parts were replaced, "
            "costing {{ bill.parts_spoken }}. "
            "Standard parts for this service type."
        ),
        "03-optional": (
            "{% if bill.upsell_count > 1 %}"
            "{{ bill.upsell_count }} items were not part of the standard service, totaling {{ bill.upsell_spoken }}. "
            "These can be skipped at the next service."
            "{% elif bill.upsell_count == 1 %}"
            "{{ bill.top_upsells[0].name }} at {{ bill.top_upsells[0].price_display }} — "
            "inspect first, can be delayed if not urgent."
            "{% endif %}"
            "{% if bill.grey_area_count > 0 %} "
            "{{ bill.grey_area_count }} more item{{ 's' if bill.grey_area_count > 1 else '' }} "
            "like {% for g in bill.grey_area_items[:2] %}{{ g.name }}{{ ', ' if not loop.last else '' }}{% endfor %} "
            "— these depend on the actual condition of the vehicle. "
            "Ask the technician to show you the current state before approving."
            "{% endif %}"
            "{% if bill.upsell_count == 0 and bill.grey_area_count == 0 %}"
            "No add-ons on this bill. Everything was part of the standard service."
            "{% endif %}"
        ),
        "04-labor": (
            "Labor charges came to {{ bill.labor_spoken }}, "
            "{{ bill.labor_pct }} percent of the total."
        ),
        "05-takeaway": (
            "{% for tip in bill.tips %}"
            "{{ tip.rstrip('.') }}. "
            "{% endfor %}"
            "Save this for your next service visit. "
            "Follow BikeNCars for more service bill breakdowns."
        ),
    },
    "hi": {
        "00-thumbnail": (
            "Service bill breakdown. "
            "{% if bill.vehicle_year %}{{ bill.vehicle_year }} {% endif %}"
            "{{ bill.manufacturer_name }} {{ bill.vehicle_name }}"
            "{% if bill.fuel_type %}, {{ bill.fuel_type | capitalize }}{% endif %} ke liye. "
            "{% if bill.odometer_km %}"
            "Kareeb {{ (bill.odometer_km / 1000) | round | int }} hazaar kilometer chali hui. "
            "{% endif %}"
            "Chaliye inspect karte hain."
        ),
        "01-bill-overview": (
            "Yeh ek {{ bill.service_type_label | lower }} hai"
            "{% if bill.is_authorized %}, authorized center pe{% endif %}. "
            "Total bill {{ bill.total_spoken_hi }}. "
            "{{ bill.item_count }} items hain bill pe — "
            "{{ bill.essential_count }} zaruri"
            "{% if bill.upsell_count + bill.grey_area_count > 0 %}"
            ", {{ bill.upsell_count + bill.grey_area_count }} review karne wale"
            "{% endif %}. "
            "Poora breakdown dekhte hain."
        ),
        "02-essential": (
            "{{ bill.parts_count }} parts badalay gaye, "
            "jinki cost {{ bill.parts_spoken_hi }} hai. "
            "Is service ke liye standard parts."
        ),
        "03-optional": (
            "{% if bill.upsell_count > 1 %}"
            "{{ bill.upsell_count }} items standard service ka hissa nahi the, total {{ bill.upsell_spoken_hi }}. "
            "Agle baar skip ho sakte hain."
            "{% elif bill.upsell_count == 1 %}"
            "{{ bill.top_upsells[0].name }}, {{ bill.top_upsells[0].price_display }} — "
            "pehle check karein, zaruri na ho toh delay kar sakte hain."
            "{% endif %}"
            "{% if bill.grey_area_count > 0 %} "
            "{{ bill.grey_area_count }} aur item{{ 's' if bill.grey_area_count > 1 else '' }} "
            "jaise {% for g in bill.grey_area_items[:2] %}{{ g.name }}{{ ', ' if not loop.last else '' }}{% endfor %} "
            "— yeh gaadi ki actual condition pe depend karta hai. "
            "Technician se pehle current haalat dikhwaayein, phir approve karein."
            "{% endif %}"
            "{% if bill.upsell_count == 0 and bill.grey_area_count == 0 %}"
            "Koi extra item nahi. Sab standard service ka hissa tha."
            "{% endif %}"
        ),
        "04-labor": (
            "Labor ka kharcha {{ bill.labor_spoken_hi }} aaya, "
            "yani total bill ka kareeb {{ bill.labor_pct }} percent."
        ),
        "05-takeaway": (
            "{% for tip in bill.tips_hi or bill.tips %}"
            "{{ tip.rstrip('.') }}. "
            "{% endfor %}"
            "Agle service ke liye save karein. "
            "Aur service bill breakdowns ke liye BikeNCars follow karein."
        ),
    },
    "te": {
        "00-thumbnail": (
            "Service bill breakdown. "
            "{% if bill.vehicle_year %}{{ bill.vehicle_year }} {% endif %}"
            "{{ bill.manufacturer_name }} {{ bill.vehicle_name }}"
            "{% if bill.fuel_type %}, {{ bill.fuel_type | capitalize }}{% endif %} కోసం. "
            "{% if bill.odometer_km %}"
            "దాదాపు {{ (bill.odometer_km / 1000) | round | int }} వేల కిలోమీటర్లు నడిచింది. "
            "{% endif %}"
            "ఇది inspect చేద్దాం."
        ),
        "01-bill-overview": (
            "ఇది ఒక {{ bill.service_type_label | lower }}"
            "{% if bill.is_authorized %}, authorized center లో{% endif %}. "
            "మొత్తం బిల్లు {{ bill.total_spoken }}. "
            "బిల్లులో {{ bill.item_count }} items ఉన్నాయి — "
            "{{ bill.essential_count }} అవసరం, {{ bill.upsell_count }} optional. "
            "పూర్తి breakdown చూద్దాం."
        ),
        "02-essential": (
            "ఈ వాహనానికి {{ bill.essential_count }} items అవసరమయ్యాయి, "
            "మొత్తం {{ bill.essential_spoken }}. "
            "ఈ service type కి standard maintenance."
        ),
        "03-optional": (
            "{% if bill.upsell_count > 1 %}"
            "{{ bill.upsell_count }} items standard service లో భాగం కాదు, మొత్తం {{ bill.upsell_spoken }}. "
            "తదుపరి సర్వీస్‌లో skip చేయవచ్చు."
            "{% elif bill.upsell_count == 1 %}"
            "{{ bill.top_upsells[0].name }}, {{ bill.top_upsells[0].price_display }} — "
            "ముందు check చేయండి, urgent కాకపోతే delay చేయవచ్చు."
            "{% endif %}"
            "{% if bill.grey_area_count > 0 %} "
            "{{ bill.grey_area_count }} మరిన్ని item{{ 's' if bill.grey_area_count > 1 else '' }} "
            "అంటే {% for g in bill.grey_area_items[:2] %}{{ g.name }}{{ ', ' if not loop.last else '' }}{% endfor %} "
            "— ఇవి వాహనం actual condition పై ఆధారపడతాయి. "
            "Approve చేయడానికి ముందు technician ని current state చూపించమని అడగండి."
            "{% endif %}"
            "{% if bill.upsell_count == 0 and bill.grey_area_count == 0 %}"
            "ఈ బిల్లులో add-ons లేవు. అంతా standard service లో భాగమే."
            "{% endif %}"
        ),
        "04-labor": (
            "Labor charges {{ bill.labor_spoken }} వచ్చాయి, "
            "మొత్తంలో దాదాపు {{ bill.labor_pct }} percent. "
            "{% if bill.labor_pct > 55 %}"
            "ఇది కొంచెం ఎక్కువ. రెండో quote తీసుకోవడం మంచిది."
            "{% elif bill.labor_pct > 35 %}"
            "ఈ రకమైన service కి సరైనది."
            "{% else %}"
            "చాలా తక్కువ. ఎక్కువ డబ్బు parts మరియు consumables కి వెళ్ళింది."
            "{% endif %}"
        ),
        "05-takeaway": (
            "{% for tip in bill.tips %}"
            "{{ tip.rstrip('.') }}. "
            "{% endfor %}"
            "తదుపరి service visit కోసం save చేసుకోండి. "
            "మరిన్ని service bill breakdowns కోసం BikeNCars follow చేయండి."
        ),
    },
}
