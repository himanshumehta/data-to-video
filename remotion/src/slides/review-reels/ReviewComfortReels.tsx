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
import { useBarGrow } from "../../utils/animations";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";

interface ComfortScore {
  name: string;
  score: number;
  notes: string;
}

const CLICK_FRAMES = [0, 8, 18, 30, 44, 58];

function barColor(score: number): string {
  if (score >= 7) return C.emerald;
  if (score >= 5) return C.amber;
  return C.red;
}

export const ReviewComfortReels: React.FC<PortraitSlideProps> = ({
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

  const comfortScores: ComfortScore[] =
    ((vehicle as any).comfort_scores as ComfortScore[] | undefined) ?? [];
  const comfortOverall: number =
    ((vehicle as any).comfort_overall as number | undefined) ?? 0;
  const comfortBest: string =
    ((vehicle as any).comfort_best as string | undefined) ?? "";
  const comfortWorst: string =
    ((vehicle as any).comfort_worst as string | undefined) ?? "";

  const hasComfortData = comfortScores.length > 0 && comfortOverall > 0;

  // Animated overall score
  const overallDisplay = interpolate(
    frame,
    [14, 34],
    [0, comfortOverall * 10],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Suppress unused fps lint (available for future spring animations)
  void fps;

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: C.bg }}>
      {/* Click sounds */}
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Violet glow at top */}
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
          gap: 20,
          zIndex: 10,
        }}
      >
        {/* Section pill */}
        <div style={fade(0, 10)}>
          <span
            style={{
              display: "inline-block",
              padding: "10px 32px",
              borderRadius: 50,
              background: "rgba(139,92,246,0.10)",
              border: "1px solid rgba(139,92,246,0.25)",
              fontSize: 18,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: C.violet,
            }}
          >
            Comfort & Ride
          </span>
        </div>

        {/* Vehicle name */}
        <div
          style={{
            ...fade(6),
            fontSize: 46,
            fontWeight: 900,
            color: C.text1,
            textAlign: "center",
          }}
        >
          {vehicle.brand_name} {vehicle.short_name}
        </div>

        {hasComfortData ? (
          <>
            {/* Overall score */}
            <div
              style={{
                ...fade(10, 8),
                display: "flex",
                alignItems: "baseline",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 900,
                  color: C.violet,
                  lineHeight: 1,
                }}
              >
                {(Math.round(overallDisplay) / 10).toFixed(1)}
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: C.text4,
                }}
              >
                / 10
              </div>
            </div>

            {/* Best / Worst scenario pills */}
            {(comfortBest || comfortWorst) && (
              <div
                style={{
                  ...fade(18),
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  alignItems: "center",
                  width: "100%",
                }}
              >
                {comfortBest && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 16px",
                      borderRadius: 50,
                      background: "rgba(16,185,129,0.08)",
                      border: "1px solid rgba(16,185,129,0.18)",
                      maxWidth: "100%",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 900,
                        color: C.emerald,
                        flexShrink: 0,
                      }}
                    >
                      BEST
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.text2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {comfortBest}
                    </span>
                  </div>
                )}
                {comfortWorst && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 16px",
                      borderRadius: 50,
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.18)",
                      maxWidth: "100%",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 900,
                        color: C.red,
                        flexShrink: 0,
                      }}
                    >
                      WORST
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.text2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {comfortWorst}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Horizontal bar chart */}
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {comfortScores.map((item, i) => {
                const barStart = 20 + i * 3;
                const barGrow = useBarGrow(barStart, 20);
                const rowFade = interpolate(
                  frame,
                  [barStart, barStart + 10],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );
                const color = barColor(item.score);

                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      opacity: rowFade,
                    }}
                  >
                    <div
                      style={{
                        width: 138,
                        fontSize: 12,
                        fontWeight: 700,
                        color: C.text2,
                        flexShrink: 0,
                      }}
                    >
                      {item.name}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        background: "rgba(255,255,255,0.06)",
                        marginLeft: 8,
                        marginRight: 10,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${(item.score / 10) * 100 * barGrow}%`,
                          height: "100%",
                          borderRadius: 4,
                          background: color,
                          boxShadow: `0 0 6px ${color}44`,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        width: 34,
                        fontSize: 14,
                        fontWeight: 900,
                        color: C.text2,
                        textAlign: "right" as const,
                        flexShrink: 0,
                      }}
                    >
                      {item.score}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* No comfort data state */
          <div
            style={{
              ...fade(8),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginTop: 60,
              padding: "40px 0",
            }}
          >
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
              {"\u2728"}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.text2 }}>
              Comfort data not available
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: C.text4 }}>
              No comfort scores on record
            </div>
          </div>
        )}
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
