import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Audio,
  Sequence,
  staticFile,
} from "remotion";
import { PortraitSlideProps } from "../../types";
import { C } from "../../utils/colors";
import { useCountUp } from "../../utils/animations";
import { SlideBackground } from "../../components/SlideBackground";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";
import { SafeZone } from "../../components/SafeZone";

const CLICK_FRAMES = [0, 6, 16, 28, 40, 52];

function safetyColor(score: number): string {
  if (score >= 7.5) return "#10b981";
  if (score >= 6) return "#3b82f6";
  if (score >= 4) return "#f59e0b";
  return "#ef4444";
}

export const ReviewSafetyPortrait: React.FC<PortraitSlideProps> = ({
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

  const safetyScore = vehicle.safety_score ?? 0;
  const color = safetyColor(safetyScore);
  const countedScore = useCountUp(12, 32, Math.round(safetyScore * 10));
  const ncapRating = vehicle.ncap_rating ?? 0;
  const ncapBody = vehicle.ncap_body ?? "";
  const safetyFeatures = (vehicle.safety_features ?? []).slice(0, 6);
  const airbagCount = vehicle.airbag_count ?? 0;
  const tractionControl = vehicle.traction_control ?? false;
  const hasSafetyData = safetyFeatures.length >= 2 || (vehicle.safety_score != null && vehicle.safety_score > 0);

  // SVG circle
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeProgress = interpolate(
    frame,
    [12, 32],
    [circumference, circumference - (safetyScore / 10) * circumference],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground edgeLightColor={C.blue} />
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      <SlideCounter
        current={slideNumber}
        total={totalSlides}
        fontSize={18}
        startFrame={0}
      />

      <SafeZone style={{ zIndex: 10, alignItems: "center" }}>
        <Logo size={36} startFrame={0} />

        {/* Section pill */}
        <div style={{ ...fade(0, 10), textAlign: "center", marginTop: 16 }}>
          <span
            style={{
              display: "inline-block",
              padding: "10px 28px",
              borderRadius: 50,
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.25)",
              fontSize: 16,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: C.blue,
            }}
          >
            Safety
          </span>
        </div>

        {/* Vehicle name */}
        <div
          style={{
            ...fade(4),
            textAlign: "center",
            marginTop: 16,
            fontSize: 24,
            fontWeight: 900,
            color: C.text1,
          }}
        >
          {vehicle.brand_name} {vehicle.short_name}
        </div>

        {hasSafetyData ? (
          <>
            {/* Safety score circle */}
            <div
              style={{
                ...fade(8, 8),
                display: "flex",
                justifyContent: "center",
                marginTop: 20,
              }}
            >
              <div style={{ position: "relative", width: 110, height: 110 }}>
                <svg
                  width={110}
                  height={110}
                  style={{ position: "absolute", top: 0, left: 0 }}
                >
                  <circle
                    cx={55}
                    cy={55}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={7}
                  />
                  <circle
                    cx={55}
                    cy={55}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={7}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeProgress}
                    strokeLinecap="round"
                    transform="rotate(-90 55 55)"
                    style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
                  />
                </svg>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 110,
                    height: 110,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 900,
                      color,
                      lineHeight: 1,
                    }}
                  >
                    {(countedScore / 10).toFixed(1)}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: C.text4,
                      marginTop: 2,
                    }}
                  >
                    / 10
                  </div>
                </div>
              </div>
            </div>

            {/* NCAP row */}
            <div
              style={{
                ...fade(26),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                marginTop: 18,
              }}
            >
              {ncapRating > 0 ? (
                <>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: C.text3,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {ncapBody || "NCAP"}
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: 22,
                          color: i < ncapRating ? C.amber : C.text4,
                        }}
                      >
                        {"\u2605"}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: C.text4,
                    fontStyle: "italic",
                  }}
                >
                  Not yet tested
                </div>
              )}
            </div>

            {/* Safety features checklist */}
            <div
              style={{
                marginTop: 22,
                width: "100%",
                paddingLeft: 48,
                paddingRight: 48,
              }}
            >
              {safetyFeatures.map((feature, i) => {
                const itemStart = 32 + i * 3;
                return (
                  <div
                    key={i}
                    style={{
                      ...fade(itemStart, 10),
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: "rgba(16,185,129,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        fontWeight: 900,
                        color: C.emerald,
                        flexShrink: 0,
                      }}
                    >
                      {"\u2713"}
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: C.text2,
                      }}
                    >
                      {feature}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Traction control + Airbag row */}
            <div
              style={{
                display: "flex",
                gap: 14,
                marginTop: 16,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {/* Traction control */}
              <div
                style={{
                  ...fade(52),
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 20px",
                  borderRadius: 50,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: C.text3 }}>
                  Traction Control
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 900,
                    color: tractionControl ? C.emerald : C.red,
                    textTransform: "uppercase",
                    padding: "2px 10px",
                    borderRadius: 6,
                    background: tractionControl
                      ? "rgba(16,185,129,0.12)"
                      : "rgba(239,68,68,0.12)",
                  }}
                >
                  {tractionControl ? "YES" : "NO"}
                </span>
              </div>

              {/* Airbag count */}
              {airbagCount > 0 && (
                <div
                  style={{
                    ...fade(55),
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 20px",
                    borderRadius: 50,
                    background: "rgba(59,130,246,0.08)",
                    border: "1px solid rgba(59,130,246,0.18)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: C.blue,
                    }}
                  >
                    {airbagCount} Airbag{airbagCount > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          /* No safety data state */
          <div
            style={{
              ...fade(8),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginTop: 60,
              padding: "40px 0",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                background: "rgba(59,130,246,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                color: C.blue,
              }}
            >
              {"\u26A1"}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.text2 }}>
              Safety data not available
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, color: C.text4 }}>
              No safety features or ratings on record
            </div>
          </div>
        )}
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
