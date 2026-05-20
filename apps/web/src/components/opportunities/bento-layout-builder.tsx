"use client";

/**
 * `<BentoLayoutBuilder>` — controlled editor for a BentoLayoutPreference.
 * Replaces the F.1 section-based reorderer.
 *
 * Three panels:
 *   1. Top bar — Desktop/Mobile tab + Columns picker (2/3/4) + Reset.
 *   2. Grid editor — visible bento cells with drag handles + chunk
 *      chip-clusters inside each cell. Drag a cell to reorder; drag a
 *      chunk chip to a different cell to regroup. Each cell has a kebab
 *      menu for: rename / set tone / change span / split-out / delete.
 *   3. Trays — "Hidden chunks" tray (chunks in `disabled[]`, drag back
 *      into a cell) and "Mobile priority" tray (drag cells to reorder
 *      the mobile flow).
 *
 * Drag is dnd-kit-based. We use a single DndContext at the root so
 * chunks can move between cells and into/out of the disabled tray.
 * Cells reorder via a separate sortable wrapper using cell IDs.
 *
 * The builder is fully controlled — `value` + `onChange`. The modal
 * wrapper (layout-builder-modal.tsx) owns persistence + debounce.
 */
import { useMemo, useState } from "react";
import { Eye, EyeOff, GripVertical, Plus, RotateCcw, X } from "lucide-react";
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

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const COLUMN_OPTIONS: BentoColumns[] = [2, 3, 4];

const TONE_LABELS: Record<CellTone, string> = {
  default: "Paper",
  muted: "Muted",
  accent: "Accent",
};

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

    // Cell reorder (drag a cell sortable handle onto another cell).
    if (
      activeStr.startsWith(CELL_PREFIX) &&
      overStr.startsWith(CELL_PREFIX) &&
      activeStr !== overStr
    ) {
      const ids = desktop.cells.map((c) => c.id);
      const oldIdx = ids.indexOf(activeStr.slice(CELL_PREFIX.length));
      const newIdx = ids.indexOf(overStr.slice(CELL_PREFIX.length));
      if (oldIdx < 0 || newIdx < 0) return;
      const nextCells = arrayMove(desktop.cells, oldIdx, newIdx);
      // Reassign gridRow in declaration order so the grid stays sane
      // (the user can refine row/col placement later via the cell
      // inspector, but reorder should produce a predictable result).
      const renumbered = renumberRows(nextCells, desktop.columns);
      setDesktop({ ...desktop, cells: renumbered });
      return;
    }

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

  const cellIds = useMemo(
    () => desktop.cells.map((c) => `${CELL_PREFIX}${c.id}`),
    [desktop.cells],
  );
  const mobilePriorityIds = useMemo(
    () => desktop.mobilePriority.map((id) => `mp:${id}`),
    [desktop.mobilePriority],
  );

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
            {/* Grid editor */}
            <div
              className="grid auto-rows-min gap-3 rounded-md border bg-bg-2/40 p-3"
              style={{
                gridTemplateColumns: `repeat(${desktop.columns}, minmax(0, 1fr))`,
              }}
            >
              <SortableContext items={cellIds} strategy={rectSortingStrategy}>
                {desktop.cells.map((cell) => (
                  <CellEditor
                    key={cell.id}
                    cell={cell}
                    columns={desktop.columns}
                    onUpdate={(updates) => updateCell(cell.id, updates)}
                    onRemove={() => removeCell(cell.id)}
                  />
                ))}
              </SortableContext>
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
 * One editable cell. Drop zone for chunks (drag a chunk chip into the
 * cell to add it). Inline header with drag handle + label edit +
 * tone/span/remove controls. Body shows the cell's chunks as
 * sortable chips so the user can drag them between cells.
 */
function CellEditor({
  cell,
  columns,
  onUpdate,
  onRemove,
}: {
  cell: BentoCell;
  columns: BentoColumns;
  onUpdate(updates: Partial<BentoCell>): void;
  onRemove(): void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${CELL_PREFIX}${cell.id}` });
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `${CELL_PREFIX}${cell.id}`,
  });

  // Both sortable + droppable refs need to attach to the cell.
  const setRef = (node: HTMLElement | null) => {
    setSortableRef(node);
    setDropRef(node);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${cell.colSpan}`,
    gridRow: `span ${cell.rowSpan}`,
  };

  return (
    <div
      ref={setRef}
      style={style}
      className={cn(
        "flex flex-col gap-2 rounded-md border bg-paper p-3",
        isDragging && "opacity-40",
        isOver && "ring-2 ring-primary ring-offset-1",
      )}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="cursor-grab rounded p-0.5 text-muted-foreground hover:bg-muted active:cursor-grabbing"
          aria-label={`Drag cell ${cell.label || cell.id}`}
          {...attributes}
          {...listeners}
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
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove cell (chunks return to Hidden)"
          className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <SpanPicker
          label="Cols"
          value={cell.colSpan}
          max={columns}
          onChange={(value) => onUpdate({ colSpan: value })}
        />
        <SpanPicker
          label="Rows"
          value={cell.rowSpan}
          max={3}
          onChange={(value) => onUpdate({ rowSpan: value })}
        />
      </div>
      <Select
        value={cell.tone ?? "default"}
        onValueChange={(value) =>
          onUpdate({
            tone: value === "default" ? undefined : (value as CellTone),
          })
        }
      >
        <SelectTrigger className="h-7 text-[11px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CELL_TONES.map((tone) => (
            <SelectItem key={tone} value={tone} className="text-xs">
              {TONE_LABELS[tone]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Chunks */}
      <SortableContext
        items={cell.chunks.map((c) => `${CHUNK_PREFIX}${c}`)}
        strategy={rectSortingStrategy}
      >
        <div className="flex min-h-[40px] flex-wrap items-start gap-1 rounded border border-dashed border-rule p-2">
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

function SpanPicker({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange(next: number): void;
}) {
  const options = Array.from({ length: max }, (_, i) => i + 1);
  return (
    <label className="flex items-center justify-between gap-2 rounded border bg-card px-2 py-1 text-[11px]">
      <span className="font-mono uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="bg-transparent text-foreground focus:outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
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

/**
 * After a cell reorder, renumber gridRow values so the cells stack in
 * declaration order. Preserves colSpan/rowSpan; gridCol resets to 1 so
 * the user gets a clean vertical stack they can refine.
 */
function renumberRows(cells: BentoCell[], _columns: number): BentoCell[] {
  return cells.map((cell, i) => ({
    ...cell,
    gridRow: i + 1,
    gridCol: 1,
  }));
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
