import { describe, it, expect } from "vitest";
import {
  ALLOWED_MIME_TYPES,
  FILE_SIGNATURES,
  validateFileMagicBytes,
} from "./constants";

describe("ALLOWED_MIME_TYPES", () => {
  it("should include application/pdf", () => {
    expect(ALLOWED_MIME_TYPES).toContain("application/pdf");
  });

  it("should include text/plain", () => {
    expect(ALLOWED_MIME_TYPES).toContain("text/plain");
  });

  it("should include DOCX MIME type", () => {
    expect(ALLOWED_MIME_TYPES).toContain(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  });
});

describe("FILE_SIGNATURES", () => {
  it("should have PDF magic bytes", () => {
    expect(FILE_SIGNATURES["application/pdf"]).toEqual([0x25, 0x50, 0x44, 0x46]);
  });

  it("should have DOCX magic bytes (PK zip header)", () => {
    const docxMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    expect(FILE_SIGNATURES[docxMime]).toEqual([0x50, 0x4b, 0x03, 0x04]);
  });
});

describe("validateFileMagicBytes", () => {
  it("should validate PDF magic bytes", () => {
    const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]);
    expect(validateFileMagicBytes(pdfBuffer, "application/pdf")).toBe(true);
  });

  it("should reject invalid PDF magic bytes", () => {
    const invalidBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
    expect(validateFileMagicBytes(invalidBuffer, "application/pdf")).toBe(false);
  });

  it("should validate DOCX magic bytes (PK zip header)", () => {
    const docxMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const docxBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00]);
    expect(validateFileMagicBytes(docxBuffer, docxMime)).toBe(true);
  });

  it("should reject invalid DOCX magic bytes", () => {
    const docxMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const invalidBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
    expect(validateFileMagicBytes(invalidBuffer, docxMime)).toBe(false);
  });

  it("should validate text/plain by checking for null bytes", () => {
    const textBuffer = Buffer.from("Hello, world!");
    expect(validateFileMagicBytes(textBuffer, "text/plain")).toBe(true);
  });

  it("should reject text/plain with null bytes", () => {
    const binaryBuffer = Buffer.from([0x48, 0x65, 0x00, 0x6c]);
    expect(validateFileMagicBytes(binaryBuffer, "text/plain")).toBe(false);
  });

  it("should return true for unknown MIME types", () => {
    const buffer = Buffer.from("anything");
    expect(validateFileMagicBytes(buffer, "application/unknown")).toBe(true);
  });

  it("should reject buffer shorter than signature", () => {
    const shortBuffer = Buffer.from([0x25, 0x50]);
    expect(validateFileMagicBytes(shortBuffer, "application/pdf")).toBe(false);
  });
});
