import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Audio, Sequence, staticFile } from "remotion";
import { SlideProps } from "../types";
import { C } from "../utils/colors";
import { Logo } from "../components/Logo";
import { Watermark } from "../components/Watermark";
import { SlideBackground } from "../components/SlideBackground";
import { BikeImage } from "../components/BikeImage";
import { formatINRShort, formatINRFull } from "../utils/format";

const CLICK_FRAMES = [5, 10, 18, 50, 58, 66, 74, 82, 90, 98, 110];

export const MajorOverhauls: React.FC<SlideProps> = ({ vehicle }) => {
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

  const overhauls = [...(vehicle.overhauls || [])].sort((a, b) => a.year - b.year);
  const totalOhCost = overhauls.reduce((a, o) => a + o.cost, 0);
  const maxOhCost = Math.max(...overhauls.map((o) => o.cost), 1);
  const biggest = overhauls.reduce(
    (max, o) => (o.cost > max.cost ? o : max),
    overhauls[0] || { component: "N/A", cost: 0, year: 0 }
  );
  const biggestPct = totalOhCost > 0 ? Math.round((biggest.cost / totalOhCost) * 100) : 0;
  const annualBudget = overhauls.length > 0 ? Math.round(totalOhCost / 10) : 0;

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

      {/* Left content 68% */}
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
            Major Overhauls
          </span>
        </div>

        {/* Hero */}
        <div style={{ ...fade(10, 20), display: "flex", alignItems: "baseline", gap: 30, marginBottom: 8 }}>
          <div
            style={{
              fontSize: 360,
              fontWeight: 900,
              color: C.orange,
              letterSpacing: -3,
              lineHeight: 1,
              textShadow: "0 0 80px rgba(249,115,22,0.15)",
              whiteSpace: "nowrap",
            }}
          >
            {formatINRShort(totalOhCost)}
          </div>
          <div style={{ fontSize: 108, fontWeight: 700, color: C.text3, whiteSpace: "nowrap" }}>
            total over 10 years
          </div>
        </div>

        <div style={{ ...fade(18, 15), fontSize: 96, fontWeight: 700, color: C.text3, marginBottom: 40, whiteSpace: "nowrap" }}>
          {overhauls.length} major component replacement{overhauls.length !== 1 ? "s" : ""}
        </div>

        {/* Overhaul bars */}
        {overhauls.length > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 48, height: 800, marginBottom: 40 }}>
              {overhauls.slice(0, 8).map((oh, i) => {
                const barStart = 50 + i * 8;
                const grow = interpolate(frame, [barStart, barStart + 30], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                const h = (oh.cost / maxOhCost) * 700 * grow;
                const isBiggest = oh === biggest;

                return (
                  <div
                    key={`${oh.component}-${oh.year}`}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 16,
                      height: "100%",
                      justifyContent: "flex-end",
                    }}
                  >
                    {/* Cost above */}
                    <div
                      style={{
                        fontSize: 72,
                        fontWeight: 900,
                        color: isBiggest ? C.orange : C.text1,
                        opacity: grow,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatINRShort(oh.cost)}
                    </div>
                    {/* Bar */}
                    <div
                      style={{
                        width: "80%",
                        height: h,
                        background: isBiggest
                          ? `linear-gradient(180deg, ${C.orange}, ${C.amber})`
                          : `linear-gradient(180deg, rgba(59,130,246,0.85), rgba(37,99,235,0.95))`,
                        borderRadius: "8px 8px 0 0",
                        border: isBiggest ? `2px solid ${C.orange}44` : "2px solid rgba(59,130,246,0.15)",
                        borderBottom: "none",
                        boxShadow: isBiggest ? `0 0 40px ${C.orange}33` : "none",
                      }}
                    />
                    {/* Dot */}
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        background: isBiggest ? C.orange : C.blue,
                      }}
                    />
                    {/* Component name */}
                    <div
                      style={{
                        fontSize: 54,
                        fontWeight: 700,
                        color: C.text2,
                        textAlign: "center",
                        width: "100%",
                        lineHeight: 1.2,
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      {oh.component}
                    </div>
                    {/* Year */}
                    <div style={{ fontSize: 66, fontWeight: 800, color: C.text4, whiteSpace: "nowrap" }}>
                      Yr {oh.year}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Insight card */}
            <div
              style={{
                ...fade(110, 20),
                background: "rgba(255,255,255,0.03)",
                border: "2px solid rgba(255,255,255,0.06)",
                borderLeft: `4px solid ${C.orange}`,
                borderRadius: 16,
                padding: "20px 28px",
                fontSize: 84,
                fontWeight: 600,
                color: C.text2,
                lineHeight: 1.4,
                width: "100%",
              }}
            >
              {biggest.component} is {biggestPct}% of total overhaul cost.
              Budget {formatINRFull(annualBudget)}/yr to stay ahead.
            </div>
          </>
        )}
      </div>

      {/* Bike right */}
      <BikeImage
        src={vehicle.primary_nobg_url}
        width="40%"
        opacity={0.3}
        startFrame={5}
        glowColor="rgba(249,115,22,0.03)"
      />

      <Watermark />
    </AbsoluteFill>
  );
};
