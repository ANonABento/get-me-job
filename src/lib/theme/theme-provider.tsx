"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_THEME_MODE,
  DEFAULT_THEME_PRESET,
  THEME_CUSTOM_COLORS_STORAGE_KEY,
  THEME_DARK_STORAGE_KEY,
  THEME_PRESET_STORAGE_KEY,
  THEME_STORAGE_KEY,
  applyThemeVariables,
  hasThemeColorOverrides,
  isThemeMode,
  isThemePresetName,
  sanitizeThemeColorOverrides,
  themePresetNames,
  themePresets,
  type ResolvedThemeMode,
  type ThemeColorKey,
  type ThemeColorOverrides,
  type ThemeMode,
  type ThemePreset,
  type ThemePresetName,
} from "./theme-config";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  resolvedTheme: ResolvedThemeMode;
  themePreset: ThemePresetName;
  setThemePreset: (preset: ThemePresetName) => void;
  cycleThemePreset: () => void;
  customThemeColors: ThemeColorOverrides;
  setCustomThemeColor: (key: ThemeColorKey, color: string) => void;
  resetCustomThemeColors: () => void;
  availableThemePresets: readonly ThemePreset[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
let themeTransitionTimeoutId: number | undefined;

function readStoredValue<T>(
  key: string,
  isValid: (value: unknown) => value is T
): T | null {
  try {
    const stored = localStorage.getItem(key);
    return isValid(stored) ? stored : null;
  } catch {
    return null;
  }
}

function persistValue(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors and keep the in-memory value.
  }
}

function readStoredTheme(): ThemeMode | null {
  const storedTheme = readStoredValue(THEME_STORAGE_KEY, isThemeMode);
  if (storedTheme) {
    return storedTheme;
  }

  const legacyDarkMode = readStoredValue(
    THEME_DARK_STORAGE_KEY,
    (value): value is "true" | "false" => value === "true" || value === "false"
  );

  if (!legacyDarkMode) {
    return null;
  }

  return legacyDarkMode === "true" ? "dark" : "light";
}

function readStoredCustomColors(): ThemeColorOverrides {
  try {
    const stored = localStorage.getItem(THEME_CUSTOM_COLORS_STORAGE_KEY);
    if (!stored) return {};

    return sanitizeThemeColorOverrides(JSON.parse(stored));
  } catch {
    return {};
  }
}

function persistCustomColors(colors: ThemeColorOverrides): void {
  try {
    if (hasThemeColorOverrides(colors)) {
      localStorage.setItem(THEME_CUSTOM_COLORS_STORAGE_KEY, JSON.stringify(colors));
    } else {
      localStorage.removeItem(THEME_CUSTOM_COLORS_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors and keep the in-memory value.
  }
}

function startThemeTransition(root: HTMLElement): void {
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (themeTransitionTimeoutId !== undefined) {
    window.clearTimeout(themeTransitionTimeoutId);
  }

  if (motionQuery.matches) {
    root.classList.remove("theme-transitioning");
    themeTransitionTimeoutId = undefined;
    return;
  }

  root.classList.add("theme-transitioning");
  themeTransitionTimeoutId = window.setTimeout(() => {
    root.classList.remove("theme-transitioning");
    themeTransitionTimeoutId = undefined;
  }, 260);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(DEFAULT_THEME_MODE);
  const [themePreset, setThemePresetState] =
    useState<ThemePresetName>(DEFAULT_THEME_PRESET);
  const [customThemeColors, setCustomThemeColorsState] =
    useState<ThemeColorOverrides>({});
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const storedTheme = readStoredTheme();
    if (storedTheme) {
      setThemeState(storedTheme);
    }

    const storedPreset = readStoredValue(
      THEME_PRESET_STORAGE_KEY,
      isThemePresetName
    );
    if (storedPreset) {
      setThemePresetState(storedPreset);
    }

    setCustomThemeColorsState(readStoredCustomColors());
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (
      currentTheme: ThemeMode,
      currentPreset: ThemePresetName
    ) => {
      const nextResolvedTheme =
        currentTheme === "system"
          ? mediaQuery.matches
            ? "dark"
            : "light"
          : currentTheme;

      setResolvedTheme(nextResolvedTheme);
      startThemeTransition(root);
      root.classList.toggle("dark", nextResolvedTheme === "dark");
      applyThemeVariables(
        root,
        currentPreset,
        nextResolvedTheme,
        customThemeColors
      );
    };

    applyTheme(theme, themePreset);

    const handleMediaChange = () => {
      if (theme === "system") {
        applyTheme("system", themePreset);
      }
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, [customThemeColors, theme, themePreset, mounted]);

  const cycleThemePreset = useCallback(() => {
    setThemePresetState((currentPreset) => {
      const currentIndex = themePresetNames.indexOf(currentPreset);
      const nextPreset =
        themePresetNames[(currentIndex + 1) % themePresetNames.length];
      persistValue(THEME_PRESET_STORAGE_KEY, nextPreset);
      return nextPreset;
    });
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && !event.metaKey && event.key.toLowerCase() === "t") {
        event.preventDefault();
        cycleThemePreset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cycleThemePreset, mounted]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    persistValue(THEME_STORAGE_KEY, newTheme);
  }, []);

  const setThemePreset = useCallback((newPreset: ThemePresetName) => {
    setThemePresetState(newPreset);
    persistValue(THEME_PRESET_STORAGE_KEY, newPreset);
  }, []);

  const setCustomThemeColor = useCallback(
    (key: ThemeColorKey, color: string) => {
      setCustomThemeColorsState((currentColors) => {
        const nextColors = sanitizeThemeColorOverrides({
          ...currentColors,
          [key]: color,
        });
        persistCustomColors(nextColors);
        return nextColors;
      });
    },
    []
  );

  const resetCustomThemeColors = useCallback(() => {
    setCustomThemeColorsState({});
    persistCustomColors({});
  }, []);

  const availableThemePresets = useMemo(
    () => themePresetNames.map((name) => themePresets[name]),
    []
  );

  const value = useMemo<ThemeContextType>(
    () => ({
      theme: mounted ? theme : DEFAULT_THEME_MODE,
      setTheme: mounted ? setTheme : () => {},
      resolvedTheme: mounted ? resolvedTheme : "light",
      themePreset: mounted ? themePreset : DEFAULT_THEME_PRESET,
      setThemePreset: mounted ? setThemePreset : () => {},
      cycleThemePreset: mounted ? cycleThemePreset : () => {},
      customThemeColors: mounted ? customThemeColors : {},
      setCustomThemeColor: mounted ? setCustomThemeColor : () => {},
      resetCustomThemeColors: mounted ? resetCustomThemeColors : () => {},
      availableThemePresets,
    }),
    [
      availableThemePresets,
      mounted,
      resolvedTheme,
      cycleThemePreset,
      customThemeColors,
      resetCustomThemeColors,
      setCustomThemeColor,
      setTheme,
      setThemePreset,
      theme,
      themePreset,
    ]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
