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
  spring,
} from "remotion";
import { PortraitSlideProps } from "../../types";
import { resolveImage } from "../../utils/resolveImage";
import { C } from "../../utils/colors";
import { useCountUp, SPRING_CONFIG } from "../../utils/animations";
import { formatINR, formatINRFull, formatINRShort } from "../../utils/format";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";

const CLICK_FRAMES = [0, 5, 14, 30, 42, 55];
const BIKE_HEIGHT = 650;

export const DailyRealityReels: React.FC<PortraitSlideProps> = ({
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
  const heroValue = useCountUp(14, 38, Math.round(costPerDay));

  const fade = (start: number, dur: number = 12): React.CSSProperties => ({
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
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: C.bg }}>
      {/* Click sounds */}
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* ── HERO BIKE ZONE ── */}
      {/* Amber atmospheric glow behind bike */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 500,
          background:
            "radial-gradient(ellipse, rgba(245,158,11,0.10) 0%, rgba(245,158,11,0.04) 40%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Bike image -- full bleed hero */}
      {vehicle.primary_nobg_url && (
        <Img
          src={resolveImage(vehicle.primary_nobg_url)}
          style={{
            position: "absolute",
            top: 0,
            left: "-5%",
            width: "110%",
            height: BIKE_HEIGHT,
            objectFit: "contain",
            zIndex: 2,
            opacity: interpolate(frame, [5, 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            filter:
              "drop-shadow(0 40px 80px rgba(0,0,0,0.8)) drop-shadow(0 0 60px rgba(245,158,11,0.15))",
          }}
        />
      )}

      {/* Gradient overlay fading bike to dark */}
      <div
        style={{
          position: "absolute",
          top: BIKE_HEIGHT - 250,
          left: 0,
          right: 0,
          height: 250,
          background: `linear-gradient(to bottom, transparent, ${C.bg})`,
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      {/* Logo -- top left over bike */}
      <div style={{ position: "absolute", top: 110, left: 44, zIndex: 10 }}>
        <Logo size={36} startFrame={0} />
      </div>

      {/* Counter -- top right over bike */}
      <SlideCounter current={slideNumber} total={totalSlides} startFrame={0} variant="reels" />

      {/* Vehicle name -- over the gradient */}
      <div
        style={{
          ...fade(8, 10),
          position: "absolute",
          top: BIKE_HEIGHT - 120,
          left: 44,
          right: 86,
          zIndex: 5,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 900,
            color: C.text1,
            textShadow: "0 4px 20px rgba(0,0,0,0.8)",
          }}
        >
          {vehicle.brand_name} {vehicle.short_name}
        </div>
      </div>

      {/* ── CONTENT AREA ── */}
      <div
        style={{
          position: "absolute",
          top: BIKE_HEIGHT,
          left: 0,
          right: 0,
          bottom: "17%",
          padding: "0 86px 0 44px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 10,
        }}
      >
        {/* Hero daily cost */}
        <div style={{ textAlign: "center", paddingTop: 20 }}>
          <div
            style={{
              fontSize: 150,
              fontWeight: 900,
              lineHeight: 0.85,
              letterSpacing: "-0.04em",
              color: C.amber,
              textShadow:
                "0 0 80px rgba(245,158,11,0.3), 0 0 160px rgba(245,158,11,0.1), 0 8px 40px rgba(0,0,0,0.5)",
              opacity: interpolate(frame, [14, 22], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {"\u20B9"}{formatINR(heroValue)}
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: C.text3,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              marginTop: 12,
              opacity: interpolate(frame, [18, 26], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            /DAY
          </div>
        </div>

        {/* Two stat cards side-by-side */}
        <div
          style={{
            display: "flex",
            gap: 16,
            width: "100%",
          }}
        >
          {/* Fuel cost/km card */}
          <div
            style={{
              ...fade(42, 12),
              flex: 1,
              padding: "24px 20px",
              minHeight: 180,
              background: "rgba(16,185,129,0.06)",
              borderLeft: `4px solid ${C.emerald}`,
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: C.text4,
                marginBottom: 12,
              }}
            >
              Fuel Cost / km
            </div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                lineHeight: 1,
                color: C.emerald,
              }}
            >
              {"\u20B9"}{fuelPerKm.toFixed(2)}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: C.text4,
                marginTop: 8,
              }}
            >
              fuel only
            </div>
          </div>

          {/* True cost/km card */}
          <div
            style={{
              ...fade(48, 12),
              flex: 1,
              padding: "24px 20px",
              minHeight: 180,
              background: "rgba(249,115,22,0.06)",
              borderLeft: `4px solid ${C.orange}`,
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: C.text4,
                marginBottom: 12,
              }}
            >
              True Cost / km
            </div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                lineHeight: 1,
                color: C.orange,
              }}
            >
              {"\u20B9"}{costPerKm.toFixed(2)}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: C.text4,
                marginTop: 8,
              }}
            >
              all-in cost
            </div>
          </div>
        </div>

        {/* Monthly cost -- full-width amber card */}
        <div
          style={{
            ...fade(55, 12),
            width: "100%",
            padding: "28px 28px",
            background: "rgba(245,158,11,0.08)",
            borderTop: `3px solid ${C.amber}`,
            borderRadius: 12,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: C.text4,
              marginBottom: 10,
            }}
          >
            Monthly Ownership Cost
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: C.amber,
              lineHeight: 1,
            }}
          >
            {vehicle.monthly_cost_display}
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: C.text3,
                marginLeft: 8,
              }}
            >
              /month
            </span>
          </div>
        </div>
      </div>

      {/* Progress dots */}
      <ProgressDots
        current={slideNumber}
        total={totalSlides}
        activeColor={C.amber}
        startFrame={0}
        variant="reels"
      />

      {/* Watermark */}
      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
