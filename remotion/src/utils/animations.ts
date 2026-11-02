import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const SPRING_CONFIG = { damping: 200, stiffness: 80, mass: 1 };

export function useFadeSlideUp(
  startFrame: number,
  duration: number = 20,
  translateY: number = 40
) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [startFrame, startFrame + duration], [translateY, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { opacity, transform: `translateY(${y}px)` };
}

export function useSpringScale(startFrame: number) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - startFrame,
    fps,
    config: SPRING_CONFIG,
  });
  return { opacity: s, transform: `scale(${0.8 + s * 0.2})` };
}

export function useBarGrow(
  startFrame: number,
  duration: number = 30
) {
  const frame = useCurrentFrame();
  return interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

export function useCountUp(
  startFrame: number,
  endFrame: number,
  target: number
) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [startFrame, endFrame], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return Math.round(target * progress);
}
