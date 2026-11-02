import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface SlideCounterProps {
  current: number;
  total: number;
  fontSize?: number;
  startFrame?: number;
  /** "portrait" for 4:5 posts, "reels" for 9:16 reels/shorts */
  variant?: "portrait" | "reels";
}

/**
 * Slide counter — "{current} / {total}" at top-right.
 * Portrait (4:5): top 5.5%, right 5%.
 * Reels (9:16):   top 8%, right 4% — clears IG username row + status bar.
 */
export const SlideCounter: React.FC<SlideCounterProps> = ({
  current,
  total,
  fontSize = 18,
  startFrame = 0,
  variant = "portrait",
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [startFrame, startFrame + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const isReels = variant === "reels";

  return (
    <div
      style={{
        position: "absolute",
        top: isReels ? "8%" : "5.5%",
        right: isReels ? "4%" : "5%",
        fontSize,
        fontWeight: 700,
        fontFamily: "Inter, sans-serif",
        zIndex: 10,
        opacity,
      }}
    >
      <span style={{ color: "#f4f4f5" }}>{current}</span>
      <span style={{ color: "#52525b" }}> / {total}</span>
    </div>
  );
};
