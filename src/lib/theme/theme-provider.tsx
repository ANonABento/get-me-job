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
  THEME_PRESET_STORAGE_KEY,
  THEME_STORAGE_KEY,
  isThemeMode,
  isThemePresetName,
  themePresetNames,
  themePresets,
  type ResolvedThemeMode,
  type ThemeMode,
  type ThemePreset,
  type ThemePresetName,
} from "./theme-config";
import {
  DEFAULT_CUSTOM_THEME,
  THEME_CHANGE_EVENT,
  applyThemePreference,
  readThemePreference,
  type ThemePreference,
} from "./theme-presets";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  resolvedTheme: ResolvedThemeMode;
  themePreset: ThemePresetName;
  setThemePreset: (preset: ThemePresetName) => void;
  availableThemePresets: readonly ThemePreset[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const LEGACY_THEME_STORAGE_KEY = "theme";
const LEGACY_THEME_PRESET_STORAGE_KEY = "theme-preset";
const DEFAULT_THEME_PREFERENCE: ThemePreference = {
  presetId: DEFAULT_THEME_PRESET,
  customColors: DEFAULT_CUSTOM_THEME,
};

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

function readStoredValueWithLegacyFallback<T>(
  key: string,
  legacyKey: string,
  isValid: (value: unknown) => value is T
): T | null {
  return (
    readStoredValue(key, isValid) ?? readStoredValue(legacyKey, isValid)
  );
}

function persistValue(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors and keep the in-memory value.
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(DEFAULT_THEME_MODE);
  const [themePreset, setThemePresetState] =
    useState<ThemePresetName>(DEFAULT_THEME_PRESET);
  const [themePreference, setThemePreference] =
    useState<ThemePreference>(DEFAULT_THEME_PREFERENCE);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const storedTheme = readStoredValueWithLegacyFallback(
      THEME_STORAGE_KEY,
      LEGACY_THEME_STORAGE_KEY,
      isThemeMode
    );
    if (storedTheme) {
      setThemeState(storedTheme);
    }

    const storedPreference = readThemePreference();
    const storedPreset = readStoredValueWithLegacyFallback(
      THEME_PRESET_STORAGE_KEY,
      LEGACY_THEME_PRESET_STORAGE_KEY,
      isThemePresetName
    );
    const nextPreference =
      storedPreference.presetId === "custom"
        ? storedPreference
        : {
            ...storedPreference,
            presetId: storedPreset ?? storedPreference.presetId,
          };

    setThemePreference(nextPreference);
    if (isThemePresetName(nextPreference.presetId)) {
      setThemePresetState(nextPreference.presetId);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (
      currentTheme: ThemeMode,
      currentPreference: ThemePreference
    ) => {
      const nextResolvedTheme =
        currentTheme === "system"
          ? mediaQuery.matches
            ? "dark"
            : "light"
          : currentTheme;

      setResolvedTheme(nextResolvedTheme);
      root.classList.toggle("dark", nextResolvedTheme === "dark");
      applyThemePreference(root, currentPreference);
    };

    applyTheme(theme, themePreference);

    const handleMediaChange = () => {
      if (theme === "system") {
        applyTheme("system", themePreference);
      }
    };

    const handleThemePreferenceChange = () => {
      const nextPreference = readThemePreference();
      setThemePreference(nextPreference);
      if (isThemePresetName(nextPreference.presetId)) {
        setThemePresetState(nextPreference.presetId);
      }
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    window.addEventListener(THEME_CHANGE_EVENT, handleThemePreferenceChange);
    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemePreferenceChange);
    };
  }, [theme, themePreference, mounted]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    persistValue(THEME_STORAGE_KEY, newTheme);
  }, []);

  const setThemePreset = useCallback((newPreset: ThemePresetName) => {
    setThemePresetState(newPreset);
    setThemePreference((currentPreference) => ({
      presetId: newPreset,
      customColors: currentPreference.customColors,
    }));
    persistValue(THEME_PRESET_STORAGE_KEY, newPreset);
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
      availableThemePresets,
    }),
    [
      availableThemePresets,
      mounted,
      resolvedTheme,
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
