import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Img,
  useVideoConfig,
} from "remotion";
import { PortraitSlideProps } from "../../types";
import { C } from "../../utils/colors";
import { useCountUp } from "../../utils/animations";
import { formatINR, formatINRFull } from "../../utils/format";
import { Logo } from "../../components/Logo";

/**
 * Option E -- "Radial/Gauge Dashboard"
 *
 * Four semicircle gauges in a 2x2 grid, each showing a half-circle arc
 * filled to the category's percentage. Technical, dashboard-style.
 * Bike at top + vehicle name. Total + daily cost below the grid.
 */

interface CostCategory {
  key: string;
  label: string;
  amount: number;
  pct: number;
  color: string;
  colorRgb: string;
}

// Semicircle gauge component
const Gauge: React.FC<{
  size: number;
  percentage: number;
  color: string;
  colorRgb: string;
  label: string;
  amount: number;
  fillProgress: number;
  opacity: number;
}> = ({ size, percentage, color, colorRgb, label, amount, fillProgress, opacity }) => {
  const RADIUS = (size - 24) / 2;
  const CENTER_X = size / 2;
  const CENTER_Y = size / 2 + 10; // offset down slightly for semicircle
  // Semicircle: arc from 180deg to 0deg (bottom half hidden)
  const SEMI_CIRCUMFERENCE = Math.PI * RADIUS;
  const filledLength = (percentage / 100) * SEMI_CIRCUMFERENCE * fillProgress;
  const gapLength = SEMI_CIRCUMFERENCE - filledLength;

  // Tick marks for the gauge
  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const angle = Math.PI + (i / 10) * Math.PI; // 180 to 360 degrees
    const innerR = RADIUS - 8;
    const outerR = RADIUS + 8;
    ticks.push({
      x1: CENTER_X + Math.cos(angle) * innerR,
      y1: CENTER_Y + Math.sin(angle) * innerR,
      x2: CENTER_X + Math.cos(angle) * outerR,
      y2: CENTER_Y + Math.sin(angle) * outerR,
      major: i % 5 === 0,
    });
  }

  return (
    <div
      style={{
        width: size,
        height: size * 0.65, // crop bottom
        position: "relative",
        opacity,
        overflow: "hidden",
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Tick marks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.major ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)"}
            strokeWidth={t.major ? 2 : 1}
          />
        ))}

        {/* Background arc */}
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={RADIUS}
          fill="none"
          stroke={C.surface2}
          strokeWidth={14}
          strokeDasharray={`${SEMI_CIRCUMFERENCE} ${SEMI_CIRCUMFERENCE}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(180, ${CENTER_X}, ${CENTER_Y})`}
        />

        {/* Filled arc */}
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={14}
          strokeDasharray={`${filledLength} ${gapLength + SEMI_CIRCUMFERENCE}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(180, ${CENTER_X}, ${CENTER_Y})`}
          style={{ filter: `drop-shadow(0 0 8px rgba(${colorRgb}, 0.4))` }}
        />

        {/* Glow behind arc */}
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={28}
          strokeDasharray={`${filledLength} ${gapLength + SEMI_CIRCUMFERENCE}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(180, ${CENTER_X}, ${CENTER_Y})`}
          opacity={0.08}
        />
      </svg>

      {/* Center content */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 20,
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 900,
            color,
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          {Math.round(percentage * fillProgress)}%
        </div>
      </div>

      {/* Label + amount below gauge */}
      <div
        style={{
          position: "absolute",
          bottom: -4,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text2 }}>
          {label}
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            color,
            marginTop: 2,
          }}
        >
          {formatINRFull(amount)}
        </div>
      </div>
    </div>
  );
};

