export type ThemeMode = "light" | "dark" | "system";
export type ResolvedThemeMode = "light" | "dark";
export type ThemePresetName =
  | "default"
<<<<<<< HEAD
  | "ocean"
  | "forest"
  | "sunset"
  | "bold"
  | "glassmorphism"
  | "minimal";

export const THEME_STORAGE_KEY = "get_me_job_theme";
export const THEME_PRESET_STORAGE_KEY = "get_me_job_theme_preset";
=======
  | "bold"
  | "glassmorphism"
  | "minimal"
  | "ocean"
  | "forest"
  | "sunset";
export type ThemeColorKey = "primary" | "background" | "accent";
export type ThemeColorOverrides = Partial<Record<ThemeColorKey, string>>;

export const THEME_STORAGE_KEY = "theme";
export const THEME_PRESET_STORAGE_KEY = "theme-preset";
export const THEME_CUSTOM_COLORS_STORAGE_KEY = "theme-custom-colors";
>>>>>>> origin/bentoya/build-theme-picker-ui-in-settings-with-live-preview
export const DEFAULT_THEME_MODE: ThemeMode = "system";
export const DEFAULT_THEME_PRESET: ThemePresetName = "default";

export const themePresetNames = [
  "default",
  "ocean",
  "forest",
  "sunset",
  "bold",
  "glassmorphism",
  "minimal",
  "ocean",
  "forest",
  "sunset",
] as const satisfies readonly ThemePresetName[];

type ThemeTokenGroup = Record<string, string>;

export interface ThemePreset {
  name: ThemePresetName;
  label: string;
  description: string;
  preview: Record<ThemeColorKey, string>;
  light: ThemeTokenGroup;
  dark: ThemeTokenGroup;
}

const baseSpacing = {
  "spacing-0": "0",
  "spacing-1": "0.25rem",
  "spacing-2": "0.5rem",
  "spacing-3": "0.75rem",
  "spacing-4": "1rem",
  "spacing-5": "1.25rem",
  "spacing-6": "1.5rem",
  "spacing-8": "2rem",
  "spacing-10": "2.5rem",
  "spacing-12": "3rem",
  "spacing-16": "4rem",
  "spacing-18": "4.5rem",
  "spacing-24": "6rem",
  "spacing-88": "22rem",
} as const;

const baseTypography = {
  "font-sans": '"Aptos", "Segoe UI", "Helvetica Neue", system-ui, sans-serif',
  "font-heading": '"Aptos", "Segoe UI", "Helvetica Neue", system-ui, sans-serif',
  "font-mono": '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
} as const;

const defaultLight = {
  ...baseSpacing,
  ...baseTypography,
  background: "30 25% 99%",
  foreground: "258 20% 13%",
  card: "30 20% 99.5%",
  "card-foreground": "258 20% 13%",
  popover: "30 20% 99.5%",
  "popover-foreground": "258 20% 13%",
  primary: "258 65% 58%",
  "primary-foreground": "0 0% 100%",
  secondary: "258 10% 96%",
  "secondary-foreground": "258 20% 13%",
  muted: "258 10% 95%",
  "muted-foreground": "258 8% 45%",
  accent: "14 90% 68%",
  "accent-foreground": "0 0% 100%",
  destructive: "0 72% 51%",
  "destructive-foreground": "0 0% 100%",
  success: "152 60% 42%",
  "success-foreground": "0 0% 100%",
  warning: "38 92% 50%",
  "warning-foreground": "0 0% 0%",
  info: "220 80% 56%",
  "info-foreground": "0 0% 100%",
  border: "258 10% 91%",
  input: "258 10% 91%",
  ring: "258 65% 58%",
  radius: "0.75rem",
  "border-width": "1px",
  "surface-glass-opacity": "0.8",
  "surface-border-opacity": "0.5",
  "backdrop-blur": "16px",
  "glow-primary-opacity": "0.15",
  "glow-color": "hsl(var(--primary) / var(--glow-primary-opacity))",
  "shadow-sm": "0 1px 2px 0 rgb(100 60 130 / 0.04)",
  shadow:
    "0 1px 3px 0 rgb(100 60 130 / 0.06), 0 1px 2px -1px rgb(100 60 130 / 0.06)",
  "shadow-md":
    "0 4px 6px -1px rgb(100 60 130 / 0.06), 0 2px 4px -2px rgb(100 60 130 / 0.04)",
  "shadow-lg":
    "0 10px 15px -3px rgb(100 60 130 / 0.08), 0 4px 6px -4px rgb(100 60 130 / 0.04)",
  "shadow-xl":
    "0 20px 25px -5px rgb(100 60 130 / 0.10), 0 8px 10px -6px rgb(100 60 130 / 0.04)",
  "shadow-card": "var(--shadow)",
  "shadow-elevated": "var(--shadow-lg)",
  "letter-spacing": "0",
  "text-transform": "none",
  "gradient-primary":
    "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(350 80% 68%) 100%)",
  "gradient-success":
    "linear-gradient(135deg, hsl(var(--success)) 0%, hsl(172 55% 48%) 100%)",
  "gradient-hero":
    "linear-gradient(135deg, hsl(var(--primary) / 0.04) 0%, hsl(350 80% 68% / 0.03) 100%)",
} as const;

