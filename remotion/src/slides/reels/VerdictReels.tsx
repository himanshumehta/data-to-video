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
  spring,
} from "remotion";
import { PortraitSlideProps } from "../../types";
import { resolveImage } from "../../utils/resolveImage";
import { C } from "../../utils/colors";
import { useCountUp, SPRING_CONFIG } from "../../utils/animations";
import { formatINR, formatINRFull, formatINRShort } from "../../utils/format";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";

const CLICK_FRAMES = [0, 5, 18, 44, 52, 65];
const BIKE_HEIGHT = 650;

export const VerdictReels: React.FC<PortraitSlideProps> = ({
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

  const countedCost = useCountUp(18, 42, vehicle.net_5yr);

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: C.bg }}>
      {/* Click sounds */}
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* ── HERO BIKE ZONE ── */}
      {/* Emerald atmospheric glow behind bike */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 500,
          background:
            "radial-gradient(ellipse, rgba(16,185,129,0.10) 0%, rgba(16,185,129,0.04) 40%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Bike image -- full bleed hero */}
      {vehicle.primary_nobg_url && (
        <Img
          src={resolveImage(vehicle.primary_nobg_url)}
          style={{
            position: "absolute",
            top: 0,
            left: "-5%",
            width: "110%",
            height: BIKE_HEIGHT,
            objectFit: "contain",
            zIndex: 2,
            opacity: interpolate(frame, [5, 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            filter:
              "drop-shadow(0 40px 80px rgba(0,0,0,0.8)) drop-shadow(0 0 60px rgba(16,185,129,0.12))",
          }}
        />
      )}

      {/* Gradient overlay fading bike to dark */}
      <div
        style={{
          position: "absolute",
          top: BIKE_HEIGHT - 250,
          left: 0,
          right: 0,
          height: 250,
          background: `linear-gradient(to bottom, transparent, ${C.bg})`,
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      {/* Logo -- top left over bike */}
      <div style={{ position: "absolute", top: 110, left: 44, zIndex: 10 }}>
        <Logo size={36} startFrame={0} />
      </div>

      {/* Counter -- top right over bike */}
      <SlideCounter current={slideNumber} total={totalSlides} startFrame={0} variant="reels" />

      {/* Vehicle name over gradient */}
      <div
        style={{
          ...fade(10, 10),
          position: "absolute",
          top: BIKE_HEIGHT - 120,
          left: 44,
          right: 86,
          zIndex: 5,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 900,
            color: C.text1,
            textShadow: "0 4px 20px rgba(0,0,0,0.8)",
          }}
        >
          {vehicle.brand_name} {vehicle.short_name}
        </div>
      </div>

      {/* ── CONTENT AREA ── */}
      <div
        style={{
          position: "absolute",
          top: BIKE_HEIGHT,
          left: 0,
          right: 0,
          bottom: "17%",
          padding: "0 86px 0 44px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 10,
        }}
      >
        {/* Hero amount */}
        <div style={{ textAlign: "center", paddingTop: 16 }}>
          <div
            style={{
              ...fade(14, 8),
              fontSize: 22,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: C.text4,
            }}
          >
            5-Year True Cost
          </div>
          <div
            style={{
              opacity: interpolate(frame, [18, 24], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              fontSize: 140,
              fontWeight: 900,
              color: C.amber,
              letterSpacing: -4,
              lineHeight: 0.9,
              marginTop: 8,
              textShadow:
                "0 0 100px rgba(245,158,11,0.35), 0 0 200px rgba(245,158,11,0.12), 0 8px 40px rgba(0,0,0,0.5)",
            }}
          >
            {formatINRFull(countedCost)}
          </div>
          <div
            style={{
              ...fade(44, 12),
              fontSize: 28,
              fontWeight: 800,
              color: C.text3,
              marginTop: 16,
            }}
          >
            {"That's "}
            <strong style={{ color: C.text1, fontWeight: 900 }}>
              {vehicle.multiplier}x
            </strong>
            {" the showroom price"}
          </div>
        </div>

        {/* 3 stat cards in row -- colored top border */}
        <div
          style={{
            display: "flex",
            gap: 16,
            width: "100%",
          }}
        >
          {/* Per Day */}
          <div
            style={{
              ...fade(52, 10),
              flex: 1,
              textAlign: "center",
              padding: "24px 12px",
              background: "rgba(255,255,255,0.03)",
              borderTop: `4px solid ${C.amber}`,
              borderRadius: 12,
            }}
          >
            <div
              style={{
                fontSize: 52,
                fontWeight: 900,
                marginBottom: 8,
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
              }}
            >
              Per Day
            </div>
          </div>

          {/* Per Km */}
          <div
            style={{
              ...fade(56, 10),
              flex: 1,
              textAlign: "center",
              padding: "24px 12px",
              background: "rgba(255,255,255,0.03)",
              borderTop: `4px solid ${C.orange}`,
              borderRadius: 12,
            }}
          >
            <div
              style={{
                fontSize: 52,
                fontWeight: 900,
                marginBottom: 8,
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
              }}
            >
              Per Km
            </div>
          </div>

          {/* Per Month */}
          <div
            style={{
              ...fade(60, 10),
              flex: 1,
              textAlign: "center",
              padding: "24px 12px",
              background: "rgba(255,255,255,0.03)",
              borderTop: `4px solid ${C.blue}`,
              borderRadius: 12,
            }}
          >
            <div
              style={{
                fontSize: 52,
                fontWeight: 900,
                marginBottom: 8,
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
              }}
            >
              Per Month
            </div>
          </div>
        </div>

        {/* Bottom CTA panel -- emerald tinted */}
        <div
          style={{
            ...fade(65, 12),
            width: "100%",
            padding: "24px 28px",
            background: "rgba(16,185,129,0.08)",
            borderTop: `3px solid ${C.emerald}`,
            borderRadius: 12,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: C.text1,
              marginBottom: 8,
            }}
          >
            Own a {vehicle.short_name}?
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: C.emerald,
            }}
          >
            {"Save \u00B7 Share \u00B7 Follow"}
          </div>
        </div>
      </div>

      {/* Progress dots */}
      <ProgressDots
        current={slideNumber}
        total={totalSlides}
        startFrame={0}
        variant="reels"
      />

      {/* Watermark */}
      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
