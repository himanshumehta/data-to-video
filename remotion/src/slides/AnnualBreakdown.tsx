import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Audio, Sequence, staticFile } from "remotion";
import { SlideProps } from "../types";
import { C } from "../utils/colors";
import { Logo } from "../components/Logo";
import { Watermark } from "../components/Watermark";
import { SlideBackground } from "../components/SlideBackground";
import { BikeImage } from "../components/BikeImage";
import { formatINRShort } from "../utils/format";

interface CategoryCard {
  label: string;
  value: string;
  pctLabel: string;
  pct: number;
  tagline: string;
  color: string;
}

const CLICK_FRAMES = [5, 10, 15, 40, 50, 60, 70, 80];

export const AnnualBreakdown: React.FC<SlideProps> = ({ vehicle }) => {
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

  const yr1 = (vehicle.yearly_breakdown || []).find((y) => y.year === 1);
  const annualTotal = vehicle.annual_total || (yr1 ? yr1.total : 0);
  const fuelPct = vehicle.fuel_pct || 0;
  const servicePct = annualTotal > 0 ? Math.round((vehicle.annual_service / annualTotal) * 100) : 0;
  const tyresPct = annualTotal > 0 ? Math.round((vehicle.annual_tyres / annualTotal) * 100) : 0;
  const insPct = annualTotal > 0 ? Math.round((vehicle.annual_insurance / annualTotal) * 100) : 0;

  const categories: CategoryCard[] = [
    {
      label: "Fuel",
      value: vehicle.annual_fuel_display,
      pctLabel: `${fuelPct}%`,
      pct: fuelPct,
      tagline: "LARGEST SHARE",
      color: C.amber,
    },
    {
      label: "Service",
      value: vehicle.annual_service_display,
      pctLabel: `${servicePct}%`,
      pct: servicePct,
      tagline: "GROWS FASTEST",
      color: C.blue,
    },
    {
      label: "Tyres",
      value: `\u20B9 ${vehicle.annual_tyres.toLocaleString("en-IN")}`,
      pctLabel: `${tyresPct}%`,
      pct: tyresPct,
      tagline: "EVERY 2 YRS",
      color: C.orange,
    },
    {
      label: "Insurance",
      value: vehicle.annual_insurance_display,
      pctLabel: `${insPct}%`,
      pct: insPct,
      tagline: "DROPS YEARLY",
      color: C.violet,
    },
  ];

  const years10 = (vehicle.yearly_breakdown || []).filter((y) => y.year <= 10);
  const maxYearTotal = Math.max(...years10.map((y) => y.total), 1);

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground />

      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={i} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      <div style={{ position: "absolute", top: 70, right: 130, zIndex: 20 }}>
        <Logo size={80} startFrame={0} />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "90%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "150px 0 120px 160px",
          height: "100%",
        }}
      >
        {/* Top: header + hero */}
        <div>
          <div style={{ ...fade(5, 15), fontSize: 66, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.3em", color: C.text4, marginBottom: 16, whiteSpace: "nowrap" }}>
            Annual Breakdown
          </div>
          <div style={{ ...fade(10, 20), fontSize: 135, fontWeight: 900, lineHeight: 1.05, color: C.text1, marginBottom: 24, whiteSpace: "nowrap" }}>
            What You Pay Every Year
          </div>
          <div style={{ ...fade(15, 20), display: "flex", alignItems: "baseline", gap: 24 }}>
            <span style={{ fontSize: 240, fontWeight: 900, color: C.blue, letterSpacing: -4, whiteSpace: "nowrap" }}>
              {formatINRShort(annualTotal)}
            </span>
            <span style={{ fontSize: 78, fontWeight: 700, color: C.text3, whiteSpace: "nowrap" }}>/year</span>
          </div>
        </div>

        {/* Cards */}
        <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 28,
            }}
          >
            {categories.map((cat, i) => {
              const cardStart = 40 + i * 10;
              return (
                <div
                  key={cat.label}
                  style={{
                    ...fade(cardStart, 20),
                    background: "rgba(255,255,255,0.04)",
                    border: "2px solid rgba(255,255,255,0.08)",
                    borderTop: `6px solid ${cat.color}`,
                    borderRadius: 24,
                    padding: "44px 52px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 78, fontWeight: 900, color: C.text1, whiteSpace: "nowrap" }}>{cat.label}</div>
                    <div style={{ fontSize: 108, fontWeight: 900, color: cat.color, whiteSpace: "nowrap" }}>{cat.pctLabel}</div>
                  </div>
                  <div style={{ fontSize: 90, fontWeight: 900, color: C.text1, whiteSpace: "nowrap" }}>{cat.value}</div>
                  <div style={{ fontSize: 48, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", color: C.text4, whiteSpace: "nowrap" }}>
                    {cat.tagline}
                  </div>
                  <div style={{ height: 14, background: "rgba(255,255,255,0.05)", borderRadius: 7, overflow: "hidden", marginTop: 6 }}>
                    <div
                      style={{
                        width: `${interpolate(frame, [cardStart + 10, cardStart + 40], [0, cat.pct], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}%`,
                        height: "100%",
                        background: cat.color,
                        borderRadius: 7,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

        {/* Bottom: 10-year trend */}
        <div style={{ ...fade(80, 15) }}>
            <div style={{ fontSize: 54, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: C.text4, marginBottom: 24, whiteSpace: "nowrap" }}>
              10-Year Cost Trend
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 280 }}>
              {years10.map((yr, i) => {
                const barStart = 85 + i * 3;
                const grow = interpolate(frame, [barStart, barStart + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const h = (yr.total / maxYearTotal) * 240 * grow;
                const hasOh = (yr.overhauls || 0) > 0;
                return (
                  <div key={yr.year} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                    <div style={{ width: "100%", height: h, background: hasOh ? `linear-gradient(180deg, ${C.orange}ee, ${C.orange})` : `linear-gradient(180deg, rgba(71,131,255,0.9), rgba(37,99,235,1))`, borderRadius: "6px 6px 0 0" }} />
                    <div style={{ fontSize: 45, fontWeight: 800, color: hasOh ? C.orange : C.text3, whiteSpace: "nowrap" }}>Y{yr.year}</div>
                  </div>
                );
              })}
            </div>
          </div>
      </div>

      <BikeImage
        src={vehicle.primary_nobg_url}
        opacity={0.25}
        width="38%"
        startFrame={10}
      />

      <Watermark />
    </AbsoluteFill>
  );
};
