// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { FieldDetector } from "./field-detector";

describe("FieldDetector document uploads", () => {
  it("keeps file inputs out of normal autofill fields", () => {
    document.body.innerHTML = `
      <form>
        <label for="resume">Resume</label>
        <input id="resume" name="resume" type="file" />
        <label for="firstName">First name</label>
        <input id="firstName" name="firstName" autocomplete="given-name" />
      </form>
    `;

    const form = document.querySelector<HTMLFormElement>("form")!;
    const detector = new FieldDetector();

    expect(detector.detectFields(form).map((field) => field.fieldType)).toEqual(
      ["firstName"],
    );
  });

  it("detects likely resume and cover-letter upload fields separately", () => {
    document.body.innerHTML = `
      <form>
        <label for="resumeUpload">Upload resume</label>
        <input id="resumeUpload" name="resume_file" type="file" accept=".pdf,.docx" />
        <label for="coverLetterUpload">Cover letter</label>
        <input id="coverLetterUpload" name="cover_letter" type="file" />
      </form>
    `;

    const form = document.querySelector<HTMLFormElement>("form")!;
    const detector = new FieldDetector();
    const uploads = detector.detectUploadFields(form);

    expect(uploads).toHaveLength(2);
    expect(uploads.map((upload) => upload.kind)).toEqual([
      "resume",
      "coverLetter",
    ]);
    expect(uploads[0]?.accept).toBe(".pdf,.docx");
  });
});
