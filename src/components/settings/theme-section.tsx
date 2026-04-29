"use client";

import { CheckCircle, Moon, Palette, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ThemeSection() {
  const {
    availableThemePresets,
    isDark,
    setIsDark,
    setThemePreset,
    themePreset,
  } = useTheme();

  return (
    <section className="rounded-2xl border bg-card p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">Theme</h2>
            <p className="text-sm text-muted-foreground">
              Choose a preset and color mode for your workspace
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsDark(!isDark)}
        >
          {isDark ? (
            <Sun className="mr-2 h-4 w-4" />
          ) : (
            <Moon className="mr-2 h-4 w-4" />
          )}
          {isDark ? "Use light mode" : "Use dark mode"}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {availableThemePresets.map((preset) => (
          <ThemeChoiceButton
            key={preset.id}
            label={preset.name}
            description={preset.description}
            colors={[
              preset.preview.primary,
              preset.preview.background,
              preset.preview.accent,
            ]}
            selected={themePreset === preset.id}
            onClick={() => setThemePreset(preset.id)}
          />
        ))}
      </div>
    </section>
  );
}

interface ThemeChoiceButtonProps {
  label: string;
  description: string;
  colors: string[];
  selected: boolean;
  onClick: () => void;
}

function ThemeChoiceButton({
  label,
  description,
  colors,
  selected,
  onClick,
}: ThemeChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`relative rounded-xl border-2 p-4 text-left transition-all ${
        selected
          ? "border-primary bg-primary/5"
          : "border-transparent bg-muted/50 hover:bg-muted"
      }`}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex overflow-hidden rounded-md border">
          {colors.map((color) => (
            <span
              key={color}
              className="h-7 w-9"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
      <p className="font-medium">{label}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {selected && (
        <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-primary" />
      )}
    </button>
  );
}
