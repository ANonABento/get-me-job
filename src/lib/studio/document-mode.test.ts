import { describe, expect, it } from "vitest";
import {
  getStudioModeFromSearchParam,
  getStudioModeHref,
  isStudioDocumentMode,
} from "./document-mode";

describe("studio document mode", () => {
  it("recognizes supported studio modes", () => {
    expect(isStudioDocumentMode("resume")).toBe(true);
    expect(isStudioDocumentMode("tailored")).toBe(true);
    expect(isStudioDocumentMode("cover-letter")).toBe(true);
    expect(isStudioDocumentMode("letter")).toBe(false);
    expect(isStudioDocumentMode(null)).toBe(false);
  });

  it("defaults unknown search params to resume mode", () => {
    expect(getStudioModeFromSearchParam("cover-letter")).toBe("cover-letter");
    expect(getStudioModeFromSearchParam("tailored")).toBe("tailored");
    expect(getStudioModeFromSearchParam("resume")).toBe("resume");
    expect(getStudioModeFromSearchParam("unknown")).toBe("resume");
    expect(getStudioModeFromSearchParam(undefined)).toBe("resume");
  });

  it("builds canonical studio URLs for each mode", () => {
    expect(getStudioModeHref("resume")).toBe("/studio");
    expect(getStudioModeHref("tailored")).toBe("/studio?mode=tailored");
    expect(getStudioModeHref("cover-letter")).toBe(
      "/studio?mode=cover-letter"
    );
  });
});
