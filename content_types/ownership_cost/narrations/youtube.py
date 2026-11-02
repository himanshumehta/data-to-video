"""
Ownership Cost narrations for YouTube.
Long-form detailed narrations, 12 slides, en/hi/mr/te.
Template syntax: Jinja2 — {{ vehicle.field_name }}
"""

NARRATIONS = {
    "en": {
        "00-what-you-will-learn": (
            "Here's what you'll know by the end of this video. "
            "The total cost of owning the {{ vehicle.brand_name }} {{ vehicle.short_name }} "
            "over 5 and 10 years. "
            "Every cost broken down — fuel, service, insurance, and tyres. "
            "When your costs spike, and how to plan ahead. "
            "Exactly how fast it loses resale value, and when to sell. "
            "How it stacks against every rival in the segment. "
            "And how you can calculate your exact personal ownership cost, "
            "using our interactive calculator at bike-and-cars dot com."
        ),
        "thumbnail": (
            "The {{ vehicle.brand_name }} {{ vehicle.short_name }}. "
            "{{ vehicle.price_formatted }} to buy. "
            "But here's what it really costs to own."
        ),
        "02-intro-hook": (
            "The {{ vehicle.brand_name }} {{ vehicle.short_name }} costs "
            "{{ vehicle.price_formatted }} to buy. "
            "But buying it is just the start. "
            "Assuming you ride about 10 thousand kilometers a year, "
            "over 5 years you'll spend {{ vehicle.net_5yr_display }} owning this bike. "
            "That's {{ vehicle.multiplier }} times the purchase price. "
            "Here's the complete ownership cost breakdown."
        ),
        "04-annual-breakdown": (
            "Year one running cost, {{ vehicle.annual_total_display }}. "
            "Fuel is the biggest chunk at {{ vehicle.annual_fuel_display }}, "
            "{{ vehicle.fuel_pct }} percent of your annual spend. "
            "Service costs {{ vehicle.annual_service_display }}, "
            "insurance {{ vehicle.annual_insurance_display }}. "
            "But costs don't stay flat. "
            "Inflation, wear, and overhauls push them up every year. "
            "This table shows the full picture, year by year."
        ),
        "06-service-deep-dive": (
            "You'll spend {{ vehicle.annual_service_display }} a year on service. "
            "Where does it go? "
            "Engine oil and filter changes are your biggest line item. "
            "Chain maintenance, brake pads, coolant service, and labor make up the rest. "
            "Regular service isn't optional on a {{ vehicle.short_name }}. "
            "Skip it, and repair costs will be far worse."
        ),
        "07-insurance-breakdown": (
            "Insurance starts at {{ vehicle.annual_insurance_display }} in year one. "
            "The good news? It drops every year as your no-claim bonus builds. "
            "By year five, you could be paying almost half of what you started with. "
            "This is one of the few ownership costs that actually gets cheaper over time."
        ),
        "11-major-overhauls": (
            "The costs nobody warns you about. "
            "Chain sprocket set, brake discs, clutch plates. "
            "These aren't regular service items. "
            "They hit between year 3 and year 5, and they're not cheap. "
            "Budget for these in advance, or they'll catch you off guard."
        ),
        "13-depreciation": (
            "The biggest cost that never shows up in your monthly bills. "
            "Depreciation. "
            "Your {{ vehicle.short_name }} loses the most value in year one. "
            "After that, the rate slows down. "
            "Sell at the right time and you retain more value. "
            "Wait too long, and the loss is significant."
        ),
        "15-vs-segment": (
            "How does the {{ vehicle.short_name }} compare to its segment? "
            "Here's every competitor ranked by 5-year ownership cost. "
            "Cost per kilometer tells you which bike truly costs less to own. "
            "Not just to buy."
        ),
        "17A-review-summary": (
            "Our expert rating for the {{ vehicle.brand_name }} {{ vehicle.short_name }}. "
            "{{ vehicle.expert_rating }} out of 10. "
            "{{ vehicle.expert_verdict[:150] }}. "
            "The strengths and the watch-outs — all in the full review."
        ),
        "17B-review-cta": (
            "All costs based on 10 thousand Annual Kilometers per year. "
            "From performance to value, see how the {{ vehicle.short_name }} "
            "scores across every category. "
            "Read the full detailed review at bikencars dot com. "
            "Link is in the description."
        ),
        "17-verdict": (
            "Bottom line. "
            "{{ vehicle.cost_per_day_display }} per day. "
            "{{ vehicle.monthly_cost_display }} per month. "
            "{{ vehicle.cost_per_km_display }} per Kilo Meter. "
            "{{ vehicle.net_5yr_display }} over 5 years. "
            "That's what it really costs to own a {{ vehicle.brand_name }} {{ vehicle.short_name }}. "
            "The purchase price is just the entry ticket."
        ),
        "18-end-card": (
            "Subscribe to Bike N Cars for ownership costs on every bike and car. "
            "Comment your real monthly expense below."
        ),
    },
    "hi": {
        "00-what-you-will-learn": (
            "Yeh video dekhne ke baad aap yeh jaanoge. "
            "{{ vehicle.brand_name }} {{ vehicle.short_name }} ko 5 aur 10 saal chalane ka poora khurcha. "
            "Har cost ka breakdown — fuel, service, insurance, tyres, aur overhauls. "
            "Kab kharche badhte hain, aur kaise plan karein. "
            "Kitni tezi se resale value girta hai, aur bechne ka sahi waqt kab hai. "
            "Apne segment mein har rival ke mukable mein kahan khada hai. "
            "Aur aapka personal khurcha — bikencars dot com ke interactive calculator se."
        ),
        "thumbnail": (
            "{{ vehicle.brand_name }} {{ vehicle.short_name }}. "
            "Khareedne ki kimat {{ vehicle.price_formatted }}. "
            "Lekin chalane ki asli cost kya hai — yeh dekhte hain."
        ),
        "02-intro-hook": (
            "{{ vehicle.brand_name }} {{ vehicle.short_name }} ki on-road price hai "
            "{{ vehicle.price_formatted }}. "
            "Lekin khareedna toh bas shuruwaat hai. "
            "Maan lijiye aap saal mein lagbhag 10 hazaar kilometer chalate hain, "
            "toh 5 saal mein aap is bike pe {{ vehicle.net_5yr_display }} kharch karenge. "
            "Yeh purchase price se {{ vehicle.multiplier }} guna hai. "
            "Aaiye dekhte hain poora breakdown."
        ),
        "04-annual-breakdown": (
            "Pehle saal ka running cost, {{ vehicle.annual_total_display }}. "
            "Sabse bada khurcha fuel ka hai, {{ vehicle.annual_fuel_display }}, "
            "jo aapke saalana kharch ka {{ vehicle.fuel_pct }} percent hai. "
            "Service ka khurcha {{ vehicle.annual_service_display }}, "
            "aur insurance {{ vehicle.annual_insurance_display }}. "
            "Lekin yeh cost har saal badhta hai. "
            "Mehangaai, ghisaav, aur overhauls se yeh har saal upar jaata hai. "
            "Yeh table saal dar saal poori tasveer dikhata hai."
        ),
        "06-service-deep-dive": (
            "Service pe saalana {{ vehicle.annual_service_display }} kharch. "
            "Yeh paisa jaata kahan hai? "
            "Engine oil aur filter change sabse bada khurcha hai. "
            "Chain maintenance, brake pads, coolant service, aur labor baaki mein aata hai. "
            "{{ vehicle.short_name }} pe regular service skip mat karna. "
            "Warna repair ka bill bahut zyada aayega."
        ),
        "07-insurance-breakdown": (
            "Pehle saal insurance {{ vehicle.annual_insurance_display }} se shuru hota hai. "
            "Achhi baat yeh hai ki har saal no-claim bonus badhta hai. "
            "Paanchve saal tak aap lagbhag aadha pay kar rahe honge. "
            "Yeh ek aisi cost hai jo waqt ke saath kam hoti hai."
        ),
        "11-major-overhauls": (
            "Woh kharche jinke baare mein koi nahi batata. "
            "Chain sprocket set, brake discs, clutch plates. "
            "Yeh regular service items nahi hain. "
            "Yeh teen se paanch saal ke beech aate hain, aur saste nahi hote. "
            "Pehle se budget rakhiye, warna achanak jhatkaa lagega."
        ),
        "13-depreciation": (
            "Sabse bada khurcha jo monthly bill mein kabhi dikhta nahi. "
            "Depreciation. "
            "Aapki {{ vehicle.short_name }} ki sabse zyada value pehle saal girta hai. "
            "Uske baad rate dheema ho jaata hai. "
            "Sahi waqt pe bechoge toh zyada value milegi. "
            "Zyada der karoge toh nuksaan badh jaayega."
        ),
        "15-vs-segment": (
            "{{ vehicle.short_name }} apne segment mein kahan khadi hai? "
            "Yahan har competitor ko 5 saal ki ownership cost ke hisaab se rank kiya hai. "
            "Cost per kilometer batata hai ki kaunsi bike asli mein sasti padti hai. "
            "Sirf khareedne mein nahi, chalane mein."
        ),
        "17A-review-summary": (
            "{{ vehicle.brand_name }} {{ vehicle.short_name }} ko hamaari expert rating. "
            "10 mein se {{ vehicle.expert_rating }}. "
            "{{ vehicle.expert_verdict[:150] }}. "
            "Poori detail ke liye bikencars.com pe jaaiye."
        ),
        "17B-review-cta": (
            "Performance se lekar value tak — dekhiye {{ vehicle.short_name }} "
            "har category mein kahan khadi hai. "
            "Poori review bikencars dot com pe padhiye. "
            "Link description mein hai."
        ),
        "17-verdict": (
            "Final baat. "
            "Roz ka khurcha {{ vehicle.cost_per_day_display }}. "
            "Mahine ka {{ vehicle.monthly_cost_display }}. "
            "5 saal mein {{ vehicle.net_5yr_display }}. "
            "Yeh hai {{ vehicle.brand_name }} {{ vehicle.short_name }} ki asli cost. "
            "Purchase price toh bas entry ticket hai."
        ),
        "18-end-card": (
            "Bike N Cars ko subscribe kariye har bike aur car ki ownership cost ke liye. "
            "Comment mein bataaiye aapka real monthly expense kitna hai."
        ),
    },
    "mr": {
        "00-what-you-will-learn": (
            "हा व्हिडिओ पाहिल्यानंतर तुम्हाला हे सगळं माहित होईल. "
            "{{ vehicle.brand_name }} {{ vehicle.short_name }} ५ आणि १० वर्षे चालवण्याचा एकूण खर्च. "
            "प्रत्येक खर्चाचा तपशील — पेट्रोल, सर्व्हिस, विमा आणि टायर. "
            "खर्च कधी वाढतो आणि आधीपासून कसे नियोजन करावे. "
            "रिसेल व्हॅल्यू किती लवकर कमी होते आणि विकण्याची योग्य वेळ कधी. "
            "सेगमेंटमधील प्रत्येक स्पर्धकाशी तुलना. "
            "आणि तुमचा नेमका वैयक्तिक ओनरशिप कॉस्ट — bike and cars dot com च्या "
            "इंटरॅक्टिव्ह कॅल्क्युलेटरने काढा."
        ),
        "02-intro-hook": (
            "{{ vehicle.brand_name }} {{ vehicle.short_name }} ची किंमत "
            "{{ vehicle.price_formatted }} आहे. "
            "पण हे विकत घेणं तर फक्त सुरुवात आहे. "
            "समजा तुम्ही वर्षाला साधारण १० हजार किलोमीटर चालवता, "
            "तर ५ वर्षांत तुम्ही या बाईकवर {{ vehicle.net_5yr_display }} खर्च कराल. "
            "हे खरेदी किमतीच्या {{ vehicle.multiplier }} पट आहे. "
            "ये पाहूया संपूर्ण खर्चाचा तपशील."
        ),
        "04-annual-breakdown": (
            "पहिल्या वर्षीचा running cost, {{ vehicle.annual_total_display }}. "
            "सर्वात मोठा खर्च पेट्रोलचा — {{ vehicle.annual_fuel_display }}, "
            "म्हणजे वार्षिक खर्चाचा {{ vehicle.fuel_pct }} टक्के. "
            "सर्व्हिसचा खर्च {{ vehicle.annual_service_display }}, "
            "विमा {{ vehicle.annual_insurance_display }}. "
            "पण हा खर्च दर वर्षी वाढत जातो. "
            "महागाई, झीज आणि overhauls मुळे दरवर्षी हा आकडा वाढतो. "
            "हे table वर्षाप्रमाणे संपूर्ण चित्र दाखवतो."
        ),
        "06-service-deep-dive": (
            "सर्व्हिसवर वर्षाला {{ vehicle.annual_service_display }} खर्च. "
            "हे पैसे कुठे जातात? "
            "Engine oil आणि filter बदलणे सर्वात मोठा भाग आहे. "
            "Chain maintenance, brake pads, coolant service आणि labor बाकी खर्च. "
            "{{ vehicle.short_name }} वर नियमित सर्व्हिस चुकवू नका. "
            "चुकवली तर repair चा खर्च कितीतरी जास्त होईल."
        ),
        "07-insurance-breakdown": (
            "पहिल्या वर्षी विमा {{ vehicle.annual_insurance_display }} पासून सुरू होतो. "
            "चांगली बातमी? दर वर्षी no-claim bonus वाढत जातो. "
            "पाचव्या वर्षापर्यंत तुम्ही सुरुवातीच्या जवळपास निम्मा विमा भरत असाल. "
            "हा एकमेव ownership cost आहे जो वेळेनुसार खरोखर कमी होतो."
        ),
        "11-major-overhauls": (
            "हे ते खर्च आहेत ज्याबद्दल कोणी सांगत नाही. "
            "Chain sprocket set, brake discs, clutch plates. "
            "हे नेहमीचे service items नाहीत. "
            "ते ३ ते ५ वर्षांच्या दरम्यान येतात, आणि हे स्वस्त नाहीत. "
            "आधीपासून budget ठेवा, नाहीतर अचानक धक्का बसेल."
        ),
        "13-depreciation": (
            "सर्वात मोठा खर्च जो तुमच्या monthly bills मध्ये कधीच दिसत नाही. "
            "Depreciation. "
            "तुमची {{ vehicle.short_name }} सर्वात जास्त value पहिल्या वर्षी गमावते. "
            "त्यानंतर हा दर हळू होतो. "
            "योग्य वेळी विकली तर जास्त मिळेल. "
            "जास्त थांबलात तर नुकसान वाढत जाईल."
        ),
        "15-vs-segment": (
            "{{ vehicle.short_name }} आपल्या segment मध्ये कुठे आहे? "
            "इथे प्रत्येक competitor ला ५ वर्षांच्या ownership cost नुसार rank केले आहे. "
            "Cost per kilometer सांगतो की कोणती बाईक खरोखर कमी खर्चिक आहे. "
            "फक्त विकत घेताना नाही, चालवतानाही."
        ),
        "17A-review-summary": (
            "{{ vehicle.brand_name }} {{ vehicle.short_name }} साठी आमचं expert rating. "
            "१० पैकी {{ vehicle.expert_rating }}. "
            "{{ vehicle.expert_verdict[:150] }}. "
            "सर्व strengths आणि काय लक्षात ठेवावं — सर्व संपूर्ण review मध्ये."
        ),
        "17B-review-cta": (
            "सर्व खर्च दर वर्षी १० हजार किलोमीटर या आधारावर आहेत. "
            "performance पासून value पर्यंत — {{ vehicle.short_name }} "
            "प्रत्येक category मध्ये कुठे आहे ते पाहा. "
            "संपूर्ण review bikencars dot com वर वाचा. "
            "Link description मध्ये आहे."
        ),
        "17-verdict": (
            "शेवटचा निष्कर्ष. "
            "रोजचा खर्च {{ vehicle.cost_per_day_display }}. "
            "महिन्याचा {{ vehicle.monthly_cost_display }}. "
            "५ वर्षांत {{ vehicle.net_5yr_display }}. "
            "हाच आहे {{ vehicle.brand_name }} {{ vehicle.short_name }} चालवण्याचा खरा खर्च. "
            "खरेदी किंमत फक्त entry ticket आहे."
        ),
        "18-end-card": (
            "प्रत्येक बाईक आणि कारच्या ownership cost साठी Bike N Cars ला subscribe करा. "
            "Comment मध्ये सांगा तुमचा खरा monthly खर्च किती आहे."
        ),
    },
    "te": {
        "00-what-you-will-learn": (
            "ఈ వీడియో చివరకి మీకు ఇవి తెలుసుకుంటారు. "
            "{{ vehicle.brand_name }} {{ vehicle.short_name }} 5 మరియు 10 సంవత్సరాలు నడపడానికి అయ్యే మొత్తం ఖర్చు. "
            "పెట్రోల్, సర్వీస్, ఇన్సూరెన్స్, టైర్లు — ప్రతి ఖర్చు వివరంగా. "
            "ఖర్చులు ఎప్పుడు పెరుగుతాయో, ముందే ఎలా ప్లాన్ చేయాలో. "
            "రీసేల్ వ్యాల్యూ ఎంత వేగంగా తగ్గుతుందో, అమ్మడానికి సరైన సమయం ఎప్పుడో. "
            "సెగ్మెంట్‌లో ప్రతి పోటీదారుతో పోలిక. "
            "మరియు మీ సొంత ఓనర్‌షిప్ కాస్ట్ — bike and cars dot com "
            "ఇంటరాక్టివ్ కాల్క్యులేటర్‌తో లెక్కించండి."
        ),
        "02-intro-hook": (
            "{{ vehicle.brand_name }} {{ vehicle.short_name }} ధర "
            "{{ vehicle.price_formatted }}. "
            "కానీ కొనడం మొదలంతే. "
            "మీరు సంవత్సరానికి సుమారు 10 వేల కిలోమీటర్లు నడిపితే, "
            "5 సంవత్సరాలలో ఈ బైక్‌పై {{ vehicle.net_5yr_display }} ఖర్చు అవుతుంది. "
            "అది కొనుగోలు ధరకు {{ vehicle.multiplier }} రెట్లు. "
            "పూర్తి వివరాలు చూద్దాం."
        ),
        "04-annual-breakdown": (
            "మొదటి సంవత్సరం running cost, {{ vehicle.annual_total_display }}. "
            "అతి పెద్ద ఖర్చు పెట్రోల్ — {{ vehicle.annual_fuel_display }}, "
            "వార్షిక ఖర్చులో {{ vehicle.fuel_pct }} శాతం. "
            "సర్వీస్ ఖర్చు {{ vehicle.annual_service_display }}, "
            "ఇన్సూరెన్స్ {{ vehicle.annual_insurance_display }}. "
            "కానీ ఈ ఖర్చులు ప్రతి సంవత్సరం పెరుగుతాయి. "
            "ద్రవ్యోల్బణం, అరిగిపోవడం, overhauls వల్ల ప్రతి సంవత్సరం పెరుగుతుంది. "
            "ఈ table సంవత్సరాల వారీగా పూర్తి చిత్రం చూపిస్తుంది."
        ),
        "06-service-deep-dive": (
            "సర్వీస్‌కు సంవత్సరానికి {{ vehicle.annual_service_display }} ఖర్చు. "
            "ఈ డబ్బు ఎక్కడికి వెళ్తుంది? "
            "Engine oil మరియు filter మార్పు అతి పెద్ద భాగం. "
            "Chain maintenance, brake pads, coolant service మరియు labor మిగతావి. "
            "{{ vehicle.short_name }}కు నిత్య సర్వీస్ తప్పనిసరి. "
            "వదిలేస్తే రిపేర్ బిల్లు చాలా ఎక్కువ అవుతుంది."
        ),
        "07-insurance-breakdown": (
            "మొదటి సంవత్సరం ఇన్సూరెన్స్ {{ vehicle.annual_insurance_display }} నుండి మొదలవుతుంది. "
            "మంచి విషయం ఏంటంటే no-claim bonus ప్రతి సంవత్సరం పెరుగుతుంది. "
            "ఐదవ సంవత్సరానికి మీరు మొదటి మొత్తంలో దాదాపు సగం చెల్లిస్తుంటారు. "
            "కాలంతో పాటు తగ్గే కొద్ది ownership cost ఇదొక్కటే."
        ),
        "11-major-overhauls": (
            "ఎవరూ చెప్పని ఖర్చులివి. "
            "Chain sprocket set, brake discs, clutch plates. "
            "ఇవి సాధారణ సర్వీస్ items కాదు. "
            "ఇవి 3 నుండి 5 సంవత్సరాల మధ్య వస్తాయి, చవకగా కాదు. "
            "ముందే budget పెట్టండి, లేదంటే అనుకోకుండా షాక్ తగులుతుంది."
        ),
        "13-depreciation": (
            "మీ monthly bills లో ఎప్పటికీ కనిపించని అతి పెద్ద ఖర్చు. "
            "Depreciation. "
            "మీ {{ vehicle.short_name }} మొదటి సంవత్సరంలో అత్యధిక విలువ కోల్పోతుంది. "
            "తర్వాత రేటు తగ్గుతుంది. "
            "సరైన సమయంలో అమ్మితే ఎక్కువ విలువ దక్కుతుంది. "
            "ఆలస్యం చేస్తే నష్టం పెరిగిపోతుంది."
        ),
        "15-vs-segment": (
            "{{ vehicle.short_name }} తన సెగ్మెంట్‌లో ఎక్కడ ఉంది? "
            "ఇక్కడ ప్రతి పోటీదారుని 5 సంవత్సరాల ownership cost ప్రకారం rank చేశాం. "
            "Cost per kilometer చెప్తుంది ఏ బైక్ నిజంగా తక్కువ ఖర్చుతో వస్తుందో. "
            "కొనడానికి మాత్రమే కాదు, నడపడానికి కూడా."
        ),
        "17A-review-summary": (
            "{{ vehicle.brand_name }} {{ vehicle.short_name }}కు మా expert rating. "
            "10 లో {{ vehicle.expert_rating }}. "
            "{{ vehicle.expert_verdict[:150] }}. "
            "బలాలు మరియు జాగ్రత్తలు — అన్నీ పూర్తి review లో."
        ),
        "17B-review-cta": (
            "అన్ని ఖర్చులు సంవత్సరానికి 10 వేల కిలోమీటర్ల ఆధారంగా. "
            "పనితీరు నుండి విలువ వరకు — {{ vehicle.short_name }} "
            "ప్రతి category లో ఎక్కడ ఉందో చూడండి. "
            "పూర్తి review bikencars dot com లో చదవండి. "
            "Link description లో ఉంది."
        ),
        "17-verdict": (
            "చివరి మాట. "
            "రోజుకు {{ vehicle.cost_per_day_display }}. "
            "నెలకు {{ vehicle.monthly_cost_display }}. "
            "5 సంవత్సరాలలో {{ vehicle.net_5yr_display }}. "
            "ఇదే {{ vehicle.brand_name }} {{ vehicle.short_name }} నడపడానికి అయ్యే నిజమైన ఖర్చు. "
            "కొనుగోలు ధర కేవలం entry ticket మాత్రమే."
        ),
        "18-end-card": (
            "ప్రతి బైక్ మరియు కారు ownership cost కోసం Bike N Cars subscribe చేయండి. "
            "Comment లో చెప్పండి మీ నిజమైన monthly ఖర్చు ఎంతో."
        ),
    },
}
