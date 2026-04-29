import {
  bloxyTheme,
  defaultTheme,
  earthTheme,
  glassTheme,
  minimalTheme,
  neonTheme,
  premiumTheme,
} from "./presets";
import { themeIds, type ThemeId, type ThemePreset } from "./tokens";

export const ALL_THEMES = [
  defaultTheme,
  bloxyTheme,
  glassTheme,
  minimalTheme,
  neonTheme,
  earthTheme,
  premiumTheme,
] as const satisfies readonly ThemePreset[];

export const THEME_IDS = themeIds;
export const DEFAULT_THEME_ID: ThemeId = "default";

const themesById = new Map<ThemeId, ThemePreset>(
  ALL_THEMES.map((theme) => [theme.id, theme])
);

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && themeIds.includes(value as ThemeId);
}

export function getTheme(themeId: unknown): ThemePreset {
  return themesById.get(isThemeId(themeId) ? themeId : DEFAULT_THEME_ID) ?? defaultTheme;
}

export function getThemeIds(): readonly ThemeId[] {
  return themeIds;
}
