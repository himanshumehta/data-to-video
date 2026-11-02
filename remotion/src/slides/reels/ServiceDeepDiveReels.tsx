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

const CLICK_FRAMES = [0, 6, 12, 32, 40, 56];

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

// Blue gradient intensities for rank ordering
const BLUE_GRADIENTS = [
  { from: "#1e40af", to: "#60a5fa" },
  { from: "#1e3a8a", to: "#93bbfd" },
  { from: "#1e3a8a", to: "#7da8f5" },
  { from: "#1e3580", to: "#6b9ae8" },
  { from: "#162d6e", to: "#5a8cd8" },
];

export const ServiceDeepDiveReels: React.FC<PortraitSlideProps> = ({
  vehicle,
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Build full component list: service items + tyres (annualized)
  const allComponents = [...(vehicle.service_components || [])];
  const tyreFront = vehicle.tyre_front_cost || 0;
  const tyreRear = vehicle.tyre_rear_cost || 0;
  const tyreLifeKm = vehicle.tyre_life_km || 15000;
  const annualKm = vehicle.assumed_annual_km || 10000;
  if (tyreFront + tyreRear > 0) {
    const annualTyreCost = Math.round(((tyreFront + tyreRear) / tyreLifeKm) * annualKm);
    allComponents.push({
      name: "Tyres (F+R)",
      cost: annualTyreCost,
      cost_display: `₹ ${annualTyreCost.toLocaleString("en-IN")}`,
      freq: `${Math.round(tyreLifeKm / 1000)}k km`,
      pct: 0,
    });
  }

  // Sort by cost descending, take top 5
  const components = allComponents
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5);
  const maxCost = Math.max(...components.map((c) => c.cost), 1);

  const annualService = vehicle.annual_service || 0;

  // Hero count-up
  const heroValue = useCountUp(12, 34, annualService);

  const MAX_BAR_HEIGHT = 520;
  const BAR_WIDTH = 110;
  const BAR_GAP = 20;

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

  const SHORT_NAMES: Record<string, string> = {
    "Engine Oil + Filter": "Oil + Filter",
    "Chain Cleaning & Lube": "Chain Lube",
    "Brake Pads (F+R)": "Brake Pads",
    "Misc Consumables": "Misc",
    "General Labor": "Labor",
    "Coolant Service": "Coolant",
    "Air Filter": "Air Filter",
    "Spark Plug": "Spark Plug",
    "Tyres (F+R)": "Tyres",
  };

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: C.bg }}>
      {/* Click sounds */}
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Bike hero image -- large, clear */}
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
            filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.7)) drop-shadow(0 0 40px rgba(71,131,255,0.15))",
            zIndex: 2,
            ...fade(0, 15),
          }}
        />
      )}

      {/* Blue glow behind bike */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 500,
          background: "radial-gradient(ellipse, rgba(71,131,255,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Gradient overlay */}
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

      {/* Logo */}
      <div style={{ position: "absolute", top: 72, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 20, pointerEvents: "none" }}>
        <Logo size={72} startFrame={0} />
      </div>

      <SlideCounter current={slideNumber} total={totalSlides} startFrame={0} variant="reels" />

      {/* Vehicle name (below bike) */}
      <div style={{ position: "absolute", top: 700, left: 0, right: 0, zIndex: 10, textAlign: "center" }}>
        <div style={{ ...fade(5), fontSize: 44, fontWeight: 900, color: C.text1, textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>
          {vehicle.brand_name} {vehicle.short_name}
        </div>
      </div>

      {/* Section + hero */}
      <div style={{ position: "absolute", top: 770, left: 0, right: 0, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ ...fade(8, 8) }}>
          <span style={{ display: "inline-block", padding: "8px 24px", borderRadius: 50, background: "rgba(71,131,255,0.12)", border: "1px solid rgba(71,131,255,0.25)", fontSize: 18, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: C.blue }}>
            Service Breakdown
          </span>
        </div>
        <div style={{ marginTop: 12, textAlign: "center", opacity: interpolate(frame, [12, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 0.9, letterSpacing: "-0.04em", color: C.blue, textShadow: "0 0 60px rgba(71,131,255,0.3), 0 0 30px rgba(71,131,255,0.15)" }}>
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
          {components.map((comp, i) => {
            const barStart = 32 + i * 4;
            const labelFade = interpolate(
              frame,
              [barStart + 14, barStart + 22],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <div
                key={comp.name}
                style={{
                  width: BAR_WIDTH,
                  textAlign: "center",
                  fontSize: 22,
                  fontWeight: 900,
                  color: C.blue,
                  opacity: labelFade,
                  whiteSpace: "nowrap",
                  textShadow: "0 0 20px rgba(71,131,255,0.3)",
                }}
              >
                {comp.cost_display}
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
          {components.map((comp, i) => {
            const targetHeight = Math.max((comp.cost / maxCost) * (MAX_BAR_HEIGHT - 80), 44);
            const barStart = 32 + i * 4;
            const animatedHeight = useBarHeight(frame, barStart, targetHeight, 20);
            const grad = BLUE_GRADIENTS[i] || BLUE_GRADIENTS[4];
            return (
              <div
                key={comp.name}
                style={{
                  width: BAR_WIDTH,
                  height: animatedHeight,
                  borderRadius: "12px 12px 4px 4px",
                  background: `linear-gradient(to top, ${grad.from}, ${grad.to})`,
                  boxShadow:
                    "0 0 30px rgba(71,131,255,0.15), inset 0 1px 0 rgba(255,255,255,0.12)",
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
                    height: "35%",
                    background:
                      "linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)",
                    borderRadius: "12px 12px 0 0",
                  }}
                />
                {/* Rank number inside bar (or above if bar too short) */}
                <div
                  style={{
                    position: "absolute",
                    bottom: animatedHeight > 60 ? 16 : undefined,
                    top: animatedHeight > 60 ? undefined : -36,
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    fontSize: 40,
                    fontWeight: 900,
                    color: animatedHeight > 60 ? "rgba(255,255,255,0.85)" : C.blue,
                    textShadow: animatedHeight > 60
                      ? "0 2px 8px rgba(0,0,0,0.4)"
                      : "none",
                  }}
                >
                  {i + 1}
                </div>
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
          {components.map((comp, i) => {
            const barStart = 32 + i * 4;
            const labelFade = interpolate(
              frame,
              [barStart + 14, barStart + 22],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <div
                key={comp.name}
                style={{
                  width: BAR_WIDTH,
                  textAlign: "center",
                  opacity: labelFade,
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: C.text2,
                    lineHeight: 1.2,
                  }}
                >
                  {SHORT_NAMES[comp.name] || comp.name.slice(0, 12)}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    color: C.text4,
                    marginTop: 2,
                  }}
                >
                  {comp.freq}
                </div>
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
          ...fade(56, 12),
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: C.text3,
          }}
        >
          Top {components.length} service components by cost
        </div>
      </div>

      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
