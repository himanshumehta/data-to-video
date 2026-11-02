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
import { formatINR, formatINRFull, formatINRShort } from "../../utils/format";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";

const CLICK_FRAMES = [0, 6, 18, 28, 42, 60];

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

/* ---- Color by retention percentage ---- */
function barColor(retentionPct: number): string {
  if (retentionPct >= 60) return C.blue;
  if (retentionPct >= 40) return C.amber;
  if (retentionPct >= 20) return C.orange;
  return C.red;
}

function barGradient(retentionPct: number): { from: string; to: string } {
  if (retentionPct >= 60) return { from: "#1e40af", to: "#60a5fa" };
  if (retentionPct >= 40) return { from: "#92400e", to: "#fbbf24" };
  if (retentionPct >= 20) return { from: "#9a3412", to: "#fb923c" };
  return { from: "#991b1b", to: "#f87171" };
}

/* ---- Bar entry data ---- */
interface BarEntry {
  label: string;
  value: number;
  valueDisplay: string;
  retentionPct: number;
  lossPctLabel: string;
  isNew: boolean;
}

export const DepreciationReels: React.FC<PortraitSlideProps> = ({
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

  const milestones = vehicle.dep_milestones || [];
  const price = vehicle.price_ex_showroom || 0;
  const firstYearDep =
    price && milestones[0] ? price - milestones[0].value : 0;
  const depPerDay = firstYearDep > 0 ? Math.round(firstYearDep / 365) : 0;

  // Build bar entries: "New" + milestones
  const bars: BarEntry[] = [
    {
      label: "New",
      value: price,
      valueDisplay: vehicle.price_formatted,
      retentionPct: 100,
      lossPctLabel: "100%",
      isNew: true,
    },
    ...milestones.map((m) => ({
      label: `Yr ${m.year}`,
      value: m.value,
      valueDisplay: m.value_display,
      retentionPct: m.retention_pct,
      lossPctLabel: `-${m.loss_pct}%`,
      isNew: false,
    })),
  ];

  const MAX_BAR_HEIGHT = 520;
  const BAR_WIDTH = 100;
  const BAR_GAP = 16;

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
            filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.7)) drop-shadow(0 0 40px rgba(239,68,68,0.15))",
            zIndex: 2,
            ...fade(0, 15),
          }}
        />
      )}

      {/* Red glow behind bike */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 500,
          background: "radial-gradient(ellipse, rgba(239,68,68,0.12) 0%, transparent 70%)",
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
      <SlideCounter
        current={slideNumber}
        total={totalSlides}
        fontSize={20}
        startFrame={0}
        variant="reels"
      />

      {/* Vehicle name (below bike) */}
      <div style={{ position: "absolute", top: 700, left: 0, right: 0, zIndex: 10, textAlign: "center" }}>
        <div style={{ ...fade(5), fontSize: 44, fontWeight: 900, color: C.text1, textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>
          {vehicle.brand_name} {vehicle.short_name}
        </div>
      </div>

      {/* Section pill */}
      <div style={{ position: "absolute", top: 770, left: 0, right: 0, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ ...fade(8, 8) }}>
          <span style={{ display: "inline-block", padding: "8px 24px", borderRadius: 50, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", fontSize: 18, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: C.red }}>
            Depreciation Over Time
          </span>
        </div>
        <div style={{ ...fade(10, 8), fontSize: 18, fontWeight: 500, color: C.text4, marginTop: 8 }}>
          Resale Value Over Time
        </div>
      </div>

      {/* ---- VERTICAL BAR CHART (3-row layout, DESCENDING) ---- */}
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
          {bars.map((bar, i) => {
            const barStart = 18 + i * 4;
            const labelFade = interpolate(
              frame,
              [barStart + 14, barStart + 22],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <div
                key={bar.label}
                style={{
                  width: BAR_WIDTH,
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: 900,
                  color: bar.isNew ? C.emerald : C.text1,
                  opacity: labelFade,
                  whiteSpace: "nowrap",
                  textShadow: bar.isNew
                    ? "0 0 20px rgba(16,185,129,0.3)"
                    : "none",
                }}
              >
                {bar.isNew ? bar.valueDisplay : formatINRShort(bar.value)}
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
            bottom: 70,
          }}
        >
          {bars.map((bar, i) => {
            const targetHeight = (bar.retentionPct / 100) * (MAX_BAR_HEIGHT - 80);
            const barStart = 18 + i * 4;
            const animatedHeight = useBarHeight(frame, barStart, targetHeight, 20);
            const color = bar.isNew ? C.emerald : barColor(bar.retentionPct);
            const grad = bar.isNew
              ? { from: "#065f46", to: "#34d399" }
              : barGradient(bar.retentionPct);
            return (
              <div
                key={bar.label}
                style={{
                  width: BAR_WIDTH,
                  height: animatedHeight,
                  borderRadius: "12px 12px 4px 4px",
                  background: `linear-gradient(to top, ${grad.from}, ${grad.to})`,
                  boxShadow: `0 0 25px ${color}20, inset 0 1px 0 rgba(255,255,255,0.12)`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Glossy highlight */}
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
              </div>
            );
          })}
        </div>

        {/* Labels row -- fixed at bottom (with loss % badges) */}
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
          {bars.map((bar, i) => {
            const barStart = 18 + i * 4;
            const labelFade = interpolate(
              frame,
              [barStart + 14, barStart + 22],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <div
                key={bar.label}
                style={{
                  width: BAR_WIDTH,
                  textAlign: "center",
                  opacity: labelFade,
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: bar.isNew ? C.emerald : C.text2,
                  }}
                >
                  {bar.label}
                </div>
                {!bar.isNew && (
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: 4,
                      padding: "2px 10px",
                      borderRadius: 50,
                      fontSize: 18,
                      fontWeight: 900,
                      background: `${barColor(bar.retentionPct)}1A`,
                      color: barColor(bar.retentionPct),
                    }}
                  >
                    {bar.lossPctLabel}
                  </span>
                )}
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
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 16,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: C.text2,
              lineHeight: 1.5,
              textAlign: "center",
            }}
          >
            First-year depreciation:{" "}
            <span style={{ fontWeight: 900, color: C.red }}>
              {formatINRFull(firstYearDep)}
            </span>
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: C.text2,
              lineHeight: 1.5,
              marginTop: 4,
              textAlign: "center",
            }}
          >
            That's{" "}
            <span style={{ fontWeight: 900, color: C.red }}>
              {formatINRFull(depPerDay)}/day
            </span>{" "}
            lost in value
          </div>
        </div>
      </div>

      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
