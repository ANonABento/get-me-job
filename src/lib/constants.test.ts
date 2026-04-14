import { describe, it, expect } from "vitest";
import {
  ALLOWED_MIME_TYPES,
  FILE_SIGNATURES,
  MIME_TYPE_DOCX,
  validateFileMagicBytes,
} from "./constants";

describe("ALLOWED_MIME_TYPES", () => {
  it("should include DOCX MIME type", () => {
    expect(ALLOWED_MIME_TYPES).toContain(MIME_TYPE_DOCX);
  });

  it("should include PDF and TXT", () => {
    expect(ALLOWED_MIME_TYPES).toContain("application/pdf");
    expect(ALLOWED_MIME_TYPES).toContain("text/plain");
  });
});

describe("FILE_SIGNATURES", () => {
  it("should have DOCX signature (PK zip header)", () => {
    expect(FILE_SIGNATURES[MIME_TYPE_DOCX]).toEqual([0x50, 0x4b, 0x03, 0x04]);
  });
});

describe("validateFileMagicBytes", () => {
  it("should validate DOCX magic bytes correctly", () => {
    // PK\x03\x04 header
    const validBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00]);
    expect(validateFileMagicBytes(validBuffer, MIME_TYPE_DOCX)).toBe(true);
  });

  it("should reject invalid DOCX magic bytes", () => {
    const invalidBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
    expect(validateFileMagicBytes(invalidBuffer, MIME_TYPE_DOCX)).toBe(false);
  });

  it("should reject buffer shorter than signature", () => {
    const shortBuffer = Buffer.from([0x50, 0x4b]);
    expect(validateFileMagicBytes(shortBuffer, MIME_TYPE_DOCX)).toBe(false);
  });

  it("should still validate PDF magic bytes", () => {
    const validPdf = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]);
    expect(validateFileMagicBytes(validPdf, "application/pdf")).toBe(true);
  });

  it("should validate text/plain by checking for null bytes", () => {
    const validText = Buffer.from("Hello, world!");
    expect(validateFileMagicBytes(validText, "text/plain")).toBe(true);

    const binaryContent = Buffer.from([0x48, 0x65, 0x00, 0x6c]);
    expect(validateFileMagicBytes(binaryContent, "text/plain")).toBe(false);
  });
});
