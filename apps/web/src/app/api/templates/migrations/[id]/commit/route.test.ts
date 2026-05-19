import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  getTemplateMigrationDraft: vi.fn(),
  saveDocumentTemplateV3: vi.fn(),
  updateTemplateMigrationDraft: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: (value: unknown) => value instanceof Response,
}));

vi.mock("@/lib/db/template-migrations", () => ({
  getTemplateMigrationDraft: mocks.getTemplateMigrationDraft,
  saveDocumentTemplateV3: mocks.saveDocumentTemplateV3,
  updateTemplateMigrationDraft: mocks.updateTemplateMigrationDraft,
}));

import { POST } from "./route";

describe("/api/templates/migrations/:id/commit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.getTemplateMigrationDraft.mockReturnValue(sampleDraft());
    mocks.saveDocumentTemplateV3.mockReturnValue({
      id: "template-v3",
      name: "Imported Resume",
      description: "Migrated template",
      sourceFilename: "resume.pdf",
      sourceType: "pdf",
      template: sampleDraft().templateV3,
      createdAt: "2026-05-19T00:00:00.000Z",
      updatedAt: "2026-05-19T00:00:00.000Z",
    });
    mocks.updateTemplateMigrationDraft.mockReturnValue({
      ...sampleDraft(),
      status: "committed",
      committedTemplateId: "template-v3",
    });
  });

  it("saves the reviewed V3 template and marks the draft committed", async () => {
    const response = await POST(
      new NextRequest(
        "http://localhost/api/templates/migrations/draft-1/commit",
        {
          method: "POST",
        },
      ),
      { params: { id: "draft-1" } },
    );

    expect(response.status).toBe(200);
    expect(mocks.saveDocumentTemplateV3).toHaveBeenCalledWith(
      "user-1",
      sampleDraft().templateV3,
    );
    expect(mocks.updateTemplateMigrationDraft).toHaveBeenCalledWith(
      "draft-1",
      "user-1",
      { status: "committed", committedTemplateId: "template-v3" },
    );
    await expect(response.json()).resolves.toMatchObject({
      template: {
        id: "template-v3",
        schemaVersion: 3,
        documentTemplateV3: expect.objectContaining({ id: "template-v3" }),
      },
      draft: {
        status: "committed",
        committedTemplateId: "template-v3",
      },
    });
  });

  it("rejects a low-fidelity V3 visual template before saving", async () => {
    mocks.getTemplateMigrationDraft.mockReturnValue(sampleLowFidelityV3Draft());

    const response = await POST(
      new NextRequest(
        "http://localhost/api/templates/migrations/draft-1/commit",
        {
          method: "POST",
        },
      ),
      { params: { id: "draft-1" } },
    );

    expect(response.status).toBe(422);
    expect(mocks.saveDocumentTemplateV3).not.toHaveBeenCalled();
    expect(mocks.updateTemplateMigrationDraft).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      code: "visual_fidelity_low",
      error:
        "Could not read enough layout structure from this file. Try DOCX/LaTeX, or use a selectable PDF with visible text.",
      fidelity: { status: "low" },
    });
  });
});

function sampleDraft() {
  return {
    id: "draft-1",
    userId: "user-1",
    status: "reviewing",
    sourceFilename: "resume.pdf",
    sourceType: "pdf",
    source: {
      sourceType: "pdf",
      filename: "resume.pdf",
      pages: [],
      blocks: [],
      rawText: "",
      diagnostics: [],
    },
    templateV3: {
      schemaVersion: 3,
      id: "template-v3",
      name: "Imported Resume",
      source: { filename: "resume.pdf", type: "pdf" },
      page: {
        size: "letter",
        widthPt: 612,
        heightPt: 792,
        margins: { top: "0pt", right: "0pt", bottom: "0pt", left: "0pt" },
      },
      tokens: {},
      regions: [
        {
          id: "region-page-frame",
          role: "page-frame",
          flow: "block",
          nodes: [{ kind: "text", id: "text-1", text: "Jane Rivera" }],
        },
      ],
      slots: [
        {
          id: "slot-contact-name",
          path: "contact.name",
          role: "text",
          sourceRefs: [{ sourceId: "block-1", text: "Jane Rivera" }],
        },
        {
          id: "slot-contact-email",
          path: "contact.email",
          role: "text",
          sourceRefs: [{ sourceId: "block-2", text: "jane@example.com" }],
        },
      ],
      repeatGroups: [],
      diagnostics: [],
    },
    resume: {
      contact: { name: "Jane Rivera" },
      summary: "",
      experiences: [],
      skills: [],
      education: [],
    },
    template: {
      schemaVersion: 2,
      id: "template-1",
      name: "Imported Resume",
      page: {
        size: "letter",
        margins: {
          top: "0.5in",
          right: "0.5in",
          bottom: "0.5in",
          left: "0.5in",
        },
      },
      tokens: {},
      regions: [],
      slots: [],
      diagnostics: [],
    },
    warnings: [],
    confidence: "medium",
    createdAt: "2026-05-19T00:00:00.000Z",
    updatedAt: "2026-05-19T00:00:00.000Z",
    committedTemplateId: null,
  };
}

function sampleLowFidelityV3Draft() {
  return {
    ...sampleDraft(),
    templateV3: {
      schemaVersion: 3,
      id: "template-v3",
      name: "Broken visual template",
      source: { filename: "resume.pdf", type: "pdf" },
      page: {
        size: "letter",
        widthPt: 0,
        heightPt: 0,
        margins: { top: "0pt", right: "0pt", bottom: "0pt", left: "0pt" },
      },
      tokens: {},
      regions: [],
      slots: [],
      repeatGroups: [],
      diagnostics: [],
    },
  };
}
