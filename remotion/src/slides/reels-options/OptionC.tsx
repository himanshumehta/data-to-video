import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Img,
  useVideoConfig,
} from "remotion";
import { PortraitSlideProps } from "../../types";
import { C } from "../../utils/colors";
import { useCountUp } from "../../utils/animations";
import { formatINR, formatINRFull } from "../../utils/format";
import { Logo } from "../../components/Logo";

/**
 * Option C -- "Stacked Color Blocks"
 *
 * No bike image. The screen is divided into 4 horizontal color bands,
 * each taking proportional height based on cost percentage. Each band
 * is a full-width solid color at low opacity with category name and
 * amount centered. Header overlay at top with huge total.
 * Bold, maximalist, fills every pixel.
 */

interface CostCategory {
  key: string;
  label: string;
  amount: number;
  pct: number;
  color: string;
  colorRgb: string; // for alpha compositing
}

export const OptionC: React.FC<PortraitSlideProps> = ({
  vehicle,
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const annualTotal = vehicle.annual_total || 0;
  const fuelPct = annualTotal > 0 ? Math.round((vehicle.annual_fuel / annualTotal) * 100) : 0;
  const servicePct = annualTotal > 0 ? Math.round((vehicle.annual_service / annualTotal) * 100) : 0;
  const insurancePct = annualTotal > 0 ? Math.round((vehicle.annual_insurance / annualTotal) * 100) : 0;
  const tyresPct = annualTotal > 0 ? Math.round((vehicle.annual_tyres / annualTotal) * 100) : 0;

  const allCategories: CostCategory[] = [
    { key: "fuel", label: "Fuel", amount: vehicle.annual_fuel, pct: fuelPct, color: C.amber, colorRgb: "245,158,11" },
    { key: "insurance", label: "Insurance", amount: vehicle.annual_insurance, pct: insurancePct, color: C.violet, colorRgb: "139,92,246" },
    { key: "service", label: "Service", amount: vehicle.annual_service, pct: servicePct, color: C.blue, colorRgb: "71,131,255" },
  ];
  if (vehicle.annual_tyres > 0) {
    allCategories.push({ key: "tyres", label: "Tyres", amount: vehicle.annual_tyres, pct: tyresPct, color: C.orange, colorRgb: "249,115,22" });
  }

  // Sort by percentage descending for visual impact
  const categories = [...allCategories].sort((a, b) => b.pct - a.pct);

  const heroValue = useCountUp(10, 35, annualTotal);

  // Available height for bands (between header overlay and footer)
  const BAND_AREA_TOP = 0;
  const BAND_AREA_HEIGHT = 1920;
  const totalPctSum = categories.reduce((s, c) => s + c.pct, 0) || 100;

  // Build band positions
  let yOffset = BAND_AREA_TOP;
  const bands = categories.map((cat, i) => {
    const heightFraction = cat.pct / totalPctSum;
    const bandHeight = Math.max(BAND_AREA_HEIGHT * heightFraction, 200); // min 200px
    const band = { ...cat, y: yOffset, height: bandHeight };
    yOffset += bandHeight;
    return band;
  });

  // Band reveal animation (wipe down)
  const bandReveal = (index: number) => {
    const start = 5 + index * 8;
    const scaleY = interpolate(frame, [start, start + 20], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const opacity = interpolate(frame, [start, start + 12], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return { scaleY, opacity };
  };

  // Content fade within band
  const contentFade = (index: number) => {
    const start = 15 + index * 8;
    return {
      opacity: interpolate(frame, [start, start + 12], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
      transform: `scale(${interpolate(frame, [start, start + 12], [0.9, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })})`,
    };
  };

  // Header overlay fade
  const headerFade = interpolate(frame, [20, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: C.bg }}>
      {/* Color bands */}
      {bands.map((band, i) => {
        const anim = bandReveal(i);
        return (
          <div
            key={band.key}
            style={{
              position: "absolute",
              top: band.y,
              left: 0,
              right: 0,
              height: band.height,
              background: `rgba(${band.colorRgb}, 0.12)`,
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              opacity: anim.opacity,
              transformOrigin: "top",
              transform: `scaleY(${anim.scaleY})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {/* Subtle gradient overlay on each band */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(180deg, rgba(${band.colorRgb}, 0.06) 0%, transparent 100%)`,
                pointerEvents: "none",
              }}
            />

            {/* Large percentage watermark */}
            <div
              style={{
                position: "absolute",
                right: 30,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: Math.max(band.height * 0.5, 80),
                fontWeight: 900,
                color: `rgba(${band.colorRgb}, 0.06)`,
                lineHeight: 1,
                pointerEvents: "none",
              }}
            >
              {band.pct}%
            </div>

            {/* Content */}
            <div style={{ ...contentFade(i), textAlign: "center", zIndex: 2 }}>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: C.text2,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                }}
              >
                {band.label}
              </div>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 900,
                  color: band.color,
                  lineHeight: 1.1,
                  marginTop: 8,
                  textShadow: `0 0 40px rgba(${band.colorRgb}, 0.3)`,
                }}
              >
                {formatINRFull(band.amount)}
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: `rgba(${band.colorRgb}, 0.6)`,
                  marginTop: 6,
                }}
              >
                {band.pct}% of total
              </div>
            </div>
          </div>
        );
      })}

      {/* Divider lines between bands */}
      {bands.map((band, i) =>
        i < bands.length - 1 ? (
          <div
            key={`div-${band.key}`}
            style={{
              position: "absolute",
              top: band.y + band.height,
              left: 60,
              right: 60,
              height: 1,
              background: "rgba(255,255,255,0.08)",
            }}
          />
        ) : null,
      )}

      {/* Header overlay: dark gradient so text reads clearly */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 320,
          background: "linear-gradient(180deg, rgba(9,9,11,0.95) 0%, rgba(9,9,11,0.6) 70%, transparent 100%)",
          pointerEvents: "none",
          opacity: headerFade,
        }}
      />

      {/* Header content */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: headerFade,
        }}
      >
        <Logo size={24} startFrame={0} />
        <div
          style={{
            marginTop: 12,
            fontSize: 16,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.3em",
            color: C.text3,
          }}
        >
          Annual Cost
        </div>
        <div
          style={{
            fontSize: 100,
            fontWeight: 900,
            color: C.text1,
            letterSpacing: "-0.05em",
            lineHeight: 1,
            marginTop: 8,
            textShadow: "0 4px 30px rgba(0,0,0,0.8)",
          }}
        >
          {"\u20B9"}{formatINR(heroValue)}
        </div>
      </div>

      {/* Footer overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 200,
          background: "linear-gradient(0deg, rgba(9,9,11,0.95) 0%, transparent 100%)",
          pointerEvents: "none",
          opacity: headerFade,
        }}
      />

      {/* Footer content */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 20,
          opacity: interpolate(frame, [40, 55], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {/* Bike icon small */}
        {vehicle.primary_nobg_url && (
          <Img
            src={vehicle.primary_nobg_url}
            style={{
              height: 50,
              objectFit: "contain",
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.6))",
            }}
          />
        )}
        <div>
          <div style={{ fontSize: 24, fontWeight: 900, color: C.text1 }}>
            {vehicle.brand_name} {vehicle.short_name}
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.amber }}>
            {vehicle.cost_per_day_display} / day
          </div>
        </div>
      </div>

      {/* Slide counter */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          right: 60,
          fontSize: 14,
          fontWeight: 700,
          color: C.text4,
          opacity: interpolate(frame, [0, 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {slideNumber}/{totalSlides}
      </div>
    </AbsoluteFill>
  );
};
