import { describe, it, expect } from "vitest";
import {
  navigationGroups,
  bottomNavigation,
  getActiveSidebarHref,
  getActiveSidebarItem,
  getSidebarNavItemClassName,
  getSidebarNavItemState,
  isSidebarItemActive,
  type NavGroup,
  type NavItem,
} from "./sidebar";

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
      "Home",
      "Library",
      "Pipeline",
      "Prep",
      "Reporting",
    ]);
  });

  it("should have Dashboard in Home group", () => {
    const overview = getGroup("Home");
    const names = getItemNames(overview.items);
    expect(names).toContain("Dashboard");
  });

  it("should have library tools in Library group", () => {
    const library = getGroup("Library");
    const names = getItemNames(library.items);
    expect(names).toContain("Components");
    expect(names).toContain("Answers");
    expect(names).toContain("Studio");
  });

  it("should show one Studio link instead of separate document routes", () => {
    const library = getGroup("Library");
    const names = getItemNames(library.items);
    expect(names).toContain("Studio");
    expect(names).not.toContain("Resume Builder");
    expect(names).not.toContain("Tailor Resume");
    expect(names).not.toContain("Cover Letter");
  });

  it("should have Interview Prep in Prep group", () => {
    const prep = getGroup("Prep");
    const interviewPrep = getItem(prep.items, "Interview Prep");
    expect(interviewPrep.href).toBe("/interview");
    expect(interviewPrep.icon).toBeDefined();
  });

  it("should have opportunity workflow items in Pipeline group", () => {
    const pipeline = getGroup("Pipeline");
    const items = pipeline.items.map((i) => [i.name, i.href]);
    expect(items).toEqual([
      ["Opportunities", "/opportunities"],
      ["Review Queue", "/opportunities/review"],
      ["Calendar", "/calendar"],
    ]);
  });

  it("should have prep utilities in Prep group", () => {
    const prep = getGroup("Prep");
    const items = prep.items.map((i) => [i.name, i.href]);
    expect(items).toEqual([
      ["Interview Prep", "/interview"],
      ["ATS Scanner", "/ats"],
      ["Toolkit", "/toolkit"],
    ]);
    const toolkit = getItem(prep.items, "Toolkit");
    expect(toolkit.href).toBe("/toolkit");
    expect(toolkit.icon).toBeDefined();
  });

  it("should have Analytics in Reporting group", () => {
    const reporting = getGroup("Reporting");
    const analytics = getItem(reporting.items, "Analytics");
    expect(analytics.href).toBe("/analytics");
    expect(analytics.icon).toBeDefined();
  });

  it("should have correct hrefs for core nav items", () => {
    const allItems = navigationGroups.flatMap((g) => g.items);
    const expectedHrefs = [
      ["Dashboard", "/dashboard"],
      ["Components", "/components"],
      ["Answers", "/answers"],
      ["Studio", "/studio"],
      ["Opportunities", "/opportunities"],
      ["Review Queue", "/opportunities/review"],
      ["Calendar", "/calendar"],
      ["Interview Prep", "/interview"],
      ["ATS Scanner", "/ats"],
      ["Toolkit", "/toolkit"],
      ["Analytics", "/analytics"],
    ];

    for (const [name, href] of expectedHrefs) {
      expect(getItem(allItems, name).href).toBe(href);
    }
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
  it("should contain Profile above Settings", () => {
    expect(bottomNavigation.map((item) => [item.name, item.href])).toEqual([
      ["Profile", "/profile"],
      ["Settings", "/settings"],
    ]);
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

describe("sidebar nav item styling", () => {
  it("uses primary theme tokens for active items", () => {
    const className = getSidebarNavItemClassName({
      isActive: true,
      collapsed: false,
    });

    expect(className).toContain("app-sidebar-nav-item");
    expect(className).toContain("bg-card");
    expect(className).toContain("text-foreground");
    expect(className).toContain("border-primary/20");
    expect(className).toContain("shadow-sm");
    expect(className).not.toContain("gradient-bg");
    expect(getSidebarNavItemState(true)).toEqual({ "data-active": "true" });
  });

  it("uses muted hover tokens for inactive items", () => {
    const className = getSidebarNavItemClassName({
      isActive: false,
      collapsed: false,
    });

    expect(className).toContain("border-transparent");
    expect(className).toContain("text-muted-foreground");
    expect(className).toContain("hover:bg-card/70");
    expect(className).toContain("hover:text-foreground");
    expect(getSidebarNavItemState(false)).toEqual({ "data-active": "false" });
  });

  it("centers collapsed items without changing active theme tokens", () => {
    const className = getSidebarNavItemClassName({
      isActive: true,
      collapsed: true,
    });

    expect(className).toContain("justify-center");
    expect(className).toContain("px-2");
    expect(className).toContain("bg-card");
  });
});

describe("isSidebarItemActive", () => {
  it("matches exact routes and nested application routes", () => {
    expect(isSidebarItemActive("/opportunities/acme", "/opportunities")).toBe(
      true,
    );
    expect(isSidebarItemActive("/settings/profile", "/settings")).toBe(true);
    expect(isSidebarItemActive("/dashboard", "/dashboard")).toBe(true);
  });

  it("does not treat dashboard as a parent route", () => {
    expect(isSidebarItemActive("/dashboard/reports", "/dashboard")).toBe(false);
  });
});

describe("getActiveSidebarHref", () => {
  it("uses the most specific matching route", () => {
    const items = navigationGroups.flatMap((group) => group.items);

    expect(getActiveSidebarHref("/opportunities/review", items)).toBe(
      "/opportunities/review",
    );
  });

  it("keeps parent routes active for detail pages", () => {
    const items = navigationGroups.flatMap((group) => group.items);

    expect(getActiveSidebarHref("/opportunities/acme", items)).toBe(
      "/opportunities",
    );
  });
});

describe("getActiveSidebarItem", () => {
  const items = navigationGroups.flatMap((group) => group.items);

  it.each([
    ["/opportunities", "Opportunities"],
    ["/opportunities/acme", "Opportunities"],
    ["/opportunities/review", "Review Queue"],
    ["/studio", "Studio"],
    ["/dashboard", "Dashboard"],
  ])("resolves %s to %s", (pathname, expectedName) => {
    expect(getActiveSidebarItem(pathname, items)?.name).toBe(expectedName);
  });

  it("returns null for unknown app routes", () => {
    expect(getActiveSidebarItem("/unknown", items)).toBeNull();
  });
});
