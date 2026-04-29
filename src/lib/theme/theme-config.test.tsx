import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  THEME_DARK_STORAGE_KEY,
  THEME_STORAGE_KEY,
  applyThemeVariables,
  getThemePreset,
  getThemeVariables,
  themePresetNames,
} from "./theme-config";
import { ThemeProvider, useTheme } from "./theme-provider";

function resetRootThemeState() {
  document.documentElement.className = "";
  document.documentElement.removeAttribute("data-theme-preset");
  document.documentElement.removeAttribute("data-theme-mode");
  document.documentElement.removeAttribute("style");
}

function ThemeProbe() {
  const {
    themeId,
    isDark,
    resolvedTheme,
    themePreset,
    setThemeId,
    setTheme,
    toggleDark,
    availableThemePresets,
  } = useTheme();

  return (
    <div>
      <span data-testid="theme-id">{themeId}</span>
      <span data-testid="is-dark">{String(isDark)}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <span data-testid="theme-preset">{themePreset}</span>
      <span data-testid="preset-count">{availableThemePresets.length}</span>
      <button type="button" onClick={() => setThemeId("bloxy")}>
        Use bloxy
      </button>
      <button type="button" onClick={() => setTheme("dark")}>
        Use dark
      </button>
      <button type="button" onClick={toggleDark}>
        Toggle dark
      </button>
    </div>
  );
}

describe("theme config", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRootThemeState();
    vi.mocked(window.localStorage.getItem).mockReturnValue(null);
  });

  it("falls back to the default preset for unknown preset names", () => {
    expect(getThemePreset("missing").id).toBe("default");
    expect(getThemePreset("neon").id).toBe("neon");
  });

  it("returns CSS custom properties for a preset and color mode", () => {
    const variables = getThemeVariables("bloxy", "light");

    expect(variables["--primary"]).toBe("0 100% 66%");
    expect(variables["--border-width"]).toBe("3px");
    expect(variables["--font-sans"]).toContain("Courier New");
    expect(variables["--shadow-button"]).toBe("3px 3px 0 #111");
  });

  it("applies theme variables and metadata to an element", () => {
    applyThemeVariables(document.documentElement, "glass", "dark");

    expect(document.documentElement.dataset.themePreset).toBe("glass");
    expect(document.documentElement.dataset.themeMode).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement.style.getPropertyValue("--backdrop-blur")).toBe(
      "blur(20px)"
    );
    expect(document.documentElement.style.getPropertyValue("--gradient-bg")).toContain(
      "linear-gradient"
    );
  });

  it("loads stored theme id and dark preference in the provider", async () => {
    vi.mocked(window.localStorage.getItem).mockImplementation((key) => {
      if (key === THEME_STORAGE_KEY) return "minimal";
      if (key === THEME_DARK_STORAGE_KEY) return "true";
      return null;
    });

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("theme-id")).toHaveTextContent("minimal");
      expect(screen.getByTestId("is-dark")).toHaveTextContent("true");
      expect(screen.getByTestId("resolved-theme")).toHaveTextContent("dark");
    });

    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement.dataset.themePreset).toBe("minimal");
    expect(screen.getByTestId("preset-count")).toHaveTextContent(
      String(themePresetNames.length)
    );
  });

  it("ignores invalid stored values and applies the default light theme", async () => {
    vi.mocked(window.localStorage.getItem).mockImplementation((key) => {
      if (key === THEME_STORAGE_KEY) return "sepia";
      if (key === THEME_DARK_STORAGE_KEY) return "false";
      return null;
    });

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("theme-id")).toHaveTextContent("default");
      expect(screen.getByTestId("is-dark")).toHaveTextContent("false");
      expect(screen.getByTestId("resolved-theme")).toHaveTextContent("light");
    });

    expect(document.documentElement.dataset.themePreset).toBe("default");
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("persists and applies preset and dark mode changes from the provider", async () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(document.documentElement.dataset.themePreset).toBe("default");
    });

    await act(async () => {
      screen.getByRole("button", { name: "Use bloxy" }).click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("theme-id")).toHaveTextContent("bloxy");
    });

    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      THEME_STORAGE_KEY,
      "bloxy"
    );
    expect(document.documentElement.dataset.themePreset).toBe("bloxy");
    expect(document.documentElement.style.getPropertyValue("--border-width")).toBe(
      "3px"
    );

    await act(async () => {
      screen.getByRole("button", { name: "Use dark" }).click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("resolved-theme")).toHaveTextContent("dark");
    });

    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      THEME_DARK_STORAGE_KEY,
      "true"
    );
    expect(document.documentElement).toHaveClass("dark");
  });
});
