import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../utils/colors";

interface SlideBackgroundProps {
  edgeLightColor?: string;
}

/**
 * Shared background with dark base, subtle glow blobs, and top edge light.
 * Uses percentage-based sizing so it works at any resolution
 * (3840x2160 landscape or 1080x1350 portrait).
 */
export const SlideBackground: React.FC<SlideBackgroundProps> = ({
  edgeLightColor = C.blue,
}) => {
  return (
    <AbsoluteFill>
      {/* Base background */}
      <AbsoluteFill style={{ background: C.bg2 }} />

      {/* Glow blobs — percentage-based for any resolution */}
      <div
        style={{
          position: "absolute",
          top: "-8%",
          left: "25%",
          width: "52%",
          height: "56%",
          background:
            "radial-gradient(ellipse, rgba(71,131,255,0.04) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-5%",
          right: "8%",
          width: "39%",
          height: "46%",
          background:
            "radial-gradient(ellipse, rgba(245,158,11,0.025) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "65%",
          height: "69%",
          background:
            "radial-gradient(ellipse, rgba(255,255,255,0.008) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      {/* Edge light */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, transparent 5%, ${edgeLightColor}33 30%, ${edgeLightColor}44 50%, ${edgeLightColor}33 70%, transparent 95%)`,
          zIndex: 20,
        }}
      />
    </AbsoluteFill>
  );
};
