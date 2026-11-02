import React from "react";
import { Composition } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { SlideProps, Vehicle } from "./types";

// Temporary: 5 design options for comparison
import { OptionA } from "./slides/reels-options/OptionA";
import { OptionB } from "./slides/reels-options/OptionB";
import { OptionC } from "./slides/reels-options/OptionC";
import { OptionD } from "./slides/reels-options/OptionD";
import { OptionE } from "./slides/reels-options/OptionE";
import { OptionF } from "./slides/reels-options/OptionF";
import { OptionG } from "./slides/reels-options/OptionG";
import { OptionH } from "./slides/reels-options/OptionH";
import { OptionI } from "./slides/reels-options/OptionI";

// ── Landscape slide imports (existing) ──────────────────────────────
import { WhatYouWillLearn } from "./slides/WhatYouWillLearn";
import { IntroHook } from "./slides/IntroHook";
import { AnnualBreakdown } from "./slides/AnnualBreakdown";
import { ServiceDeepDive } from "./slides/ServiceDeepDive";
import { InsuranceBreakdown } from "./slides/InsuranceBreakdown";
import { MajorOverhauls } from "./slides/MajorOverhauls";
import { Depreciation } from "./slides/Depreciation";
import { VsSegment } from "./slides/VsSegment";
import { Verdict } from "./slides/Verdict";
import { ReviewSummary } from "./slides/ReviewSummary";
import { ReviewCta } from "./slides/ReviewCta";
import { EndCard } from "./slides/EndCard";

// Side effect: loads Inter font for all compositions
loadFont();

// ── Component maps (used by registry-driven registration) ───────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LANDSCAPE_SLIDES: Record<string, React.FC<any>> = {
  WhatYouWillLearn,
  IntroHook,
  AnnualBreakdown,
  ServiceDeepDive,
  InsuranceBreakdown,
  MajorOverhauls,
  Depreciation,
  VsSegment,
  Verdict,
  ReviewSummary,
  ReviewCta,
  EndCard,
};

// ── Portrait slide imports (1080x1350, default theme) ───────────────
import {
  WhatYouWillLearnPortrait,
  HookPortrait,
  AnnualBreakdownPortrait,
  ServiceDeepDivePortrait,
  YearByYearPortrait,
  DepreciationPortrait,
  DailyRealityPortrait,
  VsSegmentPortrait,
  VerdictPortrait,
  ReviewSnapshotPortrait,
  ReviewCtaPortrait,
  EndCardPortrait,
} from "./slides/portrait";

// ── Beast portrait slide imports (1080x1350, beast theme) ───────────
import {
  WhatYouWillLearnPortraitBeast,
  HookPortraitBeast,
  AnnualBreakdownPortraitBeast,
  ServiceDeepDivePortraitBeast,
  YearByYearPortraitBeast,
  DepreciationPortraitBeast,
  DailyRealityPortraitBeast,
  VsSegmentPortraitBeast,
  VerdictPortraitBeast,
  ReviewSnapshotPortraitBeast,
  ReviewCtaPortraitBeast,
  EndCardPortraitBeast,
} from "./slides/portrait-beast";

// ── Reels slide imports (1080x1920, 9:16) ───────────────────────────
import {
  WhatYouWillLearnReels,
  HookReels,
  AnnualBreakdownReels,
  ServiceDeepDiveReels,
  YearByYearReels,
  DepreciationReels,
  DailyRealityReels,
  VsSegmentReels,
  VerdictReels,
  ReviewSnapshotReels,
  ReviewCtaReels,
  EndCardReels,
  ThumbnailReels,
} from "./slides/reels";

// ── Vehicle Review portrait slide imports (1080x1350, default theme) ─
import {
  ReviewScoreCardPortrait,
  ReviewPerformancePortrait,
  ReviewSafetyPortrait,
  ReviewOwnerVoicePortrait,
  ReviewCostRealityPortrait,
  ReviewKnownIssuesPortrait,
  ReviewHeadToHeadPortrait,
  ReviewProsConsPortrait,
  ReviewBuySkipPortrait,
} from "./slides/review-portrait";

