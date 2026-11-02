import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Audio,
  Sequence,
  staticFile,
} from "remotion";
import { PortraitSlideProps } from "../../types";
import { C } from "../../utils/colors";
import { SPRING_CONFIG } from "../../utils/animations";
import { SlideBackground } from "../../components/SlideBackground";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { SafeZone } from "../../components/SafeZone";

const CLICK_FRAMES = [5, 15, 22, 28, 35, 45];

export const EndCardPortrait: React.FC<PortraitSlideProps> = ({
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fade = (start: number, dur: number = 15) => ({
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
  const logoScale = 0.6 + logoSpring * 0.4;

  // Divider grow animation starting at frame 28
  const dividerWidth = interpolate(frame, [28, 28 + 15], [0, 300], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground />
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Brand glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          height: 600,
          background:
            "radial-gradient(ellipse, rgba(71,131,255,0.05) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Emerald glow */}
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 400,
          background:
            "radial-gradient(ellipse, rgba(16,185,129,0.035) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Edge light */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background:
            "linear-gradient(90deg, transparent 5%, rgba(71,131,255,0.15) 30%, rgba(71,131,255,0.25) 50%, rgba(71,131,255,0.15) 70%, transparent 95%)",
          zIndex: 20,
        }}
      />

      {/* Background lines pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(255,255,255,0.012) 59px, rgba(255,255,255,0.012) 60px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Safe zone content */}
      <SafeZone style={{ zIndex: 10, alignItems: "center", justifyContent: "center" }}>
        {/* Large brand logo — 72px */}
        <div
          style={{
            marginBottom: 48,
            opacity: logoSpring,
            transform: `scale(${logoScale})`,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: -2,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: C.blue }}>Bike</span>
            <span
              style={{
                color: "#fff",
                display: "inline-block",
                transform: "rotate(-12deg)",
                textShadow: "0 0 30px rgba(255,255,255,0.4)",
                fontStyle: "italic",
              }}
            >
              N
            </span>
            <span style={{ color: C.rose }}>Cars</span>
          </div>
        </div>

        {/* CTA primary — 42px emerald */}
        <div
          style={{
            ...fade(15),
            fontSize: 42,
            fontWeight: 900,
            color: C.emerald,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 16,
            textShadow: "0 0 40px rgba(16,185,129,0.15)",
            textAlign: "center",
          }}
        >
          Like, Save & Share
        </div>

        {/* CTA secondary */}
        <div
          style={{
            ...fade(22),
            fontSize: 26,
            fontWeight: 600,
            color: C.text3,
            lineHeight: 1.4,
            marginBottom: 48,
            textAlign: "center",
          }}
        >
          Drop your real monthly expense below
        </div>

        {/* Divider — grows from center */}
        <div
          style={{
            width: dividerWidth,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(71,131,255,0.2), transparent)",
            marginBottom: 48,
            opacity: interpolate(frame, [28, 28 + 5], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />

        {/* Domain */}
        <div
          style={{
            ...fade(35),
            fontSize: 36,
            fontWeight: 900,
            letterSpacing: "0.04em",
            marginBottom: 28,
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
              textShadow: "0 0 20px rgba(255,255,255,0.5)",
              fontStyle: "italic",
            }}
          >
            n
          </span>
          <span style={{ color: C.rose }}>cars</span>
          <span style={{ color: C.text4 }}>.com</span>
        </div>

        {/* Social handle pill */}
        <div
          style={{
            ...fade(45),
            display: "flex",
            gap: 16,
            alignItems: "center",
          }}
        >
          <div
            style={{
              padding: "14px 28px",
              borderRadius: 50,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: 22,
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
