"""
Owner Verdict data preprocessor.

Normalises the 4 different owner_sentiment schema versions from
vehicle_research_data into a single flat dict for templates and narrations.

Schema variants seen in the source database:
  V1 (string arrays):  top_praises: ["text", ...], top_complaints: ["text", ...]
  V2 (vote-weighted):  pros: [{text, votes}], cons: [{text, votes}]
  V3 (category-based): categories: [{name, positive, negative, neutral, ...}]
  V4 (topic-struct):   top_praises: [{topic, summary, mention_percent}],
                        top_complaints: [{topic, summary, mention_percent}]

Output: flat dict with normalised fields ready for Jinja2 narrations and
Remotion props. All list items are dicts with {text, pct} where pct may be 0
if source data lacks it.

Usage:
    from content_types.owner_verdict.preprocess import preprocess_owner_verdict
    vehicle = preprocess_owner_verdict(raw_vehicle, sentiment_data, extras)
"""
from __future__ import annotations

import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.lib.number_format import format_inr


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _normalise_praise_list(raw: list) -> List[Dict[str, Any]]:
    """Convert any praise/pro format to [{text, pct}].

    pct is only set for actual percentages (0-100). Vote counts (>100) are
    stored separately so narrations don't say "312 percent".
    """
    out = []
    for item in (raw or []):
        if isinstance(item, str):
            out.append({"text": item, "pct": 0})
        elif isinstance(item, dict):
            text = item.get("topic") or item.get("text") or item.get("name") or ""
            # mention_percent is always 0-100; votes can be any number
            pct = item.get("mention_percent") or 0
            if pct == 0:
                votes = item.get("votes") or 0
                # Only treat as percentage if plausibly in 0-100 range
                pct = votes if 0 < votes <= 100 else 0
            out.append({"text": text, "pct": pct})
    return out


def _normalise_complaint_list(raw: list) -> List[Dict[str, Any]]:
    """Convert any complaint/con format to [{text, pct}].

    pct is only set for actual percentages (0-100). Vote counts (>100) are
    stored separately so narrations don't say "312 percent".
    """
    out = []
    for item in (raw or []):
        if isinstance(item, str):
            out.append({"text": item, "pct": 0})
        elif isinstance(item, dict):
            text = item.get("topic") or item.get("text") or item.get("title") or ""
            pct = item.get("mention_percent") or 0
            if pct == 0:
                votes = item.get("votes") or 0
                pct = votes if 0 < votes <= 100 else 0
            out.append({"text": text, "pct": pct})
    return out


def _extract_sentiment_pcts(data: dict) -> Dict[str, int]:
    """Extract positive/neutral/negative percentages from any schema."""
    # Direct pct fields (V3-style: positive_pct, negative_pct, neutral_pct)
    if "positive_pct" in data:
        return {
            "positive": int(data.get("positive_pct", 0)),
            "neutral": int(data.get("neutral_pct", 0)),
            "negative": int(data.get("negative_pct", 0)),
        }
    # Nested sentiment_breakdown (V1/V4)
    sb = data.get("sentiment_breakdown") or {}
    if sb:
        pos = int(sb.get("positive", 0)) + int(sb.get("very_positive", 0))
        neg = int(sb.get("negative", 0)) + int(sb.get("very_negative", 0))
        neu = int(sb.get("neutral", 0))
        total = pos + neg + neu
        if total > 0:
            return {
                "positive": round(pos / total * 100),
                "neutral": round(neu / total * 100),
                "negative": round(neg / total * 100),
            }
    # Category-based (V3): aggregate across categories
    cats = data.get("categories") or []
    if cats:
        pos_sum = sum(c.get("positive", 0) for c in cats)
        neg_sum = sum(c.get("negative", 0) for c in cats)
        neu_sum = sum(c.get("neutral", 0) for c in cats)
        total = pos_sum + neg_sum + neu_sum
        if total > 0:
            return {
                "positive": round(pos_sum / total * 100),
                "neutral": round(neu_sum / total * 100),
                "negative": round(neg_sum / total * 100),
            }
    return {"positive": 0, "neutral": 0, "negative": 0}