// ── Vehicle Review reels slide imports (1080x1920, 9:16) ─────────────
import {
  ReviewScoreCardReels,
  ReviewPerformanceReels,
  ReviewSafetyReels,
  ReviewOwnerVoiceReels,
  ReviewCostRealityReels,
  ReviewKnownIssuesReels,
  ReviewHeadToHeadReels,
  ReviewProsConsReels,
  ReviewBuySkipReels,
} from "./slides/review-reels";

// ── Service Bill Insight slide imports ──────────────────────────────
import { BillHookReels } from "./slides/reels/BillHookReels";
import { BillCostSplitReels } from "./slides/reels/BillCostSplitReels";
import { BillEssentialReels } from "./slides/reels/BillEssentialReels";
import { BillOptionalReels } from "./slides/reels/BillOptionalReels";
import { BillLaborReels } from "./slides/reels/BillLaborReels";
import { BillTakeawayReels } from "./slides/reels/BillTakeawayReels";
import { BillRatingReels } from "./slides/reels/BillRatingReels";
import { BillThumbnailReels } from "./slides/reels/BillThumbnailReels";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PORTRAIT_SLIDES: Record<string, React.FC<any>> = {
  // Default theme
  WhatYouWillLearnPortrait,
  HookPortrait,
  AnnualBreakdownPortrait,
  ServiceDeepDivePortrait,
  YearByYearPortrait,
  DepreciationPortrait,
  DailyRealityPortrait,
  VsSegmentPortrait,
  VerdictPortrait,
  ReviewSnapshotPortrait,
  ReviewCtaPortrait,
  EndCardPortrait,
  // Design options (temporary)
  OptionA, OptionB, OptionC, OptionD, OptionE, OptionF, OptionG, OptionH, OptionI,
  // Reels (9:16)
  WhatYouWillLearnReels,
  HookReels,
  AnnualBreakdownReels,
  ServiceDeepDiveReels,
  YearByYearReels,
  DepreciationReels,
  DailyRealityReels,
  VsSegmentReels,
  VerdictReels,
  ReviewSnapshotReels,
  ReviewCtaReels,
  EndCardReels,
  ThumbnailReels,
  // Beast theme
  WhatYouWillLearnPortraitBeast,
  HookPortraitBeast,
  AnnualBreakdownPortraitBeast,
  ServiceDeepDivePortraitBeast,
  YearByYearPortraitBeast,
  DepreciationPortraitBeast,
  DailyRealityPortraitBeast,
  VsSegmentPortraitBeast,
  VerdictPortraitBeast,
  ReviewSnapshotPortraitBeast,
  ReviewCtaPortraitBeast,
  EndCardPortraitBeast,
  // Vehicle Review portrait (default theme)
  ReviewScoreCardPortrait,
  ReviewPerformancePortrait,
  ReviewSafetyPortrait,
  ReviewOwnerVoicePortrait,
  ReviewCostRealityPortrait,
  ReviewKnownIssuesPortrait,
  ReviewHeadToHeadPortrait,
  ReviewProsConsPortrait,
  ReviewBuySkipPortrait,
  // Vehicle Review reels (9:16)
  ReviewScoreCardReels,
  ReviewPerformanceReels,
  ReviewSafetyReels,
  ReviewOwnerVoiceReels,
  ReviewCostRealityReels,
  ReviewKnownIssuesReels,
  ReviewHeadToHeadReels,
  ReviewProsConsReels,
  ReviewBuySkipReels,
  // Service Bill Insight reels (9:16)
  BillHookReels,
  BillCostSplitReels,
  BillEssentialReels,
  BillOptionalReels,
  BillLaborReels,
  BillTakeawayReels,
  BillRatingReels,
  BillThumbnailReels,
};

// ── Content type registry ───────────────────────────────────────────
// Each content type has a remotion.json with compositions, formats, platforms
const registries = [
  require("../../content_types/ownership_cost/remotion.json"),
  require("../../content_types/vehicle_review/remotion.json"),
  require("../../content_types/service_bill_insight/remotion.json"),
];

