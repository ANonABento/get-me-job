/**
 * Bento layout — successor to the F.1 section-based layout.
 *
 * A `BentoLayout` lets the user compose the review card as a CSS-grid of
 * cells. Each cell holds one or more `ChunkKey`s (so users can group
 * applicants+openings+work-term into a single "Signals" cell, or split
 * them — beauty is different per person). Cells have position + span on
 * the grid, plus an optional editorial label and tone.
 *
 * Mobile uses the same cell catalog but renders single-column in
 * `mobilePriority` order — the user decides which cells show first.
 *
 * Old F.1 LayoutPreference rows migrate at read time via
 * `bentoFromSectionLayout()` — no DB migration needed, the same
 * `layout_json` column accepts either shape.
 */
import { z } from "zod";

import { CHUNK_KEYS, type ChunkKey } from "./layout-chunks";

export const CELL_TONES = ["default", "muted", "accent"] as const;
export type CellTone = (typeof CELL_TONES)[number];

export const BENTO_COLUMN_OPTIONS = [2, 3, 4] as const;
export type BentoColumns = (typeof BENTO_COLUMN_OPTIONS)[number];

/**
 * One cell of the bento grid. Position is grid-relative (`gridCol` /
 * `gridRow` are 1-indexed) and discrete spans keep the editor sane.
 *
 * `chunks` must be 1+ ChunkKeys; the renderer composes them inside the
 * cell. Order within `chunks[]` is the rendering order.
 *
 * `id` is a stable user-facing string (e.g. "identity", "signals"). The
 * builder generates IDs as `cell-${counter}` when creating new cells.
 */
export interface BentoCell {
  id: string;
  chunks: ChunkKey[];
  gridCol: number;
  gridRow: number;
  colSpan: number;
  rowSpan: number;
  label?: string;
  tone?: CellTone;
}

export interface BentoDeviceLayout {
  columns: BentoColumns;
  cells: BentoCell[];
  /**
   * Cell IDs in the order they should appear on the mobile flow. Cells
   * not in this list fall back to declared `cells[]` order. Cells in
   * the list but missing from `cells[]` are ignored.
   */
  mobilePriority: string[];
  /**
   * Chunk keys that the user has parked off the layout — they appear in
   * the builder's "Available chunks" tray, ready to drag back in.
   */
  disabled: ChunkKey[];
}

export interface BentoLayoutPreference {
  desktop: BentoDeviceLayout;
  /**
   * Mobile uses the same cell catalog as desktop (a single bento per
   * card; no separate mobile bento). The mobile flow is determined by
   * `desktop.mobilePriority` + each cell's existence. This sidesteps
   * the "two layouts to maintain" complaint and matches the user's
   * stated preference ("freedom to pick which appear first").
   *
   * Keep the wrapper object so the schema can grow per-device fields
   * later (e.g. mobile-only hidden cells) without breaking older rows.
   */
  mobile: {
    expandedCount: number;
  };
}

const chunkKeySchema = z.enum(CHUNK_KEYS);
const cellToneSchema = z.enum(CELL_TONES);

const bentoCellSchema = z.object({
  id: z.string().min(1).max(80),
  chunks: z.array(chunkKeySchema).min(1),
  gridCol: z.number().int().min(1).max(8),
  gridRow: z.number().int().min(1).max(12),
  colSpan: z.number().int().min(1).max(8),
  rowSpan: z.number().int().min(1).max(6),
  label: z.string().trim().max(40).optional(),
  tone: cellToneSchema.optional(),
});

const bentoDeviceLayoutSchema = z.object({
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]),
  cells: z.array(bentoCellSchema),
  mobilePriority: z.array(z.string().min(1).max(80)),
  disabled: z.array(chunkKeySchema),
});

/**
 * Validates a BentoLayoutPreference. Beyond the shape check:
 *   - Every ChunkKey appears in EXACTLY ONE place across all cells +
 *     `disabled` (each chunk has exactly one home).
 *   - Cell IDs are unique within a device.
 *   - `colSpan` + `gridCol` - 1 doesn't exceed `columns`.
 */
export const bentoLayoutPreferenceSchema = z
  .object({
    desktop: bentoDeviceLayoutSchema,
    mobile: z.object({
      expandedCount: z.number().int().min(0).max(20),
    }),
  })
  .superRefine((value, ctx) => {
    const desktop = value.desktop;
    // Cell IDs unique.
    const seenIds = new Set<string>();
    for (const cell of desktop.cells) {
      if (seenIds.has(cell.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate cell id: ${cell.id}`,
          path: ["desktop", "cells"],
        });
        return;
      }
      seenIds.add(cell.id);
    }
    // Span fits within columns.
    for (const cell of desktop.cells) {
      if (cell.gridCol + cell.colSpan - 1 > desktop.columns) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Cell ${cell.id} extends past column ${desktop.columns}`,
          path: ["desktop", "cells", cell.id],
        });
        return;
      }
    }
    // Chunk-completeness check: every known chunk lives somewhere.
    const seenChunks = new Set<ChunkKey>();
    const dupes: ChunkKey[] = [];
    for (const cell of desktop.cells) {
      for (const chunk of cell.chunks) {
        if (seenChunks.has(chunk)) dupes.push(chunk);
        seenChunks.add(chunk);
      }
    }
    for (const chunk of desktop.disabled) {
      if (seenChunks.has(chunk)) dupes.push(chunk);
      seenChunks.add(chunk);
    }
    if (dupes.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Chunks appear in multiple cells: ${dupes.join(", ")}`,
        path: ["desktop"],
      });
      return;
    }
    for (const chunk of CHUNK_KEYS) {
      if (!seenChunks.has(chunk)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Chunk not placed: ${chunk}`,
          path: ["desktop"],
        });
        return;
      }
    }
  });

export type BentoLayoutPreferenceInput = z.input<
  typeof bentoLayoutPreferenceSchema
>;

/**
 * Type-guard: stored JSON might be either old F.1 shape or new bento.
 * The bento variant always has `desktop.cells` whereas F.1 has
 * `desktop.header`. Cheap discriminator.
 */
export function isBentoLayoutPreference(
  value: unknown,
): value is BentoLayoutPreferenceInput {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (!v.desktop || typeof v.desktop !== "object") return false;
  const desktop = v.desktop as Record<string, unknown>;
  return Array.isArray(desktop.cells);
}
