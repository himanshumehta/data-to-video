import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Audio, Sequence, staticFile } from "remotion";
import { SlideProps } from "../types";
import { C } from "../utils/colors";
import { Logo } from "../components/Logo";
import { Watermark } from "../components/Watermark";
import { SlideBackground } from "../components/SlideBackground";
import { BikeImage } from "../components/BikeImage";
import { formatINRShort } from "../utils/format";
import { useCountUp } from "../utils/animations";

// accent, title, hero, divider, chart-header, bar-chart, badges
const CLICK_FRAMES = [5, 10, 15, 35, 40, 45, 90];

export const IntroHook: React.FC<SlideProps> = ({ vehicle }) => {
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

  const countedCost = useCountUp(10, 40, vehicle.net_5yr);
  const years10 = (vehicle.yearly_breakdown || []).filter((y) => y.year <= 10);
  const maxYearTotal = Math.max(...years10.map((y) => y.total), 1);

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground />

      {/* Click sounds on each element transition */}
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={i} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Logo top-right */}
      <div style={{ position: "absolute", top: 70, right: 130, zIndex: 20 }}>
        <Logo size={80} startFrame={0} />
      </div>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "150px 160px 120px 160px",
          height: "100%",
        }}
      >
        {/* Top block: label + title + hero */}
        <div>
          {/* Accent strip */}
          <div
            style={{
              ...fade(5, 15),
              fontSize: 44,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              color: C.text4,
              marginBottom: 16,
            }}
          >
            What Happens After You Buy
          </div>

          {/* Title */}
          <div
            style={{
              ...fade(10, 20),
              fontSize: 90,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: -2,
              marginBottom: 50,
            }}
          >
            <span style={{ color: C.text1 }}>
              {vehicle.brand_name} {vehicle.short_name}
            </span>
            <span style={{ color: C.text4, fontWeight: 700 }}> · Ownership Cost</span>
          </div>

          {/* Hero price */}
          <div style={{ ...fade(15, 25), display: "flex", alignItems: "baseline", gap: 48 }}>
            <div
              style={{
                fontSize: 260,
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: -8,
                color: C.blue,
                textShadow: "0 0 120px rgba(71,131,255,0.2), 0 4px 0 rgba(0,0,0,0.3)",
              }}
            >
              {formatINRShort(countedCost)}
            </div>
            <div style={{ fontSize: 56, fontWeight: 700, color: C.text4, lineHeight: 1.35, paddingBottom: 30 }}>
              {vehicle.price_formatted} buys it —{" "}
              <strong style={{ color: C.text2, fontWeight: 900 }}>
                this is what it costs to own
              </strong>
            </div>
          </div>
        </div>

        {/* Chart fills bottom */}
        <>
            {/* Divider */}
            <div
              style={{
                ...fade(35, 15),
                height: 2,
                background:
                  "linear-gradient(90deg, rgba(71,131,255,0.25) 0%, rgba(255,255,255,0.05) 50%, rgba(245,158,11,0.15) 100%)",
              }}
            />

            {/* Chart header + legend */}
            <div
              style={{
                ...fade(40, 15),
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  color: C.text3,
                }}
              >
                Year-by-Year Cost Progression
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "28px 40px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 64, fontWeight: 700, color: "#ffffff" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, flexShrink: 0, background: "#3b82f6" }} />
                  Base running cost
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 64, fontWeight: 700, color: "#ffffff" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, flexShrink: 0, background: C.orange }} />
                  Overhaul / major service
                </div>
              </div>
            </div>

            {/* Bar chart — large */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 24, height: 560, ...fade(45, 5) }}>
              {years10.map((yr, i) => {
                const barStart = 50 + i * 4;
                const growProgress = interpolate(
                  frame,
                  [barStart, barStart + 30],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );
                const totalH = (yr.total / maxYearTotal) * 500 * growProgress;
                const ohAmount = yr.overhauls || 0;
                const ohH = ohAmount > 0 ? (ohAmount / maxYearTotal) * 500 * growProgress : 0;
                const baseH = totalH - ohH;
                const hasOh = ohAmount > 0;

                return (
                  <div
                    key={yr.year}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 10,
                      height: "100%",
                      justifyContent: "flex-end",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                      {hasOh && (
                        <div
                          style={{
                            width: "100%",
                            height: ohH,
                            background: `linear-gradient(180deg, rgba(249,115,22,0.95), rgba(234,88,12,1))`,
                            borderRadius: "8px 8px 0 0",
                          }}
                        />
                      )}
                      <div
                        style={{
                          width: "100%",
                          height: Math.max(baseH, 0),
                          background: `linear-gradient(180deg, rgba(71,131,255,0.9), rgba(37,99,235,1))`,
                          borderRadius: hasOh ? 0 : "8px 8px 0 0",
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 52, fontWeight: 900, color: hasOh ? C.orange : C.text1, letterSpacing: -1, whiteSpace: "nowrap" }}>
                      {formatINRShort(yr.total)}
                    </div>
                    <div style={{ fontSize: 44, fontWeight: 800, color: C.text3, whiteSpace: "nowrap" }}>
                      Yr {yr.year}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom badges */}
            <div style={{ ...fade(90, 20), display: "flex", gap: 32, justifyContent: "center" }}>
              <div style={{ padding: "28px 60px", borderRadius: 16, fontSize: 52, fontWeight: 900, background: "rgba(239,68,68,0.08)", border: `3px solid rgba(239,68,68,0.22)`, color: C.red }}>
                {vehicle.multiplier}x Purchase Price
              </div>
              <div style={{ padding: "28px 60px", borderRadius: 16, fontSize: 52, fontWeight: 900, background: "rgba(249,115,22,0.08)", border: `3px solid rgba(249,115,22,0.22)`, color: C.orange }}>
                {vehicle.cost_per_day_display}/day
              </div>
              <div style={{ padding: "28px 60px", borderRadius: 16, fontSize: 52, fontWeight: 900, background: "rgba(59,130,246,0.08)", border: `3px solid rgba(59,130,246,0.22)`, color: "#3b82f6" }}>
                ₹ {vehicle.cost_per_km.toFixed(2)}/km
              </div>
            </div>
        </>
      </div>

      <BikeImage
        src={vehicle.primary_nobg_url}
        opacity={0.3}
        width="38%"
        startFrame={40}
      />

      <Watermark />
    </AbsoluteFill>
  );
};
