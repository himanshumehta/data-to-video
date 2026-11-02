import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Audio, Sequence, staticFile } from "remotion";
import { C } from "../../utils/colors";
import { Logo } from "../../components/Logo";
import { Watermark } from "../../components/Watermark";

const SZ = { top: 288, bottom: 288, left: 86, right: 86 };

interface Props { bill: any; [key: string]: any; }

export const BillCostSplitReels: React.FC<Props> = ({ bill }) => {
  const frame = useCurrentFrame();
  const fade = (s: number, d = 12): React.CSSProperties => ({
    opacity: interpolate(frame, [s, s + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(frame, [s, s + d], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
  });

  const total = (bill.labor_total || 0) + (bill.parts_total || 0) + (bill.tax_amount || 0);
  const segments = [
    { label: "Labor", value: bill.labor_total || 0, display: bill.labor_display, color: C.blue },
    { label: "Parts & Consumables", value: bill.parts_total || 0, display: bill.parts_display, color: C.emerald },
    ...(bill.tax_amount > 0 ? [{ label: "Tax / GST", value: bill.tax_amount, display: bill.tax_display, color: C.amber }] : []),
  ];

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: "#09090b" }}>
      {[0, 12, 28].map((v, i) => <Sequence key={i} from={v} durationInFrames={6}><Audio src={staticFile("click.wav")} volume={0.35} /></Sequence>)}

      <div style={{ position: "absolute", top: 72, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 20 }}>
        <Logo size={48} startFrame={0} />
      </div>

      <div style={{
        position: "absolute", top: SZ.top - 60, left: SZ.left, right: SZ.right, bottom: SZ.bottom,
        display: "flex", flexDirection: "column", zIndex: 10, gap: 20,
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", ...fade(3) }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: "#f4f4f5" }}>{bill.manufacturer_name} {bill.vehicle_name}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text4, textTransform: "uppercase", letterSpacing: "0.2em", marginTop: 8 }}>Where Your Money Went</div>
        </div>

        {/* Stacked bar */}
        <div style={{ ...fade(8) }}>
          <div style={{ display: "flex", height: 60, borderRadius: 14, overflow: "hidden", border: "2px solid rgba(255,255,255,0.06)" }}>
            {segments.map((seg, i) => {
              const pct = total > 0 ? (seg.value / total) * 100 : 0;
              const w = interpolate(frame, [10 + i * 8, 24 + i * 8], [0, pct], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return <div key={i} style={{ width: `${w}%`, background: seg.color, opacity: 0.9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#09090b" }}>{w > 12 ? `${Math.round(pct)}%` : ""}</div>;
            })}
          </div>
        </div>

        {/* Cards */}
        {segments.map((seg, i) => {
          const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
          return (
            <div key={i} style={{
              ...fade(16 + i * 8),
              padding: "24px 24px", borderRadius: 20,
              background: `${seg.color}0A`, border: `2px solid ${seg.color}20`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 5, background: seg.color }} />
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#e4e4e7" }}>{seg.label}</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.text4, marginTop: 4, marginLeft: 28 }}>{pct}% of total</div>
              </div>
              <div style={{ fontSize: 42, fontWeight: 900, color: seg.color }}>{seg.display}</div>
            </div>
          );
        })}

        {/* Spacer + total */}
        <div style={{ flex: 1 }} />
        <div style={{
          ...fade(40),
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 24px", borderRadius: 20,
          background: "rgba(71,131,255,0.06)", border: "2px solid rgba(71,131,255,0.15)",
        }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: C.blue, textTransform: "uppercase", letterSpacing: "0.12em" }}>Total Bill</span>
          <span style={{ fontSize: 48, fontWeight: 900, color: C.blue }}>{bill.total_display}</span>
        </div>
      </div>

      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
