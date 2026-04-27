import { describe, expect, it } from "vitest";
import {
  getBuilderModeFromSearchParam,
  getBuilderModeHref,
  isBuilderDocumentMode,
} from "./document-mode";

describe("builder document mode", () => {
  it("recognizes supported document modes", () => {
    expect(isBuilderDocumentMode("resume")).toBe(true);
    expect(isBuilderDocumentMode("tailored-resume")).toBe(true);
    expect(isBuilderDocumentMode("cover-letter")).toBe(true);
    expect(isBuilderDocumentMode("letter")).toBe(false);
    expect(isBuilderDocumentMode(null)).toBe(false);
  });

  it("defaults unknown search params to resume mode", () => {
    expect(getBuilderModeFromSearchParam("tailored-resume")).toBe(
      "tailored-resume"
    );
    expect(getBuilderModeFromSearchParam("cover-letter")).toBe("cover-letter");
    expect(getBuilderModeFromSearchParam("resume")).toBe("resume");
    expect(getBuilderModeFromSearchParam("unknown")).toBe("resume");
    expect(getBuilderModeFromSearchParam(undefined)).toBe("resume");
  });

  it("builds canonical builder URLs for each mode", () => {
    expect(getBuilderModeHref("resume")).toBe("/builder");
    expect(getBuilderModeHref("tailored-resume")).toBe(
      "/builder?mode=tailored-resume"
    );
    expect(getBuilderModeHref("cover-letter")).toBe(
      "/builder?mode=cover-letter"
    );
  });
});
