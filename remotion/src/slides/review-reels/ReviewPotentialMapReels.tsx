import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Audio,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { PortraitSlideProps } from "../../types";
import { C } from "../../utils/colors";
import { useBarGrow } from "../../utils/animations";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";

const CLICK_FRAMES = [0, 10, 20, 34, 48, 62];

interface PotentialMapScore {
  parameter: string;
  score: number;
  max: number;
  reason: string;
}

/** Short labels for radar axis -- keeps chart readable at small sizes */
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

export const ReviewPotentialMapReels: React.FC<PortraitSlideProps> = ({
  vehicle,
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chartGrow = useBarGrow(16, 22);

  const fade = (start: number, dur: number = 12): React.CSSProperties => ({
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

  // Radar geometry -- slightly smaller for 9:16
  const svgSize = 260;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const maxRadius = 100;

  // Sorted copies for strengths / weaknesses
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const strengths = sorted.filter((s) => s.score >= 9.0).slice(0, 3);
  const weaknesses = [...scores].sort((a, b) => a.score - b.score).slice(0, 3);

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: C.bg }}>
      {/* Click sounds */}
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Orange glow at top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 500,
          background:
            "radial-gradient(ellipse, rgba(249,115,22,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Logo */}
      <div style={{ position: "absolute", top: 154, left: 44, zIndex: 20 }}>
        <Logo size={36} startFrame={0} />
      </div>

      {/* Slide counter */}
      <SlideCounter current={slideNumber} total={totalSlides} variant="reels" />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          top: 240,
          left: 0,
          right: 0,
          bottom: "17%",
          padding: "0 44px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          zIndex: 10,
        }}
      >
        {/* Section pill */}
        <div style={fade(0, 10)}>
          <span
            style={{
              display: "inline-block",
              padding: "10px 32px",
              borderRadius: 50,
              background: "rgba(249,115,22,0.10)",
              border: "1px solid rgba(249,115,22,0.25)",
              fontSize: 20,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: C.orange,
            }}
          >
            Potential Map
          </span>
        </div>

        {/* Vehicle name */}
        <div
          style={{
            ...fade(6),
            fontSize: 48,
            fontWeight: 900,
            color: C.text1,
            textAlign: "center",
          }}
        >
          {vehicle.brand_name} {vehicle.short_name}
        </div>

        {hasData ? (
          <>
            {/* Radar chart */}
            <div
              style={{
                ...fade(10, 8),
                display: "flex",
                justifyContent: "center",
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
                  const labelRadius = maxRadius + 20;
                  const pt = polarToCartesian(cx, cy, labelRadius, angle);
                  let textAnchor: "start" | "middle" | "end" = "middle";
                  if (pt.x < cx - 10) textAnchor = "end";
                  else if (pt.x > cx + 10) textAnchor = "start";
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
                ...fade(32),
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontSize: 56,
                  fontWeight: 900,
                  color: C.orange,
                  lineHeight: 1,
                }}
              >
                {overallScore.toFixed(1)}
              </span>
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: C.text4,
                  marginLeft: 6,
                }}
              >
                / 10
              </span>
            </div>

            {/* Verdict */}
            {verdict && (
              <div
                style={{
                  ...fade(36),
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: 600,
                  color: C.text3,
                  fontStyle: "italic",
                  paddingLeft: 12,
                  paddingRight: 12,
                }}
              >
                {verdict}
              </div>
            )}

            {/* Strengths row */}
            {strengths.length > 0 && (
              <div
                style={{
                  ...fade(42),
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {strengths.map((s, i) => (
                  <span
                    key={`str-${i}`}
                    style={{
                      display: "inline-block",
                      padding: "8px 20px",
                      borderRadius: 50,
                      background: "rgba(16,185,129,0.10)",
                      border: "1px solid rgba(16,185,129,0.25)",
                      fontSize: 18,
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
                  ...fade(52),
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {weaknesses.map((s, i) => (
                  <span
                    key={`wk-${i}`}
                    style={{
                      display: "inline-block",
                      padding: "8px 20px",
                      borderRadius: 50,
                      background: "rgba(245,158,11,0.10)",
                      border: "1px solid rgba(245,158,11,0.25)",
                      fontSize: 18,
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
              ...fade(10),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              marginTop: 80,
              padding: "40px 0",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                background: "rgba(249,115,22,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                color: C.orange,
              }}
            >
              {"\u26A1"}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.text2 }}>
              Potential map data not available
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 500,
                color: C.text4,
                textAlign: "center",
              }}
            >
              No performance dimensions on record
            </div>
          </div>
        )}
      </div>

      <ProgressDots
        current={slideNumber}
        total={totalSlides}
        activeColor={C.orange}
        startFrame={0}
        variant="reels"
      />
      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
