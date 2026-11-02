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
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";

/**
 * Option F -- "Bike Hero + 2x2 Gauges"
 *
 * Logo centered top. Bike image 320px centered with drop-shadow + subtle
 * amber glow behind. Vehicle name on two lines: brand white 36px, short name
 * amber 54px. Four semicircle gauges in a 2x2 grid (200px wide, 40px gap).
 * Percentage 48px bold white inside, category 18px dim, amount 28px colored
 * below. Thin gradient divider, "TOTAL ANNUAL" 18px dim, total 80px white,
 * "Per Day" glass pill 22px.
 */

const BG = "#0c0e14";

interface CostCategory {
  key: string;
  label: string;
  amount: number;
  pct: number;
  color: string;
}

const Gauge: React.FC<{
  size: number;
  percentage: number;
  color: string;
  strokeWidth?: number;
  frame: number;
  startFrame: number;
}> = ({ size, percentage, color, strokeWidth = 10, frame, startFrame }) => {
  const radius = (size - strokeWidth) / 2;
  const halfCircumference = Math.PI * radius;
  const progress = interpolate(frame, [startFrame, startFrame + 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const filled = (percentage / 100) * halfCircumference * progress;

  return (
    <svg
      width={size}
      height={size / 2 + strokeWidth / 2}
      viewBox={`0 0 ${size} ${size / 2 + strokeWidth / 2}`}
    >
      <path
        d={`M ${strokeWidth / 2},${size / 2} A ${radius},${radius} 0 0,1 ${size - strokeWidth / 2},${size / 2}`}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d={`M ${strokeWidth / 2},${size / 2} A ${radius},${radius} 0 0,1 ${size - strokeWidth / 2},${size / 2}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${halfCircumference}`}
        style={{ filter: `drop-shadow(0 0 8px ${color}50)` }}
      />
    </svg>
  );
};

export const OptionF: React.FC<PortraitSlideProps> = ({
  vehicle,
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const annualTotal = vehicle.annual_total || 0;
  const fuelPct =
    annualTotal > 0
      ? Math.round((vehicle.annual_fuel / annualTotal) * 100)
      : 0;
  const insurancePct =
    annualTotal > 0
      ? Math.round((vehicle.annual_insurance / annualTotal) * 100)
      : 0;
  const servicePct =
    annualTotal > 0
      ? Math.round((vehicle.annual_service / annualTotal) * 100)
      : 0;
  const tyresPct =
    annualTotal > 0
      ? Math.round((vehicle.annual_tyres / annualTotal) * 100)
      : 0;

  const categories: CostCategory[] = [
    { key: "fuel", label: "Fuel", amount: vehicle.annual_fuel, pct: fuelPct, color: C.amber },
    { key: "insurance", label: "Insurance", amount: vehicle.annual_insurance, pct: insurancePct, color: C.violet },
    { key: "service", label: "Service", amount: vehicle.annual_service, pct: servicePct, color: C.blue },
    { key: "tyres", label: "Tyres", amount: vehicle.annual_tyres, pct: tyresPct, color: C.orange },
  ];

  const heroValue = useCountUp(45, 70, annualTotal);

  // Gauge fill animation
  const gaugeFill = interpolate(frame, [20, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade + slide up helper
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

  const GAUGE_SIZE = 200;
  const GRID_GAP = 40;

  return (
    <AbsoluteFill
      style={{
        fontFamily: "Inter, sans-serif",
        background: BG,
      }}
    >
      {/* Logo centered at top */}
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Logo size={36} startFrame={0} />
      </div>

      {/* Bike image with amber glow behind */}
      {vehicle.primary_nobg_url && (
        <div
          style={{
            ...fade(3, 18),
            position: "absolute",
            top: 120,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Subtle amber glow */}
          <div
            style={{
              position: "absolute",
              width: 280,
              height: 200,
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse, rgba(245,158,11,0.10) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <Img
            src={vehicle.primary_nobg_url}
            style={{
              height: 320,
              objectFit: "contain",
              filter: "drop-shadow(0 20px 50px rgba(0,0,0,0.6))",
              position: "relative",
            }}
          />
        </div>
      )}

      {/* Vehicle name -- two lines */}
      <div
        style={{
          ...fade(6, 12),
          position: "absolute",
          top: 460,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 900,
            color: "#f4f4f5",
            lineHeight: 1.1,
            letterSpacing: "0.04em",
          }}
        >
          {vehicle.brand_name}
        </div>
        <div
          style={{
            fontSize: 54,
            fontWeight: 900,
            color: C.amber,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          {vehicle.short_name}
        </div>
      </div>

      {/* 2x2 Gauge Grid */}
      <div
        style={{
          position: "absolute",
          top: 600,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexWrap: "wrap",
          width: GAUGE_SIZE * 2 + GRID_GAP,
          gap: GRID_GAP,
          justifyContent: "center",
        }}
      >
        {categories.map((cat, i) => {
          const gaugeOpacity = interpolate(
            frame,
            [12 + i * 5, 24 + i * 5],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const pctDisplay = Math.round(cat.pct * gaugeFill);

          return (
            <div
              key={cat.key}
              style={{
                width: GAUGE_SIZE,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                opacity: gaugeOpacity,
              }}
            >
              {/* Gauge SVG with centered percentage + category label */}
              <div style={{ position: "relative" }}>
                <Gauge
                  size={GAUGE_SIZE}
                  percentage={cat.pct}
                  color={cat.color}
                  strokeWidth={12}
                  frame={frame}
                  startFrame={15 + i * 4}
                />
                {/* Content inside gauge arc */}
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
                    paddingTop: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 48,
                      fontWeight: 900,
                      color: "#f4f4f5",
                      lineHeight: 1,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {pctDisplay}%
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: C.text3,
                      marginTop: 2,
                    }}
                  >
                    {cat.label}
                  </div>
                </div>
              </div>
              {/* Amount below gauge */}
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: cat.color,
                  marginTop: 6,
                  letterSpacing: "-0.02em",
                }}
              >
                {formatINRFull(cat.amount)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Thin gradient divider */}
      <div
        style={{
          ...fade(40, 10),
          position: "absolute",
          bottom: 280,
          left: 60,
          right: 60,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${C.amber}60, ${C.violet}60, ${C.blue}60, ${C.orange}60, transparent)`,
          borderRadius: 1,
        }}
      />

      {/* TOTAL ANNUAL label */}
      <div
        style={{
          ...fade(42, 12),
          position: "absolute",
          bottom: 230,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: C.text3,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
          }}
        >
          Total Annual
        </div>
      </div>

      {/* Total amount -- 80px white bold */}
      <div
        style={{
          ...fade(44, 14),
          position: "absolute",
          bottom: 140,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: "#f4f4f5",
            letterSpacing: "-0.05em",
            lineHeight: 1,
          }}
        >
          {"\u20B9"}
          {formatINR(heroValue)}
        </div>
      </div>

      {/* Per Day glass pill */}
      <div
        style={{
          ...fade(55, 12),
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 32px",
            borderRadius: 40,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 600, color: C.text3 }}>
            Per Day
          </span>
          <span
            style={{
              width: 1,
              height: 22,
              background: "rgba(255,255,255,0.1)",
            }}
          />
          <span style={{ fontSize: 22, fontWeight: 900, color: C.amber }}>
            {vehicle.cost_per_day_display}
          </span>
        </div>
      </div>

      {/* Slide counter */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 50,
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
        {String(slideNumber).padStart(2, "0")}/
        {String(totalSlides).padStart(2, "0")}
      </div>
    </AbsoluteFill>
  );
};
