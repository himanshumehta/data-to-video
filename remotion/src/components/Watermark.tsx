import React from "react";

interface WatermarkProps {
  /** Use "portrait" for 1080x1350, "reels" for 1080x1920 9:16 */
  variant?: "landscape" | "portrait" | "reels";
}

export const Watermark: React.FC<WatermarkProps> = ({ variant = "landscape" }) => {
  const isPortrait = variant === "portrait";
  const isReels = variant === "reels";
  return (
    <div
      style={{
        position: "absolute",
        bottom: isReels ? "15%" : isPortrait ? "11%" : 48,
        right: isReels ? "4%" : isPortrait ? "5%" : 72,
        fontSize: isReels ? 14 : isPortrait ? 15 : 42,
        color: isReels
          ? "rgba(255,255,255,0.18)"
          : isPortrait
          ? "rgba(255,255,255,0.20)"
          : "rgba(255,255,255,0.15)",
        fontWeight: isReels ? 700 : isPortrait ? 700 : 600,
        letterSpacing: "0.1em",
        zIndex: 10,
      }}
    >
      bikencars.com
    </div>
  );
};
