import type { BankEntry } from "@/types";

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "checkbox" | "list" | "select";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface ChunkCardProps {
  entry: BankEntry;
  onUpdate: (id: string, content: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  onCreateChild?: (parent: BankEntry, description: string) => void;
  onReorderChild?: (
    parent: BankEntry,
    childId: string,
    direction: "up" | "down",
  ) => void;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  highlighted?: boolean;
  anySelected?: boolean;
  childEntries?: BankEntry[];
  forceExpanded?: boolean;
  /**
   * When provided, replaces the card's inline expand-toggle behavior with a
   * "select" callback. Grid view passes this so clicks anywhere on the card
   * surface open the side drawer instead of expanding the card inline (which
   * does not work well at narrow grid column widths).
   */
  onSelect?: () => void;
  /**
   * Map of `sourceDocumentId → filename` used to render the source label as a
   * human-readable filename instead of a raw UUID. Pass `null` for entries
   * that were created manually.
   */
  sourceFilenames?: Map<string, string>;
}

export interface FieldEditorProps {
  field: FieldDef;
  value: unknown;
  onChange: (key: string, value: unknown) => void;
  hideLabel?: boolean;
}
