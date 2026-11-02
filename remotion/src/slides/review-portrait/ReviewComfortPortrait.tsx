import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Audio,
  Sequence,
  staticFile,
} from "remotion";
import { PortraitSlideProps } from "../../types";
import { C } from "../../utils/colors";
import { useBarGrow } from "../../utils/animations";
import { SlideBackground } from "../../components/SlideBackground";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";
import { SafeZone } from "../../components/SafeZone";

interface ComfortScore {
  name: string;
  score: number;
  notes: string;
}

const CLICK_FRAMES = [0, 6, 14, 26, 40, 54];

function barColor(score: number): string {
  if (score >= 7) return C.emerald;
  if (score >= 5) return C.amber;
  return C.red;
}

export const ReviewComfortPortrait: React.FC<PortraitSlideProps> = ({
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
    [10, 30],
    [0, comfortOverall * 10],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

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
            Comfort & Ride
          </span>
        </div>

        {/* Vehicle name */}
        <div
          style={{
            ...fade(4),
            textAlign: "center",
            marginTop: 16,
            fontSize: 24,
            fontWeight: 900,
            color: C.text1,
          }}
        >
          {vehicle.brand_name} {vehicle.short_name}
        </div>

        {hasComfortData ? (
          <>
            {/* Overall score */}
            <div
              style={{
                ...fade(8, 10),
                display: "flex",
                alignItems: "baseline",
                justifyContent: "center",
                gap: 6,
                marginTop: 20,
              }}
            >
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 900,
                  color: C.violet,
                  lineHeight: 1,
                }}
              >
                {(Math.round(overallDisplay) / 10).toFixed(1)}
              </div>
              <div
                style={{
                  fontSize: 22,
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
                  ...fade(16),
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  alignItems: "center",
                  marginTop: 14,
                  width: "100%",
                  paddingLeft: 40,
                  paddingRight: 40,
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
                        fontSize: 13,
                        fontWeight: 900,
                        color: C.emerald,
                        flexShrink: 0,
                      }}
                    >
                      BEST
                    </span>
                    <span
                      style={{
                        fontSize: 13,
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
                        fontSize: 13,
                        fontWeight: 900,
                        color: C.red,
                        flexShrink: 0,
                      }}
                    >
                      WORST
                    </span>
                    <span
                      style={{
                        fontSize: 13,
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
                marginTop: 22,
                width: "100%",
                paddingLeft: 48,
                paddingRight: 48,
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
                      marginBottom: 12,
                      opacity: rowFade,
                    }}
                  >
                    <div
                      style={{
                        width: 140,
                        fontSize: 14,
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
                        marginLeft: 10,
                        marginRight: 12,
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
                        width: 36,
                        fontSize: 16,
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
            <div style={{ fontSize: 22, fontWeight: 700, color: C.text2 }}>
              Comfort data not available
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, color: C.text4 }}>
              No comfort scores on record
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
