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
import { resolveImage } from "../../utils/resolveImage";
import { C } from "../../utils/colors";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";

const CLICK_FRAMES = [0, 5, 14, 24, 42, 50];

function scoreColor(score: number): string {
  if (score >= 7.5) return "#22c55e";
  if (score >= 6.0) return "#3b82f6";
  if (score >= 4.0) return "#f59e0b";
  return "#ef4444";
}

const REVIEW_TAGS = [
  "Cost Breakdown",
  "Depreciation",
  "Insurance",
  "Service Costs",
  "Segment Comparison",
];

export const ReviewCtaReels: React.FC<PortraitSlideProps> = ({
  vehicle,
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();

  const fade = (start: number, dur = 12) => ({
    opacity: interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    transform: `translateY(${interpolate(frame, [start, start + dur], [20, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })}px)`,
  });

  const breakdownEntries = Object.entries(vehicle.expert_breakdown || {})
    .sort(([, a], [, b]) => (b as number) - (a as number)); // highest score first

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: "#09090b" }}>
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Blue glow behind bike */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 500,
          background: "radial-gradient(ellipse, rgba(71,131,255,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Bike hero -- large, clear */}
      {vehicle.primary_nobg_url && (
        <Img
          src={resolveImage(vehicle.primary_nobg_url)}
          style={{
            position: "absolute",
            top: 200,
            left: "5%",
            width: "90%",
            height: 480,
            objectFit: "contain",
            objectPosition: "center center",
            filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.7)) drop-shadow(0 0 40px rgba(71,131,255,0.15))",
            zIndex: 2,
            ...fade(0, 15),
          }}
        />
      )}

      {/* Gradient overlay -- gentle fade */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 780,
          background: "linear-gradient(to bottom, transparent 50%, rgba(9,9,11,0.3) 62%, rgba(9,9,11,0.75) 76%, #09090b 92%)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />

      {/* Logo -- centered, 2x size, above bike */}
      <div style={{ position: "absolute", top: 72, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 20, pointerEvents: "none" }}>
        <Logo size={72} startFrame={0} />
      </div>
      <SlideCounter current={slideNumber} total={totalSlides} startFrame={0} variant="reels" />

      {/* Vehicle name (below bike) */}
      <div style={{ position: "absolute", top: 700, left: 0, right: 0, zIndex: 10, textAlign: "center" }}>
        <div style={{ ...fade(5), fontSize: 44, fontWeight: 900, color: C.text1, textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>
          {vehicle.brand_name} {vehicle.short_name}
        </div>
      </div>

      {/* Section pill */}
      <div style={{ position: "absolute", top: 770, left: 0, right: 0, zIndex: 10, display: "flex", justifyContent: "center" }}>
        <div style={{ ...fade(8, 8) }}>
          <span style={{ display: "inline-block", padding: "8px 24px", borderRadius: 50, background: "rgba(71,131,255,0.10)", border: "1px solid rgba(71,131,255,0.20)", fontSize: 18, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: C.blue }}>
            Expert Ratings
          </span>
        </div>
      </div>

      {/* Category cards — sorted by score descending */}
      <div
        style={{
          position: "absolute",
          top: 850,
          left: "15%",
          right: "15%",
          bottom: 280,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 12,
          zIndex: 10,
        }}
      >
        {breakdownEntries.map(([name, score], i) => {
          const color = scoreColor(score as number);
          const cardStart = 14 + i * 4;
          const cardFade = fade(cardStart, 12);
          const barGrow = interpolate(frame, [cardStart, cardStart + 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "14px 20px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderLeft: `4px solid ${color}`,
                ...cardFade,
              }}
            >
              {/* Category name */}
              <div style={{ flex: 1, fontSize: 24, fontWeight: 700, color: C.text2 }}>
                {name}
              </div>

              {/* Score bar + number */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                <div
                  style={{
                    width: 120,
                    height: 10,
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: 5,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${((score as number) / 10) * 100 * barGrow}%`,
                      height: "100%",
                      background: color,
                      borderRadius: 5,
                    }}
                  />
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color, minWidth: 40, textAlign: "right" }}>
                  {score as number}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA section */}
      <div
        style={{
          position: "absolute",
          bottom: 280,
          left: 40,
          right: 40,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          ...fade(48, 10),
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: C.amber,
          }}
        >
          In The Full Review
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
          {REVIEW_TAGS.map((tag, i) => {
            const tagStart = 50 + i * 2;
            const tagScale = interpolate(frame, [tagStart, tagStart + 8], [0.9, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const tagOpacity = interpolate(frame, [tagStart, tagStart + 8], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={tag}
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  padding: "10px 22px",
                  borderRadius: 50,
                  background: "rgba(71,131,255,0.06)",
                  border: "1px solid rgba(71,131,255,0.15)",
                  color: C.blue,
                  opacity: tagOpacity,
                  transform: `scale(${tagScale})`,
                }}
              >
                {tag}
              </div>
            );
          })}
        </div>
      </div>

      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
