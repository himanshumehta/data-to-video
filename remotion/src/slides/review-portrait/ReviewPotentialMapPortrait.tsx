import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Audio,
  Sequence,
  staticFile,
} from "remotion";
import { PortraitSlideProps } from "../../types";
import { C } from "../../utils/colors";
import { useBarGrow } from "../../utils/animations";
import { SlideBackground } from "../../components/SlideBackground";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";
import { SafeZone } from "../../components/SafeZone";

const CLICK_FRAMES = [0, 8, 18, 30, 42, 56];

interface PotentialMapScore {
  parameter: string;
  score: number;
  max: number;
  reason: string;
}

/** Short labels for radar axis — keeps chart readable at small sizes */
const SHORT_LABELS: Record<string, string> = {
  "Engine Performance": "Engine Perf.",
  "Fuel Efficiency": "Fuel Eff.",
  Handling: "Handling",
  Braking: "Braking",
  "Build Quality": "Build Qual.",
  "Ride Comfort": "Comfort",
  Design: "Design",
  Features: "Features",
  Safety: "Safety",
  "After-Sales Service": "Service",
  "Value for Money": "Value",
  "Brand Trust": "Brand",
};

function shortenLabel(label: string): string {
  return SHORT_LABELS[label] ?? label;
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number
): { x: number; y: number } {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180; // -90 so 0 deg is top
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

function buildPolygonPoints(
  cx: number,
  cy: number,
  radius: number,
  count: number
): string {
  return Array.from({ length: count }, (_, i) => {
    const angle = (360 / count) * i;
    const pt = polarToCartesian(cx, cy, radius, angle);
    return `${pt.x},${pt.y}`;
  }).join(" ");
}

export const ReviewPotentialMapPortrait: React.FC<PortraitSlideProps> = ({
  vehicle,
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();
  const chartGrow = useBarGrow(12, 20);

  const fade = (start: number, dur: number = 15) => ({
    opacity: interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    transform: `translateY(${interpolate(
      frame,
      [start, start + dur],
      [24, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    )}px)`,
  });

  const vehicleAny = vehicle as unknown as Record<string, unknown>;
  const scores: PotentialMapScore[] =
    (vehicleAny.potential_map_scores as PotentialMapScore[] | undefined) ?? [];
  const verdict: string =
    (vehicleAny.potential_map_verdict as string | undefined) ?? "";
  const overallScore: number =
    (vehicleAny.potential_map_overall as number | undefined) ?? 0;

  const hasData = scores.length >= 3;
  const count = scores.length;

  // Radar geometry
  const svgSize = 300;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const maxRadius = 120;

  // Sorted copies for strengths / weaknesses
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const strengths = sorted.filter((s) => s.score >= 9.0).slice(0, 3);
  const weaknesses = [...scores].sort((a, b) => a.score - b.score).slice(0, 3);

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground edgeLightColor={C.orange} />
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      <SlideCounter
        current={slideNumber}
        total={totalSlides}
        fontSize={18}
        startFrame={0}
      />

      <SafeZone style={{ zIndex: 10, alignItems: "center" }}>
        <Logo size={36} startFrame={0} />

        {/* Section pill */}
        <div style={{ ...fade(0, 10), textAlign: "center", marginTop: 16 }}>
          <span
            style={{
              display: "inline-block",
              padding: "10px 28px",
              borderRadius: 50,
              background: "rgba(249,115,22,0.1)",
              border: "1px solid rgba(249,115,22,0.25)",
              fontSize: 16,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: C.orange,
            }}
          >
            Potential Map
          </span>
        </div>

        {/* Vehicle name */}
        <div
          style={{
            ...fade(4),
            textAlign: "center",
            marginTop: 12,
            fontSize: 24,
            fontWeight: 900,
            color: C.text1,
          }}
        >
          {vehicle.brand_name} {vehicle.short_name}
        </div>

        {hasData ? (
          <>
            {/* Radar chart */}
            <div
              style={{
                ...fade(8, 8),
                display: "flex",
                justifyContent: "center",
                marginTop: 12,
              }}
            >
              <svg
                width={svgSize}
                height={svgSize}
                viewBox={`0 0 ${svgSize} ${svgSize}`}
                style={{ overflow: "visible" }}
              >
                {/* Concentric guide polygons */}
                {[0.33, 0.66, 1.0].map((pct) => (
                  <polygon
                    key={pct}
                    points={buildPolygonPoints(cx, cy, maxRadius * pct, count)}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={1}
                  />
                ))}

                {/* Axis lines */}
                {scores.map((_, i) => {
                  const angle = (360 / count) * i;
                  const outer = polarToCartesian(cx, cy, maxRadius, angle);
                  return (
                    <line
                      key={`axis-${i}`}
                      x1={cx}
                      y1={cy}
                      x2={outer.x}
                      y2={outer.y}
                      stroke="rgba(255,255,255,0.04)"
                      strokeWidth={1}
                    />
                  );
                })}

                {/* Data polygon (animated) */}
                <g
                  style={{
                    transform: `scale(${chartGrow})`,
                    transformOrigin: `${cx}px ${cy}px`,
                  }}
                >
                  <polygon
                    points={scores
                      .map((s, i) => {
                        const angle = (360 / count) * i;
                        const r = (s.score / s.max) * maxRadius;
                        const pt = polarToCartesian(cx, cy, r, angle);
                        return `${pt.x},${pt.y}`;
                      })
                      .join(" ")}
                    fill="rgba(249,115,22,0.15)"
                    stroke={C.orange}
                    strokeWidth={2}
                    strokeLinejoin="round"
                  />

                  {/* Score dots */}
                  {scores.map((s, i) => {
                    const angle = (360 / count) * i;
                    const r = (s.score / s.max) * maxRadius;
                    const pt = polarToCartesian(cx, cy, r, angle);
                    return (
                      <circle
                        key={`dot-${i}`}
                        cx={pt.x}
                        cy={pt.y}
                        r={4}
                        fill={C.orange}
                      />
                    );
                  })}
                </g>

                {/* Axis labels (outside chart, not animated with scale) */}
                {scores.map((s, i) => {
                  const angle = (360 / count) * i;
                  const labelRadius = maxRadius + 22;
                  const pt = polarToCartesian(cx, cy, labelRadius, angle);
                  // Determine text-anchor based on position
                  let textAnchor: "start" | "middle" | "end" = "middle";
                  if (pt.x < cx - 10) textAnchor = "end";
                  else if (pt.x > cx + 10) textAnchor = "start";
                  // Vertical adjustment
                  let dy = 0;
                  if (pt.y < cy - 10) dy = -4;
                  else if (pt.y > cy + 10) dy = 10;
                  else dy = 4;
                  return (
                    <text
                      key={`label-${i}`}
                      x={pt.x}
                      y={pt.y + dy}
                      textAnchor={textAnchor}
                      fontSize={11}
                      fontWeight={700}
                      fill={C.text3}
                      fontFamily="Inter, sans-serif"
                    >
                      {shortenLabel(s.parameter)}
                    </text>
                  );
                })}
              </svg>
            </div>

            {/* Overall score */}
            <div
              style={{
                ...fade(28),
                textAlign: "center",
                marginTop: 8,
              }}
            >
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  color: C.orange,
                  lineHeight: 1,
                }}
              >
                {overallScore.toFixed(1)}
              </span>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: C.text4,
                  marginLeft: 4,
                }}
              >
                / 10
              </span>
            </div>

            {/* Verdict */}
            {verdict && (
              <div
                style={{
                  ...fade(32),
                  textAlign: "center",
                  marginTop: 4,
                  fontSize: 14,
                  fontWeight: 600,
                  color: C.text3,
                  fontStyle: "italic",
                  paddingLeft: 20,
                  paddingRight: 20,
                }}
              >
                {verdict}
              </div>
            )}

            {/* Strengths row */}
            {strengths.length > 0 && (
              <div
                style={{
                  ...fade(38),
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  justifyContent: "center",
                  marginTop: 14,
                }}
              >
                {strengths.map((s, i) => (
                  <span
                    key={`str-${i}`}
                    style={{
                      display: "inline-block",
                      padding: "6px 16px",
                      borderRadius: 50,
                      background: "rgba(16,185,129,0.10)",
                      border: "1px solid rgba(16,185,129,0.25)",
                      fontSize: 13,
                      fontWeight: 800,
                      color: C.emerald,
                    }}
                  >
                    {shortenLabel(s.parameter)} {s.score.toFixed(1)}
                  </span>
                ))}
              </div>
            )}

            {/* Weaknesses row */}
            {weaknesses.length > 0 && (
              <div
                style={{
                  ...fade(46),
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  justifyContent: "center",
                  marginTop: 8,
                }}
              >
                {weaknesses.map((s, i) => (
                  <span
                    key={`wk-${i}`}
                    style={{
                      display: "inline-block",
                      padding: "6px 16px",
                      borderRadius: 50,
                      background: "rgba(245,158,11,0.10)",
                      border: "1px solid rgba(245,158,11,0.25)",
                      fontSize: 13,
                      fontWeight: 800,
                      color: C.amber,
                    }}
                  >
                    {shortenLabel(s.parameter)} {s.score.toFixed(1)}
                  </span>
                ))}
              </div>
            )}
          </>
        ) : (
          /* No data state */
          <div
            style={{
              ...fade(8),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginTop: 60,
              padding: "40px 0",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                background: "rgba(249,115,22,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                color: C.orange,
              }}
            >
              {"\u26A1"}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.text2 }}>
              Potential map data not available
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, color: C.text4 }}>
              No performance dimensions on record
            </div>
          </div>
        )}
      </SafeZone>

      <ProgressDots
        current={slideNumber}
        total={totalSlides}
        startFrame={0}
      />
      <Watermark variant="portrait" />
    </AbsoluteFill>
  );
};
