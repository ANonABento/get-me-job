import { describe, expect, it } from "vitest";
import type { BuilderDraftState, BuilderVersion } from "@/lib/builder/version-history";
import { isDraftSavedForDocument } from "./use-studio-page-state";

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
});
