/**
 * Theme interface — mirrors design-systems/{name}/theme.json.
 *
 * Default slides may use C.* constants from utils/colors.ts for brevity
 * (values match the default theme). Beast/cinematic slides MUST use
 * theme.* props since the color palette differs.
 */
export interface Theme {
  name: string;
  display_name: string;
  schema_version: string;
  version: string;

  fonts: {
    display: string;
    heading: string;
    body: string;
    mono: string;
  };

  colors: {
    surface: Record<string, string>;
    text: Record<string, string>;
    brand: {
      primary: string;
      secondary: string;
      accent: string;
      [key: string]: string;
    };
    semantic: {
      emerald: string;
      red: string;
      blue: string;
      amber: string;
      violet: string;
      orange: string;
      [key: string]: string;
    };
  };

  typography: {
    styles: Record<
      string,
      {
        font_role: string;
        weight: number;
        size_pt: number;
        line_height: number;
        letter_spacing?: number;
        text_transform?: string;
        color: string;
      }
    >;
  };

  spacing: Record<string, number>;

  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };

  glass: {
    bg: string;
    border: string;
    bg_heavy: string;
    border_heavy: string;
  };

  logo: {
    light: string;
    dark: string;
    icon_only: string;
    default_variant: string;
    placement: {
      anchor: string;
      position: { x: number; y: number };
      size: { w: number; h: number | null };
    };
    glow: { enabled: boolean; color: string; radius: number };
  };

  cards: Record<
    string,
    {
      background: string;
      border: string;
      border_radius: number;
      padding: number;
    }
  >;

  watermark: {
    text: string;
    opacity: number;
    position: string;
    font_size: number;
    font_weight: number;
    color: string;
    letter_spacing: number;
  };

  slide_chrome: {
    slide_number: {
      position: string;
      font_size: number;
      font_weight: number;
      current_color: string;
      total_color: string;
      format: string;
    };
    progress_dots: {
      position: string;
      dot_size: number;
      gap: number;
      active_color: string;
      inactive_color: string;
      glow_enabled: boolean;
    };
  };

  backgrounds: Record<
    string,
    {
      kind: string;
      colors: string[];
      angle_deg?: number;
      glows?: Array<{
        color: string;
        position: string;
        size: string;
        opacity: number;
      }>;
    }
  >;

  shadows: Record<
    string,
    {
      offset_x: number;
      offset_y: number;
      blur: number;
      color: string;
    }
  >;

  text_effects: {
    gradient_fill: Record<
      string,
      {
        colors: string[];
        angle_deg: number;
      }
    >;
  };

  glows: Record<
    string,
    {
      color: string;
      position: string;
      size: string;
      opacity: number;
    }
  >;

  safe_zones: Record<
    string,
    {
      top: number;
      bottom: number;
      left: number;
      right: number;
    }
  >;

  animations: Record<
    string,
    {
      type: string;
      duration_ms: number;
      easing: string;
      params?: Record<string, number>;
    }
  >;

  data_viz: Record<string, Record<string, unknown>>;
  components: Record<string, Record<string, string>>;
  score_colors: {
    thresholds: Array<{ min: number; max: number; color: string }>;
  };
  section_colors: Record<string, string>;
}
