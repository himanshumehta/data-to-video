import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Audio, Sequence, staticFile } from "remotion";
import { C } from "../../utils/colors";
import { Logo } from "../../components/Logo";
import { Watermark } from "../../components/Watermark";

const TEAL_BRIGHT = "#14b8a6";

interface Props { bill: any; [key: string]: any; }

export const BillEssentialReels: React.FC<Props> = ({ bill }) => {
  const frame = useCurrentFrame();
  const fade = (s: number, d = 12): React.CSSProperties => ({
    opacity: interpolate(frame, [s, s + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(frame, [s, s + d], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
  });

  const essentials = (bill.top_essentials || []).slice(0, 5);
  const total = bill.total_amount || 1;
  const partsPct = Math.round(((bill.parts_total || 0) / total) * 100);

  /* Ring animation */
  const radius = 200;
  const circ = 2 * Math.PI * radius;
  const ringProgress = interpolate(frame, [6, 28], [0, partsPct / 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ringSize = radius * 2 + 30;

  /* List animation offsets */
  const listStart = 20;
  const essEnd = listStart + essentials.length * 3 + 4;

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: "#09090b" }}>
      {[0, 8, 20].map((vf, i) => (
        <Sequence key={`c-${i}`} from={vf} durationInFrames={6}><Audio src={staticFile("click.wav")} volume={0.35} /></Sequence>
      ))}

      {/* Logo */}
      <div style={{ position: "absolute", top: 72, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 20, pointerEvents: "none" }}>
        <Logo size={72} startFrame={0} />
      </div>

      {/* ── Main content: top 240 → bottom 80 = 1600px ── */}
      <div style={{
        position: "absolute", top: 240, left: 0, right: 0, bottom: 80,
        padding: "0 85px",
        display: "flex", flexDirection: "column", alignItems: "center", zIndex: 10, gap: 50,
      }}>

        {/* ── Section header ── */}
        <div style={{ ...fade(2), textAlign: "center" }}>
          <div style={{ fontSize: 58, fontWeight: 900, color: C.emerald, textTransform: "uppercase", letterSpacing: "0.18em" }}>
            Parts Replaced
          </div>
        </div>

        {/* ── Large centered ring: radius 200 = 430px ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, ...fade(4) }}>
          <div style={{ position: "relative", width: ringSize, height: ringSize }}>
            <svg width={ringSize} height={ringSize} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={radius + 15} cy={radius + 15} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={24} />
              <circle cx={radius + 15} cy={radius + 15} r={radius} fill="none" stroke={C.emerald} strokeWidth={24}
                strokeDasharray={circ} strokeDashoffset={circ * (1 - ringProgress)} strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 18px rgba(16,185,129,0.35))` }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 82, fontWeight: 900, color: "#f4f4f5" }}>{partsPct}%</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#52525b", textTransform: "uppercase" }}>of bill</div>
            </div>
          </div>
          {/* Amount + count below ring */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 96, fontWeight: 900, color: C.emerald }}>{bill.parts_display || "—"}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#71717a", marginTop: 4 }}>{bill.parts_count || 0} items</div>
          </div>
        </div>

        {/* ── ESSENTIAL LIST: 5 rows × ~90px + footer ~86px = ~536px ── */}
        <div style={{
          width: "100%",
          background: "rgba(16,185,129,0.03)", border: "2px solid rgba(16,185,129,0.10)",
          borderRadius: 22, overflow: "hidden",
          ...fade(listStart),
        }}>
          {essentials.map((item: any, idx: number) => (
            <div key={idx} style={{
              ...fade(listStart + 2 + idx * 3),
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "32px 26px",
              borderBottom: idx < essentials.length - 1 ? "1px solid rgba(16,185,129,0.06)" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, color: C.emerald, flexShrink: 0,
                }}>✓</div>
                <div style={{ fontSize: 30, fontWeight: 700, color: "#e4e4e7", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
              </div>
              <span style={{ fontSize: 34, fontWeight: 900, color: "#f4f4f5", flexShrink: 0, marginLeft: 12 }}>{item.price_display}</span>
            </div>
          ))}
          {/* Essential total footer */}
          <div style={{
            ...fade(essEnd - 2),
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "30px 26px",
            background: "rgba(16,185,129,0.06)", borderTop: "2px solid rgba(16,185,129,0.18)",
          }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: C.emerald, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Parts Total
            </div>
            <div style={{ fontSize: 48, fontWeight: 900, color: C.emerald, textShadow: `0 0 20px rgba(16,185,129,0.3)` }}>
              {bill.parts_display}
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* ── CTA pinned bottom ── */}
        <div style={{ textAlign: "center", ...fade(essEnd + 6), marginBottom: 10, width: "100%" }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#a1a1aa", fontStyle: "italic" }}>
            Every part, accounted for.
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: TEAL_BRIGHT, marginTop: 10, letterSpacing: "0.02em", textShadow: `0 0 24px rgba(13,148,136,0.25)` }}>
            {"Swipe to see add-ons →"}
          </div>
        </div>
      </div>

      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
