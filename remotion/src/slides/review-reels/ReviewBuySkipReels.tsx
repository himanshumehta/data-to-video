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
import { C } from "../../utils/colors";
import { useCountUp, SPRING_CONFIG } from "../../utils/animations";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";

const CLICK_FRAMES = [0, 5, 14, 30, 48, 62];
const BIKE_HEIGHT = 650;

function verdictInfo(rating: number): {
  label: string;
  color: string;
  bg: string;
  border: string;
} {
  if (rating >= 8.0) {
    return {
      label: "BUY",
      color: "#fff",
      bg: C.emerald,
      border: "rgba(16,185,129,0.4)",
    };
  }
  if (rating >= 6.5) {
    return {
      label: "CONSIDER",
      color: "#000",
      bg: C.amber,
      border: "rgba(245,158,11,0.4)",
    };
  }
  return {
    label: "SKIP",
    color: "#fff",
    bg: C.red,
    border: "rgba(239,68,68,0.4)",
  };
}

export const ReviewBuySkipReels: React.FC<PortraitSlideProps> = ({
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

  const rating = vehicle.expert_rating ?? 0;
  const ratingColor = vehicle.rating_color || C.emerald;
  const countedRating = useCountUp(22, 48, Math.round(rating * 10));
  const verdict = verdictInfo(rating);

  const verdictScale = spring({
    frame: frame - 14,
    fps,
    config: SPRING_CONFIG,
  });

  const expertVerdict = vehicle.expert_verdict ?? "";
  // Truncate to ~3 lines (~120 chars)
  const truncatedVerdict =
    expertVerdict.length > 120
      ? expertVerdict.slice(0, 117) + "..."
      : expertVerdict;

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: C.bg }}>
      {/* Click sounds */}
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Emerald glow behind bike */}
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

      {/* Bike hero image */}
      {vehicle.primary_nobg_url && (
        <Img
          src={vehicle.primary_nobg_url}
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

      {/* Logo */}
      <div style={{ position: "absolute", top: 154, left: 44, zIndex: 20 }}>
        <Logo size={36} startFrame={0} />
      </div>

      {/* Slide counter */}
      <SlideCounter current={slideNumber} total={totalSlides} variant="reels" />

      {/* Vehicle name over gradient */}
      <div
        style={{
          ...fade(8, 10),
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

      {/* Content area */}
      <div
        style={{
          position: "absolute",
          top: BIKE_HEIGHT,
          left: 0,
          right: 0,
          bottom: "17%",
          padding: "0 44px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          zIndex: 10,
        }}
      >
        {/* Verdict badge */}
        <div
          style={{
            opacity: verdictScale,
            transform: `scale(${0.6 + verdictScale * 0.4})`,
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "12px 48px",
              borderRadius: 50,
              background: verdict.bg,
              border: `2px solid ${verdict.border}`,
              fontSize: 28,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: verdict.color,
              boxShadow: `0 0 40px ${verdict.bg}44`,
            }}
          >
            {verdict.label}
          </div>
        </div>

        {/* Large rating */}
        <div
          style={{
            opacity: interpolate(frame, [22, 30], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            fontSize: 140,
            fontWeight: 900,
            color: ratingColor,
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
            textShadow: `0 0 80px ${ratingColor}44, 0 0 40px ${ratingColor}22`,
          }}
        >
          {(countedRating / 10).toFixed(1)}
        </div>

        {/* Expert verdict text */}
        <div
          style={{
            ...fade(34),
            fontSize: 26,
            fontWeight: 600,
            color: C.text3,
            textAlign: "center",
            lineHeight: 1.4,
            maxWidth: 900,
          }}
        >
          {truncatedVerdict}
        </div>

        {/* Best-for pill */}
        <div style={fade(42)}>
          <div
            style={{
              display: "inline-block",
              padding: "10px 28px",
              borderRadius: 50,
              background: "rgba(245,158,11,0.10)",
              border: "1px solid rgba(245,158,11,0.25)",
              fontSize: 22,
              fontWeight: 800,
              color: C.amber,
            }}
          >
            {vehicle.best_for ?? "All riders"}
          </div>
        </div>

        {/* Quick facts row */}
        <div
          style={{
            ...fade(48),
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              padding: "8px 20px",
              borderRadius: 50,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: 20,
              fontWeight: 700,
              color: C.text2,
            }}
          >
            {vehicle.price_formatted}
          </div>
          {vehicle.resale_rating != null && (
            <div
              style={{
                padding: "8px 20px",
                borderRadius: 50,
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.15)",
                fontSize: 20,
                fontWeight: 700,
                color: C.emerald,
              }}
            >
              Resale: {vehicle.resale_rating}
            </div>
          )}
          {vehicle.depreciation_1yr_pct != null && (
            <div
              style={{
                padding: "8px 20px",
                borderRadius: 50,
                background: "rgba(244,63,94,0.08)",
                border: "1px solid rgba(244,63,94,0.15)",
                fontSize: 20,
                fontWeight: 700,
                color: C.rose,
              }}
            >
              -{vehicle.depreciation_1yr_pct}% yr 1
            </div>
          )}
        </div>

        {/* CTA */}
        <div
          style={{
            ...fade(58),
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: C.emerald,
            textShadow: "0 0 24px rgba(16,185,129,0.25)",
          }}
        >
          {"Save \u00B7 Share \u00B7 Follow"}
        </div>
      </div>

      <ProgressDots
        current={slideNumber}
        total={totalSlides}
        activeColor={C.emerald}
        startFrame={0}
        variant="reels"
      />
      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
