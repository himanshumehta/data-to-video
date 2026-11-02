import { interpolate, useCurrentFrame } from "remotion";

export const SPRING_CONFIG = { damping: 200, stiffness: 80, mass: 1 };

/** Integer that counts from 0 to `target` between two frames (clamped). */
export function useCountUp(startFrame: number, endFrame: number, target: number) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [startFrame, endFrame], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return Math.round(target * progress);
}
