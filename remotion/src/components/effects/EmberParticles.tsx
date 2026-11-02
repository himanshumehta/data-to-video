import React from "react";
import { useCurrentFrame } from "remotion";
import { AbsoluteFill } from "remotion";

interface EmberParticlesProps {
  count?: number;
  opacity?: number;
}

/**
 * Floating ember particles overlay for the beast theme.
 *
 * Each particle has a deterministic position/size seeded from
 * its index + the current frame, creating gentle drifting motion
 * without any external randomness.
 */
const EmberParticles: React.FC<EmberParticlesProps> = ({
  count = 12,
  opacity = 0.15,
}) => {
  const frame = useCurrentFrame();

  // Simple deterministic pseudo-random from a seed integer.
  const seededRandom = (seed: number): number => {
    const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };

  const particles = Array.from({ length: count }, (_, i) => {
    // Base positions seeded per-particle (stable across frames).
    const baseX = seededRandom(i * 3 + 1) * 100; // 0-100 %
    const baseY = seededRandom(i * 3 + 2) * 100;
    const size = 3 + seededRandom(i * 3 + 3) * 5; // 3-8 px

    // Per-particle animation parameters.
    const driftSpeed = 0.15 + seededRandom(i * 7 + 5) * 0.25;
    const driftAmplitude = 1.5 + seededRandom(i * 7 + 6) * 3;
    const phaseOffset = seededRandom(i * 7 + 7) * Math.PI * 2;
    const verticalSpeed = 0.04 + seededRandom(i * 7 + 8) * 0.08;

    // Frame-based motion.
    const xOffset =
      Math.sin(frame * driftSpeed * 0.05 + phaseOffset) * driftAmplitude;
    const yOffset = -((frame * verticalSpeed) % 110); // slow upward drift, wraps

    // Wrap Y so particles re-enter from bottom.
    const finalY = ((baseY + yOffset) % 120 + 120) % 120 - 10;
    const finalX = baseX + xOffset;

    // Pulsing glow opacity per particle.
    const pulseOpacity =
      0.5 +
      0.5 *
        Math.sin(
          frame * 0.03 * (0.8 + seededRandom(i * 11 + 9) * 0.4) + phaseOffset
        );

    const glowSize = size * 2.5;

    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: `${finalX}%`,
          top: `${finalY}%`,
          width: size,
          height: size,
          borderRadius: "50%",
          background: "#ff4d2a",
          opacity: opacity * pulseOpacity,
          boxShadow: `0 0 ${glowSize}px ${glowSize / 2}px rgba(255, 77, 42, 0.6)`,
          pointerEvents: "none" as const,
          willChange: "transform, opacity",
        }}
      />
    );
  });

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {particles}
    </AbsoluteFill>
  );
};

export default EmberParticles;
