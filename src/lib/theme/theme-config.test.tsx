import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  THEME_PRESET_STORAGE_KEY,
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

function mockSystemTheme(matchesDark: boolean) {
  let mediaChangeHandler: ((event: MediaQueryListEvent) => void) | undefined;
  const mediaQuery = {
    matches: matchesDark,
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn((event, handler) => {
      if (event === "change") {
        mediaChangeHandler = handler;
      }
    }),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;
  const addEventListener = vi.fn((event, handler) => {
    if (event === "change") {
      mediaChangeHandler = handler;
    }
  });
  const removeEventListener = vi.fn();

  Object.defineProperty(mediaQuery, "addEventListener", { value: addEventListener });
  Object.defineProperty(mediaQuery, "removeEventListener", {
    value: removeEventListener,
  });
  vi.mocked(window.matchMedia).mockReturnValue(mediaQuery);

  return {
    addEventListener,
    removeEventListener,
    dispatchChange(matches: boolean) {
      Object.defineProperty(mediaQuery, "matches", {
        configurable: true,
        value: matches,
      });
      mediaChangeHandler?.({ matches } as MediaQueryListEvent);
    },
  };
}

function ThemeProbe() {
  const {
    theme,
    resolvedTheme,
    themePreset,
    setTheme,
    setThemePreset,
    availableThemePresets,
  } = useTheme();

  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <span data-testid="theme-preset">{themePreset}</span>
      <span data-testid="preset-count">{availableThemePresets.length}</span>
      <button type="button" onClick={() => setThemePreset("bold")}>
        Use bold
      </button>
      <button type="button" onClick={() => setTheme("system")}>
        Use system
      </button>
    </div>
  );
}

describe("theme config", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRootThemeState();
    mockSystemTheme(false);
    vi.mocked(window.localStorage.getItem).mockReturnValue(null);
  });

  it("falls back to the default preset for unknown preset names", () => {
    expect(getThemePreset("missing").name).toBe("default");
    expect(getThemePreset("bold").name).toBe("bold");
  });

  it("returns CSS custom properties for a preset and color mode", () => {
    const variables = getThemeVariables("bold", "light");

    expect(variables["--primary"]).toBe("246 100% 45%");
    expect(variables["--border-width"]).toBe("2px");
    expect(variables["--font-sans"]).toContain("Aptos");
  });

  it("applies theme variables and metadata to an element", () => {
    applyThemeVariables(document.documentElement, "glassmorphism", "dark");

    expect(document.documentElement.dataset.themePreset).toBe("glassmorphism");
    expect(document.documentElement.dataset.themeMode).toBe("dark");
    expect(document.documentElement.style.getPropertyValue("--backdrop-blur")).toBe(
      "28px"
    );
  });

  it("loads stored theme mode and theme preset in the provider", async () => {
    vi.mocked(window.localStorage.getItem).mockImplementation((key) => {
      if (key === THEME_STORAGE_KEY) return "dark";
      if (key === THEME_PRESET_STORAGE_KEY) return "minimal";
      return null;
    });

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
      expect(screen.getByTestId("resolved-theme")).toHaveTextContent("dark");
      expect(screen.getByTestId("theme-preset")).toHaveTextContent("minimal");
    });

    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement.dataset.themePreset).toBe("minimal");
    expect(screen.getByTestId("preset-count")).toHaveTextContent(
      String(themePresetNames.length)
    );
  });

  it("ignores invalid stored values and applies the default theme preset", async () => {
    vi.mocked(window.localStorage.getItem).mockImplementation((key) => {
      if (key === THEME_STORAGE_KEY) return "sepia";
      if (key === THEME_PRESET_STORAGE_KEY) return "neon";
      return null;
    });

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("theme")).toHaveTextContent("system");
      expect(screen.getByTestId("resolved-theme")).toHaveTextContent("light");
      expect(screen.getByTestId("theme-preset")).toHaveTextContent("default");
    });

    expect(document.documentElement.dataset.themePreset).toBe("default");
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("updates the resolved theme when the system preference changes", async () => {
    const media = mockSystemTheme(false);

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("resolved-theme")).toHaveTextContent("light");
    });

    await act(async () => {
      media.dispatchChange(true);
    });

    await waitFor(() => {
      expect(screen.getByTestId("resolved-theme")).toHaveTextContent("dark");
    });

    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement.dataset.themeMode).toBe("dark");
  });

  it("persists and applies preset changes from the provider", async () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(document.documentElement.dataset.themePreset).toBe("default");
    });

    await act(async () => {
      screen.getByRole("button", { name: "Use bold" }).click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("theme-preset")).toHaveTextContent("bold");
    });

    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      THEME_PRESET_STORAGE_KEY,
      "bold"
    );
    expect(document.documentElement.dataset.themePreset).toBe("bold");
    expect(document.documentElement.style.getPropertyValue("--border-width")).toBe(
      "2px"
    );
  });
});
