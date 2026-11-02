import React from "react";
import { Composition } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { SlideProps } from "./types";
import { PLACEHOLDER_VEHICLE } from "./placeholderVehicle";

import * as ReelSlides from "./slides/reels";

// Side effect: loads Inter font for all compositions
loadFont();

// Every component a remotion.json composition set may name.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SLIDES: Record<string, React.FC<any>> = { ...ReelSlides };

// Content-type registries: each remotion.json maps slide ids to components and formats.
const registries = [
  require("../../content_types/ownership_cost/remotion.json"),
];

const DEFAULT_DURATION_SEC = 10;

const DEFAULT_PROPS: SlideProps = {
  vehicle: PLACEHOLDER_VEHICLE,
  durationSec: DEFAULT_DURATION_SEC,
  contentMonthYear: "March 2026",
  lang: "en",
};

// ── Registry-driven composition registration ────────────────────────

export const Root: React.FC = () => {
  const compositions: React.ReactNode[] = [];

  for (const registry of registries) {
    for (const [formatName, format] of Object.entries(
      registry.formats as Record<
        string,
        { width: number; height: number; fps: number; compositionSet: string }
      >
    )) {
      const compSet = registry[format.compositionSet] as
        | Record<string, { component: string; defaultDuration: number }>
        | undefined;
      if (!compSet) continue;

      const entries = Object.entries(compSet);
      const totalSlides = entries.length;

      entries.forEach(([, config], index) => {
        if (typeof config !== "object" || !config.component) return;
        const Component = SLIDES[config.component];
        if (!Component) {
          throw new Error(
            `remotion.json names unknown component "${config.component}"`
          );
        }

        const defaultProps = {
          ...DEFAULT_PROPS,
          slideNumber: index + 1,
          totalSlides,
        };

        compositions.push(
          <Composition
            key={`${formatName}-${config.component}`}
            id={config.component}
            component={Component}
            width={format.width}
            height={format.height}
            fps={format.fps}
            durationInFrames={Math.ceil(config.defaultDuration * format.fps)}
            defaultProps={defaultProps}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            calculateMetadata={async ({ props }: { props: any }) => ({
              durationInFrames: Math.ceil(
                (props.durationSec || config.defaultDuration) * format.fps
              ),
            })}
          />
        );
      });
    }
  }

  return <>{compositions}</>;
};
