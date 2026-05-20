/**
 * Default bento layout for new users + the "Reset" target in the
 * builder. Spec: opportunity-card-bento-spec.md (forthcoming).
 *
 * Six-cell 3-column grid sized for the editorial design system:
 *
 *   col:   1            2          3
 *   row 1: identity (span 2)       signals
 *   row 2: location+pay  description (2x2)
 *   row 3: tags          (desc cont)
 *   row 4: actions (span 3)
 *   row 5: quick-actions (span 3)
 *
 * The description cell spans 2 cols × 2 rows so a typical posting fits
 * without scroll. Identity dominates the top bar. Signals (applicants/
 * openings/work-term/level) live in a single chip-cluster cell.
 *
 * `getEffectiveBentoLayout(stored)` is what the renderer should call —
 * it normalizes a possibly-stale layout against the current chunk
 * catalog and migrates legacy F.1 LayoutPreference rows.
 */
import {
  CHUNK_KEYS,
  type ChunkKey,
  type LayoutPreference,
} from "./layout-chunks";
import {
  isBentoLayoutPreference,
  type BentoCell,
  type BentoDeviceLayout,
  type BentoLayoutPreference,
} from "./bento-layout";

const DEFAULT_DESKTOP_CELLS: BentoCell[] = [
  {
    id: "identity",
    chunks: ["company", "title", "remote-badge"],
    gridCol: 1,
    gridRow: 1,
    colSpan: 2,
    rowSpan: 1,
    label: "Role",
  },
  {
    id: "signals",
    chunks: ["applicants", "openings", "work-term", "level"],
    gridCol: 3,
    gridRow: 1,
    colSpan: 1,
    rowSpan: 1,
    label: "Signals",
    tone: "muted",
  },
  {
    id: "location-pay",
    chunks: ["location", "salary", "deadline"],
    gridCol: 1,
    gridRow: 2,
    colSpan: 1,
    rowSpan: 2,
    label: "Where & When",
    tone: "muted",
  },
  {
    id: "description",
    chunks: ["summary"],
    gridCol: 2,
    gridRow: 2,
    colSpan: 2,
    rowSpan: 2,
    label: "About the role",
  },
  {
    id: "tags",
    chunks: ["tags"],
    gridCol: 1,
    gridRow: 4,
    colSpan: 3,
    rowSpan: 1,
    label: "Tags",
    tone: "muted",
  },
  {
    id: "actions",
    chunks: ["dismiss", "apply", "save"],
    gridCol: 1,
    gridRow: 5,
    colSpan: 3,
    rowSpan: 1,
  },
  {
    id: "quick-actions",
    chunks: ["google-company", "open-original"],
    gridCol: 1,
    gridRow: 6,
    colSpan: 3,
    rowSpan: 1,
    tone: "muted",
  },
];

export const DEFAULT_DESKTOP_BENTO: BentoDeviceLayout = {
  columns: 3,
  cells: DEFAULT_DESKTOP_CELLS,
  // Mobile priority: identity → signals → description → actions → location/pay → tags → quick-actions.
  // The most-important review-signals come first so a phone user gets
  // the headline above the fold.
  mobilePriority: [
    "identity",
    "signals",
    "description",
    "actions",
    "location-pay",
    "tags",
    "quick-actions",
  ],
  // Chunks the user can drag back in. We default-park `status-pill`
  // (redundant with the toolbar PENDING chip), `source-badge` (rare),
  // and `applicant-ratio` (niche).
  disabled: ["status-pill", "source-badge", "applicant-ratio"],
};

export const DEFAULT_BENTO_LAYOUT: BentoLayoutPreference = {
  desktop: DEFAULT_DESKTOP_BENTO,
  mobile: {
    expandedCount: 4,
  },
};

/**
 * Migrates a stored F.1 section-based layout to the bento shape. Used
 * at read time when the JSON column contains the legacy format. Each
 * section becomes a single cell so the user's prior chunk visibility +
 * order are preserved; they can re-arrange into a real bento via the
 * new builder.
 */
export function bentoFromSectionLayout(
  legacy: LayoutPreference,
): BentoLayoutPreference {
  const cells: BentoCell[] = [];
  let row = 1;
  for (const [section, chunks] of [
    ["identity", legacy.desktop.header],
    ["signals", legacy.desktop.meta],
    ["description", legacy.desktop.body],
    ["actions", legacy.desktop.actions],
  ] as const) {
    if (chunks.length === 0) continue;
    cells.push({
      id: section,
      chunks: [...chunks],
      gridCol: 1,
      gridRow: row,
      colSpan: 3,
      rowSpan: 1,
      label: SECTION_LABELS[section],
    });
    row += 1;
  }
  return {
    desktop: {
      columns: 3,
      cells,
      mobilePriority: cells.map((cell) => cell.id),
      disabled: [...legacy.desktop.disabled],
    },
    mobile: {
      expandedCount: 4,
    },
  };
}

