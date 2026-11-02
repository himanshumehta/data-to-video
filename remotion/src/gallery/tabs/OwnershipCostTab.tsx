/**
 * OwnershipCostTab — Handles ownership cost content type.
 * Owns: SLIDES (4:5), REELS_SLIDES (9:16), Full Video preview,
 * Thumbnail preview, curation summary, and narration timing.
 */
import React, { useRef } from "react";
import { Player, PlayerRef } from "@remotion/player";

// Portrait slide components (4:5)
import { WhatYouWillLearnPortrait } from "../../slides/portrait/WhatYouWillLearnPortrait";
import { HookPortrait } from "../../slides/portrait/HookPortrait";
import { AnnualBreakdownPortrait } from "../../slides/portrait/AnnualBreakdownPortrait";
import { ServiceDeepDivePortrait } from "../../slides/portrait/ServiceDeepDivePortrait";
import { YearByYearPortrait } from "../../slides/portrait/YearByYearPortrait";
import { DepreciationPortrait } from "../../slides/portrait/DepreciationPortrait";
import { VsSegmentPortrait } from "../../slides/portrait/VsSegmentPortrait";
import { ReviewCtaPortrait } from "../../slides/portrait/ReviewCtaPortrait";
import { EndCardPortrait } from "../../slides/portrait/EndCardPortrait";

// Reels slide components (9:16)
import { WhatYouWillLearnReels } from "../../slides/reels/WhatYouWillLearnReels";
import { HookReels } from "../../slides/reels/HookReels";
import { AnnualBreakdownReels } from "../../slides/reels/AnnualBreakdownReels";
import { ServiceDeepDiveReels } from "../../slides/reels/ServiceDeepDiveReels";
import { YearByYearReels } from "../../slides/reels/YearByYearReels";
import { DepreciationReels } from "../../slides/reels/DepreciationReels";
import { VsSegmentReels } from "../../slides/reels/VsSegmentReels";
import { ReviewCtaReels } from "../../slides/reels/ReviewCtaReels";
import { EndCardReels } from "../../slides/reels/EndCardReels";
import { ThumbnailReels } from "../../slides/reels/ThumbnailReels";

// Full video composition
import {
  FullVideoPreview,
  computeTotalFrames,
  SLIDES as VIDEO_SLIDES,
} from "../../compositions/FullVideoPreview";
import type { FullVideoProps } from "../../compositions/FullVideoPreview";

import type { Vehicle } from "../../types";
import type { SlideDefinition, FormatKey, GalleryConfig } from "./shared";
import { FPS } from "./shared";
import { SlideCard } from "./SlideCard";
import { ViewModeBar } from "./ViewModeBar";

// ── Slide arrays ────────────────────────────────────────────────────────

const SLIDES: SlideDefinition[] = [
  { id: "00", name: "What You'll Learn", component: WhatYouWillLearnPortrait, animationFrames: 60 },
  { id: "01", name: "Hook", component: HookPortrait, animationFrames: 90 },
  { id: "02", name: "Annual Breakdown", component: AnnualBreakdownPortrait, animationFrames: 80 },
  { id: "03", name: "Service Deep Dive", component: ServiceDeepDivePortrait, animationFrames: 65 },
  { id: "04", name: "Year by Year", component: YearByYearPortrait, animationFrames: 70 },
  { id: "05", name: "Depreciation", component: DepreciationPortrait, animationFrames: 65 },
  { id: "07", name: "vs Segment", component: VsSegmentPortrait, animationFrames: 65 },
  { id: "10", name: "Review CTA", component: ReviewCtaPortrait, animationFrames: 65 },
  { id: "11", name: "End Card", component: EndCardPortrait, animationFrames: 50 },
];

const REELS_SLIDES: SlideDefinition[] = [
  { id: "00", name: "What You'll Learn", component: WhatYouWillLearnReels, animationFrames: 60 },
  { id: "01", name: "Hook", component: HookReels, animationFrames: 90 },
  { id: "02", name: "Annual Breakdown", component: AnnualBreakdownReels, animationFrames: 80 },
  { id: "03", name: "Service Deep Dive", component: ServiceDeepDiveReels, animationFrames: 65 },
  { id: "04", name: "Year by Year", component: YearByYearReels, animationFrames: 70 },
  { id: "05", name: "Depreciation", component: DepreciationReels, animationFrames: 65 },
  { id: "07", name: "vs Segment", component: VsSegmentReels, animationFrames: 65 },
  { id: "10", name: "Review CTA", component: ReviewCtaReels, animationFrames: 65 },
  { id: "11", name: "End Card", component: EndCardReels, animationFrames: 50 },
];

const FORMATS: Record<FormatKey, { slides: SlideDefinition[]; width: number; height: number; label: string }> = {
  "4:5": { slides: SLIDES, width: 1080, height: 1350, label: "4:5 Posts" },
  "9:16": { slides: REELS_SLIDES, width: 1080, height: 1920, label: "9:16 Reels" },
};