// ── Placeholder vehicle for Remotion Studio preview ─────────────────
const PLACEHOLDER_VEHICLE: Vehicle = {
  slug: "ktm-390-duke",
  brand_name: "KTM",
  brand_slug: "ktm",
  short_name: "390 Duke",
  price_ex_showroom: 310000,
  price_formatted: "\u20B9 3,10,000",
  price_on_road: 347200,
  price_on_road_formatted: "\u20B9 3,47,200",
  net_5yr: 771102,
  net_5yr_display: "\u20B9 7,71,102",
  total_cost_5yr: 461102,
  multiplier: 2.49,
  net_10yr: 1480000,
  net_10yr_display: "\u20B9 14,80,000",
  total_cost_10yr: 1170000,
  cost_per_km: 9.22,
  cost_per_day: 252,
  cost_per_day_display: "\u20B9 252",
  monthly_cost_display: "\u20B9 7,560",
  annual_fuel: 42000,
  annual_fuel_display: "\u20B9 42,000",
  annual_service: 18000,
  annual_service_display: "\u20B9 18,000",
  annual_insurance: 12000,
  annual_insurance_display: "\u20B9 12,000",
  annual_tyres: 8000,
  annual_total: 80000,
  yearly_breakdown: [
    { year: 1, total: 80000, fuel: 42000, service: 18000, insurance: 12000, tyres: 8000 },
    { year: 2, total: 84000, fuel: 44000, service: 19000, insurance: 10500, tyres: 0, overhauls: 10500 },
    { year: 3, total: 98000, fuel: 46000, service: 20000, insurance: 9500, tyres: 8000, overhauls: 14500 },
    { year: 4, total: 92000, fuel: 48000, service: 21500, insurance: 8800, tyres: 0, overhauls: 13700 },
    { year: 5, total: 107000, fuel: 50000, service: 23000, insurance: 8200, tyres: 8000, overhauls: 17800 },
    { year: 6, total: 95000, fuel: 52000, service: 24500, insurance: 7800, tyres: 0, overhauls: 10700 },
    { year: 7, total: 112000, fuel: 54000, service: 26000, insurance: 7400, tyres: 8000, overhauls: 16600 },
    { year: 8, total: 100000, fuel: 56000, service: 27500, insurance: 7100, tyres: 0, overhauls: 9400 },
    { year: 9, total: 118000, fuel: 58000, service: 29000, insurance: 6800, tyres: 8000, overhauls: 16200 },
    { year: 10, total: 108000, fuel: 60000, service: 30500, insurance: 6500, tyres: 0, overhauls: 11000 },
  ],
  first_5_years: [
    { year: 1, total: 80000, fuel: 42000, service: 18000, insurance: 12000, tyres: 8000 },
    { year: 2, total: 84000, fuel: 44000, service: 19000, insurance: 10500, tyres: 0 },
    { year: 3, total: 98000, fuel: 46000, service: 20000, insurance: 9500, tyres: 8000 },
    { year: 4, total: 92000, fuel: 48000, service: 21500, insurance: 8800, tyres: 0 },
    { year: 5, total: 107000, fuel: 50000, service: 23000, insurance: 8200, tyres: 8000 },
  ],
  service_components: [
    { name: "Engine Oil + Filter", freq: "3-4x/yr", cost: 5040, cost_display: "\u20B9 5,040", pct: 28 },
    { name: "General Labor", freq: "3-4x/yr", cost: 4500, cost_display: "\u20B9 4,500", pct: 25 },
    { name: "Brake Pads (F+R)", freq: "1x/yr", cost: 2520, cost_display: "\u20B9 2,520", pct: 14 },
    { name: "Chain Cleaning & Lube", freq: "6x/yr", cost: 1800, cost_display: "\u20B9 1,800", pct: 10 },
    { name: "Misc Consumables", freq: "as needed", cost: 1440, cost_display: "\u20B9 1,440", pct: 8 },
    { name: "Air Filter", freq: "2x/yr", cost: 1080, cost_display: "\u20B9 1,080", pct: 6 },
  ],
  dep_milestones: [
    { year: 1, value: 232000, value_display: "\u20B9 2,32,000", retention_pct: 74.8, loss_pct: 25 },
    { year: 3, value: 186000, value_display: "\u20B9 1,86,000", retention_pct: 60.0, loss_pct: 40 },
    { year: 5, value: 155000, value_display: "\u20B9 1,55,000", retention_pct: 50.0, loss_pct: 50 },
    { year: 10, value: 93000, value_display: "\u20B9 93,000", retention_pct: 30.0, loss_pct: 70 },
    { year: 15, value: 47000, value_display: "\u20B9 47,000", retention_pct: 15.0, loss_pct: 85 },
  ],
  overhauls: [
    { year: 3, component: "Chain + Sprocket Set", cost: 6500 },
    { year: 4, component: "Clutch Plates", cost: 4200 },
    { year: 5, component: "Battery Replacement", cost: 3800 },
    { year: 7, component: "Suspension Rebuild", cost: 12000 },
    { year: 8, component: "Chain + Sprocket Set", cost: 7500 },
    { year: 10, component: "Engine Top Overhaul", cost: 18000 },
  ],
  competitors_ownership: [
    { short_name: "Yamaha MT-03", price_formatted: "\u20B9 3,55,000", cost_5yr_display: "\u20B9 6,90,000", total_cost_5yr: 690000, cost_per_km: 8.6 },
    { short_name: "BMW G 310 R", price_formatted: "\u20B9 3,15,000", cost_5yr_display: "\u20B9 8,50,000", total_cost_5yr: 850000, cost_per_km: 10.6 },
    { short_name: "Husqvarna Svartpilen 401", price_formatted: "\u20B9 3,20,000", cost_5yr_display: "\u20B9 8,10,000", total_cost_5yr: 810000, cost_per_km: 10.1 },
    { short_name: "Kawasaki Z400", price_formatted: "\u20B9 5,10,000", cost_5yr_display: "\u20B9 9,20,000", total_cost_5yr: 920000, cost_per_km: 11.5 },
  ],
  assumed_annual_km: 10000,
  assumed_fuel_price: 100,
  mixed_mileage_kmpl: 28,
  fuel_pct: 53,
  tyre_front_cost: 6500,
  tyre_rear_cost: 9000,
  tyre_life_km: 15000,
  launch_age_years: 3,
  data_confidence: "verified" as const,
  data_confidence_label: "Based on 5+ years of owner data",
  cheapest_year: 1,
  cheapest_year_display: "₹ 80,000",
  costliest_year: 5,
  costliest_year_display: "₹ 1,07,000",
  first_overhaul_year: 3,
  first_overhaul_component: "chain sprocket set",
  primary_nobg_url: "vehicles/ktm-250-duke.png",
  expert_rating: 8.2,
  expert_verdict: "The KTM 390 Duke remains the performance benchmark in the sub-5-lakh segment. Razor-sharp handling, refined motor, and class-leading tech make it the rider's choice.",
  expert_breakdown: {
    Performance: 8.5,
    Handling: 9.0,
    Design: 7.8,
    Features: 8.0,
    Comfort: 7.0,
    Value: 7.5,
  },
  pros: [
    "Best-in-class power-to-weight ratio",
    "TFT display with smartphone connectivity",
    "Agile handling on city roads and twisties",
  ],
  cons: [
    "Firm ride quality on bad roads",
    "No wind protection for highway cruising",
    "Higher service costs than Japanese rivals",
  ],
  rating_color: "#10b981",
  // Review/spec fields
  engine_cc: 373,
  power_hp: 44,
  torque_nm: 37,
  top_speed_kmph: 167,
  weight_kg: 167,
  mileage_kmpl: 28,
  fuel_tank_litres: 13.4,
  acceleration_0_100: 5.5,
  power_to_weight: 263,
  vehicle_type: "motorcycle",
  features: [
    "TFT display with Bluetooth",
    "Ride-by-wire throttle",
    "Slipper clutch",
    "LED headlamp & DRL",
    "Supermoto ABS mode",
    "WP APEX suspension",
  ],
  best_for: "Enthusiast riders",
  tags: ["Street", "Performance", "Naked"],
  // Safety research
  safety_score: 7.5,
  ncap_rating: 0,
  ncap_body: "Not tested",
  safety_features: [
    "Dual-channel ABS",
    "Slipper clutch",
    "LED headlamp with DRL",
    "Supermoto ABS mode",
    "Side-stand engine cut-off",
    "All-digital TFT display",
  ],
  airbag_count: 0,
  traction_control: false,
  // Owner sentiment
  owner_rating: 4.3,
  owner_review_count: 1247,
  rating_distribution: [
    { stars: 5, count: 624, pct: 50 },
    { stars: 4, count: 312, pct: 25 },
    { stars: 3, count: 125, pct: 10 },
    { stars: 2, count: 99, pct: 8 },
    { stars: 1, count: 87, pct: 7 },
  ],
  common_praise: [
    "Thrilling performance for daily riding",
    "Best TFT display in the segment",
    "Razor-sharp cornering ability",
  ],
  common_complaints: [
    "Harsh ride on broken roads",
    "Expensive service bills",
    "Vibrations at high RPM on older models",
  ],
  // Head-to-head comparison
  comparison_specs: [
    { label: "Power", self_value: "44 HP", rival_value: "42 HP", winner: "self" as const },
    { label: "Torque", self_value: "37 Nm", rival_value: "37.5 Nm", winner: "rival" as const },
    { label: "Weight", self_value: "167 kg", rival_value: "169 kg", winner: "self" as const },
    { label: "Top Speed", self_value: "167 kmph", rival_value: "162 kmph", winner: "self" as const },
    { label: "Mileage", self_value: "28 kmpl", rival_value: "32 kmpl", winner: "rival" as const },
    { label: "Price", self_value: "\u20B9 3.10L", rival_value: "\u20B9 3.55L", winner: "self" as const },
  ],
  top_rival_name: "Yamaha MT-03",
  // Known issues
  known_issues: [
    "Radiator fan may fail after 20,000 km",
    "Chain slack needs frequent adjustment",
    "Side-stand sensor intermittent faults",
    "Headlamp throw could be better at night",
  ],
  // Resale
  resale_rating: "good",
  best_time_to_sell: "Between year 3 and 4 for best value retention",
  depreciation_1yr_pct: 25,
};

