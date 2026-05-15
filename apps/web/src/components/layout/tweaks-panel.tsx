"use client";

import { useEffect, useRef, useState } from "react";
import { Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ACCENTS,
  DENSITIES,
  DISPLAY_FONTS,
  INKS,
  RADII,
  useEditorialPrefs,
  type AccentId,
  type DensityId,
  type DisplayFontId,
  type InkId,
  type RadiusId,
} from "@/lib/editorial-prefs";
import { useTheme } from "@/components/theme-provider";

export function TweaksPanel() {
  const { prefs, setPref } = useEditorialPrefs();
  const { isDark, setIsDark } = useTheme();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const fabRef = useRef<HTMLButtonElement | null>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        panelRef.current?.contains(target) ||
        fabRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on escape
  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <>
      {!open && (
        <button
          ref={fabRef}
          type="button"
          aria-label="Open editorial tweaks"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-[89] grid h-11 w-11 place-items-center shadow-lg transition-transform hover:scale-105"
          style={{
            backgroundColor: "var(--ink)",
            color: "var(--bg)",
            borderRadius: "var(--r-pill)",
            boxShadow: "0 10px 30px var(--paper-shadow-strong)",
          }}
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Editorial tweaks"
          className="fixed bottom-5 right-5 z-[90] flex w-[300px] flex-col"
          style={{
            backgroundColor: "var(--paper)",
            border: "1px solid var(--rule)",
            borderRadius: "var(--r-lg)",
            boxShadow: "0 24px 60px var(--paper-shadow-strong)",
            color: "var(--ink)",
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid var(--rule)" }}
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: "var(--brand)" }}
                aria-hidden="true"
              />
              <span
                className="font-mono text-[10px] uppercase"
                style={{
                  letterSpacing: "0.16em",
                  color: "var(--ink-2)",
                }}
              >
                Tweaks
              </span>
            </div>
            <button
              type="button"
              aria-label="Close tweaks"
              onClick={() => setOpen(false)}
              className="grid h-7 w-7 place-items-center transition-colors"
              style={{ color: "var(--ink-3)" }}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-col gap-4 px-4 py-4">
            <Section label="Theme">
              <ChipRow
                value={isDark ? "dark" : "light"}
                onChange={(value) => setIsDark(value === "dark")}
                options={[
                  { id: "light", label: "Light" },
                  { id: "dark", label: "Dark" },
                ]}
              />
            </Section>

            <Section label="Accent">
              <div className="flex flex-wrap gap-2">
                {ACCENTS.map((accent) => (
                  <button
                    key={accent.id}
                    type="button"
                    title={accent.label}
                    aria-label={`Accent: ${accent.label}`}
                    onClick={() => setPref("accent", accent.id as AccentId)}
                    className="h-7 w-7 transition-transform hover:scale-110"
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
                  />
                ))}
              </div>
            </Section>

            <Section label="Ink">
              <ChipRow
                value={prefs.ink}
                onChange={(value) => setPref("ink", value as InkId)}
                options={INKS.map((ink) => ({
                  id: ink.id,
                  label: ink.label,
                }))}
              />
            </Section>

            <Section label="Display font">
              <ChipRow
                value={prefs.display}
                onChange={(value) => setPref("display", value as DisplayFontId)}
                options={DISPLAY_FONTS.map((font) => ({
                  id: font.id,
                  label: font.label,
                }))}
              />
            </Section>

            <Section label="Corners">
              <ChipRow
                value={prefs.radius}
                onChange={(value) => setPref("radius", value as RadiusId)}
                options={RADII.map((radius) => ({
                  id: radius.id,
                  label: radius.label,
                }))}
              />
            </Section>

            <Section label="Density">
              <ChipRow
                value={prefs.density}
                onChange={(value) => setPref("density", value as DensityId)}
                options={DENSITIES.map((density) => ({
                  id: density.id,
                  label: density.label,
                }))}
              />
            </Section>
          </div>
        </div>
      )}
    </>
  );
}

interface SectionProps {
  label: string;
  children: React.ReactNode;
}

function Section({ label, children }: SectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="font-mono text-[10px] uppercase"
        style={{
          letterSpacing: "0.14em",
          color: "var(--ink-3)",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

interface ChipRowProps {
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string }[];
}

function ChipRow({ value, onChange, options }: ChipRowProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "px-2.5 py-1 text-[11.5px] font-medium transition-colors",
            )}
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
