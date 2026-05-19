/**
 * One-shot migration helper that translates the legacy `visibleBadges`
 * preference (bucket C) into the F.1 layout-builder's `disabled` list.
 *
 * The mapping is best-effort — a few `visibleBadges` keys don't have a
 * 1:1 chunk equivalent (e.g. "salary" and "deadline" are body chunks,
 * not meta chips). We err on the side of leaving chunks enabled and
 * only hide ones the user explicitly removed.
 *
 * This runs at *read* time in `getEffectiveLayout` callers — we don't
 * mutate the stored DB row. Once the user touches the F.1 builder, the
 * new explicit `layoutPreference` takes precedence and the migration
 * becomes a no-op for that user.
 *
 * Deprecating `visibleBadges` entirely is left for a follow-up commit
 * after we confirm telemetry that users have all touched the new UI.
 */
import type { ChunkKey, LayoutPreference } from "./layout-chunks";
import { getEffectiveLayout } from "./default-layout";

const VISIBLE_BADGE_TO_CHUNK: Record<string, ChunkKey | null> = {
  applicants: "applicants",
  openings: "openings",
  workTerm: "work-term",
  level: "level",
  remote: "remote-badge",
  source: "source-badge",
  deadline: "deadline",
  salary: "salary",
};

const ALL_BADGE_KEYS = Object.keys(VISIBLE_BADGE_TO_CHUNK);

/**
 * If the user has an old `visibleBadges` array but no `layoutPreference`,
 * derive a layout that hides any chunk whose badge key is missing from
 * the array. When `layoutPreference` is already set, return it unchanged.
 */
export function migrateLayoutFromVisibleBadges(
  layoutPreference: LayoutPreference | null | undefined,
  visibleBadges: readonly string[] | undefined,
): LayoutPreference {
  if (layoutPreference) {
    return getEffectiveLayout(layoutPreference);
  }
  const defaults = getEffectiveLayout(null);
  if (!visibleBadges || visibleBadges.length === 0) return defaults;

  // The hidden set = every known badge key NOT in visibleBadges.
  const visible = new Set(visibleBadges);
  const hiddenBadges = ALL_BADGE_KEYS.filter((key) => !visible.has(key));
  if (hiddenBadges.length === 0) return defaults;

  // Map each hidden badge into the corresponding chunk and move it out
  // of its section into `disabled`. Skip badges that don't map to a
  // single chunk (none in this catalog yet, but the null-tolerant
  // mapping keeps the migration robust to future additions).
  const result: LayoutPreference = {
    desktop: cloneDevice(defaults.desktop),
    mobile: cloneDevice(defaults.mobile),
  };
  for (const badge of hiddenBadges) {
    const chunk = VISIBLE_BADGE_TO_CHUNK[badge];
    if (!chunk) continue;
    moveToDisabled(result.desktop, chunk);
    moveToDisabled(result.mobile, chunk);
  }
  return result;
}

function cloneDevice(
  d: LayoutPreference["desktop"],
): LayoutPreference["desktop"] {
  return {
    header: [...d.header],
    meta: [...d.meta],
    body: [...d.body],
    actions: [...d.actions],
    disabled: [...d.disabled],
  };
}

function moveToDisabled(
  device: LayoutPreference["desktop"],
  chunk: ChunkKey,
): void {
  if (device.disabled.includes(chunk)) return;
  for (const section of ["header", "meta", "body", "actions"] as const) {
    const idx = device[section].indexOf(chunk);
    if (idx >= 0) {
      device[section] = device[section].filter((c) => c !== chunk);
      device.disabled.push(chunk);
      return;
    }
  }
}
