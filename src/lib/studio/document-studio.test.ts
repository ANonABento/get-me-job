import { describe, expect, it } from "vitest";
import {
  getDefaultStudioContent,
  getStudioModeFromSearchParam,
  getStudioModeHref,
  getStudioDocumentTitle,
  isStudioDocumentMode,
  shouldShowJobDescription,
} from "./document-studio";

describe("document studio helpers", () => {
  it("validates supported studio document modes", () => {
    expect(isStudioDocumentMode("resume")).toBe(true);
    expect(isStudioDocumentMode("cover-letter")).toBe(true);
    expect(isStudioDocumentMode("tailored")).toBe(true);
    expect(isStudioDocumentMode("portfolio")).toBe(false);
  });

  it("reads the studio mode from the URL search param", () => {
    expect(getStudioModeFromSearchParam("cover-letter")).toBe("cover-letter");
    expect(getStudioModeFromSearchParam("tailored")).toBe("tailored");
    expect(getStudioModeFromSearchParam("portfolio")).toBe("resume");
    expect(getStudioModeFromSearchParam(null)).toBe("resume");
  });

  it("builds studio mode hrefs", () => {
    expect(getStudioModeHref("resume")).toBe("/studio");
    expect(getStudioModeHref("cover-letter")).toBe("/studio?mode=cover-letter");
    expect(getStudioModeHref("tailored")).toBe("/studio?mode=tailored");
  });

  it("shows the job description input only for job-specific modes", () => {
    expect(shouldShowJobDescription("resume")).toBe(false);
    expect(shouldShowJobDescription("cover-letter")).toBe(true);
    expect(shouldShowJobDescription("tailored")).toBe(true);
  });

  it("returns display titles for each mode", () => {
    expect(getStudioDocumentTitle("resume")).toBe("Resume");
    expect(getStudioDocumentTitle("cover-letter")).toBe("Cover Letter");
    expect(getStudioDocumentTitle("tailored")).toBe("Tailored Resume");
  });

  it("returns mode-specific starter content", () => {
    expect(getDefaultStudioContent("resume")).toContain("Experience");
    expect(getDefaultStudioContent("cover-letter")).toContain("Dear Hiring Manager");
    expect(getDefaultStudioContent("tailored")).toContain("Targeted summary");
  });
});
