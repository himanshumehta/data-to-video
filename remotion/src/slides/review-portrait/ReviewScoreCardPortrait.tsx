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

const CLICK_FRAMES = [0, 8, 18, 30, 40, 55];

function scoreColor(score: number): string {
  if (score >= 7.5) return "#10b981";
  if (score >= 6) return "#3b82f6";
  if (score >= 4) return "#f59e0b";
  return "#ef4444";
}

export const ReviewScoreCardPortrait: React.FC<PortraitSlideProps> = ({
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
  const ratingColor = vehicle.rating_color || scoreColor(rating);
  const countedRating = useCountUp(10, 35, Math.round(rating * 10));
  const breakdown = vehicle.expert_breakdown ?? {};
  const categories = Object.entries(breakdown).slice(0, 6);

  // SVG circle animation
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeProgress = interpolate(
    frame,
    [10, 35],
    [circumference, circumference - (rating / 10) * circumference],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

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
        <Logo size={40} startFrame={0} />

        {/* Section pill */}
        <div style={{ ...fade(0, 10), textAlign: "center", marginTop: 16 }}>
          <span
            style={{
              display: "inline-block",
              padding: "10px 28px",
              borderRadius: 50,
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.25)",
              fontSize: 16,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: C.amber,
            }}
          >
            The Score
          </span>
        </div>

        {/* Vehicle image */}
        <div
          style={{
            ...fade(3, 12),
            display: "flex",
            justifyContent: "center",
            marginTop: 16,
            height: 200,
          }}
        >
          {vehicle.primary_nobg_url && (
            <Img
              src={vehicle.primary_nobg_url}
              style={{
                height: "100%",
                objectFit: "contain",
                filter:
                  "drop-shadow(0 20px 50px rgba(0,0,0,0.6)) drop-shadow(0 0 30px rgba(16,185,129,0.12))",
              }}
            />
          )}
        </div>

        {/* Brand + model + price */}
        <div style={{ ...fade(8), textAlign: "center", marginTop: 8 }}>
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
              display: "inline-block",
              marginTop: 8,
              padding: "6px 18px",
              borderRadius: 50,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: 16,
              fontWeight: 700,
              color: C.text2,
            }}
          >
            {vehicle.price_formatted}
          </div>
        </div>

        {/* Hero rating circle */}
        <div
          style={{
            ...fade(10, 8),
            display: "flex",
            justifyContent: "center",
            marginTop: 24,
          }}
        >
          <div style={{ position: "relative", width: 140, height: 140 }}>
            <svg
              width={140}
              height={140}
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              {/* Track */}
              <circle
                cx={70}
                cy={70}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={8}
              />
              {/* Fill */}
              <circle
                cx={70}
                cy={70}
                r={radius}
                fill="none"
                stroke={ratingColor}
                strokeWidth={8}
                strokeDasharray={circumference}
                strokeDashoffset={strokeProgress}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
                style={{
                  filter: `drop-shadow(0 0 8px ${ratingColor}66)`,
                }}
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
                  fontSize: 48,
                  fontWeight: 900,
                  color: ratingColor,
                  lineHeight: 1,
                }}
              >
                {(countedRating / 10).toFixed(1)}
              </div>
              <div
                style={{
                  fontSize: 16,
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

        {/* Mini breakdown bars */}
        <div
          style={{
            marginTop: 20,
            width: "100%",
            paddingLeft: 40,
            paddingRight: 40,
          }}
        >
          {categories.map(([label, score], i) => {
            const barStart = 38 + i * 3;
            const barProgress = interpolate(
              frame,
              [barStart, barStart + 18],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const rowFade = interpolate(
              frame,
              [barStart, barStart + 10],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const barColor = scoreColor(score);

            return (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 10,
                  opacity: rowFade,
                }}
              >
                <div
                  style={{
                    width: 110,
                    fontSize: 16,
                    fontWeight: 600,
                    color: C.text3,
                    flexShrink: 0,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 8,
                    borderRadius: 4,
                    background: "rgba(255,255,255,0.06)",
                    marginLeft: 8,
                    marginRight: 12,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(score / 10) * 100 * barProgress}%`,
                      height: "100%",
                      borderRadius: 4,
                      background: barColor,
                      boxShadow: `0 0 6px ${barColor}44`,
                    }}
                  />
                </div>
                <div
                  style={{
                    width: 36,
                    fontSize: 16,
                    fontWeight: 800,
                    color: C.text1,
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  {score.toFixed(1)}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div
          style={{
            ...fade(58),
            textAlign: "center",
            marginTop: 20,
            fontSize: 20,
            fontWeight: 700,
            color: C.emerald,
            letterSpacing: "0.02em",
          }}
        >
          {"Swipe for the deep dive \u2192"}
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
