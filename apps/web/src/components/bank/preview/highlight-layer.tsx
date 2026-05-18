"use client";

import type { BankCategory } from "@/types";
import { cn } from "@/lib/utils";

export interface HighlightInput {
  entryId: string;
  category: BankCategory;
  bboxes: [number, number, number, number, number][];
}

interface HighlightLayerProps {
  highlights: Array<{
    entryId: string;
    category: BankCategory;
    bboxes: [number, number, number, number, number][];
  }>;
  selectedEntryId: string | null;
  onSelectEntry: (entryId: string) => void;
  pageWidth: number;
  pageHeight: number;
  renderScale: number;
}

/**
 * Highlight colors are inline-styled (not Tailwind classes) for two reasons:
 *
 * 1. The PDF canvas renders pages on a white background. Theme-tinted
 *    tokens (cream-on-white in the Slothing palette) end up invisible.
 *    These colors are chosen for contrast against white, regardless of
 *    the user's app theme.
 * 2. Tailwind's `bg-brand/25` opacity modifier doesn't work on hex CSS
 *    vars — the editorial brand tokens use raw hex, so the modifier
 *    silently produced `transparent` (the original bug).
 *
 * Picked from a "highlighter pen" palette — saturated, semi-transparent,
 * readable on top of black text.
 */
const CATEGORY_PALETTE: Record<
  BankCategory,
  { fill: string; outline: string }
> = {
  experience: {
    fill: "rgba(99, 102, 241, 0.32)",
    outline: "rgb(99, 102, 241)",
  },
  project: { fill: "rgba(168, 85, 247, 0.32)", outline: "rgb(168, 85, 247)" },
  education: { fill: "rgba(20, 184, 166, 0.32)", outline: "rgb(20, 184, 166)" },
  skill: { fill: "rgba(14, 165, 233, 0.32)", outline: "rgb(14, 165, 233)" },
  bullet: { fill: "rgba(99, 102, 241, 0.24)", outline: "rgb(99, 102, 241)" },
  achievement: {
    fill: "rgba(245, 158, 11, 0.34)",
    outline: "rgb(245, 158, 11)",
  },
  certification: {
    fill: "rgba(168, 85, 247, 0.28)",
    outline: "rgb(168, 85, 247)",
  },
  hackathon: { fill: "rgba(244, 63, 94, 0.32)", outline: "rgb(244, 63, 94)" },
};

export function HighlightLayer({
  highlights,
  selectedEntryId,
  onSelectEntry,
  renderScale,
}: HighlightLayerProps) {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="false">
      {highlights.flatMap((highlight) =>
        highlight.bboxes.map((bbox, index) => {
          const [, x0, y0, x1, y1] = bbox;
          const left = x0 * renderScale;
          const top = y0 * renderScale;
          const width = Math.max(1, (x1 - x0) * renderScale);
          const height = Math.max(1, (y1 - y0) * renderScale);
          const selected = selectedEntryId === highlight.entryId;
          const palette =
            CATEGORY_PALETTE[highlight.category] ?? CATEGORY_PALETTE.bullet;
          return (
            <button
              key={`${highlight.entryId}-${index}`}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onSelectEntry(highlight.entryId);
              }}
              style={{
                left,
                top,
                width,
                height,
                backgroundColor: palette.fill,
                outlineColor: selected ? palette.outline : "transparent",
                outlineStyle: "solid",
                outlineWidth: selected ? 2 : 1,
              }}
              className={cn(
                "absolute pointer-events-auto rounded-sm transition-[outline-color,outline-width] duration-150",
                "focus-visible:outline-2 focus-visible:outline-ring",
              )}
              aria-label={`Select component highlighted at ${Math.round(left)}, ${Math.round(top)}`}
              aria-current={selected ? "true" : undefined}
            />
          );
        }),
      )}
    </div>
  );
}