const defaultDark = {
  ...baseSpacing,
  ...baseTypography,
  background: "258 30% 7%",
  foreground: "258 10% 95%",
  card: "258 25% 10%",
  "card-foreground": "258 10% 95%",
  popover: "258 25% 10%",
  "popover-foreground": "258 10% 95%",
  primary: "258 65% 65%",
  "primary-foreground": "0 0% 100%",
  secondary: "258 20% 14%",
  "secondary-foreground": "258 10% 95%",
  muted: "258 20% 14%",
  "muted-foreground": "258 8% 55%",
  accent: "14 90% 72%",
  "accent-foreground": "0 0% 100%",
  destructive: "0 72% 55%",
  "destructive-foreground": "0 0% 100%",
  success: "152 60% 48%",
  "success-foreground": "0 0% 100%",
  warning: "38 92% 55%",
  "warning-foreground": "0 0% 0%",
  info: "220 80% 62%",
  "info-foreground": "0 0% 100%",
  border: "258 20% 18%",
  input: "258 20% 18%",
  ring: "258 65% 65%",
  radius: "0.75rem",
  "border-width": "1px",
  "surface-glass-opacity": "0.8",
  "surface-border-opacity": "0.5",
  "backdrop-blur": "16px",
  "glow-primary-opacity": "0.2",
  "glow-color": "hsl(var(--primary) / var(--glow-primary-opacity))",
  "shadow-sm": "0 1px 2px 0 rgb(0 0 0 / 0.3)",
  shadow: "0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.3)",
  "shadow-md": "0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)",
  "shadow-lg": "0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.3)",
  "shadow-xl": "0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.3)",
  "shadow-card": "var(--shadow)",
  "shadow-elevated": "var(--shadow-lg)",
  "letter-spacing": "0",
  "text-transform": "none",
  "gradient-primary":
    "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(350 80% 72%) 100%)",
  "gradient-success":
    "linear-gradient(135deg, hsl(var(--success)) 0%, hsl(172 55% 52%) 100%)",
  "gradient-hero":
    "linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, hsl(350 80% 72% / 0.04) 100%)",
} as const;