export const OptionE: React.FC<PortraitSlideProps> = ({
  vehicle,
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const annualTotal = vehicle.annual_total || 0;
  const fuelPct = annualTotal > 0 ? Math.round((vehicle.annual_fuel / annualTotal) * 100) : 0;
  const servicePct = annualTotal > 0 ? Math.round((vehicle.annual_service / annualTotal) * 100) : 0;
  const insurancePct = annualTotal > 0 ? Math.round((vehicle.annual_insurance / annualTotal) * 100) : 0;
  const tyresPct = annualTotal > 0 ? Math.round((vehicle.annual_tyres / annualTotal) * 100) : 0;

  const categories: CostCategory[] = [
    { key: "fuel", label: "Fuel", amount: vehicle.annual_fuel, pct: fuelPct, color: C.amber, colorRgb: "245,158,11" },
    { key: "service", label: "Service", amount: vehicle.annual_service, pct: servicePct, color: C.blue, colorRgb: "71,131,255" },
    { key: "insurance", label: "Insurance", amount: vehicle.annual_insurance, pct: insurancePct, color: C.violet, colorRgb: "139,92,246" },
    { key: "tyres", label: "Tyres", amount: vehicle.annual_tyres, pct: tyresPct, color: C.orange, colorRgb: "249,115,22" },
  ];

  const heroValue = useCountUp(15, 40, annualTotal);

  // Gauge fill animation
  const gaugeFill = interpolate(frame, [20, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Individual gauge fade-in (staggered)
  const gaugeOpacity = (index: number) =>
    interpolate(frame, [10 + index * 5, 22 + index * 5], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  // Header fade
  const headerFade = (start: number, dur = 15) => ({
    opacity: interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    transform: `translateY(${interpolate(frame, [start, start + dur], [20, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })}px)`,
  });

  const GAUGE_SIZE = 420;
  const GRID_GAP = 40;

  return (
    <AbsoluteFill
      style={{
        fontFamily: "Inter, sans-serif",
        background: `radial-gradient(ellipse at center 30%, #111118 0%, ${C.bg} 70%)`,
      }}
    >
      {/* Scanline effect for tech feel */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.008) 3px, rgba(255,255,255,0.008) 4px)",
          pointerEvents: "none",
        }}
      />

      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${C.amber}, ${C.blue}, ${C.violet}, ${C.orange})`,
          opacity: interpolate(frame, [0, 10], [0, 0.6], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />

      {/* Logo */}
      <div style={{ position: "absolute", top: 50, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Logo size={22} startFrame={0} />
      </div>

      {/* Tag line */}
      <div
        style={{
          ...headerFade(0, 10),
          position: "absolute",
          top: 100,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "6px 20px",
            borderRadius: 6,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            fontSize: 13,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: C.text3,
          }}
        >
          Dashboard
        </span>
      </div>

      {/* Bike image */}
      {vehicle.primary_nobg_url && (
        <div
          style={{
            ...headerFade(2, 15),
            position: "absolute",
            top: 150,
            left: "50%",
            transform: `translateX(-50%)`,
          }}
        >
          <Img
            src={vehicle.primary_nobg_url}
            style={{
              height: 280,
              objectFit: "contain",
              filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.7))",
            }}
          />
        </div>
      )}

      {/* Vehicle name */}
      <div
        style={{
          ...headerFade(5, 10),
          position: "absolute",
          top: 440,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 900, color: C.text1, letterSpacing: "0.02em" }}>
          {vehicle.brand_name} {vehicle.short_name}
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: C.text4, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.15em" }}>
          Annual Cost Breakdown
        </div>
      </div>

      {/* 2x2 Gauge Grid */}
      <div
        style={{
          position: "absolute",
          top: 530,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexWrap: "wrap",
          width: GAUGE_SIZE * 2 + GRID_GAP,
          gap: GRID_GAP,
          justifyContent: "center",
        }}
      >
        {categories.map((cat, i) => (
          <Gauge
            key={cat.key}
            size={GAUGE_SIZE}
            percentage={cat.pct}
            color={cat.color}
            colorRgb={cat.colorRgb}
            label={cat.label}
            amount={cat.amount}
            fillProgress={gaugeFill}
            opacity={gaugeOpacity(i)}
          />
        ))}
      </div>

      {/* Bottom total */}
      <div
        style={{
          ...headerFade(45, 15),
          position: "absolute",
          bottom: 220,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text4, textTransform: "uppercase", letterSpacing: "0.2em" }}>
          Total Annual
        </div>
        <div
          style={{
            fontSize: 90,
            fontWeight: 900,
            color: C.text1,
            letterSpacing: "-0.05em",
            lineHeight: 1,
            marginTop: 8,
          }}
        >
          {"\u20B9"}{formatINR(heroValue)}
        </div>
      </div>

      {/* Daily cost */}
      <div
        style={{
          ...headerFade(55, 12),
          position: "absolute",
          bottom: 120,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 36px",
            borderRadius: 12,
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.12)",
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 600, color: C.text3 }}>Daily Cost</span>
          <span
            style={{
              width: 1,
              height: 20,
              background: "rgba(255,255,255,0.1)",
            }}
          />
          <span style={{ fontSize: 32, fontWeight: 900, color: C.amber }}>
            {vehicle.cost_per_day_display}
          </span>
        </div>
      </div>

      {/* Slide counter */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          left: 60,
          fontSize: 13,
          fontWeight: 700,
          color: C.text4,
          fontVariantNumeric: "tabular-nums",
          opacity: interpolate(frame, [0, 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {String(slideNumber).padStart(2, "0")}/{String(totalSlides).padStart(2, "0")}
      </div>

      {/* Bottom accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${C.amber}, ${C.blue}, ${C.violet}, ${C.orange})`,
          opacity: 0.3,
        }}
      />
    </AbsoluteFill>
  );
};
