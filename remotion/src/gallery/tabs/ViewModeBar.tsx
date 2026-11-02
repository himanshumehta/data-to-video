/**
 * ViewModeBar — Shared animated/final-frame toggle + language selector.
 * Rendered by each tab after its format selector to preserve the
 * original visual layout order (format -> view mode -> slides).
 */
import React from "react";
import type { GalleryConfig } from "./shared";

interface ViewModeBarProps {
  showFinal: boolean;
  setShowFinal: (v: boolean) => void;
  narrationLang: string;
  setNarrationLang: (l: string) => void;
  config: GalleryConfig | null;
}

export const ViewModeBar: React.FC<ViewModeBarProps> = ({
  showFinal,
  setShowFinal,
  narrationLang,
  setNarrationLang,
  config,
}) => (
  <div style={{ marginBottom: 24, display: "flex", gap: 8 }}>
    <button
      onClick={() => setShowFinal(false)}
      style={{
        padding: "8px 20px",
        borderRadius: 8,
        border: "1px solid",
        borderColor: !showFinal ? "#10b981" : "#27272a",
        background: !showFinal ? "rgba(16,185,129,0.12)" : "#18181b",
        color: !showFinal ? "#10b981" : "#71717a",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "Inter, sans-serif",
      }}
    >
      Animated
    </button>
    <button
      onClick={() => setShowFinal(true)}
      style={{
        padding: "8px 20px",
        borderRadius: 8,
        border: "1px solid",
        borderColor: showFinal ? "#4783ff" : "#27272a",
        background: showFinal ? "rgba(71,131,255,0.12)" : "#18181b",
        color: showFinal ? "#4783ff" : "#71717a",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "Inter, sans-serif",
      }}
    >
      Final Frame
    </button>

    {/* Language selector */}
    {config?.availableLangs && config.availableLangs.length > 1 && (
      <>
        <div style={{ width: 1, background: "#27272a", margin: "0 8px", alignSelf: "stretch" }} />
        {config.availableLangs.map((l) => (
          <button
            key={l}
            onClick={() => setNarrationLang(l)}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: narrationLang === l ? "#a78bfa" : "#27272a",
              background: narrationLang === l ? "rgba(167,139,250,0.12)" : "#18181b",
              color: narrationLang === l ? "#a78bfa" : "#71717a",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              textTransform: "uppercase",
            }}
          >
            {l}
          </button>
        ))}
      </>
    )}
  </div>
);
