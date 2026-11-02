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

const CLICK_FRAMES = [0, 3, 16, 42, 48, 62];

export const VerdictPortrait: React.FC<PortraitSlideProps> = ({
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

  // Count up for hero amount: frames 16-40
  const countedCost = useCountUp(16, 40, vehicle.net_5yr);

  // Divider grow at frame 44
  const dividerWidth = interpolate(frame, [44, 44 + 15], [0, 840], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
          top: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 400,
          background:
            "radial-gradient(ellipse, rgba(71,131,255,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Bottom glow */}
      <div
        style={{
          position: "absolute",
          bottom: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 400,
          background:
            "radial-gradient(ellipse, rgba(59,130,246,0.04) 0%, transparent 70%)",
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
        {/* Section tag — "The Verdict" pill */}
        <div
          style={{
            ...fade(0, 12),
            textAlign: "center",
            marginTop: 36,
          }}
        >
          <span
            style={{
              display: "inline-block",
              padding: "12px 30px",
              borderRadius: 50,
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.25)",
              fontSize: 18,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: C.emerald,
            }}
          >
            The Verdict
          </span>
        </div>

        {/* Bike area — 280px */}
        <div
          style={{
            ...fade(3, 12),
            display: "flex",
            justifyContent: "center",
            marginTop: 28,
            height: 280,
          }}
        >
          {vehicle.primary_nobg_url && (
            <Img
              src={vehicle.primary_nobg_url}
              style={{
                height: "100%",
                objectFit: "contain",
                filter:
                  "drop-shadow(0 25px 60px rgba(0,0,0,0.7)) drop-shadow(0 0 40px rgba(71,131,255,0.08))",
              }}
            />
          )}
        </div>

        {/* Vehicle name */}
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
              color: C.text1,
            }}
          >
            {vehicle.brand_name} {vehicle.short_name}
          </div>
        </div>

        {/* Hero cost */}
        <div
          style={{
            textAlign: "center",
            marginTop: 32,
          }}
        >
          {/* Label */}
          <div
            style={{
              ...fade(12),
              fontSize: 16,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: C.text4,
            }}
          >
            5-Year True Cost
          </div>

          {/* Big amount — 82px amber, countUp */}
          <div
            style={{
              opacity: interpolate(frame, [16, 20], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              fontSize: 82,
              fontWeight: 900,
              color: C.amber,
              letterSpacing: -2,
              lineHeight: 1,
              marginTop: 8,
            }}
          >
            {formatINRFull(countedCost)}
          </div>

          {/* Multiplier text */}
          <div
            style={{
              ...fade(40),
              fontSize: 28,
              fontWeight: 800,
              color: C.text3,
              marginTop: 12,
            }}
          >
            {"That's "}
            <strong style={{ color: C.text1, fontWeight: 900 }}>
              {vehicle.multiplier}x
            </strong>
            {" the showroom price"}
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            width: dividerWidth,
            maxWidth: 840,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(59,130,246,0.15), transparent)",
            marginTop: 32,
            opacity: interpolate(frame, [44, 48], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />

        {/* 3 stat cards */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 32,
            marginLeft: 58,
            marginRight: 58,
            width: "calc(100% - 116px)",
          }}
        >
          {/* Per Day */}
          <div
            style={{
              ...fade(48),
              flex: 1,
              textAlign: "center",
              padding: "26px 14px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16,
            }}
          >
            <div
              style={{
                fontSize: 34,
                fontWeight: 900,
                marginBottom: 8,
                color: C.text1,
              }}
            >
              {vehicle.cost_per_day_display}
            </div>
            <div
              style={{
                fontSize: 14,
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
              ...fade(52),
              flex: 1,
              textAlign: "center",
              padding: "26px 14px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16,
            }}
          >
            <div
              style={{
                fontSize: 34,
                fontWeight: 900,
                marginBottom: 8,
                color: C.orange,
              }}
            >
              {"\u20B9"} {vehicle.cost_per_km.toFixed(2)}
            </div>
            <div
              style={{
                fontSize: 14,
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
              ...fade(56),
              flex: 1,
              textAlign: "center",
              padding: "26px 14px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16,
            }}
          >
            <div
              style={{
                fontSize: 34,
                fontWeight: 900,
                marginBottom: 8,
                color: C.blue,
              }}
            >
              {vehicle.monthly_cost_display}
            </div>
            <div
              style={{
                fontSize: 14,
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

        {/* CTA card */}
        <div
          style={{
            ...fade(62),
            marginTop: 28,
            marginLeft: 58,
            marginRight: 58,
            width: "calc(100% - 116px)",
            padding: "28px 28px",
            textAlign: "center",
            background: "rgba(16,185,129,0.05)",
            border: "1px solid rgba(16,185,129,0.15)",
            borderRadius: 16,
          }}
        >
          <div
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: C.text1,
              marginBottom: 8,
            }}
          >
            Own a {vehicle.short_name}?
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: C.text3,
              lineHeight: 1.4,
            }}
          >
            Drop your real monthly expense below
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: C.emerald,
            }}
          >
            {"Save \u00B7 Share \u00B7 Follow"}
          </div>
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
