"""
number_format.py: turn rendered rupee figures into what the narrator should say.
"""

import re


def _indian_number_to_words(num: int) -> str:
    """Convert integer to spoken form that matches the short figure on the slide.

    Mirrors the screen's rounding exactly so narration says the same number shown:
      ≥ 1 lakh  → "X.x lakh"   (matches ₹X.xL on screen)
      ≥ 1K      → "about X thousand"  (matches ₹XK on screen)
      < 1K      → exact digits

    e.g. 7,55,084 → "7.6 lakh"   (screen shows ₹7.6L)
         2,99,888 → "3 lakh"      (screen shows ₹3.0L)
         89,685   → "about 90 thousand"  (screen shows ₹90K)
    """
    if num < 1000:
        return str(num)
    if num >= 100000:
        lakh_val = round(num / 100000, 1)
        if lakh_val == int(lakh_val):
            return f"{int(lakh_val)} lakh"
        return f"{lakh_val:.1f} lakh"
    k_val = round(num / 1000)
    return f"about {k_val} thousand"


def speech_friendly(text: str) -> str:
    """Make rendered narration more TTS-friendly."""
    text = text.replace("₹", "rupees ")
    text = text.replace("×", "times")
    # Speed units first (before generic km replacement)
    text = re.sub(r'\bkmph\b', 'kilometers per hour', text, flags=re.IGNORECASE)
    text = re.sub(r'\bkm/h\b', 'kilometers per hour', text, flags=re.IGNORECASE)
    # KM/Km/km → Kilometer (case-insensitive, whole word only)
    text = re.sub(r'\bkm\b', 'Kilometer', text, flags=re.IGNORECASE)
    # Convert Indian-formatted numbers (e.g. 2,99,888) to spoken form
    # Pattern: 1-2 digits, optional groups of ,XX, ending with ,XXX
    def _convert(m):
        return _indian_number_to_words(int(m.group(0).replace(",", "")))
    text = re.sub(r'(?<![\d,])\d{1,2}(?:,\d{2})*,\d{3}(?!\d)', _convert, text)
    # Clean up double spaces from replacements
    while "  " in text:
        text = text.replace("  ", " ")
    return text.strip()


# Model numbers as a narrator says them ("Classic 350" -> "Classic three fifty").
_SPOKEN_MODEL_NUMBERS = {
    "110": "one ten", "125": "one twenty five", "150": "one fifty",
    "160": "one sixty", "180": "one eighty", "200": "two hundred",
    "250": "two fifty", "300": "three hundred", "310": "three ten",
    "350": "three fifty", "390": "three ninety", "400": "four hundred",
    "450": "four fifty", "457": "four fifty seven", "500": "five hundred",
    "650": "six fifty", "660": "six sixty", "750": "seven fifty",
    "790": "seven ninety", "1290": "twelve ninety", "1390": "thirteen ninety",
}


def spoken_model_name(short_name: str) -> str:
    """Replace known model numbers with their spoken form; other words are kept."""
    return " ".join(_SPOKEN_MODEL_NUMBERS.get(w, w) for w in short_name.split())
