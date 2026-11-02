"""
number_format.py — INR formatting and speech-friendly number conversion.

Extracted from svg_render.py (fmt_inr_short, fmt_inr_full) and
ownership_narrate.py (_indian_number_to_words, speech_friendly).
Never import * from this module — always use named imports.
"""

import re


def fmt_inr_short(v) -> str:
    """Format number as short INR: 8.1L / 42K style."""
    if v is None:
        return "\u20b9 0"
    v = float(v)
    if v >= 100000:
        return f"\u20b9 {v / 100000:.1f}L"
    if v >= 1000:
        return f"\u20b9 {v / 1000:.0f}K"
    return f"\u20b9 {v:.0f}"


def fmt_inr_full(v) -> str:
    """Indian comma formatting: 1,23,456."""
    if v is None:
        return "\u20b9 0"
    n = int(v)
    neg = n < 0
    n = abs(n)
    s = str(n)
    if len(s) <= 3:
        return f"\u20b9 {'-' if neg else ''}{s}"
    last3 = s[-3:]
    rest = s[:-3]
    parts = []
    while rest:
        parts.append(rest[-2:] if len(rest) >= 2 else rest)
        rest = rest[:-2]
    parts.reverse()
    return f"\u20b9 {'-' if neg else ''}{','.join(parts)},{last3}"


def _indian_number_to_words(num: int) -> str:
    """Convert integer to spoken form that matches fmt_inr_short display.

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


def format_inr(amount) -> str:
    """Format an amount in Indian digit grouping (e.g. 7,71,102)."""
    if not amount:
        return "0"
    amount = int(amount)
    if amount < 0:
        return f"-{format_inr(-amount)}"
    s = str(amount)
    if len(s) <= 3:
        return s
    result = s[-3:]
    s = s[:-3]
    while s:
        result = s[-2:] + "," + result
        s = s[:-2]
    return result
