import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Audio, Sequence, staticFile } from "remotion";
import { SlideProps } from "../types";
import { C } from "../utils/colors";
import { Logo } from "../components/Logo";
import { Watermark } from "../components/Watermark";
import { SlideBackground } from "../components/SlideBackground";
import { BikeImage } from "../components/BikeImage";
import { formatINRShort } from "../utils/format";

const CLICK_FRAMES = [5, 10, 20, 28, 100, 110];

export const InsuranceBreakdown: React.FC<SlideProps> = ({ vehicle }) => {
  const frame = useCurrentFrame();

  const fade = (start: number, dur: number = 20) => ({
    opacity: interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    transform: `translateY(${interpolate(frame, [start, start + dur], [40, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })}px)`,
  });

  const first5 = (vehicle.first_5_years || []).slice(0, 5);
  const insuranceValues = first5.map((y) => y.insurance);
  const total5yr = insuranceValues.reduce((a, b) => a + b, 0);
  const maxIns = Math.max(...insuranceValues, 1);
  const yr1Ins = insuranceValues[0] || 1;
  const yr5Ins = insuranceValues[4] || 0;
  const savingsPct = yr1Ins > 0 ? Math.round(((yr1Ins - yr5Ins) / yr1Ins) * 100) : 0;

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground edgeLightColor={C.violet} />

      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={i} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      <div style={{ position: "absolute", top: 70, right: 130, zIndex: 20 }}>
        <Logo size={80} startFrame={0} />
      </div>

      {/* Left content 62% */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "90%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 0 0 150px",
        }}
      >
        {/* Pill badge */}
        <div
          style={{
            ...fade(5, 15),
            display: "inline-block",
            padding: "10px 32px",
            borderRadius: 200,
            background: "rgba(139,92,246,0.10)",
            border: `2px solid rgba(139,92,246,0.25)`,
            fontSize: 84,
            fontWeight: 800,
            color: C.violet,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            width: "fit-content",
            marginBottom: 16,
            whiteSpace: "nowrap",
          }}
        >
          Insurance Costs
        </div>

        {/* Title */}
        <div style={{ ...fade(10, 20), fontSize: 180, fontWeight: 900, color: C.text1, marginBottom: 8, whiteSpace: "nowrap" }}>
          Premium Decline · 5-Year
        </div>

        {/* Hero total */}
        <div
          style={{
            ...fade(20, 20),
            fontSize: 360,
            fontWeight: 900,
            color: C.violet,
            letterSpacing: -3,
            lineHeight: 1,
            marginBottom: 12,
            textShadow: "0 0 80px rgba(139,92,246,0.15)",
          }}
        >
          {formatINRShort(total5yr)}
        </div>

        {/* Savings badge */}
        <div
          style={{
            ...fade(28, 15),
            display: "inline-flex",
            alignItems: "center",
            gap: 20,
            padding: "8px 24px",
            borderRadius: 24,
            background: "rgba(16,185,129,0.08)",
            border: "2px solid rgba(16,185,129,0.2)",
            fontSize: 84,
            fontWeight: 800,
            color: C.emerald,
            width: "fit-content",
            marginBottom: 40,
            whiteSpace: "nowrap",
          }}
        >
          &#8595; {savingsPct}% cheaper by Year 5
        </div>

        {/* 5-year bars */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 56, height: 700, marginBottom: 30 }}>
          {first5.map((yr, i) => {
            const barStart = 50 + i * 8;
            const grow = interpolate(frame, [barStart, barStart + 30], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const h = (yr.insurance / maxIns) * 600 * grow;

            return (
              <div
                key={yr.year}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                  height: "100%",
                  justifyContent: "flex-end",
                }}
              >
                {/* Cost above */}
                <div
                  style={{
                    fontSize: 84,
                    fontWeight: 900,
                    color: C.text1,
                    opacity: grow,
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatINRShort(yr.insurance)}
                </div>
                {/* Bar */}
                <div
                  style={{
                    width: "80%",
                    height: h,
                    background: `linear-gradient(180deg, ${C.violet}dd, ${C.violet})`,
                    borderRadius: "8px 8px 0 0",
                    border: `2px solid ${C.violet}33`,
                    borderBottom: "none",
                  }}
                />
                {/* Year label */}
                <div style={{ fontSize: 78, fontWeight: 800, color: C.text3, whiteSpace: "nowrap" }}>
                  Yr {yr.year}
                </div>
              </div>
            );
          })}
        </div>

        {/* Trend line (SVG) */}
        {first5.length >= 2 && (
          <svg
            width="100%"
            height={40}
            viewBox={`0 0 ${first5.length * 100} 40`}
            style={{
              ...fade(100, 20),
              position: "absolute",
              bottom: 500,
              left: 150,
              width: "50%",
              zIndex: 15,
              overflow: "visible",
            }}
          >
            <polyline
              points={first5
                .map((yr, i) => {
                  const x = i * 100 + 50;
                  const y = 18 - (yr.insurance / maxIns) * 16;
                  return `${x},${y}`;
                })
                .join(" ")}
              fill="none"
              stroke={C.emerald}
              strokeWidth={3}
              strokeDasharray="8,6"
              opacity={0.6}
            />
          </svg>
        )}

        {/* Insight card */}
        <div
          style={{
            ...fade(110, 20),
            background: "rgba(255,255,255,0.03)",
            border: "2px solid rgba(255,255,255,0.06)",
            borderRadius: 16,
            padding: "20px 28px",
            fontSize: 84,
            fontWeight: 600,
            color: C.text2,
            lineHeight: 1.4,
            width: "100%",
          }}
        >
          Insurance drops ~{savingsPct}% from Year 1 to Year 5 as the vehicle depreciates.
          No-claim bonus can reduce premiums further.
        </div>
      </div>

      {/* Bike right 38% */}
      <BikeImage
        src={vehicle.primary_nobg_url}
        width="38%"
        opacity={0.5}
        startFrame={5}
        glowColor="rgba(139,92,246,0.04)"
      />

      <Watermark />
    </AbsoluteFill>
  );
};
