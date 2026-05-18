import type { BankEntry } from "@/types";
import { bankEntriesToResume } from "@/lib/resume/bank-to-resume";
import { generateResumeHTML } from "@/lib/resume/pdf";
import type { ResumeTemplate } from "@/lib/resume/template-types";

export function generateResumePreviewFallbackHTML(
  entries: BankEntry[],
  templateId: string,
  resolvedTemplate?: ResumeTemplate,
): string {
  if (entries.length === 0) return "";

  return generateResumeHTML(
    bankEntriesToResume(entries),
    templateId,
    resolvedTemplate,
  );
}
