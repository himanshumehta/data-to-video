/**
 * SlideCard: one reel slide in the gallery grid, animated or held on its final frame.
 */
import React, { useState } from "react";
import { Player } from "@remotion/player";
import type { PortraitSlideProps, Vehicle } from "../types";

export const FPS = 30;
export const REEL_WIDTH = 1080;
export const REEL_HEIGHT = 1920;

export interface GallerySlide {
  id: string;
  name: string;
  component: React.FC<PortraitSlideProps>;
  animationFrames: number;
}

export const SlideCard: React.FC<{
  slide: GallerySlide;
  index: number;
  totalSlides: number;
  vehicle: Vehicle;
  contentMonthYear: string;
  showFinal: boolean;
}> = ({ slide, index, totalSlides, vehicle, contentMonthYear, showFinal }) => {
  const [hovered, setHovered] = useState(false);
  const frames = Math.max(slide.animationFrames, 1);
  const props: PortraitSlideProps = {
    vehicle,
    durationSec: frames / FPS,
    contentMonthYear,
    lang: "en",
    slideNumber: index + 1,
    totalSlides,
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: "#18181b", borderRadius: 12, overflow: "hidden", border: "1px solid #27272a" }}
    >
      <Player
        component={slide.component}
        inputProps={props}
        durationInFrames={frames}
        compositionWidth={REEL_WIDTH}
        compositionHeight={REEL_HEIGHT}
        fps={FPS}
        style={{ width: "100%", aspectRatio: `${REEL_WIDTH} / ${REEL_HEIGHT}` }}
        controls={hovered}
        clickToPlay
        loop={!showFinal}
        autoPlay={!showFinal}
        initialFrame={showFinal ? frames - 1 : 0}
        key={`${slide.id}-${showFinal}`}
      />
      <div style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, color: "#a1a1aa", fontWeight: 600 }}>
          {slide.id} | {slide.name}
        </span>
        <span style={{ fontSize: 11, color: "#52525b" }}>{(frames / FPS).toFixed(1)}s</span>
      </div>
    </div>
  );
};
