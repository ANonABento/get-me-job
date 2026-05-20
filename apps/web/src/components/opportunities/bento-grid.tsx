"use client";

/**
 * `<BentoGrid>` — renders a BentoLayout as a CSS-grid card. Each cell
 * holds 1+ `ChunkKey`s; the renderer composes them via the existing
 * `<RenderChunk>` so visual semantics (titles look like titles, etc.)
 * stay shared with the layout-builder preview.
 *
 * Two rendering modes:
 *   - Desktop (>= md): CSS grid using the layout's `columns` count
 *   - Mobile (< md): single column flow ordered by `mobilePriority`,
 *     with the first N cells expanded and the rest behind a "Show more"
 *     tap.
 *
 * Cells with `tone: "muted"` get the page-2 surface; `tone: "accent"`
 * gets the brand-soft surface. Default cells use the paper card surface.
 *
 * The grid is "container-driven": rows auto-size to content. `rowSpan`
 * is honored via `gridRow: span N`. This avoids a fixed-height grid
 * which would clip long descriptions; the cost is some visual
 * variation, but most real postings produce balanced cells.
 */
import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  BentoCell,
  BentoDeviceLayout,
} from "@/lib/opportunities/bento-layout";
import { getMobileCellOrder } from "@/lib/opportunities/default-bento";
import { RenderChunk } from "@/lib/opportunities/render-chunk";
import type { RenderChunkContext } from "@/lib/opportunities/render-chunk";
import type { ChunkKey } from "@/lib/opportunities/layout-chunks";

export interface BentoGridProps {
  layout: BentoDeviceLayout;
  /**
   * Mobile-only: how many cells render expanded above the "Show more"
   * fold. The rest collapse to a single line each. Default 4.
   */
  mobileExpandedCount?: number;
  /**
   * Force mobile or desktop rendering. When omitted, uses CSS media-
   * query classes — desktop grid above md, single-column below.
   */
  device?: "desktop" | "mobile";
  /**
   * Live opportunity (or fixture). Passed through to RenderChunk.
   */
  opportunity: Parameters<typeof RenderChunk>[0]["opportunity"];
  /**
   * Chunk callbacks + context. Shared with the layout builder preview
   * so a preview reads identical to the live card.
   */
  context: RenderChunkContext;
}

const TONE_CLASS = {
  default: "bg-paper border-rule",
  muted: "bg-bg-2 border-rule",
  accent: "bg-brand-soft border-brand/30",
} as const;

/**
 * Action-button chunks always render as a flex row across the cell,
 * with each button getting equal width. Other chunks use the
 * cell-stack flow.
 */
const ACTION_CHUNKS = new Set<ChunkKey>([
  "dismiss",
  "apply",
  "save",
  "google-company",
  "open-original",
]);
const PRIMARY_ACTION_CHUNKS = new Set<ChunkKey>(["dismiss", "apply", "save"]);

