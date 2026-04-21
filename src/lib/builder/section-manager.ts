import type { BankCategory } from "@/types";

export interface SectionState {
  id: BankCategory;
  visible: boolean;
}

/**
 * Which builder panel is visible on mobile viewports. Desktop shows both.
 */
export type BuilderPanel = "edit" | "preview";

export const BUILDER_PANELS: readonly BuilderPanel[] = ["edit", "preview"];

export const DEFAULT_BUILDER_PANEL: BuilderPanel = "edit";

/**
 * Returns Tailwind classes that hide a panel on mobile when it is not the
 * active view and show it on desktop (md+) regardless. The active panel
 * is visible on both breakpoints.
 */
export function getMobilePanelClasses(
  activeView: BuilderPanel,
  panel: BuilderPanel
): string {
  return activeView === panel ? "flex md:flex" : "hidden md:flex";
}

/**
 * Default section ordering for the resume builder.
 */
export const DEFAULT_SECTION_ORDER: BankCategory[] = [
  "experience",
  "education",
  "skill",
  "project",
  "achievement",
  "certification",
];

/**
 * Create the initial section state from categories, all visible by default.
 */
export function createInitialSections(
  categories: BankCategory[] = DEFAULT_SECTION_ORDER
): SectionState[] {
  return categories.map((id) => ({ id, visible: true }));
}

/**
 * Toggle visibility of a section by its category ID.
 * Returns a new array (immutable).
 */
export function toggleSectionVisibility(
  sections: SectionState[],
  categoryId: BankCategory
): SectionState[] {
  return sections.map((s) =>
    s.id === categoryId ? { ...s, visible: !s.visible } : s
  );
}

/**
 * Reorder sections by moving a section from one index to another.
 * Returns a new array (immutable).
 */
export function reorderSections(
  sections: SectionState[],
  fromIndex: number,
  toIndex: number
): SectionState[] {
  if (
    fromIndex < 0 ||
    fromIndex >= sections.length ||
    toIndex < 0 ||
    toIndex >= sections.length ||
    fromIndex === toIndex
  ) {
    return sections;
  }
  const result = [...sections];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);
  return result;
}

/**
 * Filter to only visible section IDs, preserving order.
 */
export function getVisibleSectionIds(sections: SectionState[]): BankCategory[] {
  return sections.filter((s) => s.visible).map((s) => s.id);
}
