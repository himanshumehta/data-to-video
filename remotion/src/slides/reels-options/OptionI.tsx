import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Img,
  staticFile,
} from "remotion";
import { PortraitSlideProps } from "../../types";
import { useCountUp } from "../../utils/animations";
import { formatINR } from "../../utils/format";

const CATEGORIES = [
  { key: "fuel", label: "Fuel", color: "#FF6B35" },
  { key: "insurance", label: "Insurance", color: "#4ECDC4" },
  { key: "service", label: "Service", color: "#A855F7" },
  { key: "tyres", label: "Tyres", color: "#F59E0B" },
] as const;

/** 270-degree arc gauge */
const Gauge: React.FC<{
  size: number;
  percentage: number;
  color: string;
  frame: number;
  startFrame: number;
}> = ({ size, percentage, color, frame, startFrame }) => {
  const r = 85;
  const circumference = 2 * Math.PI * r;
  const arcLength = circumference * 0.75;
  const gapLength = circumference * 0.25;
  const progress = interpolate(frame, [startFrame, startFrame + 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const filled = (percentage / 100) * arcLength * progress;

  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <circle
        cx={100} cy={100} r={r}
        fill="none" stroke="#23232f" strokeWidth={14}
        strokeDasharray={`${arcLength} ${gapLength}`}
        strokeDashoffset={-gapLength / 2}
        strokeLinecap="round"
      />
      <circle
        cx={100} cy={100} r={r}
        fill="none" stroke={color} strokeWidth={14}
        strokeDasharray={`${filled} ${circumference - filled}`}
        strokeDashoffset={-gapLength / 2}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 8px ${color}50)` }}
      />
    </svg>
  );
};

export const OptionI: React.FC<PortraitSlideProps> = ({
  vehicle,
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();

  const fade = (start: number, dur = 12) => ({
    opacity: interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    transform: `translateY(${interpolate(frame, [start, start + dur], [20, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })}px)`,
  });

  const annualTotal = vehicle.annual_total || 0;
  const fuelPct = vehicle.fuel_pct || 47;
  const servicePct = annualTotal > 0 ? Math.round((vehicle.annual_service / annualTotal) * 100) : 17;
  const insurancePct = annualTotal > 0 ? Math.round((vehicle.annual_insurance / annualTotal) * 100) : 25;
  const tyresPct = annualTotal > 0 ? Math.round((vehicle.annual_tyres / annualTotal) * 100) : 12;

  const gaugeData = [
    { pct: fuelPct, amount: vehicle.annual_fuel || 0, ...CATEGORIES[0] },
    { pct: insurancePct, amount: vehicle.annual_insurance || 0, ...CATEGORIES[1] },
    { pct: servicePct, amount: vehicle.annual_service || 0, ...CATEGORIES[2] },
    { pct: tyresPct, amount: vehicle.annual_tyres || 0, ...CATEGORIES[3] },
  ];

  const countedTotal = useCountUp(20, 45, annualTotal);

  return (
    <AbsoluteFill style={{ background: "#0a0a12", fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      {/* Subtle radial center glow */}
      <div
        style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 1400, height: 1400,
          background: "radial-gradient(circle, rgba(20,25,50,0.6) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Safe zone */}
      <div
        style={{
          position: "absolute",
          top: "8%", bottom: "8%", left: "6%", right: "8%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Logo with glassmorphic oval backdrop — 32→38 */}
        <div style={{ position: "relative", ...fade(0, 8) }}>
          <div
            style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: 220, height: 72,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              filter: "blur(8px)",
              pointerEvents: "none",
            }}
          />
          <Img
            src={staticFile("logo.png")}
            style={{ height: 38, position: "relative", zIndex: 1 }}
          />
        </div>

        {/* Subtitle — 18→22 */}
        <div
          style={{
            fontFamily: "'Work Sans', 'Inter', sans-serif",
            fontWeight: 400,
            fontSize: 22,
            color: "#555",
            letterSpacing: 2.4,
            marginTop: 8,
            ...fade(2, 8),
          }}
        >
          ANNUAL RUNNING COST
        </div>

        {/* Bike Image — 500→600 */}
        {vehicle.primary_nobg_url && (
          <div style={{ position: "relative", width: 600, marginTop: 8, ...fade(3, 12) }}>
            <div
              style={{
                position: "absolute",
                bottom: -24, left: "50%",
                transform: "translateX(-50%)",
                width: 360, height: 72,
                background: "radial-gradient(ellipse, rgba(255,107,53,0.12) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <Img
              src={vehicle.primary_nobg_url}
              style={{ width: "100%", height: "auto", position: "relative", zIndex: 1 }}
            />
          </div>
        )}

        {/* Bike Name — 40→48 */}
        <div style={{ fontSize: 48, fontWeight: 700, color: "#fff", marginTop: 14, ...fade(8, 10) }}>
          {vehicle.brand_name} {vehicle.short_name}
        </div>

        {/* Total label — 18→22 */}
        <div style={{ fontSize: 22, fontWeight: 400, color: "#555", letterSpacing: 1.8, marginTop: 4, ...fade(12, 8) }}>
          TOTAL ANNUAL COST
        </div>
        {/* Total amount — 82→98 */}
        <div
          style={{
            fontFamily: "'Big Shoulders Display', 'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 98,
            color: "#fff",
            lineHeight: 1,
            marginTop: 2,
            ...fade(15, 10),
          }}
        >
          {"\u20B9"}{formatINR(countedTotal).replace("₹", "").trim()}
        </div>

        {/* 2x2 Gauge Grid — gauges 200→240, gap 12/40→14/48 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px 48px",
            width: "100%",
            flex: 1,
            alignContent: "center",
            marginTop: 24,
          }}
        >
          {gaugeData.map((g, i) => {
            const gaugeStart = 25 + i * 5;
            const gaugeFade = fade(gaugeStart, 12);
            return (
              <div
                key={g.key}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  ...gaugeFade,
                }}
              >
                <div style={{ width: 240, height: 240, position: "relative" }}>
                  <Gauge
                    size={240}
                    percentage={g.pct}
                    color={g.color}
                    frame={frame}
                    startFrame={gaugeStart}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "50%", left: "50%",
                      transform: "translate(-50%, -50%)",
                      textAlign: "center",
                    }}
                  >
                    {/* Pct — 46→55 */}
                    <div
                      style={{
                        fontFamily: "'Big Shoulders Display', 'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: 55,
                        color: "#fff",
                        lineHeight: 1.1,
                      }}
                    >
                      {Math.round(g.pct * interpolate(frame, [gaugeStart, gaugeStart + 25], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      }))}%
                    </div>
                    {/* Category — 18→22 */}
                    <div style={{ fontSize: 22, fontWeight: 400, color: "#888" }}>
                      {g.label}
                    </div>
                  </div>
                </div>
                {/* Amount — 24→29 */}
                <div style={{ fontSize: 29, fontWeight: 700, color: g.color, marginTop: -2 }}>
                  {"\u20B9"}{formatINR(g.amount).replace("₹", "").trim()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Per Day Pill — padding 10/28→12/34, label 19→23, value 23→28 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 36,
            padding: "12px 34px",
            borderRadius: 28,
            background: "rgba(255,107,53,0.08)",
            border: "1px solid rgba(255,107,53,0.3)",
            marginTop: 14,
            ...fade(50, 10),
          }}
        >
          <span style={{ fontSize: 23, fontWeight: 400, color: "#888" }}>Per Day</span>
          <span style={{ fontSize: 28, fontWeight: 700, color: "#FF6B35" }}>
            {vehicle.cost_per_day_display || "\u20B9352"}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
