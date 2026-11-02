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
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";
import { SlideCounter } from "../../components/SlideCounter";
import { SafeZone } from "../../components/SafeZone";

const CLICK_FRAMES = [0, 5, 8, 20, 28, 40];

const BULLETS = [
  {
    color: "blue" as const,
    text: "Total cost over 5 & 10 years",
    dim: "down to every rupee",
  },
  {
    color: "green" as const,
    text: "Every cost broken down",
    dim: "fuel, service, insurance, tyres",
  },
  {
    color: "amber" as const,
    text: "When costs spike",
    dim: "years 3\u20135 hit hardest. How to plan ahead",
  },
  {
    color: "red" as const,
    text: "How fast it loses value",
    dim: "and exactly when to sell",
  },
  {
    color: "blue" as const,
    text: "Segment ranking",
    dim: "vs every rival on 5-year cost",
  },
  {
    color: "rose" as const,
    text: "Your exact cost",
    dim: null,
    link: "bikencars.com",
    linkSuffix: "calculator",
  },
];

const DOT_COLORS: Record<string, { bg: string; shadow: string }> = {
  blue: { bg: "#4783ff", shadow: "0 0 12px rgba(71,131,255,0.7)" },
  green: { bg: "#10b981", shadow: "0 0 12px rgba(16,185,129,0.7)" },
  amber: { bg: "#f59e0b", shadow: "0 0 12px rgba(245,158,11,0.7)" },
  red: { bg: "#ef4444", shadow: "0 0 12px rgba(239,68,68,0.7)" },
  rose: { bg: "#f43f5e", shadow: "0 0 12px rgba(244,63,94,0.7)" },
};

