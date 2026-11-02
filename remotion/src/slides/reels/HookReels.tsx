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
import { useCountUp } from "../../utils/animations";
import { formatINR, formatINRFull } from "../../utils/format";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";

const CLICK_FRAMES = [0, 10, 22, 35, 52, 64];
const BIKE_HEIGHT = 600;

export const HookReels: React.FC<PortraitSlideProps> = ({
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

  // Count up for hero price: frames 22-48
  const countedCost = useCountUp(22, 48, vehicle.net_5yr);

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: "#09090b" }}>
      {/* Click sounds */}
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Bike hero image -- large, clear, below IG safe zone */}
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
            filter:
              "drop-shadow(0 20px 60px rgba(0,0,0,0.7)) drop-shadow(0 0 40px rgba(71,131,255,0.15))",
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
          background:
            "radial-gradient(ellipse, rgba(71,131,255,0.12) 0%, transparent 70%)",
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
          height: 830,
          background:
            "linear-gradient(to bottom, transparent 50%, rgba(9,9,11,0.3) 62%, rgba(9,9,11,0.75) 76%, #09090b 92%)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />

      {/* Logo -- centered, 2x size, above bike (in safe zone, OK) */}
      <div style={{ position: "absolute", top: 72, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 20, pointerEvents: "none" }}>
        <Logo size={72} startFrame={0} />
      </div>

      {/* Slide counter */}
      <SlideCounter current={slideNumber} total={totalSlides} variant="reels" />

      {/* Vehicle name + label -- over the gradient */}
      <div
        style={{
          position: "absolute",
          top: 700,
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
            ...fade(14),
            fontSize: 22,
            fontWeight: 700,
            color: C.text3,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            marginTop: 6,
          }}
        >
          Ownership Cost Breakdown
        </div>
      </div>

      {/* Content below gradient — narrower, centered */}
      <div
        style={{
          position: "absolute",
          top: 820,
          left: 0,
          right: 0,
          bottom: 240,
          padding: "0 6%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          zIndex: 10,
        }}
      >
        {/* Hero price section */}
        <div style={{ textAlign: "center" }}>
          {/* 5-Year True Cost label */}
          <div
            style={{
              ...fade(18, 8),
              fontSize: 20,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: C.text4,
              marginBottom: 8,
            }}
          >
            {vehicle.data_confidence === "verified" ? "5-Year Ownership Cost" : "Estimated 5-Year Cost"}
          </div>
          <div
            style={{
              opacity: interpolate(frame, [22, 28], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              fontSize: 140,
              fontWeight: 900,
              lineHeight: 0.88,
              letterSpacing: "-0.04em",
              color: C.blue,
              textShadow:
                "0 0 80px rgba(71,131,255,0.4), 0 0 40px rgba(71,131,255,0.2)",
            }}
          >
            {formatINRFull(countedCost)}
          </div>

          {/* Sub "Not X -- here's why" */}
          <div
            style={{
              ...fade(26),
              fontSize: 26,
              fontWeight: 600,
              color: C.text3,
              marginTop: 28,
            }}
          >
            Not{" "}
            <strong style={{ color: C.text2, fontWeight: 800 }}>
              {vehicle.price_formatted}
            </strong>
            {" \u2014 here's why"}
          </div>
        </div>

        {/* Receipt rows -- glass card, full width of narrower container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
            width: "100%",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.03)",
          }}
        >
          {/* Row 1: Showroom Price */}
          <div
            style={{
              ...fade(32),
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 600, color: C.text3, flexShrink: 0 }}>
              Ex-Showroom
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.text2, textAlign: "right" }}>
              {vehicle.price_formatted}
            </div>
          </div>

          {/* Row 1b: On-Road Price (approx) */}
          {vehicle.price_on_road_formatted && (
            <div
              style={{
                ...fade(34),
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 600, color: C.text3, flexShrink: 0 }}>
                On-Road
                <span style={{ fontSize: 14, fontWeight: 500, color: C.text4, marginLeft: 6 }}>approx</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.amber, textAlign: "right" }}>
                {vehicle.price_on_road_formatted}
              </div>
            </div>
          )}

          {/* Row 2: Annual Running Cost */}
          <div
            style={{
              ...fade(36),
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 600, color: C.text3, flexShrink: 0 }}>
              Annual Running
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.text1, textAlign: "right" }}>
              {"\u20B9"} {formatINR(vehicle.annual_total || 0)}/yr
            </div>
          </div>

          {/* Row 3: Monthly Ownership */}
          <div
            style={{
              ...fade(40),
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 600, color: C.text3, flexShrink: 0 }}>
              Monthly
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.amber, textAlign: "right" }}>
              {vehicle.monthly_cost_display}/mo
            </div>
          </div>

          {/* Row 4: Cost per Km */}
          <div
            style={{
              ...fade(44),
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 600, color: C.text3, flexShrink: 0 }}>
              Cost / km
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.orange, textAlign: "right" }}>
              {"\u20B9"}{vehicle.cost_per_km.toFixed(2)}
            </div>
          </div>

          {/* Row 5: 5-Year Real Cost (highlight footer) */}
          <div
            style={{
              ...fade(48),
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 24px",
              background: "rgba(71,131,255,0.06)",
              borderTop: "2px solid rgba(71,131,255,0.2)",
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: C.blue,
                flexShrink: 0,
              }}
            >
              {vehicle.data_confidence === "verified" ? "5-Year Cost" : "Est. 5-Year"}
            </div>
            <div
              style={{
                fontSize: 34,
                fontWeight: 900,
                color: C.blue,
                textShadow: "0 0 20px rgba(71,131,255,0.3)",
                textAlign: "right",
              }}
            >
              {vehicle.net_5yr_display}
            </div>
          </div>
        </div>

        {/* Multiplier pills */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              ...fade(52, 12),
              padding: "14px 32px",
              borderRadius: 50,
              background: "rgba(245,158,11,0.12)",
              border: "1px solid rgba(245,158,11,0.25)",
              boxShadow: "0 4px 20px rgba(245,158,11,0.10)",
              fontSize: 28,
              fontWeight: 900,
              color: C.amber,
              whiteSpace: "nowrap",
            }}
          >
            {vehicle.multiplier}x Sticker Price
          </div>
          <div
            style={{
              ...fade(55, 12),
              padding: "14px 32px",
              borderRadius: 50,
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.2)",
              boxShadow: "0 4px 20px rgba(16,185,129,0.08)",
              fontSize: 28,
              fontWeight: 900,
              color: C.emerald,
              whiteSpace: "nowrap",
            }}
          >
            {vehicle.cost_per_day_display} / day
          </div>
        </div>

        {/* Data confidence badge */}
        {vehicle.data_confidence !== "verified" && (
          <div
            style={{
              ...fade(58),
              textAlign: "center",
              marginTop: 8,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 20px",
                borderRadius: 50,
                background: vehicle.data_confidence === "projected"
                  ? "rgba(251,191,36,0.08)"
                  : "rgba(71,131,255,0.08)",
                border: `1px solid ${
                  vehicle.data_confidence === "projected"
                    ? "rgba(251,191,36,0.20)"
                    : "rgba(71,131,255,0.20)"
                }`,
                fontSize: 16,
                fontWeight: 600,
                color: vehicle.data_confidence === "projected"
                  ? "#fbbf24"
                  : C.text3,
                letterSpacing: "0.03em",
              }}
            >
              <span style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: vehicle.data_confidence === "projected" ? "#fbbf24" : C.blue,
              }} />
              {vehicle.data_confidence_label}
            </span>
          </div>
        )}

        {/* CTA */}
        <div
          style={{
            ...fade(64),
            textAlign: "center",
            fontSize: 24,
            fontWeight: 800,
            color: C.emerald,
            letterSpacing: "0.02em",
            textShadow: "0 0 24px rgba(16,185,129,0.25)",
          }}
        >
          {"Swipe to see the expected cost breakdown \u2192"}
        </div>
      </div>

      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