export function BentoGrid({
  layout,
  mobileExpandedCount = 4,
  device,
  opportunity,
  context,
}: BentoGridProps) {
  // When no device prop is set we render both layouts; CSS media
  // queries hide the wrong one. That sidesteps SSR/hydration mismatches
  // (we can't read window.matchMedia on the server).
  const showDesktop = device !== "mobile";
  const showMobile = device !== "desktop";

  return (
    <>
      {showDesktop && (
        <div
          className={cn(
            "grid auto-rows-min gap-3",
            device === "desktop" ? "" : "hidden md:grid",
          )}
          style={{
            gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`,
          }}
        >
          {layout.cells.map((cell) => (
            <BentoCellRender
              key={cell.id}
              cell={cell}
              opportunity={opportunity}
              context={context}
            />
          ))}
        </div>
      )}
      {showMobile && (
        <MobileFlow
          layout={layout}
          expandedCount={mobileExpandedCount}
          device={device}
          opportunity={opportunity}
          context={context}
        />
      )}
    </>
  );
}

function BentoCellRender({
  cell,
  opportunity,
  context,
}: {
  cell: BentoCell;
  opportunity: BentoGridProps["opportunity"];
  context: RenderChunkContext;
}) {
  const tone = cell.tone ?? "default";
  const style = {
    gridColumn: `${cell.gridCol} / span ${cell.colSpan}`,
    gridRow: `${cell.gridRow} / span ${cell.rowSpan}`,
  };
  const isActionsCell = cell.chunks.every((c) => ACTION_CHUNKS.has(c));

  return (
    <section
      data-cell-id={cell.id}
      style={style}
      className={cn("flex flex-col rounded-md border p-4", TONE_CLASS[tone])}
    >
      {cell.label && (
        <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {cell.label}
        </p>
      )}
      <CellChunks
        cell={cell}
        opportunity={opportunity}
        context={context}
        isActionsCell={isActionsCell}
      />
    </section>
  );
}

/**
 * Renders the chunks INSIDE a cell. Layout depends on chunk types:
 *   - Action cells → flex row, equal column widths
 *   - Chip-only cells (applicants/openings/work-term/level/etc.) →
 *     flex-wrap row of chips
 *   - Mixed cells → vertical stack with chips in their own row
 *
 * The renderer doesn't try to be clever — we just check which chunks
 * are in the cell and pick a layout.
 */
function CellChunks({
  cell,
  opportunity,
  context,
  isActionsCell,
}: {
  cell: BentoCell;
  opportunity: BentoGridProps["opportunity"];
  context: RenderChunkContext;
  isActionsCell: boolean;
}) {
  if (isActionsCell) {
    const primary = cell.chunks.filter((c) => PRIMARY_ACTION_CHUNKS.has(c));
    const secondary = cell.chunks.filter((c) => !PRIMARY_ACTION_CHUNKS.has(c));
    const rows: ReactNode[] = [];
    if (primary.length > 0) {
      rows.push(
        <div
          key="primary"
          className={cn(
            "grid gap-2",
            primary.length === 1 && "grid-cols-1",
            primary.length === 2 && "grid-cols-2",
            primary.length === 3 && "grid-cols-3",
          )}
        >
          {primary.map((chunk) => (
            <RenderChunk
              key={chunk}
              chunk={chunk}
              opportunity={opportunity}
              context={context}
            />
          ))}
        </div>,
      );
    }
    if (secondary.length > 0) {
      rows.push(
        <div
          key="secondary"
          className={cn(
            "grid gap-2",
            primary.length === 0 && "mt-0",
            primary.length > 0 && "mt-2",
            secondary.length === 1 && "grid-cols-1",
            secondary.length === 2 && "grid-cols-2",
          )}
        >
          {secondary.map((chunk) => (
            <RenderChunk
              key={chunk}
              chunk={chunk}
              opportunity={opportunity}
              context={context}
            />
          ))}
        </div>,
      );
    }
    return <>{rows}</>;
  }

  // Detect a chip-only cell (every chunk is a meta chip).
  const isChipCell = cell.chunks.every((c) => isMetaChip(c));
  if (isChipCell) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {cell.chunks.map((chunk) => (
          <RenderChunk
            key={chunk}
            chunk={chunk}
            opportunity={opportunity}
            context={context}
          />
        ))}
      </div>
    );
  }

  // Mixed cell — vertical stack. Chips that show up still flex-wrap
  // inside the surrounding flow because RenderChunk for them returns
  // inline-flex spans.
  return (
    <div className="flex flex-col gap-2">
      {cell.chunks.map((chunk) => (
        <RenderChunk
          key={chunk}
          chunk={chunk}
          opportunity={opportunity}
          context={context}
        />
      ))}
    </div>
  );
}

function isMetaChip(chunk: ChunkKey): boolean {
  return (
    chunk === "applicants" ||
    chunk === "openings" ||
    chunk === "work-term" ||
    chunk === "level" ||
    chunk === "applicant-ratio" ||
    chunk === "remote-badge" ||
    chunk === "source-badge" ||
    chunk === "status-pill"
  );
}

/**
 * Mobile flow: cells render single-column in the user's mobilePriority
 * order. The first N (default 4) render expanded; the rest collapse to
 * a one-line title behind a "Show more" tap.
 */
function MobileFlow({
  layout,
  expandedCount,
  device,
  opportunity,
  context,
}: {
  layout: BentoDeviceLayout;
  expandedCount: number;
  device: "desktop" | "mobile" | undefined;
  opportunity: BentoGridProps["opportunity"];
  context: RenderChunkContext;
}) {
  const ordered = getMobileCellOrder(layout);
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? ordered : ordered.slice(0, expandedCount);
  const hidden = expanded ? [] : ordered.slice(expandedCount);

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        device === "mobile" ? "" : "md:hidden",
      )}
    >
      {visible.map((cell) => (
        <BentoCellRender
          key={cell.id}
          cell={cell}
          opportunity={opportunity}
          context={context}
        />
      ))}
      {hidden.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-1 gap-1.5"
          onClick={() => setExpanded(true)}
        >
          <ChevronDown className="h-4 w-4" />
          Show {hidden.length} more
        </Button>
      )}
      {expanded && ordered.length > expandedCount && (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() => setExpanded(false)}
        >
          <ChevronUp className="h-4 w-4" />
          Collapse
        </Button>
      )}
    </div>
  );
}