export const themePresets: Record<ThemePresetName, ThemePreset> = {
  default: {
    name: "default",
    label: "Taida",
    description: "Current violet and coral theme.",
    preview: {
      primary: defaultLight.primary,
      background: defaultLight.background,
      accent: defaultLight.accent,
    },
    light: defaultLight,
    dark: defaultDark,
  },
  ocean: {
    name: "ocean",
    label: "Ocean",
    description: "Cool teal controls with clean white surfaces.",
    light: {
      ...defaultLight,
      background: "205 45% 98%",
      foreground: "208 38% 12%",
      card: "0 0% 100%",
      "card-foreground": "208 38% 12%",
      popover: "0 0% 100%",
      "popover-foreground": "208 38% 12%",
      primary: "190 86% 38%",
      secondary: "196 38% 93%",
      "secondary-foreground": "208 38% 12%",
      muted: "196 34% 94%",
      "muted-foreground": "205 12% 40%",
      accent: "199 89% 48%",
      border: "198 24% 86%",
      input: "198 24% 86%",
      ring: "190 86% 38%",
      "shadow-sm": "0 1px 2px rgb(8 145 178 / 0.05)",
      shadow: "0 1px 3px rgb(8 145 178 / 0.07)",
      "shadow-md": "0 8px 24px rgb(8 145 178 / 0.08)",
      "shadow-lg": "0 18px 44px rgb(8 145 178 / 0.10)",
      "shadow-xl": "0 28px 70px rgb(8 145 178 / 0.12)",
      "gradient-primary":
        "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
      "gradient-hero":
        "linear-gradient(135deg, hsl(var(--primary) / 0.10) 0%, hsl(var(--accent) / 0.06) 100%)",
    },
    dark: {
      ...defaultDark,
      background: "210 42% 7%",
      foreground: "196 38% 95%",
      card: "208 38% 11%",
      "card-foreground": "196 38% 95%",
      popover: "208 38% 11%",
      "popover-foreground": "196 38% 95%",
      primary: "190 86% 52%",
      secondary: "205 32% 16%",
      muted: "205 32% 16%",
      "muted-foreground": "198 16% 66%",
      accent: "199 89% 62%",
      border: "202 28% 22%",
      input: "202 28% 22%",
      ring: "190 86% 52%",
      "gradient-primary":
        "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
      "gradient-hero":
        "linear-gradient(135deg, hsl(var(--primary) / 0.14) 0%, hsl(var(--accent) / 0.08) 100%)",
    },
  },
  forest: {
    name: "forest",
    label: "Forest",
    description: "Grounded green with soft neutral surfaces.",
    light: {
      ...defaultLight,
      background: "42 24% 98%",
      foreground: "150 24% 12%",
      card: "0 0% 100%",
      "card-foreground": "150 24% 12%",
      popover: "0 0% 100%",
      "popover-foreground": "150 24% 12%",
      primary: "145 55% 34%",
      secondary: "88 28% 92%",
      "secondary-foreground": "150 24% 12%",
      muted: "88 24% 93%",
      "muted-foreground": "145 10% 38%",
      accent: "38 92% 50%",
      border: "90 18% 84%",
      input: "90 18% 84%",
      ring: "145 55% 34%",
      "shadow-sm": "0 1px 2px rgb(21 128 61 / 0.05)",
      shadow: "0 1px 3px rgb(21 128 61 / 0.07)",
      "shadow-md": "0 8px 24px rgb(21 128 61 / 0.08)",
      "shadow-lg": "0 18px 44px rgb(21 128 61 / 0.10)",
      "shadow-xl": "0 28px 70px rgb(21 128 61 / 0.12)",
      "gradient-primary":
        "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
      "gradient-hero":
        "linear-gradient(135deg, hsl(var(--primary) / 0.10) 0%, hsl(var(--accent) / 0.06) 100%)",
    },
    dark: {
      ...defaultDark,
      background: "148 34% 7%",
      foreground: "88 30% 94%",
      card: "148 28% 11%",
      "card-foreground": "88 30% 94%",
      popover: "148 28% 11%",
      "popover-foreground": "88 30% 94%",
      primary: "145 55% 52%",
      secondary: "148 22% 16%",
      muted: "148 22% 16%",
      "muted-foreground": "92 12% 66%",
      accent: "38 92% 58%",
      border: "148 18% 23%",
      input: "148 18% 23%",
      ring: "145 55% 52%",
      "gradient-primary":
        "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
      "gradient-hero":
        "linear-gradient(135deg, hsl(var(--primary) / 0.14) 0%, hsl(var(--accent) / 0.08) 100%)",
    },
  },
  sunset: {
    name: "sunset",
    label: "Sunset",
    description: "Warm rose controls with balanced neutral surfaces.",
    light: {
      ...defaultLight,
      background: "24 32% 98%",
      foreground: "248 24% 12%",
      card: "0 0% 100%",
      "card-foreground": "248 24% 12%",
      primary: "347 86% 58%",
      secondary: "24 44% 94%",
      "secondary-foreground": "248 24% 12%",
      muted: "24 34% 94%",
      "muted-foreground": "248 8% 42%",
      accent: "32 95% 55%",
      border: "24 24% 86%",
      input: "24 24% 86%",
      ring: "347 86% 58%",
      "gradient-primary":
        "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
      "gradient-hero":
        "linear-gradient(135deg, hsl(var(--primary) / 0.10) 0%, hsl(var(--accent) / 0.06) 100%)",
    },
    dark: {
      ...defaultDark,
      background: "248 30% 7%",
      foreground: "24 28% 95%",
      card: "248 24% 11%",
      "card-foreground": "24 28% 95%",
      primary: "347 86% 66%",
      secondary: "248 20% 15%",
      muted: "248 20% 15%",
      "muted-foreground": "24 10% 66%",
      accent: "32 95% 62%",
      border: "248 18% 22%",
      input: "248 18% 22%",
      ring: "347 86% 66%",
      "gradient-primary":
        "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
      "gradient-hero":
        "linear-gradient(135deg, hsl(var(--primary) / 0.14) 0%, hsl(var(--accent) / 0.08) 100%)",
    },
  },
  bold: {
    name: "bold",
    label: "Bold",
    description: "High contrast color with stronger borders.",
    preview: {
      primary: "246 100% 45%",
      background: "0 0% 100%",
      accent: "347 100% 52%",
    },
    light: {
      ...defaultLight,
      background: "0 0% 100%",
      foreground: "222 47% 7%",
      card: "0 0% 100%",
      "card-foreground": "222 47% 7%",
      primary: "246 100% 45%",
      secondary: "52 100% 50%",
      "secondary-foreground": "222 47% 7%",
      muted: "220 18% 92%",
      "muted-foreground": "222 28% 32%",
      accent: "347 100% 52%",
      border: "222 47% 7%",
      input: "222 47% 7%",
      ring: "347 100% 52%",
      radius: "0.375rem",
      "border-width": "2px",
      "shadow-sm": "2px 2px 0 rgb(15 23 42 / 1)",
      shadow: "3px 3px 0 rgb(15 23 42 / 1)",
      "shadow-md": "5px 5px 0 rgb(15 23 42 / 1)",
      "shadow-lg": "7px 7px 0 rgb(15 23 42 / 1)",
      "shadow-xl": "10px 10px 0 rgb(15 23 42 / 1)",
      "shadow-card": "var(--shadow-md)",
      "shadow-elevated": "var(--shadow-xl)",
      "letter-spacing": "0.01em",
      "text-transform": "none",
      "gradient-primary":
        "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
      "gradient-hero":
        "linear-gradient(135deg, hsl(var(--primary) / 0.12) 0%, hsl(var(--accent) / 0.10) 100%)",
    },
    dark: {
      ...defaultDark,
      background: "222 47% 5%",
      foreground: "0 0% 98%",
      card: "222 39% 8%",
      "card-foreground": "0 0% 98%",
      primary: "52 100% 58%",
      "primary-foreground": "222 47% 7%",
      secondary: "246 100% 64%",
      "secondary-foreground": "0 0% 100%",
      muted: "222 30% 16%",
      "muted-foreground": "220 14% 75%",
      accent: "347 100% 66%",
      border: "0 0% 98%",
      input: "0 0% 98%",
      ring: "52 100% 58%",
      radius: "0.375rem",
      "border-width": "2px",
      "shadow-sm": "2px 2px 0 rgb(255 255 255 / 0.9)",
      shadow: "3px 3px 0 rgb(255 255 255 / 0.9)",
      "shadow-md": "5px 5px 0 rgb(255 255 255 / 0.85)",
      "shadow-lg": "7px 7px 0 rgb(255 255 255 / 0.8)",
      "shadow-xl": "10px 10px 0 rgb(255 255 255 / 0.75)",
      "shadow-card": "var(--shadow-md)",
      "shadow-elevated": "var(--shadow-xl)",
      "letter-spacing": "0.01em",
      "text-transform": "none",
      "gradient-primary":
        "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
      "gradient-hero":
        "linear-gradient(135deg, hsl(var(--primary) / 0.16) 0%, hsl(var(--accent) / 0.14) 100%)",
    },
  },
  glassmorphism: {
    name: "glassmorphism",
    label: "Glassmorphism",
    description: "Translucent surfaces with blur and light borders.",
    preview: {
      primary: "199 89% 48%",
      background: "210 60% 98%",
      accent: "316 73% 58%",
    },
    light: {
      ...defaultLight,
      background: "210 60% 98%",
      foreground: "224 34% 14%",
      card: "0 0% 100%",
      popover: "0 0% 100%",
      primary: "199 89% 48%",
      accent: "316 73% 58%",
      border: "214 45% 84%",
      input: "214 45% 84%",
      ring: "199 89% 48%",
      radius: "1rem",
      "surface-glass-opacity": "0.58",
      "surface-border-opacity": "0.7",
      "backdrop-blur": "24px",
      "glow-color": "hsl(var(--accent) / 0.22)",
      "shadow-sm": "0 1px 2px rgb(14 116 144 / 0.08)",
      shadow: "0 8px 28px rgb(14 116 144 / 0.10)",
      "shadow-md": "0 14px 36px rgb(14 116 144 / 0.12)",
      "shadow-lg": "0 24px 60px rgb(14 116 144 / 0.14)",
      "shadow-xl": "0 32px 80px rgb(14 116 144 / 0.16)",
      "gradient-primary":
        "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
      "gradient-hero":
        "linear-gradient(135deg, hsl(var(--primary) / 0.14) 0%, hsl(var(--accent) / 0.10) 100%)",
    },
    dark: {
      ...defaultDark,
      background: "226 45% 7%",
      foreground: "210 40% 96%",
      card: "226 38% 12%",
      popover: "226 38% 12%",
      primary: "199 89% 62%",
      accent: "316 73% 68%",
      border: "210 40% 78%",
      input: "210 40% 78%",
      ring: "199 89% 62%",
      radius: "1rem",
      "surface-glass-opacity": "0.42",
      "surface-border-opacity": "0.35",
      "backdrop-blur": "28px",
      "glow-color": "hsl(var(--accent) / 0.26)",
      "shadow-sm": "0 1px 2px rgb(0 0 0 / 0.28)",
      shadow: "0 10px 34px rgb(0 0 0 / 0.34)",
      "shadow-md": "0 18px 46px rgb(0 0 0 / 0.38)",
      "shadow-lg": "0 28px 70px rgb(0 0 0 / 0.42)",
      "shadow-xl": "0 40px 96px rgb(0 0 0 / 0.48)",
      "gradient-primary":
        "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
      "gradient-hero":
        "linear-gradient(135deg, hsl(var(--primary) / 0.16) 0%, hsl(var(--accent) / 0.12) 100%)",
    },
  },
  minimal: {
    name: "minimal",
    label: "Minimal",
    description: "Quiet neutrals with generous spacing and subtle depth.",
    preview: {
      primary: "220 16% 20%",
      background: "0 0% 100%",
      accent: "180 55% 35%",
    },
    light: {
      ...defaultLight,
      background: "0 0% 100%",
      foreground: "220 16% 14%",
      card: "0 0% 100%",
      "card-foreground": "220 16% 14%",
      primary: "220 16% 20%",
      secondary: "220 12% 96%",
      "secondary-foreground": "220 16% 14%",
      muted: "220 12% 96%",
      "muted-foreground": "220 8% 42%",
      accent: "180 55% 35%",
      border: "220 13% 88%",
      input: "220 13% 88%",
      ring: "180 55% 35%",
      radius: "0.5rem",
      "spacing-4": "1.125rem",
      "spacing-6": "1.75rem",
      "spacing-8": "2.25rem",
      "shadow-sm": "0 1px 2px rgb(15 23 42 / 0.03)",
      shadow: "0 1px 3px rgb(15 23 42 / 0.04)",
      "shadow-md": "0 8px 24px rgb(15 23 42 / 0.05)",
      "shadow-lg": "0 16px 38px rgb(15 23 42 / 0.06)",
      "shadow-xl": "0 28px 60px rgb(15 23 42 / 0.07)",
      "gradient-primary":
        "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
      "gradient-hero":
        "linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--background)) 100%)",
    },
    dark: {
      ...defaultDark,
      background: "220 18% 8%",
      foreground: "220 14% 94%",
      card: "220 16% 11%",
      "card-foreground": "220 14% 94%",
      primary: "220 14% 92%",
      "primary-foreground": "220 18% 8%",
      secondary: "220 14% 16%",
      muted: "220 14% 16%",
      "muted-foreground": "220 9% 62%",
      accent: "180 55% 48%",
      border: "220 12% 24%",
      input: "220 12% 24%",
      ring: "180 55% 48%",
      radius: "0.5rem",
      "spacing-4": "1.125rem",
      "spacing-6": "1.75rem",
      "spacing-8": "2.25rem",
      "shadow-sm": "0 1px 2px rgb(0 0 0 / 0.22)",
      shadow: "0 1px 3px rgb(0 0 0 / 0.28)",
      "shadow-md": "0 8px 24px rgb(0 0 0 / 0.30)",
      "shadow-lg": "0 16px 38px rgb(0 0 0 / 0.34)",
      "shadow-xl": "0 28px 60px rgb(0 0 0 / 0.38)",
      "gradient-primary":
        "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
      "gradient-hero":
        "linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--background)) 100%)",
    },
  },
  ocean: {
    name: "ocean",
    label: "Ocean",
    description: "Cool blue controls with bright open surfaces.",
    preview: {
      primary: "190 86% 38%",
      background: "205 45% 98%",
      accent: "168 76% 42%",
    },
    light: {
      ...defaultLight,
      background: "205 45% 98%",
      foreground: "211 36% 14%",
      card: "0 0% 100%",
      "card-foreground": "211 36% 14%",
      popover: "0 0% 100%",
      "popover-foreground": "211 36% 14%",
      primary: "190 86% 38%",
      secondary: "199 54% 93%",
      "secondary-foreground": "211 36% 14%",
      muted: "199 42% 92%",
      "muted-foreground": "211 18% 42%",
      accent: "168 76% 42%",
      border: "199 36% 84%",
      input: "199 36% 84%",
      ring: "190 86% 38%",
      "shadow-sm": "0 1px 2px rgb(8 145 178 / 0.06)",
      shadow: "0 1px 3px rgb(8 145 178 / 0.08)",
      "shadow-md": "0 8px 24px rgb(8 145 178 / 0.10)",
      "shadow-lg": "0 16px 40px rgb(8 145 178 / 0.12)",
      "shadow-xl": "0 28px 64px rgb(8 145 178 / 0.14)",
      "gradient-primary":
        "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
      "gradient-hero":
        "linear-gradient(135deg, hsl(var(--primary) / 0.10) 0%, hsl(var(--accent) / 0.08) 100%)",
    },
    dark: {
      ...defaultDark,
      background: "211 50% 7%",
      foreground: "199 28% 94%",
      card: "211 42% 10%",
      "card-foreground": "199 28% 94%",
      popover: "211 42% 10%",
      "popover-foreground": "199 28% 94%",
      primary: "190 86% 56%",
      secondary: "211 34% 16%",
      "secondary-foreground": "199 28% 94%",
      muted: "211 34% 16%",
      "muted-foreground": "199 18% 66%",
      accent: "168 76% 52%",
      border: "211 28% 22%",
      input: "211 28% 22%",
      ring: "190 86% 56%",
      "gradient-primary":
        "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
      "gradient-hero":
        "linear-gradient(135deg, hsl(var(--primary) / 0.14) 0%, hsl(var(--accent) / 0.10) 100%)",
    },
  },
  forest: {
    name: "forest",
    label: "Forest",
    description: "Grounded green with warm neutral surfaces.",
    preview: {
      primary: "145 55% 34%",
      background: "42 24% 98%",
      accent: "34 92% 48%",
    },
    light: {
      ...defaultLight,
      background: "42 24% 98%",
      foreground: "150 26% 12%",
      card: "45 28% 99%",
      "card-foreground": "150 26% 12%",
      popover: "45 28% 99%",
      "popover-foreground": "150 26% 12%",
      primary: "145 55% 34%",
      secondary: "98 28% 91%",
      "secondary-foreground": "150 26% 12%",
      muted: "95 18% 91%",
      "muted-foreground": "150 10% 38%",
      accent: "34 92% 48%",
      border: "92 18% 82%",
      input: "92 18% 82%",
      ring: "145 55% 34%",
      "shadow-sm": "0 1px 2px rgb(21 128 61 / 0.05)",
      shadow: "0 1px 3px rgb(21 128 61 / 0.07)",
      "shadow-md": "0 8px 22px rgb(21 128 61 / 0.09)",
      "shadow-lg": "0 16px 38px rgb(21 128 61 / 0.11)",
      "shadow-xl": "0 28px 58px rgb(21 128 61 / 0.13)",
      "gradient-primary":
        "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
      "gradient-hero":
        "linear-gradient(135deg, hsl(var(--primary) / 0.09) 0%, hsl(var(--accent) / 0.08) 100%)",
    },
    dark: {
      ...defaultDark,
      background: "150 26% 8%",
      foreground: "95 18% 94%",
      card: "150 24% 11%",
      "card-foreground": "95 18% 94%",
      popover: "150 24% 11%",
      "popover-foreground": "95 18% 94%",
      primary: "145 55% 52%",
      secondary: "150 20% 17%",
      "secondary-foreground": "95 18% 94%",
      muted: "150 20% 17%",
      "muted-foreground": "95 12% 64%",
      accent: "34 92% 58%",
      border: "150 18% 24%",
      input: "150 18% 24%",
      ring: "145 55% 52%",
      "gradient-primary":
        "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
      "gradient-hero":
        "linear-gradient(135deg, hsl(var(--primary) / 0.14) 0%, hsl(var(--accent) / 0.10) 100%)",
    },
  },
  sunset: {
    name: "sunset",
    label: "Sunset",
    description: "Warm coral accents with balanced ink contrast.",
    preview: {
      primary: "12 86% 55%",
      background: "32 45% 98%",
      accent: "278 64% 56%",
    },
    light: {
      ...defaultLight,
      background: "32 45% 98%",
      foreground: "252 24% 12%",
      card: "0 0% 100%",
      "card-foreground": "252 24% 12%",
      popover: "0 0% 100%",
      "popover-foreground": "252 24% 12%",
      primary: "12 86% 55%",
      secondary: "28 58% 92%",
      "secondary-foreground": "252 24% 12%",
      muted: "28 36% 92%",
      "muted-foreground": "252 10% 42%",
      accent: "278 64% 56%",
      border: "28 28% 84%",
      input: "28 28% 84%",
      ring: "12 86% 55%",
      "shadow-sm": "0 1px 2px rgb(234 88 12 / 0.05)",
      shadow: "0 1px 3px rgb(234 88 12 / 0.07)",
      "shadow-md": "0 8px 24px rgb(234 88 12 / 0.09)",
      "shadow-lg": "0 16px 40px rgb(234 88 12 / 0.11)",
      "shadow-xl": "0 28px 64px rgb(234 88 12 / 0.13)",
      "gradient-primary":
        "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
      "gradient-hero":
        "linear-gradient(135deg, hsl(var(--primary) / 0.10) 0%, hsl(var(--accent) / 0.08) 100%)",
    },
    dark: {
      ...defaultDark,
      background: "252 28% 8%",
      foreground: "28 24% 95%",
      card: "252 25% 11%",
      "card-foreground": "28 24% 95%",
      popover: "252 25% 11%",
      "popover-foreground": "28 24% 95%",
      primary: "12 86% 62%",
      secondary: "252 20% 17%",
      "secondary-foreground": "28 24% 95%",
      muted: "252 20% 17%",
      "muted-foreground": "28 12% 66%",
      accent: "278 64% 66%",
      border: "252 18% 24%",
      input: "252 18% 24%",
      ring: "12 86% 62%",
      "gradient-primary":
        "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
      "gradient-hero":
        "linear-gradient(135deg, hsl(var(--primary) / 0.14) 0%, hsl(var(--accent) / 0.10) 100%)",
    },
  },
};

