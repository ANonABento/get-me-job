import { describe, it, expect } from "vitest";
import { uploadSuccessMessage } from "./utils";

describe("uploadSuccessMessage", () => {
  it("should show entry count and filename when entries were created", () => {
    expect(uploadSuccessMessage(5, "resume.pdf")).toBe(
      "Added 5 entries from resume.pdf"
    );
  });

  it("should use singular 'entry' for count of 1", () => {
    expect(uploadSuccessMessage(1, "cv.docx")).toBe(
      "Added 1 entry from cv.docx"
    );
  });

  it("should use plural 'entries' for count > 1", () => {
    expect(uploadSuccessMessage(3, "doc.txt")).toBe(
      "Added 3 entries from doc.txt"
    );
  });

  it("should show generic message when no entries created", () => {
    expect(uploadSuccessMessage(0, "notes.txt")).toBe("Uploaded notes.txt");
  });
});
