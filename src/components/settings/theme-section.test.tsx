import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@/components/theme-provider";
import {
  THEME_DARK_STORAGE_KEY,
  THEME_STORAGE_KEY,
} from "@/lib/theme/storage-keys";
import { ThemeSection } from "./theme-section";

function renderThemeSection() {
  return render(
    <ThemeProvider>
      <ThemeSection />
    </ThemeProvider>,
  );
}

describe("ThemeSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(window.localStorage.getItem).mockReturnValue(null);
    document.documentElement.className = "";
    document.documentElement.removeAttribute("style");
    document.documentElement.removeAttribute("data-theme-preset");
    document.documentElement.removeAttribute("data-theme-mode");
  });

  it("renders seven preset theme cards", async () => {
    renderThemeSection();

    expect(screen.getByRole("heading", { name: "Theme" })).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getAllByRole("button", { name: /select .* theme/i }),
      ).toHaveLength(7);
    });

    expect(
      screen.getByRole("button", { name: /select bloxy theme/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /select glass theme/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /select warm earth theme/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /select neon theme/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /select premium theme/i }),
    ).toBeInTheDocument();
  });

  it("applies and persists a selected preset", async () => {
    renderThemeSection();

    fireEvent.click(
      await screen.findByRole("button", { name: /select neon theme/i }),
    );

    await waitFor(() => {
      expect(document.documentElement.dataset.themePreset).toBe("neon");
    });

    expect(document.documentElement.style.getPropertyValue("--primary")).toBe(
      "190 100% 50%",
    );
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      THEME_STORAGE_KEY,
      "neon",
    );
  });

  it("toggles dark mode through the provider", async () => {
    renderThemeSection();

    fireEvent.click(await screen.findByRole("button", { name: "Dark" }));

    await waitFor(() => {
      expect(document.documentElement.dataset.themeMode).toBe("dark");
    });

    expect(document.documentElement).toHaveClass("dark");
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      THEME_DARK_STORAGE_KEY,
      "true",
    );
  });

  it("loads stored theme settings", async () => {
    vi.mocked(window.localStorage.getItem).mockImplementation((key) => {
      if (key === THEME_STORAGE_KEY) return "earth";
      if (key === THEME_DARK_STORAGE_KEY) return "true";
      return null;
    });

    renderThemeSection();

    await waitFor(() => {
      expect(document.documentElement.dataset.themePreset).toBe("earth");
      expect(document.documentElement.dataset.themeMode).toBe("dark");
    });

    expect(document.documentElement).toHaveClass("dark");
  });
});
