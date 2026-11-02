"""
curate.py: fit a slide sequence into a platform time limit.

Deterministic (no LLM): every slide gets an interest score from the content
type, slides are ranked by interest per second of narration, and the best ones
are added until the limit is reached. Pinned slides (opener, closer) are always
kept, and the result keeps the original story order.

The scoring is content-type knowledge, so it lives in
content_types/<type>/curation.py; this module only does the packing.
"""

from typing import Dict, List, Optional

DEFAULT_INTEREST = 0.5
HIGH_INTEREST = 1.2
GOOD_INTEREST = 0.8
MIN_SLIDE_SEC = 1.0  # floor so a near-empty clip cannot win on value per second


def curate(
    slide_ids: List[str],
    durations: Dict[str, float],
    interest: Dict[str, float],
    pinned: List[str],
    max_duration: Optional[float],
    default_duration: float = 5.0,
) -> dict:
    """Pick the subset of `slide_ids` that fits `max_duration` seconds.

    Returns {selectedSlides, excludedSlides, totalDuration, headroom, maxDuration, reasoning}.
    `max_duration=None` means no limit: every slide is kept.
    """
    def dur(sid: str) -> float:
        return durations.get(sid, default_duration)

    if max_duration is None:
        total = sum(dur(s) for s in slide_ids)
        return {
            "maxDuration": None,
            "selectedSlides": list(slide_ids),
            "excludedSlides": [],
            "totalDuration": round(total, 1),
            "headroom": None,
            "reasoning": {s: "No time limit" for s in slide_ids},
        }

    selected = [s for s in pinned if s in slide_ids]
    reasoning = {s: "Pinned: opener or closer" for s in selected}
    current = sum(dur(s) for s in selected)

    value_per_sec = {s: interest.get(s, DEFAULT_INTEREST) / max(dur(s), MIN_SLIDE_SEC) for s in slide_ids}
    for sid in sorted((s for s in slide_ids if s not in selected), key=value_per_sec.get, reverse=True):
        if current + dur(sid) > max_duration:
            continue
        selected.append(sid)
        current += dur(sid)
        score = interest.get(sid, DEFAULT_INTEREST)
        if score >= HIGH_INTEREST:
            reasoning[sid] = f"High interest ({score:.1f}) for this vehicle"
        elif score >= GOOD_INTEREST:
            reasoning[sid] = f"Good value ({score:.1f}) for {dur(sid):.0f}s"
        else:
            reasoning[sid] = f"Fills remaining headroom ({dur(sid):.0f}s)"

    selected.sort(key=slide_ids.index)
    excluded = [s for s in slide_ids if s not in selected]
    for sid in excluded:
        reasoning[sid] = (f"Cut: interest {interest.get(sid, DEFAULT_INTEREST):.1f}, "
                          f"{dur(sid):.0f}s would exceed the {max_duration:g}s limit")

    return {
        "maxDuration": max_duration,
        "selectedSlides": selected,
        "excludedSlides": excluded,
        "totalDuration": round(current, 1),
        "headroom": round(max_duration - current, 1),
        "reasoning": reasoning,
    }
