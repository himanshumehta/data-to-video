/**
 * SlideCard — Generic slide player card used by all gallery tabs.
 * Renders a single slide in the grid with Player, controls, and curation info.
 */
import React, { useState } from "react";
import { Player, PlayerRef } from "@remotion/player";
import type { SlideDefinition } from "./shared";
import { FPS } from "./shared";
import type { Vehicle, PortraitSlideProps } from "../../types";

const EMPTY_BILL: any = {
  manufacturer_name: "", vehicle_name: "", vehicle_name_raw: "",
  vehicle_year: null, vehicle_variant: null, vehicle_type: "", fuel_type: "",
  primary_nobg_url: null, service_type_label: "", is_authorized: false,
  total_display: "\u2014", total_amount: 0, labor_display: "\u2014", labor_total: 0,
  labor_pct: 0, parts_display: "\u2014", parts_total: 0, tax_display: "\u2014", tax_amount: 0,
  essential_display: "\u2014", essential_count: 0, upsell_display: "\u2014", upsell_count: 0,
  upsell_pct: 0, verdict: "fair", verdict_label: "\u2014", verdict_detail: "",
  potential_savings_display: "\u2014", items: [], top_essentials: [], top_upsells: [],
  top_labor: [], tips: [], odometer_km: null,
};

export const SlideCard: React.FC<{
  slide: SlideDefinition;
  idx: number;
  vehicle: Vehicle;
  totalSlides: number;
  showFinal: boolean;
  playerRef: (ref: PlayerRef | null) => void;
  width: number;
  height: number;
  excluded?: boolean;
  reason?: string;
  billData?: any;
  scriptText?: string;
}> = ({ slide, idx, vehicle, totalSlides, showFinal, playerRef, width, height, excluded, reason, billData, scriptText }) => {
  const [hovered, setHovered] = useState(false);

  // billData is explicitly passed (even if null) for bill slides, undefined for vehicle slides
  const isBillSlide = billData !== undefined;
  const props: any = isBillSlide ? {
    bill: billData || EMPTY_BILL,
    slideNumber: idx + 1,
    totalSlides,
  } : {
    vehicle,
    theme: { name: "default" } as PortraitSlideProps["theme"],
    durationSec: slide.animationFrames / FPS,
    contentMonthYear: new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    lang: "en",
    slideNumber: idx + 1,
    totalSlides,
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#18181b",
        borderRadius: 12,
        overflow: "hidden",
        border: excluded ? "1px solid rgba(239,68,68,0.3)" : "1px solid #27272a",
        opacity: excluded ? 0.4 : 1,
        position: "relative" as const,
      }}
    >
      <Player
        ref={playerRef}
        component={slide.component}
        inputProps={props}
        durationInFrames={slide.animationFrames}
        compositionWidth={width}
        compositionHeight={height}
        fps={FPS}
        style={{
          width: "100%",
          aspectRatio: `${width} / ${height}`,
        }}
        controls={hovered}
        clickToPlay
        loop={!showFinal}
        autoPlay={!showFinal}
        initialFrame={showFinal ? slide.animationFrames - 1 : 0}
        key={`${slide.id}-${showFinal}`}
      />
      <div
        style={{
          padding: "10px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 13, color: excluded ? "#ef4444" : "#a1a1aa", fontWeight: 600 }}>
          {excluded && "\u2717 "}{slide.id} — {slide.name}
        </span>
        <span style={{ fontSize: 11, color: "#52525b" }}>
          {(slide.animationFrames / FPS).toFixed(1)}s
        </span>
      </div>
      {excluded && reason && (
        <div style={{ padding: "0 16px 10px", fontSize: 11, color: "#ef4444", opacity: 0.8 }}>
          {reason}
        </div>
      )}
      {!excluded && reason && (
        <div style={{ padding: "0 16px 10px", fontSize: 11, color: "#10b981", opacity: 0.8 }}>
          {reason}
        </div>
      )}
      {scriptText && (
        <div style={{
          padding: "8px 16px 12px",
          fontSize: 12,
          color: "#a1a1aa",
          lineHeight: 1.5,
          borderTop: "1px solid #27272a",
          fontStyle: "italic",
        }}>
          <span style={{ fontSize: 10, color: "#52525b", fontStyle: "normal", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            script
          </span>
          <br />
          {scriptText}
        </div>
      )}
    </div>
  );
};
