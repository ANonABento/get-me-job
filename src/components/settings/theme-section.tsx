"use client";

import { CheckCircle, Moon, Palette, RotateCcw, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import {
  getThemePreviewColors,
  hexToHslString,
  hslStringToHex,
  type ThemeColorKey,
  type ThemePreset,
} from "@/lib/theme/theme-config";

const CUSTOM_COLOR_KEYS = [
  "primary",
  "background",
  "accent",
] as const satisfies readonly ThemeColorKey[];

const CUSTOM_LABELS: Record<ThemeColorKey, string> = {
  primary: "Primary",
  background: "Background",
  accent: "Accent",
};

export function ThemeSection() {
  const {
    theme,
    resolvedTheme,
    setTheme,
    themePreset,
    setThemePreset,
    customThemeColors,
    setCustomThemeColor,
    resetCustomThemeColors,
    availableThemePresets,
  } = useTheme();
  const darkModeEnabled = resolvedTheme === "dark";
  const previewColors = getThemePreviewColors(themePreset, customThemeColors);

  const toggleDarkMode = () => {
    setTheme(darkModeEnabled ? "light" : "dark");
  };

  const setSystemMode = () => {
    setTheme("system");
  };

  const updateCustomColor = (key: ThemeColorKey, hexColor: string) => {
    setCustomThemeColor(key, hexToHslString(hexColor));
  };

  return (
    <section className="rounded-2xl border bg-card p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">Theme</h2>
            <p className="text-sm text-muted-foreground">
              Choose a preset or adjust workspace colors.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant={theme === "system" ? "secondary" : "ghost"}
            size="sm"
            onClick={setSystemMode}
          >
            System
          </Button>
          <Button
            type="button"
            variant={darkModeEnabled ? "default" : "outline"}
            size="sm"
            onClick={toggleDarkMode}
            aria-pressed={darkModeEnabled}
          >
            {darkModeEnabled ? (
              <Moon className="mr-2 h-4 w-4" />
            ) : (
              <Sun className="mr-2 h-4 w-4" />
            )}
            Dark
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {availableThemePresets.map((preset) => (
          <ThemePresetCard
            key={preset.name}
            preset={preset}
            selected={themePreset === preset.name}
            onClick={() => setThemePreset(preset.name)}
          />
        ))}
      </div>

      <div className="mt-5 rounded-xl border bg-muted/30 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Custom colors</h3>
            <p className="text-sm text-muted-foreground">
              Override the active preset colors.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetCustomThemeColors}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {CUSTOM_COLOR_KEYS.map((key) => (
            <label key={key} className="space-y-2 text-sm font-medium">
              <span>{CUSTOM_LABELS[key]}</span>
              <input
                type="color"
                value={hslStringToHex(previewColors[key])}
                onChange={(event) => updateCustomColor(key, event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background p-1"
                aria-label={`${CUSTOM_LABELS[key]} color`}
              />
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}

interface ThemePresetCardProps {
  preset: ThemePreset;
  selected: boolean;
  onClick: () => void;
}

function ThemePresetCard({ preset, selected, onClick }: ThemePresetCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={`Select ${preset.label} theme`}
      className={`relative rounded-lg border-2 p-4 text-left transition-all ${
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-transparent bg-muted/50 hover:bg-muted"
      }`}
    >
      <div className="mb-4 flex overflow-hidden rounded-md border">
        {(Object.keys(preset.preview) as ThemeColorKey[]).map((key) => (
          <span
            key={key}
            className="h-7 flex-1"
            style={{ backgroundColor: hslStringToHex(preset.preview[key]) }}
            title={`${preset.label} ${key}`}
            aria-hidden="true"
          />
        ))}
      </div>
      <p className="font-medium">{preset.label}</p>
      <p className="mt-1 text-sm text-muted-foreground">{preset.description}</p>
      {selected && (
        <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-primary" />
      )}
    </button>
  );
}
