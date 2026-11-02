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

const CLICK_FRAMES = [0, 6, 14, 24, 38, 52];

export const ReviewHeadToHeadPortrait: React.FC<PortraitSlideProps> = ({
  vehicle,
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

  const specs = (vehicle.comparison_specs ?? []).slice(0, 6);
  const rivalName = vehicle.top_rival_name ?? "Rival";
  const hasComparisonData = vehicle.top_rival_name != null && specs.length >= 3;

  // Tally wins/ties/losses
  let wins = 0;
  let ties = 0;
  let losses = 0;
  for (const s of specs) {
    if (s.winner === "self") wins++;
    else if (s.winner === "rival") losses++;
    else ties++;
  }

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground edgeLightColor={C.violet} />
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      <SlideCounter
        current={slideNumber}
        total={totalSlides}
        fontSize={18}
        startFrame={0}
      />

      <SafeZone style={{ zIndex: 10, alignItems: "center" }}>
        <Logo size={36} startFrame={0} />

        {/* Section pill */}
        <div style={{ ...fade(0, 10), textAlign: "center", marginTop: 16 }}>
          <span
            style={{
              display: "inline-block",
              padding: "10px 28px",
              borderRadius: 50,
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.25)",
              fontSize: 16,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: C.violet,
            }}
          >
            Head-to-Head
          </span>
        </div>

        {hasComparisonData ? (
          <>
            {/* Header */}
            <div
              style={{
                ...fade(4),
                textAlign: "center",
                marginTop: 16,
                fontSize: 28,
                fontWeight: 900,
                color: C.text1,
              }}
            >
              {vehicle.short_name}{" "}
              <span style={{ color: C.text4, fontWeight: 600 }}>vs</span>{" "}
              {rivalName}
            </div>

            {/* Vehicle image */}
            <div
              style={{
                ...fade(6, 12),
                display: "flex",
                justifyContent: "center",
                marginTop: 16,
                height: 120,
              }}
            >
              {vehicle.primary_nobg_url && (
                <Img
                  src={vehicle.primary_nobg_url}
                  style={{
                    height: "100%",
                    objectFit: "contain",
                    filter:
                      "drop-shadow(0 12px 35px rgba(0,0,0,0.5)) drop-shadow(0 0 20px rgba(139,92,246,0.1))",
                  }}
                />
              )}
            </div>

            {/* Column headers */}
            <div
              style={{
                ...fade(12),
                display: "flex",
                alignItems: "center",
                marginTop: 20,
                width: "100%",
                paddingLeft: 28,
                paddingRight: 28,
              }}
            >
              <div
                style={{
                  flex: 1,
                  fontSize: 14,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: C.violet,
                  textAlign: "left",
                }}
              >
                {vehicle.short_name}
              </div>
              <div
                style={{
                  width: 120,
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: C.text4,
                  textAlign: "center",
                }}
              >
                Spec
              </div>
              <div
                style={{
                  flex: 1,
                  fontSize: 14,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: C.text3,
                  textAlign: "right",
                }}
              >
                {rivalName}
              </div>
            </div>

            {/* Comparison rows */}
            <div
              style={{
                marginTop: 12,
                width: "100%",
                paddingLeft: 28,
                paddingRight: 28,
              }}
            >
              {specs.map((spec, i) => {
                const rowStart = 16 + i * 3;
                const rowFade = interpolate(
                  frame,
                  [rowStart, rowStart + 10],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );

                const selfColor =
                  spec.winner === "self"
                    ? C.emerald
                    : spec.winner === "tie"
                    ? C.text2
                    : C.text3;
                const rivalColor =
                  spec.winner === "rival"
                    ? C.emerald
                    : spec.winner === "tie"
                    ? C.text2
                    : C.text3;

                return (
                  <div
                    key={spec.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "16px 0",
                      borderBottom:
                        i < specs.length - 1
                          ? "1px solid rgba(255,255,255,0.04)"
                          : "none",
                      opacity: rowFade,
                    }}
                  >
                    {/* Self value */}
                    <div
                      style={{
                        flex: 1,
                        fontSize: 20,
                        fontWeight: spec.winner === "self" ? 900 : 700,
                        color: selfColor,
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {spec.self_value}
                      {spec.winner === "self" && (
                        <span
                          style={{
                            fontSize: 14,
                            color: C.emerald,
                            fontWeight: 900,
                          }}
                        >
                          {"\u2713"}
                        </span>
                      )}
                    </div>

                    {/* Label pill */}
                    <div
                      style={{
                        width: 120,
                        textAlign: "center",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          padding: "5px 14px",
                          borderRadius: 50,
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          fontSize: 13,
                          fontWeight: 700,
                          color: C.text3,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {spec.label}
                      </span>
                    </div>

                    {/* Rival value */}
                    <div
                      style={{
                        flex: 1,
                        fontSize: 20,
                        fontWeight: spec.winner === "rival" ? 900 : 700,
                        color: rivalColor,
                        textAlign: "right",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 6,
                      }}
                    >
                      {spec.winner === "rival" && (
                        <span
                          style={{
                            fontSize: 14,
                            color: C.emerald,
                            fontWeight: 900,
                          }}
                        >
                          {"\u2713"}
                        </span>
                      )}
                      {spec.rival_value}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Score summary */}
            <div
              style={{
                ...fade(42),
                display: "flex",
                justifyContent: "center",
                gap: 24,
                marginTop: 24,
              }}
            >
              <div
                style={{
                  padding: "10px 20px",
                  borderRadius: 50,
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.18)",
                  fontSize: 16,
                  fontWeight: 800,
                  color: C.emerald,
                }}
              >
                Wins: {wins}
              </div>
              <div
                style={{
                  padding: "10px 20px",
                  borderRadius: 50,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontSize: 16,
                  fontWeight: 800,
                  color: C.text3,
                }}
              >
                Ties: {ties}
              </div>
              <div
                style={{
                  padding: "10px 20px",
                  borderRadius: 50,
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.18)",
                  fontSize: 16,
                  fontWeight: 800,
                  color: C.red,
                }}
              >
                Losses: {losses}
              </div>
            </div>
          </>
        ) : (
          /* No comparison data state */
          <div
            style={{
              ...fade(4),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginTop: 60,
              padding: "40px 0",
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 900, color: C.text1 }}>
              {vehicle.short_name}
            </div>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                background: "rgba(139,92,246,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                color: C.violet,
              }}
            >
              {"\u2194"}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.text2 }}>
              No comparison data
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, color: C.text4 }}>
              Rival comparison not available
            </div>
          </div>
        )}
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
