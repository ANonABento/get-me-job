/**
 * Default LayoutPreference for new users + the "Reset" target in the
 * builder. Spec: docs/opportunity-card-layout-builder-spec.md §6.
 *
 * - Desktop emphasises density: every chunk is enabled, ordered the way
 *   the current hard-coded JSX in `review-queue.tsx` renders them.
 * - Mobile emphasises vertical clarity: secondary chunks (level,
 *   openings, applicant-ratio, source/remote badges, quick-action
 *   links, location) get pushed into `disabled` so the small viewport
 *   stays scannable. The user can re-enable any of them from the
 *   builder.
 *
 * `getEffectiveLayout(stored)` is what the renderer should call — it
 * merges a possibly-stale stored layout (e.g. predates a new chunk)
 * against the current chunk catalog so old prefs never break.
 */
import {
  CHUNK_KEYS,
  CHUNK_SECTIONS,
  type ChunkKey,
  type DeviceLayout,
  type LayoutPreference,
  type Section,
} from "./layout-chunks";

export const DEFAULT_DESKTOP_LAYOUT: DeviceLayout = {
  // The page-level header chip already says "PENDING N" so the in-card
  // status-pill is redundant by default. Users who want it can flip the
  // toggle in the layout builder.
  header: ["company", "title", "remote-badge", "source-badge"],
  meta: ["applicants", "openings", "work-term", "level"],
  body: ["location", "salary", "deadline", "tags", "summary"],
  actions: ["dismiss", "apply", "save", "google-company", "open-original"],
  disabled: ["status-pill", "applicant-ratio"],
};

export const DEFAULT_MOBILE_LAYOUT: DeviceLayout = {
  header: ["company", "title"],
  meta: ["applicants", "work-term"],
  body: ["salary", "deadline", "summary", "tags"],
  actions: ["dismiss", "apply", "save"],
  disabled: [
    "status-pill",
    "remote-badge",
    "source-badge",
    "openings",
    "level",
    "applicant-ratio",
    "location",
    "google-company",
    "open-original",
  ],
};

export const DEFAULT_LAYOUT: LayoutPreference = {
  desktop: DEFAULT_DESKTOP_LAYOUT,
  mobile: DEFAULT_MOBILE_LAYOUT,
};

/**
 * Merge a possibly-stale stored layout against the current chunk
 * catalog. Used at read time so adding a new chunk to `CHUNK_KEYS`
 * doesn't break users with a saved layout — the new chunk gets injected
 * into its section's `disabled` list automatically.
 *
 * - If `stored` is null/undefined → return DEFAULT_LAYOUT
 * - If `stored` is well-formed but missing some keys → inject them into
 *   the right section's `disabled` list, preserve everything else
 * - Drop unknown keys (legacy/removed chunks) silently
 *
 * The schema enforces completeness at write time, but read-time merge
 * keeps us robust to schema drift across deploys (e.g. a backfill from
 * an old DB).
 */
export function getEffectiveLayout(
  stored: LayoutPreference | null | undefined,
): LayoutPreference {
  if (!stored) return DEFAULT_LAYOUT;
  return {
    desktop: mergeDevice(stored.desktop, DEFAULT_DESKTOP_LAYOUT),
    mobile: mergeDevice(stored.mobile, DEFAULT_MOBILE_LAYOUT),
  };
}

function mergeDevice(
  stored: DeviceLayout | undefined,
  fallback: DeviceLayout,
): DeviceLayout {
  if (!stored) return fallback;
  const known = new Set<ChunkKey>(CHUNK_KEYS);
  const allSeen = new Set<ChunkKey>();

  // Keep only known keys + record what we've seen so we can detect gaps.
  const filter = (list: ChunkKey[]): ChunkKey[] => {
    const out: ChunkKey[] = [];
    for (const key of list) {
      if (known.has(key) && !allSeen.has(key)) {
        allSeen.add(key);
        out.push(key);
      }
    }
    return out;
  };

  const result: DeviceLayout = {
    header: filter(stored.header ?? []),
    meta: filter(stored.meta ?? []),
    body: filter(stored.body ?? []),
    actions: filter(stored.actions ?? []),
    disabled: filter(stored.disabled ?? []),
  };

  // Inject any unseen known chunks into the right section's `disabled`
  // bucket so the renderer doesn't crash and the builder shows them
  // ready to be re-enabled.
  for (const key of CHUNK_KEYS) {
    if (allSeen.has(key)) continue;
    const section = CHUNK_SECTIONS[key];
    // A *newly added* chunk goes to `disabled` rather than its section
    // directly — opt-in is safer than opt-out.
    void section;
    result.disabled.push(key);
  }

  return result;
}

/**
 * For each section, return the ordered list of enabled chunks (the
 * `disabled` list is filtered out). Used by `RenderChunk` callers to
 * render in a single pass per section without the disabled-check.
 */
export function getEnabledBySection(
  layout: DeviceLayout,
): Record<Section, ChunkKey[]> {
  const disabled = new Set(layout.disabled);
  return {
    header: layout.header.filter((k) => !disabled.has(k)),
    meta: layout.meta.filter((k) => !disabled.has(k)),
    body: layout.body.filter((k) => !disabled.has(k)),
    actions: layout.actions.filter((k) => !disabled.has(k)),
  };
}
