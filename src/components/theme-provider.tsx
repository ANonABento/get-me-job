"use client";

export {
  applyThemeVariables,
  getThemePreset,
  getThemeVariables,
  isThemeMode,
  isThemePresetName,
  themePresetNames,
  themePresets,
} from "@/lib/theme/theme-config";
export { ThemeProvider, useTheme } from "@/lib/theme/theme-provider";
export type {
  ResolvedThemeMode,
  ThemeMode,
  ThemePreset,
  ThemePresetName,
} from "@/lib/theme/theme-config";
