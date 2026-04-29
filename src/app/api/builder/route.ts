import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getBankEntries } from "@/lib/db/profile-bank";
import { bankEntriesToResume } from "@/lib/resume/bank-to-resume";
import {
  editableDocumentToResume,
  type EditableResumeDocument,
} from "@/lib/builder/editor-document";
import { generateResumeHTML } from "@/lib/resume/pdf";
import { getTemplateWithCustom } from "@/lib/resume/templates";
import type { ContactInfo } from "@/types";

interface BuilderRequestBody {
  entryIds?: string[];
  templateId?: string;
  contact?: ContactInfo;
  document?: EditableResumeDocument;
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await request.json();
    const { entryIds, templateId = "classic", contact, document } =
      body as BuilderRequestBody;

    if (document) {
      if (!isEditableResumeDocument(document)) {
        return NextResponse.json(
          { error: "document must include a sections array" },
          { status: 400 }
        );
      }

      const resume = editableDocumentToResume(
        document,
        contact || { name: "Your Name" }
      );
      const template = getTemplateWithCustom(templateId, authResult.userId);
      const html = generateResumeHTML(resume, templateId, template);

      return NextResponse.json({ html, resume });
    }

    if (!Array.isArray(entryIds) || entryIds.length === 0) {
      return NextResponse.json(
        { error: "entryIds must be a non-empty array" },
        { status: 400 }
      );
    }

    const allEntries = getBankEntries(authResult.userId);
    const selectedEntries = allEntries.filter((e) => entryIds.includes(e.id));

    const resume = bankEntriesToResume(
      selectedEntries,
      contact || { name: "Your Name" }
    );

    const template = getTemplateWithCustom(templateId, authResult.userId);
    const html = generateResumeHTML(resume, templateId, template);

    return NextResponse.json({ html, resume });
  } catch (error) {
    console.error("Builder error:", error);
    return NextResponse.json(
      { error: "Failed to generate resume" },
      { status: 500 }
    );
  }
}

function isEditableResumeDocument(
  value: unknown
): value is EditableResumeDocument {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { sections?: unknown }).sections)
  );
}
