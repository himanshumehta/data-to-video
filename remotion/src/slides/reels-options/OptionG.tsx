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
 * Option G -- "Compact Gauges + Big Total"
 *
 * Logo centered. Vehicle name two lines: brand white 36px, short name amber
 * 54px. Small bike image 200px. Four gauges in a 2x2 grid, larger (240px),
 * tighter gap (24px). Percentage 56px bold white, category 20px dim, amount
 * 30px colored. No divider -- straight to total. Hero number 120px amber bold.
 * "TOTAL ANNUAL RUNNING COST" 20px dim. Per day at 32px.
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

export const OptionG: React.FC<PortraitSlideProps> = ({
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

  const heroValue = useCountUp(42, 68, annualTotal);

  // Gauge fill animation
  const gaugeFill = interpolate(frame, [18, 48], [0, 1], {
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

  const GAUGE_SIZE = 240;
  const GRID_GAP = 24;

  return (
    <AbsoluteFill
      style={{
        fontFamily: "Inter, sans-serif",
        background: BG,
      }}
    >
      {/* Logo centered */}
      <div
        style={{
          position: "absolute",
          top: 44,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Logo size={36} startFrame={0} />
      </div>

      {/* Vehicle name -- two lines */}
      <div
        style={{
          ...fade(2, 12),
          position: "absolute",
          top: 118,
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

      {/* Small bike image 200px */}
      {vehicle.primary_nobg_url && (
        <div
          style={{
            ...fade(4, 16),
            position: "absolute",
            top: 230,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Img
            src={vehicle.primary_nobg_url}
            style={{
              height: 200,
              objectFit: "contain",
              filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.5))",
            }}
          />
        </div>
      )}

      {/* 2x2 Gauge Grid -- larger gauges, tighter gap */}
      <div
        style={{
          position: "absolute",
          top: 460,
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
            [10 + i * 4, 22 + i * 4],
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
              {/* Gauge SVG */}
              <div style={{ position: "relative" }}>
                <Gauge
                  size={GAUGE_SIZE}
                  percentage={cat.pct}
                  color={cat.color}
                  strokeWidth={14}
                  frame={frame}
                  startFrame={14 + i * 4}
                />
                {/* Content inside gauge */}
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
                    paddingTop: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 56,
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
                      fontSize: 20,
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
                  fontSize: 30,
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

      {/* Hero total -- 120px amber bold, no divider */}
      <div
        style={{
          ...fade(44, 16),
          position: "absolute",
          bottom: 150,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: C.amber,
            letterSpacing: "-0.05em",
            lineHeight: 1,
          }}
        >
          {"\u20B9"}
          {formatINR(heroValue)}
        </div>
      </div>

      {/* TOTAL ANNUAL RUNNING COST -- 20px dim */}
      <div
        style={{
          ...fade(48, 12),
          position: "absolute",
          bottom: 112,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: C.text3,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
          }}
        >
          Total Annual Running Cost
        </div>
      </div>

      {/* Per day at 32px */}
      <div
        style={{
          ...fade(54, 12),
          position: "absolute",
          bottom: 50,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: 32,
            fontWeight: 900,
            color: "#f4f4f5",
            letterSpacing: "-0.02em",
          }}
        >
          {vehicle.cost_per_day_display}
        </span>
        <span
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: C.text3,
            marginLeft: 8,
          }}
        >
          / day
        </span>
      </div>

      {/* Slide counter */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
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
