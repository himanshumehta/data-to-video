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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type V = any;

/*
 * Blueprint rules (from ownership-cost analysis):
 *  - Single SafeZone per slide: { zIndex: 10, alignItems: "center" }
 *  - No paddingLeft/Right on SafeZone (uses defaults: left 4%, right 4%)
 *  - Content insets via margin: "Xpx 58px 0" on containers
 *  - No flex:1 stretching on data rows; natural content height + margins
 *  - Bike image 180-260px, centered, drop-shadow filter
 *  - Hero numbers: 72-96px, textShadow glow
 *  - Row fonts: 20px labels, 20-26px values
 *  - Glass cards: bg rgba(255,255,255,0.04), border 0.08, borderRadius 20
 *  - ProgressDots + Watermark OUTSIDE SafeZone
 */

const CLICK_FRAMES = [0, 5, 12, 25, 38, 50];

const Clicks: React.FC = () => (
  <>
    {CLICK_FRAMES.map((vf, i) => (
      <Sequence key={`click-${i}`} from={vf} durationInFrames={6}>
        <Audio src={staticFile("click.wav")} volume={0.35} />
      </Sequence>
    ))}
  </>
);

const DualGlow: React.FC<{ top?: string; bottom?: string }> = ({
  top = "rgba(71,131,255,0.05)",
  bottom = "rgba(245,158,11,0.04)",
}) => (
  <>
    <div style={{ position: "absolute", top: "5%", left: "50%", transform: "translateX(-50%)", width: 900, height: 400, background: `radial-gradient(ellipse, ${top} 0%, transparent 70%)`, pointerEvents: "none", zIndex: 1 }} />
    <div style={{ position: "absolute", bottom: "10%", left: "50%", transform: "translateX(-50%)", width: 700, height: 400, background: `radial-gradient(ellipse, ${bottom} 0%, transparent 70%)`, pointerEvents: "none", zIndex: 1 }} />
  </>
);

const pill = (label: string, color: string, fade: React.CSSProperties, extra?: { bg?: string; border?: string }) => (
  <div style={{ ...fade, marginTop: 16, textAlign: "center" as const }}>
    <span style={{
      display: "inline-block", padding: "10px 28px", borderRadius: 50,
      background: extra?.bg || `${color}1a`, border: `1px solid ${extra?.border || `${color}33`}`,
      fontSize: 15, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.25em", color,
    }}>{label}</span>
  </div>
);

const bikeImg = (url: string | undefined, fade: React.CSSProperties, height = 200) =>
  url ? (
    <div style={{ ...fade, marginTop: 20, height, display: "flex", justifyContent: "center" }}>
      <Img src={url} style={{ height: "100%", objectFit: "contain", filter: "drop-shadow(0 25px 60px rgba(0,0,0,0.7)) drop-shadow(0 0 40px rgba(71,131,255,0.08))" }} />
    </div>
  ) : null;

const barH = (pct: number, color: string, height = 8, grow = 1) => (
  <div style={{ width: "100%", height, borderRadius: height / 2, background: `${color}15`, overflow: "hidden" }}>
    <div style={{ width: `${Math.max(pct * grow, 2)}%`, height: "100%", borderRadius: height / 2, background: color }} />
  </div>
);

const glassRow = (style: React.CSSProperties, children: React.ReactNode) => (
  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 20px", display: "flex", alignItems: "center", gap: 14, ...style }}>
    {children}
  </div>
);

const rankCircle = (n: number | string, color: string) => (
  <div style={{
    width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
    background: `${color}24`, border: `2px solid ${color}4d`, fontSize: 16, fontWeight: 900, color, flexShrink: 0,
  }}>{n}</div>
);

/* ── SLIDE 00 — Hook ────────────────────────────────────────── */