const DEFAULT_DURATION_SEC = 10;

// ── Placeholder bill for Remotion Studio preview ──────────────────────
const PLACEHOLDER_BILL = {
  manufacturer_name: "Hyundai",
  vehicle_name: "Verna",
  vehicle_year: 2017,
  vehicle_variant: "Fluidic 1.4 CRDi",
  fuel_type: "diesel",
  service_type_label: "Paid Service",
  is_authorized: true,
  total_display: "\u20B925,291",
  labor_display: "\u20B910,067",
  labor_total: 10067,
  labor_pct: 41,
  parts_display: "\u20B915,224",
  tax_display: "\u20B90",
  essential_display: "\u20B95,004",
  essential_count: 11,
  upsell_display: "\u20B910,200",
  upsell_count: 6,
  verdict: "overcharged",
  verdict_label: "Overcharged",
  verdict_detail: "\u20B910,200 in unnecessary add-ons (40% of bill)",
  items: [
    { name: "Eng Oil Diesel 5W30", price_display: "\u20B92,273", insight_class: "essential" },
    { name: "Oil Filter", price_display: "\u20B9350", insight_class: "essential" },
    { name: "Air Filter", price_display: "\u20B9620", insight_class: "essential" },
    { name: "Brake Fluid DOT4", price_display: "\u20B9480", insight_class: "essential" },
    { name: "Coolant Top-Up", price_display: "\u20B9380", insight_class: "essential" },
    { name: "Wiper Blades", price_display: "\u20B9450", insight_class: "essential" },
    { name: "AC Filter", price_display: "\u20B9451", insight_class: "essential" },
    { name: "Internal Panel Protection", price_display: "\u20B93,121", insight_class: "upsell" },
    { name: "Engine Decarbonising", price_display: "\u20B92,500", insight_class: "upsell" },
    { name: "Underbody Coating", price_display: "\u20B91,800", insight_class: "upsell" },
    { name: "AC Vent Perfume", price_display: "\u20B9980", insight_class: "upsell" },
    { name: "Seat Cover Wash", price_display: "\u20B9899", insight_class: "upsell" },
    { name: "Dashboard Polish", price_display: "\u20B9900", insight_class: "upsell" },
  ],
  top_essentials: [
    { name: "Eng Oil Diesel 5W30", price_display: "\u20B92,273", category: "Engine Oil" },
    { name: "Oil Filter", price_display: "\u20B9350", category: "Filter" },
    { name: "Air Filter", price_display: "\u20B9620", category: "Filter" },
    { name: "Brake Fluid DOT4", price_display: "\u20B9480", category: "Brakes" },
    { name: "Coolant Top-Up", price_display: "\u20B9380", category: "Cooling" },
    { name: "Wiper Blades", price_display: "\u20B9450", category: "Electrical" },
    { name: "AC Filter", price_display: "\u20B9451", category: "Filter" },
  ],
  top_upsells: [
    { name: "Internal Panel Protection", price_display: "\u20B93,121" },
    { name: "Engine Decarbonising", price_display: "\u20B92,500" },
    { name: "Underbody Coating", price_display: "\u20B91,800" },
    { name: "AC Vent Perfume", price_display: "\u20B9980" },
    { name: "Seat Cover Wash", price_display: "\u20B9899" },
    { name: "Dashboard Polish", price_display: "\u20B9900" },
  ],
  top_labor: [
    { name: "Periodic Maintenance Service", price_display: "\u20B93,398" },
    { name: "AC Service & Gas Top-Up", price_display: "\u20B92,800" },
    { name: "Wheel Alignment & Balancing", price_display: "\u20B91,500" },
    { name: "Brake Inspection & Cleanup", price_display: "\u20B92,369" },
  ],
  tips: [
    "Skip Internal Panel Protection next time \u2014 saves \u20B93,104",
    "Engine Decarbonising is optional for a 2017 diesel under 60k km",
    "Labor at 41% is reasonable for an authorized dealer",
  ],
  primary_nobg_url: "vehicles/ktm-250-duke.png",
};

