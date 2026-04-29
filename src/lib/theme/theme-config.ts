export type ThemeMode = "light" | "dark" | "system";
export type ResolvedThemeMode = "light" | "dark";
export type ThemePresetName = "default" | "bold" | "glassmorphism" | "minimal";

export const THEME_STORAGE_KEY = "theme";
export const THEME_PRESET_STORAGE_KEY = "theme-preset";
export const DEFAULT_THEME_MODE: ThemeMode = "system";
export const DEFAULT_THEME_PRESET: ThemePresetName = "default";

export const themePresetNames = [
  "default",
  "bold",
  "glassmorphism",
  "minimal",
] as const satisfies readonly ThemePresetName[];

type ThemeTokenGroup = Record<string, string>;

export interface ThemePreset {
  name: ThemePresetName;
  label: string;
  description: string;
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
  "shadow-sm": "0 1px 2px 0 rgb(100 60 130 / 0.04)",
  shadow:
    "0 1px 3px 0 rgb(100 60 130 / 0.06), 0 1px 2px -1px rgb(100 60 130 / 0.06)",
  "shadow-md":
    "0 4px 6px -1px rgb(100 60 130 / 0.06), 0 2px 4px -2px rgb(100 60 130 / 0.04)",
  "shadow-lg":
    "0 10px 15px -3px rgb(100 60 130 / 0.08), 0 4px 6px -4px rgb(100 60 130 / 0.04)",
  "shadow-xl":
    "0 20px 25px -5px rgb(100 60 130 / 0.10), 0 8px 10px -6px rgb(100 60 130 / 0.04)",
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
  "shadow-sm": "0 1px 2px 0 rgb(0 0 0 / 0.3)",
  shadow: "0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.3)",
  "shadow-md": "0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)",
  "shadow-lg": "0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.3)",
  "shadow-xl": "0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.3)",
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
    label: "Default",
    description: "Current violet and coral theme.",
    light: defaultLight,
    dark: defaultDark,
  },
  bold: {
    name: "bold",
    label: "Bold",
    description: "High contrast color with stronger borders.",
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
};

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

export function isThemePresetName(value: unknown): value is ThemePresetName {
  return typeof value === "string" && themePresetNames.includes(value as ThemePresetName);
}

export function getThemePreset(name: unknown): ThemePreset {
  return themePresets[isThemePresetName(name) ? name : "default"];
}

export function getThemeVariables(
  presetName: unknown,
  resolvedTheme: ResolvedThemeMode
): Record<`--${string}`, string> {
  const preset = getThemePreset(presetName);
  const tokens = preset[resolvedTheme];

  return Object.fromEntries(
    Object.entries(tokens).map(([name, value]) => [`--${name}`, value])
  ) as Record<`--${string}`, string>;
}

export function applyThemeVariables(
  root: HTMLElement,
  presetName: unknown,
  resolvedTheme: ResolvedThemeMode
): void {
  const preset = getThemePreset(presetName);
  const variables = getThemeVariables(preset.name, resolvedTheme);

  root.dataset.themePreset = preset.name;
  root.dataset.themeMode = resolvedTheme;

  for (const [name, value] of Object.entries(variables)) {
    root.style.setProperty(name, value);
  }
}
