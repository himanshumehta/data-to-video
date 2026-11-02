import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Img, Audio, Sequence, staticFile } from "remotion";
import { SlideProps } from "../types";
import { C } from "../utils/colors";
import { Logo } from "../components/Logo";
import { Watermark } from "../components/Watermark";
import { SlideBackground } from "../components/SlideBackground";

const BULLETS = [
  { color: C.blue,    text: "Total cost over 5 & 10 years",  dim: " — down to every rupee" },
  { color: C.emerald, text: "Every cost broken down",         dim: " — fuel, service, insurance, tyres, overhauls" },
  { color: C.amber,   text: "When costs spike",               dim: " — years 3–5 hit hardest. How to plan ahead" },
  { color: C.red,     text: "How fast it loses value",        dim: " — and exactly when to sell" },
  { color: C.blue,    text: "Segment ranking",                dim: " — vs every rival on 5-year cost" },
  { color: C.rose,    text: "Your exact cost",                dim: " — ", link: "bikencars.com", dimEnd: " calculator" },
];

// Click fires at these virtual-frame values (after 1.5× speed multiply)
const CLICK_FRAMES = [10, 20, 30, 40, 50, 65, 73, 81, 89, 97, 105]; // brand, model, meta, rule, label, 6 bullets

export const WhatYouWillLearn: React.FC<SlideProps> = ({ vehicle, contentMonthYear }) => {
  const frame = useCurrentFrame();
  const f = frame * 1.5; // 1.5× animation speed

  const fade = (start: number, dur = 20) => ({
    opacity: interpolate(f, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(f, [start, start + dur], [50, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
  });

  const modelFontSize = vehicle.short_name.length > 12 ? 257 : 371;

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground />

      {/* Click sounds on each element transition */}
      {CLICK_FRAMES.map((vf, i) => {
        const actualFrame = Math.round(vf / 1.5);
        return (
          <Sequence key={i} from={actualFrame} durationInFrames={6}>
            <Audio src={staticFile("click.wav")} volume={0.35} />
          </Sequence>
        );
      })}

      {/* Bike — right side, faded */}
      {vehicle.primary_nobg_url && (
        <>
          <Img
            src={vehicle.primary_nobg_url}
            style={{
              position: "absolute", top: "50%", right: "-3%",
              transform: "translateY(-50%)", width: "70%",
              objectFit: "contain", zIndex: 1,
              opacity: interpolate(f, [5, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              filter: "grayscale(15%)",
            }}
          />
          {/* Gradient fade bike toward left */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
            background: "linear-gradient(90deg, #08080a 0%, #08080a 38%, rgba(8,8,10,0.90) 50%, rgba(8,8,10,0.45) 68%, rgba(8,8,10,0.10) 100%)",
          }} />
        </>
      )}

      {/* Edge vignette top/bottom */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
        background: "linear-gradient(180deg, rgba(8,8,10,0.45) 0%, transparent 6%, transparent 94%, rgba(8,8,10,0.45) 100%)",
      }} />

      {/* Logo — top RIGHT */}
      <div style={{ position: "absolute", top: 80, right: 120, zIndex: 30 }}>
        <Logo size={96} startFrame={0} />
      </div>

      {/* Main content — single column, no space-between, fills ~90% height */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column", alignItems: "flex-start",
        padding: "414px 0 80px 130px",
        width: "90%", height: "100%",
      }}>

        {/* Brand */}
        <div style={{
          ...fade(10, 16),
          fontSize: 137, fontWeight: 900, textTransform: "uppercase",
          letterSpacing: "0.12em", color: C.amber, lineHeight: 1.0,
          marginBottom: 4,
          textShadow: "0 0 60px rgba(245,158,11,0.4)",
        }}>
          {vehicle.brand_name}
        </div>

        {/* Model — hero */}
        <div style={{
          ...fade(20, 16),
          fontSize: modelFontSize, fontWeight: 900, textTransform: "uppercase",
          letterSpacing: -6, color: C.amber, lineHeight: 0.88,
          marginBottom: 30,
          textShadow: "0 0 140px rgba(245,158,11,0.35), 0 3px 0 rgba(0,0,0,0.5)",
        }}>
          {vehicle.short_name}
        </div>

        {/* Meta badges */}
        <div style={{ ...fade(30, 16), display: "flex", alignItems: "center", gap: 24, marginBottom: 48 }}>
          <div style={{ padding: "18px 56px", borderRadius: 150, fontSize: 57, fontWeight: 800, letterSpacing: "0.04em", background: "rgba(71,131,255,0.12)", border: "2px solid rgba(71,131,255,0.35)", color: "#fff", textShadow: "0 0 20px rgba(71,131,255,0.6)", whiteSpace: "nowrap" }}>
            {contentMonthYear}
          </div>
          <div style={{ padding: "18px 56px", borderRadius: 150, fontSize: 51, fontWeight: 800, letterSpacing: "0.18em", background: "rgba(255,255,255,0.06)", border: "2px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.90)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            Ownership Cost
          </div>
          {vehicle.generation_number && (
            <div style={{ padding: "18px 56px", borderRadius: 150, fontSize: 57, fontWeight: 800, background: "rgba(245,158,11,0.10)", border: "2px solid rgba(245,158,11,0.30)", color: "#fff", whiteSpace: "nowrap" }}>
              Gen {vehicle.generation_number}
            </div>
          )}
        </div>

        {/* Blue rule */}
        <div style={{
          ...fade(40, 12),
          width: 900, height: 3, marginBottom: 36,
          background: "linear-gradient(90deg, rgba(71,131,255,0.75), rgba(71,131,255,0.2) 55%, transparent)",
        }} />

        {/* Section label */}
        <div style={{
          ...fade(50, 16),
          fontSize: 68, fontWeight: 900, textTransform: "uppercase",
          letterSpacing: "0.22em", color: "rgba(255,255,255,0.52)",
          marginBottom: 36,
        }}>
          {"What You'll Know After This Video "}
          <span style={{ color: C.blue }}>↓</span>
        </div>

        {/* Bullets */}
        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          {BULLETS.map((b, i) => {
            const bulletStart = 65 + i * 8;
            return (
              <div key={i} style={{ ...fade(bulletStart, 16), display: "flex", alignItems: "center", gap: 54 }}>
                <div style={{
                  width: 33, height: 33, flexShrink: 0, borderRadius: 7,
                  background: b.color, boxShadow: `0 0 36px ${b.color}cc`,
                }} />
                <div style={{ fontSize: 91, fontWeight: 900, color: "rgba(255,255,255,0.93)", lineHeight: 1.15, whiteSpace: "nowrap" }}>
                  {b.text}
                  <span style={{ color: "rgba(255,255,255,0.48)", fontWeight: 600 }}>{b.dim}</span>
                  {b.link && <span style={{ color: C.blue, fontWeight: 900, textShadow: "0 0 20px rgba(71,131,255,0.5)" }}>{b.link}</span>}
                  {b.dimEnd && <span style={{ color: "rgba(255,255,255,0.48)", fontWeight: 600 }}>{b.dimEnd}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Watermark />
    </AbsoluteFill>
  );
};