// ── Component ───────────────────────────────────────────────────────────

interface OwnershipCostTabProps {
  vehicle: Vehicle;
  config: GalleryConfig | null;
  format: FormatKey;
  setFormat: (f: FormatKey) => void;
  showFinal: boolean;
  setShowFinal: (v: boolean) => void;
  narrationLang: string;
  setNarrationLang: (l: string) => void;
}

export const OwnershipCostTab: React.FC<OwnershipCostTabProps> = ({
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

      {/* Curation summary — only for 9:16 */}
      {format === "9:16" && config?.curation?.["instagram-reels"] && (() => {
        const cur = config.curation["instagram-reels"];
        const isOver = cur.maxDuration && cur.totalDuration > cur.maxDuration;
        return (
          <div style={{
            marginBottom: 20,
            padding: "14px 20px",
            borderRadius: 12,
            background: isOver ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)",
            border: `1px solid ${isOver ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: isOver ? "#ef4444" : "#10b981" }}>
                Claude Curate: {cur.selectedSlides.length}/{totalSlides} slides selected
              </span>
              <span style={{ fontSize: 13, color: "#71717a", marginLeft: 16 }}>
                {cur.totalDuration}s / {cur.maxDuration}s limit
              </span>
              {cur.headroom != null && (
                <span style={{ fontSize: 13, color: "#52525b", marginLeft: 12 }}>
                  ({cur.headroom}s headroom)
                </span>
              )}
            </div>
            <span style={{ fontSize: 12, color: "#52525b" }}>
              {cur.excludedSlides.length} slides excluded
            </span>
          </div>
        );
      })()}

      {/* Slide grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
          gap: 24,
        }}
      >
        {(() => {
          const curationKey = format === "9:16" ? "instagram-reels" : null;
          const cur = curationKey && config?.curation?.[curationKey];
          const narrationMap = config?.narrationTexts?.[narrationLang] ?? {};
          return activeSlides.map((slide, idx) => {
            const fullId = cur
              ? [...(cur.selectedSlides || []), ...(cur.excludedSlides || [])].find((s) => s.startsWith(slide.id + "-"))
              : null;
            const isExcluded = cur ? cur.excludedSlides?.includes(fullId || "") : false;
            const reason = fullId && cur?.reasoning?.[fullId];
            const narrationKey =
              fullId && narrationMap[fullId]
                ? fullId
                : Object.keys(narrationMap).find((k) => k === slide.id || k.startsWith(slide.id + "-"));
            return (
              <SlideCard
                key={`ownership-cost-${format}-${slide.id}`}
                slide={slide}
                idx={idx}
                vehicle={vehicle}
                totalSlides={totalSlides}
                showFinal={showFinal}
                playerRef={(ref) => { playerRefs.current[idx] = ref; }}
                width={fmt.width}
                height={fmt.height}
                excluded={isExcluded}
                reason={reason}
                scriptText={narrationKey ? narrationMap[narrationKey] : undefined}
              />
            );
          });
        })()}
      </div>

      {/* Thumbnail Preview */}
      <div style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Thumbnail Preview</h2>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {(() => {
            if (format !== "9:16") return <div style={{ color: "#71717a", fontSize: 13 }}>Thumbnail only available for 9:16 format</div>;
            const ThumbnailComp = ThumbnailReels;
            const thumbProps = {
              vehicle,
              theme: (config as any)?.theme ?? {},
              durationSec: 1,
              contentMonthYear: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
              lang: "en",
              slideNumber: 1,
              totalSlides: 1,
            };
            const thumbScale = 0.18;
            return (
              <div style={{ textAlign: "center" }}>
                <Player
                  component={ThumbnailComp}
                  inputProps={thumbProps}
                  durationInFrames={1}
                  compositionWidth={fmt.width}
                  compositionHeight={fmt.height}
                  fps={30}
                  style={{
                    width: fmt.width * thumbScale,
                    height: fmt.height * thumbScale,
                    borderRadius: 12,
                    border: "1px solid #27272a",
                    background: "#18181b",
                  }}
                />
              </div>
            );
          })()}
        </div>
      </div>

      {/* Full Video Preview */}
      <div style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Full Video Preview</h2>

        {/* Narration timing table */}
        {(() => {
          const curationKey = format === "9:16" ? "instagram-reels" : null;
          const cur = curationKey && config?.curation?.[curationKey];
          const excludedFullIds = cur ? cur.excludedSlides : [];
          const selectedCount = cur ? cur.selectedSlides.length : VIDEO_SLIDES.length;
          const curatedDuration = cur ? cur.totalDuration : config?.totalDuration ?? 0;
          const maxDur = cur?.maxDuration;

          return (
            <div
              style={{
                background: "#18181b",
                borderRadius: 12,
                border: "1px solid #27272a",
                padding: 20,
                marginBottom: 24,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: "#a1a1aa", marginBottom: 12 }}>
                Narration Timing
                {config?.hasNarration ? (
                  <span style={{ color: "#10b981", marginLeft: 12 }}>
                    {selectedCount} WAVs — {curatedDuration}s
                    {maxDur ? ` / ${maxDur}s limit` : " total"}
                  </span>
                ) : (
                  <span style={{ color: "#f59e0b", marginLeft: 12 }}>
                    No WAVs found — using {config?.defaultDuration ?? 5}s default
                  </span>
                )}
                {cur && excludedFullIds.length > 0 && (
                  <span style={{ color: "#ef4444", marginLeft: 12, fontSize: 12 }}>
                    {excludedFullIds.length} skipped
                  </span>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {VIDEO_SLIDES.map((s) => {
                  const dur = config?.slideDurations[s.id];
                  const isExcluded = excludedFullIds.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        background: isExcluded
                          ? "rgba(239,68,68,0.06)"
                          : dur
                          ? "rgba(16,185,129,0.08)"
                          : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isExcluded ? "rgba(239,68,68,0.25)" : dur ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)"}`,
                      }}
                    >
                      <div style={{ fontSize: 11, color: isExcluded ? "#ef4444" : "#71717a", fontWeight: 600 }}>
                        {isExcluded ? "\u2717 " : ""}{s.id}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: isExcluded ? "#ef4444" : dur ? "#10b981" : "#52525b" }}>
                        {dur ? `${dur.toFixed(1)}s` : `${config?.defaultDuration ?? 5}s`}
                      </div>
                      <div style={{ fontSize: 10, color: isExcluded ? "#ef4444" : "#52525b" }}>
                        {isExcluded ? "skipped" : dur ? "from WAV" : "default"}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: "#52525b", display: "flex", gap: 16 }}>
                <span>BGM: {config?.bgmAvailable ? "\u2705 available" : "\u274C missing"}</span>
                <span>BG Video: {config?.bgVideoAvailable ? "\u2705 available" : "\u274C missing"}</span>
              </div>
            </div>
          );
        })()}

        {/* Full video player — respects curation (skips excluded slides) */}
        {(() => {
          const allDurations = config?.slideDurations ?? {};
          const defaultDur = config?.defaultDuration ?? 5;

          const curationKey = format === "9:16" ? "instagram-reels" : null;
          const cur = curationKey && config?.curation?.[curationKey];
          const slideDurations: Record<string, number> = {};
          if (cur) {
            for (const sid of cur.selectedSlides) {
              if (allDurations[sid] != null) slideDurations[sid] = allDurations[sid];
            }
          } else {
            Object.assign(slideDurations, allDurations);
          }

          const videoFormat = format === "9:16" ? "reels" as const : "portrait" as const;
          const totalFrames = computeTotalFrames(slideDurations, defaultDur, FPS, videoFormat);
          const totalSec = totalFrames / FPS;

          const fullVideoProps: FullVideoProps = {
            vehicle,
            slideDurations,
            defaultDuration: defaultDur,
            format: videoFormat,
            contentMonthYear: new Date().toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            }),
            lang: "en",
            bgmSrc: config?.bgmAvailable ? "/bgm.mp3" : undefined,
            bgmVolume: 0.25,
            bgVideoSrc: config?.bgVideoAvailable ? "/bg-loop.mp4" : undefined,
            bgVideoOpacity: 0.3,
            narrationPaths: (() => {
              const langPaths = config?.allNarrationPaths?.[narrationLang] ?? config?.narrationPaths ?? {};
              if (!cur) return langPaths;
              const filtered: Record<string, string> = {};
              for (const sid of cur.selectedSlides) {
                if (langPaths[sid]) filtered[sid] = langPaths[sid];
              }
              return filtered;
            })(),
          };

          return (
            <div
              style={{
                background: "#18181b",
                borderRadius: 12,
                border: "1px solid #27272a",
                overflow: "hidden",
              }}
            >
              <Player
                component={FullVideoPreview}
                inputProps={fullVideoProps}
                durationInFrames={Math.max(totalFrames, 1)}
                compositionWidth={fmt.width}
                compositionHeight={fmt.height}
                fps={FPS}
                style={{
                  width: "100%",
                  maxWidth: 540,
                  margin: "0 auto",
                  aspectRatio: `${fmt.width} / ${fmt.height}`,
                }}
                controls
                loop
              />
              <div style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#a1a1aa" }}>
                  Full Video — {totalSlides} slides
                </span>
                <span style={{ fontSize: 14, color: "#52525b" }}>
                  {totalSec.toFixed(1)}s ({Math.floor(totalSec / 60)}m {Math.round(totalSec % 60)}s)
                </span>
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
};

/** Format definitions for the ownership-cost content type */
export const OWNERSHIP_COST_FORMATS = FORMATS;