const themeVariableNames = Object.keys(defaultLight).map(
  (name) => `--${name}` as const
);

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

export function isThemePresetName(value: unknown): value is ThemePresetName {
  return typeof value === "string" && themePresetNames.includes(value as ThemePresetName);
}

export function isThemeColorKey(value: unknown): value is ThemeColorKey {
  return value === "primary" || value === "background" || value === "accent";
}

export function getThemePreset(name: unknown): ThemePreset {
  return themePresets[isThemePresetName(name) ? name : "default"];
}

export function getThemeVariables(
  presetName: unknown,
  resolvedTheme: ResolvedThemeMode,
  customColors: ThemeColorOverrides = {}
): Record<`--${string}`, string> {
  const preset = getThemePreset(presetName);
  const tokens = applyCustomThemeColors(preset[resolvedTheme], customColors);

  return Object.fromEntries(
    Object.entries(tokens).map(([name, value]) => [`--${name}`, value])
  ) as Record<`--${string}`, string>;
}

export function applyThemeVariables(
  root: HTMLElement,
  presetName: unknown,
  resolvedTheme: ResolvedThemeMode,
  customColors: ThemeColorOverrides = {}
): void {
  const preset = getThemePreset(presetName);
  const variables = getThemeVariables(preset.name, resolvedTheme, customColors);

  root.dataset.themePreset = preset.name;
  root.dataset.themeMode = resolvedTheme;
  root.dataset.themeCustom = hasThemeColorOverrides(customColors) ? "true" : "false";

  for (const [name, value] of Object.entries(variables)) {
    root.style.setProperty(name, value);
  }
}

