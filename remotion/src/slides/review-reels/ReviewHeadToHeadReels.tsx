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

export const ReviewHeadToHeadReels: React.FC<PortraitSlideProps> = ({
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

  const specs = (vehicle.comparison_specs ?? []).slice(0, 6);
  const rivalName = vehicle.top_rival_name ?? "Rival";

  // Tally
  const wins = specs.filter((s) => s.winner === "self").length;
  const ties = specs.filter((s) => s.winner === "tie").length;
  const losses = specs.filter((s) => s.winner === "rival").length;

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: C.bg }}>
      {/* Click sounds */}
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Violet glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 500,
          background:
            "radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)",
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
        {/* Head-to-Head pill */}
        <div style={fade(0, 10)}>
          <span
            style={{
              display: "inline-block",
              padding: "10px 32px",
              borderRadius: 50,
              background: "rgba(139,92,246,0.10)",
              border: "1px solid rgba(139,92,246,0.25)",
              fontSize: 20,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: C.violet,
            }}
          >
            Head-to-Head
          </span>
        </div>

        {/* Header */}
        <div
          style={{
            ...fade(6),
            fontSize: 40,
            fontWeight: 900,
            color: C.text1,
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          {vehicle.short_name} vs {rivalName}
        </div>

        {/* Vehicle image */}
        {vehicle.primary_nobg_url && (
          <div
            style={{
              ...fade(8, 12),
              display: "flex",
              justifyContent: "center",
              height: 200,
            }}
          >
            <Img
              src={vehicle.primary_nobg_url}
              style={{
                height: "100%",
                objectFit: "contain",
                filter:
                  "drop-shadow(0 20px 50px rgba(0,0,0,0.6)) drop-shadow(0 0 30px rgba(139,92,246,0.12))",
              }}
            />
          </div>
        )}

        {/* Comparison rows */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {specs.map((spec, i) => {
            const rowStart = 18 + i * 3;
            const selfWins = spec.winner === "self";
            const rivalWins = spec.winner === "rival";

            return (
              <div
                key={spec.label}
                style={{
                  ...fade(rowStart, 10),
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10,
                }}
              >
                {/* Self value */}
                <div
                  style={{
                    flex: 1,
                    textAlign: "left",
                    fontSize: 28,
                    fontWeight: 800,
                    color: selfWins ? C.emerald : C.text3,
                    textShadow: selfWins
                      ? "0 0 12px rgba(16,185,129,0.3)"
                      : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {selfWins && (
                    <span style={{ fontSize: 18, color: C.emerald }}>
                      {"\u2713"}
                    </span>
                  )}
                  {spec.self_value}
                </div>

                {/* Label pill */}
                <div
                  style={{
                    padding: "6px 14px",
                    borderRadius: 50,
                    background: "rgba(139,92,246,0.10)",
                    border: "1px solid rgba(139,92,246,0.15)",
                    fontSize: 20,
                    fontWeight: 700,
                    color: C.violet,
                    flexShrink: 0,
                    textAlign: "center",
                    minWidth: 100,
                  }}
                >
                  {spec.label}
                </div>

                {/* Rival value */}
                <div
                  style={{
                    flex: 1,
                    textAlign: "right",
                    fontSize: 28,
                    fontWeight: 800,
                    color: rivalWins ? C.emerald : C.text3,
                    textShadow: rivalWins
                      ? "0 0 12px rgba(16,185,129,0.3)"
                      : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 6,
                  }}
                >
                  {spec.rival_value}
                  {rivalWins && (
                    <span style={{ fontSize: 18, color: C.emerald }}>
                      {"\u2713"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Score tally */}
        <div
          style={{
            ...fade(42),
            fontSize: 24,
            fontWeight: 700,
            color: C.text3,
            textAlign: "center",
            letterSpacing: "0.02em",
          }}
        >
          Wins: <span style={{ color: C.emerald, fontWeight: 900 }}>{wins}</span>
          {" \u00B7 "}
          Ties: <span style={{ color: C.text2, fontWeight: 900 }}>{ties}</span>
          {" \u00B7 "}
          Losses: <span style={{ color: C.red, fontWeight: 900 }}>{losses}</span>
        </div>
      </div>

      <ProgressDots
        current={slideNumber}
        total={totalSlides}
        activeColor={C.violet}
        startFrame={0}
        variant="reels"
      />
      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
