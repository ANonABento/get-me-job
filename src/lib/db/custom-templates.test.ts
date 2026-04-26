import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

vi.mock("./schema", () => ({
  default: {
    prepare: vi.fn(),
  },
}));

vi.mock("@/lib/utils", () => ({
  generateId: () => "test-template-id",
}));

import db from "./schema";
import { saveCustomTemplate } from "./custom-templates";

const analyzedStyles = {
  styles: {
    fontFamily: "Inter",
    fontSize: "11pt",
    headerSize: "18pt",
    sectionHeaderSize: "12pt",
    lineHeight: "1.4",
    accentColor: "#111111",
    layout: "single-column",
    headerStyle: "left",
    bulletStyle: "disc",
    sectionDivider: "line",
  },
  charsPerLine: 95,
  margins: {
    top: "0.5in",
    bottom: "0.5in",
    left: "0.5in",
    right: "0.5in",
  },
  sectionGap: "8pt",
} as any;

describe("Custom Template Database Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should save templates without a source document", () => {
    const mockRun = vi.fn().mockReturnValue({ changes: 1 });
    (db.prepare as Mock).mockReturnValue({ run: mockRun });

    const template = saveCustomTemplate("Modern", analyzedStyles, undefined, "user-1");

    expect(template.id).toBe("test-template-id");
    expect(db.prepare).toHaveBeenCalledWith(expect.not.stringContaining("WHERE EXISTS"));
    expect(mockRun).toHaveBeenCalledWith(
      "test-template-id",
      "user-1",
      "Modern",
      null,
      JSON.stringify(analyzedStyles),
      expect.any(String)
    );
  });

  it("should reject templates linked to source documents outside the user", () => {
    const mockRun = vi.fn().mockReturnValue({ changes: 0 });
    (db.prepare as Mock).mockReturnValue({ run: mockRun });

    expect(() => saveCustomTemplate("Modern", analyzedStyles, "doc-1", "user-1")).toThrow(
      "Source document not found"
    );
    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining("WHERE EXISTS"));
    expect(mockRun).toHaveBeenCalledWith(
      "test-template-id",
      "user-1",
      "Modern",
      "doc-1",
      JSON.stringify(analyzedStyles),
      expect.any(String),
      "doc-1",
      "user-1"
    );
  });
});