export const WhatYouWillLearnPortrait: React.FC<PortraitSlideProps> = ({
  vehicle,
  contentMonthYear,
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

  // Rule grow animation starting at frame 20
  const ruleWidth = interpolate(frame, [20, 20 + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}
      {/* Base background */}
      <AbsoluteFill style={{ background: "#060608" }} />

      {/* Edge light */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background:
            "linear-gradient(90deg, rgba(71,131,255,0.5) 0%, rgba(71,131,255,0.8) 30%, rgba(71,131,255,1) 50%, rgba(71,131,255,0.8) 70%, rgba(71,131,255,0.5) 100%)",
          zIndex: 30,
          ...fade(0, 10),
        }}
      />

      {/* Edge vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(6,6,8,0.6) 0%, transparent 10%, transparent 90%, rgba(6,6,8,0.6) 100%)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Bike image — right side, 65% width */}
      {vehicle.primary_nobg_url && (
        <Img
          src={vehicle.primary_nobg_url}
          style={{
            position: "absolute",
            top: "50%",
            right: "-4%",
            transform: "translateY(-50%)",
            width: "65%",
            objectFit: "contain",
            opacity: 1.0,
            filter: "grayscale(20%)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Gradient fade over bike — left side stays clean for text */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, #060608 0%, #060608 40%, rgba(6,6,8,0.88) 54%, rgba(6,6,8,0.45) 72%, rgba(6,6,8,0.18) 100%)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      <SlideCounter current={slideNumber} total={totalSlides} />

      {/* Safe zone content */}
      <SafeZone style={{ zIndex: 10, alignItems: "center" }}>
        <Logo size={36} startFrame={0} />

        {/* Main content — left-aligned */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            flex: 1,
            width: "100%",
          }}
        >
        {/* Brand name — 42px amber */}
        <div
          style={{
            ...fade(5),
            fontSize: 42,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: C.amber,
            lineHeight: 1.0,
            marginBottom: 12,
            textShadow: "0 0 30px rgba(245,158,11,0.35)",
          }}
        >
          {vehicle.brand_name}
        </div>

        {/* Model name — 96px amber */}
        <div
          style={{
            ...fade(8),
            fontSize: 96,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: -1,
            color: C.amber,
            lineHeight: 0.88,
            marginBottom: 44,
            textShadow:
              "0 0 60px rgba(245,158,11,0.3), 0 2px 0 rgba(0,0,0,0.5)",
          }}
        >
          {vehicle.short_name}
        </div>

        {/* Meta badges row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 40,
          }}
        >
          {/* Date badge */}
          <div
            style={{
              ...fade(12),
              padding: "8px 20px",
              borderRadius: 100,
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
              background: "rgba(71,131,255,0.12)",
              border: "1px solid rgba(71,131,255,0.35)",
              color: "#fff",
              textShadow: "0 0 14px rgba(71,131,255,0.6)",
            }}
          >
            {contentMonthYear}
          </div>

          {/* Type badge */}
          <div
            style={{
              ...fade(15),
              padding: "8px 20px",
              borderRadius: 100,
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: "0.2em",
              whiteSpace: "nowrap",
              textTransform: "uppercase",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.90)",
            }}
          >
            Ownership Cost
          </div>

          {/* Generation badge */}
          {vehicle.generation_number && (
            <div
              style={{
                ...fade(18),
                padding: "8px 20px",
                borderRadius: 100,
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
                background: "rgba(245,158,11,0.10)",
                border: "1px solid rgba(245,158,11,0.30)",
                color: "#fff",
                textShadow: "0 0 14px rgba(245,158,11,0.5)",
              }}
            >
              Gen {vehicle.generation_number}
            </div>
          )}
        </div>

        {/* Blue rule divider */}
        <div
          style={{
            width: `${ruleWidth * 65}%`,
            maxWidth: 540,
            height: 2,
            background:
              "linear-gradient(90deg, rgba(71,131,255,0.6), rgba(71,131,255,0.15) 60%, transparent)",
            marginBottom: 36,
            opacity: interpolate(frame, [20, 25], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />

        {/* Section label */}
        <div
          style={{
            ...fade(24),
            fontSize: 24,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            color: "rgba(255,255,255,0.55)",
            marginBottom: 28,
            textShadow: "0 0 14px rgba(255,255,255,0.08)",
          }}
        >
          {"What You'll Know After This Video "}
          <span style={{ color: C.blue }}>{"\u2193"}</span>
        </div>

        {/* Bullet list */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {BULLETS.map((bullet, i) => {
            const bulletStart = 28 + i * 4;
            const dotStyle = DOT_COLORS[bullet.color];

            return (
              <div
                key={i}
                style={{
                  ...fade(bulletStart),
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                {/* Colored dot */}
                <div
                  style={{
                    width: 8,
                    height: 8,
                    flexShrink: 0,
                    borderRadius: 2,
                    background: dotStyle.bg,
                    boxShadow: dotStyle.shadow,
                  }}
                />
                {/* Bullet text */}
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: "rgba(255,255,255,0.92)",
                    lineHeight: 1.3,
                    textShadow: "0 0 14px rgba(255,255,255,0.06)",
                  }}
                >
                  {bullet.text}
                  {bullet.dim && (
                    <span
                      style={{
                        color: "rgba(255,255,255,0.52)",
                        fontWeight: 600,
                        fontSize: 26,
                      }}
                    >
                      {" \u2014 "}
                      {bullet.dim}
                    </span>
                  )}
                  {bullet.link && (
                    <>
                      <span
                        style={{
                          color: "rgba(255,255,255,0.52)",
                          fontWeight: 600,
                          fontSize: 26,
                        }}
                      >
                        {" \u2014 "}
                      </span>
                      <span
                        style={{
                          color: C.blue,
                          fontWeight: 900,
                          textShadow: "0 0 12px rgba(71,131,255,0.5)",
                        }}
                      >
                        {bullet.link}
                      </span>
                      <span
                        style={{
                          color: "rgba(255,255,255,0.52)",
                          fontWeight: 600,
                          fontSize: 26,
                        }}
                      >
                        {" "}
                        {bullet.linkSuffix}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