const SECTION_LABELS: Record<string, string> = {
  identity: "Role",
  signals: "Signals",
  description: "About",
  actions: "Actions",
};

/**
 * Read-time normaliser. Handles three cases:
 *   1. `stored` is null/undefined → DEFAULT_BENTO_LAYOUT
 *   2. `stored` is the new bento shape → normalize chunk placement
 *      (injects unknown new chunks into `disabled`, drops removed)
 *   3. `stored` is a legacy F.1 section layout → migrate via
 *      `bentoFromSectionLayout()`
 */
export function getEffectiveBentoLayout(
  stored: unknown,
): BentoLayoutPreference {
  if (!stored) return DEFAULT_BENTO_LAYOUT;

  if (isBentoLayoutPreference(stored)) {
    return normalizeBento(stored as BentoLayoutPreference);
  }

  // Treat anything else with a `desktop.header` array as legacy F.1.
  const maybeLegacy = stored as Partial<LayoutPreference>;
  if (
    maybeLegacy?.desktop &&
    Array.isArray((maybeLegacy.desktop as { header?: ChunkKey[] }).header)
  ) {
    return normalizeBento(
      bentoFromSectionLayout(maybeLegacy as LayoutPreference),
    );
  }

  return DEFAULT_BENTO_LAYOUT;
}

/**
 * Defensive normalisation:
 *   - Filter unknown chunks out of every cell + the disabled bag
 *   - Drop cells whose chunk list ends up empty after filtering
 *   - Park any chunk that isn't placed anywhere into `disabled` (so
 *     the renderer never blows up on a new chunk added to CHUNK_KEYS
 *     after the row was saved)
 *   - Clamp cells so they fit within their device's `columns`
 */
function normalizeBento(layout: BentoLayoutPreference): BentoLayoutPreference {
  const known = new Set<ChunkKey>(CHUNK_KEYS);
  const cells: BentoCell[] = [];
  const seenChunks = new Set<ChunkKey>();
  const columns = layout.desktop.columns;

  for (const cell of layout.desktop.cells) {
    const filtered = cell.chunks.filter(
      (chunk): chunk is ChunkKey => known.has(chunk) && !seenChunks.has(chunk),
    );
    if (filtered.length === 0) continue;
    for (const chunk of filtered) seenChunks.add(chunk);

    const colSpan = Math.min(cell.colSpan, columns);
    const maxCol = columns - colSpan + 1;
    cells.push({
      ...cell,
      chunks: filtered,
      colSpan,
      gridCol: Math.min(Math.max(1, cell.gridCol), maxCol),
    });
  }

  const disabled = layout.desktop.disabled.filter(
    (chunk): chunk is ChunkKey => known.has(chunk) && !seenChunks.has(chunk),
  );
  for (const chunk of disabled) seenChunks.add(chunk);

  // Any known chunk that didn't land anywhere → park in disabled.
  for (const chunk of CHUNK_KEYS) {
    if (!seenChunks.has(chunk)) disabled.push(chunk);
  }

  // Drop mobilePriority entries pointing at removed cells.
  const cellIds = new Set(cells.map((c) => c.id));
  const mobilePriority = layout.desktop.mobilePriority.filter((id) =>
    cellIds.has(id),
  );

  return {
    desktop: {
      columns,
      cells,
      mobilePriority,
      disabled,
    },
    mobile: layout.mobile ?? { expandedCount: 4 },
  };
}

/**
 * Return cells in the order they should render on mobile (single
 * column). Cells in `mobilePriority` come first in declared order;
 * any cell missing from the priority list falls in at the end in
 * `cells[]` declaration order.
 */
export function getMobileCellOrder(layout: BentoDeviceLayout): BentoCell[] {
  const byId = new Map(layout.cells.map((cell) => [cell.id, cell]));
  const seen = new Set<string>();
  const ordered: BentoCell[] = [];
  for (const id of layout.mobilePriority) {
    const cell = byId.get(id);
    if (cell && !seen.has(id)) {
      ordered.push(cell);
      seen.add(id);
    }
  }
  for (const cell of layout.cells) {
    if (!seen.has(cell.id)) ordered.push(cell);
  }
  return ordered;
}
