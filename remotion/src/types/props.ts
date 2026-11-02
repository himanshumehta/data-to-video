import { Vehicle } from "./vehicle";

// Type aliases (not interfaces) so they satisfy Remotion's Record<string, unknown> props constraint.
export type SlideProps = {
  vehicle: Vehicle;
  durationSec: number;
  contentMonthYear: string;
  lang?: string;
};

/** Reel slides add the counter info used by SlideCounter and ProgressDots. */
export type PortraitSlideProps = SlideProps & {
  slideNumber: number;
  totalSlides: number;
};