def _get_recommend_pct(data: dict) -> Optional[int]:
    """Extract would-recommend percentage from any field variant."""
    for key in ("recommendation_rate", "would_recommend_percent",
                "would_recommend_percentage", "would_recommend_pct",
                "recommend_percentage", "would_buy_again", "would_recommend"):
        val = data.get(key)
        if val is not None:
            return int(val)
    return None


def _get_overall_rating(data: dict) -> Optional[float]:
    """Extract overall rating (0-5 or 0-10 scale, normalised to 0-5)."""
    for key in ("overall_rating", "overall_score", "overall_satisfaction",
                "owner_satisfaction", "satisfaction_level"):
        val = data.get(key)
        if val is not None:
            val = float(val)
            if val > 5:
                val = val / 2  # normalise 10-scale to 5-scale
            return round(val, 1)
    return None


def _get_total_reviews(data: dict) -> Optional[int]:
    """Extract total reviews/ratings analysed."""
    for key in ("total_reviews_analyzed", "total_reviews", "total_ratings",
                "sample_size"):
        val = data.get(key)
        if val is not None and int(val) > 0:
            return int(val)
    return None


def _get_owner_profile(data: dict) -> Optional[str]:
    """Extract typical owner profile."""
    for key in ("typical_owner_profile", "typical_buyer_profile",
                "owner_profile", "owner_demographics"):
        val = data.get(key)
        if val and isinstance(val, str):
            return val
    return None


def _get_use_cases(data: dict) -> List[str]:
    """Extract common use cases."""
    for key in ("common_use_cases", "common_use_case"):
        val = data.get(key)
        if val:
            if isinstance(val, list):
                return val[:4]
            if isinstance(val, str):
                return [val]
    return []


def _get_common_phrases(data: dict) -> List[str]:
    """Extract common owner phrases/keywords."""
    for key in ("common_phrases", "positive_keywords", "positive_themes"):
        val = data.get(key)
        if val and isinstance(val, list):
            return [p for p in val[:5] if isinstance(p, str)]
    return []


def _rating_label(rating: Optional[float]) -> str:
    """Convert numeric rating to human label."""
    if rating is None:
        return "N/A"
    if rating >= 4.5:
        return "Excellent"
    if rating >= 4.0:
        return "Very Good"
    if rating >= 3.5:
        return "Good"
    if rating >= 3.0:
        return "Average"
    if rating >= 2.0:
        return "Below Average"
    return "Poor"


def _star_distribution(data: dict) -> Optional[List[Dict[str, Any]]]:
    """Extract star distribution as [{stars, pct}]."""
    rd = data.get("rating_distribution") or {}
    if not rd:
        return None
    out = []
    for key in ("5_star", "4_star", "3_star", "2_star", "1_star"):
        pct = rd.get(key, 0)
        stars = int(key[0])
        out.append({"stars": stars, "pct": round(float(pct))})
    return out


def _get_regret_pct(data: dict) -> Optional[int]:
    """Extract purchase regret percentage."""
    val = data.get("purchase_regret_pct")
    if val is not None:
        return int(val)
    return None


# ---------------------------------------------------------------------------
# Top-5 issues integration
# ---------------------------------------------------------------------------

def _normalise_issues(issues_data: Any) -> List[Dict[str, Any]]:
    """Normalise top_5_issues research data to [{title, severity, prevalence, fix_cost}]."""
    if not issues_data:
        return []
    # Can be a list directly or a dict with 'issues' key
    items = issues_data
    if isinstance(issues_data, dict):
        items = issues_data.get("issues") or []
    out = []
    for item in (items or [])[:5]:
        if isinstance(item, dict):
            out.append({
                "title": item.get("title") or "",
                "severity": item.get("severity") or "Medium",
                "prevalence": item.get("prevalence") or 0,
                "fix_cost": item.get("fix_cost") or item.get("typical_cost") or "",
            })
    return out


# ---------------------------------------------------------------------------
# Value dashboard deal-breakers
# ---------------------------------------------------------------------------

def _get_deal_breakers(value_data: Any) -> List[str]:
    """Extract deal_breakers from value_dashboard."""
    if not value_data or not isinstance(value_data, dict):
        return []
    return (value_data.get("deal_breakers") or [])[:3]


def _get_who_should_buy(value_data: Any) -> List[str]:
    """Extract who_should_buy from value_dashboard."""
    if not value_data or not isinstance(value_data, dict):
        return []
    return (value_data.get("who_should_buy") or [])[:3]