<<<<<<< HEAD
export function clearThemeVariables(root: HTMLElement): void {
  for (const name of themeVariableNames) {
    root.style.removeProperty(name);
  }
}
=======
export function getThemePreviewColors(
  presetName: unknown,
  customColors: ThemeColorOverrides = {}
): Record<ThemeColorKey, string> {
  const preview = { ...getThemePreset(presetName).preview };

  for (const key of Object.keys(customColors)) {
    if (isThemeColorKey(key) && isHslString(customColors[key])) {
      preview[key] = customColors[key];
    }
  }

  return preview;
}

export function hasThemeColorOverrides(
  customColors: ThemeColorOverrides
): boolean {
  return Object.values(customColors).some((value) => isHslString(value));
}

export function sanitizeThemeColorOverrides(
  value: unknown
): ThemeColorOverrides {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const overrides: ThemeColorOverrides = {};
  for (const [key, color] of Object.entries(value)) {
    if (isThemeColorKey(key) && isHslString(color)) {
      overrides[key] = color;
    }
  }

  return overrides;
}

export function hexToHslString(hex: string): string {
  const normalized = normalizeHex(hex);
  const red = parseInt(normalized.slice(0, 2), 16) / 255;
  const green = parseInt(normalized.slice(2, 4), 16) / 255;
  const blue = parseInt(normalized.slice(4, 6), 16) / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;

  if (max === min) {
    return `0 0% ${Math.round(lightness * 100)}%`;
  }

  const delta = max - min;
  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue: number;

  switch (max) {
    case red:
      hue = (green - blue) / delta + (green < blue ? 6 : 0);
      break;
    case green:
      hue = (blue - red) / delta + 2;
      break;
    default:
      hue = (red - green) / delta + 4;
      break;
  }

  return `${Math.round(hue * 60)} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`;
}

