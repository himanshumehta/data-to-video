import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Img,
  Audio,
  Sequence,
  staticFile,
  useVideoConfig,
  spring,
} from "remotion";
import { PortraitSlideProps } from "../../types";
import { resolveImage } from "../../utils/resolveImage";
import { C } from "../../utils/colors";
import { useCountUp, SPRING_CONFIG } from "../../utils/animations";
import { formatINR, formatINRFull, formatINRShort } from "../../utils/format";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";

const CLICK_FRAMES = [5, 18, 26, 34, 42, 52];

export const EndCardReels: React.FC<PortraitSlideProps> = ({
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fade = (start: number, dur: number = 15): React.CSSProperties => ({
    opacity: interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    transform: `translateY(${interpolate(
      frame,
      [start, start + dur],
      [30, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    )}px)`,
  });

  // Logo spring scale animation starting at frame 5
  const logoSpring = spring({
    frame: Math.max(0, frame - 5),
    fps,
    config: { ...SPRING_CONFIG, stiffness: 60 },
  });
  const logoScale = 0.4 + logoSpring * 0.6;

  // Divider grow animation starting at frame 34 -- 500px target
  const dividerWidth = interpolate(frame, [34, 34 + 18], [0, 500], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", background: C.bg }}>
      {/* Click sounds */}
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* ── ATMOSPHERIC BACKGROUND ── */}

      {/* Large blue radial glow at top 30% */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 1200,
          height: 700,
          background:
            "radial-gradient(ellipse, rgba(71,131,255,0.06) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Emerald radial glow at bottom 30% */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 1100,
          height: 650,
          background:
            "radial-gradient(ellipse, rgba(16,185,129,0.04) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Repeating horizontal lines -- every 80px */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(255,255,255,0.012) 79px, rgba(255,255,255,0.012) 80px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Subtle edge light */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background:
            "linear-gradient(90deg, transparent 5%, rgba(71,131,255,0.12) 30%, rgba(71,131,255,0.20) 50%, rgba(71,131,255,0.12) 70%, transparent 95%)",
          zIndex: 20,
        }}
      />

      {/* ── CENTERED CONTENT ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          padding: "0 60px",
          gap: 0,
        }}
      >
        {/* Logo -- 120px with spring scale */}
        <div
          style={{
            marginBottom: 70,
            opacity: logoSpring,
            transform: `scale(${logoScale})`,
          }}
        >
          <Logo size={120} startFrame={-20} />
        </div>

        {/* CTA primary -- 64px emerald with glow */}
        <div
          style={{
            ...fade(18),
            fontSize: 64,
            fontWeight: 900,
            color: C.emerald,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 28,
            textShadow:
              "0 0 60px rgba(16,185,129,0.25), 0 0 120px rgba(16,185,129,0.10)",
            textAlign: "center",
          }}
        >
          Like, Save & Share
        </div>

        {/* Sub text -- 32px dim */}
        <div
          style={{
            ...fade(26),
            fontSize: 32,
            fontWeight: 600,
            color: C.text3,
            lineHeight: 1.4,
            marginBottom: 70,
            textAlign: "center",
          }}
        >
          Drop your real monthly expense below
        </div>

        {/* Divider -- grows from center, 500px gradient */}
        <div
          style={{
            width: dividerWidth,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(71,131,255,0.30), transparent)",
            marginBottom: 70,
            opacity: interpolate(frame, [34, 34 + 6], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />

        {/* Domain -- 56px with colored spans */}
        <div
          style={{
            ...fade(42),
            fontSize: 56,
            fontWeight: 900,
            letterSpacing: "0.04em",
            marginBottom: 60,
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: C.blue }}>bike</span>
          <span
            style={{
              color: "#fff",
              display: "inline-block",
              transform: "rotate(-12deg)",
              textShadow: "0 0 30px rgba(255,255,255,0.5)",
              fontStyle: "italic",
            }}
          >
            n
          </span>
          <span style={{ color: C.rose }}>cars</span>
          <span style={{ color: C.text4 }}>.com</span>
        </div>

        {/* Social handle pill -- 36px */}
        <div
          style={{
            ...fade(52),
            padding: "22px 52px",
            borderRadius: 50,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: 36,
            fontWeight: 700,
            color: C.text3,
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: C.blue, fontWeight: 800 }}>@</span>
          bikencars_official
        </div>
      </div>

      {/* Watermark is hidden on end card since domain is already shown */}
    </AbsoluteFill>
  );
};
