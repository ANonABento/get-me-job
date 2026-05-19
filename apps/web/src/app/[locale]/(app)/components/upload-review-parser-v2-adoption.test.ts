import { describe, expect, it } from "vitest";

import type { BankEntry } from "@/types";
import { shouldAdoptParserV2DraftEntries } from "./upload-review-parser-v2-adoption";

function entry(
  id: string,
  category: BankEntry["category"],
  content: Record<string, unknown> = {},
): BankEntry {
  return {
    id,
    userId: "user-1",
    category,
    content,
    confidenceScore: 0.9,
    createdAt: "2026-05-18T10:00:00.000Z",
  };
}

describe("shouldAdoptParserV2DraftEntries", () => {
  it("keeps legacy review entries when parser-v2 returns fewer roots", () => {
    const result = shouldAdoptParserV2DraftEntries({
      legacyEntries: [
        entry("legacy-exp-1", "experience"),
        entry("legacy-exp-2", "experience"),
        entry("legacy-project-1", "project"),
        entry("legacy-skill-1", "skill"),
        entry("legacy-bullet-1", "bullet", { parentId: "legacy-exp-1" }),
      ],
      parserV2Entries: [
        entry("parser-exp-1", "experience"),
        entry("parser-skill-1", "skill"),
      ],
    });

    expect(result).toEqual({
      adopt: false,
      reason: "parser-v2-fewer-roots",
      legacyRootCount: 4,
      parserV2RootCount: 2,
    });
  });

  it("adopts parser-v2 review entries when root coverage matches legacy", () => {
    const result = shouldAdoptParserV2DraftEntries({
      legacyEntries: [
        entry("legacy-exp-1", "experience"),
        entry("legacy-project-1", "project"),
        entry("legacy-bullet-1", "bullet", { parentId: "legacy-exp-1" }),
      ],
      parserV2Entries: [
        entry("parser-exp-1", "experience"),
        entry("parser-project-1", "project"),
      ],
    });

    expect(result).toMatchObject({
      adopt: true,
      reason: "parser-v2-root-parity",
      legacyRootCount: 2,
      parserV2RootCount: 2,
    });
  });

  it("adopts parser-v2 review entries when legacy has no structured roots", () => {
    const result = shouldAdoptParserV2DraftEntries({
      legacyEntries: [],
      parserV2Entries: [entry("parser-exp-1", "experience")],
    });

    expect(result).toMatchObject({
      adopt: true,
      reason: "legacy-empty",
      legacyRootCount: 0,
      parserV2RootCount: 1,
    });
  });
});
