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
import { SlideBackground } from "../../components/SlideBackground";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";
import { SafeZone } from "../../components/SafeZone";

const CLICK_FRAMES = [0, 6, 16, 28, 42, 56];

function verdictInfo(rating: number): {
  label: string;
  bg: string;
  color: string;
} {
  if (rating >= 8.0) {
    return { label: "BUY", bg: "rgba(16,185,129,0.2)", color: "#10b981" };
  }
  if (rating >= 6.5) {
    return { label: "CONSIDER", bg: "rgba(245,158,11,0.2)", color: "#f59e0b" };
  }
  return { label: "SKIP", bg: "rgba(239,68,68,0.2)", color: "#ef4444" };
}

export const ReviewBuySkipPortrait: React.FC<PortraitSlideProps> = ({
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

  const rating = vehicle.expert_rating ?? 0;
  const ratingColor = vehicle.rating_color || "#4783ff";
  const verdict = verdictInfo(rating);
  const countedRating = useCountUp(20, 38, Math.round(rating * 10));
  const bestFor = vehicle.best_for ?? "All riders";
  const resaleRating = vehicle.resale_rating ?? "\u2014";
  const depPct = vehicle.depreciation_1yr_pct;

  // Clamp expert verdict to 3 lines via inline style
  const expertVerdict = vehicle.expert_verdict ?? "";

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground edgeLightColor={C.emerald} />
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

        {/* Verdict badge */}
        <div
          style={{
            ...fade(0, 12),
            textAlign: "center",
            marginTop: 24,
          }}
        >
          <span
            style={{
              display: "inline-block",
              padding: "12px 36px",
              borderRadius: 50,
              background: verdict.bg,
              border: `1px solid ${verdict.color}44`,
              fontSize: 20,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: verdict.color,
              boxShadow: `0 0 20px ${verdict.color}22`,
            }}
          >
            {verdict.label}
          </span>
        </div>

        {/* Vehicle image */}
        <div
          style={{
            ...fade(6, 12),
            display: "flex",
            justifyContent: "center",
            marginTop: 20,
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
                  "drop-shadow(0 25px 60px rgba(0,0,0,0.7)) drop-shadow(0 0 40px rgba(16,185,129,0.1))",
              }}
            />
          )}
        </div>

        {/* Brand + model name */}
        <div
          style={{
            ...fade(12),
            textAlign: "center",
            marginTop: 10,
            fontSize: 34,
            fontWeight: 900,
            color: C.text1,
          }}
        >
          {vehicle.brand_name} {vehicle.short_name}
        </div>

        {/* Large rating */}
        <div
          style={{
            textAlign: "center",
            marginTop: 16,
          }}
        >
          <div
            style={{
              opacity: interpolate(frame, [20, 26], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              fontSize: 72,
              fontWeight: 900,
              color: ratingColor,
              lineHeight: 1,
              textShadow: `0 0 40px ${ratingColor}44`,
            }}
          >
            {(countedRating / 10).toFixed(1)}
          </div>
          <div
            style={{
              ...fade(24),
              fontSize: 18,
              fontWeight: 700,
              color: C.text4,
              marginTop: 2,
            }}
          >
            / 10
          </div>
        </div>

        {/* Expert verdict text */}
        {expertVerdict && (
          <div
            style={{
              ...fade(30),
              textAlign: "center",
              marginTop: 16,
              paddingLeft: 40,
              paddingRight: 40,
              fontSize: 17,
              fontWeight: 500,
              color: C.text3,
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {expertVerdict}
          </div>
        )}

        {/* Best for / Not for pills */}
        <div
          style={{
            ...fade(36),
            display: "flex",
            gap: 10,
            justifyContent: "center",
            marginTop: 18,
            flexWrap: "wrap",
            paddingLeft: 32,
            paddingRight: 32,
          }}
        >
          {((vehicle as any).best_for_list ?? [bestFor]).slice(0, 2).map((item: string, i: number) => (
            <span
              key={`best-${i}`}
              style={{
                display: "inline-block",
                padding: "6px 16px",
                borderRadius: 50,
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.18)",
                fontSize: 14,
                fontWeight: 700,
                color: C.emerald,
              }}
            >
              {item}
            </span>
          ))}
          {((vehicle as any).not_for_list ?? []).slice(0, 1).map((item: string, i: number) => (
            <span
              key={`not-${i}`}
              style={{
                display: "inline-block",
                padding: "6px 16px",
                borderRadius: 50,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.18)",
                fontSize: 14,
                fontWeight: 700,
                color: C.red,
              }}
            >
              Not for: {item.toLowerCase()}
            </span>
          ))}
        </div>

        {/* Quick facts row */}
        <div
          style={{
            ...fade(42),
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginTop: 14,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              padding: "8px 18px",
              borderRadius: 50,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: 15,
              fontWeight: 700,
              color: C.text2,
            }}
          >
            {vehicle.price_formatted}
          </span>
          <span
            style={{
              padding: "8px 18px",
              borderRadius: 50,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: 15,
              fontWeight: 700,
              color: C.text2,
            }}
          >
            {resaleRating} resale
          </span>
          <span
            style={{
              padding: "8px 18px",
              borderRadius: 50,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: 15,
              fontWeight: 700,
              color: C.text2,
            }}
          >
            {depPct != null ? `${depPct}%` : "\u2014"} yr1 dep
          </span>
        </div>

        {/* CTA */}
        <div
          style={{
            ...fade(52),
            textAlign: "center",
            marginTop: 20,
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: C.emerald,
          }}
        >
          {"Save \u00B7 Share \u00B7 Follow"}
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
