export const themeIds = [
  "default",
  "bloxy",
  "glass",
  "minimal",
  "neon",
  "earth",
  "premium",
] as const;

export type ThemeId = (typeof themeIds)[number];
export type ThemeVariant = "light" | "dark";

export interface ThemeTokens {
  id: ThemeId;
  name: string;
  description: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  info: string;
  infoForeground: string;
  radius: string;
  shadowCard: string;
  shadowElevated: string;
  shadowButton: string;
  fontFamily: string;
  fontHeading?: string;
  letterSpacing: string;
  textTransform: "none" | "uppercase";
  fontWeightNormal: string;
  fontWeightMedium: string;
  fontWeightBold: string;
  borderWidth: string;
  backdropBlur?: string;
  glowColor?: string;
  glowColorSecondary?: string;
  offsetShadowX?: string;
  offsetShadowY?: string;
  gradientBg?: string;
  surfaceGlassOpacity?: string;
  surfaceBorderOpacity?: string;
}

export interface ThemePreset {
  id: ThemeId;
  name: string;
  description: string;
  light: ThemeTokens;
  dark: ThemeTokens;
  preview: {
    primary: string;
    background: string;
    accent: string;
  };
}

export type ThemeCssVariable = `--${string}`;
export type ThemeCssVariables = Record<ThemeCssVariable, string>;

export const BASE_SPACING_VARIABLES = {
  "--spacing-0": "0",
  "--spacing-1": "0.25rem",
  "--spacing-2": "0.5rem",
  "--spacing-3": "0.75rem",
  "--spacing-4": "1rem",
  "--spacing-5": "1.25rem",
  "--spacing-6": "1.5rem",
  "--spacing-8": "2rem",
  "--spacing-10": "2.5rem",
  "--spacing-12": "3rem",
  "--spacing-16": "4rem",
  "--spacing-18": "4.5rem",
  "--spacing-24": "6rem",
  "--spacing-88": "22rem",
} as const satisfies ThemeCssVariables;

export const BASE_FONT_VARIABLES = {
  "--font-mono": '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
} as const satisfies ThemeCssVariables;

export const DEFAULT_EFFECT_VARIABLES = {
  "--backdrop-blur": "none",
  "--glow-color": "transparent",
  "--glow-color-secondary": "transparent",
  "--offset-shadow-x": "0",
  "--offset-shadow-y": "0",
  "--gradient-bg": "none",
  "--surface-glass-opacity": "1",
  "--surface-border-opacity": "1",
  "--glow-primary-opacity": "0.15",
  "--glass-border-color": "hsl(var(--border) / var(--surface-border-opacity))",
  "--glass-background-color": "hsl(var(--card) / var(--surface-glass-opacity))",
  "--skeleton-highlight-color": "hsl(var(--muted-foreground) / 0.1)",
} as const satisfies ThemeCssVariables;
