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
 * Option D -- "Horizontal Waterfall"
 *
 * Full-width horizontal bars stacked vertically, each bar's WIDTH
 * proportional to its cost. Bars are thick (120px) with rounded corners.
 * Above: bike + total. Below: per-day cost. Simple, impactful, easy to read.
 */

interface CostCategory {
  key: string;
  label: string;
  amount: number;
  pct: number;
  color: string;
}

export const OptionD: React.FC<PortraitSlideProps> = ({
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
    { key: "fuel", label: "Fuel", amount: vehicle.annual_fuel, pct: fuelPct, color: C.amber },
    { key: "service", label: "Service", amount: vehicle.annual_service, pct: servicePct, color: C.blue },
    { key: "insurance", label: "Insurance", amount: vehicle.annual_insurance, pct: insurancePct, color: C.violet },
  ];
  if (vehicle.annual_tyres > 0) {
    categories.push({ key: "tyres", label: "Tyres", amount: vehicle.annual_tyres, pct: tyresPct, color: C.orange });
  }

  // Sort by amount descending -- biggest bar on top
  const sorted = [...categories].sort((a, b) => b.amount - a.amount);

  const heroValue = useCountUp(12, 38, annualTotal);

  // Bar animation: grow width from 0
  const barGrow = (index: number) => {
    const start = 25 + index * 8;
    return interpolate(frame, [start, start + 25], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  };

  // Fade helpers
  const fade = (start: number, dur = 15) => ({
    opacity: interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    transform: `translateY(${interpolate(frame, [start, start + dur], [20, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })}px)`,
  });

  // Available bar width (screen - padding)
  const MAX_BAR_WIDTH = 1080 - 120; // 60px padding each side
  const maxPct = Math.max(...sorted.map((c) => c.pct), 1);

  const BAR_HEIGHT = 120;
  const BAR_GAP = 24;
  const BARS_TOP = 860;

  return (
    <AbsoluteFill
      style={{
        fontFamily: "Inter, sans-serif",
        background: C.bg,
      }}
    >
      {/* Subtle grid pattern background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <div style={{ position: "absolute", top: 60, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Logo size={24} startFrame={0} />
      </div>

      {/* Tag */}
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
            fontSize: 14,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: C.text4,
          }}
        >
          Annual Running Cost
        </span>
      </div>

      {/* Bike image */}
      {vehicle.primary_nobg_url && (
        <div
          style={{
            ...fade(3, 15),
            position: "absolute",
            top: 180,
            left: "50%",
            transform: `translateX(-50%) translateY(${interpolate(frame, [3, 18], [30, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}px)`,
          }}
        >
          <Img
            src={vehicle.primary_nobg_url}
            style={{
              height: 350,
              objectFit: "contain",
              filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.7))",
            }}
          />
        </div>
      )}

      {/* Vehicle name */}
      <div
        style={{
          ...fade(6, 10),
          position: "absolute",
          top: 550,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 900, color: C.text1 }}>
          {vehicle.brand_name} {vehicle.short_name}
        </div>
      </div>

      {/* Hero total */}
      <div
        style={{
          position: "absolute",
          top: 610,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: interpolate(frame, [10, 25], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: C.amber,
            letterSpacing: "-0.06em",
            lineHeight: 1,
            textShadow: "0 0 60px rgba(245,158,11,0.2)",
          }}
        >
          {"\u20B9"}{formatINR(heroValue)}
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: C.text3,
            marginTop: 8,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          per year
        </div>
      </div>

      {/* Thin divider */}
      <div
        style={{
          position: "absolute",
          top: BARS_TOP - 30,
          left: 60,
          right: 60,
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
          opacity: interpolate(frame, [22, 30], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />

      {/* Horizontal bars */}
      {sorted.map((cat, i) => {
        const growth = barGrow(i);
        const barWidth = (cat.pct / maxPct) * MAX_BAR_WIDTH;
        const y = BARS_TOP + i * (BAR_HEIGHT + BAR_GAP);
        const textOpacity = interpolate(frame, [30 + i * 8, 40 + i * 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div key={cat.key}>
            {/* Bar background track */}
            <div
              style={{
                position: "absolute",
                top: y,
                left: 60,
                width: MAX_BAR_WIDTH,
                height: BAR_HEIGHT,
                borderRadius: 20,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            />

            {/* Filled bar */}
            <div
              style={{
                position: "absolute",
                top: y,
                left: 60,
                width: barWidth * growth,
                height: BAR_HEIGHT,
                borderRadius: 20,
                background: cat.color,
                overflow: "hidden",
              }}
            >
              {/* Inner gradient for depth */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)",
                  borderRadius: 20,
                }}
              />
            </div>

            {/* Labels on top of bar */}
            <div
              style={{
                position: "absolute",
                top: y,
                left: 60,
                width: MAX_BAR_WIDTH,
                height: BAR_HEIGHT,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 28px",
                pointerEvents: "none",
                opacity: textOpacity,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: "#fff",
                    textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                  }}
                >
                  {cat.label}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.6)",
                    textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                  }}
                >
                  {cat.pct}%
                </div>
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  color: "#fff",
                  textShadow: "0 2px 12px rgba(0,0,0,0.5)",
                }}
              >
                {formatINRFull(cat.amount)}
              </div>
            </div>
          </div>
        );
      })}

      {/* Daily cost at bottom */}
      <div
        style={{
          ...fade(60, 15),
          position: "absolute",
          bottom: 160,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            padding: "20px 48px",
            borderRadius: 100,
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.15)",
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 600, color: C.text3 }}>Per Day</span>
          <span style={{ fontSize: 36, fontWeight: 900, color: C.amber }}>
            {vehicle.cost_per_day_display}
          </span>
        </div>
      </div>

      {/* Slide counter */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 60,
          fontSize: 14,
          fontWeight: 700,
          color: C.text4,
          opacity: interpolate(frame, [0, 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {slideNumber}/{totalSlides}
      </div>
    </AbsoluteFill>
  );
};
