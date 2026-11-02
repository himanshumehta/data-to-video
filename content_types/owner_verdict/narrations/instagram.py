"""
Owner Verdict narrations for Instagram Posts (portrait 4:5).
9 slides. Target 5–8s per slide at 1.2x TTS speed.

Each slide has a UNIQUE angle — no two slides repeat the same message.
Use {{ vehicle.spoken_name }} for TTS-safe model name.
"""

NARRATIONS = {
    "en": {
        "00-hook": (
            "Should you buy the {{ vehicle.brand_name }} {{ vehicle.spoken_name or vehicle.short_name }}? "
            "{% if vehicle.total_reviews %}"
            "We analysed {{ vehicle.total_reviews_display }} owner reviews. "
            "{% else %}"
            "We analysed hundreds of owner reviews. "
            "{% endif %}"
            "Here is what they love, what they hate, and whether they would buy it again."
        ),

        "01-rating-overview": (
            "{% if vehicle.overall_rating %}"
            "Overall owner rating: {{ vehicle.overall_rating_display }}. "
            "{{ vehicle.rating_label }}. "
            "{% endif %}"
            "{% if vehicle.total_reviews %}"
            "Based on {{ vehicle.total_reviews_display }} real owner reviews. "
            "{% endif %}"
            "Here is what drives that score."
        ),

        "02-what-owners-love": (
            "What owners love most. "
            "{% if vehicle.praise_1 %}"
            "Number one: {{ vehicle.praise_1 }}. "
            "{% endif %}"
            "{% if vehicle.praise_2 %}"
            "Number two: {{ vehicle.praise_2 }}. "
            "{% endif %}"
            "{% if vehicle.praise_3 %}"
            "And number three: {{ vehicle.praise_3 }}. "
            "{% endif %}"
        ),

        "03-top-complaints": (
            "Now the complaints. "
            "{% if vehicle.complaint_1 %}"
            "The biggest issue: {{ vehicle.complaint_1 }}. "
            "{% endif %}"
            "{% if vehicle.complaint_2 %}"
            "Also reported: {{ vehicle.complaint_2 }}. "
            "{% endif %}"
            "{% if vehicle.complaint_3 %}"
            "And: {{ vehicle.complaint_3 }}. "
            "{% endif %}"
        ),

        "04-owner-profile": (
            "Who buys this? "
            "{% if vehicle.use_case_1 %}"
            "Most common use: {{ vehicle.use_case_1 }}. "
            "{% endif %}"
            "{% if vehicle.use_case_2 %}"
            "Also popular for: {{ vehicle.use_case_2 }}. "
            "{% endif %}"
        ),

        "05-sentiment-split": (
            "{% if vehicle.positive_pct %}"
            "{{ vehicle.positive_pct }} percent positive. "
            "{{ vehicle.neutral_pct }} percent neutral. "
            "{{ vehicle.negative_pct }} percent negative. "
            "{% endif %}"
            "{% if vehicle.recommend_pct %}"
            "And {{ vehicle.recommend_pct_display }} would recommend this to a friend. "
            "{% endif %}"
        ),

        "06-deal-breakers": (
            "{% if vehicle.deal_breaker_1 %}"
            "Deal breakers you should know. "
            "{{ vehicle.deal_breaker_1 }}. "
            "{% if vehicle.deal_breaker_2 %}"
            "{{ vehicle.deal_breaker_2 }}. "
            "{% endif %}"
            "{% elif vehicle.top_issues %}"
            "Known issues to watch for. "
            "{{ vehicle.top_issues[0].title }}. "
            "{% if vehicle.top_issues[0].fix_cost %}"
            "Fix costs around {{ vehicle.top_issues[0].fix_cost }}. "
            "{% endif %}"
            "{% else %}"
            "No major deal breakers reported by owners so far. "
            "Always take an extended test ride before buying. "
            "{% endif %}"
        ),

        "07-verdict": (
            "{% if vehicle.verdict_tone == 'positive' %}"
            "The verdict: owners rate the {{ vehicle.spoken_name or vehicle.short_name }} highly. "
            "A solid buy if it fits your needs. "
            "{% elif vehicle.verdict_tone == 'mixed' %}"
            "The verdict: the {{ vehicle.spoken_name or vehicle.short_name }} divides opinion. "
            "Great for some, not for everyone. "
            "{% else %}"
            "The verdict: research carefully before you commit. "
            "{% endif %}"
            "Full owner data at bikencars dot com."
        ),

        "08-end-card": (
            "Save this for when you are deciding. "
            "Follow for more honest owner verdicts."
        ),
    },
}
