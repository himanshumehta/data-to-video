export interface YearBreakdown {
  year: number;
  total: number;
  fuel: number;
  service: number;
  insurance: number;
  tyres: number;
  overhauls?: number;
}

export interface ServiceComponent {
  name: string;
  freq: string;
  cost: number;
  cost_display: string;
  pct: number;
}

export interface DepMilestone {
  year: number;
  value: number;
  value_display: string;
  retention_pct: number;
  loss_pct: number;
}

export interface Overhaul {
  year: number;
  component: string;
  cost: number;
  repeat_every?: number;
}

export interface Competitor {
  short_name: string;
  price_formatted: string;
  cost_5yr_display: string;
  total_cost_5yr: number;
  cost_per_km: number;
}

export interface ExpertBreakdown {
  [key: string]: number;
}

export interface ComparisonSpec {
  label: string;
  self_value: string;
  rival_value: string;
  winner: "self" | "rival" | "tie";
}

export interface RatingDistribution {
  stars: number;
  count: number;
  pct: number;
}

export interface Vehicle {
  slug: string;
  brand_name: string;
  brand_slug: string;
  short_name: string;

  price_ex_showroom: number;
  price_formatted: string;
  price_on_road?: number;
  price_on_road_formatted?: string;

  net_5yr: number;
  net_5yr_display: string;
  total_cost_5yr: number;
  multiplier: number;

  net_10yr: number;
  net_10yr_display: string;
  total_cost_10yr: number;

  cost_per_km: number;
  cost_per_day: number;
  cost_per_day_display: string;
  monthly_cost_display: string;

  annual_fuel: number;
  annual_fuel_display: string;
  annual_service: number;
  annual_service_display: string;
  annual_insurance: number;
  annual_insurance_display: string;
  annual_tyres: number;
  annual_total: number;

  yearly_breakdown: YearBreakdown[];
  first_5_years: YearBreakdown[];
  service_components: ServiceComponent[];
  dep_milestones: DepMilestone[];
  overhauls: Overhaul[];
  competitors_ownership: Competitor[];

  assumed_annual_km: number;
  assumed_fuel_price: number;
  mixed_mileage_kmpl: number;
  fuel_pct: number;

  tyre_front_cost: number;
  tyre_rear_cost: number;
  tyre_life_km: number;

  launch_age_years: number | null;
  data_confidence: "verified" | "estimated" | "projected";
  data_confidence_label: string;

  cheapest_year: number;
  cheapest_year_display: string;
  costliest_year: number;
  costliest_year_display: string;
  first_overhaul_year: number | null;
  first_overhaul_component: string | null;

  primary_nobg_url: string;

  expert_rating: number;
  expert_verdict: string;
  expert_breakdown: ExpertBreakdown;
  pros: string[];
  cons: string[];

  generation_number?: number;
  rating_color: string;

  // Review/spec fields (optional — used by vehicle-review content type)
  engine_cc?: number;
  power_hp?: number;
  torque_nm?: number;
  top_speed_kmph?: number;
  weight_kg?: number;
  mileage_kmpl?: number;
  fuel_tank_litres?: number;
  acceleration_0_100?: number;
  power_to_weight?: number;
  vehicle_type?: "motorcycle" | "car";
  features?: string[];
  best_for?: string;
  tags?: string[];

  // Safety research
  safety_score?: number;
  ncap_rating?: number;
  ncap_body?: string;
  safety_features?: string[];
  airbag_count?: number;
  traction_control?: boolean;

  // Owner sentiment
  owner_rating?: number;
  owner_review_count?: number;
  rating_distribution?: RatingDistribution[];
  common_praise?: string[];
  common_complaints?: string[];

  // Head-to-head comparison
  comparison_specs?: ComparisonSpec[];
  top_rival_name?: string;

  // Known issues
  known_issues?: string[];

  // Resale insight
  resale_rating?: string;
  best_time_to_sell?: string;
  depreciation_1yr_pct?: number;
}
