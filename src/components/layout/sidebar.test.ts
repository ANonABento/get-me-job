import { describe, it, expect } from "vitest";
import { FEATURES, navigationGroups, bottomNavigation } from "./sidebar";

describe("FEATURES", () => {
  it("should have tailorResume flag disabled by default", () => {
    expect(FEATURES.tailorResume).toBe(false);
  });

  it("should have jobTracker flag disabled by default", () => {
    expect(FEATURES.jobTracker).toBe(false);
  });

  it("should have salary flag disabled by default", () => {
    expect(FEATURES.salary).toBe(false);
  });

  it("should have interview flag enabled", () => {
    expect(FEATURES.interview).toBe(true);
  });

  it("should have analytics flag enabled", () => {
    expect(FEATURES.analytics).toBe(true);
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
  it("should include Overview, Resume, Interview, and Insights groups", () => {
    const labels = navigationGroups.map((g) => g.label);
    expect(labels).toContain("Overview");
    expect(labels).toContain("Resume");
    expect(labels).toContain("Interview");
    expect(labels).toContain("Insights");
  });

  it("should not include Job Tracker or Negotiation groups (flags still off)", () => {
    const labels = navigationGroups.map((g) => g.label);
    expect(labels).not.toContain("Job Tracker");
    expect(labels).not.toContain("Negotiation");
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

  it("should not show Tailor Resume or Cover Letter when tailorResume flag is off", () => {
    const resume = navigationGroups.find((g) => g.label === "Resume");
    expect(resume).toBeDefined();
    const names = resume!.items.map((i) => i.name);
    expect(names).not.toContain("Tailor Resume");
    expect(names).not.toContain("Cover Letter");
  });

  it("should have Interview Prep in Interview group", () => {
    const interview = navigationGroups.find((g) => g.label === "Interview");
    expect(interview).toBeDefined();
    const interviewPrep = interview!.items.find((i) => i.name === "Interview Prep");
    expect(interviewPrep).toBeDefined();
    expect(interviewPrep!.href).toBe("/interview");
    expect(interviewPrep!.icon).toBeDefined();
  });

  it("should have Analytics in Insights group", () => {
    const insights = navigationGroups.find((g) => g.label === "Insights");
    expect(insights).toBeDefined();
    const analytics = insights!.items.find((i) => i.name === "Analytics");
    expect(analytics).toBeDefined();
    expect(analytics!.href).toBe("/analytics");
    expect(analytics!.icon).toBeDefined();
  });

  it("should have correct hrefs for core nav items", () => {
    const allItems = navigationGroups.flatMap((g) => g.items);
    const dashboard = allItems.find((i) => i.name === "Dashboard");
    const documents = allItems.find((i) => i.name === "Documents");
    const builder = allItems.find((i) => i.name === "Resume Builder");
    const interviewPrep = allItems.find((i) => i.name === "Interview Prep");
    const analytics = allItems.find((i) => i.name === "Analytics");

    expect(dashboard?.href).toBe("/dashboard");
    expect(documents?.href).toBe("/bank");
    expect(builder?.href).toBe("/builder");
    expect(interviewPrep?.href).toBe("/interview");
    expect(analytics?.href).toBe("/analytics");
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
