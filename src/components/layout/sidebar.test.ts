import { describe, it, expect } from "vitest";
import { FEATURES, navigationGroups, bottomNavigation } from "./sidebar";

describe("FEATURES", () => {
  it("should have tailorResume flag enabled", () => {
    expect(FEATURES.tailorResume).toBe(true);
  });

  it("should have jobTracker flag disabled by default", () => {
    expect(FEATURES.jobTracker).toBe(false);
  });

  it("should have all feature flags defined", () => {
    expect(FEATURES).toHaveProperty("tailorResume");
    expect(FEATURES).toHaveProperty("jobTracker");
    expect(FEATURES).toHaveProperty("interview");
    expect(FEATURES).toHaveProperty("salary");
    expect(FEATURES).toHaveProperty("analytics");
  });
});

describe("navigationGroups", () => {
  it("should have Overview and Resume groups when features are disabled", () => {
    const labels = navigationGroups.map((g) => g.label);
    expect(labels).toContain("Overview");
    expect(labels).toContain("Resume");
  });

  it("should not include Job Tracker, Interview, Negotiation, or Insights groups when flags are off", () => {
    const labels = navigationGroups.map((g) => g.label);
    expect(labels).not.toContain("Job Tracker");
    expect(labels).not.toContain("Interview");
    expect(labels).not.toContain("Negotiation");
    expect(labels).not.toContain("Insights");
  });

  it("should have Dashboard in Overview group", () => {
    const overview = navigationGroups.find((g) => g.label === "Overview");
    expect(overview).toBeDefined();
    const names = overview!.items.map((i) => i.name);
    expect(names).toContain("Dashboard");
  });

  it("should have Documents and Resume Builder in Resume group", () => {
    const resume = navigationGroups.find((g) => g.label === "Resume");
    expect(resume).toBeDefined();
    const names = resume!.items.map((i) => i.name);
    expect(names).toContain("Documents");
    expect(names).toContain("Resume Builder");
  });

  it("should show Tailor Resume and Cover Letter when tailorResume flag is on", () => {
    const resume = navigationGroups.find((g) => g.label === "Resume");
    expect(resume).toBeDefined();
    const names = resume!.items.map((i) => i.name);
    expect(names).toContain("Tailor Resume");
    expect(names).toContain("Cover Letter");
  });

  it("should have correct hrefs for Tailor Resume and Cover Letter", () => {
    const allItems = navigationGroups.flatMap((g) => g.items);
    const tailor = allItems.find((i) => i.name === "Tailor Resume");
    const coverLetter = allItems.find((i) => i.name === "Cover Letter");

    expect(tailor?.href).toBe("/tailor");
    expect(coverLetter?.href).toBe("/cover-letter");
  });

  it("should have correct hrefs for core nav items", () => {
    const allItems = navigationGroups.flatMap((g) => g.items);
    const dashboard = allItems.find((i) => i.name === "Dashboard");
    const documents = allItems.find((i) => i.name === "Documents");
    const builder = allItems.find((i) => i.name === "Resume Builder");

    expect(dashboard?.href).toBe("/dashboard");
    expect(documents?.href).toBe("/bank");
    expect(builder?.href).toBe("/builder");
  });

  it("should have icons for all nav items", () => {
    const allItems = navigationGroups.flatMap((g) => g.items);
    for (const item of allItems) {
      expect(item.icon).toBeDefined();
      expect(typeof item.icon).toMatch(/function|object/);
    }
  });
});

describe("bottomNavigation", () => {
  it("should contain only Settings", () => {
    expect(bottomNavigation).toHaveLength(1);
    expect(bottomNavigation[0].name).toBe("Settings");
    expect(bottomNavigation[0].href).toBe("/settings");
  });

  it("should not contain Notifications, Dark, Collapse, or Sign in", () => {
    const names = bottomNavigation.map((i) => i.name);
    expect(names).not.toContain("Notifications");
    expect(names).not.toContain("Dark");
    expect(names).not.toContain("Collapse");
    expect(names).not.toContain("Sign in");
    expect(names).not.toContain("Sign In");
  });
});
