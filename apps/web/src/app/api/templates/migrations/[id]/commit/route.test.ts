import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  getTemplateMigrationDraft: vi.fn(),
  saveDocumentTemplateV2: vi.fn(),
  updateTemplateMigrationDraft: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: (value: unknown) => value instanceof Response,
}));

vi.mock("@/lib/db/template-migrations", () => ({
  getTemplateMigrationDraft: mocks.getTemplateMigrationDraft,
  saveDocumentTemplateV2: mocks.saveDocumentTemplateV2,
  updateTemplateMigrationDraft: mocks.updateTemplateMigrationDraft,
}));

import { POST } from "./route";

describe("/api/templates/migrations/:id/commit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.getTemplateMigrationDraft.mockReturnValue(sampleDraft());
    mocks.saveDocumentTemplateV2.mockReturnValue({
      id: "template-1",
      name: "Imported Resume",
      description: "Migrated template",
      sourceFilename: "resume.pdf",
      sourceType: "pdf",
      template: sampleDraft().template,
      createdAt: "2026-05-19T00:00:00.000Z",
      updatedAt: "2026-05-19T00:00:00.000Z",
    });
    mocks.updateTemplateMigrationDraft.mockReturnValue({
      ...sampleDraft(),
      status: "committed",
      committedTemplateId: "template-1",
    });
  });

  it("saves the reviewed V2 template and marks the draft committed", async () => {
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
    expect(mocks.saveDocumentTemplateV2).toHaveBeenCalledWith(
      "user-1",
      sampleDraft().template,
    );
    expect(mocks.updateTemplateMigrationDraft).toHaveBeenCalledWith(
      "draft-1",
      "user-1",
      { status: "committed", committedTemplateId: "template-1" },
    );
    await expect(response.json()).resolves.toMatchObject({
      template: {
        id: "template-1",
        schemaVersion: 2,
        documentTemplate: expect.objectContaining({ id: "template-1" }),
      },
      draft: {
        status: "committed",
        committedTemplateId: "template-1",
      },
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
