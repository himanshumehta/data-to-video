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
import { useCountUp } from "../../utils/animations";
import { formatINR } from "../../utils/format";
import { SlideBackground } from "../../components/SlideBackground";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";
import { SafeZone } from "../../components/SafeZone";

const CLICK_FRAMES = [0, 6, 16, 28, 40, 54];

export const ReviewCostRealityPortrait: React.FC<PortraitSlideProps> = ({
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

  const competitors = vehicle.competitors_ownership ?? [];
  const cheapestRival = competitors.length > 0
    ? [...competitors].sort((a, b) => a.total_cost_5yr - b.total_cost_5yr)[0]
    : null;

  const selfCost5yr = vehicle.total_cost_5yr || vehicle.net_5yr;
  const diff = cheapestRival
    ? selfCost5yr - cheapestRival.total_cost_5yr
    : 0;
  const isMore = diff > 0;

  // Animated 5yr total
  const net5yr = vehicle.net_5yr ?? 0;
  const counted5yr = useCountUp(36, 52, net5yr);

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground />
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
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.25)",
              fontSize: 16,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: C.blue,
            }}
          >
            Cost Reality
          </span>
        </div>

        {/* Vehicle image + name */}
        <div
          style={{
            ...fade(4, 12),
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
                  "drop-shadow(0 12px 35px rgba(0,0,0,0.5))",
              }}
            />
          )}
        </div>
        <div
          style={{
            ...fade(8),
            textAlign: "center",
            marginTop: 6,
            fontSize: 24,
            fontWeight: 900,
            color: C.text1,
          }}
        >
          {vehicle.brand_name} {vehicle.short_name}
        </div>

        {/* 3 stat cards in row */}
        <div
          style={{
            display: "flex",
            gap: 14,
            marginTop: 24,
            width: "100%",
            paddingLeft: 20,
            paddingRight: 20,
          }}
        >
          {/* Per Day */}
          <div
            style={{
              ...fade(14),
              flex: 1,
              textAlign: "center",
              padding: "22px 10px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderTop: `3px solid ${C.amber}`,
              borderRadius: 16,
            }}
          >
            <div
              style={{
                fontSize: 30,
                fontWeight: 900,
                color: C.text1,
                marginBottom: 6,
              }}
            >
              {vehicle.cost_per_day_display}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: C.text4,
              }}
            >
              Per Day
            </div>
          </div>

          {/* Per Km */}
          <div
            style={{
              ...fade(18),
              flex: 1,
              textAlign: "center",
              padding: "22px 10px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderTop: `3px solid ${C.orange}`,
              borderRadius: 16,
            }}
          >
            <div
              style={{
                fontSize: 30,
                fontWeight: 900,
                color: C.text1,
                marginBottom: 6,
              }}
            >
              {"\u20B9"} {vehicle.cost_per_km.toFixed(2)}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: C.text4,
              }}
            >
              Per Km
            </div>
          </div>

          {/* Per Month */}
          <div
            style={{
              ...fade(22),
              flex: 1,
              textAlign: "center",
              padding: "22px 10px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderTop: `3px solid ${C.blue}`,
              borderRadius: 16,
            }}
          >
            <div
              style={{
                fontSize: 30,
                fontWeight: 900,
                color: C.text1,
                marginBottom: 6,
              }}
            >
              {vehicle.monthly_cost_display}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: C.text4,
              }}
            >
              Per Month
            </div>
          </div>
        </div>

        {/* Annual running cost */}
        <div
          style={{
            ...fade(28),
            textAlign: "center",
            marginTop: 24,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: C.text4,
              marginBottom: 6,
            }}
          >
            Annual Running Cost
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: C.text1,
            }}
          >
            {"\u20B9"} {formatINR(vehicle.annual_total)} / year
          </div>
        </div>

        {/* 5-Year Total */}
        <div
          style={{
            textAlign: "center",
            marginTop: 24,
          }}
        >
          <div
            style={{
              ...fade(32),
              fontSize: 14,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: C.text4,
              marginBottom: 6,
            }}
          >
            5-Year Total Ownership
          </div>
          <div
            style={{
              opacity: interpolate(frame, [36, 42], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              fontSize: 48,
              fontWeight: 900,
              color: C.blue,
              lineHeight: 1,
              textShadow: "0 0 30px rgba(71,131,255,0.3)",
            }}
          >
            {"\u20B9"} {formatINR(counted5yr)}
          </div>
        </div>

        {/* Vs Cheapest Rival */}
        {cheapestRival && (
          <div
            style={{
              ...fade(54),
              marginTop: 24,
              width: "100%",
              paddingLeft: 20,
              paddingRight: 20,
            }}
          >
            <div
              style={{
                padding: "20px 24px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderLeft: `3px solid ${C.rose}`,
                borderRadius: 16,
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.text3,
                  lineHeight: 1.5,
                }}
              >
                <span style={{ color: C.text1, fontWeight: 900 }}>
                  {vehicle.short_name}
                </span>
                {" costs "}
                <span
                  style={{
                    color: isMore ? C.rose : C.emerald,
                    fontWeight: 900,
                  }}
                >
                  {"\u20B9"} {formatINR(Math.abs(diff))} {isMore ? "more" : "less"}
                </span>
                {" than "}
                <span style={{ color: C.text1, fontWeight: 900 }}>
                  {cheapestRival.short_name}
                </span>
                {" over 5 years"}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 12,
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 900,
                      color: C.text1,
                    }}
                  >
                    {vehicle.net_5yr_display}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: C.text4,
                      textTransform: "uppercase",
                    }}
                  >
                    {vehicle.short_name}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: C.text4,
                    alignSelf: "center",
                  }}
                >
                  vs
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 900,
                      color: C.text1,
                    }}
                  >
                    {cheapestRival.cost_5yr_display}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: C.text4,
                      textTransform: "uppercase",
                    }}
                  >
                    {cheapestRival.short_name}
                  </div>
                </div>
              </div>
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
