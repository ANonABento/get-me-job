"use client";

/**
 * `<BentoLayoutBuilder>` — controlled editor for a BentoLayoutPreference.
 *
 * Three panels:
 *   1. Top bar — Desktop/Mobile tab + Columns picker (2/3/4) + Reset.
 *   2. Grid editor — cells laid out on a real Tetris-style grid via
 *      react-grid-layout. Drag a cell to move it; drag its right or
 *      bottom edge to resize; neighbors push out of the way on
 *      collision (vertical compaction). Each cell has a palette icon
 *      popover for tone + an X to remove. P2+P3 of
 *      docs/bento-builder-redesign-spec.md.
 *   3. Trays — "Hidden chunks" tray (chunks in `disabled[]`, drag back
 *      into a cell) and "Mobile priority" tray (drag cells to reorder
 *      the mobile flow).
 *
 * Hybrid drag system:
 *   - react-grid-layout drives cell-level drag + resize + collision.
 *   - @dnd-kit drives chunk-chip drag (chunks moving between cells,
 *     or into the disabled tray). Chunks live INSIDE a RGL cell, so
 *     the RGL drag is scoped to the cell's grip handle via
 *     `draggableHandle` to avoid conflicts.
 *
 * The builder is fully controlled — `value` + `onChange`. The modal
 * wrapper (layout-builder-modal.tsx) owns persistence + debounce.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  GripVertical,
  Palette,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import GridLayout, {
  WidthProvider,
  type Layout as RGLLayout,
} from "react-grid-layout";
// NOTE: RGL ships base positioning CSS at react-grid-layout/css/styles.css
// + react-resizable/css/styles.css. Both are imported from globals.css
// rather than this file so Vitest (jsdom + Vite) doesn't trip on
// resolving the css path through pnpm's nested peers. Color overrides
// for the placeholder + handles live in globals.css under
// .bento-builder-grid so we use editorial tokens, not the library's
// hard-coded reds.

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CELL_TONES,
  type BentoCell,
  type BentoColumns,
  type BentoLayoutPreference,
  type CellTone,
} from "@/lib/opportunities/bento-layout";
import { CHUNK_LABELS, type ChunkKey } from "@/lib/opportunities/layout-chunks";
import { DEFAULT_BENTO_LAYOUT } from "@/lib/opportunities/default-bento";

/**
 * react-grid-layout's WidthProvider wires the container width into the
 * grid so we don't have to compute it. It uses `window` so it only
 * runs client-side; the modal is already a client component.
 */
const ResponsiveGridLayout = WidthProvider(GridLayout);

const ROW_HEIGHT_PX = 80;

const COLUMN_OPTIONS: BentoColumns[] = [2, 3, 4];

const TONE_LABELS: Record<CellTone, string> = {
  default: "Paper",
  muted: "Muted",
  accent: "Accent",
};

/**
 * P2: bento ↔ react-grid-layout adapter. Bento uses 1-indexed
 * gridCol/gridRow; RGL uses 0-indexed x/y. Conversion is straight
 * subtraction, but pinning it in one place keeps the off-by-one
 * confined.
 */
function bentoCellToRGL(cell: BentoCell): RGLLayout {
  return {
    i: cell.id,
    x: cell.gridCol - 1,
    y: cell.gridRow - 1,
    w: cell.colSpan,
    h: cell.rowSpan,
  };
}

function rglLayoutToBentoUpdates(
  layout: readonly RGLLayout[],
): Map<string, Pick<BentoCell, "gridCol" | "gridRow" | "colSpan" | "rowSpan">> {
  const updates = new Map<
    string,
    Pick<BentoCell, "gridCol" | "gridRow" | "colSpan" | "rowSpan">
  >();
  for (const item of layout) {
    updates.set(item.i, {
      gridCol: item.x + 1,
      gridRow: item.y + 1,
      colSpan: item.w,
      rowSpan: item.h,
    });
  }
  return updates;
}

export interface BentoLayoutBuilderProps {
  value: BentoLayoutPreference;
  onChange(next: BentoLayoutPreference): void;
}

/**
 * Drag IDs are namespaced so the single DndContext can route droppables
 * correctly. Cell ID strings stay clean (user-facing). Chunks use
 * `chunk:<key>` and cell targets use `cell:<id>` / `disabled` /
 * `mobile-list`.
 */
