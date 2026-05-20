"use client";

/**
 * Pinned filter+sort preset bar that floats above the review queue.
 * Spec: docs/opportunity-customization-spec.md §4 bucket A.
 *
 * Functional MVP for P0:
 *   - Renders pinned presets as chips; clicking one applies its
 *     filters+sort upstream via `onApply`.
 *   - "+" chip opens the save dialog (composed by the parent page so
 *     it can capture the current filter set).
 *   - "Save current" calls back into the parent's save handler.
 *
 * Out of scope for P0 (deferred to a follow-up): per-chip 3-dot menu
 * (rename / edit / unpin / delete) and drag-to-reorder.
 */
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OpportunityPreset } from "@slothing/shared/schemas";

export interface PresetBarProps {
  presets: OpportunityPreset[];
  activePresetId: string | null;
  onApply(preset: OpportunityPreset): void;
  onClear(): void;
  onSaveCurrent(): void;
  onDelete(preset: OpportunityPreset): void;
}

export function PresetBar({
  presets,
  activePresetId,
  onApply,
  onClear,
  onSaveCurrent,
  onDelete,
}: PresetBarProps) {
  const pinned = presets.filter((preset) => preset.pinned);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Presets
      </span>
      {pinned.length === 0 && (
        <span className="text-xs text-muted-foreground">
          No saved presets yet.
        </span>
      )}
      {pinned.map((preset) => {
        const isActive = preset.id === activePresetId;
        return (
          <div
            key={preset.id}
            className={cn(
              "group inline-flex items-center gap-1 rounded-full border pl-3 pr-1 py-1 text-xs transition-colors",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-muted",
            )}
          >
            <button
              type="button"
              className="font-medium"
              onClick={() => onApply(preset)}
              aria-pressed={isActive}
            >
              {preset.name}
            </button>
            <button
              type="button"
              className={cn(
                "rounded-full p-0.5 opacity-0 transition-opacity",
                "group-hover:opacity-100 focus-visible:opacity-100",
                isActive ? "hover:bg-primary-foreground/20" : "hover:bg-muted",
              )}
              aria-label={`Delete ${preset.name}`}
              onClick={(event) => {
                event.stopPropagation();
                onDelete(preset);
              }}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
      <Button
        size="sm"
        variant="ghost"
        className="h-7 gap-1 text-xs"
        onClick={onSaveCurrent}
      >
        <Plus className="h-3.5 w-3.5" />
        Save current
      </Button>
      {activePresetId && (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs text-muted-foreground"
          onClick={onClear}
        >
          Clear
        </Button>
      )}
    </div>
  );
}
