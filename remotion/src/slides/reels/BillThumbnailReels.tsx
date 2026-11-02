import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { resolveImage } from "../../utils/resolveImage";
import { usePreloadImage } from "../../utils/usePreloadImage";
import { C } from "../../utils/colors";
import { Logo } from "../../components/Logo";
import { Watermark } from "../../components/Watermark";

const TEAL = "#0d9488";
const TEAL_BRIGHT = "#14b8a6";
const DARK_BG = "#030f0d";

interface Props {
  bill: any;
  [key: string]: any;
}

export const BillThumbnailReels: React.FC<Props> = ({ bill }) => {
  usePreloadImage(bill?.primary_nobg_url);
  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: DARK_BG }}>
      {/* Teal glow behind vehicle */}
      <div style={{
        position: "absolute", top: 0, right: 0, width: "100%", height: "55%",
        background: "radial-gradient(ellipse at 55% 35%, rgba(13,148,136,0.12) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      {/* Vehicle image — centered, upper half */}
      {bill.primary_nobg_url && (
        <Img
          src={resolveImage(bill.primary_nobg_url)}
          style={{
            position: "absolute",
            top: "6%",
            left: "5%",
            width: "90%",
            height: "42%",
            objectFit: "contain",
            objectPosition: "center center",
            filter: "drop-shadow(0 40px 100px rgba(0,0,0,0.9))",
            zIndex: 2,
          }}
        />
      )}

      {/* Gradient fade below vehicle */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "100%",
        background: `linear-gradient(to top, ${DARK_BG} 42%, rgba(3,15,13,0.85) 55%, transparent 70%)`,
        pointerEvents: "none", zIndex: 3,
      }} />

      {/* Logo — centered top */}
      <div style={{
        position: "absolute", top: 50, left: 0, right: 0,
        display: "flex", justifyContent: "center", zIndex: 20,
      }}>
        <Logo size={48} startFrame={-20} />
      </div>

      {/* Text block — fills lower half */}
      <div style={{
        position: "absolute",
        left: 56,
        right: 56,
        top: "46%",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Vehicle name — massive */}
        <div style={{
          fontSize: 110,
          fontWeight: 900,
          color: "#f4f4f5",
          lineHeight: 0.88,
          textTransform: "uppercase",
          letterSpacing: "-0.04em",
        }}>
          {bill.manufacturer_name}
        </div>
        <div style={{
          fontSize: 110,
          fontWeight: 900,
          color: "#f4f4f5",
          lineHeight: 0.88,
          textTransform: "uppercase",
          letterSpacing: "-0.04em",
        }}>
          {bill.vehicle_name}
        </div>

        {/* Vehicle info badges: year · variant · fuel */}
        <div style={{
          display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20,
        }}>
          {bill.vehicle_year && (
            <span style={{
              padding: "6px 16px", borderRadius: 8,
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#f4f4f5", fontSize: 28, fontWeight: 900,
            }}>
              {bill.vehicle_year}
            </span>
          )}
          {bill.vehicle_variant && (
            <span style={{
              padding: "6px 16px", borderRadius: 8,
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#f4f4f5", fontSize: 28, fontWeight: 900, textTransform: "uppercase",
            }}>
              {bill.vehicle_variant}
            </span>
          )}
          {bill.fuel_type && (
            <span style={{
              padding: "6px 16px", borderRadius: 8,
              background: `${TEAL}20`, border: `1px solid ${TEAL}40`,
              color: TEAL_BRIGHT, fontSize: 28, fontWeight: 900, textTransform: "uppercase",
            }}>
              {bill.fuel_type}
            </span>
          )}
        </div>

        {/* Dynamic title: "PAID SERVICE BILL AT 45,230 KM" */}
        <div style={{
          fontSize: 90,
          fontWeight: 900,
          color: TEAL_BRIGHT,
          lineHeight: 0.92,
          textTransform: "uppercase",
          letterSpacing: "-0.04em",
          marginTop: 20,
        }}>
          {bill.service_type_label}
        </div>
        <div style={{
          fontSize: 90,
          fontWeight: 900,
          color: TEAL_BRIGHT,
          lineHeight: 0.92,
          textTransform: "uppercase",
          letterSpacing: "-0.04em",
        }}>
          BILL
        </div>
        {bill.odometer_km != null && (
          <div style={{
            fontSize: 90,
            fontWeight: 900,
            lineHeight: 0.92,
            textTransform: "uppercase",
            letterSpacing: "-0.04em",
          }}>
            <span style={{ color: C.amber }}>{Number(bill.odometer_km).toLocaleString("en-IN")}</span>
            <span style={{ color: C.amber }}>{" "}KM</span>
          </div>
        )}
        {bill.service_date_display && (
          <div style={{
            fontSize: 90,
            fontWeight: 900,
            color: C.blue,
            lineHeight: 0.92,
            textTransform: "uppercase",
            letterSpacing: "-0.04em",
          }}>
            ON {bill.service_date_display}
          </div>
        )}

        {/* Info blocks — 2 rows */}
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          {[
            ...(bill.is_authorized != null ? [{ label: bill.is_authorized ? "Authorized" : "Local", color: bill.is_authorized ? C.emerald : C.amber, bg: bill.is_authorized ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)", border: bill.is_authorized ? "rgba(16,185,129,0.35)" : "rgba(245,158,11,0.35)", glow: bill.is_authorized ? "rgba(16,185,129,0.20)" : "rgba(245,158,11,0.20)" }] : []),
            ...(bill.odometer_km != null ? [{ label: `${Number(bill.odometer_km).toLocaleString("en-IN")} km`, color: C.blue, bg: "rgba(71,131,255,0.12)", border: "rgba(71,131,255,0.35)", glow: "rgba(71,131,255,0.20)" }] : []),
          ].map((block, i) => (
            <div key={i} style={{
              flex: 1, textAlign: "center",
              padding: "12px 8px", borderRadius: 14,
              background: block.bg, border: `2px solid ${block.border}`,
              boxShadow: `0 0 20px ${block.glow}, inset 0 0 20px ${block.glow}`,
              fontSize: 26, fontWeight: 900, color: block.color,
              textTransform: "uppercase", letterSpacing: "0.04em",
            }}>{block.label}</div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          {[
            ...(bill.vehicle_year ? [{ label: `Purchased ${bill.vehicle_year}`, color: "#a1a1aa", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.12)", glow: "rgba(255,255,255,0.05)" }] : []),
            ...(bill.service_date_display ? [{ label: `Serviced ${bill.service_date_display}`, color: TEAL_BRIGHT, bg: `${TEAL}15`, border: `${TEAL}35`, glow: `${TEAL}20` }] : []),
          ].map((block, i) => (
            <div key={i} style={{
              flex: 1, textAlign: "center",
              padding: "12px 8px", borderRadius: 14,
              background: block.bg, border: `2px solid ${block.border}`,
              boxShadow: `0 0 20px ${block.glow}, inset 0 0 20px ${block.glow}`,
              fontSize: 26, fontWeight: 900, color: block.color,
              letterSpacing: "0.04em",
            }}>{block.label}</div>
          ))}
        </div>
      </div>

      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
