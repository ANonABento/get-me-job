import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  generateDocumentTemplateV2CSS,
  generateResumeHTMLV2,
  getDocumentTemplateV2PDFOptions,
} from "@/lib/resume/template-v2-renderer";
import { documentTemplateV2Schema } from "@/lib/resume/template-v2";
import { tailoredResumeSchema } from "@/lib/schemas/tailor";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = documentTemplateV2PreviewSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    html: generateResumeHTMLV2(parsed.data.resume, parsed.data.template),
    css: generateDocumentTemplateV2CSS(parsed.data.template),
    pdfOptions: getDocumentTemplateV2PDFOptions(parsed.data.template),
  });
}

const documentTemplateV2PreviewSchema = z.object({
  resume: tailoredResumeSchema,
  template: documentTemplateV2Schema,
});
