import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Img,
  Audio,
  Sequence,
  staticFile,
} from "remotion";
import { PortraitSlideProps } from "../../types";
import { C } from "../../utils/colors";
import { useCountUp } from "../../utils/animations";
import { formatINRFull } from "../../utils/format";
import { SlideBackground } from "../../components/SlideBackground";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";
import { SafeZone } from "../../components/SafeZone";

const CLICK_FRAMES = [0, 8, 20, 30, 50, 60];

export const HookPortrait: React.FC<PortraitSlideProps> = ({
  vehicle,
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();

  const fade = (start: number, dur: number = 15) => ({
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

  // Count up for big price: frames 20-45
  const countedCost = useCountUp(20, 45, vehicle.net_5yr);

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground />
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Top glow */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 500,
          background:
            "radial-gradient(ellipse, rgba(71,131,255,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <SlideCounter
        current={slideNumber}
        total={totalSlides}
        fontSize={18}
        startFrame={0}
      />

      {/* Safe zone content */}
      <SafeZone style={{ zIndex: 10, alignItems: "center" }}>
        <Logo size={44} startFrame={0} />
        {/* Section tag */}
        <div
          style={{
            ...fade(0, 10),
            textAlign: "center",
            marginTop: 32,
            fontSize: 36,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.3em",
            color: C.blue,
            textShadow: "0 0 20px rgba(71,131,255,0.2)",
          }}
        />

        {/* Bike image area — 340px */}
        <div
          style={{
            ...fade(0, 12),
            display: "flex",
            justifyContent: "center",
            marginTop: 16,
            height: 180,
          }}
        >
          {vehicle.primary_nobg_url && (
            <Img
              src={vehicle.primary_nobg_url}
              style={{
                height: "100%",
                objectFit: "contain",
                filter:
                  "drop-shadow(0 20px 50px rgba(0,0,0,0.6)) drop-shadow(0 0 30px rgba(71,131,255,0.12))",
              }}
            />
          )}
        </div>

        {/* Vehicle info */}
        <div
          style={{
            ...fade(8),
            textAlign: "center",
            marginTop: 8,
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 900,
              letterSpacing: "-0.01em",
              color: C.text1,
            }}
          >
            {vehicle.brand_name} {vehicle.short_name}
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 500,
              color: C.text3,
              marginTop: 2,
            }}
          >
            ex-showroom {"\u00B7"} 5 Year Analysis
          </div>
        </div>

        {/* Headline area — big price */}
        <div
          style={{
            textAlign: "center",
            marginTop: 28,
          }}
        >
          <div
            style={{
              ...fade(12),
              fontSize: 22,
              fontWeight: 700,
              color: C.text3,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: 10,
            }}
          >
            Ownership Cost Breakdown
          </div>
          <div
            style={{
              opacity: interpolate(frame, [20, 25], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              fontSize: 96,
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              color: C.blue,
              textShadow: "0 0 50px rgba(71,131,255,0.3)",
            }}
          >
            {formatINRFull(countedCost)}
          </div>
          <div
            style={{
              ...fade(20),
              fontSize: 20,
              fontWeight: 600,
              color: C.text3,
              marginTop: 8,
            }}
          >
            Not{" "}
            <strong style={{ color: C.text2, fontWeight: 800 }}>
              {vehicle.price_formatted}
            </strong>
            {" \u2014 here's why"}
          </div>
        </div>

        {/* Receipt card */}
        <div
          style={{
            marginTop: 28,
            marginLeft: 58,
            marginRight: 58,
            width: "calc(100% - 116px)",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          {/* Receipt header */}
          <div
            style={{
              ...fade(30),
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 20px",
              background: "rgba(255,255,255,0.03)",
              borderBottom: "1px dashed rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 900, color: C.text1 }}>
              {vehicle.brand_name} {vehicle.short_name}
            </div>
            <div
              style={{
                padding: "7px 16px",
                borderRadius: 8,
                background: "rgba(71,131,255,0.12)",
                border: "1px solid rgba(71,131,255,0.25)",
                color: C.blue,
                fontSize: 13,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              5-Year Cost
            </div>
          </div>

          {/* Receipt rows */}
          <div style={{ padding: "3px 0" }}>
            {/* Assumed usage */}
            <div
              style={{
                ...fade(36),
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 600, color: C.text2 }}>
                Assumed Usage
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.text1 }}>
                {(vehicle.assumed_annual_km || 10000).toLocaleString()} km / year
              </div>
            </div>

            {/* Daily ownership cost */}
            <div
              style={{
                ...fade(39),
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 20px",
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 600, color: C.text2 }}>
                Daily Ownership Cost
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.text1 }}>
                {vehicle.cost_per_day_display} / day
              </div>
            </div>
          </div>

          {/* Receipt footer — total */}
          <div
            style={{
              ...fade(42),
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 20px",
              background: "rgba(71,131,255,0.06)",
              borderTop: "2px solid rgba(71,131,255,0.2)",
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: C.blue,
              }}
            >
              5-Year Real Cost
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 900,
                color: C.blue,
                textShadow: "0 0 20px rgba(71,131,255,0.3)",
              }}
            >
              {vehicle.net_5yr_display}
            </div>
          </div>
        </div>

        {/* Multiplier pills */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            marginTop: 24,
          }}
        >
          <div
            style={{
              ...fade(50, 12),
              padding: "12px 28px",
              borderRadius: 50,
              background: "rgba(245,158,11,0.12)",
              border: "1px solid rgba(245,158,11,0.25)",
              fontSize: 22,
              fontWeight: 900,
              color: C.amber,
              whiteSpace: "nowrap",
            }}
          >
            {vehicle.multiplier}x Sticker Price
          </div>
          <div
            style={{
              ...fade(53, 12),
              padding: "12px 28px",
              borderRadius: 50,
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.2)",
              fontSize: 22,
              fontWeight: 900,
              color: C.emerald,
              whiteSpace: "nowrap",
            }}
          >
            {vehicle.cost_per_day_display} / day
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            ...fade(60),
            textAlign: "center",
            marginTop: 24,
            fontSize: 22,
            fontWeight: 700,
            color: C.blue,
            letterSpacing: "0.02em",
          }}
        >
          {"Swipe to see the expected cost breakdown \u2192"}
        </div>
      </SafeZone>

      <ProgressDots
        current={slideNumber}
        total={totalSlides}
        startFrame={0}
      />
      <Watermark variant="portrait" />
    </AbsoluteFill>
  );
};
