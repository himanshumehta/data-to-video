import React from "react";

/**
 * Safe zone wrapper — keeps content away from mobile app UI overlays.
 *
 * Defaults are for 4:5 portrait posts (Instagram/Facebook/Threads carousel):
 *   top 5%, bottom 10%, left/right 4%
 *
 * For 9:16 Reels/Shorts/Stories, pass the "reels" preset or explicit values:
 *   top 14%, bottom 25%, left 7%, right 15%
 *
 * Background elements (glows, bike images) should remain full-bleed outside.
 */

const PRESETS = {
  /** 4:5 posts — minimal UI (username top, like/comment bottom) */
  portrait: { top: "5%", bottom: "10%", left: "4%", right: "4%" },
  /**
   * 9:16 reels/shorts/stories — IG/YT/TikTok overlay safe zones:
   *   top  8%  = 154px  → clears status bar + IG username/follow row
   *   bot 14%  = 269px  → clears caption + music bar + scrubber
   *   left 4%  =  43px  → minimal UI on left
   *   right 8% =  86px  → clears like/comment/share/save button stack
   */
  reels: { top: "8%", bottom: "14%", left: "4%", right: "8%" },
  /** 16:9 landscape — scrubber at bottom, minimal top */
  landscape: { top: "3%", bottom: "8%", left: "2%", right: "2%" },
} as const;

type Preset = keyof typeof PRESETS;

export const SafeZone: React.FC<{
  children: React.ReactNode;
  preset?: Preset;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  style?: React.CSSProperties;
}> = ({
  children,
  preset = "portrait",
  top,
  bottom,
  left,
  right,
  style,
}) => {
  const defaults = PRESETS[preset];
  return (
    <div
      style={{
        position: "absolute",
        top: top ?? defaults.top,
        bottom: bottom ?? defaults.bottom,
        left: left ?? defaults.left,
        right: right ?? defaults.right,
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
