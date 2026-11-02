/**
 * OwnerVerdictTab — Handles owner verdict content type.
 * Owns: VERDICT_PORTRAIT_SLIDES (4:5), VERDICT_REELS_SLIDES (9:16),
 * verdict data warning, and independent verdict vehicle data.
 */
import React, { useRef } from "react";
import { PlayerRef } from "@remotion/player";

// Owner verdict portrait slide components (4:5)
import {
  VerdictHookPortrait,
  VerdictRatingOverviewPortrait,
  VerdictWhatOwnersLovePortrait,
  VerdictTopComplaintsPortrait,
  VerdictOwnerProfilePortrait,
  VerdictSentimentSplitPortrait,
  VerdictDealBreakersPortrait,
  VerdictVerdictPortrait,
  VerdictEndCardPortrait,
} from "../../slides/verdict-portrait";

// Owner verdict reels slide components (9:16)
import {
  VerdictHookReels,
  VerdictRatingOverviewReels,
  VerdictWhatOwnersLoveReels,
  VerdictTopComplaintsReels,
  VerdictOwnerProfileReels,
  VerdictSentimentSplitReels,
  VerdictDealBreakersReels,
  VerdictVerdictReels,
  VerdictEndCardReels,
} from "../../slides/verdict-reels";

import type { Vehicle } from "../../types";
import type { SlideDefinition, FormatKey, GalleryConfig } from "./shared";
import { SlideCard } from "./SlideCard";
import { ViewModeBar } from "./ViewModeBar";

// ── Slide arrays ────────────────────────────────────────────────────────

const VERDICT_PORTRAIT_SLIDES: SlideDefinition[] = [
  { id: "00", name: "Hook", component: VerdictHookPortrait, animationFrames: 60 },
  { id: "01", name: "Rating Overview", component: VerdictRatingOverviewPortrait, animationFrames: 80 },
  { id: "02", name: "What Owners Love", component: VerdictWhatOwnersLovePortrait, animationFrames: 90 },
  { id: "03", name: "Top Complaints", component: VerdictTopComplaintsPortrait, animationFrames: 90 },
  { id: "04", name: "Owner Profile", component: VerdictOwnerProfilePortrait, animationFrames: 70 },
  { id: "05", name: "Sentiment Split", component: VerdictSentimentSplitPortrait, animationFrames: 75 },
  { id: "06", name: "Deal Breakers", component: VerdictDealBreakersPortrait, animationFrames: 85 },
  { id: "07", name: "Final Verdict", component: VerdictVerdictPortrait, animationFrames: 80 },
  { id: "08", name: "End Card", component: VerdictEndCardPortrait, animationFrames: 50 },
];

const VERDICT_REELS_SLIDES: SlideDefinition[] = [
  { id: "00", name: "Hook", component: VerdictHookReels, animationFrames: 60 },
  { id: "01", name: "Rating Overview", component: VerdictRatingOverviewReels, animationFrames: 80 },
  { id: "02", name: "What Owners Love", component: VerdictWhatOwnersLoveReels, animationFrames: 90 },
  { id: "03", name: "Top Complaints", component: VerdictTopComplaintsReels, animationFrames: 90 },
  { id: "04", name: "Owner Profile", component: VerdictOwnerProfileReels, animationFrames: 70 },
  { id: "05", name: "Sentiment Split", component: VerdictSentimentSplitReels, animationFrames: 75 },
  { id: "06", name: "Deal Breakers", component: VerdictDealBreakersReels, animationFrames: 85 },
  { id: "07", name: "Final Verdict", component: VerdictVerdictReels, animationFrames: 80 },
  { id: "08", name: "End Card", component: VerdictEndCardReels, animationFrames: 50 },
];

const FORMATS: Record<FormatKey, { slides: SlideDefinition[]; width: number; height: number; label: string }> = {
  "4:5": { slides: VERDICT_PORTRAIT_SLIDES, width: 1080, height: 1350, label: "4:5 Posts" },
  "9:16": { slides: VERDICT_REELS_SLIDES, width: 1080, height: 1920, label: "9:16 Reels" },
};

// ── Component ───────────────────────────────────────────────────────────

interface OwnerVerdictTabProps {
  vehicle: Vehicle;
  /** Whether verdict-specific data was loaded (null = not loaded) */
  hasVerdictData: boolean;
  config: GalleryConfig | null;
  format: FormatKey;
  setFormat: (f: FormatKey) => void;
  showFinal: boolean;
  setShowFinal: (v: boolean) => void;
  narrationLang: string;
  setNarrationLang: (l: string) => void;
}

export const OwnerVerdictTab: React.FC<OwnerVerdictTabProps> = ({
  vehicle,
  hasVerdictData,
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
      {/* Verdict data warning */}
      {!hasVerdictData && (
        <div style={{
          marginBottom: 20, padding: "14px 20px", borderRadius: 12,
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
          fontSize: 14, fontWeight: 600, color: "#ef4444",
        }}>
          No owner verdict data loaded (owner-verdict is a work-in-progress content type). Write it to:<br />
          <code style={{ background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 4, marginTop: 4, display: "inline-block" }}>
            remotion/public/current-verdict.json
          </code>
        </div>
      )}

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
            key={`owner-verdict-${format}-${slide.id}`}
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

/** Format definitions for the owner-verdict content type */
export const OWNER_VERDICT_FORMATS = FORMATS;
