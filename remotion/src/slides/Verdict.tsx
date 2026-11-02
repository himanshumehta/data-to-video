import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Audio, Sequence, staticFile } from "remotion";
import { SlideProps } from "../types";
import { C } from "../utils/colors";
import { Logo } from "../components/Logo";
import { Watermark } from "../components/Watermark";
import { SlideBackground } from "../components/SlideBackground";
import { BikeImage } from "../components/BikeImage";
import { SPRING_CONFIG } from "../utils/animations";

const CLICK_FRAMES = [5, 15, 22, 40, 48, 60, 68, 76];

export const Verdict: React.FC<SlideProps> = ({ vehicle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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

  // Spring scale for hero cost
  const heroSpring = spring({
    frame: frame - 25,
    fps,
    config: SPRING_CONFIG,
  });
  const heroScale = 0.8 + heroSpring * 0.2;
  const heroOpacity = heroSpring;

  const statCards = [
    { label: "PER DAY", value: vehicle.cost_per_day_display, color: C.text1 },
    { label: "PER KM", value: `\u20B9 ${vehicle.cost_per_km.toFixed(2)}`, color: C.orange },
    { label: "PER MONTH", value: vehicle.monthly_cost_display, color: "#3b82f6" },
  ];

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground edgeLightColor={C.emerald} />

      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={i} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      <div style={{ position: "absolute", top: 70, right: 130, zIndex: 20 }}>
        <Logo size={80} startFrame={0} />
      </div>

      {/* Left panel 50% */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "90%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "100px 0 100px 150px",
        }}
      >
        {/* Badge */}
        <div
          style={{
            ...fade(5, 20),
            display: "inline-block",
            padding: "20px 40px",
            borderRadius: 100,
            background: "rgba(16,185,129,0.08)",
            border: `3px solid rgba(16,185,129,0.18)`,
            fontSize: 42,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.3em",
            color: C.emerald,
            width: "fit-content",
            marginBottom: 24,
            whiteSpace: "nowrap",
          }}
        >
          The Verdict
        </div>

        {/* Vehicle name */}
        <div
          style={{
            ...fade(15, 20),
            fontSize: 150,
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: -2,
            color: C.text1,
            marginBottom: 40,
            whiteSpace: "nowrap",
          }}
        >
          {vehicle.brand_name} {vehicle.short_name}
        </div>

        {/* Cost label */}
        <div
          style={{
            ...fade(22, 15),
            fontSize: 48,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: C.text4,
            whiteSpace: "nowrap",
          }}
        >
          5-Year Ownership Cost
        </div>

        {/* Hero amount */}
        <div
          style={{
            opacity: heroOpacity,
            transform: `scale(${heroScale})`,
            transformOrigin: "left center",
            fontSize: 270,
            fontWeight: 900,
            color: C.amber,
            letterSpacing: -4,
            lineHeight: 1,
            marginTop: 12,
            textShadow: "0 0 100px rgba(245,158,11,0.15), 0 4px 0 rgba(0,0,0,0.3)",
            whiteSpace: "nowrap",
          }}
        >
          {vehicle.net_5yr_display}
        </div>

        {/* Multiplier */}
        <div
          style={{
            ...fade(40, 20),
            fontSize: 72,
            fontWeight: 700,
            color: C.text3,
            marginTop: 20,
            whiteSpace: "nowrap",
          }}
        >
          <strong style={{ color: C.text1, fontWeight: 900 }}>{vehicle.multiplier}x</strong>{" "}
          the purchase price -- after you buy it
        </div>

        {/* Divider */}
        <div
          style={{
            ...fade(48, 12),
            margin: "40px 0",
            height: 2,
            width: "100%",
            background: "linear-gradient(90deg, rgba(16,185,129,0.2), transparent 80%)",
          }}
        />

        {/* Stat cards */}
        <div style={{ display: "flex", gap: 30 }}>
          {statCards.map((card, i) => {
            const cardStart = 55 + i * 10;
            return (
              <div
                key={card.label}
                style={{
                  ...fade(cardStart, 20),
                  flex: 1,
                  textAlign: "center",
                  padding: "30px 20px",
                  background: "rgba(255,255,255,0.04)",
                  border: "3px solid rgba(255,255,255,0.08)",
                  borderRadius: 21,
                }}
              >
                <div
                  style={{
                    fontSize: 90,
                    fontWeight: 900,
                    color: card.color,
                    marginBottom: 12,
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {card.value}
                </div>
                <div
                  style={{
                    fontSize: 39,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    color: C.text4,
                    whiteSpace: "nowrap",
                  }}
                >
                  {card.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right panel - bike */}
      <BikeImage
        src={vehicle.primary_nobg_url}
        width="50%"
        opacity={0.8}
        startFrame={10}
        glowColor="rgba(16,185,129,0.04)"
      />

      <Watermark />
    </AbsoluteFill>
  );
};
