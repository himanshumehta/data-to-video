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
 * Option H -- "Single Donut Ring + Stats"
 *
 * Logo centered. Bike image 280px. Vehicle name two lines: brand 36px white,
 * short name 54px amber. ONE large donut ring (380px, stroke 24px) with
 * 4 colored arc segments proportional to percentage. Total in center 60px
 * bold white, "per year" 18px dim. Below ring: 2x2 stat grid with colored
 * dot + category 20px + amount 28px bold colored + percentage 16px dim.
 * "Per Day" glass pill at bottom.
 */

const BG = "#0c0e14";

interface CostCategory {
  key: string;
  label: string;
  amount: number;
  pct: number;
  color: string;
}

// Full donut ring with 4 colored arc segments
const DonutRing: React.FC<{
  size: number;
  categories: CostCategory[];
  fillProgress: number;
  opacity: number;
  centerContent: React.ReactNode;
}> = ({ size, categories, fillProgress, opacity, centerContent }) => {
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const centerXY = size / 2;

  // Build segment data: each segment follows the previous
  let accumulatedPct = 0;
  const segments = categories.map((cat) => {
    const segmentLength = (cat.pct / 100) * circumference * fillProgress;
    const gapLength = circumference - segmentLength;
    const offset = -(accumulatedPct / 100) * circumference;
    accumulatedPct += cat.pct;
    return { ...cat, segmentLength, gapLength, offset };
  });

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        opacity,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <circle
          cx={centerXY}
          cy={centerXY}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />

        {/* Colored arc segments */}
        {segments.map((seg) => (
          <React.Fragment key={seg.key}>
            {/* Glow layer */}
            <circle
              cx={centerXY}
              cy={centerXY}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth + 16}
              strokeDasharray={`${seg.segmentLength} ${seg.gapLength}`}
              strokeDashoffset={seg.offset}
              strokeLinecap="butt"
              transform={`rotate(-90, ${centerXY}, ${centerXY})`}
              opacity={0.06}
            />
            {/* Main arc */}
            <circle
              cx={centerXY}
              cy={centerXY}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.segmentLength} ${seg.gapLength}`}
              strokeDashoffset={seg.offset}
              strokeLinecap="butt"
              transform={`rotate(-90, ${centerXY}, ${centerXY})`}
              style={{ filter: `drop-shadow(0 0 8px ${seg.color}40)` }}
            />
          </React.Fragment>
        ))}

        {/* Gap lines between segments for visual separation */}
        {(() => {
          let pctAcc = 0;
          return segments.map((seg, i) => {
            if (i === 0) {
              pctAcc += seg.pct;
              return null;
            }
            const angle = ((pctAcc / 100) * 360 - 90) * (Math.PI / 180);
            pctAcc += seg.pct;
            const innerR = radius - strokeWidth / 2 - 1;
            const outerR = radius + strokeWidth / 2 + 1;
            return (
              <line
                key={`gap-${i}`}
                x1={centerXY + Math.cos(angle) * innerR}
                y1={centerXY + Math.sin(angle) * innerR}
                x2={centerXY + Math.cos(angle) * outerR}
                y2={centerXY + Math.sin(angle) * outerR}
                stroke={BG}
                strokeWidth={2}
              />
            );
          });
        })()}
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
        }}
      >
        {centerContent}
      </div>
    </div>
  );
};

export const OptionH: React.FC<PortraitSlideProps> = ({
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

  const heroValue = useCountUp(18, 50, annualTotal);

  // Ring fill animation
  const ringFill = interpolate(frame, [15, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Ring fade in
  const ringOpacity = interpolate(frame, [10, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Card stagger
  const cardOpacity = (index: number) =>
    interpolate(frame, [40 + index * 4, 52 + index * 4], [0, 1], {
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

  const RING_SIZE = 380;
  const STAT_GAP = 20;

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

      {/* Bike image 280px */}
      {vehicle.primary_nobg_url && (
        <div
          style={{
            ...fade(2, 16),
            position: "absolute",
            top: 110,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Img
            src={vehicle.primary_nobg_url}
            style={{
              height: 280,
              objectFit: "contain",
              filter: "drop-shadow(0 24px 50px rgba(0,0,0,0.6))",
            }}
          />
        </div>
      )}

      {/* Vehicle name -- two lines */}
      <div
        style={{
          ...fade(5, 12),
          position: "absolute",
          top: 400,
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

      {/* Large donut ring */}
      <div
        style={{
          position: "absolute",
          top: 530,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <DonutRing
          size={RING_SIZE}
          categories={categories}
          fillProgress={ringFill}
          opacity={ringOpacity}
          centerContent={
            <>
              <div
                style={{
                  fontSize: 60,
                  fontWeight: 900,
                  color: "#f4f4f5",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                {"\u20B9"}
                {formatINR(heroValue)}
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: C.text3,
                  marginTop: 6,
                }}
              >
                per year
              </div>
            </>
          }
        />
      </div>

      {/* 2x2 stat grid below ring */}
      <div
        style={{
          position: "absolute",
          top: 930,
          left: "50%",
          transform: "translateX(-50%)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: STAT_GAP,
          width: RING_SIZE + 60,
        }}
      >
        {categories.map((cat, i) => {
          const opacity = cardOpacity(i);
          const pctDisplay = Math.round(cat.pct * ringFill);

          return (
            <div
              key={cat.key}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                opacity,
                transform: `translateY(${(1 - opacity) * 12}px)`,
              }}
            >
              {/* Colored dot + category name */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: cat.color,
                    boxShadow: `0 0 8px ${cat.color}40`,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: C.text2,
                  }}
                >
                  {cat.label}
                </span>
              </div>

              {/* Amount + percentage */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, paddingLeft: 18 }}>
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: cat.color,
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {formatINRFull(cat.amount)}
                </span>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: C.text4,
                  }}
                >
                  {pctDisplay}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Per Day glass pill at bottom */}
      <div
        style={{
          ...fade(58, 12),
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
