"""Assembly config for service-bill-insight Instagram Reels."""

SLIDE_ORDER = [
    "00-thumbnail",
    "01-bill-overview",
    "02-essential",
    "03-optional",
    "04-labor",
    "05-takeaway",
]

SLIDE_SHORT = {
    "00-thumbnail": "00",
    "01-bill-overview": "01",
    "02-essential": "02",
    "03-optional": "03",
    "04-labor": "04",
    "05-takeaway": "05",
}

CHAPTER_LABELS = {
    "en": {
        "00-thumbnail": "Intro",
        "01-bill-overview": "Bill Overview",
        "02-essential": "Items Breakdown",
        "03-optional": "Optional Add-ons",
        "04-labor": "Labor Charges",
        "05-takeaway": "Takeaways",
    },
    "hi": {
        "00-thumbnail": "Intro",
        "01-bill-overview": "Bill Overview",
        "02-essential": "Items Breakdown",
        "03-optional": "Optional Add-ons",
        "04-labor": "Labor Charges",
        "05-takeaway": "Takeaways",
    },
}

DESCRIPTION_TEMPLATES = {
    "en": (
        "{brand} {name} — Service Bill Breakdown\n\n"
        "We inspected a real {service_type} bill line by line.\n"
        "Total: {total} | Essential: {essential} | Optional: {optional}\n"
        "{odometer_line}"
        "\n#ServiceBill #BikeNCars #OwnershipCost #{brand_tag}"
    ),
    "hi": (
        "{brand} {name} — Service Bill Breakdown\n\n"
        "Humne ek asli {service_type} bill har line item check kiya.\n"
        "Total: {total} | Essential: {essential} | Optional: {optional}\n"
        "{odometer_line}"
        "\n#ServiceBill #BikeNCars #OwnershipCost #{brand_tag}"
    ),
}
