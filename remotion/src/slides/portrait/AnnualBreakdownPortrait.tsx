import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Img,
  spring,
  useVideoConfig,
  Audio,
  Sequence,
  staticFile,
} from "remotion";
import { PortraitSlideProps } from "../../types";
import { C } from "../../utils/colors";
import { useCountUp } from "../../utils/animations";
import { formatINR } from "../../utils/format";
import { SlideBackground } from "../../components/SlideBackground";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";
import { SafeZone } from "../../components/SafeZone";

const CLICK_FRAMES = [0, 4, 12, 38, 44, 50];

interface CostCategory {
  key: string;
  label: string;
  icon: string;
  amount: number;
  display: string;
  pct: number;
  color: string;
  bgColor: string;
  badgeBg: string;
}

export const AnnualBreakdownPortrait: React.FC<PortraitSlideProps> = ({
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
      icon: "F",
      amount: vehicle.annual_fuel,
      display: vehicle.annual_fuel_display,
      pct: fuelPct,
      color: C.amber,
      bgColor: "rgba(245,158,11,0.15)",
      badgeBg: "rgba(245,158,11,0.12)",
    },
    {
      key: "service",
      label: "Service",
      icon: "S",
      amount: vehicle.annual_service,
      display: vehicle.annual_service_display,
      pct: servicePct,
      color: C.blue,
      bgColor: "rgba(59,130,246,0.15)",
      badgeBg: "rgba(59,130,246,0.12)",
    },
    {
      key: "insurance",
      label: "Insurance",
      icon: "I",
      amount: vehicle.annual_insurance,
      display: vehicle.annual_insurance_display,
      pct: insurancePct,
      color: C.violet,
      bgColor: "rgba(139,92,246,0.15)",
      badgeBg: "rgba(139,92,246,0.12)",
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
      icon: "T",
      amount: annualTyres,
      display: `\u20B9 ${formatINR(annualTyres)}`,
      pct: tyreActualPct,
      color: C.orange,
      bgColor: "rgba(249,115,22,0.15)",
      badgeBg: "rgba(249,115,22,0.12)",
    });
  }

  // Fade + slide-up helper
  const fade = (start: number, dur: number = 15): React.CSSProperties => ({
    opacity: interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    transform: `translateY(${interpolate(
      frame,
      [start, start + dur],
      [30, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    )}px)`,
  });

  // Hero count-up
  const heroValue = useCountUp(12, 35, annualTotal);

  // Assumed km
  const assumedKm = vehicle.assumed_annual_km || 10000;

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground edgeLightColor={C.amber} />
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Slide counter */}
      <SlideCounter current={slideNumber} total={totalSlides} startFrame={0} />

      {/* Background glows matching HTML template */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 400,
          background:
            "radial-gradient(ellipse, rgba(71,131,255,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 400,
          background:
            "radial-gradient(ellipse, rgba(245,158,11,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Safe zone content */}
      <SafeZone style={{ zIndex: 10, alignItems: "center" }}>
        <Logo size={28} startFrame={0} />
        {/* Section tag */}
        <div style={{ ...fade(0, 8), marginTop: 16, textAlign: "center" }}>
          <span
            style={{
              display: "inline-block",
              padding: "10px 28px",
              borderRadius: 50,
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.2)",
              fontSize: 15,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: C.amber,
            }}
          >
            Annual Running Cost
          </span>
        </div>

        {/* Bike image */}
        <div
          style={{
            ...fade(2, 8),
            marginTop: 20,
            height: 200,
            display: "flex",
            justifyContent: "center",
          }}
        >
          {vehicle.primary_nobg_url && (
            <Img
              src={vehicle.primary_nobg_url}
              style={{
                height: "100%",
                objectFit: "contain",
                filter:
                  "drop-shadow(0 25px 60px rgba(0,0,0,0.7)) drop-shadow(0 0 40px rgba(71,131,255,0.08))",
              }}
            />
          )}
        </div>

        {/* Vehicle name + assumed km */}
        <div style={{ ...fade(4, 8), textAlign: "center", marginTop: 4 }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: C.text1 }}>
            {vehicle.brand_name} {vehicle.short_name}
          </div>
          <div
            style={{
              fontSize: 17,
              fontWeight: 500,
              color: C.text4,
              marginTop: 2,
            }}
          >
            Year 1 Baseline &middot;{" "}
            {assumedKm.toLocaleString("en-IN")} km/year
          </div>
        </div>

        {/* Hero amount */}
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
              color: C.amber,
              textShadow:
                "0 0 50px rgba(245,158,11,0.2), 0 4px 20px rgba(0,0,0,0.5)",
              opacity: interpolate(frame, [12, 18], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {"\u20B9"} {formatINR(heroValue)}
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: C.text3,
              marginTop: 10,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              opacity: interpolate(frame, [14, 22], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            Annual Running Cost
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            margin: "28px 120px 0",
            height: 1,
            width: "calc(100% - 240px)",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
            opacity: interpolate(frame, [20, 28], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />

        {/* Cost rows */}
        <div
          style={{
            margin: "24px 58px 0",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            width: "calc(100% - 116px)",
          }}
        >
          {categories.map((cat, i) => {
            const rowStart = 38 + i * 6;
            const barGrow = interpolate(
              frame,
              [rowStart + 8, rowStart + 28],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            return (
              <div
                key={cat.key}
                style={{
                  ...fade(rowStart, 12),
                  display: "flex",
                  alignItems: "center",
                  padding: "20px 24px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 16,
                  gap: 16,
                }}
              >
                {/* Icon circle */}
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    fontWeight: 900,
                    flexShrink: 0,
                    background: cat.bgColor,
                    color: cat.color,
                  }}
                >
                  {cat.icon}
                </div>

                {/* Info: name + pct badge + bar */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: C.text2,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    {cat.label}
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 12px",
                        borderRadius: 50,
                        fontSize: 14,
                        fontWeight: 800,
                        background: cat.badgeBg,
                        color: cat.color,
                      }}
                    >
                      {cat.pct}%
                    </span>
                  </div>
                  {/* Bar track */}
                  <div
                    style={{
                      height: 8,
                      background: C.surface2,
                      borderRadius: 4,
                      marginTop: 8,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 4,
                        background: cat.color,
                        width: `${cat.pct * barGrow}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Amount */}
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 900,
                    textAlign: "right",
                    minWidth: 130,
                    flexShrink: 0,
                    color: cat.color,
                  }}
                >
                  {cat.display}
                </div>
              </div>
            );
          })}
        </div>

      </SafeZone>

      {/* Progress dots */}
      <ProgressDots
        current={slideNumber}
        total={totalSlides}
        activeColor={C.amber}
        startFrame={0}
      />

      {/* Watermark */}
      <Watermark variant="portrait" />
    </AbsoluteFill>
  );
};
