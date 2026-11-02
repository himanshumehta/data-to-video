import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

const BLUE = "#4783ff";
const ROSE = "#f43f5e";

// Material Design SVG paths
const BIKE_PATH =
  "M20,11c-0.18,0-0.36,0.03-0.53,0.05L17.41,9H20V6l-3.72,1.86L13.41,5H9v2h3.59l2,2H11l-4,2L5,9H0v2h4c-2.21,0-4,1.79-4,4 c0,2.21,1.79,4,4,4c2.21,0,4-1.79,4-4l2,2h3l3.49-6.1l1.01,1.01C16.59,12.64,16,13.75,16,15c0,2.21,1.79,4,4,4c2.21,0,4-1.79,4-4 C24,12.79,22.21,11,20,11z M4,17c-1.1,0-2-0.9-2-2c0-1.1,0.9-2,2-2c1.1,0,2,0.9,2,2C6,16.1,5.1,17,4,17z M20,17c-1.1,0-2-0.9-2-2 c0-1.1,0.9-2,2-2s2,0.9,2,2C22,16.1,21.1,17,20,17z";

const CAR_PATH =
  "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z";

interface LogoProps {
  size?: number;
  startFrame?: number;
}

export const Logo: React.FC<LogoProps> = ({ size = 80, startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [startFrame, startFrame + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [startFrame, startFrame + 20], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const iconSize = size * 0.36;
  const iconTop = -size * 0.25;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        fontSize: size,
        fontWeight: 800,
        letterSpacing: "-0.03em",
        lineHeight: 1,
        opacity,
        transform: `translateY(${y}px)`,
        whiteSpace: "nowrap",
      }}
    >
      {/* Bike + icon */}
      <span style={{ position: "relative", display: "inline-block" }}>
        <span style={{ color: BLUE }}>Bike</span>
        <svg
          viewBox="0 0 24 24"
          style={{
            position: "absolute",
            top: iconTop,
            right: size * 0.04,
            width: iconSize * 0.85,
            height: iconSize * 0.85,
            fill: BLUE,
            display: "block",
          }}
        >
          <path d={BIKE_PATH} />
        </svg>
      </span>

      {/* N */}
      <span
        style={{
          position: "relative",
          color: "#fff",
          fontWeight: 900,
          fontSize: "1.5em",
          display: "inline-block",
          transform: "rotate(-12deg)",
          margin: "0 -1px 0 1px",
          textShadow:
            "0 0 8px rgba(255,255,255,0.6), 0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.15)",
        }}
      >
        N
      </span>

      {/* Cars + icon */}
      <span style={{ position: "relative", display: "inline-block" }}>
        <span style={{ color: ROSE }}>Cars</span>
        <svg
          viewBox="0 0 24 24"
          style={{
            position: "absolute",
            top: iconTop,
            right: 0,
            width: iconSize,
            height: iconSize,
            fill: ROSE,
            display: "block",
          }}
        >
          <path d={CAR_PATH} />
        </svg>
      </span>
    </div>
  );
};
