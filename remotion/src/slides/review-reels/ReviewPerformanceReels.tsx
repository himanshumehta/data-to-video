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
import { C } from "../../utils/colors";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";

const CLICK_FRAMES = [0, 8, 20, 34, 48, 60];
const BIKE_HEIGHT = 780;

interface SpecCard {
  label: string;
  value: string;
  unit: string;
}

export const ReviewPerformanceReels: React.FC<PortraitSlideProps> = ({
  vehicle,
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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

  const specs: SpecCard[] = [
    { label: "Engine", value: vehicle.engine_cc != null ? String(vehicle.engine_cc) : "\u2014", unit: "cc" },
    { label: "Power", value: vehicle.power_hp != null ? String(vehicle.power_hp) : "\u2014", unit: "HP" },
    { label: "Torque", value: vehicle.torque_nm != null ? String(vehicle.torque_nm) : "\u2014", unit: "Nm" },
    { label: "Top Speed", value: vehicle.top_speed_kmph != null ? String(vehicle.top_speed_kmph) : "\u2014", unit: "kmph" },
    { label: "Weight", value: vehicle.weight_kg != null ? String(vehicle.weight_kg) : "\u2014", unit: "kg" },
    { label: "0-100", value: vehicle.acceleration_0_100 != null ? String(vehicle.acceleration_0_100) : "\u2014", unit: "sec" },
  ];

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: C.bg }}>
      {/* Click sounds */}
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Orange glow behind bike */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 600,
          background:
            "radial-gradient(ellipse, rgba(249,115,22,0.10) 0%, rgba(249,115,22,0.04) 40%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Bike hero image */}
      {vehicle.primary_nobg_url && (
        <Img
          src={vehicle.primary_nobg_url}
          style={{
            position: "absolute",
            top: 60,
            left: 0,
            right: 0,
            width: "100%",
            height: 450,
            objectFit: "contain",
            objectPosition: "center center",
            filter:
              "drop-shadow(0 30px 80px rgba(0,0,0,0.8)) drop-shadow(0 0 60px rgba(249,115,22,0.12))",
            zIndex: 2,
            ...fade(0, 15),
          }}
        />
      )}

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: BIKE_HEIGHT + 50,
          background:
            "linear-gradient(to bottom, transparent 30%, rgba(9,9,11,0.4) 50%, rgba(9,9,11,0.85) 68%, #09090b 85%)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />

      {/* Logo */}
      <div style={{ position: "absolute", top: 154, left: 44, zIndex: 20 }}>
        <Logo size={36} startFrame={0} />
      </div>

      {/* Slide counter */}
      <SlideCounter current={slideNumber} total={totalSlides} variant="reels" />

      {/* Vehicle name over gradient */}
      <div
        style={{
          position: "absolute",
          top: BIKE_HEIGHT - 260,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <div
          style={{
            ...fade(8),
            fontSize: 52,
            fontWeight: 900,
            letterSpacing: "-0.01em",
            color: C.text1,
            textShadow: "0 2px 20px rgba(0,0,0,0.8)",
          }}
        >
          {vehicle.brand_name} {vehicle.short_name}
        </div>
        <div
          style={{
            ...fade(12),
            fontSize: 22,
            fontWeight: 700,
            color: C.orange,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            marginTop: 6,
          }}
        >
          Performance
        </div>
      </div>

      {/* Content area below gradient */}
      <div
        style={{
          position: "absolute",
          top: 750,
          left: 0,
          right: 0,
          bottom: "17%",
          padding: "0 44px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          zIndex: 10,
        }}
      >
        {/* 2x3 spec card grid */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          {specs.map((spec, i) => {
            const cardStart = 20 + i * 5;
            return (
              <div
                key={spec.label}
                style={{
                  ...fade(cardStart, 10),
                  width: "calc(50% - 7px)",
                  padding: "18px 16px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: C.text4,
                    marginBottom: 6,
                  }}
                >
                  {spec.label}
                </div>
                <div
                  style={{
                    fontSize: 52,
                    fontWeight: 900,
                    color: C.text1,
                    lineHeight: 1,
                  }}
                >
                  {spec.value}
                </div>
                <div
                  style={{
                    fontSize: 20,
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

        {/* Power-to-weight card */}
        {vehicle.power_to_weight != null && (
          <div
            style={{
              ...fade(52, 10),
              padding: "16px 24px",
              background: "rgba(16,185,129,0.06)",
              borderLeft: `4px solid ${C.emerald}`,
              borderRadius: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: C.text3,
              }}
            >
              Power-to-Weight
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 900,
                color: C.emerald,
              }}
            >
              {vehicle.power_to_weight.toFixed(2)}
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: C.text4,
                  marginLeft: 6,
                }}
              >
                HP/kg
              </span>
            </div>
          </div>
        )}

        {/* Mileage badge */}
        {vehicle.mileage_kmpl != null && (
          <div
            style={{
              ...fade(58, 10),
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                padding: "14px 36px",
                borderRadius: 50,
                background: "rgba(71,131,255,0.10)",
                border: "1px solid rgba(71,131,255,0.25)",
                fontSize: 28,
                fontWeight: 900,
                color: C.blue,
              }}
            >
              {vehicle.mileage_kmpl} kmpl
            </div>
          </div>
        )}
      </div>

      <ProgressDots
        current={slideNumber}
        total={totalSlides}
        activeColor={C.orange}
        startFrame={0}
        variant="reels"
      />
      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
