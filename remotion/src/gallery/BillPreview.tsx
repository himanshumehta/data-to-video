import React, { useEffect, useState } from "react";
import { Player } from "@remotion/player";
import { loadFont } from "@remotion/google-fonts/Inter";
import { BillHookReels } from "../slides/reels/BillHookReels";
import { BillReceiptReels } from "../slides/reels/BillReceiptReels";

loadFont();

const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

interface BillData {
  [key: string]: any;
}

const SLIDES = [
  { id: "00-hook", name: "Hook", component: BillHookReels, frames: 90 },
  { id: "01-receipt", name: "Receipt", component: BillReceiptReels, frames: 80 },
];

export const BillPreview: React.FC = () => {
  const [bill, setBill] = useState<BillData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/current-bill.json")
      .then((r) => r.json())
      .then((data) => { setBill(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: "#fff", padding: 32 }}>Loading bill data...</div>;
  if (!bill) return <div style={{ color: "#ef4444", padding: 32 }}>No bill data found. Run fetch_service_bill.py first.</div>;

  return (
    <div style={{ padding: 32, maxWidth: 1400, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
        {bill.manufacturer_name} {bill.vehicle_name}
        <span style={{ fontSize: 14, fontWeight: 600, color: "#a78bfa", marginLeft: 12 }}>
          Service Bill Insight
        </span>
      </h1>
      <div style={{ color: "#71717a", fontSize: 14, marginBottom: 24, display: "flex", gap: 16 }}>
        <span>Total: <span style={{ color: "#a1a1aa" }}>{bill.total_display}</span></span>
        <span>Verdict: <span style={{
          color: bill.verdict === "overcharged" ? "#ef4444" : bill.verdict === "mixed" ? "#f59e0b" : "#10b981",
          fontWeight: 700,
        }}>{bill.verdict_label}</span></span>
        <span>{bill.items?.length} items</span>
        <span>Upsells: {bill.upsell_count} ({bill.upsell_display})</span>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
        gap: 24,
      }}>
        {SLIDES.map((slide) => {
          const Comp = slide.component;
          return (
            <div key={slide.id} style={{
              background: "#18181b",
              borderRadius: 16,
              border: "1px solid #27272a",
              overflow: "hidden",
            }}>
              <Player
                component={Comp}
                inputProps={{ bill }}
                durationInFrames={slide.frames}
                compositionWidth={WIDTH}
                compositionHeight={HEIGHT}
                fps={FPS}
                style={{ width: "100%", aspectRatio: `${WIDTH} / ${HEIGHT}` }}
                controls
                clickToPlay
                loop
              />
              <div style={{ padding: "10px 16px", fontSize: 13, color: "#a1a1aa", fontWeight: 600 }}>
                {slide.id} — {slide.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
