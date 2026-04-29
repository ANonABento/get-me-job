import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@/components/theme-provider";
import {
  THEME_CUSTOM_COLORS_STORAGE_KEY,
  THEME_PRESET_STORAGE_KEY,
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

describe("ThemeSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(window.localStorage.getItem).mockReturnValue(null);
    document.documentElement.className = "";
    document.documentElement.removeAttribute("style");
    document.documentElement.removeAttribute("data-theme-preset");
    document.documentElement.removeAttribute("data-theme-mode");
    document.documentElement.removeAttribute("data-theme-custom");
  });

  it("renders seven preset theme cards", async () => {
    renderThemeSection();

    expect(screen.getByRole("heading", { name: "Theme" })).toBeInTheDocument();
<<<<<<< HEAD
    expect(screen.getByRole("button", { name: /taida/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ocean/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /forest/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sunset/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /bold/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /glassmorphism/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /minimal/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /customize/i })).toBeInTheDocument();
  });
=======
>>>>>>> origin/bentoya/build-theme-picker-ui-in-settings-with-live-preview

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /select .* theme/i })).toHaveLength(7);
    });

    expect(screen.getByRole("button", { name: /select ocean theme/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /select forest theme/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /select sunset theme/i })).toBeInTheDocument();
  });

  it("applies and persists a selected preset", async () => {
    renderThemeSection();

    fireEvent.click(await screen.findByRole("button", { name: /select ocean theme/i }));

    await waitFor(() => {
      expect(document.documentElement.dataset.themePreset).toBe("ocean");
    });

    expect(document.documentElement.style.getPropertyValue("--primary")).toBe(
      "190 86% 38%"
    );
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      THEME_PRESET_STORAGE_KEY,
      "ocean"
    );
  });

  it("toggles dark mode through the provider", async () => {
    renderThemeSection();

    fireEvent.click(await screen.findByRole("button", { name: "Dark" }));

    await waitFor(() => {
      expect(document.documentElement.dataset.themeMode).toBe("dark");
    });

    expect(document.documentElement).toHaveClass("dark");
    expect(window.localStorage.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, "dark");
  });

  it("applies and persists custom color edits", async () => {
    renderThemeSection();

    fireEvent.change(await screen.findByLabelText("Primary color"), {
      target: { value: "#22c55e" },
    });

    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue("--primary")).toBe(
        "142 71% 45%"
      );
    });

    expect(document.documentElement.dataset.themeCustom).toBe("true");
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      THEME_CUSTOM_COLORS_STORAGE_KEY,
      JSON.stringify({ primary: "142 71% 45%" })
    );
  });

  it("keeps preset card swatches tied to the preset when custom colors change", async () => {
    renderThemeSection();

    fireEvent.change(await screen.findByLabelText("Primary color"), {
      target: { value: "#22c55e" },
    });

    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue("--primary")).toBe(
        "142 71% 45%"
      );
    });

    expect(screen.getByTitle("Ocean primary")).toHaveStyle({
      backgroundColor: "rgb(14, 153, 180)",
    });
  });

  it("loads stored theme settings", async () => {
    vi.mocked(window.localStorage.getItem).mockImplementation((key) => {
      if (key === THEME_STORAGE_KEY) return "dark";
      if (key === THEME_PRESET_STORAGE_KEY) return "forest";
      if (key === THEME_CUSTOM_COLORS_STORAGE_KEY) {
        return JSON.stringify({ accent: "278 64% 56%" });
      }
      return null;
    });

    renderThemeSection();

    await waitFor(() => {
      expect(document.documentElement.dataset.themePreset).toBe("forest");
      expect(document.documentElement.dataset.themeMode).toBe("dark");
      expect(document.documentElement.style.getPropertyValue("--accent")).toBe(
        "278 64% 56%"
      );
    });
  });
});
