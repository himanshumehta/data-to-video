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
import { SlideBackground } from "../../components/SlideBackground";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";
import { SafeZone } from "../../components/SafeZone";

const CLICK_FRAMES = [0, 6, 14, 26, 40, 54];

export const ReviewKnownIssuesPortrait: React.FC<PortraitSlideProps> = ({
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

  const issuesDetail = ((vehicle as any).known_issues_detail ?? []).slice(0, 4);
  const issues = issuesDetail.length > 0
    ? issuesDetail.map((i: any) => i.title || i)
    : (vehicle.known_issues ?? []).slice(0, 4);
  const hasIssues = issues.length > 0;

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground edgeLightColor={C.red} />
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
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              fontSize: 16,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: C.red,
            }}
          >
            Known Issues
          </span>
        </div>

        {/* Vehicle name */}
        <div
          style={{
            ...fade(4),
            textAlign: "center",
            marginTop: 20,
            fontSize: 24,
            fontWeight: 900,
            color: C.text1,
          }}
        >
          {vehicle.brand_name} {vehicle.short_name}
        </div>

        {/* Subtitle */}
        <div
          style={{
            ...fade(6),
            textAlign: "center",
            marginTop: 6,
            fontSize: 17,
            fontWeight: 600,
            color: C.text3,
          }}
        >
          What to watch out for
        </div>

        {/* Count badge */}
        <div
          style={{
            ...fade(10),
            textAlign: "center",
            marginTop: 16,
          }}
        >
          <span
            style={{
              display: "inline-block",
              padding: "6px 18px",
              borderRadius: 50,
              background: hasIssues
                ? "rgba(239,68,68,0.08)"
                : "rgba(16,185,129,0.08)",
              border: `1px solid ${
                hasIssues
                  ? "rgba(239,68,68,0.18)"
                  : "rgba(16,185,129,0.18)"
              }`,
              fontSize: 15,
              fontWeight: 700,
              color: hasIssues ? C.red : C.emerald,
            }}
          >
            {hasIssues
              ? `${issues.length} reported issue${issues.length > 1 ? "s" : ""}`
              : "No major issues reported"}
          </span>
        </div>

        {/* Issue list */}
        <div
          style={{
            marginTop: 28,
            width: "100%",
            paddingLeft: 36,
            paddingRight: 36,
          }}
        >
          {hasIssues ? (
            issues.map((issue: string, i: number) => {
              const itemStart = 18 + i * 4;
              return (
                <div
                  key={i}
                  style={{
                    ...fade(itemStart, 12),
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 16,
                    padding: "20px 22px",
                    marginBottom: 14,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderBottom: "1px solid rgba(239,68,68,0.08)",
                    borderRadius: 16,
                  }}
                >
                  {/* Warning icon */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(245,158,11,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {"\u26A0"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: C.text2,
                        lineHeight: 1.4,
                      }}
                    >
                      {issue}
                    </div>
                    {issuesDetail[i] && (
                      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 4,
                          background: issuesDetail[i].severity === "moderate"
                            ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.06)",
                          color: issuesDetail[i].severity === "moderate"
                            ? C.amber : C.text4,
                          textTransform: "uppercase",
                        }}>
                          {issuesDetail[i].severity}
                        </span>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 4,
                          background: "rgba(255,255,255,0.04)",
                          color: C.text4,
                        }}>
                          {(issuesDetail[i].frequency || "").replace("_", " ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div
              style={{
                ...fade(18),
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                padding: "48px 0",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  background: "rgba(16,185,129,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  fontWeight: 900,
                  color: C.emerald,
                }}
              >
                {"\u2713"}
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: C.text2,
                }}
              >
                No major issues reported
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: C.text4,
                }}
              >
                Clean track record so far
              </div>
            </div>
          )}
        </div>

        {/* Bottom note */}
        <div
          style={{
            ...fade(50),
            textAlign: "center",
            marginTop: "auto",
            paddingTop: 20,
            fontSize: 14,
            fontWeight: 500,
            color: C.text4,
            fontStyle: "italic",
          }}
        >
          Based on owner reports and service data
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
