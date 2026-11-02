import React from "react";
import { AbsoluteFill } from "remotion";
import { PortraitSlideProps } from "../../types";
import { VsSegmentPortrait } from "../portrait/VsSegmentPortrait";
import EmberParticles from "../../components/effects/EmberParticles";
import ScanlineOverlay from "../../components/effects/ScanlineOverlay";
import HeatShimmer from "../../components/effects/HeatShimmer";

export const VsSegmentPortraitBeast: React.FC<PortraitSlideProps> = (
  props,
) => (
  <AbsoluteFill style={{ background: "#0d0606" }}>
    <HeatShimmer />
    <VsSegmentPortrait {...props} />
    <EmberParticles />
    <ScanlineOverlay />
  </AbsoluteFill>
);
