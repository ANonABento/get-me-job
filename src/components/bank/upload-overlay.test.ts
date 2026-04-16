import { describe, it, expect } from "vitest";
import {
  ACCEPTED_MIME_TYPES,
  MIME_LABELS,
  UPLOAD_STAGES,
  STAGE_LABELS,
  isAcceptedType,
  fileTypeError,
  stageIndex,
  stageProgress,
} from "./upload-overlay";

describe("isAcceptedType", () => {
  it("should accept PDF mime type", () => {
    expect(isAcceptedType("application/pdf")).toBe(true);
  });

  it("should accept TXT mime type", () => {
    expect(isAcceptedType("text/plain")).toBe(true);
  });

  it("should accept DOCX mime type", () => {
    expect(
      isAcceptedType(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
    ).toBe(true);
  });

  it("should reject image/png", () => {
    expect(isAcceptedType("image/png")).toBe(false);
  });

  it("should reject empty string", () => {
    expect(isAcceptedType("")).toBe(false);
  });

  it("should reject arbitrary string", () => {
    expect(isAcceptedType("application/json")).toBe(false);
  });
});

describe("fileTypeError", () => {
  it("should include the file name in the error message", () => {
    const msg = fileTypeError("photo.jpg");
    expect(msg).toContain("photo.jpg");
  });

  it("should mention supported types", () => {
    const msg = fileTypeError("data.csv");
    expect(msg).toContain("PDF");
    expect(msg).toContain("DOCX");
    expect(msg).toContain("TXT");
  });
});

describe("ACCEPTED_MIME_TYPES", () => {
  it("should have exactly 3 entries", () => {
    expect(ACCEPTED_MIME_TYPES).toHaveLength(3);
  });
});

describe("MIME_LABELS", () => {
  it("should have a label for every accepted type", () => {
    for (const mime of ACCEPTED_MIME_TYPES) {
      expect(MIME_LABELS[mime]).toBeDefined();
      expect(typeof MIME_LABELS[mime]).toBe("string");
    }
  });
});

describe("UPLOAD_STAGES", () => {
  it("should have 4 stages in order", () => {
    expect(UPLOAD_STAGES).toEqual([
      "uploading",
      "extracting",
      "parsing",
      "storing",
    ]);
  });
});

describe("STAGE_LABELS", () => {
  it("should have a label for every stage", () => {
    for (const stage of UPLOAD_STAGES) {
      expect(STAGE_LABELS[stage]).toBeDefined();
      expect(typeof STAGE_LABELS[stage]).toBe("string");
    }
  });
});

describe("stageIndex", () => {
  it("should return 0 for uploading", () => {
    expect(stageIndex("uploading")).toBe(0);
  });

  it("should return 1 for extracting", () => {
    expect(stageIndex("extracting")).toBe(1);
  });

  it("should return 2 for parsing", () => {
    expect(stageIndex("parsing")).toBe(2);
  });

  it("should return 3 for storing", () => {
    expect(stageIndex("storing")).toBe(3);
  });
});

describe("stageProgress", () => {
  it("should return 0.25 for first stage", () => {
    expect(stageProgress("uploading")).toBe(0.25);
  });

  it("should return 0.5 for second stage", () => {
    expect(stageProgress("extracting")).toBe(0.5);
  });

  it("should return 0.75 for third stage", () => {
    expect(stageProgress("parsing")).toBe(0.75);
  });

  it("should return 1 for final stage", () => {
    expect(stageProgress("storing")).toBe(1);
  });
});
