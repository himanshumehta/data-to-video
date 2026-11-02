/**
 * ServiceBillTab — Handles service bill content type.
 * Owns: BILL_REELS_SLIDES, BillFullVideo, computeBillTotalFrames,
 * bill data loading guard, and empty slide 03 skip logic.
 */
import React, { useRef } from "react";
import { Player, PlayerRef } from "@remotion/player";
import { Audio, Sequence } from "remotion";

// Service bill slide components
import { BillHookReels } from "../../slides/reels/BillHookReels";
import { BillEssentialReels } from "../../slides/reels/BillEssentialReels";
import { BillOptionalReels } from "../../slides/reels/BillOptionalReels";
import { BillLaborReels } from "../../slides/reels/BillLaborReels";
import { BillTakeawayReels } from "../../slides/reels/BillTakeawayReels";
import { BillRatingReels } from "../../slides/reels/BillRatingReels";
import { BillThumbnailReels } from "../../slides/reels/BillThumbnailReels";

import type { Vehicle } from "../../types";
import type { SlideDefinition, GalleryConfig } from "./shared";
import { FPS } from "./shared";
import { SlideCard } from "./SlideCard";
import { ViewModeBar } from "./ViewModeBar";
import { usePreloadImage } from "../../utils/usePreloadImage";

// ── Slide arrays ────────────────────────────────────────────────────────

const BILL_REELS_SLIDES: SlideDefinition[] = [
  { id: "00", name: "Thumbnail", component: BillThumbnailReels as any, animationFrames: 1 },
  { id: "01", name: "Bill Overview", component: BillHookReels as any, animationFrames: 90 },
  { id: "02", name: "Essential Items", component: BillEssentialReels as any, animationFrames: 80 },
  { id: "03", name: "Add-On Items", component: BillOptionalReels as any, animationFrames: 80 },
  { id: "04", name: "Labor Charges", component: BillLaborReels as any, animationFrames: 70 },
  { id: "05", name: "Takeaways & Rating", component: BillTakeawayReels as any, animationFrames: 90 },
  { id: "thumbnail", name: "Thumbnail (End)", component: BillThumbnailReels as any, animationFrames: 1 },
];

// ── Bill Full Video internals ───────────────────────────────────────────

const BILL_VIDEO_SLIDES = BILL_REELS_SLIDES.filter(s => s.id !== "thumbnail");

// Narration slide IDs matching templates in service_bill_insight/narrations/
const BILL_NARRATION_IDS = ["00-thumbnail", "01-bill-overview", "02-essential", "03-optional", "04-labor", "05-takeaway"];

const BillFullVideo: React.FC<{ bill: any; narrationLang?: string }> = ({ bill, narrationLang = "en" }) => {
  // Preload vehicle image so frame 0 (thumbnail) renders with image ready
  usePreloadImage(bill?.primary_nobg_url);
  const langDurations = bill?.narration_durations?.[narrationLang] || {};
  const langPaths = bill?.narration_paths?.[narrationLang] || {};

  // Build slide schedule -- skip slides with no narration ONLY when narrations exist for other slides
  const hasAnyNarration = Object.keys(langDurations).length > 0 || Object.keys(langPaths).length > 0;
  const schedule = BILL_VIDEO_SLIDES
    .map((slide, i) => {
      const narrationId = BILL_NARRATION_IDS[i];
      const narrationDur = narrationId ? langDurations[narrationId] : null;
      const narrationSrc = narrationId ? langPaths[narrationId] : null;
      // Skip only when narrations exist but this specific slide has none
      if (hasAnyNarration && !narrationDur && !narrationSrc) return null;
      // Skip optional slide when bill has no upsells/grey area
      if (slide.id === "03" && !bill?.upsell_count && !bill?.grey_area_count) return null;
      const durationFrames = narrationDur ? Math.ceil((narrationDur + 0.5) * FPS) : slide.animationFrames;
      return { ...slide, durationFrames, narrationSrc };
    })
    .filter(Boolean) as { component: any; durationFrames: number; narrationSrc: string | null; id: string; name: string; animationFrames: number }[];

  // 300ms thumbnail flash at start (helps set thumbnail on Facebook)
  const thumbnailFrames = Math.ceil(0.3 * FPS);

  // Use Sequence per slide -- each slide gets its own local frame (clicks fire correctly)
  let accumulated = thumbnailFrames;
  return (
    <>
      {/* Thumbnail flash — 300ms at start */}
      <Sequence from={0} durationInFrames={thumbnailFrames}>
        <BillThumbnailReels bill={bill} slideNumber={0} totalSlides={schedule.length} />
      </Sequence>
      {schedule.map((s, i) => {
        const Comp = s.component;
        const from = accumulated;
        accumulated += s.durationFrames;
        return (
          <Sequence key={`slide-${i}`} from={from} durationInFrames={s.durationFrames}>
            <Comp bill={bill} slideNumber={i} totalSlides={schedule.length} />
            {s.narrationSrc && <Audio src={s.narrationSrc} volume={1} />}
          </Sequence>
        );
      })}
    </>
  );
};

