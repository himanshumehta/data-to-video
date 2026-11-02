import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Img, Audio, Sequence, staticFile } from "remotion";
import { C } from "../../utils/colors";
import { resolveImage } from "../../utils/resolveImage";
import { Logo } from "../../components/Logo";
import { Watermark } from "../../components/Watermark";

const TEAL = "#0d9488";
const TEAL_BRIGHT = "#14b8a6";

interface Props { bill: any; [key: string]: any; }

export const BillLaborReels: React.FC<Props> = ({ bill }) => {
  const frame = useCurrentFrame();
  const fade = (s: number, d = 12): React.CSSProperties => ({
    opacity: interpolate(frame, [s, s + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(frame, [s, s + d], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
  });

  const laborPct = bill.labor_pct || 0;
  const laborItems = (bill.top_labor || []).slice(0, 5);
  const laborColor = laborPct > 55 ? C.amber : C.blue;
  const laborVerdict = laborPct > 55 ? "High" : laborPct > 35 ? "Reasonable" : "Low";

  const radius = 130;
  const circ = 2 * Math.PI * radius;
  const progress = interpolate(frame, [10, 38], [0, laborPct / 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: "#09090b" }}>
      {[0, 10].map((vf, i) => <Sequence key={i} from={vf} durationInFrames={6}><Audio src={staticFile("click.wav")} volume={0.35} /></Sequence>)}

      {/* Logo */}
      <div style={{ position: "absolute", top: 72, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 20, pointerEvents: "none" }}>
        <Logo size={72} startFrame={0} />
      </div>

      {/* Teal glow */}
      <div style={{
        position: "absolute", top: 160, left: "50%", transform: "translateX(-50%)",
        width: 900, height: 500,
        background: `radial-gradient(ellipse, rgba(13,148,136,0.18) 0%, rgba(13,148,136,0.06) 40%, transparent 70%)`,
        pointerEvents: "none", zIndex: 1,
      }} />

      {/* Vehicle image — same as Slide 1 */}
      {bill.primary_nobg_url && (
        <Img src={resolveImage(bill.primary_nobg_url)} style={{
          position: "absolute", top: 200, left: "5%", width: "90%", height: 420,
          objectFit: "contain", objectPosition: "center center",
          filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.7)) drop-shadow(0 0 40px rgba(13,148,136,0.15))",
          zIndex: 2, ...fade(0, 15),
        }} />
      )}

      {/* Gradient overlay */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 780,
        background: "linear-gradient(to bottom, transparent 46%, rgba(9,9,11,0.3) 58%, rgba(9,9,11,0.80) 72%, #09090b 88%)",
        pointerEvents: "none", zIndex: 3,
      }} />

      {/* ── Main content ── */}
      <div style={{
        position: "absolute", top: 680, left: 0, right: 0, bottom: 140,
        padding: "0 85px",
        display: "flex", flexDirection: "column", alignItems: "center", zIndex: 10, gap: 45,
      }}>
        {/* Section header */}
        <div style={{ textAlign: "center", ...fade(3) }}>
          <div style={{ fontSize: 53, fontWeight: 900, color: C.blue, textTransform: "uppercase", letterSpacing: "0.2em" }}>
            ⚙ Labor Charges
          </div>
        </div>

        {/* Ring + amount side by side */}
        <div style={{ display: "flex", alignItems: "center", gap: 28, ...fade(6) }}>
          <div style={{ position: "relative", width: radius * 2 + 30, height: radius * 2 + 30, flexShrink: 0 }}>
            <svg width={radius * 2 + 30} height={radius * 2 + 30} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={radius + 15} cy={radius + 15} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={22} />
              <circle cx={radius + 15} cy={radius + 15} r={radius} fill="none" stroke={laborColor} strokeWidth={22}
                strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)} strokeLinecap="round" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 72, fontWeight: 900, color: "#f4f4f5" }}>{laborPct}%</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#52525b", textTransform: "uppercase" }}>of bill</div>
            </div>
          </div>

          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 52, fontWeight: 900, color: laborColor, textShadow: `0 0 24px ${laborColor}40` }}>{bill.labor_display}</div>
            <div style={{
              display: "inline-block", padding: "8px 22px", borderRadius: 50, marginTop: 10,
              background: `${laborColor}12`, border: `1px solid ${laborColor}30`,
              fontSize: 22, fontWeight: 900, color: laborColor, textTransform: "uppercase",
            }}>{laborVerdict}</div>
          </div>
        </div>

        {/* Labor items list */}
        {laborItems.length > 0 && (
          <div style={{ width: "100%", flex: 1, ...fade(32) }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 10 }}>
              Labor Breakdown
            </div>
            <div style={{
              background: "rgba(71,131,255,0.03)", border: "1px solid rgba(71,131,255,0.10)",
              borderRadius: 20, overflow: "hidden",
            }}>
              {laborItems.map((item: any, idx: number) => (
                <div key={idx} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "16px 22px",
                  borderBottom: idx < laborItems.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}>
                  <span style={{ fontSize: 45, fontWeight: 600, color: "#a1a1aa", flex: 1, lineHeight: 1.3 }}>{item.name}</span>
                  <span style={{ fontSize: 45, fontWeight: 900, color: "#e4e4e7", flexShrink: 0, marginLeft: 12 }}>{item.price_display}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
