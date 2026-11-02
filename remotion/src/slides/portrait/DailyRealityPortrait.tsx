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

const CLICK_FRAMES = [0, 3, 12, 38, 42, 52];

export const DailyRealityPortrait: React.FC<PortraitSlideProps> = ({
  vehicle,
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const costPerDay = vehicle.cost_per_day || 0;
  const costPerKm = vehicle.cost_per_km || 0;
  const mileage = vehicle.mixed_mileage_kmpl || 1;
  const fuelPrice = vehicle.assumed_fuel_price || 0;
  const fuelPerKm = mileage > 0 ? fuelPrice / mileage : 0;

  // Hero count-up (daily cost as whole number)
  const heroValue = useCountUp(12, 35, Math.round(costPerDay));

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

      {/* Background glows */}
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
          bottom: "8%",
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
              padding: "12px 30px",
              borderRadius: 50,
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.2)",
              fontSize: 18,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: C.amber,
            }}
          >
            Your Daily Reality
          </span>
        </div>

        {/* Bike image with amber shadow */}
        <div
          style={{
            ...fade(3, 8),
            marginTop: 20,
            height: 285,
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
                  "drop-shadow(0 25px 60px rgba(0,0,0,0.7)) drop-shadow(0 0 40px rgba(245,158,11,0.12))",
              }}
            />
          )}
        </div>

        {/* Vehicle name */}
        <div style={{ ...fade(5, 8), textAlign: "center", marginTop: 6 }}>
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
            What It Actually Costs You Every Day
          </div>
        </div>

        {/* Hero daily amount */}
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <div
            style={{
              fontSize: 96,
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
              fontSize: 24,
              fontWeight: 700,
              color: C.text3,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginTop: 8,
              opacity: interpolate(frame, [14, 22], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            Per Day To Own
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            margin: "28px 120px 0",
            height: 1,
            width: "calc(100% - 240px)",
            background:
              "linear-gradient(90deg, transparent, rgba(245,158,11,0.15), transparent)",
            opacity: interpolate(frame, [22, 30], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />

        {/* Compare cards: Fuel cost/km + True cost/km */}
        <div
          style={{
            display: "flex",
            gap: 16,
            margin: "28px 58px 0",
            width: "calc(100% - 116px)",
          }}
        >
          {/* Fuel Cost / km */}
          <div
            style={{
              ...fade(42, 12),
              flex: 1,
              textAlign: "center",
              padding: "28px 16px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: C.text4,
                marginBottom: 12,
              }}
            >
              Fuel Cost / km
            </div>
            <div
              style={{
                fontSize: 44,
                fontWeight: 900,
                lineHeight: 1,
                color: C.emerald,
              }}
            >
              {"\u20B9"} {fuelPerKm.toFixed(2)}
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: C.text4,
                marginTop: 6,
              }}
            >
              fuel only
            </div>
          </div>

          {/* True Cost / km */}
          <div
            style={{
              ...fade(47, 12),
              flex: 1,
              textAlign: "center",
              padding: "28px 16px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: C.text4,
                marginBottom: 12,
              }}
            >
              True Cost / km
            </div>
            <div
              style={{
                fontSize: 44,
                fontWeight: 900,
                lineHeight: 1,
                color: C.orange,
              }}
            >
              {"\u20B9"} {costPerKm.toFixed(2)}
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: C.text4,
                marginTop: 6,
              }}
            >
              all-in cost
            </div>
          </div>
        </div>

        {/* Monthly cost card */}
        <div
          style={{
            ...fade(52, 12),
            textAlign: "center",
            margin: "24px 58px 0",
            padding: "26px 24px",
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.15)",
            borderRadius: 16,
            width: "calc(100% - 116px)",
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: C.text3,
              marginBottom: 8,
            }}
          >
            Monthly Cost
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: C.amber,
              lineHeight: 1,
            }}
          >
            {vehicle.monthly_cost_display}
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: C.text3,
              marginTop: 6,
            }}
          >
            per month average
          </div>
        </div>

        {/* Info grid - 3 cells */}
        <div
          style={{
            ...fade(60, 12),
            display: "flex",
            margin: "24px 58px 0",
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.06)",
            width: "calc(100% - 116px)",
          }}
        >
          {/* Per Day */}
          <div
            style={{
              flex: 1,
              textAlign: "center",
              padding: "24px 16px",
              background: "rgba(255,255,255,0.03)",
              borderRight: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 900, color: C.amber }}>
              {vehicle.cost_per_day_display}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: C.text4,
                marginTop: 5,
              }}
            >
              Per Day
            </div>
          </div>

          {/* Per Km */}
          <div
            style={{
              flex: 1,
              textAlign: "center",
              padding: "24px 16px",
              background: "rgba(255,255,255,0.03)",
              borderRight: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 900, color: C.orange }}>
              {"\u20B9"} {costPerKm.toFixed(2)}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: C.text4,
                marginTop: 5,
              }}
            >
              Per Km
            </div>
          </div>

          {/* Per Month */}
          <div
            style={{
              flex: 1,
              textAlign: "center",
              padding: "24px 16px",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 900, color: C.emerald }}>
              {vehicle.monthly_cost_display}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: C.text4,
                marginTop: 5,
              }}
            >
              Per Month
            </div>
          </div>
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
