import React from "react";
import { AbsoluteFill, Audio, Series, Video, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

// Portrait slides (4:5)
import { WhatYouWillLearnPortrait } from "../slides/portrait/WhatYouWillLearnPortrait";
import { HookPortrait } from "../slides/portrait/HookPortrait";
import { AnnualBreakdownPortrait } from "../slides/portrait/AnnualBreakdownPortrait";
import { ServiceDeepDivePortrait } from "../slides/portrait/ServiceDeepDivePortrait";
import { YearByYearPortrait } from "../slides/portrait/YearByYearPortrait";
import { DepreciationPortrait } from "../slides/portrait/DepreciationPortrait";
import { VsSegmentPortrait } from "../slides/portrait/VsSegmentPortrait";
import { ReviewCtaPortrait } from "../slides/portrait/ReviewCtaPortrait";
import { EndCardPortrait } from "../slides/portrait/EndCardPortrait";

// Reels slides (9:16)
import { WhatYouWillLearnReels } from "../slides/reels/WhatYouWillLearnReels";
import { HookReels } from "../slides/reels/HookReels";
import { AnnualBreakdownReels } from "../slides/reels/AnnualBreakdownReels";
import { ServiceDeepDiveReels } from "../slides/reels/ServiceDeepDiveReels";
import { YearByYearReels } from "../slides/reels/YearByYearReels";
import { DepreciationReels } from "../slides/reels/DepreciationReels";
import { VsSegmentReels } from "../slides/reels/VsSegmentReels";
import { ReviewCtaReels } from "../slides/reels/ReviewCtaReels";
import { EndCardReels } from "../slides/reels/EndCardReels";
import { ThumbnailReels } from "../slides/reels/ThumbnailReels";

import type { Vehicle, PortraitSlideProps } from "../types";
import { usePreloadImage } from "../utils/usePreloadImage";

loadFont();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface SlideEntry {
  id: string;
  name: string;
  component: React.FC<any>;
}

export const PORTRAIT_SLIDES: SlideEntry[] = [
  { id: "00-what-you-will-learn", name: "What You'll Learn", component: WhatYouWillLearnPortrait },
  { id: "01-hook", name: "Hook", component: HookPortrait },
  { id: "02-annual-breakdown", name: "Annual Breakdown", component: AnnualBreakdownPortrait },
  { id: "03-service-deep-dive", name: "Service Deep Dive", component: ServiceDeepDivePortrait },
  { id: "04-year-by-year", name: "Year by Year", component: YearByYearPortrait },
  { id: "05-depreciation", name: "Depreciation", component: DepreciationPortrait },
  { id: "07-vs-segment", name: "vs Segment", component: VsSegmentPortrait },
  { id: "10-review-cta", name: "Review CTA", component: ReviewCtaPortrait },
  { id: "11-end-card", name: "End Card", component: EndCardPortrait },
];

export const REELS_SLIDES: SlideEntry[] = [
  { id: "00-what-you-will-learn", name: "What You'll Learn", component: WhatYouWillLearnReels },
  { id: "01-hook", name: "Hook", component: HookReels },
  { id: "02-annual-breakdown", name: "Annual Breakdown", component: AnnualBreakdownReels },
  { id: "03-service-deep-dive", name: "Service Deep Dive", component: ServiceDeepDiveReels },
  { id: "04-year-by-year", name: "Year by Year", component: YearByYearReels },
  { id: "05-depreciation", name: "Depreciation", component: DepreciationReels },
  { id: "07-vs-segment", name: "vs Segment", component: VsSegmentReels },
  { id: "10-review-cta", name: "Review CTA", component: ReviewCtaReels },
  { id: "11-end-card", name: "End Card", component: EndCardReels },
];

// Backward compat — Gallery narration timing uses this
export const SLIDES = PORTRAIT_SLIDES;

export interface FullVideoProps {
  vehicle: Vehicle;
  slideDurations: Record<string, number>;
  defaultDuration: number;
  contentMonthYear: string;
  lang: string;
  bgmSrc?: string;
  bgmVolume?: number;
  bgVideoSrc?: string;
  bgVideoOpacity?: number;
  narrationPaths?: Record<string, string>;
  /** Which slide set to use — "portrait" (4:5) or "reels" (9:16) */
  format?: "portrait" | "reels";
}

export const FullVideoPreview: React.FC<FullVideoProps> = ({
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
  // Preload vehicle image so frame 0 (thumbnail) renders with image ready
  usePreloadImage(vehicle.primary_nobg_url);
  const { fps } = useVideoConfig();
  const slideSet = format === "reels" ? REELS_SLIDES : PORTRAIT_SLIDES;

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

      {/* Sequenced slides — thumbnail flash + curated slides, with narration audio */}
      <Series>
        {/* Thumbnail flash — 300ms at start (reels only) */}
        {format === "reels" && (
          <Series.Sequence durationInFrames={Math.ceil(0.3 * fps)}>
            <ThumbnailReels
              vehicle={vehicle}
              theme={{ name: "default" } as PortraitSlideProps["theme"]}
              durationSec={0.3}
              contentMonthYear={contentMonthYear}
              lang={lang}
              slideNumber={0}
              totalSlides={slideSet.length}
            />
          </Series.Sequence>
        )}
        {(() => {
          const hasEntries = Object.keys(slideDurations).length > 0;
          const activeSlides = slideSet.filter(
            (slide) => !hasEntries || slideDurations[slide.id] != null
          );
          const activeCount = activeSlides.length;

          return activeSlides.map((slide, idx) => {
            const durSec = slideDurations[slide.id] ?? defaultDuration;
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
          });
        })()}
      </Series>

      {/* BGM — loops for full duration, 25% volume */}
      {bgmSrc && (
        <Audio src={bgmSrc} volume={bgmVolume} loop />
      )}
    </AbsoluteFill>
  );
};

/**
 * Compute total frames. If slideDurations has entries, only counts
 * slides present in it (curated). Otherwise counts all slides.
 */
export function computeTotalFrames(
  slideDurations: Record<string, number>,
  defaultDuration: number,
  fps: number,
  format: "portrait" | "reels" = "portrait"
): number {
  const slideSet = format === "reels" ? REELS_SLIDES : PORTRAIT_SLIDES;
  const hasEntries = Object.keys(slideDurations).length > 0;
  // 300ms thumbnail flash at start for reels
  const thumbnailFrames = format === "reels" ? Math.ceil(0.3 * fps) : 0;
  return slideSet
    .filter((slide) => !hasEntries || slideDurations[slide.id] != null)
    .reduce((total, slide) => {
      const dur = slideDurations[slide.id] ?? defaultDuration;
      return total + Math.ceil(dur * fps);
    }, thumbnailFrames);
}
