/**
 * Pure utility functions for the command palette.
 * Separated from React components for testability.
 */

export interface CommandItem {
  id: string;
  label: string;
  category:
    | "navigate"
    | "actions"
    | "recent"
    | "frequent"
    | "opportunities"
    | "bank"
    | "answer-bank"
    | "emails"
    | "settings";
  description?: string;
  shortcut?: string;
  href?: string;
  keywords?: string[];
}

const RECENT_ACTIONS_KEY = "command-palette-recent";
const FREQUENT_ACTIONS_KEY = "taida:cmdk:frequency";
const MAX_RECENT = 5;

/**
 * Get the list of navigation commands.
 */
export function getNavigationCommands(): CommandItem[] {
  return [
    {
      id: "nav-dashboard",
      label: "Dashboard",
      category: "navigate",
      href: "/dashboard",
      shortcut: "H",
      keywords: ["home", "overview"],
    },
    {
      id: "nav-components",
      label: "Components",
      category: "navigate",
      href: "/components",
      shortcut: "B",
      keywords: ["bank", "files", "resume", "bullets", "documents"],
    },
    {
      id: "nav-studio",
      label: "Studio",
      category: "navigate",
      href: "/studio",
      shortcut: "T",
      keywords: ["create", "build", "resume", "tailor", "cover letter"],
    },
    {
      id: "nav-settings",
      label: "Settings",
      category: "navigate",
      href: "/settings",
      shortcut: "S",
      keywords: ["config", "preferences", "llm"],
    },
    {
      id: "nav-profile",
      label: "Profile",
      category: "navigate",
      href: "/profile",
      keywords: ["account", "personal", "resume profile"],
    },
  ];
}

/**
 * Get the list of action commands.
 */
export function getActionCommands(): CommandItem[] {
  return [
    {
      id: "act-new-opportunity",
      label: "New opportunity",
      category: "actions",
      href: "/opportunities",
      keywords: ["job", "add", "create", "track"],
    },
    {
      id: "act-tailor",
      label: "Tailor for current job",
      category: "actions",
      href: "/studio",
      keywords: ["resume", "job description", "generate", "customize"],
    },
    {
      id: "act-upload",
      label: "Upload Resume",
      category: "actions",
      href: "/components",
      shortcut: "Ctrl+U",
      keywords: ["import", "file", "pdf"],
    },
    {
      id: "act-studio",
      label: "Open Studio",
      category: "actions",
      href: "/studio",
      keywords: ["build", "resume", "create", "new", "generate"],
    },
    {
      id: "act-profile",
      label: "Open Profile",
      category: "actions",
      href: "/profile",
      keywords: ["account", "personal"],
    },
    {
      id: "act-settings",
      label: "Open Settings",
      category: "actions",
      href: "/settings",
      keywords: ["preferences", "configuration"],
    },
  ];
}

/**
 * Load recent actions from localStorage.
 */
export function loadRecentActions(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_ACTIONS_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

/**
 * Save a command ID to recent actions in localStorage.
 */
export function saveRecentAction(commandId: string): void {
  if (typeof window === "undefined") return;
  try {
    const recent = loadRecentActions();
    const updated = [
      commandId,
      ...recent.filter((id) => id !== commandId),
    ].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_ACTIONS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

export function loadFrequencyMap(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(FREQUENT_ACTIONS_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, number] =>
          typeof entry[0] === "string" &&
          typeof entry[1] === "number" &&
          Number.isFinite(entry[1]) &&
          entry[1] > 0,
      ),
    );
  } catch {
    return {};
  }
}

export function incrementCommandUsage(commandId: string): void {
  if (typeof window === "undefined") return;
  try {
    const usage = loadFrequencyMap();
    usage[commandId] = (usage[commandId] ?? 0) + 1;
    localStorage.setItem(FREQUENT_ACTIONS_KEY, JSON.stringify(usage));
  } catch {
    // Ignore storage errors
  }
}

export function loadFrequentActions(limit = 5): string[] {
  return Object.entries(loadFrequencyMap())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([id]) => id);
}

/**
 * Build recent command items from stored IDs and the full command list.
 */
export function buildRecentCommands(
  recentIds: string[],
  allCommands: CommandItem[],
): CommandItem[] {
  const result: CommandItem[] = [];
  for (const id of recentIds) {
    const original = allCommands.find((c) => c.id === id);
    if (original) {
      result.push({ ...original, category: "recent" });
    }
  }
  return result;
}

export function buildFrequentCommands(
  frequentIds: string[],
  allCommands: CommandItem[],
  excludedIds: string[] = [],
): CommandItem[] {
  const excluded = new Set(excludedIds);
  const result: CommandItem[] = [];
  for (const id of frequentIds) {
    if (excluded.has(id)) continue;
    const original = allCommands.find((command) => command.id === id);
    if (original) {
      result.push({ ...original, category: "frequent" });
    }
  }
  return result;
}
