"use client";

/**
 * Drag-and-drop card layout builder. Spec:
 * docs/opportunity-card-layout-builder-spec.md.
 *
 * Layout model:
 *   - Two device tabs (desktop / mobile), independent specs
 *   - Four sections per device (header / meta / body / actions)
 *   - Drag is section-scoped (you can't move a body chunk into actions)
 *   - Eye toggle hides a chunk in-place; toggle on restores its position
 *   - Reset button restores the default for the active device tab
 *
 * Persistence is the caller's job — this component is controlled
 * (`value` / `onChange`). The page wraps it with optimistic-save
 * debouncing (LayoutBuilderSheet / settings embed).
 */
import { useState } from "react";
import { Eye, EyeOff, GripVertical, RotateCcw } from "lucide-react";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CHUNK_LABELS,
  CHUNK_SECTIONS,
  SECTIONS,
  type ChunkKey,
  type DeviceLayout,
  type LayoutPreference,
  type Section,
} from "@/lib/opportunities/layout-chunks";
import {
  DEFAULT_DESKTOP_LAYOUT,
  DEFAULT_MOBILE_LAYOUT,
} from "@/lib/opportunities/default-layout";
import { LAYOUT_PREVIEW_OPPORTUNITY } from "@/lib/opportunities/layout-preview-fixture";
import { RenderChunk } from "@/lib/opportunities/render-chunk";

const SECTION_LABELS: Record<Section, string> = {
  header: "Header",
  meta: "Meta row",
  body: "Body",
  actions: "Actions",
};

const SECTION_HINTS: Record<Section, string> = {
  header: "Top of the card — company, title, primary badges.",
  meta: "Small chip strip — competitiveness signals.",
  body: "Main reading flow — location, salary, deadline, tags, summary.",
  actions: "Footer buttons + secondary quick-link row.",
};

const PRIMARY_ACTIONS = new Set<ChunkKey>(["dismiss", "apply", "save"]);

export interface LayoutBuilderProps {
  value: LayoutPreference;
  onChange(next: LayoutPreference): void;
}

export function LayoutBuilder({ value, onChange }: LayoutBuilderProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const setDeviceLayout = (next: DeviceLayout) => {
    onChange({ ...value, [device]: next });
  };

  const resetActive = () => {
    setDeviceLayout(
      device === "desktop" ? DEFAULT_DESKTOP_LAYOUT : DEFAULT_MOBILE_LAYOUT,
    );
  };

  const layout = value[device];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <DeviceTabs value={device} onChange={setDevice} />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={resetActive}
          className="gap-1.5 text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset {device}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Chunk list */}
        <div className="space-y-4">
          {SECTIONS.map((section) => (
            <SectionBlock
              key={section}
              section={section}
              layout={layout}
              onChange={setDeviceLayout}
            />
          ))}
        </div>

        {/* Live preview */}
        <PreviewCard layout={layout} device={device} />
      </div>
    </div>
  );
}

