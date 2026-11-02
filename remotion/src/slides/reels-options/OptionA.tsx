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
 * Option A -- "Donut + Stats"
 *
 * Full-screen dark bg. Large SVG donut chart centered in the upper third.
 * Total amount inside the ring. Below: 4 horizontal stat rows with colored
 * left accents. Bike image as faint decorative element bottom-right.
 * Clean infographic style.
 */

interface CostCategory {
  key: string;
  label: string;
  icon: string;
  amount: number;
  pct: number;
  color: string;
}

export const OptionA: React.FC<PortraitSlideProps> = ({
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
    { key: "fuel", label: "Fuel", icon: "F", amount: vehicle.annual_fuel, pct: fuelPct, color: C.amber },
    { key: "service", label: "Service", icon: "S", amount: vehicle.annual_service, pct: servicePct, color: C.blue },
    { key: "insurance", label: "Insurance", icon: "I", amount: vehicle.annual_insurance, pct: insurancePct, color: C.violet },
  ];
  if (vehicle.annual_tyres > 0) {
    categories.push({ key: "tyres", label: "Tyres", icon: "T", amount: vehicle.annual_tyres, pct: tyresPct, color: C.orange });
  }

  // Animation helpers
  const fade = (start: number, dur = 15) => ({
    opacity: interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    transform: `translateY(${interpolate(frame, [start, start + dur], [24, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })}px)`,
  });

  const heroValue = useCountUp(15, 40, annualTotal);

  // Donut chart parameters
  const DONUT_SIZE = 400;
  const CENTER = DONUT_SIZE / 2;
  const RADIUS = 160;
  const STROKE_WIDTH = 48;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  // Build arc segments
  const totalPct = categories.reduce((s, c) => s + c.pct, 0);
  let accumulated = 0;
  const arcs = categories.map((cat) => {
    const normalizedPct = totalPct > 0 ? (cat.pct / totalPct) * 100 : 25;
    const dashLength = (normalizedPct / 100) * CIRCUMFERENCE;
    const gapLength = CIRCUMFERENCE - dashLength;
    const offset = -(accumulated / 100) * CIRCUMFERENCE - CIRCUMFERENCE * 0.25;
    accumulated += normalizedPct;

    // Draw animation
    const drawProgress = interpolate(frame, [8, 35], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    return {
      ...cat,
      dashArray: `${dashLength * drawProgress} ${CIRCUMFERENCE - dashLength * drawProgress}`,
      dashOffset: offset,
    };
  });

  // Ring fade in
  const ringOpacity = interpolate(frame, [5, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        fontFamily: "Inter, sans-serif",
        background: `linear-gradient(180deg, ${C.bg} 0%, #0c0c10 50%, ${C.bg2} 100%)`,
      }}
    >
      {/* Subtle radial glow behind donut */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <div style={{ position: "absolute", top: 60, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Logo size={26} startFrame={0} />
      </div>

      {/* Header label */}
      <div
        style={{
          ...fade(0, 10),
          position: "absolute",
          top: 120,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "8px 24px",
            borderRadius: 50,
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.15)",
            fontSize: 14,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: C.amber,
          }}
        >
          Annual Breakdown
        </span>
      </div>

      {/* Vehicle name */}
      <div
        style={{
          ...fade(2, 10),
          position: "absolute",
          top: 170,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 30,
          fontWeight: 900,
          color: C.text1,
        }}
      >
        {vehicle.brand_name} {vehicle.short_name}
      </div>

      {/* SVG Donut Chart */}
      <div
        style={{
          position: "absolute",
          top: 240,
          left: "50%",
          transform: "translateX(-50%)",
          width: DONUT_SIZE,
          height: DONUT_SIZE,
          opacity: ringOpacity,
        }}
      >
        <svg width={DONUT_SIZE} height={DONUT_SIZE} viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}>
          {/* Background ring */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke={C.surface2}
            strokeWidth={STROKE_WIDTH}
          />
          {/* Colored arcs */}
          {arcs.map((arc) => (
            <circle
              key={arc.key}
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke={arc.color}
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={arc.dashArray}
              strokeDashoffset={arc.dashOffset}
              strokeLinecap="round"
              style={{ transition: "none" }}
            />
          ))}
        </svg>

        {/* Center text inside donut */}
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
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: C.text3,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: 4,
            }}
          >
            Total / Year
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: C.text1,
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            {"\u20B9"}{formatINR(heroValue)}
          </div>
        </div>
      </div>

      {/* Stat rows */}
      <div
        style={{
          position: "absolute",
          top: 700,
          left: 60,
          right: 60,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {categories.map((cat, i) => {
          const rowStart = 30 + i * 8;
          return (
            <div
              key={cat.key}
              style={{
                ...fade(rowStart, 12),
                display: "flex",
                alignItems: "center",
                padding: "22px 24px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: 16,
                borderLeft: `5px solid ${cat.color}`,
                gap: 16,
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  fontWeight: 900,
                  background: `${cat.color}18`,
                  color: cat.color,
                  flexShrink: 0,
                }}
              >
                {cat.icon}
              </div>

              {/* Label + percentage */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.text1 }}>
                  {cat.label}
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: C.text3, marginTop: 2 }}>
                  {cat.pct}% of total
                </div>
              </div>

              {/* Amount */}
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: cat.color,
                  textAlign: "right",
                }}
              >
                {formatINRFull(cat.amount)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily cost footer */}
      <div
        style={{
          ...fade(65, 12),
          position: "absolute",
          bottom: 280,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 600, color: C.text4, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Per Day
        </div>
        <div style={{ fontSize: 48, fontWeight: 900, color: C.amber, marginTop: 4 }}>
          {vehicle.cost_per_day_display}
        </div>
      </div>

      {/* Decorative bike image bottom-right */}
      {vehicle.primary_nobg_url && (
        <Img
          src={vehicle.primary_nobg_url}
          style={{
            position: "absolute",
            bottom: 40,
            right: -40,
            width: 280,
            height: 200,
            objectFit: "contain",
            opacity: 0.2,
            filter: "grayscale(60%)",
          }}
        />
      )}

      {/* Slide counter */}
      <div
        style={{
          ...fade(0, 8),
          position: "absolute",
          bottom: 60,
          left: 60,
          fontSize: 14,
          fontWeight: 700,
          color: C.text4,
        }}
      >
        {slideNumber}/{totalSlides}
      </div>
    </AbsoluteFill>
  );
};
