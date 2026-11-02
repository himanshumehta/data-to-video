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
 * Option B -- "Full-bleed Bike + Floating Cards"
 *
 * Bike image fills the entire 1080x1920 frame as background with a heavy
 * dark gradient overlay. Four floating glass-effect cards are scattered at
 * staggered Y positions. Huge total at the bottom. Atmospheric, moody.
 */

interface CostCategory {
  key: string;
  label: string;
  icon: string;
  amount: number;
  pct: number;
  color: string;
}

// Card positions -- staggered for visual interest
const CARD_LAYOUTS = [
  { top: 440, left: 60, right: 420 },   // Fuel -- left-leaning
  { top: 640, left: 380, right: 60 },   // Service -- right-leaning
  { top: 840, left: 100, right: 340 },  // Insurance -- left-leaning
  { top: 1040, left: 320, right: 100 }, // Tyres -- right-leaning
];

export const OptionB: React.FC<PortraitSlideProps> = ({
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

  const categories: CostCategory[] = [
    { key: "fuel", label: "Fuel", icon: "\u26FD", amount: vehicle.annual_fuel, pct: fuelPct, color: C.amber },
    { key: "service", label: "Service", icon: "\uD83D\uDD27", amount: vehicle.annual_service, pct: servicePct, color: C.blue },
    { key: "insurance", label: "Insurance", icon: "\uD83D\uDEE1\uFE0F", amount: vehicle.annual_insurance, pct: insurancePct, color: C.violet },
  ];
  if (vehicle.annual_tyres > 0) {
    categories.push({ key: "tyres", label: "Tyres", icon: "\u2B55", amount: vehicle.annual_tyres, pct: tyresPct, color: C.orange });
  }

  const heroValue = useCountUp(50, 75, annualTotal);

  // Fade + float-in from side
  const cardAnim = (index: number) => {
    const start = 12 + index * 10;
    const fromX = index % 2 === 0 ? -80 : 80;
    const opacity = interpolate(frame, [start, start + 18], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const x = interpolate(frame, [start, start + 18], [fromX, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return { opacity, transform: `translateX(${x}px)` };
  };

  const overlayOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: C.bg }}>
      {/* Full-bleed bike image */}
      {vehicle.primary_nobg_url && (
        <Img
          src={vehicle.primary_nobg_url}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) scale(1.8)",
            width: "100%",
            height: "auto",
            minHeight: "100%",
            objectFit: "cover",
            opacity: 0.35,
            filter: "blur(2px) saturate(0.6)",
          }}
        />
      )}

      {/* Heavy dark gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: overlayOpacity,
          background: `linear-gradient(
            180deg,
            rgba(9,9,11,0.92) 0%,
            rgba(9,9,11,0.70) 25%,
            rgba(9,9,11,0.75) 50%,
            rgba(9,9,11,0.85) 75%,
            rgba(9,9,11,0.97) 100%
          )`,
        }}
      />

      {/* Top section: Logo + title */}
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: interpolate(frame, [0, 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <Logo size={24} startFrame={0} />
        <div
          style={{
            marginTop: 20,
            fontSize: 16,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.3em",
            color: C.text3,
          }}
        >
          Annual Running Cost
        </div>
      </div>

      {/* Bike image -- crisp overlay in upper area */}
      {vehicle.primary_nobg_url && (
        <div
          style={{
            position: "absolute",
            top: 180,
            left: "50%",
            transform: `translateX(-50%) translateY(${interpolate(frame, [3, 18], [40, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}px)`,
            opacity: interpolate(frame, [3, 18], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <Img
            src={vehicle.primary_nobg_url}
            style={{
              height: 220,
              objectFit: "contain",
              filter: "drop-shadow(0 30px 80px rgba(0,0,0,0.9))",
            }}
          />
        </div>
      )}

      {/* Vehicle name */}
      <div
        style={{
          position: "absolute",
          top: 390,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 28,
          fontWeight: 900,
          color: C.text1,
          opacity: interpolate(frame, [8, 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {vehicle.brand_name} {vehicle.short_name}
      </div>

      {/* Floating glass cards */}
      {categories.map((cat, i) => {
        const layout = CARD_LAYOUTS[i] || CARD_LAYOUTS[0];
        return (
          <div
            key={cat.key}
            style={{
              ...cardAnim(i),
              position: "absolute",
              top: layout.top,
              left: layout.left,
              right: layout.right,
              padding: "28px 28px",
              borderRadius: 24,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: `0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)`,
            }}
          >
            {/* Colored accent bar top */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 28,
                right: 28,
                height: 3,
                borderRadius: "0 0 3px 3px",
                background: `linear-gradient(90deg, ${cat.color}, transparent)`,
              }}
            />

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  fontSize: 28,
                  lineHeight: 1,
                }}
              >
                {cat.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: C.text3 }}>
                  {cat.label}
                </div>
                <div style={{ fontSize: 40, fontWeight: 900, color: C.text1, lineHeight: 1.1, marginTop: 2 }}>
                  {formatINRFull(cat.amount)}
                </div>
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: cat.color,
                  background: `${cat.color}15`,
                  padding: "6px 14px",
                  borderRadius: 30,
                }}
              >
                {cat.pct}%
              </div>
            </div>

            {/* Thin colored progress bar */}
            <div
              style={{
                marginTop: 16,
                height: 4,
                borderRadius: 2,
                background: "rgba(255,255,255,0.06)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${cat.pct}%`,
                  borderRadius: 2,
                  background: cat.color,
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Bottom area: huge total */}
      <div
        style={{
          position: "absolute",
          bottom: 180,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: interpolate(frame, [50, 65], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          transform: `translateY(${interpolate(frame, [50, 65], [30, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}px)`,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: C.text4,
            marginBottom: 8,
          }}
        >
          Total Annual Cost
        </div>
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: C.text1,
            letterSpacing: "-0.06em",
            lineHeight: 0.9,
            textShadow: "0 0 80px rgba(245,158,11,0.15), 0 8px 30px rgba(0,0,0,0.5)",
          }}
        >
          {"\u20B9"}{formatINR(heroValue)}
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: C.amber,
            marginTop: 12,
          }}
        >
          {vehicle.cost_per_day_display} / day
        </div>
      </div>

      {/* Slide counter */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 60,
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
