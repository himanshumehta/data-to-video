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

const CLICK_FRAMES = [0, 4, 10, 35, 40, 50];

export const ServiceDeepDivePortrait: React.FC<PortraitSlideProps> = ({
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

  // Sort by cost descending, take top entries that fit
  const components = allComponents
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5);
  const maxCost = Math.max(...components.map((c) => c.cost), 1);

  const annualService = vehicle.annual_service || 0;

  // Hero count-up
  const heroValue = useCountUp(10, 30, annualService);

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
      <SlideBackground edgeLightColor={C.blue} />
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
            "radial-gradient(ellipse, rgba(59,130,246,0.04) 0%, transparent 70%)",
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
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.2)",
              fontSize: 15,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: C.blue,
            }}
          >
            Where Your Service Money Goes
          </span>
        </div>

        {/* Bike image */}
        <div
          style={{
            ...fade(2, 8),
            marginTop: 16,
            height: 240,
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
                  "drop-shadow(0 25px 60px rgba(0,0,0,0.7)) drop-shadow(0 0 40px rgba(59,130,246,0.08))",
              }}
            />
          )}
        </div>

        {/* Vehicle name */}
        <div style={{ ...fade(4, 8), textAlign: "center", marginTop: 2 }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: C.text1 }}>
            {vehicle.brand_name} {vehicle.short_name}
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: C.text4,
              marginTop: 2,
            }}
          >
            Service Cost Per Year
          </div>
        </div>

        {/* Hero total */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <div
            style={{
              fontSize: 78,
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
              color: C.blue,
              textShadow:
                "0 0 50px rgba(59,130,246,0.2), 0 4px 20px rgba(0,0,0,0.5)",
              opacity: interpolate(frame, [10, 16], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {"\u20B9"} {formatINR(heroValue)}
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: C.text3,
              marginTop: 8,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              opacity: interpolate(frame, [12, 20], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            Total Service Cost / Year
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            margin: "20px 120px 0",
            height: 1,
            width: "calc(100% - 240px)",
            background:
              "linear-gradient(90deg, transparent, rgba(59,130,246,0.15), transparent)",
            opacity: interpolate(frame, [18, 26], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />

        {/* Component list */}
        <div
          style={{
            margin: "16px 58px 0",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            width: "calc(100% - 116px)",
          }}
        >
          {components.map((comp, i) => {
            const rowStart = 35 + i * 5;
            const barGrow = interpolate(
              frame,
              [rowStart + 6, rowStart + 24],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            // Spring scale for rank circle
            const rankSpring = spring({
              frame: frame - rowStart,
              fps,
              config: { damping: 12, stiffness: 120, mass: 0.8 },
            });
            const rankScale = frame >= rowStart ? 0.5 + rankSpring * 0.5 : 0;
            const rankOpacity = frame >= rowStart ? rankSpring : 0;

            return (
              <div
                key={comp.name}
                style={{
                  ...fade(rowStart, 10),
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 20px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  gap: 14,
                }}
              >
                {/* Rank circle */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(71,131,255,0.14)",
                    border: "2px solid rgba(71,131,255,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    fontWeight: 900,
                    color: C.blue,
                    flexShrink: 0,
                    opacity: rankOpacity,
                    transform: `scale(${rankScale})`,
                  }}
                >
                  {i + 1}
                </div>

                {/* Component info */}
                <div style={{ flex: 1 }}>
                  <div>
                    <span
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: C.text1,
                      }}
                    >
                      {comp.name}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: C.text4,
                        marginLeft: 8,
                      }}
                    >
                      {comp.freq}
                    </span>
                  </div>
                  {/* Bar track */}
                  <div
                    style={{
                      height: 6,
                      background: C.surface2,
                      borderRadius: 3,
                      marginTop: 6,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 3,
                        background: C.blue,
                        width: `${(comp.cost / maxCost) * 100 * barGrow}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Amount */}
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: C.blue,
                    textAlign: "right",
                    minWidth: 100,
                    flexShrink: 0,
                  }}
                >
                  {comp.cost_display}
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
        activeColor={C.blue}
        startFrame={0}
      />

      {/* Watermark */}
      <Watermark variant="portrait" />
    </AbsoluteFill>
  );
};
