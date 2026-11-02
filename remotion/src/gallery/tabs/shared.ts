/**
 * Shared types, constants, and utilities for gallery tab components.
 * Each tab imports what it needs from here — no cross-tab imports.
 */

export type ContentType = "ownership-cost" | "vehicle-review" | "owner-verdict" | "service-bill";
export type FormatKey = "4:5" | "9:16";

export interface SlideDefinition {
  id: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.FC<any>;
  animationFrames: number;
}

export interface FormatConfig {
  slides: SlideDefinition[];
  width: number;
  height: number;
  label: string;
}

export interface CurationResult {
  platform: string;
  maxDuration: number | null;
  selectedSlides: string[];
  excludedSlides: string[];
  totalDuration: number;
  headroom: number | null;
  reasoning: Record<string, string>;
}

export interface GalleryConfig {
  slug: string;
  slideDurations: Record<string, number>;
  defaultDuration: number;
  totalDuration: number;
  hasNarration: boolean;
  narrationCount: number;
  bgmAvailable: boolean;
  bgVideoAvailable: boolean;
  curation?: Record<string, CurationResult>;
  narrationPaths?: Record<string, string>;
  allNarrationPaths?: Record<string, Record<string, string>>;
  availableLangs?: string[];
  defaultLang?: string;
  narrationTexts?: Record<string, Record<string, string>>;
}

export const FPS = 30;

/** Props passed from Gallery to each tab component */
export interface TabProps {
  config: GalleryConfig | null;
  showFinal: boolean;
  narrationLang: string;
}
