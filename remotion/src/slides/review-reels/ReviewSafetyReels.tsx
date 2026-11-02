import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Audio,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { PortraitSlideProps } from "../../types";
import { C } from "../../utils/colors";
import { useCountUp } from "../../utils/animations";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";

const CLICK_FRAMES = [0, 8, 18, 32, 46, 60];

function safetyColor(score: number): string {
  if (score >= 7.5) return C.emerald;
  if (score >= 6) return C.blue;
  if (score >= 4) return C.amber;
  return C.red;
}

export const ReviewSafetyReels: React.FC<PortraitSlideProps> = ({
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

  const safetyScore = vehicle.safety_score ?? 0;
  const sColor = safetyColor(safetyScore);
  const countedScore = useCountUp(18, 42, Math.round(safetyScore * 10));

  // SVG circle
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeProgress = interpolate(
    frame,
    [18, 42],
    [circumference, circumference - (safetyScore / 10) * circumference],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const ncapRating = vehicle.ncap_rating;
  const ncapBody = vehicle.ncap_body;
  const safetyFeatures = (vehicle.safety_features ?? []).slice(0, 6);
  const hasTc = vehicle.traction_control;

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: C.bg }}>
      {/* Click sounds */}
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Blue glow at top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 500,
          background:
            "radial-gradient(ellipse, rgba(71,131,255,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Logo */}
      <div style={{ position: "absolute", top: 154, left: 44, zIndex: 20 }}>
        <Logo size={36} startFrame={0} />
      </div>

      {/* Slide counter */}
      <SlideCounter current={slideNumber} total={totalSlides} variant="reels" />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          top: 240,
          left: 0,
          right: 0,
          bottom: "17%",
          padding: "0 44px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          zIndex: 10,
        }}
      >
        {/* Safety Verdict pill */}
        <div style={fade(0, 10)}>
          <span
            style={{
              display: "inline-block",
              padding: "10px 32px",
              borderRadius: 50,
              background: "rgba(71,131,255,0.10)",
              border: "1px solid rgba(71,131,255,0.25)",
              fontSize: 20,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: C.blue,
            }}
          >
            Safety Verdict
          </span>
        </div>

        {/* Vehicle name */}
        <div
          style={{
            ...fade(6),
            fontSize: 48,
            fontWeight: 900,
            color: C.text1,
            textAlign: "center",
          }}
        >
          {vehicle.brand_name} {vehicle.short_name}
        </div>

        {/* Safety score circle */}
        <div
          style={{
            ...fade(12, 8),
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "relative", width: 140, height: 140 }}>
            <svg
              width={140}
              height={140}
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              <circle
                cx={70}
                cy={70}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={8}
              />
              <circle
                cx={70}
                cy={70}
                r={radius}
                fill="none"
                stroke={sColor}
                strokeWidth={8}
                strokeDasharray={circumference}
                strokeDashoffset={strokeProgress}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
                style={{ filter: `drop-shadow(0 0 8px ${sColor}66)` }}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 140,
                height: 140,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 900,
                  color: sColor,
                  lineHeight: 1,
                }}
              >
                {(countedScore / 10).toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* NCAP section */}
        <div
          style={{
            ...fade(28),
            textAlign: "center",
          }}
        >
          {ncapRating != null && ncapBody ? (
            <>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: C.text3,
                  marginBottom: 8,
                }}
              >
                {ncapBody}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 32,
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
                fontSize: 22,
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
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {safetyFeatures.map((feature, i) => {
            const itemStart = 34 + i * 4;
            return (
              <div
                key={i}
                style={{
                  ...fade(itemStart, 10),
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
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
                    fontSize: 26,
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

        {/* Traction control badge */}
        {hasTc != null && (
          <div
            style={{
              ...fade(60, 10),
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 28px",
              borderRadius: 50,
              background: hasTc
                ? "rgba(16,185,129,0.10)"
                : "rgba(239,68,68,0.10)",
              border: `1px solid ${hasTc ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: hasTc ? C.emerald : C.red,
              }}
            >
              TC
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: hasTc ? C.emerald : C.red,
              }}
            >
              {hasTc ? "YES" : "NO"}
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
