import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Audio, Sequence, staticFile } from "remotion";
import { SlideProps, Competitor } from "../types";
import { C } from "../utils/colors";
import { Logo } from "../components/Logo";
import { Watermark } from "../components/Watermark";
import { SlideBackground } from "../components/SlideBackground";
import { BikeImage } from "../components/BikeImage";
import { formatINRShort } from "../utils/format";

const CLICK_FRAMES = [5, 10, 30, 36, 42, 48, 54];

export const VsSegment: React.FC<SlideProps> = ({ vehicle }) => {
  const frame = useCurrentFrame();

  const fade = (start: number, dur: number = 20) => ({
    opacity: interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    transform: `translateY(${interpolate(frame, [start, start + dur], [40, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })}px)`,
  });

  // Merge vehicle into competitors and sort
  const selfEntry: Competitor = {
    short_name: `${vehicle.brand_name} ${vehicle.short_name}`,
    price_formatted: vehicle.price_formatted,
    cost_5yr_display: vehicle.net_5yr_display,
    total_cost_5yr: vehicle.total_cost_5yr || vehicle.net_5yr,
    cost_per_km: vehicle.cost_per_km,
  };

  const allVehicles = [selfEntry, ...(vehicle.competitors_ownership || [])].sort(
    (a, b) => a.total_cost_5yr - b.total_cost_5yr
  );

  const selfRank = allVehicles.findIndex((v) => v.short_name === selfEntry.short_name) + 1;
  const maxCost = Math.max(...allVehicles.map((v) => v.total_cost_5yr), 1);

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground edgeLightColor={C.orange} />

      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={i} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      <div style={{ position: "absolute", top: 70, right: 130, zIndex: 20 }}>
        <Logo size={80} startFrame={0} />
      </div>

      {/* Left 58% */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "90%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 0 0 150px",
        }}
      >
        {/* Accent strip */}
        <div
          style={{
            ...fade(5, 15),
            display: "inline-block",
            background: "rgba(249,115,22,0.10)",
            padding: "10px 28px 10px 0",
            borderLeft: `6px solid ${C.orange}`,
            paddingLeft: 24,
            width: "fit-content",
            marginBottom: 24,
          }}
        >
          <span
            style={{
              fontSize: 108,
              fontWeight: 800,
              color: C.orange,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              whiteSpace: "nowrap",
            }}
          >
            V/S The Segment
          </span>
        </div>

        {/* Hero rank */}
        <div style={{ ...fade(10, 20), display: "flex", alignItems: "baseline", gap: 20, marginBottom: 30 }}>
          <div
            style={{
              fontSize: 480,
              fontWeight: 900,
              color: C.orange,
              lineHeight: 1,
              letterSpacing: -5,
              textShadow: "0 0 80px rgba(249,115,22,0.2)",
              whiteSpace: "nowrap",
            }}
          >
            #{selfRank}
          </div>
          <div style={{ fontSize: 144, fontWeight: 700, color: C.text3, whiteSpace: "nowrap" }}>
            of {allVehicles.length}
          </div>
        </div>

        {/* Full ranked list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {allVehicles.map((comp, i) => {
              const isSelf = comp.short_name === selfEntry.short_name;
              const rowStart = 30 + i * 6;
              const barGrow = interpolate(frame, [rowStart + 5, rowStart + 35], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const barWidth = (comp.total_cost_5yr / maxCost) * 100 * barGrow;

              return (
                <div
                  key={comp.short_name}
                  style={{
                    ...fade(rowStart, 18),
                    display: "flex",
                    alignItems: "center",
                    gap: 32,
                    padding: "24px 40px",
                    background: isSelf ? "rgba(249,115,22,0.06)" : "transparent",
                    border: isSelf ? `2px solid ${C.orange}44` : "2px solid transparent",
                    borderRadius: 28,
                  }}
                >
                  {/* Rank */}
                  <div
                    style={{
                      fontSize: 84,
                      fontWeight: 900,
                      color: isSelf ? C.orange : C.text3,
                      width: 132,
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isSelf && (
                      <span style={{ marginRight: 4 }}>&#9733;</span>
                    )}
                    {i + 1}
                  </div>

                  {/* Name */}
                  <div
                    style={{
                      fontSize: 90,
                      fontWeight: isSelf ? 900 : 700,
                      color: isSelf ? C.text1 : C.text2,
                      width: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {comp.short_name}
                  </div>

                  {/* Bar */}
                  <div style={{ flex: 1, height: 32, background: "rgba(255,255,255,0.04)", borderRadius: 16, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${barWidth}%`,
                        height: "100%",
                        background: isSelf
                          ? `linear-gradient(90deg, ${C.orange}, ${C.amber})`
                          : `linear-gradient(90deg, rgba(59,130,246,0.7), rgba(37,99,235,0.8))`,
                        borderRadius: 16,
                      }}
                    />
                  </div>

                  {/* Cost */}
                  <div
                    style={{
                      fontSize: 84,
                      fontWeight: 900,
                      color: isSelf ? C.orange : C.text1,
                      textAlign: "right",
                      minWidth: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {comp.cost_5yr_display || formatINRShort(comp.total_cost_5yr)}
                  </div>
                </div>
              );
            })}
          </div>
      </div>

      {/* Bike right */}
      <BikeImage
        src={vehicle.primary_nobg_url}
        width="42%"
        opacity={0.4}
        startFrame={5}
        glowColor="rgba(249,115,22,0.03)"
      />

      <Watermark />
    </AbsoluteFill>
  );
};
