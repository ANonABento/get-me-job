/**
 * Manual Tailor — studio orchestrator entry point.
 *
 * This module wraps `assembleManualTailor` and turns the resulting
 * `TailoredResume` into the same `(html, content)` pair the existing AI
 * tailor flow lands on. The Studio sub-bar's "Manual tailor" action calls
 * `runManualTailor(...)`; the function:
 *
 *   1. Builds a TailoredResume deterministically from studio state.
 *   2. Renders HTML via `generateResumeHTML` (resume) or
 *      `generateCoverLetterHTML` (cover letter) — no `/api/builder`
 *      round-trip and no LLM call.
 *   3. Produces a TipTap document via `tailoredResumeToTipTapDocument`
 *      (resume) or `coverLetterTextToTipTapDocument` (cover letter), so
 *      the editor state matches the rendered output.
 *   4. Fires the supplied success toast.
 *
 * ---------------------------------------------------------------------------
 * INTEGRATION — Studio sub-bar wiring (orchestrator, leave this file alone)
 * ---------------------------------------------------------------------------
 *
 * Inside the studio page, wire it like:
 *
 * ```ts
 * import { runManualTailor } from "@/lib/tailor/manual-tailor-handler";
 *
 * const handleTailorManual = useCallback(() => {
 *   const result = runManualTailor({
 *     entries,
 *     selectedIds,
 *     sections,
 *     documentMode,
 *     templateId,
 *     // contact + summary are optional; omit unless the studio already has
 *     // them in scope (today it does not — defaults are fine).
 *   });
 *
 *   // Wire result back into studio state — same shape as the AI tailor
 *   // path that already populates `content` + `html` in
 *   // `use-studio-page-state.ts` lines 771-785.
 *   setContent(result.content);
 *   setHtml(result.html);
 *   setDocuments((current) =>
 *     updateStudioDocument(current, activeDocument.id, {
 *       content: result.content,
 *       html: result.html,
 *     }),
 *   );
 *
 *   addToast({
 *     type: "success",
 *     title: "Tailored from selected sections",
 *     description: `${result.usedEntryCount} entries assembled.`,
 *   });
 * }, [
 *   entries, selectedIds, sections, documentMode, templateId,
 *   activeDocument.id, setContent, setHtml, setDocuments, addToast,
 * ]);
 * ```
 *
 * The orchestrator should pull `runManualTailor` from this module and call
 * it from the existing `studio-sub-bar.tsx` action. `runManualTailor` is
 * synchronous — no network, no LLM — so no loading state is required.
 */
import type { BankEntry, ContactInfo } from "@/types";
import type { SectionState } from "@/lib/builder/section-manager";
import type { TailoredResume } from "@/lib/resume/generator";
import type { TipTapJSONContent } from "@/lib/editor/types";
import { generateResumeHTML } from "@/lib/resume/pdf";
import { generateCoverLetterHTML } from "@/lib/builder/cover-letter-document";
import { tailoredResumeToTipTapDocument } from "@/lib/editor/bank-to-tiptap";
import { coverLetterTextToTipTapDocument } from "@/lib/editor/cover-letter-tiptap";
import { assembleManualTailor } from "./manual-tailor";
import type { TailorSettings } from "./settings";

export interface RunManualTailorInput {
  entries: BankEntry[];
  selectedIds: Set<string>;
  sections: SectionState[];
  documentMode: "resume" | "cover_letter";
  templateId: string;
  contact?: ContactInfo;
  summary?: string;
  settings?: TailorSettings;
}

export interface RunManualTailorResult {
  resume: TailoredResume;
  html: string;
  content: TipTapJSONContent;
  usedEntryCount: number;
}

export function runManualTailor(
  input: RunManualTailorInput,
): RunManualTailorResult {
  const { resume, orderedEntries } = assembleManualTailor({
    entries: input.entries,
    selectedIds: input.selectedIds,
    sections: input.sections,
    documentMode: input.documentMode,
    contact: input.contact,
    summary: input.summary,
    settings: input.settings,
  });

  if (input.documentMode === "cover_letter") {
    const body = resume.summary;
    const html = body
      ? generateCoverLetterHTML({
          content: body,
          templateId: input.templateId,
          candidateName: resume.contact.name,
        })
      : "";
    const content = coverLetterTextToTipTapDocument(body);
    return {
      resume,
      html,
      content,
      usedEntryCount: orderedEntries.length,
    };
  }

  const html = generateResumeHTML(resume, input.templateId);
  const content = tailoredResumeToTipTapDocument(resume);
  return {
    resume,
    html,
    content,
    usedEntryCount: orderedEntries.length,
  };
}
