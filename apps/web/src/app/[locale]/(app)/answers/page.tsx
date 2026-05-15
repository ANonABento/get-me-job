"use client";

/**
 * Answers — Q&A library. Saved responses to application/interview
 * questions. The body lives in `answers-tab.tsx`, extracted as a
 * shared component during the Phase 3 audit (when the bank/answers
 * pages were briefly merged into a "Knowledge Bank" umbrella; the
 * merge was reverted but the extraction was kept).
 *
 * Sibling: `/components` (atomic resume material).
 */

import { ClipboardList } from "lucide-react";
import { AppPage, PageContent, PageHeader } from "@/components/ui/page-layout";
import { BankAnswersTab } from "./answers-tab";

export default function AnswersPage() {
  return (
    <AppPage padding="none">
      <PageHeader
        icon={ClipboardList}
        title="Answers"
        description="Saved responses to application questions and behavioral interview prompts. Reuse across forms, autofill, and prep sessions."
      />
      <PageContent>
        <BankAnswersTab />
      </PageContent>
    </AppPage>
  );
}