function DeviceTabs({
  value,
  onChange,
}: {
  value: "desktop" | "mobile";
  onChange(next: "desktop" | "mobile"): void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Device layout"
      className="inline-flex rounded-md border bg-card p-0.5"
    >
      {(["desktop", "mobile"] as const).map((option) => (
        <button
          key={option}
          type="button"
          role="tab"
          aria-selected={value === option}
          onClick={() => onChange(option)}
          className={cn(
            "rounded px-3 py-1 text-xs font-medium capitalize transition-colors",
            value === option
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

/**
 * One drag-scoped block per section. The "Disabled" chunks for THIS
 * section sit underneath so the user can re-enable without scrolling
 * across the whole panel.
 */
function SectionBlock({
  section,
  layout,
  onChange,
}: {
  section: Section;
  layout: DeviceLayout;
  onChange(next: DeviceLayout): void;
}) {
  const enabled = layout[section];
  const disabledInSection = layout.disabled.filter(
    (chunk) => CHUNK_SECTIONS[chunk] === section,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = enabled.indexOf(active.id as ChunkKey);
    const newIndex = enabled.indexOf(over.id as ChunkKey);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange({
      ...layout,
      [section]: arrayMove(enabled, oldIndex, newIndex),
    });
  };

  const toggleChunk = (chunk: ChunkKey) => {
    const isDisabled = layout.disabled.includes(chunk);
    if (isDisabled) {
      // Re-enable — append to the section's enabled list (end of the
      // section is a safer default than guessing the original index).
      onChange({
        ...layout,
        [section]: [...enabled, chunk],
        disabled: layout.disabled.filter((c) => c !== chunk),
      });
    } else {
      onChange({
        ...layout,
        [section]: enabled.filter((c) => c !== chunk),
        disabled: [...layout.disabled, chunk],
      });
    }
  };

  return (
    <section
      aria-labelledby={`builder-section-${section}`}
      className="rounded-lg border bg-card p-3"
    >
      <h3
        id={`builder-section-${section}`}
        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {SECTION_LABELS[section]}
      </h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {SECTION_HINTS[section]}
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={enabled} strategy={verticalListSortingStrategy}>
          <ul className="mt-3 space-y-1">
            {enabled.map((chunk) => (
              <ChunkRow
                key={chunk}
                chunk={chunk}
                disabled={false}
                onToggle={() => toggleChunk(chunk)}
              />
            ))}
            {enabled.length === 0 && (
              <li className="rounded border bg-muted/30 px-2 py-3 text-center text-xs text-muted-foreground">
                No chunks in {SECTION_LABELS[section]}.
                {disabledInSection.length > 0 &&
                  " Re-enable one from the Hidden list below."}
              </li>
            )}
          </ul>
        </SortableContext>
      </DndContext>

      {disabledInSection.length > 0 && (
        <div className="mt-3 border-t pt-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Hidden
          </p>
          <ul className="space-y-1">
            {disabledInSection.map((chunk) => (
              <li
                key={chunk}
                className="flex items-center justify-between gap-2 rounded border bg-muted/30 px-2 py-1 text-sm"
              >
                <span className="text-muted-foreground line-through">
                  {CHUNK_LABELS[chunk]}
                </span>
                <button
                  type="button"
                  onClick={() => toggleChunk(chunk)}
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                  aria-label={`Re-enable ${CHUNK_LABELS[chunk]}`}
                >
                  <EyeOff className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function ChunkRow({
  chunk,
  disabled,
  onToggle,
}: {
  chunk: ChunkKey;
  disabled: boolean;
  onToggle(): void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chunk });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded border bg-background px-2 py-1.5 text-sm",
        isDragging && "opacity-50 shadow-md",
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none rounded p-0.5 text-muted-foreground hover:bg-muted active:cursor-grabbing"
        aria-label={`Drag ${CHUNK_LABELS[chunk]}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex-1 truncate">{CHUNK_LABELS[chunk]}</span>
      <button
        type="button"
        onClick={onToggle}
        className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={
          disabled
            ? `Show ${CHUNK_LABELS[chunk]}`
            : `Hide ${CHUNK_LABELS[chunk]}`
        }
      >
        {disabled ? (
          <EyeOff className="h-3.5 w-3.5" />
        ) : (
          <Eye className="h-3.5 w-3.5" />
        )}
      </button>
    </li>
  );
}

/**
 * Live preview card. Uses the fixture opportunity so every chunk has
 * data to render even when the user wouldn't normally see one (e.g.
 * `applicant-ratio` is rare on real postings).
 *
 * Constrained to the preview column width. Action buttons are
 * non-interactive — onClick is a no-op so accidental clicks don't try
 * to mutate the fictional preview opportunity.
 */
function PreviewCard({
  layout,
  device,
}: {
  layout: DeviceLayout;
  device: "desktop" | "mobile";
}) {
  const disabled = new Set(layout.disabled);
  const enabledHeader = layout.header.filter((c) => !disabled.has(c));
  const enabledMeta = layout.meta.filter((c) => !disabled.has(c));
  const enabledBody = layout.body.filter((c) => !disabled.has(c));
  const enabledActions = layout.actions.filter((c) => !disabled.has(c));
  const primaryActions = enabledActions.filter((c) => PRIMARY_ACTIONS.has(c));
  const quickActions = enabledActions.filter((c) => !PRIMARY_ACTIONS.has(c));

  const context = {
    preview:
      "Build the next generation of our editor experience. You'll lead a small team…",
    expanded: false,
    setExpanded: () => undefined,
    tags: ["React", "TypeScript", "Senior"],
    payDisplayUnit: "annual" as const,
    payDisplayCurrency: "USD",
    onAction: () => undefined,
    actionDisabled: false,
    canApply: true,
  };

  return (
    <div className="sticky top-2 self-start">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Preview · {device}
      </p>
      <div
        className={cn(
          "overflow-hidden rounded-lg border bg-card shadow-sm",
          device === "mobile" ? "max-w-xs" : "max-w-md",
        )}
      >
        <div className="flex-1 overflow-y-auto p-4">
          {enabledHeader.length > 0 && (
            <HeaderPreview chunks={enabledHeader} context={context} />
          )}
          {enabledMeta.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {enabledMeta.map((chunk) => (
                <RenderChunk
                  key={chunk}
                  chunk={chunk}
                  opportunity={LAYOUT_PREVIEW_OPPORTUNITY}
                  context={context}
                />
              ))}
            </div>
          )}
          {enabledBody.length > 0 && (
            <div className="mt-4 space-y-3">
              {enabledBody.map((chunk) => (
                <RenderChunk
                  key={chunk}
                  chunk={chunk}
                  opportunity={LAYOUT_PREVIEW_OPPORTUNITY}
                  context={context}
                />
              ))}
            </div>
          )}
        </div>
        {primaryActions.length > 0 && (
          <div
            className={cn(
              "grid gap-1.5 border-t bg-background/80 p-2",
              primaryActions.length === 1 && "grid-cols-1",
              primaryActions.length === 2 && "grid-cols-2",
              primaryActions.length === 3 && "grid-cols-3",
            )}
          >
            {primaryActions.map((chunk) => (
              <RenderChunk
                key={chunk}
                chunk={chunk}
                opportunity={LAYOUT_PREVIEW_OPPORTUNITY}
                context={context}
              />
            ))}
          </div>
        )}
        {quickActions.length > 0 && (
          <div className="grid grid-cols-2 gap-1.5 border-t bg-background/60 p-1.5">
            {quickActions.map((chunk) => (
              <RenderChunk
                key={chunk}
                chunk={chunk}
                opportunity={LAYOUT_PREVIEW_OPPORTUNITY}
                context={context}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HeaderPreview({
  chunks,
  context,
}: {
  chunks: ChunkKey[];
  context: Parameters<typeof RenderChunk>[0]["context"];
}) {
  const textChunks = chunks.filter((c) => c === "company" || c === "title");
  const badgeChunks = chunks.filter((c) => c !== "company" && c !== "title");
  return (
    <div>
      {textChunks.map((chunk) => (
        <RenderChunk
          key={chunk}
          chunk={chunk}
          opportunity={LAYOUT_PREVIEW_OPPORTUNITY}
          context={context}
        />
      ))}
      {badgeChunks.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {badgeChunks.map((chunk) => (
            <RenderChunk
              key={chunk}
              chunk={chunk}
              opportunity={LAYOUT_PREVIEW_OPPORTUNITY}
              context={context}
            />
          ))}
        </div>
      )}
    </div>
  );
}
