"use client";

import { CheckCircle, Moon, Palette, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageSection } from "@/components/ui/page-layout";
import { useTheme } from "@/components/theme-provider";
import type { ThemePreset } from "@/lib/theme/tokens";
import { useA11yTranslations } from "@/lib/i18n/use-a11y-translations";
import {
  ACCENTS,
  DENSITIES,
  DISPLAY_FONTS,
  RADII,
  useEditorialPrefs,
  type AccentId,
  type DensityId,
  type DisplayFontId,
  type RadiusId,
} from "@/lib/editorial-prefs";
import { cn } from "@/lib/utils";

/**
 * Curated preset list for the Appearance picker. We keep the visually
 * distinct ones and hide the presets whose look overlaps `slothing`
 * (default / minimal / earth). The presets are still in the registry —
 * existing users with those values stored continue to render correctly,
 * we just don't surface them to new pickers.
 */
const VISIBLE_PRESET_IDS = [
  "slothing",
  "bloxy",
  "glass",
  "neon",
  "premium",
] as const;
const visiblePresetSet = new Set<string>(VISIBLE_PRESET_IDS);

export function ThemeSection() {
  const a11yT = useA11yTranslations();
  const { isDark, toggleDark, themeId, setThemeId, availableThemes } =
    useTheme();
  const visiblePresets = availableThemes.filter((preset) =>
    visiblePresetSet.has(preset.id),
  );

  return (
    <div className="space-y-6">
      <PageSection
        title={a11yT("theme")}
        description="Choose a preset or adjust workspace colors."
        icon={Palette}
        action={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={isDark ? "default" : "outline"}
              size="sm"
              onClick={toggleDark}
              aria-pressed={isDark}
            >
              {isDark ? (
                <Moon className="mr-2 h-4 w-4" />
              ) : (
                <Sun className="mr-2 h-4 w-4" />
              )}
              Dark
            </Button>
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePresets.map((preset) => (
            <ThemePresetCard
              key={preset.id}
              preset={preset}
              selected={themeId === preset.id}
              onClick={() => setThemeId(preset.id)}
            />
          ))}
        </div>
      </PageSection>

      <EditorialControlsSection />
    </div>
  );
}

interface ThemePresetCardProps {
  preset: ThemePreset;
  selected: boolean;
  onClick: () => void;
}

function ThemePresetCard({ preset, selected, onClick }: ThemePresetCardProps) {
  const previewKeys = Object.keys(
    preset.preview,
  ) as (keyof typeof preset.preview)[];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={`Select ${preset.name} theme`}
      className={`relative rounded-lg border-2 p-4 text-left transition-all ${
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-transparent bg-muted/50 hover:bg-muted"
      }`}
    >
      <div className="mb-4 flex overflow-hidden rounded-md border">
        {previewKeys.map((key) => (
          <span
            key={key}
            className="h-7 flex-1"
            style={{ backgroundColor: preset.preview[key] }}
            title={`${preset.name} ${key}`}
            aria-hidden="true"
          />
        ))}
      </div>
      <p className="font-medium">{preset.name}</p>
      <p className="mt-1 text-sm text-muted-foreground">{preset.description}</p>
      {selected && (
        <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-primary" />
      )}
    </button>
  );
}

/**
 * Mirror of the floating Tweaks panel — exposes accent / display font /
 * corner radius / density controls inline in the Appearance settings page.
 * Both surfaces read & write the same `slothing-prefs` localStorage via
 * the shared `EditorialPrefsProvider`.
 */
function EditorialControlsSection() {
  const { prefs, setPref } = useEditorialPrefs();

  return (
    <PageSection
      title="Editorial controls"
      description="Fine-tune accents, display type, corner radius, and density. Mirrors the floating Tweaks panel."
      icon={Palette}
    >
      <div className="space-y-5">
        <ControlGroup label="Accent">
          <div className="flex flex-wrap gap-2">
            {ACCENTS.map((accent) => (
              <button
                key={accent.id}
                type="button"
                aria-label={`Accent ${accent.label}`}
                aria-pressed={prefs.accent === accent.id}
                onClick={() => setPref("accent", accent.id as AccentId)}
                className="h-9 w-9 transition-transform hover:scale-110"
                style={{
                  backgroundColor: accent.color,
                  borderRadius: "var(--r-pill)",
                  border:
                    prefs.accent === accent.id
                      ? "2px solid var(--ink)"
                      : "1px solid var(--rule)",
                  boxShadow:
                    prefs.accent === accent.id
                      ? "0 0 0 2px var(--paper)"
                      : "none",
                }}
                title={accent.label}
              />
            ))}
          </div>
        </ControlGroup>

        <ControlGroup label="Display font">
          <ChipRow
            value={prefs.display}
            onChange={(value) => setPref("display", value as DisplayFontId)}
            options={DISPLAY_FONTS.map((d) => ({ id: d.id, label: d.label }))}
          />
        </ControlGroup>

        <ControlGroup label="Corners">
          <ChipRow
            value={prefs.radius}
            onChange={(value) => setPref("radius", value as RadiusId)}
            options={RADII.map((r) => ({ id: r.id, label: r.label }))}
          />
        </ControlGroup>

        <ControlGroup label="Density">
          <ChipRow
            value={prefs.density}
            onChange={(value) => setPref("density", value as DensityId)}
            options={DENSITIES.map((d) => ({ id: d.id, label: d.label }))}
          />
        </ControlGroup>
      </div>
    </PageSection>
  );
}

function ControlGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[200px_1fr] sm:gap-4">
      <div
        className="font-mono text-[11px] uppercase"
        style={{
          letterSpacing: "0.14em",
          color: "var(--ink-3)",
        }}
      >
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}

function ChipRow({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={active}
            className={cn("px-3 py-1.5 text-xs font-medium transition-colors")}
            style={{
              backgroundColor: active ? "var(--ink)" : "var(--bg)",
              color: active ? "var(--bg)" : "var(--ink-2)",
              border: active ? "1px solid var(--ink)" : "1px solid var(--rule)",
              borderRadius: "var(--r-pill)",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
