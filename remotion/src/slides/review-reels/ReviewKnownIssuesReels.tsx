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
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";

const CLICK_FRAMES = [0, 8, 20, 36, 50, 62];

export const ReviewKnownIssuesReels: React.FC<PortraitSlideProps> = ({
  vehicle,
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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

  const issues = (vehicle.known_issues ?? []).slice(0, 4);
  const hasIssues = issues.length > 0;

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: C.bg }}>
      {/* Click sounds */}
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Red glow at top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 500,
          background:
            "radial-gradient(ellipse, rgba(239,68,68,0.06) 0%, transparent 70%)",
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
          gap: 24,
          zIndex: 10,
        }}
      >
        {/* Known Issues pill */}
        <div style={fade(0, 10)}>
          <span
            style={{
              display: "inline-block",
              padding: "10px 32px",
              borderRadius: 50,
              background: "rgba(239,68,68,0.10)",
              border: "1px solid rgba(239,68,68,0.25)",
              fontSize: 20,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: C.red,
            }}
          >
            Known Issues
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

        {/* Subtitle */}
        <div
          style={{
            ...fade(10),
            fontSize: 26,
            fontWeight: 600,
            color: C.text3,
          }}
        >
          What to watch out for
        </div>

        {/* Issue count */}
        {hasIssues && (
          <div
            style={{
              ...fade(14),
              fontSize: 22,
              fontWeight: 700,
              color: C.text4,
            }}
          >
            {issues.length} reported issue{issues.length > 1 ? "s" : ""}
          </div>
        )}

        {/* Issue cards or no-issues message */}
        {hasIssues ? (
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {issues.map((issue, i) => {
              const itemStart = 20 + i * 4;
              return (
                <div
                  key={i}
                  style={{
                    ...fade(itemStart, 10),
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 16,
                    padding: 20,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderLeft: `3px solid ${C.red}`,
                    borderRadius: 12,
                  }}
                >
                  {/* Warning icon */}
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      background: "rgba(245,158,11,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    {"\u26A0"}
                  </div>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 600,
                      color: C.text2,
                      lineHeight: 1.35,
                    }}
                  >
                    {issue}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              ...fade(20),
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "24px 32px",
              background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.15)",
              borderRadius: 12,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(16,185,129,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 900,
                color: C.emerald,
                flexShrink: 0,
              }}
            >
              {"\u2713"}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: C.emerald,
              }}
            >
              No major issues reported
            </div>
          </div>
        )}

        {/* Bottom note */}
        <div
          style={{
            ...fade(50),
            fontSize: 18,
            fontWeight: 600,
            color: C.text4,
            textAlign: "center",
            marginTop: "auto",
          }}
        >
          Based on owner reports and service data
        </div>
      </div>

      <ProgressDots
        current={slideNumber}
        total={totalSlides}
        activeColor={C.red}
        startFrame={0}
        variant="reels"
      />
      <Watermark variant="reels" />
    </AbsoluteFill>
  );
};
