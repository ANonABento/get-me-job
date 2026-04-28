import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  fuzzyMatch,
  fuzzyScore,
  filterCommands,
  getNavigationCommands,
  getActionCommands,
  loadRecentActions,
  saveRecentAction,
  buildRecentCommands,
  type CommandItem,
} from "./command-palette";

describe("fuzzyMatch", () => {
  it("matches empty query to any target", () => {
    expect(fuzzyMatch("", "Dashboard")).toBe(true);
    expect(fuzzyMatch("", "")).toBe(true);
  });

  it("matches exact substring", () => {
    expect(fuzzyMatch("dash", "Dashboard")).toBe(true);
  });

  it("matches characters in order but not contiguous", () => {
    expect(fuzzyMatch("dbrd", "Dashboard")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(fuzzyMatch("DASH", "dashboard")).toBe(true);
    expect(fuzzyMatch("dash", "DASHBOARD")).toBe(true);
  });

  it("returns false when characters are not in order", () => {
    expect(fuzzyMatch("zxy", "Dashboard")).toBe(false);
  });

  it("returns false when query is longer than target", () => {
    expect(fuzzyMatch("dashboardextra", "Dashboard")).toBe(false);
  });
});

describe("fuzzyScore", () => {
  it("returns 0 for empty query", () => {
    expect(fuzzyScore("", "anything")).toBe(0);
  });

  it("returns -1 for no match", () => {
    expect(fuzzyScore("xyz", "Dashboard")).toBe(-1);
  });

  it("scores exact prefix lower (better) than distant match", () => {
    const prefixScore = fuzzyScore("dash", "Dashboard");
    const distantScore = fuzzyScore("dash", "My Dashboard");
    expect(prefixScore).toBeLessThan(distantScore);
  });

  it("scores consecutive matches better than spread matches", () => {
    const consecutive = fuzzyScore("set", "Settings");
    const spread = fuzzyScore("set", "some extra text");
    expect(consecutive).toBeLessThan(spread);
  });
});

describe("filterCommands", () => {
  const commands: CommandItem[] = [
    { id: "nav-dashboard", label: "Dashboard", category: "navigate", keywords: ["home"] },
    { id: "nav-settings", label: "Settings", category: "navigate", keywords: ["config"] },
    { id: "act-upload", label: "Upload Resume", category: "actions", keywords: ["import"] },
  ];

  it("returns all commands for empty query", () => {
    expect(filterCommands(commands, "")).toEqual(commands);
    expect(filterCommands(commands, "  ")).toEqual(commands);
  });

  it("filters by label match", () => {
    const result = filterCommands(commands, "dash");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("nav-dashboard");
  });

  it("filters by keyword match", () => {
    const result = filterCommands(commands, "config");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("nav-settings");
  });

  it("returns empty array when nothing matches", () => {
    expect(filterCommands(commands, "zzzzz")).toEqual([]);
  });

  it("sorts by best score", () => {
    const result = filterCommands(commands, "s");
    // Settings starts with 's', Dashboard has 's' later, Upload has no 's' match via label but "Resume" has one
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].id).toBe("nav-settings");
  });
});

describe("getNavigationCommands", () => {
  it("returns navigation commands with expected fields", () => {
    const commands = getNavigationCommands();
    expect(commands.length).toBeGreaterThan(0);
    for (const cmd of commands) {
      expect(cmd.category).toBe("navigate");
      expect(cmd.id).toBeTruthy();
      expect(cmd.label).toBeTruthy();
      expect(cmd.href).toBeTruthy();
    }
  });

  it("includes Dashboard and Settings", () => {
    const commands = getNavigationCommands();
    const ids = commands.map((c) => c.id);
    expect(ids).toContain("nav-dashboard");
    expect(ids).toContain("nav-settings");
  });

  it("uses Document Studio instead of separate document routes", () => {
    const commands = getNavigationCommands();
    expect(commands.map((c) => c.href)).toContain("/studio");
    expect(commands.map((c) => c.href)).not.toContain("/builder");
    expect(commands.map((c) => c.href)).not.toContain("/tailor");
    expect(commands.map((c) => c.href)).not.toContain("/cover-letter");
  });
});

describe("getActionCommands", () => {
  it("returns action commands", () => {
    const commands = getActionCommands();
    expect(commands.length).toBeGreaterThan(0);
    for (const cmd of commands) {
      expect(cmd.category).toBe("actions");
    }
  });

  it("links document actions to Document Studio without mode URLs", () => {
    const commands = getActionCommands();
    const studio = commands.find((cmd) => cmd.id === "act-studio");
    expect(studio?.href).toBe("/studio");
    expect(commands.filter((cmd) => cmd.href?.startsWith("/studio?"))).toEqual([]);
  });
});

describe("loadRecentActions / saveRecentAction", () => {
  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {};
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
      removeItem: vi.fn((key: string) => { delete store[key]; }),
    });
  });

  it("returns empty array when no data stored", () => {
    expect(loadRecentActions()).toEqual([]);
  });

  it("saves and loads a recent action", () => {
    saveRecentAction("nav-dashboard");
    expect(loadRecentActions()).toEqual(["nav-dashboard"]);
  });

  it("moves duplicate to front", () => {
    saveRecentAction("nav-dashboard");
    saveRecentAction("nav-settings");
    saveRecentAction("nav-dashboard");
    expect(loadRecentActions()).toEqual(["nav-dashboard", "nav-settings"]);
  });

  it("limits to 5 recent actions", () => {
    for (let i = 0; i < 7; i++) {
      saveRecentAction(`item-${i}`);
    }
    expect(loadRecentActions()).toHaveLength(5);
    // Most recent first
    expect(loadRecentActions()[0]).toBe("item-6");
  });
});

describe("buildRecentCommands", () => {
  const allCommands: CommandItem[] = [
    { id: "nav-dashboard", label: "Dashboard", category: "navigate", href: "/dashboard" },
    { id: "nav-settings", label: "Settings", category: "navigate", href: "/settings" },
    { id: "act-upload", label: "Upload Resume", category: "actions" },
  ];

  it("builds recent commands from IDs", () => {
    const result = buildRecentCommands(["nav-dashboard", "act-upload"], allCommands);
    expect(result).toHaveLength(2);
    expect(result[0].category).toBe("recent");
    expect(result[0].label).toBe("Dashboard");
    expect(result[1].label).toBe("Upload Resume");
  });

  it("preserves order of recent IDs", () => {
    const result = buildRecentCommands(["act-upload", "nav-dashboard"], allCommands);
    expect(result[0].id).toBe("act-upload");
    expect(result[1].id).toBe("nav-dashboard");
  });

  it("skips unknown IDs", () => {
    const result = buildRecentCommands(["unknown-id", "nav-dashboard"], allCommands);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("nav-dashboard");
  });

  it("returns empty array for empty input", () => {
    expect(buildRecentCommands([], allCommands)).toEqual([]);
  });
});
