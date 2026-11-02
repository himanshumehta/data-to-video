import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Img,
  Audio,
  Sequence,
  staticFile,
} from "remotion";
import { PortraitSlideProps } from "../../types";
import { C } from "../../utils/colors";
import { SlideBackground } from "../../components/SlideBackground";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";
import { SafeZone } from "../../components/SafeZone";

const CLICK_FRAMES = [0, 6, 14, 24, 36, 50];

interface SpecCard {
  label: string;
  value: string;
  unit: string;
}

export const ReviewPerformancePortrait: React.FC<PortraitSlideProps> = ({
  vehicle,
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();

  const fade = (start: number, dur: number = 15) => ({
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

  const specs: SpecCard[][] = [
    [
      { label: "Engine", value: vehicle.engine_cc != null ? String(vehicle.engine_cc) : "\u2014", unit: "cc" },
      { label: "Power", value: vehicle.power_hp != null ? String(vehicle.power_hp) : "\u2014", unit: "HP" },
      { label: "Torque", value: vehicle.torque_nm != null ? String(vehicle.torque_nm) : "\u2014", unit: "Nm" },
    ],
    [
      { label: "Top Speed", value: vehicle.top_speed_kmph != null ? String(vehicle.top_speed_kmph) : "\u2014", unit: "kmph" },
      { label: "Weight", value: vehicle.weight_kg != null ? String(vehicle.weight_kg) : "\u2014", unit: "kg" },
      { label: "0-100", value: vehicle.acceleration_0_100 != null ? String(vehicle.acceleration_0_100) : "\u2014", unit: "sec" },
    ],
  ];

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground />
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      <SlideCounter
        current={slideNumber}
        total={totalSlides}
        fontSize={18}
        startFrame={0}
      />

      <SafeZone style={{ zIndex: 10, alignItems: "center" }}>
        <Logo size={36} startFrame={0} />

        {/* Section pill */}
        <div style={{ ...fade(0, 10), textAlign: "center", marginTop: 16 }}>
          <span
            style={{
              display: "inline-block",
              padding: "10px 28px",
              borderRadius: 50,
              background: "rgba(249,115,22,0.1)",
              border: "1px solid rgba(249,115,22,0.25)",
              fontSize: 16,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: C.orange,
            }}
          >
            Performance
          </span>
        </div>

        {/* Vehicle image + name */}
        <div
          style={{
            ...fade(4, 12),
            display: "flex",
            justifyContent: "center",
            marginTop: 16,
            height: 140,
          }}
        >
          {vehicle.primary_nobg_url && (
            <Img
              src={vehicle.primary_nobg_url}
              style={{
                height: "100%",
                objectFit: "contain",
                filter:
                  "drop-shadow(0 15px 40px rgba(0,0,0,0.5)) drop-shadow(0 0 20px rgba(249,115,22,0.1))",
              }}
            />
          )}
        </div>
        <div
          style={{
            ...fade(8),
            textAlign: "center",
            marginTop: 6,
            fontSize: 28,
            fontWeight: 900,
            color: C.text1,
          }}
        >
          {vehicle.brand_name} {vehicle.short_name}
        </div>

        {/* Subtitle */}
        <div
          style={{
            ...fade(8),
            textAlign: "center",
            marginTop: 2,
            fontSize: 15,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: C.text4,
          }}
        >
          Performance DNA
        </div>

        {/* 2x3 spec grid */}
        {specs.map((row, ri) => (
          <div
            key={ri}
            style={{
              display: "flex",
              gap: 14,
              marginTop: ri === 0 ? 24 : 14,
              width: "100%",
              paddingLeft: 20,
              paddingRight: 20,
            }}
          >
            {row.map((spec, ci) => {
              const cardStart = 14 + ri * 12 + ci * 4;
              return (
                <div
                  key={spec.label}
                  style={{
                    ...fade(cardStart, 12),
                    flex: 1,
                    padding: 18,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 16,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: C.text4,
                      marginBottom: 8,
                    }}
                  >
                    {spec.label}
                  </div>
                  <div
                    style={{
                      fontSize: 42,
                      fontWeight: 900,
                      color: C.text1,
                      lineHeight: 1,
                    }}
                  >
                    {spec.value}
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: C.text3,
                      marginTop: 4,
                    }}
                  >
                    {spec.unit}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Power-to-weight highlight */}
        {vehicle.power_to_weight != null && (
          <div
            style={{
              ...fade(42),
              marginTop: 18,
              width: "100%",
              paddingLeft: 20,
              paddingRight: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 24px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderLeft: `3px solid ${C.emerald}`,
                borderRadius: 16,
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: C.text3,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Power-to-Weight
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: C.emerald,
                }}
              >
                {vehicle.power_to_weight}{" "}
                <span style={{ fontSize: 16, fontWeight: 600, color: C.text3 }}>
                  HP/ton
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Mileage badge */}
        <div
          style={{
            ...fade(50),
            textAlign: "center",
            marginTop: 18,
          }}
        >
          <span
            style={{
              display: "inline-block",
              padding: "10px 24px",
              borderRadius: 50,
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.18)",
              fontSize: 18,
              fontWeight: 800,
              color: C.emerald,
            }}
          >
            {vehicle.mileage_kmpl ?? "\u2014"} kmpl mixed
          </span>
        </div>
      </SafeZone>

      <ProgressDots
        current={slideNumber}
        total={totalSlides}
        startFrame={0}
      />
      <Watermark variant="portrait" />
    </AbsoluteFill>
  );
};