export const VerdictHookPortrait: React.FC<PortraitSlideProps> = ({
  vehicle, slideNumber, totalSlides,
}) => {
  const frame = useCurrentFrame();
  const v: V = vehicle;
  const fade = (s: number, d = 15): React.CSSProperties => ({
    opacity: interpolate(frame, [s, s + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(frame, [s, s + d], [24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
  });

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground edgeLightColor={C.amber} />
      <Clicks />
      <DualGlow bottom="rgba(245,158,11,0.04)" />
      <SlideCounter current={slideNumber} total={totalSlides} startFrame={0} />

      <SafeZone style={{ zIndex: 10, alignItems: "center" }}>
        <Logo size={44} startFrame={0} />
        {pill("Owner Verdict", C.amber, fade(0, 10))}
        {bikeImg(v.primary_nobg_url, fade(2, 8), 180)}

        <div style={{ ...fade(8), textAlign: "center", marginTop: 4 }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.text1 }}>{v.brand_name} {v.short_name}</div>
          <div style={{ fontSize: 18, fontWeight: 500, color: C.text4, marginTop: 2 }}>Real owner reviews analysed</div>
        </div>

        {/* Hero: review count */}
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <div style={{
            fontSize: 96, fontWeight: 900, lineHeight: 0.95, letterSpacing: "-0.04em", color: C.amber,
            textShadow: "0 0 50px rgba(245,158,11,0.2), 0 4px 20px rgba(0,0,0,0.5)",
            opacity: interpolate(frame, [12, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}>
            {v.total_reviews ? (typeof v.total_reviews === "number" ? v.total_reviews.toLocaleString() : v.total_reviews) : "—"}
          </div>
          <div style={{
            fontSize: 18, fontWeight: 600, color: C.text3, marginTop: 10, textTransform: "uppercase", letterSpacing: "0.12em",
            opacity: interpolate(frame, [14, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}>Owner Reviews</div>
        </div>

        {/* Receipt card */}
        <div style={{
          ...fade(28), marginTop: 28, marginLeft: 58, marginRight: 58, width: "calc(100% - 116px)",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden",
        }}>
          <div style={{ ...fade(30), display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", background: "rgba(255,255,255,0.03)", borderBottom: "1px dashed rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: C.text1 }}>{v.brand_name} {v.short_name}</div>
            <div style={{ padding: "7px 16px", borderRadius: 8, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: C.amber, fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>Verdict</div>
          </div>
          <div style={{ padding: "3px 0" }}>
            <div style={{ ...fade(34), display: "flex", justifyContent: "space-between", padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: 20, fontWeight: 600, color: C.text2 }}>Owner Rating</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.emerald }}>{v.overall_rating ?? "—"}/5</div>
            </div>
            <div style={{ ...fade(37), display: "flex", justifyContent: "space-between", padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: 20, fontWeight: 600, color: C.text2 }}>Recommend</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.emerald }}>{v.recommend_pct ?? "—"}%</div>
            </div>
            {v.positive_pct > 0 && (
              <div style={{ ...fade(40), padding: "12px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 20, fontWeight: 900, color: C.emerald, width: 50 }}>{v.positive_pct}%</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text4, width: 64 }}>positive</span>
                  <div style={{ flex: 1 }}>{barH(v.positive_pct, C.emerald, 8)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20, fontWeight: 900, color: C.red, width: 50 }}>{v.negative_pct}%</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text4, width: 64 }}>negative</span>
                  <div style={{ flex: 1 }}>{barH(v.negative_pct, C.red, 8)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SafeZone>

      <ProgressDots current={slideNumber} total={totalSlides} activeColor={C.amber} startFrame={0} />
      <Watermark variant="portrait" />
    </AbsoluteFill>
  );
};

/* ── SLIDE 01 — Rating Overview ─────────────────────────────── */

export const VerdictRatingOverviewPortrait: React.FC<PortraitSlideProps> = ({
  vehicle, slideNumber, totalSlides,
}) => {
  const frame = useCurrentFrame();
  const v: V = vehicle;
  const fade = (s: number, d = 15): React.CSSProperties => ({
    opacity: interpolate(frame, [s, s + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(frame, [s, s + d], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
  });
  const dist: Array<{ stars: number; pct: number }> = v.star_distribution || [];

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground edgeLightColor={C.emerald} />
      <Clicks />
      <DualGlow top="rgba(16,185,129,0.05)" bottom="rgba(16,185,129,0.03)" />
      <SlideCounter current={slideNumber} total={totalSlides} startFrame={0} />

      <SafeZone style={{ zIndex: 10, alignItems: "center" }}>
        <Logo size={28} startFrame={0} />
        {pill("Owner Rating", C.emerald, fade(0, 8))}
        {bikeImg(v.primary_nobg_url, fade(2, 8), 200)}

        <div style={{ ...fade(4, 8), textAlign: "center", marginTop: 4 }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: C.text1 }}>{v.brand_name} {v.short_name}</div>
          <div style={{ fontSize: 17, fontWeight: 500, color: C.text4, marginTop: 2 }}>
            {v.total_reviews ? `${typeof v.total_reviews === "number" ? v.total_reviews.toLocaleString() : v.total_reviews} reviews` : "Owner reviews"}
          </div>
        </div>

        {/* Hero rating */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <div style={{
            fontSize: 72, fontWeight: 900, lineHeight: 0.9, color: C.emerald,
            textShadow: "0 0 50px rgba(16,185,129,0.25)",
            opacity: interpolate(frame, [10, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}>{v.overall_rating ?? "—"}<span style={{ fontSize: 28, color: C.text3 }}>/5</span></div>
          <div style={{
            fontSize: 22, fontWeight: 800, color: C.emerald, letterSpacing: "0.15em", marginTop: 8,
            opacity: interpolate(frame, [14, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}>{v.rating_label?.toUpperCase()}</div>
        </div>

        {/* Divider */}
        <div style={{ ...fade(18, 6), margin: "20px 120px 0", width: "calc(100% - 240px)", height: 1, background: `${C.emerald}33` }} />

        {/* Bars */}
        <div style={{ margin: "16px 58px 0", width: "calc(100% - 116px)" }}>
          {dist.length > 0 ? dist.map((s, i) => {
            const color = s.stars >= 4 ? C.emerald : s.stars === 3 ? C.amber : C.red;
            const grow = interpolate(frame, [22 + i * 4, 42 + i * 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={s.stars} style={{ ...fade(20 + i * 4, 10), display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color, width: 22 }}>{s.stars}</span>
                <span style={{ fontSize: 16, color, width: 90 }}>{"★".repeat(s.stars)}{"☆".repeat(5 - s.stars)}</span>
                <div style={{ flex: 1 }}>{barH(s.pct, color, 14, grow)}</div>
                <span style={{ fontSize: 20, fontWeight: 800, color, width: 48, textAlign: "right" }}>{s.pct}%</span>
              </div>
            );
          }) : v.positive_pct > 0 ? [
            { label: "POSITIVE", pct: v.positive_pct, color: C.emerald },
            { label: "NEUTRAL", pct: v.neutral_pct, color: C.amber },
            { label: "NEGATIVE", pct: v.negative_pct, color: C.red },
          ].map((r, i) => {
            const grow = interpolate(frame, [22 + i * 5, 42 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={r.label} style={{ ...fade(20 + i * 5, 10), marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: r.color }}>{r.label}</span>
                  <span style={{ fontSize: 26, fontWeight: 900, color: r.color }}>{r.pct}%</span>
                </div>
                {barH(r.pct, r.color, 14, grow)}
              </div>
            );
          }) : null}
        </div>
      </SafeZone>

      <ProgressDots current={slideNumber} total={totalSlides} activeColor={C.emerald} startFrame={0} />
      <Watermark variant="portrait" />
    </AbsoluteFill>
  );
};

/* ── SLIDE 02 — What Owners Love ────────────────────────────── */

export const VerdictWhatOwnersLovePortrait: React.FC<PortraitSlideProps> = ({
  vehicle, slideNumber, totalSlides,
}) => {
  const frame = useCurrentFrame();
  const v: V = vehicle;
  const fade = (s: number, d = 15): React.CSSProperties => ({
    opacity: interpolate(frame, [s, s + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(frame, [s, s + d], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
  });
  const praises: Array<{ text: string; pct: number }> = v.praises || [];

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground edgeLightColor={C.emerald} />
      <Clicks />
      <DualGlow bottom="rgba(16,185,129,0.04)" />
      <SlideCounter current={slideNumber} total={totalSlides} startFrame={0} />

      <SafeZone style={{ zIndex: 10, alignItems: "center" }}>
        <Logo size={28} startFrame={0} />
        {pill("What Owners Love", C.emerald, fade(0, 8))}
        {bikeImg(v.primary_nobg_url, fade(2, 8), 240)}

        <div style={{ ...fade(4, 8), textAlign: "center", marginTop: 2 }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: C.text1 }}>{v.brand_name} {v.short_name}</div>
          <div style={{ fontSize: 16, fontWeight: 500, color: C.text4, marginTop: 2 }}>Top praised aspects</div>
        </div>

        <div style={{ ...fade(8, 6), margin: "16px 120px 0", width: "calc(100% - 240px)", height: 1, background: `${C.emerald}33` }} />

        {/* Ranked rows — same pattern as ServiceDeepDive */}
        <div style={{ margin: "16px 58px 0", display: "flex", flexDirection: "column", gap: 6, width: "calc(100% - 116px)" }}>
          {praises.slice(0, 3).map((p, i) => {
            const grow = interpolate(frame, [18 + i * 6, 38 + i * 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return glassRow({ ...fade(12 + i * 8, 10), flexDirection: "column" as const, alignItems: "stretch" as const, gap: 8 },
              <React.Fragment key={i}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {rankCircle(i + 1, C.emerald)}
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.text1, lineHeight: 1.3, flex: 1 }}>{p.text}</div>
                </div>
                {p.pct > 0 && (
                  <div style={{ marginLeft: 50, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1 }}>{barH(p.pct, C.emerald, 8, grow)}</div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: C.emerald }}>{p.pct}%</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </SafeZone>

      <ProgressDots current={slideNumber} total={totalSlides} activeColor={C.emerald} startFrame={0} />
      <Watermark variant="portrait" />
    </AbsoluteFill>
  );
};

/* ── SLIDE 03 — Top Complaints ──────────────────────────────── */

export const VerdictTopComplaintsPortrait: React.FC<PortraitSlideProps> = ({
  vehicle, slideNumber, totalSlides,
}) => {
  const frame = useCurrentFrame();
  const v: V = vehicle;
  const fade = (s: number, d = 15): React.CSSProperties => ({
    opacity: interpolate(frame, [s, s + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(frame, [s, s + d], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
  });
  const complaints: Array<{ text: string; pct: number }> = v.complaints || [];

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground edgeLightColor={C.red} />
      <Clicks />
      <DualGlow bottom="rgba(239,68,68,0.04)" />
      <SlideCounter current={slideNumber} total={totalSlides} startFrame={0} />

      <SafeZone style={{ zIndex: 10, alignItems: "center" }}>
        <Logo size={28} startFrame={0} />
        {pill("Top Complaints", C.red, fade(0, 8), { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)" })}
        {bikeImg(v.primary_nobg_url, fade(2, 8), 240)}

        <div style={{ ...fade(4, 8), textAlign: "center", marginTop: 2 }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: C.text1 }}>{v.brand_name} {v.short_name}</div>
          <div style={{ fontSize: 16, fontWeight: 500, color: C.text4, marginTop: 2 }}>Most reported issues</div>
        </div>

        <div style={{ ...fade(8, 6), margin: "16px 120px 0", width: "calc(100% - 240px)", height: 1, background: `${C.red}33` }} />

        <div style={{ margin: "16px 58px 0", display: "flex", flexDirection: "column", gap: 6, width: "calc(100% - 116px)" }}>
          {complaints.slice(0, 3).map((c, i) => {
            const grow = interpolate(frame, [18 + i * 6, 38 + i * 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return glassRow({ ...fade(12 + i * 8, 10), flexDirection: "column" as const, alignItems: "stretch" as const, gap: 8 },
              <React.Fragment key={i}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {rankCircle(i + 1, C.red)}
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.text1, lineHeight: 1.3, flex: 1 }}>{c.text}</div>
                </div>
                {c.pct > 0 && (
                  <div style={{ marginLeft: 50, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1 }}>{barH(c.pct, C.red, 8, grow)}</div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: C.red }}>{c.pct}%</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </SafeZone>

      <ProgressDots current={slideNumber} total={totalSlides} activeColor={C.red} startFrame={0} />
      <Watermark variant="portrait" />
    </AbsoluteFill>
  );
};

/* ── SLIDE 04 — Owner Profile ───────────────────────────────── */

export const VerdictOwnerProfilePortrait: React.FC<PortraitSlideProps> = ({
  vehicle, slideNumber, totalSlides,
}) => {
  const frame = useCurrentFrame();
  const v: V = vehicle;
  const fade = (s: number, d = 15): React.CSSProperties => ({
    opacity: interpolate(frame, [s, s + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(frame, [s, s + d], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
  });
  const useCases: string[] = v.use_cases || [];

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground edgeLightColor={C.blue} />
      <Clicks />
      <DualGlow bottom="rgba(59,130,246,0.04)" />
      <SlideCounter current={slideNumber} total={totalSlides} startFrame={0} />

      <SafeZone style={{ zIndex: 10, alignItems: "center" }}>
        <Logo size={28} startFrame={0} />
        {pill("Who Buys This", C.blue, fade(0, 8), { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)" })}
        {bikeImg(v.primary_nobg_url, fade(2, 8), 200)}

        <div style={{ ...fade(4, 8), textAlign: "center", marginTop: 4 }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: C.text1 }}>{v.brand_name} {v.short_name}</div>
        </div>

        <div style={{ ...fade(8, 6), margin: "16px 120px 0", width: "calc(100% - 240px)", height: 1, background: `${C.blue}33` }} />

        {/* Profile card */}
        {v.owner_profile && (
          <div style={{ ...fade(12), margin: "16px 58px 0", width: "calc(100% - 116px)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px 20px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text4, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>Typical Buyer</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.text1, lineHeight: 1.35 }}>{v.owner_profile}</div>
          </div>
        )}

        {/* Use cases */}
        {useCases.length > 0 && (
          <div style={{ margin: "16px 58px 0", width: "calc(100% - 116px)" }}>
            <div style={{ ...fade(20), fontSize: 14, fontWeight: 700, color: C.text4, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>Common Use Cases</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {useCases.slice(0, 4).map((uc, i) => (
                glassRow({ ...fade(24 + i * 4, 10), key: i } as any,
                  <React.Fragment key={i}>
                    <div style={{ width: 10, height: 10, borderRadius: 5, background: C.blue, flexShrink: 0, boxShadow: `0 0 8px ${C.blue}66` }} />
                    <div style={{ fontSize: 20, fontWeight: 700, color: C.text2, lineHeight: 1.3 }}>{uc}</div>
                  </React.Fragment>
                )
              ))}
            </div>
          </div>
        )}
      </SafeZone>

      <ProgressDots current={slideNumber} total={totalSlides} activeColor={C.blue} startFrame={0} />
      <Watermark variant="portrait" />
    </AbsoluteFill>
  );
};

/* ── SLIDE 05 — Sentiment Split ─────────────────────────────── */

export const VerdictSentimentSplitPortrait: React.FC<PortraitSlideProps> = ({
  vehicle, slideNumber, totalSlides,
}) => {
  const frame = useCurrentFrame();
  const v: V = vehicle;
  const fade = (s: number, d = 15): React.CSSProperties => ({
    opacity: interpolate(frame, [s, s + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(frame, [s, s + d], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
  });

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground edgeLightColor={C.blue} />
      <Clicks />
      <DualGlow bottom="rgba(59,130,246,0.04)" />
      <SlideCounter current={slideNumber} total={totalSlides} startFrame={0} />

      <SafeZone style={{ zIndex: 10, alignItems: "center" }}>
        <Logo size={28} startFrame={0} />
        {pill("Sentiment Breakdown", C.blue, fade(0, 8), { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)" })}
        {bikeImg(v.primary_nobg_url, fade(2, 8), 200)}

        <div style={{ ...fade(4, 8), textAlign: "center", marginTop: 4 }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: C.text1 }}>{v.brand_name} {v.short_name}</div>
        </div>

        <div style={{ ...fade(8, 6), margin: "20px 120px 0", width: "calc(100% - 240px)", height: 1, background: `${C.blue}33` }} />

        {/* Sentiment bars */}
        {v.positive_pct > 0 && (
          <div style={{ margin: "24px 58px 0", width: "calc(100% - 116px)" }}>
            {[
              { label: "POSITIVE", pct: v.positive_pct, color: C.emerald },
              { label: "NEUTRAL", pct: v.neutral_pct, color: C.amber },
              { label: "NEGATIVE", pct: v.negative_pct, color: C.red },
            ].map((r, i) => {
              const grow = interpolate(frame, [14 + i * 6, 34 + i * 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={r.label} style={{ ...fade(12 + i * 6, 10), marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: r.color }}>{r.label}</span>
                    <span style={{ fontSize: 28, fontWeight: 900, color: r.color }}>{r.pct}%</span>
                  </div>
                  {barH(r.pct, r.color, 14, grow)}
                </div>
              );
            })}
          </div>
        )}

        {/* Recommend hero */}
        {v.recommend_pct != null && (
          <div style={{ ...fade(38), textAlign: "center", marginTop: 28 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text4, textTransform: "uppercase", letterSpacing: "0.12em" }}>Would Recommend</div>
            <div style={{ fontSize: 96, fontWeight: 900, color: C.emerald, lineHeight: 1, marginTop: 8, textShadow: "0 0 40px rgba(16,185,129,0.3)" }}>{v.recommend_pct}%</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: C.text3, marginTop: 4 }}>of owners say YES</div>
          </div>
        )}
      </SafeZone>

      <ProgressDots current={slideNumber} total={totalSlides} activeColor={C.blue} startFrame={0} />
      <Watermark variant="portrait" />
    </AbsoluteFill>
  );
};

/* ── SLIDE 06 — Deal Breakers ───────────────────────────────── */

export const VerdictDealBreakersPortrait: React.FC<PortraitSlideProps> = ({
  vehicle, slideNumber, totalSlides,
}) => {
  const frame = useCurrentFrame();
  const v: V = vehicle;
  const fade = (s: number, d = 15): React.CSSProperties => ({
    opacity: interpolate(frame, [s, s + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(frame, [s, s + d], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
  });
  const breakers: string[] = v.deal_breakers || [];
  const issues: Array<{ title: string; fix_cost?: string }> = v.top_issues || [];
  const items = [
    ...breakers.map((b: string) => ({ text: b, fix: "" })),
    ...issues.slice(0, 5).map((i) => ({ text: i.title, fix: i.fix_cost || "" })),
  ].slice(0, 4);

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground edgeLightColor={C.orange} />
      <Clicks />
      <DualGlow bottom="rgba(249,115,22,0.04)" />
      <SlideCounter current={slideNumber} total={totalSlides} startFrame={0} />

      <SafeZone style={{ zIndex: 10, alignItems: "center" }}>
        <Logo size={28} startFrame={0} />
        {pill("Deal Breakers", C.orange, fade(0, 8), { bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.2)" })}
        {bikeImg(v.primary_nobg_url, fade(2, 8), 200)}

        <div style={{ ...fade(4, 8), textAlign: "center", marginTop: 4 }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: C.text1 }}>{v.brand_name} {v.short_name}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text4, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.15em" }}>Know Before You Buy</div>
        </div>

        <div style={{ ...fade(8, 6), margin: "16px 120px 0", width: "calc(100% - 240px)", height: 1, background: `${C.orange}33` }} />

        {items.length === 0 ? (
          <div style={{ ...fade(12), textAlign: "center", marginTop: 40, fontSize: 22, fontWeight: 700, color: C.text3 }}>No major deal breakers reported</div>
        ) : (
          <div style={{ margin: "16px 58px 0", display: "flex", flexDirection: "column", gap: 6, width: "calc(100% - 116px)" }}>
            {items.map((item, i) =>
              glassRow({ ...fade(12 + i * 6, 10), key: i } as any,
                <React.Fragment key={i}>
                  {rankCircle("!", C.orange)}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: C.text1, lineHeight: 1.3 }}>{item.text}</div>
                    {item.fix && <div style={{ fontSize: 14, fontWeight: 600, color: C.text4, marginTop: 4 }}>Fix: {item.fix}</div>}
                  </div>
                </React.Fragment>
              )
            )}
          </div>
        )}
      </SafeZone>

      <ProgressDots current={slideNumber} total={totalSlides} activeColor={C.orange} startFrame={0} />
      <Watermark variant="portrait" />
    </AbsoluteFill>
  );
};

/* ── SLIDE 07 — Final Verdict ───────────────────────────────── */

export const VerdictVerdictPortrait: React.FC<PortraitSlideProps> = ({
  vehicle, slideNumber, totalSlides,
}) => {
  const frame = useCurrentFrame();
  const v: V = vehicle;
  const fade = (s: number, d = 15): React.CSSProperties => ({
    opacity: interpolate(frame, [s, s + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(frame, [s, s + d], [24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
  });
  const tone = v.verdict_tone || "mixed";
  const toneColor = tone === "positive" ? C.emerald : tone === "mixed" ? C.amber : C.red;
  const toneLabel = tone === "positive" ? "RECOMMENDED" : tone === "mixed" ? "MIXED REVIEWS" : "PROCEED WITH CAUTION";

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground edgeLightColor={toneColor} />
      <Clicks />
      <DualGlow top={`${toneColor}0d`} bottom={`${toneColor}0a`} />
      <SlideCounter current={slideNumber} total={totalSlides} startFrame={0} />

      <SafeZone style={{ zIndex: 10, alignItems: "center" }}>
        <Logo size={36} startFrame={0} />
        {pill("Final Verdict", toneColor, fade(0, 10))}
        {bikeImg(v.primary_nobg_url, fade(2, 8), 200)}

        <div style={{ ...fade(8), textAlign: "center", marginTop: 6 }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.text1 }}>{v.brand_name} {v.short_name}</div>
        </div>

        {/* Rating */}
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <div style={{
            fontSize: 80, fontWeight: 900, color: toneColor, lineHeight: 0.9, textShadow: `0 0 50px ${toneColor}40`,
            opacity: interpolate(frame, [14, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}>{v.overall_rating ?? "—"}<span style={{ fontSize: 30, color: C.text3 }}>/5</span></div>
        </div>

        <div style={{ ...fade(22), textAlign: "center", marginTop: 12 }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: toneColor, letterSpacing: "0.12em" }}>{toneLabel}</div>
        </div>

        {/* Summary card */}
        <div style={{
          ...fade(30), marginTop: 24, marginLeft: 58, marginRight: 58, width: "calc(100% - 116px)",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "3px 0", overflow: "hidden",
        }}>
          {v.praise_1 && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ width: 12, height: 12, borderRadius: 6, background: C.emerald, flexShrink: 0 }} />
              <div style={{ fontSize: 20, fontWeight: 700, color: C.text2, lineHeight: 1.3 }}>{v.praise_1}</div>
            </div>
          )}
          {v.complaint_1 && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px" }}>
              <div style={{ width: 12, height: 12, borderRadius: 6, background: C.red, flexShrink: 0 }} />
              <div style={{ fontSize: 20, fontWeight: 700, color: C.text2, lineHeight: 1.3 }}>{v.complaint_1}</div>
            </div>
          )}
        </div>

        {v.recommend_pct != null && (
          <div style={{ ...fade(42), textAlign: "center", marginTop: 24 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: toneColor, letterSpacing: "0.08em" }}>{v.recommend_pct}% WOULD RECOMMEND</div>
          </div>
        )}
      </SafeZone>

      <ProgressDots current={slideNumber} total={totalSlides} activeColor={toneColor} startFrame={0} />
      <Watermark variant="portrait" />
    </AbsoluteFill>
  );
};

/* ── SLIDE 08 — End Card ────────────────────────────────────── */

export const VerdictEndCardPortrait: React.FC<PortraitSlideProps> = ({
  vehicle, slideNumber, totalSlides,
}) => {
  const frame = useCurrentFrame();
  const v: V = vehicle;
  const fade = (s: number, d = 15): React.CSSProperties => ({
    opacity: interpolate(frame, [s, s + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(frame, [s, s + d], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
  });

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, sans-serif" }}>
      <SlideBackground />
      <Clicks />
      <DualGlow top="rgba(71,131,255,0.05)" bottom="rgba(16,185,129,0.035)" />
      <SlideCounter current={slideNumber} total={totalSlides} startFrame={0} />

      <SafeZone style={{ zIndex: 10, alignItems: "center", justifyContent: "center" }}>
        <Logo size={44} startFrame={0} />

        <div style={{ ...fade(5), textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.amber }}>{v.brand_name}</div>
          <div style={{ fontSize: 40, fontWeight: 900, color: C.text1, marginTop: 4 }}>{v.short_name}</div>
        </div>

        <div style={{ ...fade(15), textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 42, fontWeight: 900, color: C.emerald, textTransform: "uppercase", letterSpacing: "0.08em" }}>Like, Save & Share</div>
          <div style={{ fontSize: 26, fontWeight: 600, color: C.text3, lineHeight: 1.4, marginTop: 16 }}>Follow for more honest{"\n"}owner verdicts</div>
        </div>

        {/* Divider grow animation */}
        <div style={{
          marginBottom: 48,
          width: interpolate(frame, [28, 43], [0, 300], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          height: 1, borderRadius: 1, background: `linear-gradient(90deg, transparent, ${C.blue}, transparent)`,
          opacity: interpolate(frame, [28, 33], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }} />

        <div style={{ ...fade(35), textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: C.text3 }}>Full owner data at</div>
          <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: "0.04em", marginTop: 4 }}>
            <span style={{ color: C.blue }}>bike</span>
            <span style={{ color: C.text1, fontStyle: "italic" }}>N</span>
            <span style={{ color: C.rose }}>cars</span>
            <span style={{ color: C.text4 }}>.com</span>
          </div>
        </div>

        <div style={{ ...fade(45) }}>
          <span style={{ display: "inline-block", padding: "8px 20px", borderRadius: 50, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 18, fontWeight: 700, color: C.text3, letterSpacing: "0.02em" }}>
            @bikencars_official
          </span>
        </div>
      </SafeZone>

      <ProgressDots current={slideNumber} total={totalSlides} startFrame={0} />
      <Watermark variant="portrait" />
    </AbsoluteFill>
  );
};
