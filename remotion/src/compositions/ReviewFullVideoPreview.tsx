/**
 * ReviewFullVideoPreview — Full video composition for vehicle review content.
 *
 * Key differences from ownership-cost FullVideoPreview:
 *
 * 1. DATA-DRIVEN SLIDE INCLUSION
 *    Slides are only included when the vehicle has meaningful data for them.
 *    A vehicle with only universal data (specs, rating, pros/cons) gets 4 slides.
 *    A fully researched vehicle gets up to 10.
 *
 * 2. VARIABLE DEFAULT DURATIONS
 *    Each slide type has its own default duration based on content density.
 *    Score card and verdict get more time. Known issues gets less.
 *
 * 3. REVIEW STORY ARC
 *    Opens with the verdict (score card) → evidence slides → decisive close.
 *    Not a financial build-up like ownership cost.
 */

import React from "react";
import { AbsoluteFill, Audio, Series, Video, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

// Review portrait slides (4:5)
import {
  ReviewScoreCardPortrait,
  ReviewPerformancePortrait,
  ReviewSafetyPortrait,
  ReviewOwnerVoicePortrait,
  ReviewComfortPortrait,
  ReviewCostRealityPortrait,
  ReviewKnownIssuesPortrait,
  ReviewHeadToHeadPortrait,
  ReviewPotentialMapPortrait,
  ReviewProsConsPortrait,
  ReviewBuySkipPortrait,
} from "../slides/review-portrait";

// Review reels slides (9:16)
import {
  ReviewScoreCardReels,
  ReviewPerformanceReels,
  ReviewSafetyReels,
  ReviewOwnerVoiceReels,
  ReviewComfortReels,
  ReviewCostRealityReels,
  ReviewKnownIssuesReels,
  ReviewHeadToHeadReels,
  ReviewPotentialMapReels,
  ReviewProsConsReels,
  ReviewBuySkipReels,
} from "../slides/review-reels";

import type { Vehicle, PortraitSlideProps } from "../types";

loadFont();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface SlideEntry {
  id: string;
  name: string;
  component: React.FC<any>;
  /** Default seconds when no narration WAV exists */
  defaultDuration: number;
  /**
   * Returns true if the vehicle has enough data for this slide.
   * Slides that return false are excluded from the video entirely.
   */
  hasData: (v: Vehicle) => boolean;
}

// ── Slide data checks ─────────────────────────────────────────────
// These determine whether a slide is included in the video.

/** Universal — every published vehicle has expert_rating */
const always = () => true;

/** Research tier — depends on vehicle_research_data categories */
const hasSafety = (v: Vehicle) =>
  (v.safety_features && v.safety_features.length >= 2) || (v.safety_score != null && v.safety_score > 0);

const hasOwnerVoice = (v: Vehicle) =>
  v.owner_rating != null && v.owner_rating > 0 && (v.owner_review_count ?? 0) > 10;

const hasCostReality = (v: Vehicle) =>
  v.cost_per_day != null && v.cost_per_day > 0 && v.annual_total != null;

const hasKnownIssues = (v: Vehicle) =>
  v.known_issues != null && v.known_issues.length >= 1;

const hasHeadToHead = (v: Vehicle) =>
  v.comparison_specs != null && v.comparison_specs.length >= 3 && v.top_rival_name != null;

const hasProsOrCons = (v: Vehicle) =>
  (v.pros && v.pros.length >= 1) || (v.cons && v.cons.length >= 1);

const hasComfort = (v: Vehicle) => {
  const scores = (v as any).comfort_scores;
  const overall = (v as any).comfort_overall;
  return Array.isArray(scores) && scores.length > 0 && overall != null && overall > 0;
};

const hasPotentialMap = (v: Vehicle) => {
  const scores = (v as any).potential_map_scores;
  return Array.isArray(scores) && scores.length >= 3;
};

// ── Slide definitions ─────────────────────────────────────────────

const makeSlides = (
  portrait: boolean
): SlideEntry[] => [
  {
    id: "00-score-card",
    name: "Score Card",
    component: portrait ? ReviewScoreCardPortrait : ReviewScoreCardReels,
    defaultDuration: 6,
    hasData: always,
  },
  {
    id: "01-performance",
    name: "Performance",
    component: portrait ? ReviewPerformancePortrait : ReviewPerformanceReels,
    defaultDuration: 5,
    hasData: always, // specs exist for every vehicle
  },
  {
    id: "02-safety",
    name: "Safety",
    component: portrait ? ReviewSafetyPortrait : ReviewSafetyReels,
    defaultDuration: 5,
    hasData: hasSafety,
  },
  {
    id: "03-owner-voice",
    name: "Owner Voice",
    component: portrait ? ReviewOwnerVoicePortrait : ReviewOwnerVoiceReels,
    defaultDuration: 6,
    hasData: hasOwnerVoice,
  },
  {
    id: "03b-comfort",
    name: "Comfort & Ride",
    component: portrait ? ReviewComfortPortrait : ReviewComfortReels,
    defaultDuration: 5,
    hasData: hasComfort,
  },
  {
    id: "04-cost-reality",
    name: "Cost Reality",
    component: portrait ? ReviewCostRealityPortrait : ReviewCostRealityReels,
    defaultDuration: 5,
    hasData: hasCostReality,
  },
  {
    id: "05-known-issues",
    name: "Known Issues",
    component: portrait ? ReviewKnownIssuesPortrait : ReviewKnownIssuesReels,
    defaultDuration: 4,
    hasData: hasKnownIssues,
  },
  {
    id: "06-head-to-head",
    name: "Head to Head",
    component: portrait ? ReviewHeadToHeadPortrait : ReviewHeadToHeadReels,
    defaultDuration: 5,
    hasData: hasHeadToHead,
  },
  {
    id: "06b-potential-map",
    name: "Potential Map",
    component: portrait ? ReviewPotentialMapPortrait : ReviewPotentialMapReels,
    defaultDuration: 6,
    hasData: hasPotentialMap,
  },
  {
    id: "07-pros-cons",
    name: "Pros & Cons",
    component: portrait ? ReviewProsConsPortrait : ReviewProsConsReels,
    defaultDuration: 5,
    hasData: hasProsOrCons,
  },
  {
    id: "08-verdict",
    name: "Buy or Skip",
    component: portrait ? ReviewBuySkipPortrait : ReviewBuySkipReels,
    defaultDuration: 6,
    hasData: always, // verdict uses expert_rating which always exists
  },
];

export const REVIEW_PORTRAIT_SLIDES = makeSlides(true);
export const REVIEW_REELS_SLIDES = makeSlides(false);

// ── Composition ───────────────────────────────────────────────────

export interface ReviewFullVideoProps {
  vehicle: Vehicle;
  /** Per-slide durations from narration WAVs (slide_id → seconds) */
  slideDurations: Record<string, number>;
  /** Fallback when no WAV exists AND slide has no per-slide default */
  defaultDuration: number;
  contentMonthYear: string;
  lang: string;
  bgmSrc?: string;
  bgmVolume?: number;
  bgVideoSrc?: string;
  bgVideoOpacity?: number;
  narrationPaths?: Record<string, string>;
  format?: "portrait" | "reels";
}

export const ReviewFullVideoPreview: React.FC<ReviewFullVideoProps> = ({
  vehicle,
  slideDurations,
  defaultDuration = 5,
  contentMonthYear,
  lang,
  bgmSrc,
  bgmVolume = 0.25,
  bgVideoSrc,
  bgVideoOpacity = 0.2,
  narrationPaths = {},
  format = "portrait",
}) => {
  const { fps } = useVideoConfig();
  const allSlides = format === "reels" ? REVIEW_REELS_SLIDES : REVIEW_PORTRAIT_SLIDES;

  // Filter to slides that have data for this vehicle
  const dataSlides = allSlides.filter((s) => s.hasData(vehicle));

  // If narration WAVs exist, further filter to only narrated slides (curated)
  const hasNarrations = Object.keys(slideDurations).length > 0;
  const activeSlides = hasNarrations
    ? dataSlides.filter((s) => slideDurations[s.id] != null)
    : dataSlides;

  const activeCount = activeSlides.length;

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Background video overlay */}
      {bgVideoSrc && (
        <AbsoluteFill style={{ opacity: bgVideoOpacity }}>
          <Video
            src={bgVideoSrc}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            volume={0}
            loop
          />
        </AbsoluteFill>
      )}

      {/* Sequenced slides — data-filtered, with per-slide narration */}
      <Series>
        {activeSlides.map((slide, idx) => {
          // Priority: WAV duration > slide-specific default > global default
          const durSec = slideDurations[slide.id] ?? slide.defaultDuration ?? defaultDuration;
          const durFrames = Math.ceil(durSec * fps);
          const Comp = slide.component;
          const narrationSrc = narrationPaths[slide.id];

          const props: PortraitSlideProps = {
            vehicle,
            theme: { name: "default" } as PortraitSlideProps["theme"],
            durationSec: durSec,
            contentMonthYear,
            lang,
            slideNumber: idx + 1,
            totalSlides: activeCount,
          };

          return (
            <Series.Sequence key={slide.id} durationInFrames={durFrames}>
              <Comp {...props} />
              {narrationSrc && <Audio src={narrationSrc} volume={1} />}
            </Series.Sequence>
          );
        })}
      </Series>

      {/* BGM — loops full duration */}
      {bgmSrc && <Audio src={bgmSrc} volume={bgmVolume} loop />}
    </AbsoluteFill>
  );
};

/**
 * Compute total frames for the review video.
 *
 * Uses the same data-driven filtering as the composition:
 * - Excludes slides without vehicle data
 * - When slideDurations has entries (curated), only counts those slides
 * - Uses per-slide default durations (not one global default)
 */
export function computeReviewTotalFrames(
  slideDurations: Record<string, number>,
  defaultDuration: number,
  fps: number,
  format: "portrait" | "reels" = "portrait",
  vehicle?: Vehicle
): number {
  const allSlides = format === "reels" ? REVIEW_REELS_SLIDES : REVIEW_PORTRAIT_SLIDES;

  // If vehicle provided, filter by data availability
  const dataSlides = vehicle ? allSlides.filter((s) => s.hasData(vehicle)) : allSlides;

  const hasEntries = Object.keys(slideDurations).length > 0;
  const activeSlides = hasEntries
    ? dataSlides.filter((s) => slideDurations[s.id] != null)
    : dataSlides;

  return activeSlides.reduce((total, slide) => {
    const dur = slideDurations[slide.id] ?? slide.defaultDuration ?? defaultDuration;
    return total + Math.ceil(dur * fps);
  }, 0);
}
