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
import { SlideBackground } from "../../components/SlideBackground";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";
import { SafeZone } from "../../components/SafeZone";

const CLICK_FRAMES = [0, 3, 12, 20, 38, 42];

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

export const ReviewCtaPortrait: React.FC<PortraitSlideProps> = ({
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
    .sort(([, a], [, b]) => (b as number) - (a as number));

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground edgeLightColor={C.blue} />

      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      <SlideCounter current={slideNumber} total={totalSlides} fontSize={18} startFrame={0} />

      <SafeZone style={{ zIndex: 10, alignItems: "center", justifyContent: "space-between" }}>
        <Logo size={36} startFrame={0} />

        {/* Section Tag */}
        <div style={{ ...fade(0, 10), textAlign: "center", marginTop: 4 }}>
          <span
            style={{
              display: "inline-block",
              padding: "10px 28px",
              borderRadius: 50,
              background: "rgba(71,131,255,0.1)",
              border: "1px solid rgba(71,131,255,0.25)",
              fontSize: 18,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: C.blue,
            }}
          >
            Expert Ratings
          </span>
        </div>

        {/* Vehicle name */}
        <div style={{ ...fade(3, 10), textAlign: "center", marginTop: 4 }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.text1 }}>
            {vehicle.brand_name} {vehicle.short_name}
          </div>
        </div>

        {/* Category cards — sorted by score descending */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginTop: 8,
          }}
        >
          {breakdownEntries.map(([name, score], i) => {
            const color = scoreColor(score as number);
            const cardStart = 12 + i * 4;
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
                  padding: "10px 16px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderLeft: `3px solid ${color}`,
                  ...cardFade,
                }}
              >
                <div style={{ flex: 1, fontSize: 20, fontWeight: 700, color: C.text2 }}>
                  {name}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <div
                    style={{
                      width: 80,
                      height: 8,
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${((score as number) / 10) * 100 * barGrow}%`,
                        height: "100%",
                        background: color,
                        borderRadius: 4,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color, minWidth: 32, textAlign: "right" }}>
                    {score as number}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA section */}
        <div style={{ textAlign: "center", marginTop: 8, ...fade(42, 10) }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: C.amber,
              marginBottom: 10,
            }}
          >
            In The Full Review
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {REVIEW_TAGS.map((tag, i) => {
              const tagStart = 44 + i * 2;
              const tagOpacity = interpolate(frame, [tagStart, tagStart + 8], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <div
                  key={tag}
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    padding: "8px 18px",
                    borderRadius: 50,
                    background: "rgba(71,131,255,0.06)",
                    border: "1px solid rgba(71,131,255,0.15)",
                    color: C.blue,
                    opacity: tagOpacity,
                  }}
                >
                  {tag}
                </div>
              );
            })}
          </div>
        </div>
      </SafeZone>

      <ProgressDots current={slideNumber} total={totalSlides} activeColor={C.blue} startFrame={0} />
      <Watermark variant="portrait" />
    </AbsoluteFill>
  );
};
