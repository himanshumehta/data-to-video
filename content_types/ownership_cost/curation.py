"""
Slide interest scoring for ownership-cost reels, used by scripts/lib/curate.py
when a reel has to be cut to a platform time limit.

Scores run from 0 to 1.5: higher means the slide says something unusual about
this particular vehicle and is worth its seconds.
"""

# Always kept: the context-setting intro, the hook and the end card.
PINNED = ["00-what-you-will-learn", "01-hook", "11-end-card"]

MAX_SCORE = 1.5


def interest_scores(vehicle: dict) -> dict:
    scores = {
        "00-what-you-will-learn": MAX_SCORE,
        "10-review-cta": 0.3,  # lowest value in a short format
        "11-end-card": 0.4,
    }

    # Hook: the bigger the total-cost multiplier, the stronger the shock value.
    scores["01-hook"] = min(MAX_SCORE, vehicle.get("multiplier", 2.0) / 2.0)

    # Annual breakdown: more interesting when fuel dominates the running cost.
    fuel_pct = vehicle.get("fuel_pct", 47)
    scores["02-annual-breakdown"] = 1.0 if fuel_pct > 55 else 0.8 if fuel_pct > 40 else 0.6

    # Service: interesting when it is unusually expensive.
    scores["03-service-deep-dive"] = min(1.3, vehicle.get("annual_service", 15000) / 20000)

    # Year by year: interesting when costs climb steeply from year 1 to year 5.
    years = vehicle.get("first_5_years", [])
    if len(years) >= 5:
        yr1, yr5 = years[0].get("total", 0), years[4].get("total", 0)
        scores["04-year-by-year"] = min(1.3, 0.5 + 2 * (yr5 - yr1) / max(yr1, 1))
    else:
        scores["04-year-by-year"] = 0.5

    # Depreciation: interesting when the first-year loss is large (25% -> 1.0).
    first_year_dep = vehicle.get("first_year_dep", vehicle.get("depreciation_1yr", 25))
    scores["05-depreciation"] = min(MAX_SCORE, first_year_dep / 25)

    # Versus segment: interesting at either end of the cost-per-km ranking.
    rivals = vehicle.get("competitors_ownership", [])
    if rivals:
        own = vehicle.get("cost_per_km", 99)
        ranked = sorted([c.get("cost_per_km", 99) for c in rivals] + [own])
        rank = ranked.index(own) + 1
        scores["07-vs-segment"] = 1.3 if rank <= 2 or rank >= len(ranked) - 1 else 0.7
    else:
        scores["07-vs-segment"] = 0.3

    return scores
