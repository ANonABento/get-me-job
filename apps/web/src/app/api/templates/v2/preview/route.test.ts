import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: (value: unknown) => value instanceof Response,
}));

import { POST } from "./route";

describe("/api/templates/v2/preview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
  });

  it("renders a validated V2 template preview", async () => {
    const response = await POST(
      jsonRequest({
        resume: sampleResume(),
        template: sampleTemplate(),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      html: expect.stringContaining("Jane Rivera"),
      pdfOptions: {
        format: "Letter",
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
      },
    });
  });

  it("rejects malformed preview payloads", async () => {
    const response = await POST(jsonRequest({ resume: sampleResume() }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Validation failed",
    });
  });
});

function jsonRequest(body: unknown) {
  return new NextRequest("http://localhost/api/templates/v2/preview", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

function sampleResume() {
  return {
    contact: { name: "Jane Rivera", email: "jane@example.com" },
    summary: "Builds document systems.",
    experiences: [
      {
        title: "Engineer",
        company: "Acme",
        dates: "2024-present",
        highlights: ["Migrated templates."],
      },
    ],
    skills: ["TypeScript"],
    education: [],
  };
}

function sampleTemplate() {
  return {
    schemaVersion: 2,
    id: "template-1",
    name: "Imported Resume",
    page: {
      size: "letter",
      margins: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" },
    },
    tokens: {
      name: { fontFamily: "Inter", fontSize: "20pt", lineHeight: "1.1" },
      heading: { fontFamily: "Inter", fontSize: "11pt", lineHeight: "1.2" },
      body: { fontFamily: "Inter", fontSize: "10pt", lineHeight: "1.4" },
      "body-strong": {
        fontFamily: "Inter",
        fontSize: "10pt",
        lineHeight: "1.4",
        fontWeight: "700",
      },
      meta: { fontFamily: "Inter", fontSize: "9pt", lineHeight: "1.4" },
    },
    regions: [
      {
        id: "region-header",
        role: "header",
        flow: "block",
        blocks: [],
      },
      {
        id: "region-main",
        role: "main",
        flow: "block",
        blocks: [
          {
            id: "section-summary",
            type: "section",
            text: "Summary",
            children: ["slot-summary"],
          },
          {
            id: "section-experience",
            type: "section",
            text: "Experience",
            repeat: "experiences",
            children: ["slot-experience-title"],
          },
        ],
      },
    ],
    slots: [
      {
        id: "slot-name",
        path: "contact.name",
        role: "text",
        label: "Name",
        sourceBlockIds: [],
      },
      {
        id: "slot-summary",
        path: "summary",
        role: "text",
        label: "Summary",
        sourceBlockIds: [],
      },
    ],
    diagnostics: [],
  };
}
