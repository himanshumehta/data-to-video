import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Audio,
  Sequence,
  staticFile,
} from "remotion";
import { C } from "../../utils/colors";
import { Logo } from "../../components/Logo";
import { Watermark } from "../../components/Watermark";

const CLICK_FRAMES = [0, 10, 20, 32, 44, 56];

interface BillItem {
  name: string;
  category: string;
  item_type: string;
  price: number;
  price_display: string;
  insight_class: string;
}

interface BillData {
  manufacturer_name: string;
  vehicle_name: string;
  total_display: string;
  labor_display: string;
  labor_pct: number;
  parts_display: string;
  tax_display: string;
  tax_amount: number;
  essential_display: string;
  essential_count: number;
  upsell_display: string;
  upsell_count: number;
  upsell_pct: number;
  items: BillItem[];
}

interface Props {
  bill: BillData;
  theme?: any;
  durationSec?: number;
  slideNumber?: number;
  totalSlides?: number;
}

export const BillReceiptReels: React.FC<Props> = ({ bill }) => {
  const frame = useCurrentFrame();

  const fade = (start: number, dur: number = 10): React.CSSProperties => ({
    opacity: interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    transform: `translateY(${interpolate(
      frame,
      [start, start + dur],
      [20, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    )}px)`,
  });

  // Color by insight class
  const classColor = (cls: string) => {
    switch (cls) {
      case "essential": return C.emerald;
      case "upsell": return "#ef4444";
      case "labor": return C.blue;
      default: return C.text3;
    }
  };

  const classLabel = (cls: string) => {
    switch (cls) {
      case "essential": return "✓";
      case "upsell": return "⚠";
      case "labor": return "⚙";
      default: return "·";
    }
  };

  // Show top items that have prices
  const visibleItems = bill.items.slice(0, 10);

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: "#09090b" }}>
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Logo */}
      <div style={{ position: "absolute", top: 72, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 20 }}>
        <Logo size={48} startFrame={0} />
      </div>

      {/* Header */}
      <div style={{
        position: "absolute", top: 170, left: 0, right: 0, textAlign: "center", zIndex: 10,
        ...fade(3),
      }}>
        <div style={{ fontSize: 32, fontWeight: 900, color: C.text1 }}>
          {bill.manufacturer_name} {bill.vehicle_name}
        </div>
        <div style={{
          fontSize: 18, fontWeight: 700, color: C.text4,
          textTransform: "uppercase", letterSpacing: "0.2em", marginTop: 8,
        }}>
          Line-by-Line Breakdown
        </div>
      </div>

      {/* Summary bar */}
      <div style={{
        position: "absolute", top: 270, left: "6%", right: "6%", zIndex: 10,
        display: "flex", gap: 12, justifyContent: "center",
        ...fade(6),
      }}>
        <div style={{
          padding: "10px 20px", borderRadius: 12,
          background: "rgba(71,131,255,0.08)", border: "1px solid rgba(71,131,255,0.15)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text4, textTransform: "uppercase" }}>Labor</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.blue }}>{bill.labor_display}</div>
        </div>
        <div style={{
          padding: "10px 20px", borderRadius: 12,
          background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text4, textTransform: "uppercase" }}>Parts</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.emerald }}>{bill.parts_display}</div>
        </div>
        {bill.tax_amount > 0 && (
          <div style={{
            padding: "10px 20px", borderRadius: 12,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text4, textTransform: "uppercase" }}>Tax</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.text3 }}>{bill.tax_display}</div>
          </div>
        )}
      </div>

      {/* Item list */}
      <div style={{
        position: "absolute", top: 380, left: "5%", right: "5%", bottom: 300, zIndex: 10,
        display: "flex", flexDirection: "column", gap: 0,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16, overflow: "hidden",
      }}>
        {visibleItems.map((item, idx) => (
          <div
            key={idx}
            style={{
              ...fade(10 + idx * 3),
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 20px",
              borderBottom: idx < visibleItems.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              background: item.insight_class === "upsell" ? "rgba(239,68,68,0.04)" : "transparent",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
              <span style={{
                fontSize: 16, fontWeight: 900,
                color: classColor(item.insight_class),
                width: 20, textAlign: "center", flexShrink: 0,
              }}>
                {classLabel(item.insight_class)}
              </span>
              <span style={{
                fontSize: 18, fontWeight: 600,
                color: item.insight_class === "upsell" ? "#ef4444" : C.text2,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {item.name}
              </span>
            </div>
            <span style={{
              fontSize: 20, fontWeight: 800, flexShrink: 0, marginLeft: 12,
              color: item.insight_class === "upsell" ? "#ef4444" : C.text1,
            }}>
              {item.price_display}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 250, left: 0, right: 0,
        display: "flex", justifyContent: "center", gap: 24, zIndex: 10,
        ...fade(50),
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.emerald }}>✓ Essential</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#ef4444" }}>⚠ Upsell</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.blue }}>⚙ Labor</span>
      </div>

      {/* Total footer */}
      <div style={{
        position: "absolute", bottom: 180, left: "6%", right: "6%", zIndex: 10,
        ...fade(55),
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 24px", borderRadius: 16,
        background: "rgba(71,131,255,0.06)",
        border: "2px solid rgba(71,131,255,0.15)",
      }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: C.blue, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Total Bill
        </span>
        <span style={{ fontSize: 36, fontWeight: 900, color: C.blue }}>
          {bill.total_display}
        </span>
      </div>

      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
