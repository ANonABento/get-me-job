import { describe, expect, it } from "vitest";
import { validateFileMagicBytes } from "./file-validation";

describe("validateFileMagicBytes", () => {
  it("accepts valid PDF signatures", () => {
    const buffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]);

    expect(validateFileMagicBytes(buffer, "application/pdf")).toBe(true);
  });

  it("rejects invalid PDF signatures", () => {
    const buffer = Buffer.from([0x00, 0x50, 0x44, 0x46]);

    expect(validateFileMagicBytes(buffer, "application/pdf")).toBe(false);
  });

  it("treats UTF-8 text without null bytes as plain text", () => {
    const buffer = Buffer.from("hello world", "utf8");

    expect(validateFileMagicBytes(buffer, "text/plain")).toBe(true);
  });

  it("rejects plain text buffers with null bytes", () => {
    const buffer = Buffer.from("hello\u0000world", "utf8");

    expect(validateFileMagicBytes(buffer, "text/plain")).toBe(false);
  });
});
