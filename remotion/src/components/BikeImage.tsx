import React from "react";
import { Img, useCurrentFrame, interpolate } from "remotion";

interface BikeImageProps {
  src: string;
  side?: "right" | "center";
  opacity?: number;
  width?: string;
  glowColor?: string;
  startFrame?: number;
}

export const BikeImage: React.FC<BikeImageProps> = ({
  src,
  side = "right",
  opacity = 1.0,
  width = "55%",
  glowColor = "rgba(16,185,129,0.04)",
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [startFrame, startFrame + 20], [0, opacity], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (!src) return null;

  const isCenter = side === "center";

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        right: isCenter ? undefined : 0,
        left: isCenter ? "50%" : undefined,
        transform: isCenter ? "translateX(-50%)" : undefined,
        width,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
        opacity: fadeIn,
      }}
    >
      {/* Glow behind bike */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "85%",
          background: `radial-gradient(ellipse, ${glowColor} 0%, transparent 60%)`,
          zIndex: 1,
        }}
      />

      <Img
        src={src}
        style={{
          position: "relative",
          zIndex: 2,
          width: "92%",
          maxHeight: "65%",
          objectFit: "contain",
          filter: `drop-shadow(0 40px 100px rgba(0,0,0,0.6)) drop-shadow(0 0 60px ${glowColor})`,
        }}
      />

      {/* Left fade gradient for right-side placement */}
      {!isCenter && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, #08080a 0%, rgba(8,8,10,0.85) 15%, rgba(8,8,10,0.4) 40%, transparent 70%)",
            zIndex: 3,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};
