import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Img, Audio, Sequence, staticFile } from "remotion";
import { C } from "../../utils/colors";
import { resolveImage } from "../../utils/resolveImage";
import { Logo } from "../../components/Logo";
import { Watermark } from "../../components/Watermark";

const TEAL_BRIGHT = "#14b8a6";

interface Props { bill: any; [key: string]: any; }

export const BillOptionalReels: React.FC<Props> = ({ bill }) => {
  const frame = useCurrentFrame();
  const fade = (s: number, d = 12): React.CSSProperties => ({
    opacity: interpolate(frame, [s, s + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(frame, [s, s + d], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
  });

  const upsells = (bill.top_upsells || []).slice(0, 5);
  const greyItems = (bill.grey_area_items || []).slice(0, 4);
  const hasUpsells = upsells.length > 0;
  const hasGreyArea = greyItems.length > 0;
  const total = bill.total_amount || 1;
  const upsellPct = bill.upsell_pct || Math.round(((bill.upsell_total || 0) / total) * 100);

  /* Ring animation */
  const radius = 200;
  const circ = 2 * Math.PI * radius;
  const ringProgress = interpolate(frame, [6, 28], [0, upsellPct / 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ringSize = radius * 2 + 30;

  /* List animation offsets */
  const listStart = 20;
  const listEnd = listStart + upsells.length * 3 + 4;

  /* ── No upsells, but has condition-dependent items ── */
  if (!hasUpsells && hasGreyArea) {
    return (
      <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: "#09090b" }}>
        <div style={{ position: "absolute", top: 72, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 20, pointerEvents: "none" }}>
          <Logo size={72} startFrame={0} />
        </div>

        {bill.primary_nobg_url && (
          <Img src={resolveImage(bill.primary_nobg_url)} style={{
            position: "absolute", top: 200, left: "5%", width: "90%", height: 420,
            objectFit: "contain", objectPosition: "center center",
            filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.7)) drop-shadow(0 0 40px rgba(13,148,136,0.15))",
            zIndex: 2, ...fade(0, 15),
          }} />
        )}

        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 780,
          background: "linear-gradient(to bottom, transparent 46%, rgba(9,9,11,0.3) 58%, rgba(9,9,11,0.80) 72%, #09090b 88%)",
          pointerEvents: "none", zIndex: 3,
        }} />

        <div style={{
          position: "absolute", top: 620, left: 0, right: 0, bottom: 140,
          padding: "0 70px",
          display: "flex", flexDirection: "column", zIndex: 10, gap: 16,
        }}>
          <div style={{ textAlign: "center", ...fade(3) }}>
            <div style={{ fontSize: 58, fontWeight: 900, color: C.amber, textTransform: "uppercase", letterSpacing: "0.18em" }}>
              Review Before Approving
            </div>
          </div>

          <div style={{ fontSize: 36, fontWeight: 800, color: "#fbbf24", textAlign: "center", lineHeight: 1.4, ...fade(8) }}>
            {bill.grey_area_advice || "These items depend on the actual condition of the vehicle."}
          </div>

          <div style={{
            background: "rgba(245,158,11,0.04)", border: "2px solid rgba(245,158,11,0.10)",
            borderRadius: 22, overflow: "hidden", ...fade(14),
          }}>
            {greyItems.map((item: any, idx: number) => (
              <div key={idx} style={{
                ...fade(16 + idx * 4),
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "28px 24px",
                borderBottom: idx < greyItems.length - 1 ? "1px solid rgba(245,158,11,0.06)" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, color: C.amber, flexShrink: 0,
                  }}>?</div>
                  <div style={{ fontSize: 34, fontWeight: 700, color: "#e4e4e7", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                </div>
                <span style={{ fontSize: 38, fontWeight: 900, color: C.amber, flexShrink: 0, marginLeft: 12 }}>{item.price_display}</span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", ...fade(30), marginTop: 8 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: TEAL_BRIGHT }}>
              {"Inspect first, then decide →"}
            </div>
          </div>
        </div>
        <Watermark variant="reels" />
      </AbsoluteFill>
    );
  }

  /* No upsells and no grey area — render nothing, this slide should be skipped */
  if (!hasUpsells && !hasGreyArea) {
    return null;
  }

  /* ── Upsells / Add-ons ── */
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
          <div style={{ fontSize: 58, fontWeight: 900, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.18em" }}>
            Add-On Items
          </div>
        </div>

        {/* ── Large centered ring: radius 200 = 430px ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, ...fade(4) }}>
          <div style={{ position: "relative", width: ringSize, height: ringSize }}>
            <svg width={ringSize} height={ringSize} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={radius + 15} cy={radius + 15} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={24} />
              <circle cx={radius + 15} cy={radius + 15} r={radius} fill="none" stroke={"#ef4444"} strokeWidth={24}
                strokeDasharray={circ} strokeDashoffset={circ * (1 - ringProgress)} strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 18px rgba(239,68,68,0.35))` }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 82, fontWeight: 900, color: "#f4f4f5" }}>{upsellPct}%</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#52525b", textTransform: "uppercase" }}>of bill</div>
            </div>
          </div>
          {/* Amount + count below ring */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 96, fontWeight: 900, color: "#ef4444" }}>{bill.upsell_display || "₹0"}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#71717a", marginTop: 4 }}>{bill.upsell_count || 0} items</div>
          </div>
        </div>

        {/* ── ADD-ON LIST: up to 5 rows × ~90px + footer ~86px ── */}
        <div style={{
          width: "100%",
          background: "rgba(239,68,68,0.03)", border: "2px solid rgba(239,68,68,0.10)",
          borderRadius: 22, overflow: "hidden",
          ...fade(listStart),
        }}>
          {upsells.map((item: any, idx: number) => (
            <div key={idx} style={{
              ...fade(listStart + 2 + idx * 3),
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "32px 26px",
              borderBottom: idx < upsells.length - 1 ? "1px solid rgba(239,68,68,0.06)" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, color: "#ef4444", flexShrink: 0,
                }}>○</div>
                <div style={{ fontSize: 30, fontWeight: 700, color: "#e4e4e7", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
              </div>
              <span style={{ fontSize: 34, fontWeight: 900, color: "#ef4444", flexShrink: 0, marginLeft: 12 }}>{item.price_display}</span>
            </div>
          ))}
          {/* Could have saved footer */}
          <div style={{
            ...fade(listEnd - 2),
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "30px 26px",
            background: "rgba(239,68,68,0.06)", borderTop: "2px solid rgba(239,68,68,0.18)",
          }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Could Have Saved
            </div>
            <div style={{ fontSize: 48, fontWeight: 900, color: "#ef4444", textShadow: `0 0 20px rgba(239,68,68,0.3)` }}>
              {bill.upsell_display}
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* ── CTA pinned bottom ── */}
        <div style={{ textAlign: "center", ...fade(listEnd + 6), marginBottom: 10, width: "100%" }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#a1a1aa", fontStyle: "italic" }}>
            Know what's optional before you pay.
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: TEAL_BRIGHT, marginTop: 10, letterSpacing: "0.02em", textShadow: `0 0 24px rgba(13,148,136,0.25)` }}>
            {"Swipe for labor breakdown →"}
          </div>
        </div>
      </div>

      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
