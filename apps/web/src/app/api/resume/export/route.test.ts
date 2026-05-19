import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  getGeneratedResume: vi.fn(),
  getDocumentTemplateV2: vi.fn(),
  listDocumentTemplatesV2: vi.fn(),
  getTemplateWithCustom: vi.fn(),
  generateResumeHTML: vi.fn(),
  generateResumeHTMLV2: vi.fn(),
  generateResumeLatexV2: vi.fn(),
  getDocumentTemplateV2PDFOptions: vi.fn(),
  generatePDF: vi.fn(),
  convertContentToDocx: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: (value: unknown) => value instanceof Response,
}));

vi.mock("@/lib/db", () => ({
  getGeneratedResume: mocks.getGeneratedResume,
}));

vi.mock("@/lib/db/template-migrations", () => ({
  getDocumentTemplateV2: mocks.getDocumentTemplateV2,
  listDocumentTemplatesV2: mocks.listDocumentTemplatesV2,
}));

vi.mock("@/lib/resume/templates", () => ({
  getTemplateWithCustom: mocks.getTemplateWithCustom,
}));

vi.mock("@/lib/resume/pdf", () => ({
  generateResumeHTML: mocks.generateResumeHTML,
}));

vi.mock("@/lib/resume/template-v2-renderer", () => ({
  generateResumeHTMLV2: mocks.generateResumeHTMLV2,
  generateResumeLatexV2: mocks.generateResumeLatexV2,
  getDocumentTemplateV2PDFOptions: mocks.getDocumentTemplateV2PDFOptions,
}));

vi.mock("@/lib/resume/pdf-export", () => ({
  generatePDF: mocks.generatePDF,
}));

vi.mock("@/lib/builder/docx-export", () => ({
  convertContentToDocx: mocks.convertContentToDocx,
}));

import { GET, POST } from "./route";

const resume = {
  contact: { name: "Jane Doe" },
  summary: "Builds reliable systems.",
  experiences: [],
  skills: [],
  education: [],
};

const customTemplate = {
  id: "custom-template",
  name: "Custom Template",
  description: "Custom",
  styles: {
    fontFamily: "Inter",
    fontSize: "10pt",
    headerSize: "20pt",
    sectionHeaderSize: "12pt",
    lineHeight: "1.4",
    accentColor: "#123456",
    layout: "single-column",
    headerStyle: "left",
    bulletStyle: "disc",
    sectionDivider: "line",
  },
};

