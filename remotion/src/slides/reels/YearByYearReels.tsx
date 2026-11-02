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
import { resolveImage } from "../../utils/resolveImage";
import { C } from "../../utils/colors";
import { formatINR } from "../../utils/format";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";

const CLICK_FRAMES = [0, 6, 16, 24, 36, 60];

/* ---- Bar animation helper ---- */
function useBarHeight(
  frame: number,
  startFrame: number,
  targetHeight: number,
  duration: number = 20
) {
  return interpolate(
    frame,
    [startFrame, startFrame + duration],
    [0, targetHeight],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
}

export const YearByYearReels: React.FC<PortraitSlideProps> = ({
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
      ? Math.round((Math.pow(yr5.total / yr1.total, 1 / 4) - 1) * 100)
      : 6;

  const MAX_BAR_HEIGHT = 520;
  const BAR_WIDTH = 120;
  const BAR_GAP = 24;

  // Fade + slide-up helper
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
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: C.bg }}>
      {/* Click sounds */}
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Bike hero image -- large, clear, like Slide 1-2 */}
      {vehicle.primary_nobg_url && (
        <Img
          src={resolveImage(vehicle.primary_nobg_url)}
          style={{
            position: "absolute",
            top: 200,
            left: "5%",
            width: "90%",
            height: 480,
            objectFit: "contain",
            objectPosition: "center center",
            filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.7)) drop-shadow(0 0 40px rgba(16,185,129,0.15))",
            zIndex: 2,
            ...fade(0, 15),
          }}
        />
      )}

      {/* Emerald glow behind bike */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 500,
          background: "radial-gradient(ellipse, rgba(16,185,129,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 780,
          background: "linear-gradient(to bottom, transparent 50%, rgba(9,9,11,0.3) 62%, rgba(9,9,11,0.75) 76%, #09090b 92%)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />

      {/* Logo -- centered, 2x size, above bike (in safe zone, OK) */}
      <div style={{ position: "absolute", top: 72, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 20, pointerEvents: "none" }}>
        <Logo size={72} startFrame={0} />
      </div>

      {/* Slide counter */}
      <SlideCounter current={slideNumber} total={totalSlides} startFrame={0} variant="reels" />

      {/* Vehicle name (below bike) */}
      <div style={{ position: "absolute", top: 700, left: 0, right: 0, zIndex: 10, textAlign: "center" }}>
        <div style={{ ...fade(5), fontSize: 44, fontWeight: 900, color: C.text1, textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>
          {vehicle.brand_name} {vehicle.short_name}
        </div>
      </div>

      {/* Section pill + legend */}
      <div style={{ position: "absolute", top: 770, left: 0, right: 0, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ ...fade(8, 8) }}>
          <span style={{ display: "inline-block", padding: "8px 24px", borderRadius: 50, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", fontSize: 18, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: C.emerald }}>
            How Costs Change
          </span>
        </div>
        {/* Legend dots */}
        <div style={{ ...fade(10, 8), display: "flex", gap: 36, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 18, fontWeight: 600, color: C.text3 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: C.emerald }} />
            Base
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 18, fontWeight: 600, color: C.text3 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: C.orange }} />
            Overhauls
          </div>
        </div>
      </div>

      {/* ---- VERTICAL STACKED BAR CHART (3-row layout) ---- */}
      <div
        style={{
          position: "absolute",
          top: 920,
          left: "10%",
          right: "10%",
          height: MAX_BAR_HEIGHT + 120,
          zIndex: 10,
        }}
      >
        {/* Values row -- fixed at top */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: BAR_GAP,
            padding: "0 20px",
            width: "100%",
            position: "absolute",
            top: 0,
          }}
        >
          {years.map((yr, i) => {
            const overhaul = yr.overhauls || 0;
            const hasOverhaul = overhaul > 0;
            const barStart = 24 + i * 4;
            const labelFade = interpolate(
              frame,
              [barStart + 14, barStart + 22],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <div
                key={yr.year}
                style={{
                  width: BAR_WIDTH,
                  textAlign: "center",
                  fontSize: 22,
                  fontWeight: 900,
                  color: hasOverhaul ? C.orange : C.text1,
                  opacity: labelFade,
                  whiteSpace: "nowrap",
                  textShadow: hasOverhaul
                    ? "0 0 20px rgba(249,115,22,0.3)"
                    : "none",
                }}
              >
                {"\u20B9"} {formatINR(yr.total)}
              </div>
            );
          })}
        </div>

        {/* Bars row -- anchored to bottom */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: BAR_GAP,
            padding: "0 20px",
            width: "100%",
            position: "absolute",
            bottom: 50,
          }}
        >
          {years.map((yr, i) => {
            const base =
              yr.fuel + yr.service + yr.insurance + (yr.tyres || 0);
            const overhaul = yr.overhauls || 0;
            const total = yr.total;
            const hasOverhaul = overhaul > 0;

            const totalBarHeight = Math.max((total / maxTotal) * (MAX_BAR_HEIGHT - 80), 44);
            const baseRatio = total > 0 ? base / total : 1;
            const overhaulRatio = total > 0 ? overhaul / total : 0;

            const barStart = 24 + i * 4;
            const animatedTotalHeight = useBarHeight(
              frame,
              barStart,
              totalBarHeight,
              20
            );

            const overhaulHeight = animatedTotalHeight * overhaulRatio;

            return (
              <div
                key={yr.year}
                style={{
                  width: BAR_WIDTH,
                  height: animatedTotalHeight,
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "12px 12px 4px 4px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {/* Overhaul segment on TOP */}
                {hasOverhaul && overhaulHeight > 0 && (
                  <div
                    style={{
                      width: "100%",
                      height: overhaulHeight,
                      background:
                        "linear-gradient(to top, #c2410c, #fb923c)",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {/* Overhaul amount inside orange segment */}
                    {overhaulHeight > 40 && (
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 800,
                          color: "rgba(255,255,255,0.9)",
                          textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {"\u20B9"}{formatINR(overhaul)}
                      </div>
                    )}
                  </div>
                )}

                {/* Base segment on BOTTOM */}
                <div
                  style={{
                    width: "100%",
                    flex: 1,
                    background:
                      "linear-gradient(to top, #065f46, #34d399)",
                    position: "relative",
                    borderRadius: hasOverhaul
                      ? "0 0 4px 4px"
                      : "12px 12px 4px 4px",
                  }}
                >
                  {/* Glossy highlight */}
                  {!hasOverhaul && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "35%",
                        background:
                          "linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)",
                        borderRadius: "12px 12px 0 0",
                      }}
                    />
                  )}
                </div>

                {/* Top glossy highlight when has overhaul */}
                {hasOverhaul && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "20%",
                      background:
                        "linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)",
                      borderRadius: "12px 12px 0 0",
                      pointerEvents: "none",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Labels row -- fixed at bottom */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: BAR_GAP,
            padding: "0 20px",
            width: "100%",
            position: "absolute",
            bottom: 0,
          }}
        >
          {years.map((yr, i) => {
            const overhaul = yr.overhauls || 0;
            const hasOverhaul = overhaul > 0;
            const barStart = 24 + i * 4;
            const labelFade = interpolate(
              frame,
              [barStart + 14, barStart + 22],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <div
                key={yr.year}
                style={{
                  width: BAR_WIDTH,
                  textAlign: "center",
                  opacity: labelFade,
                }}
              >
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: hasOverhaul ? C.orange : C.text2,
                  }}
                >
                  Yr {yr.year}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---- FOOTER INSIGHT ---- */}
      <div
        style={{
          position: "absolute",
          top: 1580,
          left: 0,
          right: 0,
          padding: "0 108px",
          zIndex: 10,
          ...fade(60, 12),
        }}
      >
        <div
          style={{
            padding: "20px 28px",
            background: "rgba(16,185,129,0.06)",
            border: "1px solid rgba(16,185,129,0.15)",
            borderRadius: 16,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: C.text2,
            }}
          >
            Costs grow{" "}
            <span style={{ color: C.emerald, fontWeight: 800 }}>
              ~{inflationRate}%/year
            </span>
            {" "}{"\u00B7"}{" "}
            <span style={{ color: C.orange, fontWeight: 800 }}>
              Overhauls spike
            </span>
            {" "}{"\u2014"} budget ahead
          </span>
        </div>
      </div>

      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
