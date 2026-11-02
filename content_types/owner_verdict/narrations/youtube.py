"""
Owner Verdict narrations for YouTube (landscape 16:9).
9 slides. Target 20–40s per slide for long-form (~3-5 min total).
Deeper narration than reels — explain the data, add context.

Each slide has a UNIQUE angle — no two slides repeat the same message.
Use {{ vehicle.spoken_name }} for TTS-safe model name.
"""

NARRATIONS = {
    "en": {
        "00-hook": (
            "{{ vehicle.brand_name }} {{ vehicle.spoken_name or vehicle.short_name }}. "
            "{% if vehicle.total_reviews %}"
            "We went through {{ vehicle.total_reviews_display }} owner reviews "
            "across Reddit, Team BHP, Google reviews, and every owner forum we could find. "
            "{% else %}"
            "We went through hundreds of owner reviews "
            "across Reddit, Team BHP, Google reviews, and every owner forum we could find. "
            "{% endif %}"
            "Not paid reviewers. Not influencers. Real people who bought this with their own money. "
            "Here is what they actually think."
        ),

        "01-rating-overview": (
            "{% if vehicle.overall_rating %}"
            "The overall owner satisfaction rating comes to {{ vehicle.overall_rating_display }}. "
            "That puts it in the {{ vehicle.rating_label }} category. "
            "{% endif %}"
            "{% if vehicle.total_reviews %}"
            "This is based on {{ vehicle.total_reviews_display }} real owner reviews "
            "from Reddit, Team BHP, Google, and owner forums. "
            "{% endif %}"
            "Let us dig into what is driving that score."
        ),

        "02-what-owners-love": (
            "Starting with what owners genuinely love about this. "
            "{% if vehicle.praise_1 %}"
            "The most mentioned positive: {{ vehicle.praise_1 }}. "
            "{% if vehicle.praise_1_pct %}"
            "{{ vehicle.praise_1_pct }} percent of owners brought this up. "
            "{% endif %}"
            "{% endif %}"
            "{% if vehicle.praise_2 %}"
            "Coming in second: {{ vehicle.praise_2 }}. "
            "{% if vehicle.praise_2_pct %}"
            "Mentioned by {{ vehicle.praise_2_pct }} percent. "
            "{% endif %}"
            "{% endif %}"
            "{% if vehicle.praise_3 %}"
            "And third: {{ vehicle.praise_3 }}. "
            "{% if vehicle.praise_3_pct %}"
            "{{ vehicle.praise_3_pct }} percent of reviewers highlighted this. "
            "{% endif %}"
            "{% endif %}"
            "These are not marketing claims. These are patterns across real ownership experiences."
        ),

        "03-top-complaints": (
            "Now the complaints. Every vehicle has them, and being honest about them "
            "is the whole point of this video. "
            "{% if vehicle.complaint_1 %}"
            "The number one complaint: {{ vehicle.complaint_1 }}. "
            "{% if vehicle.complaint_1_pct %}"
            "{{ vehicle.complaint_1_pct }} percent of owners reported this. "
            "{% endif %}"
            "{% endif %}"
            "{% if vehicle.complaint_2 %}"
            "The second most common: {{ vehicle.complaint_2 }}. "
            "{% if vehicle.complaint_2_pct %}"
            "Mentioned by {{ vehicle.complaint_2_pct }} percent. "
            "{% endif %}"
            "{% endif %}"
            "{% if vehicle.complaint_3 %}"
            "And third: {{ vehicle.complaint_3 }}. "
            "{% endif %}"
        ),

        "04-owner-profile": (
            "So who actually buys this? "
            "{% if vehicle.owner_profile %}"
            "The typical buyer: {{ vehicle.owner_profile }}. "
            "{% endif %}"
            "{% if vehicle.use_case_1 %}"
            "The most common use case: {{ vehicle.use_case_1 }}. "
            "{% endif %}"
            "{% if vehicle.use_case_2 %}"
            "Also popular for: {{ vehicle.use_case_2 }}. "
            "{% endif %}"
            "{% if vehicle.use_case_3 %}"
            "And some owners use it for: {{ vehicle.use_case_3 }}. "
            "{% endif %}"
            "If your use case matches, the ownership experience tends to be much better."
        ),

        "05-sentiment-split": (
            "Let us look at the full sentiment picture. "
            "{% if vehicle.positive_pct %}"
            "{{ vehicle.positive_pct }} percent positive. "
            "{{ vehicle.neutral_pct }} percent neutral. "
            "{{ vehicle.negative_pct }} percent negative. "
            "{% endif %}"
            "{% if vehicle.recommend_pct %}"
            "When asked if they would buy it again or recommend it to a friend, "
            "{{ vehicle.recommend_pct_display }} said yes. "
            "{% endif %}"
            "{% if vehicle.regret_pct %}"
            "On the flip side, {{ vehicle.regret_pct_display }} expressed some form of purchase regret. "
            "{% endif %}"
        ),

        "06-deal-breakers": (
            "Now the deal breakers. These are not minor complaints. "
            "These are reasons to seriously reconsider. "
            "{% if vehicle.deal_breaker_1 %}"
            "First: {{ vehicle.deal_breaker_1 }}. "
            "{% if vehicle.deal_breaker_2 %}"
            "Second: {{ vehicle.deal_breaker_2 }}. "
            "{% endif %}"
            "{% if vehicle.deal_breaker_3 %}"
            "And: {{ vehicle.deal_breaker_3 }}. "
            "{% endif %}"
            "{% elif vehicle.top_issues and vehicle.top_issues | length >= 2 %}"
            "The most reported issue: {{ vehicle.top_issues[0].title }}. "
            "Second most reported: {{ vehicle.top_issues[1].title }}. "
            "{% if vehicle.top_issues | length >= 3 %}"
            "Also watch for: {{ vehicle.top_issues[2].title }}. "
            "{% endif %}"
            "{% elif vehicle.top_issues %}"
            "The most reported issue: {{ vehicle.top_issues[0].title }}. "
            "{% else %}"
            "No major deal breakers flagged by owners so far. "
            "{% endif %}"
        ),

        "07-verdict": (
            "{% if vehicle.verdict_tone == 'positive' %}"
            "So the final verdict. Owners rate the {{ vehicle.spoken_name or vehicle.short_name }} "
            "highly, and the data backs it up. The positives significantly outweigh the negatives. "
            "If it fits your use case, this is a solid buy. "
            "{% elif vehicle.verdict_tone == 'mixed' %}"
            "The final verdict. The {{ vehicle.spoken_name or vehicle.short_name }} genuinely divides opinion. "
            "Some owners absolutely love it. Others have real frustrations. "
            "The key is whether the specific complaints apply to your use case. "
            "If they do not, it is a great buy. If they do, look at the alternatives. "
            "{% else %}"
            "The final verdict. The {{ vehicle.spoken_name or vehicle.short_name }} has a loyal fan base, "
            "but the volume of complaints is hard to ignore. "
            "If you are considering this, do thorough research, "
            "take an extended test ride, and talk to owners in your city. "
            "{% endif %}"
            "Full owner data with interactive filters at bikencars dot com."
        ),

        "08-end-card": (
            "That is the complete owner verdict for the "
            "{{ vehicle.brand_name }} {{ vehicle.spoken_name or vehicle.short_name }}. "
            "If this helped your decision, hit subscribe. "
            "We do this for every major vehicle in India. "
            "Comment which vehicle you want next."
        ),
    },

    "hi": {
        "00-hook": (
            "{{ vehicle.brand_name }} {{ vehicle.spoken_name or vehicle.short_name }}. "
            "{% if vehicle.total_reviews %}"
            "Humne {{ vehicle.total_reviews_display }} owner reviews padhe, "
            "Reddit, Team BHP, Google reviews, aur har owner forum se. "
            "{% else %}"
            "Humne saikdon owner reviews padhe, "
            "Reddit, Team BHP, Google reviews, aur har owner forum se. "
            "{% endif %}"
            "Paid reviewers nahi. Influencers nahi. Asli log jinohne apne paise se khareeda. "
            "Unka asli opinion yahan hai."
        ),

        "01-rating-overview": (
            "{% if vehicle.overall_rating %}"
            "Owner satisfaction rating: {{ vehicle.overall_rating_display }}. "
            "{{ vehicle.rating_label }} category mein aata hai. "
            "{% endif %}"
            "{% if vehicle.total_reviews %}"
            "{{ vehicle.total_reviews_display }} real owner reviews ke basis pe. "
            "{% endif %}"
            "Dekhte hain in numbers ke peeche kya hai."
        ),

        "02-what-owners-love": (
            "Pehle dekhte hain owners ko kya pasand hai. "
            "{% if vehicle.praise_1 %}"
            "Sabse zyada mention: {{ vehicle.praise_1 }}. "
            "{% endif %}"
            "{% if vehicle.praise_2 %}"
            "Doosra: {{ vehicle.praise_2 }}. "
            "{% endif %}"
            "{% if vehicle.praise_3 %}"
            "Teesra: {{ vehicle.praise_3 }}. "
            "{% endif %}"
        ),

        "03-top-complaints": (
            "Ab shikayatein. Har gaadi mein hoti hain. "
            "{% if vehicle.complaint_1 %}"
            "Number one complaint: {{ vehicle.complaint_1 }}. "
            "{% endif %}"
            "{% if vehicle.complaint_2 %}"
            "Doosri: {{ vehicle.complaint_2 }}. "
            "{% endif %}"
            "{% if vehicle.complaint_3 %}"
            "Teesri: {{ vehicle.complaint_3 }}. "
            "{% endif %}"
        ),

        "04-owner-profile": (
            "Yeh kaun khareedta hai? "
            "{% if vehicle.owner_profile %}"
            "Typical buyer: {{ vehicle.owner_profile }}. "
            "{% endif %}"
            "{% if vehicle.use_case_1 %}"
            "Sabse common use: {{ vehicle.use_case_1 }}. "
            "{% endif %}"
            "{% if vehicle.use_case_2 %}"
            "Aur: {{ vehicle.use_case_2 }}. "
            "{% endif %}"
        ),

        "05-sentiment-split": (
            "{% if vehicle.positive_pct %}"
            "Poora sentiment picture. "
            "{{ vehicle.positive_pct }} percent positive. "
            "{{ vehicle.neutral_pct }} percent neutral. "
            "{{ vehicle.negative_pct }} percent negative. "
            "{% endif %}"
            "{% if vehicle.recommend_pct %}"
            "{{ vehicle.recommend_pct_display }} dost ko recommend karenge. "
            "{% endif %}"
        ),

        "06-deal-breakers": (
            "Ab deal breakers. Yeh chhoti shikayatein nahi hain. "
            "{% if vehicle.deal_breaker_1 %}"
            "Pehla: {{ vehicle.deal_breaker_1 }}. "
            "{% if vehicle.deal_breaker_2 %}"
            "Doosra: {{ vehicle.deal_breaker_2 }}. "
            "{% endif %}"
            "{% elif vehicle.top_issues and vehicle.top_issues | length >= 2 %}"
            "Pehli problem: {{ vehicle.top_issues[0].title }}. "
            "Doosri: {{ vehicle.top_issues[1].title }}. "
            "{% elif vehicle.top_issues %}"
            "Sabse common problem: {{ vehicle.top_issues[0].title }}. "
            "{% else %}"
            "Koi bada deal breaker nahi mila abhi tak. "
            "{% endif %}"
        ),

        "07-verdict": (
            "{% if vehicle.verdict_tone == 'positive' %}"
            "Final verdict. Owners ka rating achha hai. Positives negatives se kahin zyada hain. "
            "Agar aapke use case mein fit hota hai, toh sahi choice hai. "
            "{% elif vehicle.verdict_tone == 'mixed' %}"
            "Final verdict. Yeh gaadi opinion divide karti hai. "
            "Kuch owners ko bahut pasand, kuch ko frustration. "
            "Aapke use case pe depend karta hai. "
            "{% else %}"
            "Final verdict. Fan base hai, lekin shikayatein zyada hain. "
            "Khareedne se pehle thorough research karein. "
            "{% endif %}"
            "Poora owner data bikencars dot com pe."
        ),

        "08-end-card": (
            "Yeh tha {{ vehicle.brand_name }} {{ vehicle.spoken_name or vehicle.short_name }} "
            "ka complete owner verdict. "
            "Helpful laga toh subscribe zaroor karein. "
            "Comment mein batayein agle video mein kaun si gaadi chaahiye."
        ),
    },
}
