"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { applyThemeTokens } from "./apply";
import {
  ALL_THEMES,
  DEFAULT_THEME_ID,
  getTheme,
  isThemeId,
} from "./registry";
import { THEME_DARK_STORAGE_KEY, THEME_STORAGE_KEY } from "./theme-config";
import { ThemeContext } from "./use-theme";
import type { ThemeId, ThemeVariant } from "./tokens";

function readStoredThemeId(): ThemeId {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeId(stored) ? stored : DEFAULT_THEME_ID;
  } catch {
    return DEFAULT_THEME_ID;
  }
}

function readStoredDarkMode(): boolean {
  try {
    return localStorage.getItem(THEME_DARK_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function persistValue(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Keep the in-memory theme when storage is blocked.
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME_ID);
  const [isDark, setIsDarkState] = useState(false);

  useEffect(() => {
    setThemeIdState(readStoredThemeId());
    setIsDarkState(readStoredDarkMode());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const preset = getTheme(themeId);
    const tokens = isDark ? preset.dark : preset.light;

    applyThemeTokens(tokens, root);
    root.dataset.themeMode = isDark ? "dark" : "light";
    root.classList.toggle("dark", isDark);
    persistValue(THEME_STORAGE_KEY, themeId);
    persistValue(THEME_DARK_STORAGE_KEY, String(isDark));
  }, [isDark, mounted, themeId]);

  const setThemeId = useCallback((nextThemeId: ThemeId) => {
    setThemeIdState(nextThemeId);
  }, []);

  const setIsDark = useCallback((nextIsDark: boolean) => {
    setIsDarkState(nextIsDark);
  }, []);

  const toggleDark = useCallback(() => {
    setIsDarkState((current) => !current);
  }, []);

  const setTheme = useCallback((theme: ThemeVariant) => {
    setIsDarkState(theme === "dark");
  }, []);

  const value = useMemo(() => {
    const stableThemeId = mounted ? themeId : DEFAULT_THEME_ID;
    const stableIsDark = mounted ? isDark : false;
    const currentTheme = getTheme(stableThemeId);
    const currentVariant: ThemeVariant = stableIsDark ? "dark" : "light";

    return {
      themeId: stableThemeId,
      setThemeId,
      isDark: stableIsDark,
      setIsDark,
      toggleDark,
      currentTheme,
      currentVariant,
      availableThemes: ALL_THEMES,
      theme: currentVariant,
      setTheme,
      resolvedTheme: currentVariant,
      themePreset: stableThemeId,
      setThemePreset: setThemeId,
      availableThemePresets: ALL_THEMES,
    };
  }, [isDark, mounted, setIsDark, setTheme, setThemeId, themeId, toggleDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
