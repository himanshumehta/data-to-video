import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Img,
  Audio,
  Sequence,
  staticFile,
} from "remotion";
import { PortraitSlideProps } from "../../types";
import { C } from "../../utils/colors";
import { SlideBackground } from "../../components/SlideBackground";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";
import { SafeZone } from "../../components/SafeZone";

const CLICK_FRAMES = [0, 6, 14, 22, 38, 50];

export const ReviewProsConsPortrait: React.FC<PortraitSlideProps> = ({
  vehicle,
  slideNumber,
  totalSlides,
}) => {
  const frame = useCurrentFrame();

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

  const pros = (vehicle.pros ?? []).slice(0, 3);
  const cons = (vehicle.cons ?? []).slice(0, 3);

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground />
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
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.25)",
              fontSize: 16,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: C.blue,
            }}
          >
            Honest Take
          </span>
        </div>

        {/* Vehicle image + name */}
        <div
          style={{
            ...fade(4, 12),
            display: "flex",
            justifyContent: "center",
            marginTop: 16,
            height: 120,
          }}
        >
          {vehicle.primary_nobg_url && (
            <Img
              src={vehicle.primary_nobg_url}
              style={{
                height: "100%",
                objectFit: "contain",
                filter:
                  "drop-shadow(0 12px 35px rgba(0,0,0,0.5))",
              }}
            />
          )}
        </div>
        <div
          style={{
            ...fade(8),
            textAlign: "center",
            marginTop: 6,
            fontSize: 28,
            fontWeight: 900,
            color: C.text1,
          }}
        >
          {vehicle.brand_name} {vehicle.short_name}
        </div>

        {/* Two-column layout */}
        <div
          style={{
            display: "flex",
            gap: 20,
            marginTop: 28,
            width: "100%",
            paddingLeft: 28,
            paddingRight: 28,
          }}
        >
          {/* Strengths column */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                ...fade(14),
                fontSize: 18,
                fontWeight: 900,
                color: C.emerald,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                paddingBottom: 10,
                borderBottom: `2px solid ${C.emerald}`,
                marginBottom: 18,
              }}
            >
              Strengths
            </div>
            {pros.map((item, i) => {
              const itemStart = 20 + i * 4;
              return (
                <div
                  key={i}
                  style={{
                    ...fade(itemStart, 10),
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 7,
                      background: "rgba(16,185,129,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      fontWeight: 900,
                      color: C.emerald,
                      flexShrink: 0,
                    }}
                  >
                    +
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: C.text2,
                      lineHeight: 1.4,
                    }}
                  >
                    {item}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div
            style={{
              width: 1,
              background: "rgba(255,255,255,0.06)",
              flexShrink: 0,
            }}
          />

          {/* Watch Out column */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                ...fade(16),
                fontSize: 18,
                fontWeight: 900,
                color: C.red,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                paddingBottom: 10,
                borderBottom: `2px solid ${C.red}`,
                marginBottom: 18,
              }}
            >
              Watch Out
            </div>
            {cons.map((item, i) => {
              const itemStart = 30 + i * 4;
              return (
                <div
                  key={i}
                  style={{
                    ...fade(itemStart, 10),
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 7,
                      background: "rgba(239,68,68,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      fontWeight: 900,
                      color: C.red,
                      flexShrink: 0,
                    }}
                  >
                    {"\u2212"}
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: C.text2,
                      lineHeight: 1.4,
                    }}
                  >
                    {item}
                  </div>
                </div>
              );
            })}
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
