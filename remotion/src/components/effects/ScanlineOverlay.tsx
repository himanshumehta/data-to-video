import React from "react";
import { AbsoluteFill } from "remotion";

interface ScanlineOverlayProps {
  opacity?: number;
  lineHeight?: number;
  gap?: number;
}

/**
 * CRT-style horizontal scan lines overlay for the beast theme.
 *
 * Renders a repeating-linear-gradient of thin dark lines at a very
 * low opacity. Pure CSS -- no animation, no frame dependency.
 */
const ScanlineOverlay: React.FC<ScanlineOverlayProps> = ({
  opacity = 0.02,
  lineHeight = 2,
  gap = 4,
}) => {
  const totalSize = lineHeight + gap;

  return (
    <AbsoluteFill
      style={{
        background: `repeating-linear-gradient(
          to bottom,
          rgba(0, 0, 0, ${opacity}) 0px,
          rgba(0, 0, 0, ${opacity}) ${lineHeight}px,
          transparent ${lineHeight}px,
          transparent ${totalSize}px
        )`,
        pointerEvents: "none",
        mixBlendMode: "multiply",
      }}
    />
  );
};

export default ScanlineOverlay;
