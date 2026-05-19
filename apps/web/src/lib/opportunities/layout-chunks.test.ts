import { describe, expect, it } from "vitest";
import {
  CHUNK_KEYS,
  CHUNK_SECTIONS,
  layoutPreferenceSchema,
} from "./layout-chunks";

describe("CHUNK_KEYS + CHUNK_SECTIONS", () => {
  it("has a section for every key", () => {
    for (const key of CHUNK_KEYS) {
      expect(CHUNK_SECTIONS[key]).toBeDefined();
    }
  });

  it("groups header/meta/body/actions chunks correctly", () => {
    expect(CHUNK_SECTIONS["company"]).toBe("header");
    expect(CHUNK_SECTIONS["applicants"]).toBe("meta");
    expect(CHUNK_SECTIONS["summary"]).toBe("body");
    expect(CHUNK_SECTIONS["apply"]).toBe("actions");
    expect(CHUNK_SECTIONS["google-company"]).toBe("actions");
  });
});

describe("layoutPreferenceSchema", () => {
  // A minimal, valid LayoutPreference for the tests below. Every known
  // chunk appears exactly once across the device.
  function fullDevice() {
    return {
      header: [
        "company",
        "title",
        "status-pill",
        "remote-badge",
        "source-badge",
      ],
      meta: ["applicants", "openings", "work-term", "level", "applicant-ratio"],
      body: ["location", "salary", "deadline", "tags", "summary"],
      actions: ["dismiss", "apply", "save", "google-company", "open-original"],
      disabled: [],
    };
  }

  it("accepts a fully-populated layout", () => {
    const result = layoutPreferenceSchema.safeParse({
      desktop: fullDevice(),
      mobile: fullDevice(),
    });
    expect(result.success).toBe(true);
  });

  it("rejects a layout with a duplicate chunk", () => {
    const bad = fullDevice();
    bad.header.push("company" as never);
    const result = layoutPreferenceSchema.safeParse({
      desktop: bad,
      mobile: fullDevice(),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/duplicate chunk/);
    }
  });

  it("rejects a layout missing a known chunk", () => {
    const bad = fullDevice();
    bad.actions.pop(); // drop "open-original"
    const result = layoutPreferenceSchema.safeParse({
      desktop: bad,
      mobile: fullDevice(),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/missing chunk/);
    }
  });

  it("rejects a chunk placed in the wrong section", () => {
    const bad = fullDevice();
    // Move "summary" (body) into header — section mismatch.
    bad.body = bad.body.filter((k) => k !== "summary");
    bad.header.push("summary" as never);
    const result = layoutPreferenceSchema.safeParse({
      desktop: bad,
      mobile: fullDevice(),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/belongs in section/);
    }
  });

  it("accepts a layout with disabled chunks", () => {
    const dev = fullDevice();
    // Move `applicant-ratio` to disabled.
    dev.meta = dev.meta.filter((k) => k !== "applicant-ratio");
    dev.disabled.push("applicant-ratio" as never);
    const result = layoutPreferenceSchema.safeParse({
      desktop: dev,
      mobile: dev,
    });
    expect(result.success).toBe(true);
  });
});
