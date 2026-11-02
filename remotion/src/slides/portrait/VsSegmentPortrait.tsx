import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Img,
  useVideoConfig,
  spring,
  Audio,
  Sequence,
  staticFile,
} from "remotion";
import { PortraitSlideProps, Competitor } from "../../types";
import { C } from "../../utils/colors";
import { SlideBackground } from "../../components/SlideBackground";
import { SlideCounter } from "../../components/SlideCounter";
import { ProgressDots } from "../../components/ProgressDots";
import { Watermark } from "../../components/Watermark";
import { Logo } from "../../components/Logo";
import { SafeZone } from "../../components/SafeZone";

const CLICK_FRAMES = [0, 4, 12, 22, 30, 55];

export const VsSegmentPortrait: React.FC<PortraitSlideProps> = ({
  vehicle,
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
      [24, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    )}px)`,
  });

  // Build sorted ranking: combine self + competitors, sort by cost_per_km ascending
  const selfEntry: Competitor & { is_self: boolean } = {
    short_name: vehicle.short_name,
    price_formatted: vehicle.price_formatted,
    cost_5yr_display: `₹ ${(vehicle.total_cost_5yr || 0).toLocaleString("en-IN")}`,
    total_cost_5yr: vehicle.total_cost_5yr || 0,
    cost_per_km: vehicle.cost_per_km,
    is_self: true,
  };

  const competitors = (vehicle.competitors_ownership || []).map((c) => ({
    ...c,
    is_self: false,
  }));

  const allBikes = [...competitors, selfEntry].sort(
    (a, b) => a.cost_per_km - b.cost_per_km
  );

  const selfRank =
    allBikes.findIndex((b) => b.is_self) + 1;

  // Insight text
  let insightSuffix = "";
  if (selfRank === 1) {
    insightSuffix = " -- the cheapest to own in its segment";
  } else if (selfRank === allBikes.length) {
    insightSuffix = " -- the most expensive to own in its segment";
  } else {
    const remaining = allBikes.length - selfRank;
    insightSuffix = ` -- ${remaining} bike${remaining > 1 ? "s" : ""} cost${remaining > 1 ? "" : "s"} more to own`;
  }

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif", width: 1080, height: 1350 }}>
      <SlideBackground edgeLightColor={C.blue} />
      {CLICK_FRAMES.map((vf, i) => (
        <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
          <Audio src={staticFile("click.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* Glows */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 400,
          background: "radial-gradient(ellipse, rgba(71,131,255,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 400,
          background: "radial-gradient(ellipse, rgba(59,130,246,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <SlideCounter current={slideNumber} total={totalSlides} fontSize={18} startFrame={0} />

      {/* Safe zone content */}
      <SafeZone style={{ zIndex: 10, alignItems: "center" }}>
        <Logo size={36} startFrame={0} />

        {/* Section Tag */}
        <div style={{ ...fade(0, 10), textAlign: "center", marginTop: 8 }}>
        <span
          style={{
            display: "inline-block",
            padding: "12px 30px",
            borderRadius: 50,
            background: "rgba(59,130,246,0.1)",
            border: "1px solid rgba(59,130,246,0.2)",
            fontSize: 18,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: C.blue,
          }}
        >
          V/S The Segment
        </span>
      </div>

      {/* Bike */}
      <div
        style={{
          ...fade(12, 10),
          display: "flex",
          justifyContent: "center",
          marginTop: 20,
          height: 260,
        }}
      >
        {vehicle.primary_nobg_url && (
          <Img
            src={vehicle.primary_nobg_url}
            style={{
              height: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0 25px 60px rgba(0,0,0,0.7)) drop-shadow(0 0 40px rgba(71,131,255,0.08))",
            }}
          />
        )}
      </div>

      {/* Vehicle Info */}
        <div style={{ ...fade(12, 10), textAlign: "center", marginTop: 6 }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: C.text1 }}>
            {vehicle.brand_name} {vehicle.short_name}
          </div>
          <div style={{ fontSize: 17, fontWeight: 500, color: C.text4, marginTop: 2 }}>
            Segment Cost Ranking &middot; per km
          </div>
        </div>

      {/* Divider */}
      <div
        style={{
          ...fade(16, 6),
          margin: "24px 120px 0",
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.15), transparent)",
        }}
      />

      {/* Ranking Label */}
      <div
        style={{
          ...fade(18, 8),
          textAlign: "center",
          marginTop: 24,
          fontSize: 16,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          color: C.text4,
        }}
      >
        Segment Cost Ranking
      </div>

        {/* Receipt Table */}
        <div
          style={{
            margin: "16px 0 0",
            background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 18,
          overflow: "hidden",
        }}
      >
        {/* Table Head */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 28px",
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ ...thStyle, width: 50 }}>#</div>
          <div style={{ ...thStyle, flex: 1, paddingRight: 12 }}>Bike</div>
          <div style={{ ...thStyle, width: 170, textAlign: "right", paddingRight: 16 }}>5yr Cost</div>
          <div style={{ ...thStyle, width: 120, textAlign: "right" }}>/km</div>
        </div>

        {/* Table Rows */}
        {allBikes.map((bike, i) => {
          const isSelf = bike.is_self;
          const rowStart = 22 + i * 4;
          const rowOpacity = interpolate(frame, [rowStart, rowStart + 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const rowY = interpolate(frame, [rowStart, rowStart + 10], [12, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          // Self-row glow at frame 50
          const glowOpacity = isSelf
            ? interpolate(frame, [50, 58], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 0;

          return (
            <div
              key={bike.short_name + i}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "18px 28px",
                borderBottom:
                  i < allBikes.length - 1
                    ? isSelf
                      ? "1px solid rgba(249,115,22,0.12)"
                      : "1px solid rgba(255,255,255,0.04)"
                    : "none",
                borderTop: isSelf ? "1px solid rgba(249,115,22,0.12)" : "none",
                background: isSelf
                  ? `rgba(249,115,22,${0.06 + glowOpacity * 0.06})`
                  : "transparent",
                opacity: rowOpacity,
                transform: `translateY(${rowY}px)`,
                boxShadow: isSelf && glowOpacity > 0
                  ? `inset 0 0 30px rgba(249,115,22,${glowOpacity * 0.08})`
                  : "none",
              }}
            >
              {/* Rank */}
              <div
                style={{
                  width: 50,
                  fontSize: isSelf ? 24 : 22,
                  fontWeight: 900,
                  color: isSelf ? C.orange : C.text4,
                }}
              >
                {isSelf ? "\u2605" : i + 1}
              </div>

              {/* Name */}
              <div
                style={{
                  flex: 1,
                  fontSize: isSelf ? 28 : 26,
                  fontWeight: isSelf ? 900 : 700,
                  color: isSelf ? C.orange : C.text3,
                  paddingRight: 12,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {bike.short_name}
              </div>

              {/* 5yr Cost */}
              <div
                style={{
                  width: 170,
                  fontSize: isSelf ? 26 : 24,
                  fontWeight: isSelf ? 900 : 800,
                  color: isSelf ? C.orange : C.text3,
                  textAlign: "right",
                  paddingRight: 16,
                }}
              >
                {bike.cost_5yr_display}
              </div>

              {/* Cost/km */}
              <div
                style={{
                  width: 120,
                  fontSize: isSelf ? 26 : 24,
                  fontWeight: 900,
                  textAlign: "right",
                  color: isSelf ? C.orange : C.blue,
                }}
              >
                {"\u20B9"} {bike.cost_per_km.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

        {/* Insight Card */}
        <div
          style={{
            ...fade(55, 12),
            margin: "24px 0 0",
            padding: "22px 28px",
            textAlign: "center",
            background: "rgba(59,130,246,0.06)",
            border: "1px solid rgba(59,130,246,0.15)",
            borderRadius: 16,
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text2, lineHeight: 1.4 }}>
            <span style={{ color: C.orange, fontWeight: 900 }}>{vehicle.short_name}</span>{" "}
            ranks{" "}
            <span style={{ color: C.blue, fontWeight: 900 }}>
              #{selfRank} of {allBikes.length}
            </span>
            {insightSuffix}
          </div>
        </div>
      </SafeZone>

      {/* Progress Dots + Watermark */}
      <ProgressDots current={slideNumber} total={totalSlides} activeColor={C.blue} startFrame={0} />
      <Watermark variant="portrait" />
    </AbsoluteFill>
  );
};

const thStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  color: C.text4,
};
