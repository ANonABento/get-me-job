import type { BankCategory } from "@/types";

export interface SectionState {
  id: BankCategory;
  visible: boolean;
}

export type BuilderPanel = "edit" | "preview";

export const BUILDER_PANELS: readonly BuilderPanel[] = ["edit", "preview"];

export const DEFAULT_BUILDER_PANEL: BuilderPanel = "edit";

// Uses `block` (not `flex`) so the child panel fills width without reflowing as a row flex item.
export function getMobilePanelClasses(
  activeView: BuilderPanel,
  panel: BuilderPanel
): string {
  return activeView === panel ? "block md:block" : "hidden md:block";
}

export const DEFAULT_SECTION_ORDER: BankCategory[] = [
  "experience",
  "education",
  "skill",
  "project",
  "achievement",
  "certification",
];

export function createInitialSections(
  categories: BankCategory[] = DEFAULT_SECTION_ORDER
): SectionState[] {
  return categories.map((id) => ({ id, visible: true }));
}

export function toggleSectionVisibility(
  sections: SectionState[],
  categoryId: BankCategory
): SectionState[] {
  return sections.map((s) =>
    s.id === categoryId ? { ...s, visible: !s.visible } : s
  );
}

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

export function reorderSectionsById(
  sections: SectionState[],
  fromId: BankCategory,
  toId: BankCategory
): SectionState[] {
  const fromIndex = sections.findIndex((section) => section.id === fromId);
  const toIndex = sections.findIndex((section) => section.id === toId);
  return reorderSections(sections, fromIndex, toIndex);
}

export function getVisibleSectionIds(sections: SectionState[]): BankCategory[] {
  return sections.filter((s) => s.visible).map((s) => s.id);
}
