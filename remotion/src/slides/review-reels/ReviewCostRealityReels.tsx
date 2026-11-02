import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Img,
  Audio,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { PortraitSlideProps } from "../../types";
import { C } from "../../utils/colors";
import { useCountUp } from "../../utils/animations";
import { formatINR } from "../../utils/format";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";

const CLICK_FRAMES = [0, 8, 18, 32, 48, 62];
const BIKE_HEIGHT = 780;

export const ReviewCostRealityReels: React.FC<PortraitSlideProps> = ({
  vehicle,
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fade = (start: number, dur: number = 12): React.CSSProperties => ({
    opacity: interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    transform: `translateY(${interpolate(
      frame,
      [start, start + dur],
      [24, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    )}px)`,
  });

  const counted5yr = useCountUp(40, 62, vehicle.net_5yr);
  const competitors = vehicle.competitors_ownership ?? [];
  const cheapestRival = competitors.length > 0
    ? competitors.reduce((a, b) =>
        a.total_cost_5yr < b.total_cost_5yr ? a : b
      )
    : null;
  const diff = cheapestRival
    ? vehicle.net_5yr - cheapestRival.total_cost_5yr
    : 0;

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: C.bg }}>
      {/* Click sounds */}
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Blue glow behind bike */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 600,
          background:
            "radial-gradient(ellipse, rgba(71,131,255,0.10) 0%, rgba(71,131,255,0.04) 40%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Bike hero image */}
      {vehicle.primary_nobg_url && (
        <Img
          src={vehicle.primary_nobg_url}
          style={{
            position: "absolute",
            top: 60,
            left: 0,
            right: 0,
            width: "100%",
            height: 450,
            objectFit: "contain",
            objectPosition: "center center",
            filter:
              "drop-shadow(0 30px 80px rgba(0,0,0,0.8)) drop-shadow(0 0 60px rgba(71,131,255,0.12))",
            zIndex: 2,
            ...fade(0, 15),
          }}
        />
      )}

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: BIKE_HEIGHT + 50,
          background:
            "linear-gradient(to bottom, transparent 30%, rgba(9,9,11,0.4) 50%, rgba(9,9,11,0.85) 68%, #09090b 85%)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />

      {/* Logo */}
      <div style={{ position: "absolute", top: 154, left: 44, zIndex: 20 }}>
        <Logo size={36} startFrame={0} />
      </div>

      {/* Slide counter */}
      <SlideCounter current={slideNumber} total={totalSlides} variant="reels" />

      {/* Vehicle name over gradient */}
      <div
        style={{
          position: "absolute",
          top: BIKE_HEIGHT - 260,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <div
          style={{
            ...fade(8),
            fontSize: 52,
            fontWeight: 900,
            letterSpacing: "-0.01em",
            color: C.text1,
            textShadow: "0 2px 20px rgba(0,0,0,0.8)",
          }}
        >
          {vehicle.brand_name} {vehicle.short_name}
        </div>
        <div
          style={{
            ...fade(12),
            fontSize: 22,
            fontWeight: 700,
            color: C.blue,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            marginTop: 6,
          }}
        >
          Cost Reality
        </div>
      </div>

      {/* Content area below gradient */}
      <div
        style={{
          position: "absolute",
          top: 750,
          left: 0,
          right: 0,
          bottom: "17%",
          padding: "0 44px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          zIndex: 10,
        }}
      >
        {/* 3 stat cards row */}
        <div
          style={{
            display: "flex",
            gap: 14,
            width: "100%",
          }}
        >
          {/* Per Day */}
          <div
            style={{
              ...fade(18, 10),
              flex: 1,
              textAlign: "center",
              padding: "20px 10px",
              background: "rgba(255,255,255,0.03)",
              borderTop: `4px solid ${C.amber}`,
              borderRadius: 12,
            }}
          >
            <div
              style={{
                fontSize: 52,
                fontWeight: 900,
                color: C.text1,
                lineHeight: 1,
              }}
            >
              {vehicle.cost_per_day_display}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: C.text4,
                marginTop: 6,
              }}
            >
              Per Day
            </div>
          </div>

          {/* Per Km */}
          <div
            style={{
              ...fade(24, 10),
              flex: 1,
              textAlign: "center",
              padding: "20px 10px",
              background: "rgba(255,255,255,0.03)",
              borderTop: `4px solid ${C.orange}`,
              borderRadius: 12,
            }}
          >
            <div
              style={{
                fontSize: 52,
                fontWeight: 900,
                color: C.orange,
                lineHeight: 1,
              }}
            >
              {"\u20B9"}{vehicle.cost_per_km.toFixed(2)}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: C.text4,
                marginTop: 6,
              }}
            >
              Per Km
            </div>
          </div>

          {/* Per Month */}
          <div
            style={{
              ...fade(30, 10),
              flex: 1,
              textAlign: "center",
              padding: "20px 10px",
              background: "rgba(255,255,255,0.03)",
              borderTop: `4px solid ${C.blue}`,
              borderRadius: 12,
            }}
          >
            <div
              style={{
                fontSize: 52,
                fontWeight: 900,
                color: C.blue,
                lineHeight: 1,
              }}
            >
              {vehicle.monthly_cost_display}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: C.text4,
                marginTop: 6,
              }}
            >
              Per Month
            </div>
          </div>
        </div>

        {/* Annual */}
        <div
          style={{
            ...fade(36),
            textAlign: "center",
            fontSize: 32,
            fontWeight: 800,
            color: C.text2,
          }}
        >
          {"\u20B9"} {formatINR(vehicle.annual_total)}/yr
        </div>

        {/* 5-Year Total */}
        <div
          style={{
            textAlign: "center",
            opacity: interpolate(frame, [40, 48], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: C.text4,
              marginBottom: 6,
            }}
          >
            5-Year Total
          </div>
          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: C.blue,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              textShadow:
                "0 0 60px rgba(71,131,255,0.3), 0 0 120px rgba(71,131,255,0.1)",
            }}
          >
            {"\u20B9"} {formatINR(counted5yr)}
          </div>
        </div>

        {/* Vs Rival card */}
        {cheapestRival && (
          <div
            style={{
              ...fade(56, 10),
              padding: "16px 24px",
              background: "rgba(244,63,94,0.06)",
              borderLeft: `4px solid ${C.rose}`,
              borderRadius: 12,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: C.text3,
                lineHeight: 1.5,
              }}
            >
              vs {cheapestRival.short_name}:{" "}
              <strong
                style={{
                  color: diff > 0 ? C.rose : C.emerald,
                  fontWeight: 900,
                }}
              >
                {"\u20B9"}{formatINR(Math.abs(diff))}{" "}
                {diff > 0 ? "more" : "less"}
              </strong>
            </div>
          </div>
        )}
      </div>

      <ProgressDots
        current={slideNumber}
        total={totalSlides}
        activeColor={C.blue}
        startFrame={0}
        variant="reels"
      />
      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
