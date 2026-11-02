import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Img,
  useVideoConfig,
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

const CLICK_FRAMES = [0, 5, 10, 25, 33, 42];

export const ReviewSnapshotPortrait: React.FC<PortraitSlideProps> = ({
  vehicle,
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fade = (start: number, dur: number = 12) => ({
    opacity: interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    transform: `translateY(${interpolate(
      frame,
      [start, start + dur],
      [20, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    )}px)`,
  });

  const rating = vehicle.expert_rating || 0;
  const ratingColor = vehicle.rating_color || C.amber;
  const pros = (vehicle.pros || []).slice(0, 3);
  const cons = (vehicle.cons || []).slice(0, 3);

  // SVG rating circle
  const circleR = 52;
  const circ = 2 * Math.PI * circleR;
  const ratingProgress = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dashOffset = circ * (1 - (rating / 10) * ratingProgress);
  const ratingCountUp = useCountUp(10, 30, rating * 10);
  const ratingDisplay = (ratingCountUp / 10).toFixed(1);

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground edgeLightColor={C.amber} />
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Glows */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 500,
          background:
            "radial-gradient(ellipse, rgba(245,158,11,0.05) 0%, transparent 70%)",
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

      <SafeZone style={{ zIndex: 10, alignItems: "center", justifyContent: "space-between" }}>
        <Logo size={36} startFrame={0} />

        {/* Section Tag */}
        <div style={{ ...fade(0, 8), textAlign: "center", marginTop: 4 }}>
          <span
            style={{
              display: "inline-block",
              padding: "10px 28px",
              borderRadius: 50,
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.25)",
              fontSize: 18,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: C.amber,
            }}
          >
            Full Ownership Review
          </span>
        </div>

        {/* Hero row: Rating circle (left) + Name + verdict (right) */}
        <div
          style={{
            ...fade(5, 12),
            display: "flex",
            alignItems: "center",
            gap: 28,
            marginTop: 20,
            width: "100%",
          }}
        >
          {/* Rating circle */}
          <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
            <svg
              width={120}
              height={120}
              viewBox="0 0 120 120"
              style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}
            >
              <circle cx={60} cy={60} r={circleR} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
              <circle
                cx={60}
                cy={60}
                r={circleR}
                fill="none"
                stroke={ratingColor}
                strokeWidth={5}
                strokeDasharray={circ}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(9,9,11,0.9)",
                boxShadow: "0 0 40px rgba(245,158,11,0.1)",
              }}
            >
              <div style={{ fontSize: 48, fontWeight: 900, color: ratingColor, lineHeight: 0.9 }}>
                {ratingDisplay}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text4 }}>/ 10</div>
            </div>
          </div>

          {/* Name + verdict */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 34, fontWeight: 900, color: C.text1, lineHeight: 1.1 }}>
              {vehicle.brand_name} {vehicle.short_name}
            </div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 500,
                color: C.text3,
                lineHeight: 1.35,
                marginTop: 8,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {vehicle.expert_verdict}
            </div>
          </div>
        </div>

        {/* Bike image */}
        {vehicle.primary_nobg_url && (
          <div style={{ ...fade(8, 12), display: "flex", justifyContent: "center", marginTop: 16, height: 300 }}>
            <Img
              src={vehicle.primary_nobg_url}
              style={{
                height: "100%",
                objectFit: "contain",
                filter: "drop-shadow(0 20px 50px rgba(0,0,0,0.6)) drop-shadow(0 0 30px rgba(245,158,11,0.08))",
              }}
            />
          </div>
        )}

        {/* Divider */}
        <div
          style={{
            ...fade(25, 6),
            margin: "16px 0 0",
            width: "100%",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(245,158,11,0.15), transparent)",
          }}
        />

        {/* Pros + Cons — side by side */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 20,
            width: "100%",
            flex: 1,
          }}
        >
          {/* Strengths column */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: 12,
                paddingBottom: 8,
                borderBottom: "2px solid rgba(16,185,129,0.2)",
                color: "#10B981",
                ...fade(30, 8),
              }}
            >
              Strengths
            </div>
            {pros.map((p, i) => (
              <div
                key={`pro-${i}`}
                style={{
                  ...fade(33 + i * 3, 10),
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: "rgba(16,185,129,0.15)",
                    color: "#10B981",
                    fontSize: 18,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  +
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, color: C.text2, lineHeight: 1.35 }}>
                  {p}
                </div>
              </div>
            ))}
          </div>

          {/* Watch Out column */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: 12,
                paddingBottom: 8,
                borderBottom: "2px solid rgba(239,68,68,0.2)",
                color: "#ef4444",
                ...fade(30, 8),
              }}
            >
              Watch Out
            </div>
            {cons.map((c, i) => (
              <div
                key={`con-${i}`}
                style={{
                  ...fade(33 + i * 3, 10),
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: "rgba(239,68,68,0.15)",
                    color: "#ef4444",
                    fontSize: 18,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {"\u2212"}
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, color: C.text2, lineHeight: 1.35 }}>
                  {c}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SafeZone>

      <ProgressDots
        current={slideNumber}
        total={totalSlides}
        activeColor={C.amber}
        startFrame={0}
      />
      <Watermark variant="portrait" />
    </AbsoluteFill>
  );
};
