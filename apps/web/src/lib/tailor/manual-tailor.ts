import type { BankCategory, BankEntry, ContactInfo } from "@/types";
import type { TailoredResume } from "@/lib/resume/generator";
import { bankEntriesToResume } from "@/lib/resume/bank-to-resume";
import { buildCoverLetterPreviewContent } from "@/lib/builder/cover-letter-preview-fallback";
import type { SectionState } from "@/lib/builder/section-manager";
import { applyAtsStrictnessToResume } from "./ats-strictness";
import { DEFAULT_TAILOR_SETTINGS, type TailorSettings } from "./settings";

/**
 * "Manual tailor" is the deterministic counterpart to the LLM-driven
 * `generateFromBank` flow. The user has already curated which bank entries
 * to include (via the studio entry picker) and what order the sections
 * should appear in. This function simply assembles those selections into a
 * `TailoredResume` — no LLM, no rewriting, no keyword filtering.
 *
 * v3 design intent: "Deterministically assemble from selected sections — no AI".
 */
export interface ManualTailorInput {
  /** All bank entries available to the user (typically the full bank). */
  entries: BankEntry[];
  /** IDs of entries the user has staged in the studio entry picker. */
  selectedIds: Set<string>;
  /**
   * Section ordering + visibility from studio state. Hidden sections are
   * excluded; visible sections drive the output order.
   */
  sections: SectionState[];
  /**
   * Resume vs cover-letter shape. Cover letters still return a
   * `TailoredResume` for a uniform contract; the cover-letter body text is
   * built into `summary` so the orchestrator can route it to the tiptap
   * cover-letter document builder.
   */
  documentMode: "resume" | "cover_letter";
  /** Optional contact info — falls back to `{ name: "Your Name" }`. */
  contact?: ContactInfo;
  /** Optional summary override. Resume mode only. */
  summary?: string;
  /** Optional tailor settings. ATS strictness applies to deterministic output. */
  settings?: TailorSettings;
}

export interface ManualTailorResult {
  /**
   * Deterministically assembled resume. For cover-letter mode the
   * `summary` field carries the generated letter body; all other fields
   * are empty so the orchestrator can detect mode without branching on
   * `documentMode` again.
   */
  resume: TailoredResume;
  /** Ordered, visibility-filtered entries used to build `resume`. */
  orderedEntries: BankEntry[];
}

/**
 * Order the selected bank entries by the user's current section ordering
 * and drop entries in hidden sections. This mirrors the `orderedEntries`
 * memo in `use-studio-page-state.ts` so manual-tailor output matches what
 * the live preview already shows.
 */
export function selectAndOrderEntries(
  entries: BankEntry[],
  selectedIds: Set<string>,
  sections: SectionState[],
): BankEntry[] {
  const visibleCategoryIds = sections.filter((s) => s.visible).map((s) => s.id);
  const categoryOrder = new Map<BankCategory, number>(
    visibleCategoryIds.map((id, index) => [id, index]),
  );

  return entries
    .filter(
      (entry) => selectedIds.has(entry.id) && categoryOrder.has(entry.category),
    )
    .sort(
      (a, b) =>
        (categoryOrder.get(a.category) ?? Number.MAX_SAFE_INTEGER) -
        (categoryOrder.get(b.category) ?? Number.MAX_SAFE_INTEGER),
    );
}

const DEFAULT_CONTACT: ContactInfo = { name: "Your Name" };

export function assembleManualTailor(
  input: ManualTailorInput,
): ManualTailorResult {
  const settings = input.settings ?? DEFAULT_TAILOR_SETTINGS;
  const orderedEntries = selectAndOrderEntries(
    input.entries,
    input.selectedIds,
    input.sections,
  );

  const contact = input.contact ?? DEFAULT_CONTACT;

  if (input.documentMode === "cover_letter") {
    const body =
      orderedEntries.length > 0
        ? buildCoverLetterPreviewContent(orderedEntries)
        : "";

    return {
      resume: applyAtsStrictnessToResume(
        {
          contact,
          summary: body,
          experiences: [],
          skills: [],
          education: [],
        },
        settings.atsStrictness,
      ),
      orderedEntries,
    };
  }

  // Resume mode: defer to the canonical bank → resume builder. It already
  // handles bullets-as-children, hackathons, certifications-as-skills,
  // achievement-as-summary, etc. Manual tailor relies on this so the
  // deterministic output stays in lockstep with the live preview.
  const base = bankEntriesToResume(orderedEntries, contact);

  return {
    resume: applyAtsStrictnessToResume(
      {
        ...base,
        summary: input.summary ?? base.summary,
      },
      settings.atsStrictness,
    ),
    orderedEntries,
  };
}
