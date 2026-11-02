import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface ProgressDotsProps {
  current: number;
  total: number;
  activeColor?: string;
  startFrame?: number;
  /** "portrait" for 4:5 posts, "reels" for 9:16 reels/shorts */
  variant?: "portrait" | "reels";
}

/**
 * Progress dots — bottom center, active dot glows.
 * Portrait (4:5): bottom 10.5% — inside 10% safe zone.
 * Reels (9:16):   bottom 14.5% — above IG caption + music bar + scrubber.
 */
export const ProgressDots: React.FC<ProgressDotsProps> = ({
  current,
  total,
  activeColor = "#10b981",
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
        bottom: isReels ? "14.5%" : "10.5%",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: isReels ? 7 : 8,
        zIndex: 10,
        opacity,
      }}
    >
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: i + 1 === current ? activeColor : "#27272a",
            boxShadow:
              i + 1 === current ? `0 0 8px ${activeColor}` : "none",
            transition: "background-color 0.3s, box-shadow 0.3s",
          }}
        />
      ))}
    </div>
  );
};
