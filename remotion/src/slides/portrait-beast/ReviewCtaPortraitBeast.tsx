import React from "react";
import { AbsoluteFill } from "remotion";
import { PortraitSlideProps } from "../../types";
import { ReviewCtaPortrait } from "../portrait/ReviewCtaPortrait";
import EmberParticles from "../../components/effects/EmberParticles";
import ScanlineOverlay from "../../components/effects/ScanlineOverlay";
import HeatShimmer from "../../components/effects/HeatShimmer";

export const ReviewCtaPortraitBeast: React.FC<PortraitSlideProps> = (
  props,
) => (
  <AbsoluteFill style={{ background: "#0d0606" }}>
    <HeatShimmer />
    <ReviewCtaPortrait {...props} />
    <EmberParticles />
    <ScanlineOverlay />
  </AbsoluteFill>
);
