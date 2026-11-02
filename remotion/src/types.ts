// Backward-compat re-export — existing slides import from "../types"
// New code should import from "./types/" or "./types/index"
export type {
  Vehicle,
  YearBreakdown,
  ServiceComponent,
  DepMilestone,
  Overhaul,
  Competitor,
  ExpertBreakdown,
  SlideProps,
  PortraitSlideProps,
  Theme,
} from "./types/index";
