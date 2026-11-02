import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Img, Audio, Sequence, staticFile } from "remotion";
import { SlideProps } from "../types";
import { C } from "../utils/colors";
import { Logo } from "../components/Logo";
import { Watermark } from "../components/Watermark";
import { SlideBackground } from "../components/SlideBackground";

const CLICK_FRAMES = [5, 12, 20, 30, 38, 46, 54];

export const ReviewSummary: React.FC<SlideProps> = ({ vehicle }) => {
  const frame = useCurrentFrame();

  const fade = (start: number, dur: number = 20) => ({
    opacity: interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    transform: `translateY(${interpolate(frame, [start, start + dur], [40, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })}px)`,
  });

  const verdictText = vehicle.expert_verdict
    ? vehicle.expert_verdict.length > 180
      ? vehicle.expert_verdict.slice(0, 180) + "..."
      : vehicle.expert_verdict
    : "";

  const pros = (vehicle.pros || []).slice(0, 3);
  const cons = (vehicle.cons || []).slice(0, 3);

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground edgeLightColor={C.amber} />

      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={i} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      <div style={{ position: "absolute", top: 70, right: 130, zIndex: 20 }}>
        <Logo size={80} startFrame={0} />
      </div>

      {/* Ghost bike behind content */}
      {vehicle.primary_nobg_url && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 2400,
            zIndex: 2,
            opacity: 0.08,
          }}
        >
          <Img src={vehicle.primary_nobg_url} style={{ width: "100%" }} />
        </div>
      )}

      {/* Main layout: left (title + rating + verdict) + right (pros/cons) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          display: "flex",
          padding: "120px 150px 120px 150px",
          gap: 80,
        }}
      >
        {/* LEFT: accent + brand/model + rating + verdict */}
        <div
          style={{
            flex: 1.1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Accent strip */}
          <div
            style={{
              ...fade(5, 15),
              display: "inline-block",
              background: "rgba(245,158,11,0.12)",
              padding: "10px 28px 10px 0",
              borderLeft: `6px solid ${C.amber}`,
              paddingLeft: 24,
              width: "fit-content",
              marginBottom: 32,
            }}
          >
            <span
              style={{
                fontSize: 72,
                fontWeight: 800,
                color: C.amber,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                whiteSpace: "nowrap",
              }}
            >
              Full Ownership Review
            </span>
          </div>

          {/* Brand + Model */}
          <div style={{ ...fade(12, 20), marginBottom: 40 }}>
            <div style={{ fontSize: 108, fontWeight: 700, color: C.text3, whiteSpace: "nowrap", lineHeight: 1 }}>
              {vehicle.brand_name}
            </div>
            <div
              style={{
                fontSize: 240,
                fontWeight: 900,
                letterSpacing: -6,
                lineHeight: 0.9,
                color: C.text1,
                whiteSpace: "nowrap",
              }}
            >
              {vehicle.short_name}
            </div>
          </div>

          {/* Rating circle */}
          <div
            style={{
              ...fade(20, 20),
              display: "flex",
              alignItems: "center",
              gap: 48,
              marginBottom: 48,
            }}
          >
            <div
              style={{
                width: 320,
                height: 320,
                borderRadius: "50%",
                border: `8px solid ${vehicle.rating_color}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(8,8,10,0.95)",
                boxShadow: `0 0 80px ${vehicle.rating_color}22`,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontSize: 160,
                  fontWeight: 900,
                  color: vehicle.rating_color,
                  lineHeight: 0.88,
                  whiteSpace: "nowrap",
                }}
              >
                {vehicle.expert_rating}
              </div>
              <div style={{ fontSize: 54, fontWeight: 700, color: C.text4, whiteSpace: "nowrap" }}>/ 10</div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 54,
                  fontWeight: 800,
                  color: C.text3,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  marginBottom: 8,
                  whiteSpace: "nowrap",
                }}
              >
                Expert Rating
              </div>
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 900,
                  color: vehicle.rating_color,
                  whiteSpace: "nowrap",
                }}
              >
                {vehicle.expert_rating >= 8.5
                  ? "Outstanding"
                  : vehicle.expert_rating >= 7.5
                  ? "Highly Recommended"
                  : vehicle.expert_rating >= 6.5
                  ? "Recommended"
                  : "Consider Alternatives"}
              </div>
            </div>
          </div>

          {/* Verdict */}
          <div
            style={{
              ...fade(30, 20),
              background: "rgba(255,255,255,0.03)",
              border: "2px solid rgba(255,255,255,0.06)",
              borderLeft: `4px solid ${C.amber}`,
              borderRadius: 16,
              padding: "28px 36px",
              fontSize: 72,
              fontWeight: 600,
              color: C.text2,
              lineHeight: 1.45,
            }}
          >
            {verdictText}
          </div>
        </div>

        {/* RIGHT: Strengths + Watch Out */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 60,
          }}
        >
          {/* Strengths */}
          <div style={{ ...fade(38, 20) }}>
            <div
              style={{
                fontSize: 72,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: C.emerald,
                marginBottom: 28,
                paddingBottom: 16,
                borderBottom: `4px solid ${C.border}`,
                whiteSpace: "nowrap",
              }}
            >
              Strengths
            </div>
            {pros.map((p, i) => (
              <div
                key={i}
                style={{
                  ...fade(40 + i * 6, 15),
                  fontSize: 72,
                  fontWeight: 600,
                  color: C.text2,
                  padding: "20px 0",
                  lineHeight: 1.35,
                  borderBottom: "2px solid rgba(255,255,255,0.04)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 20,
                }}
              >
                <span style={{ color: C.emerald, fontSize: 72, flexShrink: 0, lineHeight: 1.35 }}>+</span>
                {p}
              </div>
            ))}
          </div>

          {/* Watch Out */}
          <div style={{ ...fade(46, 20) }}>
            <div
              style={{
                fontSize: 72,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: C.red,
                marginBottom: 28,
                paddingBottom: 16,
                borderBottom: `4px solid ${C.border}`,
                whiteSpace: "nowrap",
              }}
            >
              Watch Out
            </div>
            {cons.map((c, i) => (
              <div
                key={i}
                style={{
                  ...fade(48 + i * 6, 15),
                  fontSize: 72,
                  fontWeight: 600,
                  color: C.text2,
                  padding: "20px 0",
                  lineHeight: 1.35,
                  borderBottom: "2px solid rgba(255,255,255,0.04)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 20,
                }}
              >
                <span style={{ color: C.red, fontSize: 72, flexShrink: 0, lineHeight: 1.35 }}>&minus;</span>
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Watermark />
    </AbsoluteFill>
  );
};
