/**
 * VehicleReviewTab — Handles vehicle review content type.
 * Owns: REVIEW_PORTRAIT_SLIDES (4:5), REVIEW_REELS_SLIDES (9:16).
 */
import React, { useRef } from "react";
import { PlayerRef } from "@remotion/player";

// Vehicle review portrait slide components (4:5)
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
} from "../../slides/review-portrait";

// Vehicle review reels slide components (9:16)
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
} from "../../slides/review-reels";

import type { Vehicle } from "../../types";
import type { SlideDefinition, FormatKey, GalleryConfig } from "./shared";
import { SlideCard } from "./SlideCard";
import { ViewModeBar } from "./ViewModeBar";

// ── Slide arrays ────────────────────────────────────────────────────────

const REVIEW_PORTRAIT_SLIDES: SlideDefinition[] = [
  { id: "00", name: "Score Card", component: ReviewScoreCardPortrait, animationFrames: 80 },
  { id: "01", name: "Performance", component: ReviewPerformancePortrait, animationFrames: 70 },
  { id: "02", name: "Safety", component: ReviewSafetyPortrait, animationFrames: 65 },
  { id: "03", name: "Owner Voice", component: ReviewOwnerVoicePortrait, animationFrames: 75 },
  { id: "03b", name: "Comfort & Ride", component: ReviewComfortPortrait, animationFrames: 65 },
  { id: "04", name: "Cost Reality", component: ReviewCostRealityPortrait, animationFrames: 70 },
  { id: "05", name: "Known Issues", component: ReviewKnownIssuesPortrait, animationFrames: 60 },
  { id: "06", name: "Head to Head", component: ReviewHeadToHeadPortrait, animationFrames: 75 },
  { id: "06b", name: "Potential Map", component: ReviewPotentialMapPortrait, animationFrames: 70 },
  { id: "07", name: "Pros & Cons", component: ReviewProsConsPortrait, animationFrames: 65 },
  { id: "08", name: "Buy or Skip", component: ReviewBuySkipPortrait, animationFrames: 80 },
];

const REVIEW_REELS_SLIDES: SlideDefinition[] = [
  { id: "00", name: "Score Card", component: ReviewScoreCardReels, animationFrames: 80 },
  { id: "01", name: "Performance", component: ReviewPerformanceReels, animationFrames: 70 },
  { id: "02", name: "Safety", component: ReviewSafetyReels, animationFrames: 65 },
  { id: "03", name: "Owner Voice", component: ReviewOwnerVoiceReels, animationFrames: 75 },
  { id: "03b", name: "Comfort & Ride", component: ReviewComfortReels, animationFrames: 65 },
  { id: "04", name: "Cost Reality", component: ReviewCostRealityReels, animationFrames: 70 },
  { id: "05", name: "Known Issues", component: ReviewKnownIssuesReels, animationFrames: 60 },
  { id: "06", name: "Head to Head", component: ReviewHeadToHeadReels, animationFrames: 75 },
  { id: "06b", name: "Potential Map", component: ReviewPotentialMapReels, animationFrames: 70 },
  { id: "07", name: "Pros & Cons", component: ReviewProsConsReels, animationFrames: 65 },
  { id: "08", name: "Buy or Skip", component: ReviewBuySkipReels, animationFrames: 80 },
];

const FORMATS: Record<FormatKey, { slides: SlideDefinition[]; width: number; height: number; label: string }> = {
  "4:5": { slides: REVIEW_PORTRAIT_SLIDES, width: 1080, height: 1350, label: "4:5 Posts" },
  "9:16": { slides: REVIEW_REELS_SLIDES, width: 1080, height: 1920, label: "9:16 Reels" },
};

// ── Component ───────────────────────────────────────────────────────────

interface VehicleReviewTabProps {
  vehicle: Vehicle;
  config: GalleryConfig | null;
  format: FormatKey;
  setFormat: (f: FormatKey) => void;
  showFinal: boolean;
  setShowFinal: (v: boolean) => void;
  narrationLang: string;
  setNarrationLang: (l: string) => void;
}

export const VehicleReviewTab: React.FC<VehicleReviewTabProps> = ({
  vehicle,
  config,
  format,
  setFormat,
  showFinal,
  setShowFinal,
  narrationLang,
  setNarrationLang,
}) => {
  const playerRefs = useRef<(PlayerRef | null)[]>([]);
  const fmt = FORMATS[format] || FORMATS["9:16"];
  const activeSlides = fmt.slides;
  const totalSlides = activeSlides.length;

  return (
    <>
      {/* Format selector */}
      <div style={{ marginBottom: 24, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(Object.keys(FORMATS) as FormatKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setFormat(key)}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: format === key ? "#f59e0b" : "#27272a",
              background: format === key ? "rgba(245,158,11,0.12)" : "#18181b",
              color: format === key ? "#f59e0b" : "#71717a",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {FORMATS[key].label}
          </button>
        ))}
        <div style={{ width: 1, background: "#27272a", margin: "0 8px" }} />
      </div>
      <ViewModeBar
        showFinal={showFinal}
        setShowFinal={setShowFinal}
        narrationLang={narrationLang}
        setNarrationLang={setNarrationLang}
        config={config}
      />

      {/* Slide grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
          gap: 24,
        }}
      >
        {activeSlides.map((slide, idx) => (
          <SlideCard
            key={`vehicle-review-${format}-${slide.id}`}
            slide={slide}
            idx={idx}
            vehicle={vehicle}
            totalSlides={totalSlides}
            showFinal={showFinal}
            playerRef={(ref) => { playerRefs.current[idx] = ref; }}
            width={fmt.width}
            height={fmt.height}
            scriptText={config?.narrationTexts?.[narrationLang]?.[slide.id]}
          />
        ))}
      </div>
    </>
  );
};

/** Format definitions for the vehicle-review content type */
export const VEHICLE_REVIEW_FORMATS = FORMATS;