const DEFAULT_PROPS: SlideProps = {
  vehicle: PLACEHOLDER_VEHICLE,
  durationSec: DEFAULT_DURATION_SEC,
  contentMonthYear: "March 2026",
  lang: "en",
};

// ── Registry-driven composition registration ────────────────────────

export const Root: React.FC = () => {
  const compositions: React.ReactNode[] = [];

  for (const registry of registries) {
    for (const [formatName, format] of Object.entries(
      registry.formats as Record<
        string,
        { width: number; height: number; fps: number; compositionSet: string }
      >
    )) {
      // Find all composition sets for this format (base + themed variants)
      const baseKey = format.compositionSet;
      const compSetKeys = Object.keys(registry).filter(
        (k) => k === baseKey || k.startsWith(`${baseKey}-`)
      );

      for (const compSetKey of compSetKeys) {
        const compSet = registry[compSetKey] as
          | Record<
              string,
              {
                component: string;
                defaultDuration: number;
                animationFrames?: number;
              }
            >
          | undefined;
        if (!compSet || typeof compSet !== "object") continue;

        const isPortrait = formatName.startsWith("portrait");
        const slideMap = isPortrait ? PORTRAIT_SLIDES : LANDSCAPE_SLIDES;
        const entries = Object.entries(compSet);
        const totalSlides = isPortrait ? entries.length : undefined;

        for (const [, config] of entries) {
          if (typeof config !== "object" || !config.component) continue;
          const Component = slideMap[config.component];
          if (!Component) continue; // Skip compositions without TSX components

          const isBillSlide = config.component.startsWith("Bill");
          const defaultProps = {
            ...DEFAULT_PROPS,
            ...(isBillSlide ? { bill: PLACEHOLDER_BILL } : {}),
            ...(isPortrait
              ? {
                  slideNumber: entries.indexOf(
                    entries.find(([, c]) => c.component === config.component)!
                  ) + 1,
                  totalSlides,
                }
              : {}),
          };

          compositions.push(
            <Composition
              key={`${formatName}-${compSetKey}-${config.component}`}
              id={config.component}
              component={Component}
              width={format.width}
              height={format.height}
              fps={format.fps}
              durationInFrames={Math.ceil(
                config.defaultDuration * format.fps
              )}
              defaultProps={defaultProps}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              calculateMetadata={async ({ props }: { props: any }) => ({
                durationInFrames: Math.ceil(
                  (props.durationSec || config.defaultDuration) * format.fps
                ),
              })}
            />
          );
        }
      }
    }
  }

  return <>{compositions}</>;
};
