import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Audio, Sequence, staticFile } from "remotion";
import { SlideProps } from "../types";
import { C } from "../utils/colors";
import { Logo } from "../components/Logo";
import { Watermark } from "../components/Watermark";
import { SlideBackground } from "../components/SlideBackground";
import { BikeImage } from "../components/BikeImage";

function ratingBarColor(score: number): string {
  if (score >= 7.5) return C.emerald;
  if (score >= 6.0) return "#3b82f6";
  if (score >= 4.0) return C.amber;
  return C.red;
}

const CLICK_FRAMES = [5, 12, 20, 28, 36, 44, 52, 60, 80, 90];

const reviewTags = [
  "Cost Breakdown",
  "Depreciation",
  "Insurance",
  "Fuel Deep Dive",
  "Service Costs",
  "Segment Comparison",
  "Resale Value",
  "and more...",
];

export const ReviewCta: React.FC<SlideProps> = ({ vehicle }) => {
  const frame = useCurrentFrame();

  const fade = (start: number, dur: number = 20) => ({
    opacity: interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    transform: `translateY(${interpolate(frame, [start, start + dur], [40, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })}px)`,
  });

  const breakdownEntries = Object.entries(vehicle.expert_breakdown || {});

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground edgeLightColor={C.blue} />

      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={i} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      <div style={{ position: "absolute", top: 70, right: 130, zIndex: 20 }}>
        <Logo size={80} startFrame={0} />
      </div>

      {/* Main layout */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          padding: "120px 150px 100px 150px",
        }}
      >
        {/* Accent strip */}
        <div
          style={{
            ...fade(5, 15),
            display: "inline-block",
            background: "rgba(71,131,255,0.10)",
            padding: "10px 28px 10px 0",
            borderLeft: `6px solid ${C.blue}`,
            paddingLeft: 24,
            width: "fit-content",
            marginBottom: 28,
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: C.blue,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              whiteSpace: "nowrap",
            }}
          >
            Category Ratings
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            ...fade(12, 20),
            fontSize: 144,
            fontWeight: 900,
            letterSpacing: -3,
            lineHeight: 0.95,
            color: C.text1,
            marginBottom: 60,
            whiteSpace: "nowrap",
          }}
        >
          {vehicle.brand_name} {vehicle.short_name}
        </div>

        {/* Ratings bars — 2-column grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "28px 80px",
            marginBottom: 60,
            flex: 1,
            alignContent: "start",
          }}
        >
          {breakdownEntries.map(([name, score], i) => {
            const pct = (score / 10) * 100;
            const barColor = ratingBarColor(score);
            const barStart = 20 + i * 6;
            const barGrow = interpolate(frame, [barStart, barStart + 30], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div key={name} style={{ ...fade(barStart, 18) }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: 72, fontWeight: 700, color: C.text2, whiteSpace: "nowrap" }}>
                    {name}
                  </span>
                  <span style={{ fontSize: 96, fontWeight: 900, color: barColor, whiteSpace: "nowrap" }}>
                    {score}
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 28,
                    background: C.surface1,
                    borderRadius: 14,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${pct * barGrow}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
                      borderRadius: 14,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* In The Full Review tags */}
        <div style={{ ...fade(60, 20), marginBottom: 50 }}>
          <div
            style={{
              fontSize: 60,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: C.amber,
              marginBottom: 20,
              whiteSpace: "nowrap",
            }}
          >
            In The Full Review
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
            {reviewTags.map((tag, i) => (
              <div
                key={tag}
                style={{
                  ...fade(62 + i * 4, 12),
                  fontSize: 60,
                  fontWeight: 700,
                  padding: "16px 36px",
                  borderRadius: 16,
                  background: "rgba(71,131,255,0.07)",
                  border: "2px solid rgba(71,131,255,0.18)",
                  color: C.blue,
                  whiteSpace: "nowrap",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>

        {/* CTA button */}
        <div style={{ ...fade(90, 20), display: "flex", justifyContent: "center" }}>
          <div
            style={{
              padding: "40px 120px",
              borderRadius: 24,
              background: `linear-gradient(135deg, ${C.blue} 0%, #2563eb 100%)`,
              textAlign: "center",
              boxShadow: `0 20px 80px rgba(71,131,255,0.35)`,
            }}
          >
            <div
              style={{
                fontSize: 108,
                fontWeight: 900,
                color: "#fff",
                marginBottom: 10,
                whiteSpace: "nowrap",
              }}
            >
              Read Full Review &#8594;
            </div>
            <div
              style={{
                fontSize: 66,
                fontWeight: 700,
                color: "rgba(255,255,255,0.75)",
                whiteSpace: "nowrap",
              }}
            >
              bikencars.com/reviews/{vehicle.slug}-review
            </div>
          </div>
        </div>
      </div>

      {/* Bike right */}
      <BikeImage
        src={vehicle.primary_nobg_url}
        width="38%"
        opacity={0.12}
        startFrame={5}
        glowColor="rgba(71,131,255,0.03)"
      />

      <Watermark />
    </AbsoluteFill>
  );
};
