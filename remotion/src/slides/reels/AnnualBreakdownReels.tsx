import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Img,
  Audio,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { PortraitSlideProps } from "../../types";
import { resolveImage } from "../../utils/resolveImage";
import { C } from "../../utils/colors";
import { useCountUp } from "../../utils/animations";
import { formatINR } from "../../utils/format";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";

const CLICK_FRAMES = [0, 6, 14, 30, 38, 46];

/* ---- Bar animation helper ---- */
function useBarHeight(
  frame: number,
  startFrame: number,
  targetHeight: number,
  duration: number = 20
) {
  return interpolate(
    frame,
    [startFrame, startFrame + duration],
    [0, targetHeight],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
}

interface CostCategory {
  key: string;
  label: string;
  amount: number;
  display: string;
  pct: number;
  color: string;
  gradientFrom: string;
  gradientTo: string;
}

export const AnnualBreakdownReels: React.FC<PortraitSlideProps> = ({
  vehicle,
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const annualTotal = vehicle.annual_total || 0;

  // Compute percentages
  const fuelPct = vehicle.fuel_pct || 0;
  const servicePct =
    annualTotal > 0
      ? Math.round((vehicle.annual_service / annualTotal) * 100)
      : 0;
  const insurancePct =
    annualTotal > 0
      ? Math.round((vehicle.annual_insurance / annualTotal) * 100)
      : 0;
  const tyresPct =
    annualTotal > 0
      ? Math.round((vehicle.annual_tyres / annualTotal) * 100)
      : 0;

  const categories: CostCategory[] = [
    {
      key: "fuel",
      label: "Fuel",
      amount: vehicle.annual_fuel,
      display: vehicle.annual_fuel_display,
      pct: fuelPct,
      color: "#f59e0b",
      gradientFrom: "#b45309",
      gradientTo: "#fbbf24",
    },
    {
      key: "service",
      label: "Service",
      amount: vehicle.annual_service,
      display: vehicle.annual_service_display,
      pct: servicePct,
      color: "#4783ff",
      gradientFrom: "#1d4ed8",
      gradientTo: "#60a5fa",
    },
    {
      key: "insurance",
      label: "Insurance",
      amount: vehicle.annual_insurance,
      display: vehicle.annual_insurance_display,
      pct: insurancePct,
      color: "#8b5cf6",
      gradientFrom: "#5b21b6",
      gradientTo: "#a78bfa",
    },
  ];

  // Annualize tyre cost from unit costs (annual_tyres is 0 for year 1 on new bikes)
  const tyreFront = vehicle.tyre_front_cost || 0;
  const tyreRear = vehicle.tyre_rear_cost || 0;
  const tyreLifeKm = vehicle.tyre_life_km || 15000;
  const annualKm = vehicle.assumed_annual_km || 10000;
  const annualTyres = tyreFront + tyreRear > 0
    ? Math.round(((tyreFront + tyreRear) / tyreLifeKm) * annualKm)
    : vehicle.annual_tyres || 0;

  if (annualTyres > 0) {
    const tyreActualPct = annualTotal > 0 ? Math.round((annualTyres / annualTotal) * 100) : 0;
    categories.push({
      key: "tyres",
      label: "Tyres",
      amount: annualTyres,
      display: `\u20B9 ${formatINR(annualTyres)}`,
      pct: tyreActualPct,
      color: "#f97316",
      gradientFrom: "#c2410c",
      gradientTo: "#fb923c",
    });
  }

  // Find max amount for scaling
  const maxAmount = Math.max(...categories.map((c) => c.amount), 1);
  const MAX_BAR_HEIGHT = 520;
  const BAR_WIDTH = 130;
  const BAR_GAP = 28;

  // Fade + slide-up helper
  const fade = (start: number, dur: number = 12): React.CSSProperties => ({
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

  // Hero count-up
  const heroValue = useCountUp(14, 38, annualTotal);
  const assumedKm = vehicle.assumed_annual_km || 10000;

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: C.bg }}>
      {/* Click sounds */}
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Bike hero image -- large, clear, like Slide 1-2 */}
      {vehicle.primary_nobg_url && (
        <Img
          src={resolveImage(vehicle.primary_nobg_url)}
          style={{
            position: "absolute",
            top: 200,
            left: "5%",
            width: "90%",
            height: 480,
            objectFit: "contain",
            objectPosition: "center center",
            filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.7)) drop-shadow(0 0 40px rgba(245,158,11,0.15))",
            zIndex: 2,
            ...fade(0, 15),
          }}
        />
      )}

      {/* Amber glow behind bike */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 500,
          background: "radial-gradient(ellipse, rgba(245,158,11,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Gradient overlay -- gentle fade, keeps bike visible */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 780,
          background: "linear-gradient(to bottom, transparent 50%, rgba(9,9,11,0.3) 62%, rgba(9,9,11,0.75) 76%, #09090b 92%)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />

      {/* Logo -- centered, 2x size, above bike */}
      <div style={{ position: "absolute", top: 72, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 20, pointerEvents: "none" }}>
        <Logo size={72} startFrame={0} />
      </div>

      <SlideCounter current={slideNumber} total={totalSlides} startFrame={0} variant="reels" />

      {/* ---- VEHICLE NAME (below bike, over gradient) ---- */}
      <div
        style={{
          position: "absolute",
          top: 700,
          left: 0,
          right: 0,
          zIndex: 10,
          textAlign: "center",
        }}
      >
        <div
          style={{
            ...fade(5),
            fontSize: 44,
            fontWeight: 900,
            color: C.text1,
            textShadow: "0 2px 20px rgba(0,0,0,0.8)",
          }}
        >
          {vehicle.brand_name} {vehicle.short_name}
        </div>
      </div>

      {/* ---- SECTION HEADER + HERO (compact) ---- */}
      <div
        style={{
          position: "absolute",
          top: 770,
          left: 0,
          right: 0,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ ...fade(8, 8) }}>
          <span
            style={{
              display: "inline-block",
              padding: "8px 24px",
              borderRadius: 50,
              background: "rgba(245,158,11,0.12)",
              border: "1px solid rgba(245,158,11,0.25)",
              fontSize: 18,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: C.amber,
            }}
          >
            Annual Running Cost · {assumedKm.toLocaleString("en-IN")} km/yr
          </span>
        </div>

        {/* Hero amount */}
        <div
          style={{
            marginTop: 12,
            textAlign: "center",
            opacity: interpolate(frame, [14, 20], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
              color: C.amber,
              textShadow: "0 0 60px rgba(245,158,11,0.3), 0 0 30px rgba(245,158,11,0.15)",
            }}
          >
            {"\u20B9"} {formatINR(heroValue)}
            <span style={{ fontSize: 24, fontWeight: 600, color: C.text3, marginLeft: 8 }}>/yr</span>
          </div>
        </div>
      </div>

      {/* ---- VERTICAL BAR CHART (3-row layout) ---- */}
      <div
        style={{
          position: "absolute",
          top: 940,
          left: "10%",
          right: "10%",
          height: MAX_BAR_HEIGHT + 120,
          zIndex: 10,
        }}
      >
        {/* Values row -- fixed at top */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: BAR_GAP,
            padding: "0 20px",
            width: "100%",
            position: "absolute",
            top: 0,
          }}
        >
          {categories.map((cat, i) => {
            const barStart = 30 + i * 4;
            const valueFade = interpolate(
              frame,
              [barStart + 14, barStart + 22],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <div
                key={cat.key}
                style={{
                  width: BAR_WIDTH,
                  textAlign: "center",
                  fontSize: 22,
                  fontWeight: 900,
                  color: cat.color,
                  opacity: valueFade,
                  whiteSpace: "nowrap",
                  textShadow: `0 0 20px ${cat.color}40`,
                }}
              >
                {cat.display}
              </div>
            );
          })}
        </div>

        {/* Bars row -- anchored to bottom */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: BAR_GAP,
            padding: "0 20px",
            width: "100%",
            position: "absolute",
            bottom: 70,
          }}
        >
          {categories.map((cat, i) => {
            const targetHeight = Math.max((cat.amount / maxAmount) * (MAX_BAR_HEIGHT - 80), 44);
            const barStart = 30 + i * 4;
            const animatedHeight = useBarHeight(frame, barStart, targetHeight, 20);
            return (
              <div
                key={cat.key}
                style={{
                  width: BAR_WIDTH,
                  height: animatedHeight,
                  borderRadius: "12px 12px 4px 4px",
                  background: `linear-gradient(to top, ${cat.gradientFrom}, ${cat.gradientTo})`,
                  boxShadow: `0 0 30px ${cat.color}25, inset 0 1px 0 rgba(255,255,255,0.15)`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Glossy highlight */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "40%",
                    background:
                      "linear-gradient(to bottom, rgba(255,255,255,0.12), transparent)",
                    borderRadius: "12px 12px 0 0",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Labels row -- fixed at bottom */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: BAR_GAP,
            padding: "0 20px",
            width: "100%",
            position: "absolute",
            bottom: 0,
          }}
        >
          {categories.map((cat, i) => {
            const barStart = 30 + i * 4;
            const valueFade = interpolate(
              frame,
              [barStart + 14, barStart + 22],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <div
                key={cat.key}
                style={{
                  width: BAR_WIDTH,
                  textAlign: "center",
                  opacity: valueFade,
                }}
              >
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: C.text2,
                  }}
                >
                  {cat.label}
                </div>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 4,
                    padding: "2px 12px",
                    borderRadius: 50,
                    fontSize: 18,
                    fontWeight: 800,
                    background: `${cat.color}1A`,
                    color: cat.color,
                  }}
                >
                  {cat.pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---- FOOTER ---- */}
      <div
        style={{
          position: "absolute",
          top: 1600,
          left: 0,
          right: 0,
          zIndex: 10,
          textAlign: "center",
          ...fade(50, 12),
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: C.text4,
          }}
        >
          Year 1 Baseline {"\u00B7"}{" "}
          {assumedKm.toLocaleString("en-IN")} km/year
        </div>
      </div>

      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
