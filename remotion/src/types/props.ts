import { Vehicle } from "./vehicle";
import { Theme } from "./theme";

export interface SlideProps {
  vehicle: Vehicle;
  durationSec: number;
  contentMonthYear: string;
  step?: 1 | 2;
  lang?: string;
  // Theme is optional for backward compat with existing landscape slides.
  // Portrait slides always receive theme.
  theme?: Theme;
}

/**
 * Portrait slides extend SlideProps with slide counter info.
 * These are used by SlideCounter and ProgressDots components.
 */
export interface PortraitSlideProps extends SlideProps {
  theme: Theme; // required (not optional) for portrait
  slideNumber: number;
  totalSlides: number;
}
