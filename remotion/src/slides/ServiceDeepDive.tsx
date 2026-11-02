import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Audio, Sequence, staticFile } from "remotion";
import { SlideProps } from "../types";
import { C } from "../utils/colors";
import { Logo } from "../components/Logo";
import { Watermark } from "../components/Watermark";
import { SlideBackground } from "../components/SlideBackground";
import { BikeImage } from "../components/BikeImage";

const CLICK_FRAMES = [5, 10, 50, 60, 70, 80, 90, 100];

export const ServiceDeepDive: React.FC<SlideProps> = ({ vehicle }) => {
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

  const components = (vehicle.service_components || []).slice(0, 6);
  const maxCost = Math.max(...components.map((c) => c.cost), 1);

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground />

      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={i} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      <div style={{ position: "absolute", top: 70, right: 130, zIndex: 20 }}>
        <Logo size={80} startFrame={0} />
      </div>

      {/* Left content - 90%, overlays bike */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "90%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "150px 0 120px 160px",
        }}
      >
        {/* Top: accent + hero */}
        <div>
          {/* Accent strip */}
          <div
            style={{
              ...fade(5, 15),
              display: "inline-block",
              background: "rgba(71,131,255,0.10)",
              padding: "16px 40px 16px 32px",
              borderLeft: `8px solid ${C.blue}`,
              width: "fit-content",
              marginBottom: 36,
            }}
          >
            <span style={{ fontSize: 70, fontWeight: 900, color: C.blue, textTransform: "uppercase", letterSpacing: "0.18em" }}>
              Service Costs
            </span>
          </div>

          {/* Hero */}
          <div style={{ ...fade(10, 20) }}>
            <div style={{ fontSize: 60, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: C.text4, marginBottom: 12 }}>
              Annual Service Cost
            </div>
            <div style={{ fontSize: 245, fontWeight: 900, color: C.blue, letterSpacing: -5, lineHeight: 1, textShadow: "0 0 100px rgba(71,131,255,0.18)" }}>
              {vehicle.annual_service_display}
            </div>
          </div>
        </div>

        {/* Ranked components */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {components.map((comp, i) => {
              const rowStart = 50 + i * 10;
              const barGrow = interpolate(frame, [rowStart + 5, rowStart + 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const barWidth = (comp.cost / maxCost) * 100 * barGrow;

              return (
                <div key={comp.name} style={{ ...fade(rowStart, 18) }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 10 }}>
                    {/* Rank badge */}
                    <div
                      style={{
                        width: 138, height: 138, borderRadius: 29,
                        background: "rgba(71,131,255,0.14)", border: "2px solid rgba(71,131,255,0.3)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 74, fontWeight: 900, color: C.blue, flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, display: "flex", alignItems: "baseline", gap: 24 }}>
                      <div style={{ fontSize: 106, fontWeight: 900, color: C.text1, whiteSpace: "nowrap" }}>{comp.name}</div>
                      <div style={{ fontSize: 70, fontWeight: 700, color: C.text3, whiteSpace: "nowrap" }}>{comp.freq}</div>
                    </div>
                    <div style={{ fontSize: 106, fontWeight: 900, color: C.text1 }}>{comp.cost_display}</div>
                  </div>
                  <div style={{ height: 16, background: "rgba(255,255,255,0.05)", borderRadius: 8, overflow: "hidden", marginLeft: 96 }}>
                    <div style={{ width: `${barWidth}%`, height: "100%", background: `linear-gradient(90deg, ${C.blue}, ${C.blue}cc)`, borderRadius: 8 }} />
                  </div>
                </div>
              );
            })}
          </div>
      </div>

      {/* Bike image right 42% */}
      <BikeImage
        src={vehicle.primary_nobg_url}
        width="44%"
        opacity={0.7}
        startFrame={5}
        glowColor="rgba(71,131,255,0.05)"
      />

      <Watermark />
    </AbsoluteFill>
  );
};