// Compute total frames dynamically from bill data
function computeBillTotalFrames(bill: any, lang: string): number {
  const thumbnailFrames = Math.ceil(0.3 * FPS); // 300ms thumbnail flash
  const langDurations = bill?.narration_durations?.[lang] || {};
  const langPaths = bill?.narration_paths?.[lang] || {};
  const hasAnyNarration = Object.keys(langDurations).length > 0 || Object.keys(langPaths).length > 0;
  return thumbnailFrames + BILL_VIDEO_SLIDES.reduce((sum, slide, i) => {
    const narrationId = BILL_NARRATION_IDS[i];
    const narrationDur = narrationId ? langDurations[narrationId] : null;
    const narrationSrc = narrationId ? langPaths[narrationId] : null;
    if (hasAnyNarration && !narrationDur && !narrationSrc) return sum;
    if (slide.id === "03" && !bill?.upsell_count && !bill?.grey_area_count) return sum;
    return sum + (narrationDur ? Math.ceil((narrationDur + 0.5) * FPS) : slide.animationFrames);
  }, 0);
}

// ── Component ───────────────────────────────────────────────────────────

interface ServiceBillTabProps {
  vehicle: Vehicle;
  billData: any | null;
  config: GalleryConfig | null;
  showFinal: boolean;
  setShowFinal: (v: boolean) => void;
  narrationLang: string;
  setNarrationLang: (l: string) => void;
}

export const ServiceBillTab: React.FC<ServiceBillTabProps> = ({
  vehicle,
  billData,
  config,
  showFinal,
  setShowFinal,
  narrationLang,
  setNarrationLang,
}) => {
  const playerRefs = useRef<(PlayerRef | null)[]>([]);

  const fmt = { width: 1080, height: 1920, label: "9:16 Reels" };

  // Filter out empty optional slide for clean bills (0 upsells + 0 grey area)
  const activeSlides = billData && !billData.upsell_count && !billData.grey_area_count
    ? BILL_REELS_SLIDES.filter((s: any) => s.id !== "03")
    : BILL_REELS_SLIDES;
  const totalSlides = activeSlides.length;

  return (
    <>
      {/* Bill data loading guard */}
      {!billData && (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#f59e0b", fontSize: 16, fontWeight: 600 }}>
          No bill data loaded. Place current-bill.json in remotion/public/ or run:<br />
          <code style={{ background: "rgba(255,255,255,0.06)", padding: "4px 10px", borderRadius: 6, marginTop: 8, display: "inline-block" }}>
            python scripts/fetch_service_bill.py --bill-id &lt;uuid&gt;
          </code>
        </div>
      )}

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
          display: !billData ? "none" : "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
          gap: 24,
        }}
      >
        {activeSlides.map((slide, idx) => (
          <SlideCard
            key={`service-bill-9:16-${slide.id}`}
            slide={slide}
            idx={idx}
            vehicle={vehicle}
            totalSlides={totalSlides}
            showFinal={showFinal}
            playerRef={(ref) => { playerRefs.current[idx] = ref; }}
            width={fmt.width}
            height={fmt.height}
            billData={billData}
            scriptText={config?.narrationTexts?.[narrationLang]?.[slide.id]}
          />
        ))}
      </div>

      {/* Full Video Preview */}
      {billData && (() => {
        const totalFrames = computeBillTotalFrames(billData, narrationLang);
        const totalSec = totalFrames / FPS;
        return (
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>
              Full Video — {billData.manufacturer_name} {billData.vehicle_name}
            </h2>
            <div style={{
              background: "#18181b", borderRadius: 16, border: "1px solid #27272a",
              overflow: "hidden", maxWidth: 400,
            }}>
              <Player
                component={BillFullVideo}
                inputProps={{ bill: billData, narrationLang }}
                durationInFrames={Math.max(totalFrames, 1)}
                compositionWidth={1080}
                compositionHeight={1920}
                fps={FPS}
                style={{ width: "100%", aspectRatio: "1080 / 1920" }}
                controls
                loop
                key={`bill-video-${narrationLang}`}
              />
              <div style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#a1a1aa" }}>
                  Full Video — {BILL_VIDEO_SLIDES.length} slides
                </span>
                <span style={{ fontSize: 14, color: "#52525b" }}>
                  {totalSec.toFixed(1)}s ({Math.floor(totalSec / 60)}m {Math.round(totalSec % 60)}s)
                </span>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
};
