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
import { resolveImage } from "../../utils/resolveImage";
import { C } from "../../utils/colors";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";

const CLICK_FRAMES = [0, 5, 14, 24, 40, 58];

export const VsSegmentReels: React.FC<PortraitSlideProps> = ({
  vehicle,
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();

  const fade = (start: number, dur = 12) => ({
    opacity: interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    transform: `translateY(${interpolate(frame, [start, start + dur], [20, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })}px)`,
  });

  // Build sorted list: self + competitors, cheapest first
  const selfEntry = {
    short_name: vehicle.short_name,
    cost_5yr_display: `₹ ${(vehicle.total_cost_5yr || 0).toLocaleString("en-IN")}`,
    total_cost_5yr: vehicle.total_cost_5yr || 0,
    cost_per_km: vehicle.cost_per_km || 0,
    is_self: true,
  };
  const competitors = (vehicle.competitors_ownership || []).map((c: any) => ({
    ...c,
    is_self: false,
  }));
  const allBikes = [selfEntry, ...competitors].sort(
    (a, b) => a.cost_per_km - b.cost_per_km
  );
  const selfRank = allBikes.findIndex((b) => b.is_self) + 1;

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: "#09090b" }}>
      {/* Click sounds */}
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

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

      {/* Bike hero -- large, clear */}
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

      {/* Gradient overlay -- gentle fade */}
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

      {/* Vehicle name (below bike) */}
      <div style={{ position: "absolute", top: 700, left: 0, right: 0, zIndex: 10, textAlign: "center" }}>
        <div style={{ ...fade(5), fontSize: 44, fontWeight: 900, color: C.text1, textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>
          {vehicle.brand_name} {vehicle.short_name}
        </div>
      </div>

      {/* Section pill */}
      <div style={{ position: "absolute", top: 770, left: 0, right: 0, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ ...fade(8, 8) }}>
          <span style={{ display: "inline-block", padding: "8px 24px", borderRadius: 50, background: "rgba(71,131,255,0.10)", border: "1px solid rgba(71,131,255,0.20)", fontSize: 18, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: C.blue }}>
            V/S The Segment
          </span>
        </div>
        <div style={{ ...fade(10, 8), fontSize: 18, fontWeight: 500, color: C.text4, marginTop: 8 }}>
          Ranked by cost per kilometer
        </div>
      </div>

      {/* Ranked card list */}
      <div
        style={{
          position: "absolute",
          top: 860,
          left: "10%",
          right: "10%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 14,
          zIndex: 10,
        }}
      >
        {allBikes.map((bike, i) => {
          const isSelf = bike.is_self;
          const cardStart = 14 + i * 5;
          const cardFade = fade(cardStart, 12);

          return (
            <div
              key={bike.short_name + i}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "20px 24px",
                borderRadius: 16,
                background: isSelf
                  ? "rgba(249,115,22,0.12)"
                  : "rgba(255,255,255,0.03)",
                border: isSelf
                  ? "2px solid rgba(249,115,22,0.4)"
                  : "1px solid rgba(255,255,255,0.06)",
                ...cardFade,
              }}
            >
              {/* Rank */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: isSelf
                    ? "rgba(249,115,22,0.25)"
                    : "rgba(71,131,255,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  fontWeight: 900,
                  color: isSelf ? C.orange : C.blue,
                  flexShrink: 0,
                }}
              >
                {isSelf ? "\u2605" : `#${i + 1}`}
              </div>

              {/* Name */}
              <div style={{ flex: 1, marginLeft: 16 }}>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: isSelf ? 900 : 700,
                    color: isSelf ? C.orange : "#fff",
                  }}
                >
                  {bike.short_name}
                </div>
                <div style={{ fontSize: 18, color: C.text4, marginTop: 2 }}>
                  {bike.cost_5yr_display}
                </div>
              </div>

              {/* Cost per km */}
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: isSelf ? C.orange : C.blue,
                  flexShrink: 0,
                }}
              >
                {"\u20B9"}{bike.cost_per_km.toFixed(1)}/km
              </div>
            </div>
          );
        })}
      </div>

      {/* Insight */}
      <div
        style={{
          position: "absolute",
          top: 1520,
          left: "10%",
          right: "10%",
          zIndex: 10,
          ...fade(55, 10),
        }}
      >
        <div
          style={{
            padding: "16px 24px",
            borderRadius: 14,
            background: "rgba(71,131,255,0.08)",
            borderTop: "2px solid rgba(71,131,255,0.2)",
            textAlign: "center",
            fontSize: 22,
            fontWeight: 700,
            color: C.text2,
          }}
        >
          <span style={{ color: C.orange, fontWeight: 900 }}>
            {vehicle.short_name}
          </span>
          {" "}ranks{" "}
          <span style={{ color: C.blue, fontWeight: 900 }}>
            #{selfRank} of {allBikes.length}
          </span>
          {selfRank <= 2
            ? " — among the cheapest to own"
            : selfRank >= allBikes.length - 1
            ? " — most expensive in segment"
            : ` — ${allBikes.length - selfRank} bikes cost more to own`}
        </div>
      </div>

      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
