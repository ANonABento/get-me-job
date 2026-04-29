import { applyThemeTokens, themeTokensToCssVariables } from "./apply";
import {
  ALL_THEMES,
  DEFAULT_THEME_ID,
  getTheme,
  getThemeIds,
  isThemeId,
} from "./registry";
import type {
  ThemeId,
  ThemePreset as TokenThemePreset,
  ThemeVariant,
} from "./tokens";

export type ThemeMode = ThemeVariant;
export type ResolvedThemeMode = ThemeVariant;
export type ThemePresetName = ThemeId;
export type ThemePreset = TokenThemePreset;

export const THEME_STORAGE_KEY = "taida-theme";
export const THEME_DARK_STORAGE_KEY = "taida-dark";
export const THEME_PRESET_STORAGE_KEY = THEME_STORAGE_KEY;
export const DEFAULT_THEME_MODE: ThemeMode = "light";
export const DEFAULT_THEME_PRESET: ThemePresetName = DEFAULT_THEME_ID;
export const themePresetNames = getThemeIds();
export const themePresets = Object.fromEntries(
  ALL_THEMES.map((theme) => [theme.id, theme])
) as Record<ThemePresetName, TokenThemePreset>;

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark";
}

export const isThemePresetName = isThemeId;

export function getThemePreset(name: unknown): ThemePreset {
  return getTheme(name);
}

export function getThemeVariables(
  presetName: unknown,
  resolvedTheme: ResolvedThemeMode
): Record<`--${string}`, string> {
  const preset = getTheme(presetName);
  return themeTokensToCssVariables(preset[resolvedTheme]);
}

export function applyThemeVariables(
  root: HTMLElement,
  presetName: unknown,
  resolvedTheme: ResolvedThemeMode
): void {
  const preset = getTheme(presetName);
  root.dataset.themeMode = resolvedTheme;
  root.classList.toggle("dark", resolvedTheme === "dark");
  applyThemeTokens(preset[resolvedTheme], root);
}
