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
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";

const CLICK_FRAMES = [0, 6, 14, 26, 38, 50];

const BULLETS: {
  text: string;
  dim: string | null;
  color: string;
  glow: string;
  link?: string;
  linkSuffix?: string;
}[] = [
  {
    text: "Total cost over 5 & 10 years",
    dim: "down to every rupee",
    color: "#4783ff",
    glow: "rgba(71,131,255,0.7)",
  },
  {
    text: "Every cost broken down",
    dim: "fuel, service, insurance, tyres",
    color: "#10b981",
    glow: "rgba(16,185,129,0.7)",
  },
  {
    text: "When costs spike",
    dim: "years 3-5 hit hardest",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.7)",
  },
  {
    text: "How fast it loses value",
    dim: "and exactly when to sell",
    color: "#ef4444",
    glow: "rgba(239,68,68,0.7)",
  },
  {
    text: "Segment ranking",
    dim: "vs every rival on 5-year cost",
    color: "#4783ff",
    glow: "rgba(71,131,255,0.7)",
  },
  {
    text: "Your exact cost",
    dim: null,
    color: "#f43f5e",
    glow: "rgba(244,63,94,0.7)",
    link: "bikencars.com",
    linkSuffix: "calculator",
  },
];

export const WhatYouWillLearnReels: React.FC<PortraitSlideProps> = ({
  vehicle,
  contentMonthYear,
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

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: "#09090b" }}>
      {/* Click sounds */}
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Bike hero image -- large, clear, below IG safe zone */}
      {vehicle.primary_nobg_url && (
        <Img
          src={resolveImage(vehicle.primary_nobg_url)}
          style={{
            position: "absolute",
            top: 200,
            left: "5%",
            width: "90%",
            height: 440,
            objectFit: "contain",
            objectPosition: "center center",
            filter:
              "drop-shadow(0 20px 60px rgba(0,0,0,0.7)) drop-shadow(0 0 40px rgba(245,158,11,0.15))",
            zIndex: 2,
            ...fade(0, 15),
          }}
        />
      )}

      {/* Amber glow behind bike */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 500,
          background:
            "radial-gradient(ellipse, rgba(245,158,11,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Gradient overlay -- gentle fade, keeps bike visible */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 750,
          background:
            "linear-gradient(to bottom, transparent 50%, rgba(9,9,11,0.3) 62%, rgba(9,9,11,0.75) 76%, #09090b 92%)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />

      {/* Logo -- centered, 2x size, above bike (in safe zone, OK) */}
      <div style={{ position: "absolute", top: 72, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 20, pointerEvents: "none" }}>
        <Logo size={72} startFrame={0} />
      </div>

      {/* Slide counter */}
      <SlideCounter current={slideNumber} total={totalSlides} variant="reels" />

      {/* Brand + Model name -- positioned over gradient */}
      <div
        style={{
          position: "absolute",
          top: 500,
          left: 0,
          right: 0,
          padding: "0 108px",
          zIndex: 10,
        }}
      >
        {/* Brand name -- 56px amber */}
        <div
          style={{
            ...fade(5),
            fontSize: 56,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: C.amber,
            lineHeight: 1.0,
            textShadow: "0 0 40px rgba(245,158,11,0.35), 0 2px 10px rgba(0,0,0,0.8)",
          }}
        >
          {vehicle.brand_name}
        </div>

        {/* Model name -- 100px amber */}
        <div
          style={{
            ...fade(8),
            fontSize: 100,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "-0.03em",
            color: C.amber,
            lineHeight: 0.88,
            marginTop: 8,
            textShadow:
              "0 0 70px rgba(245,158,11,0.3), 0 4px 0 rgba(0,0,0,0.6)",
          }}
        >
          {vehicle.short_name}
        </div>

        {/* Meta badges row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 24,
            flexWrap: "wrap",
          }}
        >
          {/* Date badge */}
          <div
            style={{
              ...fade(12),
              padding: "10px 24px",
              borderRadius: 100,
              fontSize: 24,
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
              padding: "10px 24px",
              borderRadius: 100,
              fontSize: 20,
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
                padding: "10px 24px",
                borderRadius: 100,
                fontSize: 24,
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
      </div>

      {/* Content area below gradient -- uses full safe area */}
      <div
        style={{
          position: "absolute",
          top: 760,
          left: 0,
          right: 0,
          bottom: 300,
          padding: "0 15%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        {/* Section label */}
        <div
          style={{
            ...fade(20),
            fontSize: 26,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: C.text3,
            marginBottom: 28,
            textAlign: "center",
          }}
        >
          What You'll Know
        </div>

        {/* 6 bullet rows -- narrower (80% of parent), centered, fills height */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            flex: 1,
            width: "100%",
          }}
        >
          {BULLETS.map((bullet, i) => {
            const bulletStart = 24 + i * 5;

            return (
              <div
                key={i}
                style={{
                  ...fade(bulletStart),
                  borderLeft: `5px solid ${bullet.color}`,
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "0 8px 8px 0",
                  padding: "16px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                  flex: 1,
                  justifyContent: "center",
                }}
              >
                {/* Bullet main text -- 26px bold */}
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: "rgba(255,255,255,0.94)",
                    lineHeight: 1.25,
                  }}
                >
                  {bullet.text}
                  {bullet.link && (
                    <>
                      {" "}
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
                          color: "rgba(255,255,255,0.50)",
                          fontWeight: 600,
                          fontSize: 20,
                        }}
                      >
                        {" "}
                        {bullet.linkSuffix}
                      </span>
                    </>
                  )}
                </div>

                {/* Sub text -- 20px dim */}
                {bullet.dim && (
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.45)",
                      lineHeight: 1.3,
                    }}
                  >
                    {bullet.dim}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
