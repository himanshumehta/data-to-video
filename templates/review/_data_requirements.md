# Review Content — Data Requirements

Required vehicle fields per slide. Missing fields → skip that slide or use fallback.

| Slide | Required Fields | Optional |
|-------|----------------|----------|
| 01-hero | brand_name, short_name, price_ex_showroom, expert_rating | tags, vehicle_type |
| 02-performance | engine_cc, power_hp, torque_nm, top_speed_kmph | weight_kg, acceleration_0_100, power_to_weight |
| 03-features | key_features (≥3 items) | feature categories |
| 04-pros | pros (≥3 items) | — |
| 05-cons | cons (≥3 items) | — |
| 06-competition | competitors (≥1 with specs) | competitor ratings |
| 07-ownership | total_cost_5yr, fuel_cost_yearly, service_cost_yearly | insurance_yearly, resale_value_5yr |
| 08-ratings | expert_rating, rating_breakdown (≥3 categories) | — |
| 09-realworld | mileage_city, mileage_mixed | waiting_period, service_centers, known_issues, depreciation_1yr |
| 10-verdict | expert_rating, verdict_text, best_for | tags |

## Preprocessed Fields (added by the data preprocessor, not included in this repo)

| Field | Source | Example |
|-------|--------|---------|
| price_display | format_price(price_ex_showroom) | "2.99 Lakh" |
| price_formatted | "₹ " + price_display | "₹ 2.99 Lakh" |
| rating_color | rating_color(expert_rating) | "#10b981" |
| power_to_weight | (power_hp / weight_kg) * 1000 | 274 |
| mileage_display | mileage_mixed + " kmpl" | "25.5 kmpl" |
| cost_per_km | DB value or total_cost_5yr / 40000 | 9.42 |
