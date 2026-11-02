"""
Vehicle Review narrations — Instagram portrait (4:5) and Reels (9:16).

Design principles:
  1. First slide opens with the verdict, not a table of contents
  2. Every sentence answers a buying question — no filler
  3. Narrate what's ON SCREEN, not a data dump
  4. Opinionated voice — this is a review, not a spec sheet
  5. Numbers spoken naturally — "forty four horsepower" not "44 HP"
  6. No URLs, no "click link", no "subscribe"

Slide inclusion is DATA-DRIVEN:
  - 00, 01, 07, 08, 09: Always (100% vehicles have specs + rating + pros/cons)
  - 02-safety: Only when safety_features or safety_score exists (~27%)
  - 03-owner-voice: Only when owner_rating + review_count exists (~27%)
  - 04-cost-reality: Only when ownership cost data exists (~15%)
  - 05-known-issues: Only when known_issues array has entries (~27%)
  - 06-head-to-head: Only when comparison_specs + rival exists (~27%)

Narrations use Jinja2 conditionals so templates degrade gracefully.
Slide IDs match remotion.json composition keys.
"""

NARRATIONS = {
    "en": {
        # ── OPENER: Hook with the verdict number ──────────────────────
        "00-score-card": (
            "{{ vehicle.spoken_name or vehicle.short_name }} "
            "by {{ vehicle.brand_name }}. "
            "{{ vehicle.expert_rating }} out of ten. "
            "{% set bd = vehicle.expert_breakdown or {} %}"
            "{% set best = bd | dictsort(by='value', reverse=true) | first %}"
            "{% set worst = bd | dictsort(by='value') | first %}"
            "{% if best and worst %}"
            "{{ best[0] }} carries the score at {{ best[1] }}. "
            "{{ worst[0] }} holds it back at {{ worst[1] }}. "
            "{% endif %}"
            "Here's the full breakdown."
        ),

        # ── EVIDENCE: Performance specs ───────────────────────────────
        "01-performance": (
            "{% if vehicle.engine_cc %}"
            "{{ vehicle.engine_cc }} cc engine. "
            "{% endif %}"
            "{{ vehicle.power_hp }} horsepower. "
            "{{ vehicle.torque_nm }} newton meters. "
            "{% if vehicle.acceleration_0_100 %}"
            "Zero to hundred in {{ vehicle.acceleration_0_100 }} seconds. "
            "{% endif %}"
            "{% if vehicle.top_speed_kmph %}"
            "Top speed {{ vehicle.top_speed_kmph }} kilometers per hour. "
            "{% endif %}"
            "{% if vehicle.power_to_weight %}"
            "{{ vehicle.power_to_weight }} HP per ton. "
            "{% endif %}"
            "{% if vehicle.mileage_kmpl %}"
            "Mileage, {{ vehicle.mileage_kmpl }} kmpl."
            "{% endif %}"
        ),

        # ── EVIDENCE: Safety (only when research exists) ──────────────
        "02-safety": (
            "Safety. "
            "{% if vehicle.safety_score %}"
            "{{ vehicle.safety_score }} out of ten. "
            "{% endif %}"
            "{% if vehicle.safety_features %}"
            "{{ vehicle.safety_features[:4] | join('. ') }}. "
            "{% endif %}"
            "{% if vehicle.traction_control %}"
            "Traction control, yes. "
            "{% elif vehicle.traction_control is not none %}"
            "No traction control. "
            "{% endif %}"
            "{% if vehicle.ncap_body and vehicle.ncap_body != 'Not tested' %}"
            "{{ vehicle.ncap_body }}, {{ vehicle.ncap_rating }} stars."
            "{% else %}"
            "No crash test rating yet."
            "{% endif %}"
        ),

        # ── EVIDENCE: Owner sentiment (only when research exists) ─────
        "03-owner-voice": (
            "{{ vehicle.owner_review_count }} owners. "
            "{{ vehicle.owner_rating }} out of five. "
            "{% if vehicle.rating_distribution %}"
            "{% set top = vehicle.rating_distribution | selectattr('stars', 'ge', 4) | sum(attribute='pct') %}"
            "{{ top }} percent rate it four stars or above. "
            "{% endif %}"
            "{% if vehicle.common_praise %}"
            "Owners love {{ vehicle.common_praise[0] | lower }}. "
            "{% endif %}"
            "{% if vehicle.common_complaints %}"
            "Biggest complaint, {{ vehicle.common_complaints[0] | lower }}."
            "{% endif %}"
        ),

        # ── EVIDENCE: Cost reality (only when ownership data exists) ──
        "04-cost-reality": (
            "{{ vehicle.cost_per_day_display }} a day. "
            "{{ vehicle.monthly_cost_display }} a month. "
            "{% if vehicle.annual_service_display %}"
            "Service costs {{ vehicle.annual_service_display }} a year. "
            "{% endif %}"
            "{% if vehicle.net_5yr_display %}"
            "Five year total, {{ vehicle.net_5yr_display }}."
            "{% endif %}"
        ),

        # ── EVIDENCE: Known issues (only when issues reported) ────────
        "05-known-issues": (
            "{{ vehicle.known_issues | length }} known "
            "{% if vehicle.known_issues | length == 1 %}issue{% else %}issues{% endif %}. "
            "{{ vehicle.known_issues[0] }}. "
            "{% if vehicle.known_issues | length > 1 %}"
            "{{ vehicle.known_issues[1] }}."
            "{% endif %}"
        ),

        # ── EVIDENCE: Head-to-head vs rival (only when comparison exists)
        "06-head-to-head": (
            "{{ vehicle.spoken_name or vehicle.short_name }} "
            "versus {{ vehicle.top_rival_name }}. "
            "{% set wins = vehicle.comparison_specs | selectattr('winner', 'equalto', 'self') | list %}"
            "{% set losses = vehicle.comparison_specs | selectattr('winner', 'equalto', 'rival') | list %}"
            "{{ vehicle.spoken_name or vehicle.short_name }} wins "
            "{{ wins | length }} out of {{ vehicle.comparison_specs | length }}. "
            "{% if wins %}"
            "Ahead on {{ wins | map(attribute='label') | list | join(', ') | lower }}. "
            "{% endif %}"
            "{% if losses %}"
            "{{ vehicle.top_rival_name }} takes {{ losses | map(attribute='label') | list | join(' and ') | lower }}."
            "{% endif %}"
        ),

        # ── SUMMARY: Quick-fire pros and cons ─────────────────────────
        "07-pros-cons": (
            "{% if vehicle.pros %}"
            "{% for p in vehicle.pros[:3] %}"
            "{{ p }}. "
            "{% endfor %}"
            "{% endif %}"
            "{% if vehicle.cons %}"
            "But. "
            "{% for c in vehicle.cons[:3] %}"
            "{{ c }}. "
            "{% endfor %}"
            "{% endif %}"
        ),

        # ── CLOSER: Decisive verdict ─────────────────────────────────
        "08-verdict": (
            "{% if vehicle.expert_rating >= 8.0 %}"
            "Buy. "
            "{% elif vehicle.expert_rating >= 6.5 %}"
            "Consider. "
            "{% else %}"
            "Skip. "
            "{% endif %}"
            "{{ vehicle.expert_rating }} out of ten. "
            "{{ vehicle.expert_verdict }}"
        ),

    },
}
