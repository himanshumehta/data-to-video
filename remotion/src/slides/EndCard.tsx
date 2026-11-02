import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Audio, Sequence, staticFile } from "remotion";
import { SlideProps } from "../types";
import { C } from "../utils/colors";
import { Logo } from "../components/Logo";
import { Watermark } from "../components/Watermark";
import { SlideBackground } from "../components/SlideBackground";
import { BikeImage } from "../components/BikeImage";
import { SPRING_CONFIG } from "../utils/animations";

const CLICK_FRAMES = [0, 15, 30, 45, 80, 95];

export const EndCard: React.FC<SlideProps> = ({ vehicle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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

  const logoSpring = spring({
    frame,
    fps,
    config: { ...SPRING_CONFIG, stiffness: 60 },
  });
  const logoScale = 0.6 + logoSpring * 0.4;

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground edgeLightColor={C.emerald} />

      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={i} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Centered content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 30,
        }}
      >
        {/* Logo */}
        <div
          style={{
            opacity: logoSpring,
            transform: `scale(${logoScale})`,
          }}
        >
          <Logo size={200} startFrame={0} />
        </div>

        {/* Subscribe CTA */}
        <div
          style={{
            ...fade(15, 20),
            fontSize: 120,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: C.emerald,
            textShadow: `0 0 80px rgba(16,185,129,0.2)`,
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          LIKE, SUBSCRIBE & SHARE
        </div>

        {/* Comment prompt */}
        <div
          style={{
            ...fade(30, 20),
            fontSize: 72,
            fontWeight: 600,
            color: C.text3,
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          Comment your real monthly expense below
        </div>

        {/* Gradient divider */}
        <div
          style={{
            ...fade(45, 15),
            width: 600,
            height: 3,
            background: `linear-gradient(90deg, transparent, ${C.emerald}66, ${C.blue}66, transparent)`,
            margin: "10px 0",
          }}
        />

        {/* Domain with colored letters */}
        <div
          style={{
            ...fade(80, 25),
            fontSize: 150,
            fontWeight: 900,
            letterSpacing: -2,
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: C.blue }}>bike</span>
          <span style={{ color: "#fff" }}>n</span>
          <span style={{ color: C.rose }}>cars</span>
          <span style={{ color: C.text3 }}>.com</span>
        </div>

        {/* Social handle pill */}
        <div
          style={{
            ...fade(95, 20),
            padding: "16px 48px",
            borderRadius: 100,
            background: "rgba(255,255,255,0.04)",
            border: "2px solid rgba(255,255,255,0.08)",
            fontSize: 54,
            fontWeight: 700,
            color: C.text2,
            whiteSpace: "nowrap",
          }}
        >
          @bikencars_official
        </div>
      </div>

      <BikeImage
        src={vehicle.primary_nobg_url}
        opacity={0.08}
        width="50%"
        startFrame={5}
      />

      <Watermark />
    </AbsoluteFill>
  );
};
