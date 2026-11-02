import React from "react";
import { useCurrentFrame } from "remotion";
import { AbsoluteFill } from "remotion";

interface HeatShimmerProps {
  color?: string;
  intensity?: number;
}

/**
 * Breathing scale oscillation on a radial background glow for
 * the beast theme.
 *
 * A centered radial gradient pulses between scale 0.98 and 1.02
 * using a sine wave driven by useCurrentFrame. The visual effect
 * is a subtle heat-shimmer behind content.
 */
const HeatShimmer: React.FC<HeatShimmerProps> = ({
  color = "rgba(255, 77, 42, 0.08)",
  intensity = 0.08,
}) => {
  const frame = useCurrentFrame();

  // Sine-based oscillation: cycles roughly every 120 frames (~4s at 30fps).
  const t = Math.sin(frame * 0.052);
  const scale = 0.98 + 0.04 * ((t + 1) / 2); // maps -1..1 to 0.98..1.02

  // Opacity breathes in sync.
  const breathingOpacity = intensity * (0.7 + 0.3 * ((t + 1) / 2));

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "140%",
          height: "140%",
          borderRadius: "50%",
          background: `radial-gradient(ellipse at center, ${color} 0%, transparent 70%)`,
          opacity: breathingOpacity,
          transform: `scale(${scale})`,
          willChange: "transform, opacity",
        }}
      />
    </AbsoluteFill>
  );
};

export default HeatShimmer;
