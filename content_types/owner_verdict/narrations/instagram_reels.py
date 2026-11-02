"""
Owner Verdict narrations for Instagram Reels (9:16).
9 slides. Target 7–10s per slide at 1.2x TTS speed = ~90s total.
Fast pacing — hook in slide 1, value in every slide, save-worthy ending.

Each slide has a UNIQUE angle — no two slides repeat the same message.
Use {{ vehicle.spoken_name }} for TTS-safe model name.

Data fields from preprocess_owner_verdict():
  vehicle.overall_rating, vehicle.rating_label, vehicle.total_reviews
  vehicle.praise_1/2/3, vehicle.praise_1_pct/2_pct/3_pct
  vehicle.complaint_1/2/3, vehicle.complaint_1_pct/2_pct/3_pct
  vehicle.positive_pct, vehicle.negative_pct, vehicle.neutral_pct
  vehicle.recommend_pct, vehicle.regret_pct
  vehicle.owner_profile, vehicle.use_case_1/2/3
  vehicle.deal_breaker_1/2/3, vehicle.top_deal_breaker
  vehicle.verdict_tone (positive/mixed/cautious)
"""

import random

# 10 intro variants for A/B testing — all focus on "real owners reviewed" hook.
INTRO_VARIANTS = [
    # 1. Total reviews hook
    (
        "{{ vehicle.brand_name }} {{ vehicle.spoken_name or vehicle.short_name }}. "
        "{% if vehicle.total_reviews %}"
        "{{ vehicle.total_reviews_display }} owners reviewed this. "
        "{% else %}"
        "Hundreds of owners reviewed this. "
        "{% endif %}"
        "Here is their real verdict."
    ),
    # 2. Rating hook
    (
        "{{ vehicle.brand_name }} {{ vehicle.spoken_name or vehicle.short_name }}. "
        "{% if vehicle.overall_rating %}"
        "Rated {{ vehicle.overall_rating_display }} by real owners. "
        "{% else %}"
        "What do real owners actually think? "
        "{% endif %}"
        "Not marketing. Not reviews. The people who ride it every day."
    ),
    # 3. Direct question — SELECTED DEFAULT
    (
        "Should you buy the {{ vehicle.brand_name }} {{ vehicle.spoken_name or vehicle.short_name }}? "
        "{% if vehicle.total_reviews %}"
        "We analysed {{ vehicle.total_reviews_display }} owner reviews. "
        "{% else %}"
        "We analysed hundreds of owner reviews. "
        "{% endif %}"
        "Here is what they love, what they hate, and whether they would buy it again."
    ),
    # 4. Controversy hook
    (
        "{{ vehicle.brand_name }} {{ vehicle.spoken_name or vehicle.short_name }}. "
        "{% if vehicle.positive_pct and vehicle.negative_pct %}"
        "{{ vehicle.positive_pct }} percent love it. {{ vehicle.negative_pct }} percent regret it. "
        "{% else %}"
        "Some owners love it. Others warn you to stay away. "
        "{% endif %}"
        "The full owner verdict in sixty seconds."
    ),
    # 5. Recommend hook
    (
        "{{ vehicle.brand_name }} {{ vehicle.spoken_name or vehicle.short_name }}. "
        "{% if vehicle.recommend_pct %}"
        "{{ vehicle.recommend_pct_display }} of owners would recommend this. "
        "{% else %}"
        "Would owners recommend this to a friend? "
        "{% endif %}"
        "Here is the unfiltered owner verdict."
    ),
    # 6. Before you buy
    (
        "Before you buy the {{ vehicle.brand_name }} {{ vehicle.spoken_name or vehicle.short_name }}, "
        "hear what actual owners say. "
        "The good, the bad, and the deal breakers."
    ),
    # 7. Honest take
    (
        "{{ vehicle.brand_name }} {{ vehicle.spoken_name or vehicle.short_name }}. "
        "No sponsorship. No bias. "
        "Just what real owners say after living with it."
    ),
    # 8. Money question
    (
        "Is the {{ vehicle.brand_name }} {{ vehicle.spoken_name or vehicle.short_name }} worth your money? "
        "{% if vehicle.total_reviews %}"
        "{{ vehicle.total_reviews_display }} owners answered. "
        "{% else %}"
        "Real owners answered. "
        "{% endif %}"
        "Sixty seconds. Full verdict."
    ),
    # 9. Surprise framing
    (
        "{{ vehicle.brand_name }} {{ vehicle.spoken_name or vehicle.short_name }}. "
        "The number one complaint might surprise you. "
        "Real owner data. No fluff."
    ),
    # 10. Community voice
    (
        "What do {{ vehicle.brand_name }} {{ vehicle.spoken_name or vehicle.short_name }} owners "
        "actually say on Reddit, Team BHP, and owner forums? "
        "We read every thread. Here is the verdict."
    ),
]

