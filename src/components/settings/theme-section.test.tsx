import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@/components/theme-provider";
import {
  THEME_DARK_STORAGE_KEY,
  THEME_STORAGE_KEY,
} from "@/lib/theme/theme-config";
import { ThemeSection } from "./theme-section";

function renderThemeSection() {
  return render(
    <ThemeProvider>
      <ThemeSection />
    </ThemeProvider>
  );
}

function resetRootThemeState() {
  document.documentElement.className = "";
  document.documentElement.removeAttribute("data-theme-preset");
  document.documentElement.removeAttribute("data-theme-mode");
  document.documentElement.removeAttribute("style");
}

describe("ThemeSection", () => {
  beforeEach(() => {
    vi.mocked(window.localStorage.getItem).mockReset();
    vi.mocked(window.localStorage.setItem).mockReset();
    vi.mocked(window.localStorage.getItem).mockReturnValue(null);
    resetRootThemeState();
  });

  it("renders all built-in preset options and the mode toggle", () => {
    renderThemeSection();

    expect(screen.getByRole("heading", { name: "Theme" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /default/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /bloxy/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /glass/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /minimal/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /neon/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /warm earth/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /premium/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /use dark mode/i })
    ).toBeInTheDocument();
  });

  it("applies and persists a selected preset through the theme provider", async () => {
    renderThemeSection();

    await waitFor(() => {
      expect(document.documentElement.dataset.themePreset).toBe("default");
    });

    fireEvent.click(screen.getByRole("button", { name: /neon/i }));

    await waitFor(() => {
      expect(document.documentElement.dataset.themePreset).toBe("neon");
    });
    expect(document.documentElement.style.getPropertyValue("--primary")).toBe(
      "190 100% 50%"
    );
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      THEME_STORAGE_KEY,
      "neon"
    );
  });

  it("toggles and persists dark mode through the theme provider", async () => {
    renderThemeSection();

    await waitFor(() => {
      expect(document.documentElement.dataset.themeMode).toBe("light");
    });

    fireEvent.click(screen.getByRole("button", { name: /use dark mode/i }));

    await waitFor(() => {
      expect(document.documentElement.dataset.themeMode).toBe("dark");
    });
    expect(document.documentElement).toHaveClass("dark");
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      THEME_DARK_STORAGE_KEY,
      "true"
    );
    expect(
      screen.getByRole("button", { name: /use light mode/i })
    ).toBeInTheDocument();
  });
});
