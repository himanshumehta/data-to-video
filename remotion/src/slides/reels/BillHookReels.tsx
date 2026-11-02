import React from "react";
import {
  AbsoluteFill, useCurrentFrame, interpolate, Audio, Sequence, staticFile,
} from "remotion";
import { C } from "../../utils/colors";
import { Logo } from "../../components/Logo";
import { Watermark } from "../../components/Watermark";

const CLICK_FRAMES = [0, 10, 22, 35, 52, 66];
const TEAL = "#0d9488";
const TEAL_BRIGHT = "#14b8a6";

interface Props { bill: any; [key: string]: any; }

export const BillHookReels: React.FC<Props> = ({ bill }) => {
  const frame = useCurrentFrame();

  const fade = (start: number, dur = 12): React.CSSProperties => ({
    opacity: interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(frame, [start, start + dur], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
  });

  // Compute 5 buckets directly from items — each item counted exactly once
  const items = bill.items || [];
  const sumClass = (...classes: string[]) => items
    .filter((i: any) => classes.includes(i.insight_class))
    .reduce((s: number, i: any) => s + (i.price || 0), 0);
  const countClass = (...classes: string[]) => items
    .filter((i: any) => classes.includes(i.insight_class)).length;

  const total = bill.total_amount || 1;
  const serviceAmt = sumClass("labor");
  const partsAmt = sumClass("essential", "neutral");
  const warrantyAmt = sumClass("recommended");
  const reviewAmt = sumClass("warranty_check", "grey_area");
  const optionalAmt = sumClass("upsell");

  const pct = (amt: number) => Math.round((amt / total) * 100);
  const disp = (amt: number) => {
    const rupees = amt / 100;
    if (rupees >= 100000) return `₹${(rupees/100000).toFixed(1)}L`;
    if (rupees >= 1000) return `₹${Math.round(rupees/1000)}K`;
    return `₹${Math.round(rupees).toLocaleString("en-IN")}`;
  };

  // 5 buckets — only show non-zero
  const allSegments: { pct: number; color: string; label: string; value: string; tag: string }[] = [];
  if (serviceAmt > 0) allSegments.push({ pct: pct(serviceAmt), color: C.blue, label: "Service", value: disp(serviceAmt), tag: `${countClass("labor")} items` });
  if (partsAmt > 0) allSegments.push({ pct: pct(partsAmt), color: C.emerald, label: "Parts", value: disp(partsAmt), tag: `${countClass("essential", "neutral")} items` });
  if (warrantyAmt > 0) allSegments.push({ pct: pct(warrantyAmt), color: "#14b8a6", label: "Warranty & RSA", value: disp(warrantyAmt), tag: `${countClass("recommended")} items` });
  if (reviewAmt > 0) allSegments.push({ pct: pct(reviewAmt), color: C.amber, label: "Review Items", value: disp(reviewAmt), tag: `${countClass("warranty_check", "grey_area")} items` });
  if (optionalAmt > 0) allSegments.push({ pct: pct(optionalAmt), color: "#ef4444", label: "Optional", value: disp(optionalAmt), tag: `${countClass("upsell")} items` });

  const segments = allSegments;

  // Verdict
  const verdictColor = bill.verdict === "overcharged" ? "#ef4444" : bill.verdict === "fair" ? C.emerald : C.amber;
  const verdictBg = bill.verdict === "overcharged" ? "rgba(239,68,68,0.12)" : bill.verdict === "fair" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)";
  const verdictBorder = bill.verdict === "overcharged" ? "rgba(239,68,68,0.30)" : bill.verdict === "fair" ? "rgba(16,185,129,0.30)" : "rgba(245,158,11,0.30)";

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: "#09090b" }}>
      {CLICK_FRAMES.map((vf, i) => (
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
        display: "flex", flexDirection: "column", alignItems: "center",
        zIndex: 10,
      }}>

        {/* ── Total Billed — single hero line ── */}
        <div style={{
          display: "flex", alignItems: "baseline", justifyContent: "center", gap: 16,
          padding: "24px 0", ...fade(12),
        }}>
          <span style={{ fontSize: 50, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.10em", color: TEAL_BRIGHT }}>
            Total Billed
          </span>
          <span style={{
            fontSize: 96, fontWeight: 900, letterSpacing: "-0.03em",
            color: TEAL_BRIGHT,
            textShadow: `0 0 40px rgba(13,148,136,0.35)`,
          }}>
            {bill.total_display}
          </span>
        </div>

        {/* ── Receipt card: 3 rows × ~120px + footer ~120px = ~490px ── */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 0, width: "100%",
          marginTop: 50,
          background: "rgba(255,255,255,0.04)",
          border: "2px solid rgba(255,255,255,0.10)",
          borderRadius: 24, overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          ...fade(28),
        }}>
          {segments.map((row, i) => (
            <div key={i} style={{
              ...fade(30 + i * 4),
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "36px 28px",
              borderBottom: i < segments.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: row.color, flexShrink: 0, boxShadow: `0 0 14px ${row.color}50` }} />
                <div style={{ fontSize: 34, fontWeight: 700, color: "#e4e4e7" }}>{row.label}</div>
                <div style={{
                  padding: "7px 20px", borderRadius: 50,
                  background: `${row.color}18`, fontSize: 24, fontWeight: 800, color: row.color,
                }}>{row.tag}</div>
              </div>
              <div style={{ fontSize: 44, fontWeight: 900, color: "#f4f4f5" }}>{row.value}</div>
            </div>
          ))}

          {/* Total footer */}
          <div style={{
            ...fade(44),
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "32px 28px",
            background: `rgba(13,148,136,0.08)`,
            borderTop: `2px solid rgba(13,148,136,0.25)`,
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.10em", color: TEAL_BRIGHT }}>
              Total Bill
            </div>
            <div style={{ fontSize: 54, fontWeight: 900, color: TEAL_BRIGHT, textShadow: `0 0 24px rgba(13,148,136,0.35)` }}>
              {bill.total_display}
            </div>
          </div>
        </div>

        {/* ── Verdict pills: ~80px ── */}
        <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", marginTop: 50, ...fade(50) }}>
          {bill.verdict_label && (
            <div style={{
              padding: "18px 44px", borderRadius: 50,
              background: verdictBg, border: `2px solid ${verdictBorder}`,
              fontSize: 34, fontWeight: 900, color: verdictColor,
              boxShadow: `0 4px 20px ${verdictBg}`,
            }}>
              {bill.verdict_label}
            </div>
          )}
          <div style={{
            padding: "18px 44px", borderRadius: 50,
            background: "rgba(255,255,255,0.05)",
            border: "2px solid rgba(255,255,255,0.12)",
            fontSize: 34, fontWeight: 800, color: "#e4e4e7",
          }}>
            {bill.items?.length || 0} Line Items
          </div>
        </div>

        {/* ── Verdict detail ── */}
        {bill.verdict_detail && (
          <div style={{
            ...fade(54),
            textAlign: "center", fontSize: 60, fontWeight: 900,
            color: "#f4f4f5", marginTop: 14,
          }}>
            {bill.verdict_detail.split(/(₹[\d,]+|unnecessary)/gi).map((part: string, i: number) => {
              const isHighlight = /^₹[\d,]+$/.test(part) || part.toLowerCase() === "unnecessary";
              return (
                <span key={i} style={isHighlight ? {
                  color: verdictColor,
                  textShadow: `0 0 30px ${verdictColor}80, 0 0 60px ${verdictColor}40`,
                } : undefined}>
                  {part}
                </span>
              );
            })}
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* ── CTA pinned bottom ── */}
        <div style={{ textAlign: "center", ...fade(58), marginBottom: 10 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#a1a1aa", fontStyle: "italic" }}>
            We inspected every line item.
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: TEAL_BRIGHT, marginTop: 10, letterSpacing: "0.02em", textShadow: `0 0 24px rgba(13,148,136,0.25)` }}>
            {"Swipe for the full breakdown →"}
          </div>
        </div>
      </div>

      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
