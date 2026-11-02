import React from "react";
import { AbsoluteFill } from "remotion";
import { PortraitSlideProps } from "../../types";
import { ServiceDeepDivePortrait } from "../portrait/ServiceDeepDivePortrait";
import EmberParticles from "../../components/effects/EmberParticles";
import ScanlineOverlay from "../../components/effects/ScanlineOverlay";
import HeatShimmer from "../../components/effects/HeatShimmer";

export const ServiceDeepDivePortraitBeast: React.FC<PortraitSlideProps> = (
  props,
) => (
  <AbsoluteFill style={{ background: "#0d0606" }}>
    <HeatShimmer />
    <ServiceDeepDivePortrait {...props} />
    <EmberParticles />
    <ScanlineOverlay />
  </AbsoluteFill>
);
