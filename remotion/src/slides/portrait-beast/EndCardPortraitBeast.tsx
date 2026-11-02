import React from "react";
import { AbsoluteFill } from "remotion";
import { PortraitSlideProps } from "../../types";
import { EndCardPortrait } from "../portrait/EndCardPortrait";
import EmberParticles from "../../components/effects/EmberParticles";
import ScanlineOverlay from "../../components/effects/ScanlineOverlay";
import HeatShimmer from "../../components/effects/HeatShimmer";

export const EndCardPortraitBeast: React.FC<PortraitSlideProps> = (props) => (
  <AbsoluteFill style={{ background: "#0d0606" }}>
    <HeatShimmer />
    <EndCardPortrait {...props} />
    <EmberParticles />
    <ScanlineOverlay />
  </AbsoluteFill>
);