def _get_who_should_skip(value_data: Any) -> List[str]:
    """Extract who_should_skip from value_dashboard."""
    if not value_data or not isinstance(value_data, dict):
        return []
    return (value_data.get("who_should_skip") or [])[:3]


# ---------------------------------------------------------------------------
# Quality gate
# ---------------------------------------------------------------------------

def is_data_sufficient(sentiment: dict) -> bool:
    """Check if a vehicle has enough owner_sentiment data for content.

    Rejects junk/stub entries (sample_size: 0, one-word complaints).
    """
    if not sentiment or not isinstance(sentiment, dict):
        return False
    # Must have at least some praises or complaints
    praises = (sentiment.get("top_praises") or sentiment.get("top_praise")
               or sentiment.get("pros") or sentiment.get("common_praises")
               or sentiment.get("common_praise") or [])
    complaints = (sentiment.get("top_complaints") or sentiment.get("common_complaints")
                  or sentiment.get("cons") or [])
    if len(praises) < 2 or len(complaints) < 2:
        return False
    # Reject stub entries (single-word items suggest junk data)
    for item in praises[:3]:
        text = item if isinstance(item, str) else (item.get("text") or item.get("topic") or "")
        if len(text.split()) < 2:
            return False
    return True


# ---------------------------------------------------------------------------
# Main preprocessor
# ---------------------------------------------------------------------------

