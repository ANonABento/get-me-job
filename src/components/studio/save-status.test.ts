import { describe, expect, it } from "vitest";
import {
  formatRelativeSaveTime,
  getStudioSaveStatusLabel,
} from "./save-status";

describe("save status formatting", () => {
  it("formats recent saved times", () => {
    expect(formatRelativeSaveTime(1_000, 4_000)).toBe("Just now");
    expect(formatRelativeSaveTime(1_000, 8_000)).toBe("7s ago");
    expect(formatRelativeSaveTime(1_000, 181_000)).toBe("3m ago");
    expect(formatRelativeSaveTime(1_000, 7_201_000)).toBe("2h ago");
  });

  it("labels each save state", () => {
    expect(
      getStudioSaveStatusLabel({ state: "saved", lastSavedAt: 1_000 }, 8_000),
    ).toBe("Saved 7s ago");
    expect(getStudioSaveStatusLabel({ state: "saving" })).toBe("Saving...");
    expect(getStudioSaveStatusLabel({ state: "unsaved" })).toBe(
      "Unsaved changes",
    );
    expect(getStudioSaveStatusLabel({ state: "error", error: "retry" })).toBe(
      "Save failed - retry",
    );
  });
});
