import React from "react";
import { AbsoluteFill } from "remotion";
import { PortraitSlideProps } from "../../types";
import { HookPortrait } from "../portrait/HookPortrait";
import EmberParticles from "../../components/effects/EmberParticles";
import ScanlineOverlay from "../../components/effects/ScanlineOverlay";
import HeatShimmer from "../../components/effects/HeatShimmer";

export const HookPortraitBeast: React.FC<PortraitSlideProps> = (props) => (
  <AbsoluteFill style={{ background: "#0d0606" }}>
    <HeatShimmer />
    <HookPortrait {...props} />
    <EmberParticles />
    <ScanlineOverlay />
  </AbsoluteFill>
);
