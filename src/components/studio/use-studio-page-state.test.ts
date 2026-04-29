import { describe, expect, it, vi } from "vitest";
import type { BuilderDraftState, BuilderVersion } from "@/lib/builder/version-history";
import {
  isDraftSavedForDocument,
  linkStudioVersionToOpportunity,
} from "./use-studio-page-state";

const draftState: BuilderDraftState = {
  documentMode: "resume",
  selectedIds: ["entry-1"],
  sections: [{ id: "experience", visible: true }],
  templateId: "classic",
  html: "<p>Resume</p>",
};

const savedVersion: BuilderVersion = {
  id: "saved-version",
  kind: "manual",
  name: "Saved version",
  savedAt: "2026-04-28T12:00:00.000Z",
  state: draftState,
};

describe("studio page state helpers", () => {
  it("treats an untouched document as saved even without versions", () => {
    expect(
      isDraftSavedForDocument(new Set(), "resume", [], draftState)
    ).toBe(true);
  });

  it("requires dirty documents to match a saved version", () => {
    expect(
      isDraftSavedForDocument(
        new Set(["resume"]),
        "resume",
        [savedVersion],
        { ...draftState, html: "<p>Changed</p>" }
      )
    ).toBe(false);

    expect(
      isDraftSavedForDocument(
        new Set(["resume"]),
        "resume",
        [savedVersion],
        { ...draftState, selectedIds: ["entry-1", "entry-1"] }
      )
    ).toBe(true);
  });

  it("links saved resume versions to the selected opportunity", async () => {
    const fetcher = vi.fn<typeof fetch>(
      async () => new Response(JSON.stringify({ success: true })),
    );

    await linkStudioVersionToOpportunity({
      documentMode: "resume",
      fetcher,
      opportunityId: "job 1",
      versionId: "manual-version-1",
    });

    expect(fetcher).toHaveBeenCalledWith("/api/opportunities/job%201/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId: "manual-version-1" }),
    });
  });

  it("links saved cover letter versions to the selected opportunity", async () => {
    const fetcher = vi.fn<typeof fetch>(
      async () => new Response(JSON.stringify({ success: true })),
    );

    await linkStudioVersionToOpportunity({
      documentMode: "cover_letter",
      fetcher,
      opportunityId: "job-1",
      versionId: "cover-version-1",
    });

    expect(JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body))).toEqual({
      coverLetterId: "cover-version-1",
    });
  });
});
