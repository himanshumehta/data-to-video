import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
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

const CLICK_FRAMES = [0, 8, 20, 34, 48, 62];

function starBarColor(stars: number): string {
  if (stars >= 4) return C.emerald;
  if (stars === 3) return C.amber;
  return C.red;
}

export const ReviewOwnerVoiceReels: React.FC<PortraitSlideProps> = ({
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

  const ownerRating = vehicle.owner_rating ?? 0;
  const reviewCount = vehicle.owner_review_count ?? 0;
  const countedRating = useCountUp(14, 38, Math.round(ownerRating * 10));
  const distribution = (vehicle.rating_distribution ?? [])
    .slice()
    .sort((a, b) => b.stars - a.stars);
  const praise = (vehicle.common_praise ?? []).slice(0, 2);
  const complaints = (vehicle.common_complaints ?? []).slice(0, 2);

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: C.bg }}>
      {/* Click sounds */}
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Amber glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 500,
          background:
            "radial-gradient(ellipse, rgba(245,158,11,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Logo */}
      <div style={{ position: "absolute", top: 154, left: 44, zIndex: 20 }}>
        <Logo size={36} startFrame={0} />
      </div>

      {/* Slide counter */}
      <SlideCounter current={slideNumber} total={totalSlides} variant="reels" />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          top: 240,
          left: 0,
          right: 0,
          bottom: "17%",
          padding: "0 44px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 22,
          zIndex: 10,
        }}
      >
        {/* Owner Voice pill */}
        <div style={fade(0, 10)}>
          <span
            style={{
              display: "inline-block",
              padding: "10px 32px",
              borderRadius: 50,
              background: "rgba(245,158,11,0.10)",
              border: "1px solid rgba(245,158,11,0.25)",
              fontSize: 20,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: C.amber,
            }}
          >
            Owner Voice
          </span>
        </div>

        {/* Vehicle name */}
        <div
          style={{
            ...fade(6),
            fontSize: 48,
            fontWeight: 900,
            color: C.text1,
            textAlign: "center",
          }}
        >
          {vehicle.brand_name} {vehicle.short_name}
        </div>

        {/* Owner rating hero */}
        <div
          style={{
            ...fade(12, 10),
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: C.amber,
              lineHeight: 1,
              textShadow: "0 0 40px rgba(245,158,11,0.3)",
            }}
          >
            {(countedRating / 10).toFixed(1)}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: C.text4,
            }}
          >
            / 5
          </div>
          <span style={{ fontSize: 32, color: C.amber, marginLeft: 4 }}>
            {"\u2605"}
          </span>
        </div>

        {/* Review count */}
        <div
          style={{
            ...fade(18),
            fontSize: 22,
            fontWeight: 600,
            color: C.text3,
          }}
        >
          {reviewCount} reviews
        </div>

        {/* 5 star distribution bars */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
          {distribution.map((item, i) => {
            const barStart = 24 + i * 4;
            const barProgress = interpolate(
              frame,
              [barStart, barStart + 20],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const rowFade = interpolate(
              frame,
              [barStart, barStart + 10],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const color = starBarColor(item.stars);

            return (
              <div
                key={item.stars}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  opacity: rowFade,
                }}
              >
                <div
                  style={{
                    width: 44,
                    fontSize: 22,
                    fontWeight: 800,
                    color: C.text2,
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  {item.stars}{"\u2605"}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 14,
                    borderRadius: 7,
                    background: "rgba(255,255,255,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${item.pct * barProgress}%`,
                      height: "100%",
                      borderRadius: 7,
                      background: color,
                      boxShadow: `0 0 8px ${color}44`,
                    }}
                  />
                </div>
                <div
                  style={{
                    width: 50,
                    fontSize: 22,
                    fontWeight: 700,
                    color: C.text3,
                    flexShrink: 0,
                  }}
                >
                  {Math.round(item.pct)}%
                </div>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div
          style={{
            width: "100%",
            height: 1,
            background: "rgba(255,255,255,0.06)",
          }}
        />

        {/* 2-column: Praised vs Criticized */}
        <div style={{ width: "100%", display: "flex", gap: 20 }}>
          {/* Praised */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                ...fade(48),
                fontSize: 22,
                fontWeight: 900,
                color: C.emerald,
                marginBottom: 12,
              }}
            >
              Praised
            </div>
            {praise.map((item, i) => (
              <div
                key={i}
                style={{
                  ...fade(50 + i * 4),
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: C.emerald,
                    marginTop: 8,
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: C.text2,
                    lineHeight: 1.3,
                  }}
                >
                  {item}
                </div>
              </div>
            ))}
          </div>

          {/* Criticized */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                ...fade(52),
                fontSize: 22,
                fontWeight: 900,
                color: C.red,
                marginBottom: 12,
              }}
            >
              Criticized
            </div>
            {complaints.map((item, i) => (
              <div
                key={i}
                style={{
                  ...fade(54 + i * 4),
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: C.red,
                    marginTop: 8,
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: C.text2,
                    lineHeight: 1.3,
                  }}
                >
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProgressDots
        current={slideNumber}
        total={totalSlides}
        activeColor={C.amber}
        startFrame={0}
        variant="reels"
      />
      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
