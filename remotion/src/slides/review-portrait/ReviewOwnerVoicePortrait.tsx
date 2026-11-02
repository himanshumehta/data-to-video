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
import { useCountUp, useBarGrow } from "../../utils/animations";
import { SlideBackground } from "../../components/SlideBackground";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";
import { SafeZone } from "../../components/SafeZone";

const CLICK_FRAMES = [0, 8, 18, 28, 42, 56];

function starBarColor(stars: number): string {
  if (stars >= 4) return "#10b981";
  if (stars === 3) return "#f59e0b";
  return "#ef4444";
}

export const ReviewOwnerVoicePortrait: React.FC<PortraitSlideProps> = ({
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

  const ownerRating = vehicle.owner_rating ?? 0;
  const reviewCount = vehicle.owner_review_count ?? 0;
  const hasOwnerData = ownerRating > 0 && reviewCount > 0;
  const distribution = (vehicle.rating_distribution ?? []).sort(
    (a, b) => b.stars - a.stars
  );
  const praise = (vehicle.common_praise ?? []).slice(0, 2);
  const complaints = (vehicle.common_complaints ?? []).slice(0, 2);
  const countedRating = useCountUp(10, 30, Math.round(ownerRating * 10));

  // Divider grow
  const dividerWidth = interpolate(frame, [48, 56], [0, 860], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground edgeLightColor={C.amber} />
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
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.25)",
              fontSize: 16,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: C.amber,
            }}
          >
            Owner Voice
          </span>
        </div>

        {/* Vehicle name */}
        <div
          style={{
            ...fade(4),
            textAlign: "center",
            marginTop: 12,
            fontSize: 24,
            fontWeight: 900,
            color: C.text1,
          }}
        >
          {vehicle.brand_name} {vehicle.short_name}
        </div>

        {hasOwnerData ? (
          <>
            {/* Owner rating hero */}
            <div
              style={{
                ...fade(8, 10),
                display: "flex",
                alignItems: "baseline",
                justifyContent: "center",
                gap: 8,
                marginTop: 20,
              }}
            >
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 900,
                  color: C.amber,
                  lineHeight: 1,
                }}
              >
                {(countedRating / 10).toFixed(1)}
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: C.text4,
                }}
              >
                / 5
              </div>
              <span style={{ fontSize: 28, color: C.amber, marginLeft: 4 }}>
                {"\u2605"}
              </span>
            </div>

            {/* Review count */}
            <div
              style={{
                ...fade(14),
                textAlign: "center",
                marginTop: 4,
                fontSize: 16,
                fontWeight: 600,
                color: C.text3,
              }}
            >
              {reviewCount.toLocaleString()} ratings
            </div>

            {/* Would buy again + Recommend badges */}
            {((vehicle as any).owner_would_buy_again || (vehicle as any).owner_recommendation_rate) && (
              <div
                style={{
                  ...fade(16),
                  display: "flex",
                  gap: 10,
                  justifyContent: "center",
                  marginTop: 10,
                }}
              >
                {(vehicle as any).owner_would_buy_again && (
                  <span style={{
                    padding: "6px 14px",
                    borderRadius: 50,
                    background: "rgba(16,185,129,0.08)",
                    border: "1px solid rgba(16,185,129,0.18)",
                    fontSize: 14,
                    fontWeight: 800,
                    color: C.emerald,
                  }}>
                    {(vehicle as any).owner_would_buy_again}% would buy again
                  </span>
                )}
                {(vehicle as any).owner_recommendation_rate && (
                  <span style={{
                    padding: "6px 14px",
                    borderRadius: 50,
                    background: "rgba(59,130,246,0.08)",
                    border: "1px solid rgba(59,130,246,0.18)",
                    fontSize: 14,
                    fontWeight: 800,
                    color: C.blue,
                  }}>
                    {(vehicle as any).owner_recommendation_rate}% recommend
                  </span>
                )}
              </div>
            )}

            {/* Star distribution bars */}
            <div
              style={{
                marginTop: 24,
                width: "100%",
                paddingLeft: 60,
                paddingRight: 60,
              }}
            >
              {distribution.map((row, i) => {
                const barStart = 30 + i * 3;
                const barGrow = useBarGrow(barStart, 20);
                const rowFade = interpolate(
                  frame,
                  [barStart, barStart + 10],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );
                const barColor = starBarColor(row.stars);

                return (
                  <div
                    key={row.stars}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 10,
                      opacity: rowFade,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        fontSize: 16,
                        fontWeight: 800,
                        color: C.text3,
                        flexShrink: 0,
                      }}
                    >
                      {row.stars}{"\u2605"}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: 10,
                        borderRadius: 5,
                        background: "rgba(255,255,255,0.06)",
                        marginLeft: 10,
                        marginRight: 14,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${row.pct * barGrow}%`,
                          height: "100%",
                          borderRadius: 5,
                          background: barColor,
                          boxShadow: `0 0 6px ${barColor}44`,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        width: 44,
                        fontSize: 16,
                        fontWeight: 800,
                        color: C.text2,
                        textAlign: "right",
                        flexShrink: 0,
                      }}
                    >
                      {row.pct}%
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Divider */}
            <div
              style={{
                width: dividerWidth,
                maxWidth: 860,
                height: 1,
                background:
                  "linear-gradient(90deg, transparent, rgba(245,158,11,0.15), transparent)",
                marginTop: 20,
                opacity: interpolate(frame, [48, 52], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            />

            {/* Praise vs Complaints */}
            <div
              style={{
                display: "flex",
                gap: 20,
                marginTop: 20,
                width: "100%",
                paddingLeft: 40,
                paddingRight: 40,
              }}
            >
              {/* Praised */}
              <div style={{ ...fade(52), flex: 1 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: C.emerald,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    marginBottom: 12,
                  }}
                >
                  Praised
                </div>
                {praise.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: C.emerald,
                        marginTop: 7,
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: C.text2,
                        lineHeight: 1.4,
                      }}
                    >
                      {item}
                    </div>
                  </div>
                ))}
              </div>

              {/* Criticized */}
              <div style={{ ...fade(56), flex: 1 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: C.red,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    marginBottom: 12,
                  }}
                >
                  Criticized
                </div>
                {complaints.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: C.red,
                        marginTop: 7,
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: C.text2,
                        lineHeight: 1.4,
                      }}
                    >
                      {item}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* No owner data state */
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
                background: "rgba(245,158,11,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                color: C.amber,
              }}
            >
              {"\u2605"}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.text2 }}>
              No owner reviews yet
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, color: C.text4 }}>
              Owner sentiment data not available
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
