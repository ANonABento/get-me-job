import { describe, expect, it } from "vitest";
import { MAX_DISPLAY_FILENAME_LENGTH, sanitizeFilename } from "./filename";

describe("sanitizeFilename", () => {
  it("strips HTML/script tags but keeps inner text", () => {
    expect(sanitizeFilename("<script>alert(1)</script>.pdf")).toBe(
      "alert(1).pdf",
    );
  });

  it("removes path traversal segments and separators", () => {
    expect(sanitizeFilename("../../etc/passwd.pdf")).toBe("etc passwd.pdf");
  });

  it("collapses backslash separators (Windows-style)", () => {
    expect(sanitizeFilename("..\\..\\Users\\Public\\creds.pdf")).toBe(
      "Users Public creds.pdf",
    );
  });

  it("strips control characters", () => {
    expect(sanitizeFilename("hello\x00\x07world.pdf")).toBe("helloworld.pdf");
  });

  it("collapses runs of whitespace and strips control chars (incl. tab)", () => {
    // \t is a control character — stripped, not converted to a space.
    expect(sanitizeFilename("a   b\tc.pdf")).toBe("a bc.pdf");
    expect(sanitizeFilename("a    b   c.pdf")).toBe("a b c.pdf");
  });

  it("returns the fallback when input washes away to empty", () => {
    expect(sanitizeFilename("////...///")).toBe("upload");
    expect(sanitizeFilename("")).toBe("upload");
    expect(sanitizeFilename("<>")).toBe("upload");
  });

  it("preserves unicode (emoji, RTL, CJK)", () => {
    const out = sanitizeFilename("résumé-🚀-مرحبا-你好.pdf");
    expect(out).toContain("résumé");
    expect(out).toContain("🚀");
    expect(out).toContain("مرحبا");
    expect(out).toContain("你好");
  });

  it("caps overlong filenames at the configured length", () => {
    const long = "x".repeat(MAX_DISPLAY_FILENAME_LENGTH + 50) + ".pdf";
    const out = sanitizeFilename(long);
    expect(out.length).toBeLessThanOrEqual(MAX_DISPLAY_FILENAME_LENGTH);
    // Slice-from-end keeps the extension intact.
    expect(out.endsWith(".pdf")).toBe(true);
  });

  it("rejects non-string inputs gracefully", () => {
    // @ts-expect-error — guarding against bad runtime input
    expect(sanitizeFilename(undefined)).toBe("upload");
    // @ts-expect-error — guarding against bad runtime input
    expect(sanitizeFilename(null)).toBe("upload");
  });
});
