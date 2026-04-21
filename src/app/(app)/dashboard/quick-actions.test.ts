import { describe, it, expect } from "vitest";
import { buildQuickActions } from "./quick-actions";

describe("buildQuickActions", () => {
  it("returns three quick actions", () => {
    const actions = buildQuickActions({ documentsCount: 0, resumesGenerated: 0 });
    expect(actions).toHaveLength(3);
  });

  it("routes 'Upload Resume' to /bank", () => {
    const [upload] = buildQuickActions({ documentsCount: 2, resumesGenerated: 1 });
    expect(upload.title).toBe("Upload Resume");
    expect(upload.href).toBe("/bank");
  });

  it("routes 'Edit Profile' to /profile", () => {
    const [, editProfile] = buildQuickActions({ documentsCount: 0, resumesGenerated: 0 });
    expect(editProfile.title).toBe("Edit Profile");
    expect(editProfile.href).toBe("/profile");
  });

  it("routes 'Build a Resume' to /builder when no resumes exist", () => {
    const [, , build] = buildQuickActions({ documentsCount: 1, resumesGenerated: 0 });
    expect(build.title).toBe("Build a Resume");
    expect(build.href).toBe("/builder");
  });

  it("routes the third action to /builder even when resumes already exist", () => {
    const [, , build] = buildQuickActions({ documentsCount: 1, resumesGenerated: 3 });
    expect(build.href).toBe("/builder");
    expect(build.title).toBe("3 Resumes Built");
  });

  it("pluralizes document count correctly", () => {
    const [one] = buildQuickActions({ documentsCount: 1, resumesGenerated: 0 });
    expect(one.description).toBe("1 document uploaded");

    const [many] = buildQuickActions({ documentsCount: 4, resumesGenerated: 0 });
    expect(many.description).toBe("4 documents uploaded");
  });

  it("pluralizes resume count correctly", () => {
    const [, , one] = buildQuickActions({ documentsCount: 0, resumesGenerated: 1 });
    expect(one.title).toBe("1 Resume Built");

    const [, , many] = buildQuickActions({ documentsCount: 0, resumesGenerated: 2 });
    expect(many.title).toBe("2 Resumes Built");
  });

  it("never routes to the legacy /jobs destination", () => {
    const actions = buildQuickActions({ documentsCount: 5, resumesGenerated: 2 });
    for (const action of actions) {
      expect(action.href).not.toBe("/jobs");
    }
  });
});