export function hslStringToHex(hsl: string): string {
  const parsed = parseHslString(hsl);
  const saturation = parsed.saturation / 100;
  const lightness = parsed.lightness / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const huePrime = parsed.hue / 60;
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1));
  const match = lightness - chroma / 2;
  let red = 0;
  let green = 0;
  let blue = 0;

  if (huePrime >= 0 && huePrime < 1) {
    red = chroma;
    green = x;
  } else if (huePrime >= 1 && huePrime < 2) {
    red = x;
    green = chroma;
  } else if (huePrime >= 2 && huePrime < 3) {
    green = chroma;
    blue = x;
  } else if (huePrime >= 3 && huePrime < 4) {
    green = x;
    blue = chroma;
  } else if (huePrime >= 4 && huePrime < 5) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }

  return `#${toHexChannel(red + match)}${toHexChannel(green + match)}${toHexChannel(blue + match)}`;
}

function applyCustomThemeColors(
  tokens: ThemeTokenGroup,
  customColors: ThemeColorOverrides
): ThemeTokenGroup {
  const nextTokens = { ...tokens };
  const validCustomColors = sanitizeThemeColorOverrides(customColors);

  for (const [key, color] of Object.entries(validCustomColors)) {
    nextTokens[key] = color;
  }

  if (validCustomColors.primary) {
    nextTokens["primary-foreground"] = readableForeground(
      parseHslString(validCustomColors.primary)
    );
    nextTokens.ring = validCustomColors.primary;
    nextTokens["gradient-primary"] =
      "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)";
  }

  if (validCustomColors.background) {
    nextTokens.foreground = readableForeground(parseHslString(validCustomColors.background));
  }

  if (validCustomColors.accent) {
    nextTokens["accent-foreground"] = readableForeground(
      parseHslString(validCustomColors.accent)
    );
    nextTokens["gradient-primary"] =
      "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)";
    nextTokens["gradient-hero"] =
      "linear-gradient(135deg, hsl(var(--primary) / 0.10) 0%, hsl(var(--accent) / 0.08) 100%)";
  }

  return nextTokens;
}

