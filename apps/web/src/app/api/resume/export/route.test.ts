import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  getGeneratedResume: vi.fn(),
  getDocumentTemplateV3: vi.fn(),
  listDocumentTemplatesV3: vi.fn(),
  getTemplateWithCustom: vi.fn(),
  generateResumeHTML: vi.fn(),
  generateResumeHTMLV3: vi.fn(),
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
  getDocumentTemplateV3: mocks.getDocumentTemplateV3,
  listDocumentTemplatesV3: mocks.listDocumentTemplatesV3,
}));

vi.mock("@/lib/resume/templates", () => ({
  getTemplateWithCustom: mocks.getTemplateWithCustom,
}));

vi.mock("@/lib/resume/pdf", () => ({
  generateResumeHTML: mocks.generateResumeHTML,
}));

vi.mock("@/lib/resume/template-v3-renderer", () => ({
  generateResumeHTMLV3: mocks.generateResumeHTMLV3,
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
    mocks.getDocumentTemplateV3.mockReturnValue(null);
    mocks.listDocumentTemplatesV3.mockReturnValue([]);
    mocks.getTemplateWithCustom.mockReturnValue(customTemplate);
    mocks.generateResumeHTML.mockReturnValue("<html>custom resume</html>");
    mocks.generateResumeHTMLV3.mockReturnValue("<html>v3 resume</html>");
    mocks.generatePDF.mockResolvedValue(new Uint8Array([1, 2, 3]));
    mocks.convertContentToDocx.mockResolvedValue(Buffer.from([4, 5, 6]));
  });

  it("lists committed V3 visual templates alongside built-in export templates", async () => {
    mocks.listDocumentTemplatesV3.mockReturnValue([
      {
        id: "v3-template",
        name: "Visual Table",
        description: null,
        sourceFilename: "resume.docx",
        sourceType: "docx",
        template: {
          schemaVersion: 3,
          id: "v3-template",
          name: "Visual Table",
          page: {
            size: "letter",
            widthPt: 612,
            heightPt: 792,
            margins: {
              top: "0.5in",
              right: "0.5in",
              bottom: "0.5in",
              left: "0.5in",
            },
          },
          tokens: {},
          regions: [
            { id: "region-main", role: "page-frame", flow: "table", nodes: [] },
          ],
          slots: [],
          repeatGroups: [],
          diagnostics: [],
        },
      },
    ]);

    const response = await GET();

    expect(mocks.listDocumentTemplatesV3).toHaveBeenCalledWith("user-1");
    await expect(response.json()).resolves.toMatchObject({
      templates: expect.arrayContaining([
        expect.objectContaining({
          id: "v3-template",
          type: "custom",
          schemaVersion: 3,
          layout: "single-column",
          sourceFilename: "resume.docx",
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

  it("renders saved resume HTML with a committed V3 visual template", async () => {
    const documentTemplate = {
      id: "v3-template",
      template: { schemaVersion: 3, id: "v3-template", name: "V3 Template" },
    };
    mocks.getDocumentTemplateV3.mockReturnValue(documentTemplate);

    const response = await POST(
      exportRequest({
        resumeId: "resume-1",
        templateId: "v3-template",
        format: "html",
      }),
    );

    expect(mocks.getDocumentTemplateV3).toHaveBeenCalledWith(
      "v3-template",
      "user-1",
    );
    expect(mocks.generateResumeHTMLV3).toHaveBeenCalledWith(
      resume,
      documentTemplate.template,
    );
    expect(mocks.getTemplateWithCustom).not.toHaveBeenCalled();
    await expect(response.text()).resolves.toBe("<html>v3 resume</html>");
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

  it("uses committed V3 visual template HTML and page settings for PDF export", async () => {
    const documentTemplate = {
      id: "v3-template",
      template: {
        schemaVersion: 3,
        id: "v3-template",
        name: "V3 Template",
        page: {
          size: "a4",
          widthPt: 595,
          heightPt: 842,
          margins: { top: "0", right: "0", bottom: "0", left: "0" },
        },
      },
    };
    mocks.getDocumentTemplateV3.mockReturnValue(documentTemplate);

    await POST(
      exportRequest({
        resumeId: "resume-1",
        templateId: "v3-template",
        format: "pdf",
      }),
    );

    expect(mocks.generateResumeHTMLV3).toHaveBeenCalledWith(
      resume,
      documentTemplate.template,
    );
    expect(mocks.generatePDF).toHaveBeenCalledWith("<html>v3 resume</html>", {
      format: "A4",
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
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
