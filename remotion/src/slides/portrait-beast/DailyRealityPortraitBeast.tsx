import React from "react";
import { AbsoluteFill } from "remotion";
import { PortraitSlideProps } from "../../types";
import { DailyRealityPortrait } from "../portrait/DailyRealityPortrait";
import EmberParticles from "../../components/effects/EmberParticles";
import ScanlineOverlay from "../../components/effects/ScanlineOverlay";
import HeatShimmer from "../../components/effects/HeatShimmer";

export const DailyRealityPortraitBeast: React.FC<PortraitSlideProps> = (
  props,
) => (
  <AbsoluteFill style={{ background: "#0d0606" }}>
    <HeatShimmer />
    <DailyRealityPortrait {...props} />
    <EmberParticles />
    <ScanlineOverlay />
  </AbsoluteFill>
);