function exportRequest(body: unknown) {
  return new NextRequest("http://localhost/api/resume/export", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("resume export route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.getGeneratedResume.mockReturnValue({
      id: "resume-1",
      contentJson: JSON.stringify(resume),
    });
    mocks.getDocumentTemplateV2.mockReturnValue(null);
    mocks.listDocumentTemplatesV2.mockReturnValue([]);
    mocks.getTemplateWithCustom.mockReturnValue(customTemplate);
    mocks.generateResumeHTML.mockReturnValue("<html>custom resume</html>");
    mocks.generateResumeHTMLV2.mockReturnValue("<html>v2 resume</html>");
    mocks.generateResumeLatexV2.mockReturnValue("\\documentclass{article}");
    mocks.getDocumentTemplateV2PDFOptions.mockReturnValue({
      format: "Letter",
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    mocks.generatePDF.mockResolvedValue(new Uint8Array([1, 2, 3]));
    mocks.convertContentToDocx.mockResolvedValue(Buffer.from([4, 5, 6]));
  });

  it("lists committed V2 templates alongside built-in export templates", async () => {
    mocks.listDocumentTemplatesV2.mockReturnValue([
      {
        id: "v2-template",
        name: "Migrated Resume",
        description: null,
        sourceFilename: "resume.pdf",
        sourceType: "pdf",
        template: {
          ...v2Template(),
          regions: [
            {
              id: "region-sidebar",
              role: "sidebar",
              flow: "block",
              blocks: [],
            },
          ],
        },
      },
    ]);

    const response = await GET();

    expect(mocks.listDocumentTemplatesV2).toHaveBeenCalledWith("user-1");
    await expect(response.json()).resolves.toMatchObject({
      templates: expect.arrayContaining([
        expect.objectContaining({
          id: "v2-template",
          type: "custom",
          schemaVersion: 2,
          layout: "two-column",
          sourceFilename: "resume.pdf",
        }),
      ]),
    });
  });

  it("renders saved resume HTML with the authenticated user's custom template", async () => {
    const response = await POST(
      exportRequest({
        resumeId: "resume-1",
        templateId: "custom-template",
        format: "html",
      }),
    );

    expect(mocks.getGeneratedResume).toHaveBeenCalledWith("resume-1", "user-1");
    expect(mocks.getTemplateWithCustom).toHaveBeenCalledWith(
      "custom-template",
      "user-1",
    );
    expect(mocks.generateResumeHTML).toHaveBeenCalledWith(
      resume,
      "custom-template",
      customTemplate,
    );
    await expect(response.text()).resolves.toBe("<html>custom resume</html>");
  });

  it("renders saved resume HTML with a committed V2 document template", async () => {
    const documentTemplate = {
      id: "v2-template",
      template: { schemaVersion: 2, id: "v2-template", name: "V2 Template" },
    };
    mocks.getDocumentTemplateV2.mockReturnValue(documentTemplate);

    const response = await POST(
      exportRequest({
        resumeId: "resume-1",
        templateId: "v2-template",
        format: "html",
      }),
    );

    expect(mocks.getDocumentTemplateV2).toHaveBeenCalledWith(
      "v2-template",
      "user-1",
    );
    expect(mocks.generateResumeHTMLV2).toHaveBeenCalledWith(
      resume,
      documentTemplate.template,
    );
    expect(mocks.getTemplateWithCustom).not.toHaveBeenCalled();
    await expect(response.text()).resolves.toBe("<html>v2 resume</html>");
  });

  it("uses the custom-template HTML when exporting a saved resume to PDF", async () => {
    await POST(
      exportRequest({
        resumeId: "resume-1",
        templateId: "custom-template",
        format: "pdf",
      }),
    );

    expect(mocks.getTemplateWithCustom).toHaveBeenCalledWith(
      "custom-template",
      "user-1",
    );
    expect(mocks.generatePDF).toHaveBeenCalledWith(
      "<html>custom resume</html>",
      {
        format: "Letter",
        margin: {
          top: "1in",
          right: "1in",
          bottom: "1in",
          left: "1in",
        },
      },
    );
  });

  it("exports a resume DOCX from TipTap content", async () => {
    const content = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Hi" }] }],
    };

    const response = await POST(
      exportRequest({
        content,
        mode: "resume",
        templateId: "classic",
        format: "docx",
      }),
    );

    expect(mocks.convertContentToDocx).toHaveBeenCalledWith(
      expect.objectContaining({
        content,
        mode: "resume",
        title: "Classic Resume",
      }),
    );
    expect(response.headers.get("content-type")).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    expect(Array.from(new Uint8Array(await response.arrayBuffer()))).toEqual([
      4, 5, 6,
    ]);
  });

  it("exports a saved resume DOCX with a committed V2 document template", async () => {
    const documentTemplate = {
      id: "v2-template",
      name: "V2 Template",
      template: v2Template(),
    };
    mocks.getDocumentTemplateV2.mockReturnValue(documentTemplate);

    const response = await POST(
      exportRequest({
        resumeId: "resume-1",
        templateId: "v2-template",
        format: "docx",
      }),
    );

    expect(mocks.convertContentToDocx).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "resume",
        title: "V2 Template Resume",
        content: expect.objectContaining({ type: "doc" }),
        templateStyles: expect.objectContaining({
          fontFamily: "Inter",
          layout: "single-column",
        }),
        pageSettings: expect.objectContaining({
          marginPreset: "custom",
        }),
      }),
    );
    expect(response.headers.get("content-type")).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
  });

  it("exports a saved resume LaTeX with a committed V2 document template", async () => {
    const documentTemplate = {
      id: "v2-template",
      name: "V2 Template",
      template: v2Template(),
    };
    mocks.getDocumentTemplateV2.mockReturnValue(documentTemplate);

    const response = await POST(
      exportRequest({
        resumeId: "resume-1",
        templateId: "v2-template",
        format: "latex",
      }),
    );

    expect(mocks.generateResumeLatexV2).toHaveBeenCalledWith(
      resume,
      documentTemplate.template,
    );
    await expect(response.text()).resolves.toBe("\\documentclass{article}");
  });

  it("exports a cover letter DOCX from TipTap content", async () => {
    const content = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Hi" }] }],
    };

    await POST(
      exportRequest({
        content,
        mode: "cover_letter",
        templateId: "formal",
        format: "docx",
      }),
    );

    expect(mocks.convertContentToDocx).toHaveBeenCalledWith(
      expect.objectContaining({
        content,
        mode: "cover_letter",
        title: "Formal Cover Letter",
      }),
    );
  });

  it("rejects DOCX export without TipTap content", async () => {
    const response = await POST(
      exportRequest({
        mode: "resume",
        format: "docx",
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.convertContentToDocx).not.toHaveBeenCalled();
  });
});

function v2Template() {
  return {
    schemaVersion: 2,
    id: "v2-template",
    name: "V2 Template",
    page: {
      size: "letter",
      margins: { top: "0.5in", right: "0.6in", bottom: "0.7in", left: "0.8in" },
    },
    tokens: {
      body: { fontFamily: "Inter", fontSize: "10pt", lineHeight: "1.4" },
      heading: { fontFamily: "Inter", fontSize: "12pt", lineHeight: "1.2" },
      name: { fontFamily: "Inter", fontSize: "20pt", lineHeight: "1.1" },
      meta: { fontFamily: "Inter", fontSize: "9pt", lineHeight: "1.4" },
      "body-strong": {
        fontFamily: "Inter",
        fontSize: "10pt",
        lineHeight: "1.4",
      },
    },
    regions: [],
    slots: [],
    diagnostics: [],
  };
}
