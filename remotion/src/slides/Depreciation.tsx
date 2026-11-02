import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Audio, Sequence, staticFile } from "remotion";
import { SlideProps } from "../types";
import { C } from "../utils/colors";
import { Logo } from "../components/Logo";
import { Watermark } from "../components/Watermark";
import { SlideBackground } from "../components/SlideBackground";
import { BikeImage } from "../components/BikeImage";
import { formatINRShort } from "../utils/format";

function barColor(retentionPct: number): string {
  if (retentionPct >= 80) return C.emerald;
  if (retentionPct >= 60) return "#3b82f6";
  if (retentionPct >= 40) return C.amber;
  return C.red;
}

const CLICK_FRAMES = [5, 12, 100];

export const Depreciation: React.FC<SlideProps> = ({ vehicle }) => {
  const frame = useCurrentFrame();

  const fade = (start: number, dur: number = 20) => ({
    opacity: interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    transform: `translateY(${interpolate(frame, [start, start + dur], [40, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })}px)`,
  });

  const milestones = vehicle.dep_milestones || [];
  const price = vehicle.price_ex_showroom;

  // Build chart data: NEW + each milestone
  const chartData = [
    { label: "NEW", value: price, retention: 100, loss: 0 },
    ...milestones.map((m) => ({
      label: `Yr ${m.year}`,
      value: m.value,
      retention: m.retention_pct,
      loss: m.loss_pct,
    })),
  ];

  const maxVal = price || 1;
  const lastMilestone = milestones[milestones.length - 1];
  const midMilestone = milestones.find((m) => m.retention_pct >= 45 && m.retention_pct <= 65);

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground edgeLightColor={C.amber} />

      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={i} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      <div style={{ position: "absolute", top: 70, right: 130, zIndex: 20 }}>
        <Logo size={80} startFrame={0} />
      </div>

      {/* Left 58% */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "90%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 0 180px 150px",
        }}
      >
        {/* Accent strip */}
        <div
          style={{
            ...fade(5, 15),
            display: "inline-block",
            background: "rgba(245,158,11,0.10)",
            padding: "10px 28px 10px 0",
            borderLeft: `6px solid ${C.amber}`,
            paddingLeft: 24,
            width: "fit-content",
            marginBottom: 24,
          }}
        >
          <span
            style={{
              fontSize: 96,
              fontWeight: 800,
              color: C.amber,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              whiteSpace: "nowrap",
            }}
          >
            Depreciation · {vehicle.brand_name} {vehicle.short_name}
          </span>
        </div>

        {/* Price decline headline */}
        <div
          style={{
            ...fade(12, 20),
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 40,
          }}
        >
          <div style={{ fontSize: 144, fontWeight: 900, color: C.emerald, whiteSpace: "nowrap" }}>
            NEW {vehicle.price_formatted}
          </div>
          <div style={{ fontSize: 144, fontWeight: 900, color: C.red }}>&#8594;</div>
          {lastMilestone && (
            <>
              <div style={{ fontSize: 144, fontWeight: 900, color: C.red, whiteSpace: "nowrap" }}>
                &#8595; -{lastMilestone.loss_pct}%
              </div>
              <div style={{ fontSize: 144, fontWeight: 900, color: C.red }}>&#8594;</div>
              <div style={{ fontSize: 144, fontWeight: 900, color: C.amber, whiteSpace: "nowrap" }}>
                Yr {lastMilestone.year} {lastMilestone.value_display}
              </div>
            </>
          )}
        </div>

        {/* Vertical bar chart */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 48, height: 900, marginBottom: 40 }}>
          {chartData.map((d, i) => {
            const barStart = 40 + i * 8;
            const grow = interpolate(frame, [barStart, barStart + 30], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const h = (d.value / maxVal) * 800 * grow;
            const color = barColor(d.retention);

            return (
              <div
                key={d.label}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                  height: "100%",
                  justifyContent: "flex-end",
                }}
              >
                {/* Value above bar */}
                <div style={{ fontSize: 72, fontWeight: 900, color: C.text1, opacity: grow, whiteSpace: "nowrap" }}>
                  {formatINRShort(d.value)}
                </div>
                {/* Loss % */}
                {d.loss > 0 && (
                  <div style={{ fontSize: 60, fontWeight: 800, color: C.red, opacity: grow, whiteSpace: "nowrap" }}>
                    -{d.loss}%
                  </div>
                )}
                {/* Bar */}
                <div
                  style={{
                    width: "80%",
                    height: h,
                    background: `linear-gradient(180deg, ${color}dd, ${color})`,
                    borderRadius: "8px 8px 0 0",
                    border: `2px solid ${color}33`,
                    borderBottom: "none",
                  }}
                />
                {/* Label */}
                <div style={{ fontSize: 72, fontWeight: 800, color: C.text3, whiteSpace: "nowrap" }}>
                  {d.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Insight */}
        <div
          style={{
            ...fade(100, 20),
            background: "rgba(255,255,255,0.03)",
            border: "2px solid rgba(255,255,255,0.06)",
            borderLeft: `4px solid ${C.amber}`,
            borderRadius: 16,
            padding: "20px 28px",
            fontSize: 84,
            fontWeight: 600,
            color: C.text2,
            lineHeight: 1.4,
            width: "100%",
            whiteSpace: "nowrap",
          }}
        >
          {midMilestone
            ? `Sell by Year ${midMilestone.year} to retain ~${Math.round(midMilestone.retention_pct)}% value`
            : `Depreciation is steepest in the first 3 years -- plan your sell window early`}
        </div>
      </div>

      {/* Bike right */}
      <BikeImage
        src={vehicle.primary_nobg_url}
        width="42%"
        opacity={0.4}
        startFrame={5}
        glowColor="rgba(245,158,11,0.03)"
      />

      <Watermark />
    </AbsoluteFill>
  );
};
