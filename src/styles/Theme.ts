// src/styles/Theme.ts

// --- COLOR PALETTE (Based on :root/Default Dark Theme) ---

// Primary Colors (HEX/RGB - converting RGBA for RN)
const PRIMARY_HEX = "#c451c9"; // --primary / --ring
const DESTRUCTIVE_HEX = "#d4183d"; // --destructive
const FOREGROUND_HEX = "#ffffff"; // --foreground, --primary-foreground, etc.
const BACKGROUND_HEX = "#0a0322"; // --background, --card, --popover, --sidebar

// Functional/Tonal Colors (RN does not easily handle CSS variables inside rgba(), so we use direct values)
const ACCENT_COLOR_RGB = "rgba(196, 81, 201, 0.2)"; // --accent
const SECONDARY_COLOR_RGB = "rgba(196, 81, 201, 0.1)"; // --secondary
const MUTED_COLOR_RGB = "rgba(255, 255, 255, 0.1)"; // --muted, --border
const MUTED_FOREGROUND_RGB = "rgba(255, 255, 255, 0.7)"; // --muted-foreground

// Input & Border
const INPUT_BACKGROUND_RGB = "rgba(255, 255, 255, 0.05)"; // --input-background
const BORDER_COLOR_RGB = "rgba(255, 255, 255, 0.1)"; // --border

// Chart Colors
const CHART_1 = "#c451c9";
const CHART_2 = "#a9016d";
const CHART_3 = "#740182";
const CHART_4 = "#ffffff";
const CHART_5_RGB = "rgba(196, 81, 201, 0.5)";

// --- SPACING, FONT, and RADIUS ---

// Radius Conversion (0.625rem = 10px, assuming 16px base font size)
export const RADIUS = {
  sm: 6, // 10px - 4px
  md: 8, // 10px - 2px
  lg: 10, // 0.625rem (10px) - --radius
  xl: 14, // 10px + 4px
};

// Font Weights
export const FONT_WEIGHTS = {
  normal: "400",
  medium: "500",
} as const;

// Spacing (Can be extended later, standard RN approach is multiples of 4 or 8)
export const SPACING = {
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 40,
} as const;

// --- THEME OBJECT ---
export const Theme = {
  colors: {
    // Primary/Accent
    primary: PRIMARY_HEX,
    primaryForeground: FOREGROUND_HEX, // Text on primary background
    accent: ACCENT_COLOR_RGB,
    accentForeground: FOREGROUND_HEX, // Text on accent background
    destructive: DESTRUCTIVE_HEX,
    destructiveForeground: FOREGROUND_HEX,
    ring: PRIMARY_HEX,

    // Background/Surface
    background: BACKGROUND_HEX,
    foreground: FOREGROUND_HEX, // Primary text color
    card: BACKGROUND_HEX,
    cardForeground: FOREGROUND_HEX,
    popover: BACKGROUND_HEX,
    popoverForeground: FOREGROUND_HEX,

    // Secondary/Muted/Borders
    secondary: SECONDARY_COLOR_RGB,
    secondaryForeground: FOREGROUND_HEX,
    muted: MUTED_COLOR_RGB, // Used for subtle backgrounds
    mutedForeground: MUTED_FOREGROUND_RGB, // Used for secondary text
    border: BORDER_COLOR_RGB,

    // Input Specific
    input: "transparent", // Matches CSS input: transparent
    inputBackground: INPUT_BACKGROUND_RGB,
    switchBackground: ACCENT_COLOR_RGB, // Using accent color for better match

    // Chart Colors
    chart1: CHART_1,
    chart2: CHART_2,
    chart3: CHART_3,
    chart4: CHART_4,
    chart5: CHART_5_RGB,
  },
  radius: RADIUS,
  spacing: SPACING,
  fontWeights: FONT_WEIGHTS,
};

// --- Custom Gradient Colors ---
// This will be used to generate the actual linear gradient style object when needed.
export const GRADIENT_COLORS = {
  primary: ["#a9016d", "#740182"], // linear-gradient(135deg, #a9016d 0%, #740182 100%)
  primaryHover: ["#c451c9", "#a9016d"], // linear-gradient(135deg, #c451c9 0%, #a9016d 100%)
};
