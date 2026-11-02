import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { PortraitSlideProps } from "../../types";
import { resolveImage } from "../../utils/resolveImage";
import { usePreloadImage } from "../../utils/usePreloadImage";
import { Logo } from "../../components/Logo";
import { Watermark } from "../../components/Watermark";

/**
 * ThumbnailReels — static 9:16 thumbnail for reels/shorts.
 *
 * Design matches YouTube 16:9 thumbnail: bold text fills space,
 * bike behind, "OWNERSHIP COST" in amber. Text left-aligned,
 * flush to edges like the YouTube version.
 */

export const ThumbnailReels: React.FC<PortraitSlideProps> = ({
  vehicle,
}) => {
  usePreloadImage(vehicle.primary_nobg_url);
  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: "#08080a" }}>
      {/* Amber glow behind bike */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "100%",
          height: "55%",
          background:
            "radial-gradient(ellipse at 60% 40%, rgba(245,158,11,0.07) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* Bike image — centered, upper half */}
      {vehicle.primary_nobg_url && (
        <Img
          src={resolveImage(vehicle.primary_nobg_url)}
          style={{
            position: "absolute",
            top: "6%",
            left: "5%",
            width: "90%",
            height: "45%",
            objectFit: "contain",
            objectPosition: "center center",
            filter:
              "drop-shadow(0 40px 100px rgba(0,0,0,0.9))",
            zIndex: 2,
          }}
        />
      )}

      {/* Left fade so text is always readable over bike */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(to top, #08080a 45%, rgba(8,8,10,0.85) 58%, transparent 72%)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />

      {/* Logo — centered top */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          zIndex: 20,
        }}
      >
        <Logo size={48} startFrame={-20} />
      </div>

      {/* Text block — left-aligned, flush, fills lower half */}
      <div
        style={{
          position: "absolute",
          left: 56,
          right: 56,
          top: "48%",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Vehicle name lines — massive, white, uppercase */}
        <div
          style={{
            fontSize: 130,
            fontWeight: 900,
            color: "#f4f4f5",
            lineHeight: 0.88,
            textTransform: "uppercase",
            letterSpacing: "-0.04em",
          }}
        >
          {vehicle.brand_name}
        </div>
        <div
          style={{
            fontSize: 130,
            fontWeight: 900,
            color: "#f4f4f5",
            lineHeight: 0.88,
            textTransform: "uppercase",
            letterSpacing: "-0.04em",
          }}
        >
          {vehicle.short_name}
        </div>

        {/* Variant + fuel + engine type badges for cars */}
        {vehicle.vehicle_type === "car" && (
          <div
            style={{
              marginTop: 16,
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {(vehicle as any).engine_cc && (
              <span style={{
                padding: "6px 16px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#f4f4f5",
                fontSize: 28,
                fontWeight: 900,
              }}>
                {(vehicle as any).engine_cc}cc
              </span>
            )}
            <span style={{
              padding: "6px 16px",
              borderRadius: 8,
              background: "rgba(245,158,11,0.12)",
              border: "1px solid rgba(245,158,11,0.25)",
              color: "#f59e0b",
              fontSize: 28,
              fontWeight: 900,
              textTransform: "uppercase",
            }}>
              {((vehicle as any).fuel_type || "Petrol").toUpperCase()}
            </span>
            {(() => {
              const et = ((vehicle as any).engine_type || "").toLowerCase();
              const isTurbo = et.includes("turbo") || et.includes("tsi") || et.includes("tgdi") || et.includes("tcdi") || et.includes("vgt") || et.includes("crdi") || et.includes("tdci") || et.includes("dci");
              const label = isTurbo ? "TURBO" : "NATURALLY ASPIRATED";
              const color = isTurbo ? "#ef4444" : "#10b981";
              const bg = isTurbo ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.10)";
              const border = isTurbo ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.20)";
              return (
                <span style={{
                  padding: "6px 16px",
                  borderRadius: 8,
                  background: bg,
                  border: `1px solid ${border}`,
                  color,
                  fontSize: 28,
                  fontWeight: 900,
                }}>
                  {label}
                </span>
              );
            })()}
          </div>
        )}

        {/* "OWNERSHIP COST" — amber, same weight */}
        <div
          style={{
            fontSize: 130,
            fontWeight: 900,
            color: "#f59e0b",
            lineHeight: 0.88,
            textTransform: "uppercase",
            letterSpacing: "-0.04em",
            marginTop: vehicle.vehicle_type === "car" ? 16 : 8,
          }}
        >
          OWNERSHIP
        </div>
        <div
          style={{
            fontSize: 130,
            fontWeight: 900,
            color: "#f59e0b",
            lineHeight: 0.88,
            textTransform: "uppercase",
            letterSpacing: "-0.04em",
          }}
        >
          COST
        </div>
      </div>

      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
