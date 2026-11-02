import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface AnimatedBarProps {
  value: number;
  maxValue: number;
  color: string;
  startFrame: number;
  height?: number;
  width?: number;
  direction?: "horizontal" | "vertical";
  borderRadius?: number;
  duration?: number;
}

export const AnimatedBar: React.FC<AnimatedBarProps> = ({
  value,
  maxValue,
  color,
  startFrame,
  height = 20,
  width,
  direction = "horizontal",
  borderRadius = 6,
  duration = 30,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [startFrame, startFrame + duration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const fraction = maxValue > 0 ? (value / maxValue) * progress : 0;

  if (direction === "horizontal") {
    return (
      <div
        style={{
          width: width || "100%",
          height,
          background: "rgba(255,255,255,0.04)",
          borderRadius,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${fraction * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
            borderRadius,
            transition: "none",
          }}
        />
      </div>
    );
  }

  // vertical: bar grows upward
  const maxHeight = height;
  return (
    <div
      style={{
        width: width || 60,
        height: maxHeight,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "stretch",
      }}
    >
      <div
        style={{
          width: "100%",
          height: fraction * maxHeight,
          background: `linear-gradient(180deg, ${color}dd, ${color})`,
          borderRadius: `${borderRadius}px ${borderRadius}px 0 0`,
          transition: "none",
        }}
      />
    </div>
  );
};
