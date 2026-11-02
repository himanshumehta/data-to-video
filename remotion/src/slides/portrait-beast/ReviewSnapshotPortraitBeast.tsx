import React from "react";
import { AbsoluteFill } from "remotion";
import { PortraitSlideProps } from "../../types";
import { ReviewSnapshotPortrait } from "../portrait/ReviewSnapshotPortrait";
import EmberParticles from "../../components/effects/EmberParticles";
import ScanlineOverlay from "../../components/effects/ScanlineOverlay";
import HeatShimmer from "../../components/effects/HeatShimmer";

export const ReviewSnapshotPortraitBeast: React.FC<PortraitSlideProps> = (
  props,
) => (
  <AbsoluteFill style={{ background: "#0d0606" }}>
    <HeatShimmer />
    <ReviewSnapshotPortrait {...props} />
    <EmberParticles />
    <ScanlineOverlay />
  </AbsoluteFill>
);
