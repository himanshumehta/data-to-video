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

const CLICK_FRAMES = [0, 6, 12, 28, 36, 48];
const BIKE_HEIGHT = 680;
const RATING_SIZE = 180;
const RATING_TOP = 530; // overlaps gradient zone -- creates depth

export const ReviewSnapshotReels: React.FC<PortraitSlideProps> = ({
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

  const rating = vehicle.expert_rating || 0;
  const ratingColor = vehicle.rating_color || C.amber;
  const pros = (vehicle.pros || []).slice(0, 3);
  const cons = (vehicle.cons || []).slice(0, 3);

  // SVG rating circle -- 180px for cinematic overlapping effect
  const circleR = 76;
  const circ = 2 * Math.PI * circleR;
  const ratingProgress = interpolate(frame, [12, 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dashOffset = circ * (1 - (rating / 10) * ratingProgress);
  const ratingCountUp = useCountUp(12, 32, rating * 10);
  const ratingDisplay = (ratingCountUp / 10).toFixed(1);

  // Spring scale for rating circle entrance
  const ratingSpring = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { ...SPRING_CONFIG, stiffness: 60 },
  });

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: C.bg }}>
      {/* Click sounds */}
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* ── HERO BIKE ZONE ── */}
      {/* Amber atmospheric glow */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 450,
          background:
            "radial-gradient(ellipse, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.03) 40%, transparent 70%)",
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
            opacity: interpolate(frame, [6, 16], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            filter:
              "drop-shadow(0 40px 80px rgba(0,0,0,0.8)) drop-shadow(0 0 50px rgba(245,158,11,0.10))",
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

      {/* ── RATING CIRCLE -- OVERLAPPING ── */}
      {/* Positioned to sit partially over bike, partially over content */}
      <div
        style={{
          position: "absolute",
          top: RATING_TOP,
          left: "50%",
          transform: `translateX(-50%) scale(${0.5 + ratingSpring * 0.5})`,
          width: RATING_SIZE,
          height: RATING_SIZE,
          zIndex: 15,
          opacity: ratingSpring,
        }}
      >
        <svg
          width={RATING_SIZE}
          height={RATING_SIZE}
          viewBox={`0 0 ${RATING_SIZE} ${RATING_SIZE}`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: "rotate(-90deg)",
          }}
        >
          <circle
            cx={RATING_SIZE / 2}
            cy={RATING_SIZE / 2}
            r={circleR}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={7}
          />
          <circle
            cx={RATING_SIZE / 2}
            cy={RATING_SIZE / 2}
            r={circleR}
            fill="none"
            stroke={ratingColor}
            strokeWidth={7}
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
            background: "rgba(9,9,11,0.92)",
            boxShadow: `0 0 60px rgba(245,158,11,0.15), 0 20px 50px rgba(0,0,0,0.6)`,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: ratingColor,
              lineHeight: 0.9,
            }}
          >
            {ratingDisplay}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text4 }}>
            / 10
          </div>
        </div>
      </div>

      {/* ── CONTENT AREA ── */}
      <div
        style={{
          position: "absolute",
          top: RATING_TOP + RATING_SIZE / 2 + 20,
          left: 0,
          right: 0,
          bottom: "17%",
          padding: "0 86px 0 44px",
          display: "flex",
          flexDirection: "column",
          zIndex: 10,
        }}
      >
        {/* Vehicle name + verdict -- below rating circle */}
        <div
          style={{
            ...fade(14, 10),
            textAlign: "center",
            paddingTop: RATING_SIZE / 2 + 8,
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: C.text1,
              lineHeight: 1.1,
            }}
          >
            {vehicle.brand_name} {vehicle.short_name}
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 500,
              color: C.text3,
              lineHeight: 1.4,
              marginTop: 8,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical" as const,
              overflow: "hidden",
            }}
          >
            {vehicle.expert_verdict}
          </div>
        </div>

        {/* STRENGTHS section */}
        <div style={{ marginTop: 28 }}>
          <div
            style={{
              ...fade(28, 8),
              fontSize: 22,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              marginBottom: 14,
              color: "#10B981",
            }}
          >
            Strengths
          </div>
          {pros.map((p, i) => (
            <div
              key={`pro-${i}`}
              style={{
                ...fade(30 + i * 3, 10),
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "10px 20px",
                marginBottom: 8,
                borderLeft: "4px solid rgba(16,185,129,0.5)",
                background: "rgba(255,255,255,0.03)",
                width: "100%",
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: "#10B981",
                  flexShrink: 0,
                }}
              >
                +
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: C.text2,
                  lineHeight: 1.3,
                }}
              >
                {p}
              </div>
            </div>
          ))}
        </div>

        {/* WATCH OUT section */}
        <div style={{ marginTop: 24 }}>
          <div
            style={{
              ...fade(40, 8),
              fontSize: 22,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              marginBottom: 14,
              color: "#ef4444",
            }}
          >
            Watch Out
          </div>
          {cons.map((c, i) => (
            <div
              key={`con-${i}`}
              style={{
                ...fade(42 + i * 3, 10),
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "10px 20px",
                marginBottom: 8,
                borderLeft: "4px solid rgba(239,68,68,0.5)",
                background: "rgba(255,255,255,0.03)",
                width: "100%",
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: "#ef4444",
                  flexShrink: 0,
                }}
              >
                {"\u2212"}
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: C.text2,
                  lineHeight: 1.3,
                }}
              >
                {c}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress dots */}
      <ProgressDots
        current={slideNumber}
        total={totalSlides}
        activeColor={C.amber}
        startFrame={0}
        variant="reels"
      />

      {/* Watermark */}
      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
