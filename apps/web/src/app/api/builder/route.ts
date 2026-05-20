import { NextRequest, NextResponse } from "next/server";
import { parseJsonBody } from "@/lib/api-utils";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getBankEntries } from "@/lib/db/profile-bank";
import { bankEntriesToResume } from "@/lib/resume/bank-to-resume";
import {
  editableDocumentToResume,
  type EditableResumeDocument,
} from "@/lib/builder/editor-document";
import {
  getReusableResumeTemplate,
  getDocumentTemplateV3,
} from "@/lib/db/template-migrations";
import { generateResumeHTML } from "@/lib/resume/pdf";
import { getTemplateWithCustom } from "@/lib/resume/templates";
import { builderRequestSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const parsed = await parseJsonBody(request, builderRequestSchema);
    if (!parsed.ok) return parsed.response;

    const { entryIds, templateId = "classic", contact, document } = parsed.data;

    if (document?.sections.length) {
      const resume = editableDocumentToResume(
        document as EditableResumeDocument,
        contact || { name: "Your Name" },
      );
      const html = await renderBuilderResumeHtml(
        resume,
        templateId,
        authResult.userId,
      );

      return NextResponse.json({ html, resume });
    }

    const allEntries = getBankEntries(authResult.userId);
    const selectedEntries = expandSelectedBankEntries(
      allEntries,
      entryIds ?? [],
    );

    const resume = bankEntriesToResume(
      selectedEntries,
      contact || { name: "Your Name" },
    );

    const html = await renderBuilderResumeHtml(
      resume,
      templateId,
      authResult.userId,
    );

    return NextResponse.json({ html, resume });
  } catch (error) {
    console.error("Builder error:", error);
    return NextResponse.json(
      { error: "Failed to generate resume" },
      { status: 500 },
    );
  }
}

async function renderBuilderResumeHtml(
  resume: ReturnType<typeof bankEntriesToResume>,
  templateId: string,
  userId: string,
): Promise<string> {
  const reusableTemplate = getReusableResumeTemplate(templateId, userId);
  if (reusableTemplate) {
    const { renderTailoredResumeWithReusableTemplate } =
      await import("@/lib/resume/universal-template-renderer");
    return renderTailoredResumeWithReusableTemplate(
      resume,
      reusableTemplate.template,
    );
  }
  const documentTemplateV3 = getDocumentTemplateV3(templateId, userId);
  if (documentTemplateV3) {
    const { generateResumeHTMLV3 } =
      await import("@/lib/resume/template-v3-renderer");
    return generateResumeHTMLV3(resume, documentTemplateV3.template);
  }
  const template = await getTemplateWithCustom(templateId, userId);
  return generateResumeHTML(resume, templateId, template);
}

function expandSelectedBankEntries(
  entries: ReturnType<typeof getBankEntries>,
  entryIds: string[],
) {
  if (!Array.isArray(entries)) return [];
  const selectedIds = new Set(entryIds);
  const selectedEntries = entries.filter((entry) => selectedIds.has(entry.id));
  const selectedRootIds = new Set(
    selectedEntries
      .filter((entry) => !getParentId(entry))
      .map((entry) => entry.id),
  );

  for (const entry of selectedEntries) {
    const parentId = getParentId(entry);
    if (parentId) selectedIds.add(parentId);
  }

  for (const entry of entries) {
    const parentId = getParentId(entry);
    if (parentId && selectedRootIds.has(parentId)) {
      selectedIds.add(entry.id);
    }
  }

  return entries.filter((entry) => selectedIds.has(entry.id));
}

function getParentId(entry: ReturnType<typeof getBankEntries>[number]) {
  const parentId = entry.content.parentId;
  return typeof parentId === "string" && parentId.trim() ? parentId : null;
}
