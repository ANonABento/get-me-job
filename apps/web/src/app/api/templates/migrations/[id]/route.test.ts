import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  getTemplateMigrationDraft: vi.fn(),
  updateTemplateMigrationDraft: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: (value: unknown) => value instanceof Response,
}));

vi.mock("@/lib/db/template-migrations", () => ({
  getTemplateMigrationDraft: mocks.getTemplateMigrationDraft,
  updateTemplateMigrationDraft: mocks.updateTemplateMigrationDraft,
}));

import { GET, PATCH } from "./route";

describe("/api/templates/migrations/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.getTemplateMigrationDraft.mockReturnValue(sampleDraft());
    mocks.updateTemplateMigrationDraft.mockImplementation(
      (_id, _userId, updates) => ({
        ...sampleDraft(),
        ...updates,
      }),
    );
  });

  it("returns a saved migration draft without leaking userId", async () => {
    const response = await GET(jsonRequest("GET", null), {
      params: { id: "draft-1" },
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.draft.id).toBe("draft-1");
    expect(body.draft.userId).toBeUndefined();
  });

  it("applies slot corrections to resume content and template source blocks", async () => {
    const response = await PATCH(
      jsonRequest("PATCH", {
        slotCorrections: [
          {
            sourceBlockId: "block-name",
            path: "contact.name",
          },
          {
            sourceBlockId: "block-skill",
            path: "skills[]",
          },
        ],
      }),
      { params: { id: "draft-1" } },
    );

    expect(response.status).toBe(200);
    expect(mocks.updateTemplateMigrationDraft).toHaveBeenCalledWith(
      "draft-1",
      "user-1",
      expect.objectContaining({
        resume: expect.objectContaining({
          contact: expect.objectContaining({ name: "Jane Rivera" }),
          skills: expect.arrayContaining(["TypeScript", "PDF import"]),
        }),
        source: expect.objectContaining({
          blocks: expect.arrayContaining([
            expect.objectContaining({
              id: "block-name",
              slotHint: "contact.name",
            }),
            expect.objectContaining({
              id: "block-skill",
              slotHint: "skills[]",
            }),
          ]),
        }),
        template: expect.objectContaining({
          slots: expect.arrayContaining([
            expect.objectContaining({
              path: "contact.name",
              sourceBlockIds: expect.arrayContaining(["block-name"]),
            }),
            expect.objectContaining({
              path: "skills[]",
              sourceBlockIds: expect.arrayContaining(["block-skill"]),
            }),
          ]),
        }),
      }),
    );
  });
});

function jsonRequest(method: string, body: unknown) {
  return new NextRequest("http://localhost/api/templates/migrations/draft-1", {
    method,
    body: body === null ? undefined : JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

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
      pages: [{ id: "page-1", number: 1, widthPt: 612, heightPt: 792 }],
      blocks: [
        {
          id: "block-name",
          pageId: "page-1",
          type: "paragraph",
          text: "Jane Rivera",
        },
        {
          id: "block-skill",
          pageId: "page-1",
          type: "paragraph",
          text: "TypeScript, PDF import",
        },
      ],
      rawText: "Jane Rivera\nTypeScript, PDF import",
      diagnostics: [],
    },
    resume: {
      contact: { name: "" },
      summary: "",
      experiences: [],
      skills: [],
      education: [],
    },
    template: {
      schemaVersion: 2,
      id: "template-1",
      name: "Resume",
      page: {
        size: "letter",
        margins: {
          top: "0.5in",
          right: "0.5in",
          bottom: "0.5in",
          left: "0.5in",
        },
      },
      tokens: {
        name: { fontFamily: "Inter", fontSize: "20pt", lineHeight: "1.1" },
        heading: { fontFamily: "Inter", fontSize: "11pt", lineHeight: "1.2" },
        body: { fontFamily: "Inter", fontSize: "10pt", lineHeight: "1.4" },
        "body-strong": {
          fontFamily: "Inter",
          fontSize: "10pt",
          lineHeight: "1.4",
        },
        meta: { fontFamily: "Inter", fontSize: "9pt", lineHeight: "1.4" },
      },
      regions: [],
      slots: [
        {
          id: "slot-name",
          path: "contact.name",
          role: "text",
          label: "Name",
          sourceBlockIds: [],
        },
        {
          id: "slot-skills",
          path: "skills[]",
          role: "list",
          label: "Skills",
          sourceBlockIds: [],
        },
      ],
      diagnostics: [],
    },
    warnings: [],
    confidence: "medium",
    createdAt: "2026-05-19T00:00:00.000Z",
    updatedAt: "2026-05-19T00:00:00.000Z",
    committedTemplateId: null,
  };
}
