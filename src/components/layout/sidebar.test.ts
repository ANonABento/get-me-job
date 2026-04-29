import { describe, it, expect } from "vitest";
import { navigationGroups, bottomNavigation, type NavGroup, type NavItem } from "./sidebar";

const getGroup = (label: string): NavGroup => {
  const group = navigationGroups.find((g) => g.label === label);
  if (!group) {
    throw new Error(`Expected ${label} group to exist`);
  }

  return group;
};

const getItem = (items: NavItem[], name: string): NavItem => {
  const item = items.find((i) => i.name === name);
  if (!item) {
    throw new Error(`Expected ${name} item to exist`);
  }

  return item;
};

const getItemNames = (items: NavItem[]) => items.map((i) => i.name);

describe("navigationGroups", () => {
  it("should include all sidebar groups", () => {
    const labels = navigationGroups.map((g) => g.label);
    expect(labels).toEqual([
      "Overview",
      "Resume",
      "Job Tracker",
      "Interview",
      "Negotiation",
      "Insights",
    ]);
  });

  it("should have Dashboard in Overview group", () => {
    const overview = getGroup("Overview");
    const names = getItemNames(overview.items);
    expect(names).toContain("Dashboard");
  });

  it("should have Documents, Document Studio, and Opportunities in Resume group", () => {
    const resume = navigationGroups.find((g) => g.label === "Resume");
    expect(resume).toBeDefined();
    const names = resume!.items.map((i) => i.name);
    expect(names).toContain("Documents");
    expect(names).toContain("Document Studio");
    expect(names).toContain("Opportunities");
  });

  it("should show one Document Studio link instead of separate document routes", () => {
    const resume = getGroup("Resume");
    const names = getItemNames(resume.items);
    expect(names).toContain("Document Studio");
    expect(names).not.toContain("Resume Builder");
    expect(names).not.toContain("Tailor Resume");
    expect(names).not.toContain("Cover Letter");
  });

  it("should have Interview Prep in Interview group", () => {
    const interview = getGroup("Interview");
    const interviewPrep = getItem(interview.items, "Interview Prep");
    expect(interviewPrep.href).toBe("/interview");
    expect(interviewPrep.icon).toBeDefined();
  });

  it("should have job tracker items in Job Tracker group", () => {
    const jobTracker = getGroup("Job Tracker");
    const items = jobTracker.items.map((i) => [i.name, i.href]);
    expect(items).toEqual([
      ["Jobs", "/jobs"],
      ["Calendar", "/calendar"],
      ["Email Templates", "/emails"],
    ]);
  });

  it("should have Salary Tools in Negotiation group", () => {
    const negotiation = getGroup("Negotiation");
    const salaryTools = getItem(negotiation.items, "Salary Tools");
    expect(salaryTools.href).toBe("/salary");
    expect(salaryTools.icon).toBeDefined();
  });

  it("should have Analytics in Insights group", () => {
    const insights = getGroup("Insights");
    const analytics = getItem(insights.items, "Analytics");
    expect(analytics.href).toBe("/analytics");
    expect(analytics.icon).toBeDefined();
  });

  it("should have correct hrefs for core nav items", () => {
    const allItems = navigationGroups.flatMap((g) => g.items);
    const dashboard = allItems.find((i) => i.name === "Dashboard");
    const documents = allItems.find((i) => i.name === "Documents");
    const studio = allItems.find((i) => i.name === "Document Studio");
    const opportunities = allItems.find((i) => i.name === "Opportunities");
    const interviewPrep = allItems.find((i) => i.name === "Interview Prep");
    const analytics = allItems.find((i) => i.name === "Analytics");

    expect(dashboard?.href).toBe("/dashboard");
    expect(documents?.href).toBe("/bank");
    expect(studio?.href).toBe("/studio");
    expect(opportunities?.href).toBe("/opportunities");
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
    const names = getItemNames(bottomNavigation);
    expect(names).not.toContain("Notifications");
    expect(names).not.toContain("Dark");
    expect(names).not.toContain("Collapse");
    expect(names).not.toContain("Sign in");
    expect(names).not.toContain("Sign In");
  });
});