interface ParsedHsl {
  hue: number;
  saturation: number;
  lightness: number;
}

function isHslString(value: unknown): value is string {
  if (typeof value !== "string") return false;

  try {
    parseHslString(value);
    return true;
  } catch {
    return false;
  }
}

function normalizeHex(hex: string): string {
  const trimmed = hex.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(trimmed)) {
    return trimmed
      .split("")
      .map((char) => `${char}${char}`)
      .join("")
      .toLowerCase();
  }

  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  throw new Error(`Invalid hex color: ${hex}`);
}

function parseHslString(hsl: string): ParsedHsl {
  const match = hsl
    .trim()
    .match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
  if (!match) {
    throw new Error(`Invalid HSL color: ${hsl}`);
  }

  const hue = Number(match[1]);
  const saturation = Number(match[2]);
  const lightness = Number(match[3]);

  if (
    hue < 0 ||
    hue > 360 ||
    saturation < 0 ||
    saturation > 100 ||
    lightness < 0 ||
    lightness > 100
  ) {
    throw new Error(`Invalid HSL color: ${hsl}`);
  }

  return { hue, saturation, lightness };
}

function readableForeground(color: ParsedHsl): string {
  return color.lightness < 54 ? "0 0% 100%" : "258 20% 13%";
}

function toHexChannel(channel: number): string {
  return Math.round(clamp(channel, 0, 1) * 255)
    .toString(16)
    .padStart(2, "0");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
>>>>>>> origin/bentoya/build-theme-picker-ui-in-settings-with-live-preview
