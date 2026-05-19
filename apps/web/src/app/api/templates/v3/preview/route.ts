import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { documentTemplateV3Schema } from "@/lib/resume/template-v3";
import {
  generateDocumentTemplateV3CSS,
  generateResumeHTMLV3,
  getDocumentTemplateV3PDFOptions,
} from "@/lib/resume/template-v3-renderer";
import type { TailoredResume } from "@/lib/resume/generator";

export const dynamic = "force-dynamic";

const previewSchema = z.object({
  template: documentTemplateV3Schema,
  resume: z.unknown().optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = previewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid V3 template payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const resume = (parsed.data.resume ?? sampleResume) as TailoredResume;
  return NextResponse.json({
    html: generateResumeHTMLV3(resume, parsed.data.template),
    css: generateDocumentTemplateV3CSS(parsed.data.template),
    pdfOptions: getDocumentTemplateV3PDFOptions(parsed.data.template),
  });
}

const sampleResume: TailoredResume = {
  contact: {
    name: "Mara Voss",
    email: "mara.voss@example.com",
    phone: "+1 (416) 847-1928",
    location: "Toronto, ON",
    linkedin: "linkedin.com/in/maravoss",
    github: "github.com/maravoss",
  },
  summary:
    "Product-minded engineer focused on document systems, structured import, and production tooling.",
  experiences: [
    {
      title: "Senior Product Engineer",
      company: "Northstar Labs",
      dates: "2023 - Present",
      highlights: [
        "Built reusable document rendering primitives for customer-facing workflows.",
        "Reduced template QA time by introducing structure-aware preview checks.",
      ],
    },
    {
      title: "Frontend Engineer",
      company: "Fieldwire Systems",
      dates: "2020 - 2023",
      highlights: [
        "Shipped table-heavy reporting surfaces across web and PDF.",
      ],
    },
  ],
  projects: [
    {
      name: "Layout Importer",
      description: "Visual template reconstruction for structured documents.",
      highlights: ["Preserved table and cell geometry across preview exports."],
    },
  ],
  skills: ["TypeScript", "React", "DOCX", "PDF rendering"],
  education: [
    {
      institution: "University of Waterloo",
      degree: "BASc",
      field: "Systems Design Engineering",
      date: "2020",
    },
  ],
  certifications: [],
  awards: [],
};