def preprocess_owner_verdict(
    raw: dict,
    sentiment: dict,
    top_5_issues: Any = None,
    value_dashboard: Any = None,
    intro_highlights: Any = None,
) -> dict:
    """Build template-ready vehicle dict for owner-verdict content type.

    Args:
        raw: Base vehicle data (from the vehicle data loader).
        sentiment: owner_sentiment research data (JSONB).
        top_5_issues: top_5_issues research data (JSONB), optional.
        value_dashboard: value_dashboard research data (JSONB), optional.
        intro_highlights: intro_highlights research data (JSONB), optional.

    Returns:
        Flat dict with all fields narrations and slides need.
    """
    price = raw.get("price_ex_showroom", 0)

    # --- Praises (normalised) ---
    raw_praises = (sentiment.get("top_praises") or sentiment.get("top_praise")
                   or sentiment.get("pros") or sentiment.get("common_praises")
                   or sentiment.get("common_praise") or [])
    praises = _normalise_praise_list(raw_praises)

    # --- Complaints (normalised) ---
    raw_complaints = (sentiment.get("top_complaints")
                      or sentiment.get("common_complaints")
                      or sentiment.get("cons") or [])
    complaints = _normalise_complaint_list(raw_complaints)

    # --- Metrics ---
    overall_rating = _get_overall_rating(sentiment)
    total_reviews = _get_total_reviews(sentiment)
    recommend_pct = _get_recommend_pct(sentiment)
    regret_pct = _get_regret_pct(sentiment)
    sentiment_pcts = _extract_sentiment_pcts(sentiment)
    star_dist = _star_distribution(sentiment)
    owner_profile = _get_owner_profile(sentiment)
    use_cases = _get_use_cases(sentiment)
    common_phrases = _get_common_phrases(sentiment)

    # --- Supporting data ---
    issues = _normalise_issues(top_5_issues)
    deal_breakers = _get_deal_breakers(value_dashboard)
    who_should_buy = _get_who_should_buy(value_dashboard)
    who_should_skip = _get_who_should_skip(value_dashboard)

    # --- Intro hook from intro_highlights ---
    opening_hook = ""
    one_line_verdict = ""
    if intro_highlights and isinstance(intro_highlights, dict):
        opening_hook = intro_highlights.get("opening_hook") or ""
        one_line_verdict = intro_highlights.get("one_line_verdict") or ""

    # --- Display values ---
    top3_praises = praises[:3]
    top3_complaints = complaints[:3]
    praise_1 = top3_praises[0]["text"] if len(top3_praises) > 0 else ""
    praise_2 = top3_praises[1]["text"] if len(top3_praises) > 1 else ""
    praise_3 = top3_praises[2]["text"] if len(top3_praises) > 2 else ""
    complaint_1 = top3_complaints[0]["text"] if len(top3_complaints) > 0 else ""
    complaint_2 = top3_complaints[1]["text"] if len(top3_complaints) > 1 else ""
    complaint_3 = top3_complaints[2]["text"] if len(top3_complaints) > 2 else ""

    praise_1_pct = top3_praises[0]["pct"] if len(top3_praises) > 0 else 0
    praise_2_pct = top3_praises[1]["pct"] if len(top3_praises) > 1 else 0
    praise_3_pct = top3_praises[2]["pct"] if len(top3_praises) > 2 else 0
    complaint_1_pct = top3_complaints[0]["pct"] if len(top3_complaints) > 0 else 0
    complaint_2_pct = top3_complaints[1]["pct"] if len(top3_complaints) > 1 else 0
    complaint_3_pct = top3_complaints[2]["pct"] if len(top3_complaints) > 2 else 0

    # Top deal breaker for narration (from issues or value dashboard)
    top_deal_breaker = ""
    if deal_breakers:
        top_deal_breaker = deal_breakers[0]
    elif issues:
        top_deal_breaker = issues[0]["title"]

    # Verdict: simple recommendation text
    if overall_rating and overall_rating >= 4.0:
        verdict_tone = "positive"
    elif overall_rating and overall_rating >= 3.0:
        verdict_tone = "mixed"
    else:
        verdict_tone = "cautious"

    return {
        **raw,
        "brand_name": raw.get("manufacturer_name") or raw.get("brand_name", ""),
        "brand_slug": raw.get("manufacturer_slug") or raw.get("brand_slug", ""),
        "short_name": raw.get("name") or raw.get("short_name", ""),
        "vehicle_type": raw.get("type", "motorcycle"),
        "price_display": format_inr(price),
        "price_formatted": f"₹ {format_inr(price)}",
        # Rating
        "overall_rating": overall_rating,
        "overall_rating_display": f"{overall_rating}/5" if overall_rating else "N/A",
        "rating_label": _rating_label(overall_rating),
        "total_reviews": total_reviews,
        "total_reviews_display": f"{total_reviews:,}" if total_reviews else "N/A",
        "star_distribution": star_dist,
        # Recommendation
        "recommend_pct": recommend_pct,
        "recommend_pct_display": f"{recommend_pct}%" if recommend_pct else None,
        "regret_pct": regret_pct,
        "regret_pct_display": f"{regret_pct}%" if regret_pct else None,
        # Sentiment split
        "positive_pct": sentiment_pcts["positive"],
        "neutral_pct": sentiment_pcts["neutral"],
        "negative_pct": sentiment_pcts["negative"],
        # Praises (normalised)
        "praises": praises,
        "praise_1": praise_1,
        "praise_2": praise_2,
        "praise_3": praise_3,
        "praise_1_pct": praise_1_pct,
        "praise_2_pct": praise_2_pct,
        "praise_3_pct": praise_3_pct,
        # Complaints (normalised)
        "complaints": complaints,
        "complaint_1": complaint_1,
        "complaint_2": complaint_2,
        "complaint_3": complaint_3,
        "complaint_1_pct": complaint_1_pct,
        "complaint_2_pct": complaint_2_pct,
        "complaint_3_pct": complaint_3_pct,
        # Owner profile
        "owner_profile": owner_profile,
        "use_cases": use_cases,
        "use_case_1": use_cases[0] if len(use_cases) > 0 else "",
        "use_case_2": use_cases[1] if len(use_cases) > 1 else "",
        "use_case_3": use_cases[2] if len(use_cases) > 2 else "",
        "common_phrases": common_phrases,
        # Deal breakers & issues
        "deal_breakers": deal_breakers,
        "deal_breaker_1": deal_breakers[0] if len(deal_breakers) > 0 else "",
        "deal_breaker_2": deal_breakers[1] if len(deal_breakers) > 1 else "",
        "deal_breaker_3": deal_breakers[2] if len(deal_breakers) > 2 else "",
        "top_issues": issues,
        "top_deal_breaker": top_deal_breaker,
        "who_should_buy": who_should_buy,
        "who_should_skip": who_should_skip,
        # Intro
        "opening_hook": opening_hook,
        "one_line_verdict": one_line_verdict,
        # Verdict
        "verdict_tone": verdict_tone,
    }