const CHUNK_PREFIX = "chunk:";
const CELL_PREFIX = "cell:";
const DISABLED_TARGET = "disabled";

type ActiveTab = "desktop" | "mobile";

export function BentoLayoutBuilder({
  value,
  onChange,
}: BentoLayoutBuilderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  // Split editing into two tabs so the long Mobile-priority panel
  // doesn't push the Desktop grid below the fold. User toggles between
  // them via the tab strip next to the Columns picker.
  const [activeTab, setActiveTab] = useState<ActiveTab>("desktop");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const desktop = value.desktop;
  const setDesktop = (next: typeof value.desktop) => {
    onChange({ ...value, desktop: next });
  };

  const handleColumnsChange = (cols: BentoColumns) => {
    const clamped: BentoCell[] = desktop.cells.map((cell) => {
      const colSpan = Math.min(cell.colSpan, cols);
      const maxCol = cols - colSpan + 1;
      return {
        ...cell,
        colSpan,
        gridCol: Math.min(Math.max(1, cell.gridCol), maxCol),
      };
    });
    setDesktop({ ...desktop, columns: cols, cells: clamped });
  };

  // Per §6 of opportunity-card-bento-spec.md: Reset is scoped to the
  // active tab. Desktop reset restores cells / columns / disabled but
  // leaves mobilePriority + expandedCount alone; Mobile reset restores
  // mobilePriority (filtered against current cells) + expandedCount
  // without touching desktop cells.
  const reset = () => {
    if (activeTab === "desktop") {
      onChange({
        ...value,
        desktop: {
          ...DEFAULT_BENTO_LAYOUT.desktop,
          // Preserve mobile order — the user's mobile work shouldn't
          // disappear when they reset desktop. Filter against the
          // freshly-restored cells so stale IDs don't leak through.
          mobilePriority: value.desktop.mobilePriority.filter((id) =>
            DEFAULT_BENTO_LAYOUT.desktop.cells.some((c) => c.id === id),
          ),
        },
      });
      return;
    }
    // Mobile tab: restore the default mobile flow + expandedCount,
    // filtered against whatever cells the user currently has on
    // desktop.
    const cellIdsNow = new Set(value.desktop.cells.map((c) => c.id));
    onChange({
      ...value,
      desktop: {
        ...value.desktop,
        mobilePriority: DEFAULT_BENTO_LAYOUT.desktop.mobilePriority.filter(
          (id) => cellIdsNow.has(id),
        ),
      },
      mobile: DEFAULT_BENTO_LAYOUT.mobile,
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const activeStr = String(active.id);
    const overStr = String(over.id);

    // P3: cell-level drag is now owned by react-grid-layout via
    // onCellLayoutChange below. dnd-kit no longer touches cell IDs.

    // Mobile-priority reorder.
    if (activeStr.startsWith("mp:") && overStr.startsWith("mp:")) {
      const ids = desktop.mobilePriority;
      const oldIdx = ids.indexOf(activeStr.slice(3));
      const newIdx = ids.indexOf(overStr.slice(3));
      if (oldIdx < 0 || newIdx < 0) return;
      setDesktop({
        ...desktop,
        mobilePriority: arrayMove(ids, oldIdx, newIdx),
      });
      return;
    }

    // Chunk drag — move a chunk into a cell, or into the disabled tray.
    if (activeStr.startsWith(CHUNK_PREFIX)) {
      const chunk = activeStr.slice(CHUNK_PREFIX.length) as ChunkKey;
      moveChunk(chunk, overStr);
      return;
    }
  };

  const moveChunk = (chunk: ChunkKey, target: string) => {
    // Strip chunk from wherever it currently lives.
    const cellsStripped = desktop.cells.map((cell) => ({
      ...cell,
      chunks: cell.chunks.filter((c) => c !== chunk),
    }));
    const disabledStripped = desktop.disabled.filter((c) => c !== chunk);

    if (target === DISABLED_TARGET) {
      // Drop empty cells to keep the grid clean.
      const remainingCells = cellsStripped.filter((c) => c.chunks.length > 0);
      setDesktop({
        ...desktop,
        cells: remainingCells,
        disabled: [...disabledStripped, chunk],
        mobilePriority: desktop.mobilePriority.filter((id) =>
          remainingCells.some((c) => c.id === id),
        ),
      });
      return;
    }

    if (target.startsWith(CELL_PREFIX)) {
      const cellId = target.slice(CELL_PREFIX.length);
      const updated = cellsStripped.map((cell) =>
        cell.id === cellId
          ? { ...cell, chunks: [...cell.chunks, chunk] }
          : cell,
      );
      const cleaned = updated.filter((c) => c.chunks.length > 0);
      setDesktop({
        ...desktop,
        cells: cleaned,
        disabled: disabledStripped,
        mobilePriority: desktop.mobilePriority.filter((id) =>
          cleaned.some((c) => c.id === id),
        ),
      });
    }
  };

  const updateCell = (id: string, updates: Partial<BentoCell>) => {
    setDesktop({
      ...desktop,
      cells: desktop.cells.map((cell) =>
        cell.id === id ? { ...cell, ...updates } : cell,
      ),
    });
  };

  /**
   * P4 keyboard a11y: arrow keys on a focused cell-drag handle nudge
   * the cell by 1 grid unit; Shift+arrow resizes by 1 unit instead.
   * Bounds are clamped against the current column count + a sane
   * minimum of 1x1.
   */
  const nudgeCell = (
    id: string,
    direction: "left" | "right" | "up" | "down",
    mode: "move" | "resize",
  ) => {
    const cell = desktop.cells.find((c) => c.id === id);
    if (!cell) return;
    if (mode === "move") {
      const dx = direction === "left" ? -1 : direction === "right" ? 1 : 0;
      const dy = direction === "up" ? -1 : direction === "down" ? 1 : 0;
      const nextCol = Math.max(
        1,
        Math.min(desktop.columns - cell.colSpan + 1, cell.gridCol + dx),
      );
      const nextRow = Math.max(1, cell.gridRow + dy);
      if (nextCol === cell.gridCol && nextRow === cell.gridRow) return;
      updateCell(id, { gridCol: nextCol, gridRow: nextRow });
      return;
    }
    // Resize mode — left/up shrinks, right/down grows. Width clamps to
    // [1, columns-(gridCol-1)] so the cell stays inside the grid;
    // height clamps to [1, 8] which matches the schema's maxH.
    const dw = direction === "left" ? -1 : direction === "right" ? 1 : 0;
    const dh = direction === "up" ? -1 : direction === "down" ? 1 : 0;
    const maxW = desktop.columns - cell.gridCol + 1;
    const nextW = Math.max(1, Math.min(maxW, cell.colSpan + dw));
    const nextH = Math.max(1, Math.min(8, cell.rowSpan + dh));
    if (nextW === cell.colSpan && nextH === cell.rowSpan) return;
    updateCell(id, { colSpan: nextW, rowSpan: nextH });
  };

  const removeCell = (id: string) => {
    const cell = desktop.cells.find((c) => c.id === id);
    if (!cell) return;
    // Disabling a cell parks its chunks in the disabled tray so they
    // aren't lost; the user can re-place them later.
    const remainingCells = desktop.cells.filter((c) => c.id !== id);
    setDesktop({
      ...desktop,
      cells: remainingCells,
      disabled: [...desktop.disabled, ...cell.chunks],
      mobilePriority: desktop.mobilePriority.filter((p) => p !== id),
    });
  };

  const addCell = () => {
    const newId = `cell-${nextCellSuffix(desktop.cells)}`;
    // Drop into the next free row, full-width.
    const nextRow =
      desktop.cells.reduce(
        (max, c) => Math.max(max, c.gridRow + c.rowSpan - 1),
        0,
      ) + 1;
    setDesktop({
      ...desktop,
      cells: [
        ...desktop.cells,
        {
          id: newId,
          chunks: [],
          gridCol: 1,
          gridRow: nextRow,
          colSpan: desktop.columns,
          rowSpan: 1,
          label: "New cell",
        },
      ],
      mobilePriority: [...desktop.mobilePriority, newId],
    });
  };

  const mobilePriorityIds = useMemo(
    () => desktop.mobilePriority.map((id) => `mp:${id}`),
    [desktop.mobilePriority],
  );

  /**
   * P3: react-grid-layout `layout` array, derived from the current
   * cells on every render. We pass this to <ResponsiveGridLayout> as
   * a controlled prop so the live preview moves with the grid editor.
   */
  const rglLayout = useMemo<RGLLayout[]>(
    () => desktop.cells.map(bentoCellToRGL),
    [desktop.cells],
  );

  /**
   * RGL fires `onLayoutChange` on mount with whatever layout the
   * vertical compactor produces — that's not user intent, so we
   * suppress it. After mount, every fire is genuine drag/resize and
   * we diff against the current cells to avoid no-op onChange (which
   * would otherwise debounce-PATCH on every mount).
   */
  const rglMountedRef = useRef(false);
  const handleRGLLayoutChange = (next: readonly RGLLayout[]) => {
    if (!rglMountedRef.current) {
      rglMountedRef.current = true;
      return;
    }
    const updates = rglLayoutToBentoUpdates(next);
    let changed = false;
    const nextCells = desktop.cells.map((cell) => {
      const update = updates.get(cell.id);
      if (!update) return cell;
      if (
        update.gridCol === cell.gridCol &&
        update.gridRow === cell.gridRow &&
        update.colSpan === cell.colSpan &&
        update.rowSpan === cell.rowSpan
      ) {
        return cell;
      }
      changed = true;
      return { ...cell, ...update };
    });
    if (!changed) return;
    setDesktop({ ...desktop, cells: nextCells });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Tab toggle — Desktop vs Mobile editing modes. */}
            <div className="inline-flex rounded-md border bg-card p-0.5">
              {(["desktop", "mobile"] as ActiveTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "rounded px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                    activeTab === tab
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                  aria-pressed={activeTab === tab}
                >
                  {tab}
                </button>
              ))}
            </div>
            {/* Columns picker — only meaningful for the desktop grid. */}
            {activeTab === "desktop" && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Columns
                </span>
                <div className="inline-flex rounded-md border bg-card p-0.5">
                  {COLUMN_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleColumnsChange(option)}
                      className={cn(
                        "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                        desktop.columns === option
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted",
                      )}
                      aria-pressed={desktop.columns === option}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "desktop" && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={addCell}
                className="gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Add cell
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={reset}
              className="gap-1.5 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        </div>

        {activeTab === "desktop" ? (
          <>
            {/* Grid editor — react-grid-layout owns the cell drag +
                resize + push-neighbors collision. Wrapping div carries
                the bento-builder-grid class for scoped CSS overrides
                of RGL's default styles. */}
            <div className="bento-builder-grid rounded-md border bg-bg-2/40 p-3">
              <ResponsiveGridLayout
                className="layout"
                layout={rglLayout}
                cols={desktop.columns}
                rowHeight={ROW_HEIGHT_PX}
                margin={[12, 12]}
                containerPadding={[0, 0]}
                draggableHandle=".bento-cell-drag-handle"
                resizeHandles={["se", "e", "s"]}
                compactType="vertical"
                preventCollision={false}
                isBounded={true}
                onLayoutChange={handleRGLLayoutChange}
              >
                {desktop.cells.map((cell) => (
                  <div key={cell.id} data-cell-id={cell.id}>
                    <CellEditor
                      cell={cell}
                      onUpdate={(updates) => updateCell(cell.id, updates)}
                      onRemove={() => removeCell(cell.id)}
                      onNudge={(direction, mode) =>
                        nudgeCell(cell.id, direction, mode)
                      }
                    />
                  </div>
                ))}
              </ResponsiveGridLayout>
            </div>

            {/* Disabled tray */}
            <DisabledTray chunks={desktop.disabled} />
          </>
        ) : (
          /* Mobile priority */
          <div className="rounded-md border bg-card p-3">
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Mobile priority
              </p>
              <p className="text-xs text-muted-foreground">
                First {value.mobile.expandedCount} cells expand on phones; rest
                collapse.
              </p>
            </div>
            <SortableContext
              items={mobilePriorityIds}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-1">
                {desktop.mobilePriority.map((cellId, idx) => {
                  const cell = desktop.cells.find((c) => c.id === cellId);
                  if (!cell) return null;
                  return (
                    <MobilePriorityRow
                      key={cellId}
                      cellId={cellId}
                      label={cell.label || cell.id}
                      index={idx}
                      expanded={idx < value.mobile.expandedCount}
                    />
                  );
                })}
              </ul>
            </SortableContext>
          </div>
        )}
      </div>
      {/* Note about active drag: dnd-kit handles the visual via its
          sortable transform; we don't need a DragOverlay for this UX. */}
      <span className="sr-only" aria-live="polite">
        {activeId ? `Dragging ${activeId}` : ""}
      </span>
    </DndContext>
  );
}

/**
 * One editable cell. P3 simplification:
 * - Cell positioning + sizing is owned by react-grid-layout in the
 *   parent. CellEditor no longer carries any drag handles for itself;
 *   the `.bento-cell-drag-handle` grip below is what RGL latches onto
 *   for drag-to-move (resize is on the cell edges, drawn by RGL).
 * - SpanPickers (Cols/Rows numeric dropdowns) are gone. Sizing is
 *   direct manipulation now.
 * - Tone Select dropdown is replaced by a palette icon + popover (P2).
 *
 * The cell still acts as a dnd-kit droppable target so chunk chips
 * dragged from another cell or from the Hidden tray land here. Chunks
 * inside the cell remain sortable via @dnd-kit.
 */
function CellEditor({
  cell,
  onUpdate,
  onRemove,
  onNudge,
}: {
  cell: BentoCell;
  onUpdate(updates: Partial<BentoCell>): void;
  onRemove(): void;
  onNudge(
    direction: "left" | "right" | "up" | "down",
    mode: "move" | "resize",
  ): void;
}) {
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `${CELL_PREFIX}${cell.id}`,
  });

  const tone = cell.tone ?? "default";

  /**
   * P4 keyboard a11y: arrow keys nudge cell position; Shift+arrow
   * resizes. The handler lives on the grip button so users tab to a
   * cell's drag handle, then use the keyboard like they would the
   * mouse. RGL v1.5 doesn't ship arrow-key support natively, so we
   * provide it here.
   */
  const handleGripKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const direction = (
      {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
      } as const
    )[event.key];
    if (!direction) return;
    event.preventDefault();
    onNudge(direction, event.shiftKey ? "resize" : "move");
  };

  return (
    <div
      ref={setDropRef}
      className={cn(
        "flex h-full flex-col gap-2 rounded-md border bg-paper p-3",
        tone === "muted" && "bg-rule-strong-bg",
        tone === "accent" && "border-brand bg-brand-soft/40",
        isOver && "ring-2 ring-primary ring-offset-1",
      )}
    >
      <div className="flex items-center gap-2">
        {/* The .bento-cell-drag-handle class is RGL's draggableHandle
            target — only mousedowns on this element start a cell-level
            drag. Chunks inside the dropzone use data-rgl-cancel-drag
            via the parent's draggableCancel to keep RGL out of their
            way. */}
        <button
          type="button"
          onKeyDown={handleGripKeyDown}
          className="bento-cell-drag-handle cursor-grab rounded p-0.5 text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:cursor-grabbing"
          aria-label={`Drag cell ${cell.label || cell.id}. Arrow keys move, shift+arrow resizes.`}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <input
          type="text"
          value={cell.label ?? ""}
          placeholder="Cell label (optional)"
          onChange={(event) =>
            onUpdate({ label: event.target.value || undefined })
          }
          className="min-w-0 flex-1 bg-transparent text-xs font-mono uppercase tracking-[0.16em] text-muted-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />
        <TonePalette
          value={tone}
          onChange={(next) =>
            onUpdate({ tone: next === "default" ? undefined : next })
          }
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove cell (chunks return to Hidden)"
          className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {/* Chunks */}
      <SortableContext
        items={cell.chunks.map((c) => `${CHUNK_PREFIX}${c}`)}
        strategy={rectSortingStrategy}
      >
        <div className="flex min-h-[40px] flex-1 flex-wrap items-start gap-1 rounded border border-dashed border-rule p-2">
          {cell.chunks.length === 0 && (
            <span className="text-[11px] text-muted-foreground">
              Drag chunks here
            </span>
          )}
          {cell.chunks.map((chunk) => (
            <ChunkChip key={chunk} chunk={chunk} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

/**
 * P2: palette icon + 3-swatch popover. Replaces the Paper/Muted/Accent
 * dropdown that was taking the same space as the drag handle. Lives
 * inline because we don't have a shared Popover primitive yet — the
 * outside-click effect closes the menu when the user clicks elsewhere.
 */
function TonePalette({
  value,
  onChange,
}: {
  value: CellTone;
  onChange(next: CellTone): void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Cell tone (${TONE_LABELS[value]}) — click to change`}
        aria-haspopup="menu"
        aria-expanded={open}
        title={`Tone: ${TONE_LABELS[value]}`}
        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Palette className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 flex gap-1 rounded-md border bg-card p-1 shadow-sm"
        >
          {CELL_TONES.map((tone) => (
            <button
              key={tone}
              type="button"
              role="menuitemradio"
              aria-checked={value === tone}
              onClick={() => {
                onChange(tone);
                setOpen(false);
              }}
              className={cn(
                "h-6 w-6 rounded border transition-all",
                tone === "default" && "bg-paper",
                tone === "muted" && "bg-rule-strong-bg",
                tone === "accent" && "border-brand bg-brand-soft",
                value === tone && "ring-2 ring-primary ring-offset-1",
              )}
              title={TONE_LABELS[tone]}
            >
              <span className="sr-only">{TONE_LABELS[tone]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChunkChip({ chunk }: { chunk: ChunkKey }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${CHUNK_PREFIX}${chunk}` });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      className={cn(
        "inline-flex cursor-grab items-center gap-1 rounded-full border bg-card px-2 py-0.5 text-[11px] font-medium text-foreground transition-colors hover:bg-muted active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
      aria-label={`Drag ${CHUNK_LABELS[chunk]}`}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-3 w-3 text-muted-foreground" />
      {CHUNK_LABELS[chunk]}
    </button>
  );
}

function DisabledTray({ chunks }: { chunks: ChunkKey[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: DISABLED_TARGET });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-md border bg-card p-3",
        isOver && "ring-2 ring-destructive ring-offset-1",
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Hidden chunks
        </p>
        <p className="text-xs text-muted-foreground">
          Drag back into a cell to re-enable.
        </p>
      </div>
      {chunks.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Everything is on the card.
        </p>
      ) : (
        <SortableContext
          items={chunks.map((c) => `${CHUNK_PREFIX}${c}`)}
          strategy={rectSortingStrategy}
        >
          <div className="flex flex-wrap gap-1">
            {chunks.map((chunk) => (
              <HiddenChunkChip key={chunk} chunk={chunk} />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  );
}

function HiddenChunkChip({ chunk }: { chunk: ChunkKey }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${CHUNK_PREFIX}${chunk}` });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      className={cn(
        "inline-flex cursor-grab items-center gap-1 rounded-full border bg-bg-2 px-2 py-0.5 text-[11px] text-muted-foreground line-through transition-colors hover:bg-card active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
      aria-label={`Drag ${CHUNK_LABELS[chunk]} into a cell`}
      {...attributes}
      {...listeners}
    >
      <EyeOff className="h-3 w-3" />
      {CHUNK_LABELS[chunk]}
    </button>
  );
}

function MobilePriorityRow({
  cellId,
  label,
  index,
  expanded,
}: {
  cellId: string;
  label: string;
  index: number;
  expanded: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `mp:${cellId}` });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded border bg-card px-2 py-1.5",
        isDragging && "opacity-40",
      )}
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label={`Drag ${label}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="flex-1 truncate text-sm">{label}</span>
      {expanded ? (
        <span className="inline-flex items-center gap-1 text-[10px] text-primary">
          <Eye className="h-3 w-3" />
          Above fold
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
          <EyeOff className="h-3 w-3" />
          Collapsed
        </span>
      )}
    </li>
  );
}

function nextCellSuffix(cells: BentoCell[]): number {
  const used = new Set(
    cells
      .map((c) => c.id.match(/^cell-(\d+)$/)?.[1])
      .filter(Boolean)
      .map((s) => Number(s)),
  );
  let i = 1;
  while (used.has(i)) i += 1;
  return i;
}
