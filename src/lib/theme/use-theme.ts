"use client";

import { createContext, useContext } from "react";
import type { ThemeId, ThemePreset, ThemeVariant } from "./tokens";

export interface ThemeContextValue {
  themeId: ThemeId;
  setThemeId: (themeId: ThemeId) => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  toggleDark: () => void;
  currentTheme: ThemePreset;
  currentVariant: ThemeVariant;
  availableThemes: readonly ThemePreset[];
  theme: ThemeVariant;
  setTheme: (theme: ThemeVariant) => void;
  resolvedTheme: ThemeVariant;
  themePreset: ThemeId;
  setThemePreset: (themeId: ThemeId) => void;
  availableThemePresets: readonly ThemePreset[];
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
);

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
