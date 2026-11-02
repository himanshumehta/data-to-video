import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Img, Audio, Sequence, staticFile } from "remotion";
import { C } from "../../utils/colors";
import { resolveImage } from "../../utils/resolveImage";
import { Logo } from "../../components/Logo";
import { Watermark } from "../../components/Watermark";

const TEAL = "#0d9488";
const TEAL_BRIGHT = "#14b8a6";

interface Props { bill: any; [key: string]: any; }

export const BillTakeawayReels: React.FC<Props> = ({ bill }) => {
  const frame = useCurrentFrame();
  const fade = (s: number, d = 12): React.CSSProperties => ({
    opacity: interpolate(frame, [s, s + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(frame, [s, s + d], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
  });

  const tips = bill.tips || [];
  const tipColors = [TEAL_BRIGHT, C.emerald, C.amber];

  // Rating calculations
  const upsellPct = bill.upsell_pct || 0;
  const laborPct = bill.labor_pct || 0;
  const transparencyScore = (bill.items?.length || 0) > 10 ? 8 : (bill.items?.length || 0) > 5 ? 7 : 5;
  const fairnessScore = upsellPct === 0 ? 9 : upsellPct < 10 ? 7 : upsellPct < 25 ? 5 : 3;
  const valueScore = laborPct > 60 ? 4 : laborPct > 50 ? 6 : 8;
  const overall = Math.round((transparencyScore + fairnessScore + valueScore) / 3 * 10) / 10;
  const overallColor = overall >= 7 ? C.emerald : overall >= 5 ? C.amber : "#ef4444";

  const ratings = [
    { label: "Transparency", score: transparencyScore, color: transparencyScore >= 7 ? C.emerald : transparencyScore >= 5 ? C.amber : "#ef4444" },
    { label: "Fairness", score: fairnessScore, color: fairnessScore >= 7 ? C.emerald : fairnessScore >= 5 ? C.amber : "#ef4444" },
    { label: "Value", score: valueScore, color: valueScore >= 7 ? C.emerald : valueScore >= 5 ? C.amber : "#ef4444" },
  ];

  // Donut ring for overall score
  const radius = 200;
  const circ = 2 * Math.PI * radius;
  const ringProgress = interpolate(frame, [8, 30], [0, overall / 10], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ringSize = radius * 2 + 30;

  const ratingBlocksStart = 18;
  const tipsStart = 34;

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: "#09090b" }}>
      {[0, 8, 30].map((vf, i) => <Sequence key={i} from={vf} durationInFrames={6}><Audio src={staticFile("click.wav")} volume={0.35} /></Sequence>)}

      {/* Logo */}
      <div style={{ position: "absolute", top: 72, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 20, pointerEvents: "none" }}>
        <Logo size={72} startFrame={0} />
      </div>

      {/* ── Main content: top 240 → bottom 80 = 1600px ── */}
      <div style={{
        position: "absolute", top: 240, left: 0, right: 0, bottom: 80,
        padding: "0 85px",
        display: "flex", flexDirection: "column", alignItems: "center",
        zIndex: 10,
      }}>

        {/* ── BILL SCORECARD header ── */}
        <div style={{ textAlign: "center", ...fade(3) }}>
          <div style={{ fontSize: 53, fontWeight: 900, color: TEAL_BRIGHT, textTransform: "uppercase", letterSpacing: "0.2em" }}>
            Bill Scorecard
          </div>
        </div>

        {/* ── Donut ring with overall score inside (matching slide 1 pattern) ── */}
        <div style={{ position: "relative", width: ringSize, height: ringSize, flexShrink: 0, marginTop: 45, ...fade(6) }}>
          <svg width={ringSize} height={ringSize} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={radius + 15} cy={radius + 15} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={28} />
            <circle cx={radius + 15} cy={radius + 15} r={radius} fill="none" stroke={overallColor} strokeWidth={28}
              strokeDasharray={circ} strokeDashoffset={circ * (1 - ringProgress)} strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 18px ${overallColor}60)` }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", color: "#52525b" }}>Overall</div>
            <div style={{
              fontSize: 120, fontWeight: 900, lineHeight: 0.9, letterSpacing: "-0.03em",
              color: overallColor,
              textShadow: `0 0 40px ${overallColor}40`,
            }}>
              {overall}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#52525b", marginTop: 4 }}>out of 10</div>
          </div>
        </div>

        {/* ── 3 rating glowing blocks (matching slide 1 segment blocks) ── */}
        <div style={{ display: "flex", justifyContent: "center", gap: 14, width: "100%", marginTop: 45, ...fade(ratingBlocksStart) }}>
          {ratings.map((r, i) => (
            <div key={i} style={{
              flex: 1, textAlign: "center",
              padding: "20px 8px", borderRadius: 16,
              background: `${r.color}10`, border: `2px solid ${r.color}30`,
              boxShadow: `0 0 18px ${r.color}18, inset 0 0 18px ${r.color}10`,
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: r.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{r.label}</div>
              <div style={{ fontSize: 25, fontWeight: 700, color: "#71717a", marginTop: 4 }}>{r.score}/10</div>
            </div>
          ))}
        </div>

        {/* ── KEY TAKEAWAYS header ── */}
        <div style={{ textAlign: "center", marginTop: 60, ...fade(tipsStart) }}>
          <div style={{ fontSize: 53, fontWeight: 900, color: TEAL_BRIGHT, textTransform: "uppercase", letterSpacing: "0.2em" }}>
            Key Takeaways
          </div>
        </div>

        {/* Tips */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", marginTop: 20 }}>
          {tips.map((tip: string, idx: number) => {
            const color = tipColors[idx % tipColors.length];
            return (
              <div key={idx} style={{
                ...fade(tipsStart + 4 + idx * 8),
                padding: "20px 20px", borderRadius: 18,
                background: `${color}08`, border: `2px solid ${color}18`,
                display: "flex", gap: 16, alignItems: "flex-start",
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${color}15`, border: `2px solid ${color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, fontWeight: 900, color, flexShrink: 0,
                }}>{idx + 1}</div>
                <div style={{ fontSize: 40, fontWeight: 600, color: "#e4e4e7", lineHeight: 1.4, paddingTop: 6 }}>{tip}</div>
              </div>
            );
          })}
        </div>

        <div style={{ flex: 1 }} />

        {/* Verdict banner */}
        <div style={{
          width: "100%", ...fade(tipsStart + 4 + tips.length * 8 + 6),
          padding: "18px 24px", borderRadius: 18,
          background: `${overallColor}0C`, border: `2px solid ${overallColor}25`,
          fontSize: 24, fontWeight: 700, color: overallColor, textAlign: "center", lineHeight: 1.4,
        }}>
          {bill.verdict_detail}
        </div>
      </div>

      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
