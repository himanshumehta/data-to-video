import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Img,
  spring,
  useVideoConfig,
  Audio,
  Sequence,
  staticFile,
} from "remotion";
import { PortraitSlideProps } from "../../types";
import { C } from "../../utils/colors";
import { formatINR } from "../../utils/format";
import { SlideBackground } from "../../components/SlideBackground";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";
import { SafeZone } from "../../components/SafeZone";

const CLICK_FRAMES = [0, 4, 14, 18, 28, 55];

export const YearByYearPortrait: React.FC<PortraitSlideProps> = ({
  vehicle,
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const years = (vehicle.first_5_years || []).slice(0, 5);

  // Find max total for bar scaling
  const maxTotal = Math.max(...years.map((yr) => yr.total), 1);

  // Compute inflation rate from year 1 to year 5
  const yr1 = years.length > 0 ? years[0] : null;
  const yr5 = years.length >= 5 ? years[4] : null;
  const inflationRate =
    yr1 && yr5 && yr1.total > 0
      ? Math.round(
          (Math.pow(yr5.total / yr1.total, 1 / 4) - 1) * 100
        )
      : 6;

  // Fade + slide-up helper
  const fade = (start: number, dur: number = 15): React.CSSProperties => ({
    opacity: interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    transform: `translateY(${interpolate(
      frame,
      [start, start + dur],
      [30, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    )}px)`,
  });

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground edgeLightColor={C.emerald} />
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Slide counter */}
      <SlideCounter current={slideNumber} total={totalSlides} startFrame={0} />

      {/* Background glows */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 400,
          background:
            "radial-gradient(ellipse, rgba(71,131,255,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 400,
          background:
            "radial-gradient(ellipse, rgba(249,115,22,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Safe zone content */}
      <SafeZone style={{ zIndex: 10, alignItems: "center" }}>
        <Logo size={28} startFrame={0} />
        {/* Section tag */}
        <div style={{ ...fade(0, 8), marginTop: 16, textAlign: "center" }}>
          <span
            style={{
              display: "inline-block",
              padding: "12px 32px",
              borderRadius: 50,
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.2)",
              fontSize: 18,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: C.emerald,
            }}
          >
            How Costs Change
          </span>
        </div>

        {/* Bike image */}
        <div
          style={{
            ...fade(2, 8),
            marginTop: 20,
            height: 200,
            display: "flex",
            justifyContent: "center",
          }}
        >
          {vehicle.primary_nobg_url && (
            <Img
              src={vehicle.primary_nobg_url}
              style={{
                height: "100%",
                objectFit: "contain",
                filter:
                  "drop-shadow(0 25px 60px rgba(0,0,0,0.7)) drop-shadow(0 0 40px rgba(71,131,255,0.08))",
              }}
            />
          )}
        </div>

        {/* Vehicle name */}
        <div style={{ ...fade(4, 8), textAlign: "center", marginTop: 6 }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.text1 }}>
            {vehicle.brand_name} {vehicle.short_name}
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 500,
              color: C.text4,
              marginTop: 3,
            }}
          >
            Year-by-Year Cost Progression
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            margin: "24px 120px 0",
            height: 1,
            width: "calc(100% - 240px)",
            background:
              "linear-gradient(90deg, transparent, rgba(16,185,129,0.15), transparent)",
            opacity: interpolate(frame, [10, 16], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />

        {/* Legend */}
        <div
          style={{
            ...fade(14, 8),
            display: "flex",
            gap: 32,
            justifyContent: "center",
            marginTop: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 18,
              fontWeight: 600,
              color: C.text3,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                background: C.emerald,
              }}
            />
            Base running cost
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 18,
              fontWeight: 600,
              color: C.text3,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                background: C.orange,
              }}
            />
            Overhauls
          </div>
        </div>

        {/* Year bars */}
        <div
          style={{
            margin: "24px 58px 0",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            width: "calc(100% - 116px)",
          }}
        >
          {years.map((yr, i) => {
            const rowStart = 18 + i * 5;
            const base =
              yr.fuel + yr.service + yr.insurance + (yr.tyres || 0);
            const overhaul = yr.overhauls || 0;
            const hasOverhaul = overhaul > 0;

            const basePct = (base / maxTotal) * 100;
            const overhaulPct = (overhaul / maxTotal) * 100;

            // Animated bar growth
            const barGrow = interpolate(
              frame,
              [rowStart + 4, rowStart + 28],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            return (
              <div
                key={yr.year}
                style={{
                  ...fade(rowStart, 10),
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                {/* Year label */}
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: hasOverhaul ? C.orange : C.text3,
                    width: 60,
                    flexShrink: 0,
                  }}
                >
                  Yr {yr.year}
                </div>

                {/* Bar track */}
                <div
                  style={{
                    flex: 1,
                    height: 44,
                    background: C.surface2,
                    borderRadius: 12,
                    overflow: "hidden",
                    display: "flex",
                  }}
                >
                  {/* Base bar */}
                  <div
                    style={{
                      height: "100%",
                      background: C.emerald,
                      borderRadius: hasOverhaul ? "12px 0 0 12px" : 12,
                      width: `${basePct * barGrow}%`,
                    }}
                  />
                  {/* Overhaul bar */}
                  {hasOverhaul && (
                    <div
                      style={{
                        height: "100%",
                        background: C.orange,
                        width: `${overhaulPct * barGrow}%`,
                      }}
                    />
                  )}
                </div>

                {/* Amount */}
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: hasOverhaul ? C.orange : C.text1,
                    width: 160,
                    flexShrink: 0,
                    textAlign: "right",
                  }}
                >
                  {"\u20B9"} {formatINR(yr.total)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Insight card */}
        <div
          style={{
            ...fade(55, 12),
            margin: "28px 58px 0",
            padding: "24px 32px",
            background: "rgba(249,115,22,0.06)",
            border: "1px solid rgba(249,115,22,0.15)",
            borderRadius: 16,
            width: "calc(100% - 116px)",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: C.text2,
              lineHeight: 1.5,
            }}
          >
            Costs grow{" "}
            <span style={{ color: C.orange, fontWeight: 800 }}>
              ~{inflationRate}%/year
            </span>{" "}
            (inflation)
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: C.text2,
              lineHeight: 1.5,
              marginTop: 6,
            }}
          >
            <span style={{ color: C.orange, fontWeight: 800 }}>
              Overhaul years spike significantly
            </span>{" "}
            — budget ahead
          </div>
        </div>

      </SafeZone>

      {/* Progress dots */}
      <ProgressDots
        current={slideNumber}
        total={totalSlides}
        activeColor={C.emerald}
        startFrame={0}
      />

      {/* Watermark */}
      <Watermark variant="portrait" />
    </AbsoluteFill>
  );
};
