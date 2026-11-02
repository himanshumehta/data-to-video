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
} from "remotion";
import { PortraitSlideProps } from "../../types";
import { C } from "../../utils/colors";
import { useCountUp } from "../../utils/animations";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";

const CLICK_FRAMES = [0, 8, 18, 30, 42, 58];
const BIKE_HEIGHT = 780;

function scoreColor(score: number): string {
  if (score >= 7.5) return C.emerald;
  if (score >= 6) return C.blue;
  if (score >= 4) return C.amber;
  return C.red;
}

export const ReviewScoreCardReels: React.FC<PortraitSlideProps> = ({
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
  const ratingColor = vehicle.rating_color || scoreColor(rating);
  const countedRating = useCountUp(12, 38, Math.round(rating * 10));
  const breakdown = vehicle.expert_breakdown ?? {};
  const categories = Object.entries(breakdown).slice(0, 6);

  // SVG circle animation
  const radius = 75;
  const circumference = 2 * Math.PI * radius;
  const strokeProgress = interpolate(
    frame,
    [12, 38],
    [circumference, circumference - (rating / 10) * circumference],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: C.bg }}>
      {/* Click sounds */}
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Amber glow behind bike */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 600,
          background:
            "radial-gradient(ellipse, rgba(245,158,11,0.10) 0%, rgba(245,158,11,0.04) 40%, transparent 70%)",
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
            top: 60,
            left: 0,
            right: 0,
            width: "100%",
            height: 450,
            objectFit: "contain",
            objectPosition: "center center",
            filter:
              "drop-shadow(0 30px 80px rgba(0,0,0,0.8)) drop-shadow(0 0 60px rgba(245,158,11,0.12))",
            zIndex: 2,
            ...fade(0, 15),
          }}
        />
      )}

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: BIKE_HEIGHT + 50,
          background:
            "linear-gradient(to bottom, transparent 30%, rgba(9,9,11,0.4) 50%, rgba(9,9,11,0.85) 68%, #09090b 85%)",
          pointerEvents: "none",
          zIndex: 3,
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
          position: "absolute",
          top: BIKE_HEIGHT - 260,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <div
          style={{
            ...fade(8),
            fontSize: 52,
            fontWeight: 900,
            letterSpacing: "-0.01em",
            color: C.text1,
            textShadow: "0 2px 20px rgba(0,0,0,0.8)",
          }}
        >
          {vehicle.brand_name} {vehicle.short_name}
        </div>
        <div
          style={{
            ...fade(12),
            fontSize: 22,
            fontWeight: 700,
            color: C.amber,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            marginTop: 6,
          }}
        >
          The Score
        </div>
      </div>

      {/* Content area below gradient */}
      <div
        style={{
          position: "absolute",
          top: 750,
          left: 0,
          right: 0,
          bottom: "17%",
          padding: "0 86px 0 44px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          zIndex: 10,
        }}
      >
        {/* Rating circle */}
        <div
          style={{
            ...fade(10, 8),
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "relative", width: 170, height: 170 }}>
            <svg
              width={170}
              height={170}
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              {/* Track */}
              <circle
                cx={85}
                cy={85}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={10}
              />
              {/* Fill */}
              <circle
                cx={85}
                cy={85}
                r={radius}
                fill="none"
                stroke={ratingColor}
                strokeWidth={10}
                strokeDasharray={circumference}
                strokeDashoffset={strokeProgress}
                strokeLinecap="round"
                transform="rotate(-90 85 85)"
                style={{
                  filter: `drop-shadow(0 0 10px ${ratingColor}66)`,
                }}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 170,
                height: 170,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: 100,
                  fontWeight: 900,
                  color: ratingColor,
                  lineHeight: 1,
                }}
              >
                {(countedRating / 10).toFixed(1)}
              </div>
              <div
                style={{
                  fontSize: 22,
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
            width: "100%",
          }}
        >
          {categories.map(([label, score], i) => {
            const barStart = 40 + i * 3;
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
                  marginBottom: 12,
                  opacity: rowFade,
                }}
              >
                <div
                  style={{
                    width: 140,
                    fontSize: 22,
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
                    height: 10,
                    borderRadius: 5,
                    background: "rgba(255,255,255,0.06)",
                    marginLeft: 10,
                    marginRight: 14,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(score / 10) * 100 * barProgress}%`,
                      height: "100%",
                      borderRadius: 5,
                      background: barColor,
                      boxShadow: `0 0 6px ${barColor}44`,
                    }}
                  />
                </div>
                <div
                  style={{
                    width: 44,
                    fontSize: 22,
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
            ...fade(62),
            textAlign: "center",
            fontSize: 24,
            fontWeight: 800,
            color: C.emerald,
            letterSpacing: "0.02em",
            textShadow: "0 0 24px rgba(16,185,129,0.25)",
          }}
        >
          {"Swipe for the deep dive \u2192"}
        </div>
      </div>

      <ProgressDots
        current={slideNumber}
        total={totalSlides}
        startFrame={0}
        variant="reels"
      />
      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
