import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Img,
  useVideoConfig,
  spring,
  Audio,
  Sequence,
  staticFile,
} from "remotion";
import { PortraitSlideProps } from "../../types";
import { C } from "../../utils/colors";
import { useFadeSlideUp, useBarGrow, useCountUp } from "../../utils/animations";
import { formatINRFull } from "../../utils/format";
import { SlideBackground } from "../../components/SlideBackground";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";
import { SafeZone } from "../../components/SafeZone";

const CLICK_FRAMES = [0, 4, 18, 26, 34, 55];

function barColor(retentionPct: number): string {
  if (retentionPct >= 60) return C.blue;
  if (retentionPct >= 40) return C.amber;
  if (retentionPct >= 20) return C.orange;
  return C.red;
}

export const DepreciationPortrait: React.FC<PortraitSlideProps> = ({
  vehicle,
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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

  const milestones = vehicle.dep_milestones || [];
  const firstYearDep = vehicle.price_ex_showroom && milestones[0]
    ? vehicle.price_ex_showroom - milestones[0].value
    : 0;
  const depPerDay = firstYearDep > 0 ? Math.round(firstYearDep / 365) : 0;

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", width: 1080, height: 1350 }}>
      <SlideBackground edgeLightColor={C.red} />
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Glows matching HTML */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 400,
          background: "radial-gradient(ellipse, rgba(71,131,255,0.05) 0%, transparent 70%)",
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
          background: "radial-gradient(ellipse, rgba(239,68,68,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <SlideCounter current={slideNumber} total={totalSlides} fontSize={18} startFrame={0} />

      {/* Safe zone content */}
      <SafeZone style={{ zIndex: 10, alignItems: "center" }}>
        <Logo size={36} startFrame={0} />

        {/* Section Tag */}
        <div style={{ ...fade(0, 8), textAlign: "center", marginTop: 8 }}>
        <span
          style={{
            display: "inline-block",
            padding: "12px 30px",
            borderRadius: 50,
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            fontSize: 18,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: C.red,
          }}
        >
          Depreciation Over Time
        </span>
      </div>

      {/* Bike */}
      <div
        style={{
          ...fade(0, 8),
          display: "flex",
          justifyContent: "center",
          marginTop: 20,
          height: 200,
        }}
      >
        {vehicle.primary_nobg_url && (
          <Img
            src={vehicle.primary_nobg_url}
            style={{
              height: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0 25px 60px rgba(0,0,0,0.7)) drop-shadow(0 0 40px rgba(71,131,255,0.08))",
            }}
          />
        )}
      </div>

      {/* Vehicle Info */}
        <div style={{ ...fade(4, 8), textAlign: "center", marginTop: 6 }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: C.text1 }}>
            {vehicle.brand_name} {vehicle.short_name}
          </div>
          <div style={{ fontSize: 17, fontWeight: 500, color: C.text4, marginTop: 2 }}>
            Resale Value Over Time
          </div>
        </div>

      {/* Divider */}
      <div
        style={{
          ...fade(6, 6),
          margin: "20px 0 0",
          width: "100%",
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(239,68,68,0.15), transparent)",
        }}
      />

        {/* Depreciation Chart */}
        <div
          style={{
            margin: "22px 0 0",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
        {/* NEW row */}
        <DepRow
          frame={frame}
          fps={fps}
          startFrame={18}
          yearLabel="New"
          lossPctLabel="100%"
          lossPctColor={C.emerald}
          barPct={90}
          barColorVal={C.emerald}
          valueDisplay={vehicle.price_formatted}
          isNew
        />

        {/* Milestone rows */}
        {milestones.map((m, i) => {
          const color = barColor(m.retention_pct);
          return (
            <DepRow
              key={m.year}
              frame={frame}
              fps={fps}
              startFrame={18 + (i + 1) * 4}
              yearLabel={`Year ${m.year}`}
              lossPctLabel={`-${m.loss_pct}%`}
              lossPctColor={color}
              barPct={m.retention_pct}
              barColorVal={color}
              valueDisplay={m.value_display}
              isNew={false}
            />
          );
        })}
      </div>

        {/* Insight Card */}
        <div
          style={{
            ...fade(55, 12),
            margin: "24px 0 0",
            width: "100%",
            padding: "22px 28px",
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.15)",
            borderRadius: 16,
          }}
        >
        <div style={{ fontSize: 21, fontWeight: 600, color: C.text2, lineHeight: 1.5 }}>
          First-year depreciation:{" "}
          <span style={{ fontWeight: 900, color: C.red }}>
            {formatINRFull(firstYearDep)}
          </span>
        </div>
        <div style={{ fontSize: 21, fontWeight: 600, color: C.text2, lineHeight: 1.5, marginTop: 6 }}>
          That's{" "}
          <span style={{ fontWeight: 900, color: C.red }}>
            {formatINRFull(depPerDay)}/day
          </span>{" "}
          lost in value alone
        </div>
      </div>

      </SafeZone>

      {/* Progress Dots + Watermark */}
      <ProgressDots current={slideNumber} total={totalSlides} activeColor={C.red} startFrame={0} />
      <Watermark variant="portrait" />
    </AbsoluteFill>
  );
};

/* ---- Sub-components ---- */

interface DepRowProps {
  frame: number;
  fps: number;
  startFrame: number;
  yearLabel: string;
  lossPctLabel: string;
  lossPctColor: string;
  barPct: number;
  barColorVal: string;
  valueDisplay: string;
  isNew: boolean;
}

const DepRow: React.FC<DepRowProps> = ({
  frame,
  fps,
  startFrame,
  yearLabel,
  lossPctLabel,
  lossPctColor,
  barPct,
  barColorVal,
  valueDisplay,
  isNew,
}) => {
  const opacity = interpolate(frame, [startFrame, startFrame + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [startFrame, startFrame + 10], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const barGrow = interpolate(frame, [startFrame, startFrame + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {/* Meta */}
      <div style={{ width: 70, flexShrink: 0, textAlign: "right" }}>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: isNew ? C.emerald : C.text3,
          }}
        >
          {yearLabel}
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, color: lossPctColor }}>
          {lossPctLabel}
        </div>
      </div>

      {/* Bar Track */}
      <div
        style={{
          flex: 1,
          height: 38,
          background: C.surface1,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${barPct * barGrow}%`,
            background: barColorVal,
            borderRadius: 10,
          }}
        />
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: 24,
          fontWeight: 900,
          color: isNew ? C.emerald : C.text1,
          width: 155,
          flexShrink: 0,
          textAlign: "right",
        }}
      >
        {valueDisplay}
      </div>
    </div>
  );
};

