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
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";

const CLICK_FRAMES = [0, 8, 18, 30, 44, 58];
const BIKE_HEIGHT = 780;

export const ReviewProsConsReels: React.FC<PortraitSlideProps> = ({
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

  const pros = (vehicle.pros ?? []).slice(0, 3);
  const cons = (vehicle.cons ?? []).slice(0, 3);

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: C.bg }}>
      {/* Click sounds */}
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Blue glow behind bike */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 600,
          background:
            "radial-gradient(ellipse, rgba(71,131,255,0.10) 0%, rgba(71,131,255,0.04) 40%, transparent 70%)",
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
              "drop-shadow(0 30px 80px rgba(0,0,0,0.8)) drop-shadow(0 0 60px rgba(71,131,255,0.12))",
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
            color: C.blue,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            marginTop: 6,
          }}
        >
          Honest Take
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
          padding: "0 44px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          zIndex: 10,
        }}
      >
        {/* Strengths section */}
        <div
          style={{
            borderLeft: `3px solid ${C.emerald}`,
            paddingLeft: 20,
          }}
        >
          <div
            style={{
              ...fade(20),
              fontSize: 28,
              fontWeight: 900,
              color: C.emerald,
              marginBottom: 14,
            }}
          >
            Strengths
          </div>
          {pros.map((pro, i) => (
            <div
              key={i}
              style={{
                ...fade(25 + i * 4),
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  background: "rgba(16,185,129,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 900,
                  color: C.emerald,
                  flexShrink: 0,
                }}
              >
                +
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 600,
                  color: C.text2,
                  lineHeight: 1.3,
                }}
              >
                {pro}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            width: "100%",
            height: 1,
            background: "rgba(255,255,255,0.06)",
          }}
        />

        {/* Watch Out section */}
        <div
          style={{
            borderLeft: `3px solid ${C.red}`,
            paddingLeft: 20,
          }}
        >
          <div
            style={{
              ...fade(38),
              fontSize: 28,
              fontWeight: 900,
              color: C.red,
              marginBottom: 14,
            }}
          >
            Watch Out
          </div>
          {cons.map((con, i) => (
            <div
              key={i}
              style={{
                ...fade(40 + i * 4),
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  background: "rgba(239,68,68,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 900,
                  color: C.red,
                  flexShrink: 0,
                }}
              >
                {"\u2212"}
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 600,
                  color: C.text2,
                  lineHeight: 1.3,
                }}
              >
                {con}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ProgressDots
        current={slideNumber}
        total={totalSlides}
        activeColor={C.blue}
        startFrame={0}
        variant="reels"
      />
      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
