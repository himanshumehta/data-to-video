/**
 * Gallery: live preview of the ownership-cost reel slides.
 *
 * Reads remotion/public/current-vehicle.json (written by
 * `ownership_pipeline.py --step preview`) and falls back to a placeholder
 * vehicle. Shows every slide, the thumbnail, and the full sequenced reel.
 */
import React, { useEffect, useState } from "react";
import { Player } from "@remotion/player";
import { loadFont } from "@remotion/google-fonts/Inter";

import registry from "../../../content_types/ownership_cost/remotion.json";
import { FullVideoPreview, REELS_SLIDES, computeTotalFrames } from "../compositions/FullVideoPreview";
import type { FullVideoProps } from "../compositions/FullVideoPreview";
import { ThumbnailReels } from "../slides/reels/ThumbnailReels";
import { PLACEHOLDER_VEHICLE } from "../placeholderVehicle";
import type { Vehicle } from "../types";
import { FPS, REEL_HEIGHT, REEL_WIDTH, SlideCard } from "./SlideCard";
import type { GallerySlide } from "./SlideCard";

loadFont();

const DEFAULT_SLIDE_SEC = 5;
const THUMBNAIL_SCALE = 0.18;

const compositions = registry.reelsCompositions as Record<string, { animationFrames?: number }>;
const SLIDES: GallerySlide[] = REELS_SLIDES.map((s) => ({
  ...s,
  animationFrames: compositions[s.id]?.animationFrames ?? DEFAULT_SLIDE_SEC * FPS,
}));

async function loadVehicle(): Promise<Vehicle | null> {
  try {
    const resp = await fetch("/current-vehicle.json");
    return resp.ok ? ((await resp.json()) as Vehicle) : null;
  } catch {
    return null;
  }
}

const toggleStyle = (active: boolean): React.CSSProperties => ({
  padding: "8px 20px",
  borderRadius: 8,
  border: "1px solid",
  borderColor: active ? "#10b981" : "#27272a",
  background: active ? "rgba(16,185,129,0.12)" : "#18181b",
  color: active ? "#10b981" : "#71717a",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
});

export const Gallery: React.FC = () => {
  const [vehicle, setVehicle] = useState<Vehicle>(PLACEHOLDER_VEHICLE);
  const [loaded, setLoaded] = useState(false);
  const [showFinal, setShowFinal] = useState(true);
  const contentMonthYear = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  useEffect(() => {
    loadVehicle().then((v) => {
      if (v) setVehicle(v);
      setLoaded(true);
    });
  }, []);

  const fullVideoProps: FullVideoProps = {
    vehicle,
    slideDurations: {},
    defaultDuration: DEFAULT_SLIDE_SEC,
    contentMonthYear,
    lang: "en",
  };
  const totalFrames = computeTotalFrames({}, DEFAULT_SLIDE_SEC, FPS);

  return (
    <div style={{ padding: 32, maxWidth: 1400, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
        {vehicle.brand_name} {vehicle.short_name}
        <span style={{ fontSize: 14, fontWeight: 600, color: "#a78bfa", marginLeft: 12 }}>Ownership cost reel</span>
      </h1>
      <div style={{ color: "#71717a", fontSize: 14, marginBottom: 16 }}>
        Price {vehicle.price_formatted} | 5-year cost {vehicle.net_5yr_display}
        {!loaded && <span style={{ color: "#f59e0b", marginLeft: 16 }}>Loading vehicle data...</span>}
      </div>

      <div style={{ marginBottom: 24, display: "flex", gap: 8 }}>
        <button onClick={() => setShowFinal(false)} style={toggleStyle(!showFinal)}>Animated</button>
        <button onClick={() => setShowFinal(true)} style={toggleStyle(showFinal)}>Final frame</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 24 }}>
        {SLIDES.map((slide, i) => (
          <SlideCard
            key={slide.id}
            slide={slide}
            index={i}
            totalSlides={SLIDES.length}
            vehicle={vehicle}
            contentMonthYear={contentMonthYear}
            showFinal={showFinal}
          />
        ))}
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 800, margin: "48px 0 16px" }}>Thumbnail</h2>
      <Player
        component={ThumbnailReels}
        inputProps={{ vehicle, durationSec: 1, contentMonthYear, lang: "en", slideNumber: 1, totalSlides: 1 }}
        durationInFrames={1}
        compositionWidth={REEL_WIDTH}
        compositionHeight={REEL_HEIGHT}
        fps={FPS}
        style={{
          width: REEL_WIDTH * THUMBNAIL_SCALE,
          height: REEL_HEIGHT * THUMBNAIL_SCALE,
          borderRadius: 12,
          border: "1px solid #27272a",
        }}
      />

      <h2 style={{ fontSize: 22, fontWeight: 800, margin: "48px 0 16px" }}>
        Full reel ({DEFAULT_SLIDE_SEC}s per slide; real runs time each slide to its narration)
      </h2>
      <Player
        component={FullVideoPreview}
        inputProps={fullVideoProps}
        durationInFrames={totalFrames}
        compositionWidth={REEL_WIDTH}
        compositionHeight={REEL_HEIGHT}
        fps={FPS}
        style={{ width: "100%", maxWidth: 540, aspectRatio: `${REEL_WIDTH} / ${REEL_HEIGHT}` }}
        controls
        loop
      />
    </div>
  );
};