DEFAULT_INTRO_VARIANT = 2  # "Should you buy..."


def pick_intro(slug: str, variant: int = None) -> str:
    """Pick an intro variant. Uses explicit variant if given, else DEFAULT."""
    if variant is not None:
        return INTRO_VARIANTS[variant % len(INTRO_VARIANTS)]
    return INTRO_VARIANTS[DEFAULT_INTRO_VARIANT]


NARRATIONS = {
    "en": {
        "00-hook": INTRO_VARIANTS[DEFAULT_INTRO_VARIANT],

        # FIX: removed sentiment % (was duplicated with slide 05). Keep rating-focused.
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

        # FIX: trimmed — removed verbatim owner_profile read, use shorter framing.
        "04-owner-profile": (
            "Who buys this? "
            "{% if vehicle.use_case_1 %}"
            "Most common use: {{ vehicle.use_case_1 }}. "
            "{% endif %}"
            "{% if vehicle.use_case_2 %}"
            "Also popular for: {{ vehicle.use_case_2 }}. "
            "{% endif %}"
            "{% if vehicle.use_case_3 %}"
            "And: {{ vehicle.use_case_3 }}. "
            "{% endif %}"
        ),

        # FIX: now the ONLY slide that states sentiment %. No more duplication.
        "05-sentiment-split": (
            "{% if vehicle.positive_pct %}"
            "The full sentiment picture. "
            "{{ vehicle.positive_pct }} percent positive. "
            "{{ vehicle.neutral_pct }} percent neutral. "
            "{{ vehicle.negative_pct }} percent negative. "
            "{% endif %}"
            "{% if vehicle.recommend_pct %}"
            "And {{ vehicle.recommend_pct_display }} would recommend this to a friend. "
            "{% endif %}"
        ),

        # FIX: reads up to 3 top_issues when deal_breakers empty. No more 10-word collapse.
        "06-deal-breakers": (
            "{% if vehicle.deal_breaker_1 %}"
            "Deal breakers you should know. "
            "{{ vehicle.deal_breaker_1 }}. "
            "{% if vehicle.deal_breaker_2 %}"
            "{{ vehicle.deal_breaker_2 }}. "
            "{% endif %}"
            "{% elif vehicle.top_issues and vehicle.top_issues | length >= 2 %}"
            "Known issues to watch for. "
            "First: {{ vehicle.top_issues[0].title }}. "
            "Second: {{ vehicle.top_issues[1].title }}. "
            "{% if vehicle.top_issues | length >= 3 %}"
            "Also reported: {{ vehicle.top_issues[2].title }}. "
            "{% endif %}"
            "{% elif vehicle.top_issues %}"
            "Top reported issue: {{ vehicle.top_issues[0].title }}. "
            "{% else %}"
            "No major deal breakers reported so far. "
            "Always take an extended test ride before buying. "
            "{% endif %}"
        ),

        "07-verdict": (
            "{% if vehicle.verdict_tone == 'positive' %}"
            "The verdict: owners rate the {{ vehicle.spoken_name or vehicle.short_name }} highly. "
            "A solid buy if it fits your needs. "
            "{% elif vehicle.verdict_tone == 'mixed' %}"
            "The verdict: the {{ vehicle.spoken_name or vehicle.short_name }} divides opinion. "
            "Great for some, not for everyone. Know what you are getting into. "
            "{% else %}"
            "The verdict: the {{ vehicle.spoken_name or vehicle.short_name }} has its fans, "
            "but the complaints are hard to ignore. Research carefully before you commit. "
            "{% endif %}"
            "Full owner data at bikencars dot com."
        ),

        "08-end-card": (
            "Save this for when you are deciding. "
            "Follow for more honest owner verdicts."
        ),
    },

    "hi": {
        "00-hook": (
            "{{ vehicle.brand_name }} {{ vehicle.spoken_name or vehicle.short_name }} khareedna chahte hain? "
            "{% if vehicle.total_reviews %}"
            "{{ vehicle.total_reviews_display }} owners ne review diya. "
            "{% else %}"
            "Saikdon owners ne review diya. "
            "{% endif %}"
            "Unka asli verdict yahan hai."
        ),

        # FIX: removed sentiment % duplication
        "01-rating-overview": (
            "{% if vehicle.overall_rating %}"
            "Owner rating: {{ vehicle.overall_rating_display }}. "
            "{{ vehicle.rating_label }}. "
            "{% endif %}"
            "{% if vehicle.total_reviews %}"
            "{{ vehicle.total_reviews_display }} real owner reviews ke basis pe. "
            "{% endif %}"
            "Dekhte hain kyun."
        ),

        "02-what-owners-love": (
            "Owners ko kya pasand hai. "
            "{% if vehicle.praise_1 %}"
            "Sabse pehle: {{ vehicle.praise_1 }}. "
            "{% endif %}"
            "{% if vehicle.praise_2 %}"
            "Doosra: {{ vehicle.praise_2 }}. "
            "{% endif %}"
            "{% if vehicle.praise_3 %}"
            "Teesra: {{ vehicle.praise_3 }}. "
            "{% endif %}"
        ),

        "03-top-complaints": (
            "Ab shikayatein. "
            "{% if vehicle.complaint_1 %}"
            "Sabse badi problem: {{ vehicle.complaint_1 }}. "
            "{% endif %}"
            "{% if vehicle.complaint_2 %}"
            "Yeh bhi: {{ vehicle.complaint_2 }}. "
            "{% endif %}"
            "{% if vehicle.complaint_3 %}"
            "Aur: {{ vehicle.complaint_3 }}. "
            "{% endif %}"
        ),

        # FIX: trimmed + added use_case_2 parity
        "04-owner-profile": (
            "Kaun khareedta hai? "
            "{% if vehicle.use_case_1 %}"
            "Sabse zyada use: {{ vehicle.use_case_1 }}. "
            "{% endif %}"
            "{% if vehicle.use_case_2 %}"
            "Aur: {{ vehicle.use_case_2 }}. "
            "{% endif %}"
        ),

        "05-sentiment-split": (
            "{% if vehicle.positive_pct %}"
            "Poora sentiment picture. "
            "{{ vehicle.positive_pct }} percent khush. "
            "{{ vehicle.neutral_pct }} percent neutral. "
            "{{ vehicle.negative_pct }} percent naaraz. "
            "{% endif %}"
            "{% if vehicle.recommend_pct %}"
            "{{ vehicle.recommend_pct_display }} dost ko recommend karenge. "
            "{% endif %}"
        ),

        # FIX: reads multiple top_issues when deal_breakers empty
        "06-deal-breakers": (
            "{% if vehicle.deal_breaker_1 %}"
            "Deal breakers. "
            "{{ vehicle.deal_breaker_1 }}. "
            "{% if vehicle.deal_breaker_2 %}"
            "{{ vehicle.deal_breaker_2 }}. "
            "{% endif %}"
            "{% elif vehicle.top_issues and vehicle.top_issues | length >= 2 %}"
            "Jaanne wali problems. "
            "Pehli: {{ vehicle.top_issues[0].title }}. "
            "Doosri: {{ vehicle.top_issues[1].title }}. "
            "{% elif vehicle.top_issues %}"
            "Sabse common problem: {{ vehicle.top_issues[0].title }}. "
            "{% else %}"
            "Koi bada deal breaker nahi mila. "
            "Khareedne se pehle test ride zaroor lein. "
            "{% endif %}"
        ),

        "07-verdict": (
            "{% if vehicle.verdict_tone == 'positive' %}"
            "Verdict: owners ka rating achha hai. Sahi choice hai. "
            "{% elif vehicle.verdict_tone == 'mixed' %}"
            "Verdict: kuch ko pasand, kuch ko nahi. Pehle research karein. "
            "{% else %}"
            "Verdict: shikayatein bahut hain. Sochiye phir khareediye. "
            "{% endif %}"
            "Poora data bikencars dot com pe."
        ),

        "08-end-card": (
            "Decide karte waqt ke liye save karein. "
            "Aur owner verdicts ke liye follow karein."
        ),
    },
}
