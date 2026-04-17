/**
 * Pure utility functions for the command palette.
 * Separated from React components for testability.
 */

export interface CommandItem {
  id: string;
  label: string;
  category: "navigate" | "actions" | "recent";
  shortcut?: string;
  href?: string;
  keywords?: string[];
}

const RECENT_ACTIONS_KEY = "command-palette-recent";
const MAX_RECENT = 5;

/**
 * Simple fuzzy match: checks if all characters of the query appear
 * in order within the target string (case-insensitive).
 */
export function fuzzyMatch(query: string, target: string): boolean {
  if (query.length === 0) return true;
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

/**
 * Score a fuzzy match — lower is better.
 * Returns -1 if no match.
 */
export function fuzzyScore(query: string, target: string): number {
  if (query.length === 0) return 0;
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  let qi = 0;
  let score = 0;
  let lastMatchIndex = -1;

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      // Bonus for consecutive matches
      if (lastMatchIndex === ti - 1) {
        score -= 1;
      }
      // Bonus for matching at start
      if (ti === 0) {
        score -= 2;
      }
      // Penalty for distance between matches
      score += lastMatchIndex >= 0 ? ti - lastMatchIndex : ti;
      lastMatchIndex = ti;
      qi++;
    }
  }

  return qi === q.length ? score : -1;
}

/**
 * Filter and sort command items by fuzzy search query.
 */
export function filterCommands(commands: CommandItem[], query: string): CommandItem[] {
  if (!query.trim()) return commands;

  const scored = commands
    .map((cmd) => {
      const labelScore = fuzzyScore(query, cmd.label);
      const keywordScores = (cmd.keywords ?? []).map((kw) => fuzzyScore(query, kw));
      const bestKeyword = keywordScores.length > 0 ? Math.min(...keywordScores.filter((s) => s !== -1), Infinity) : Infinity;
      const best = Math.min(
        labelScore !== -1 ? labelScore : Infinity,
        bestKeyword
      );
      return { cmd, score: best };
    })
    .filter(({ score }) => score !== Infinity)
    .sort((a, b) => a.score - b.score);

  return scored.map(({ cmd }) => cmd);
}

/**
 * Get the list of navigation commands.
 */
export function getNavigationCommands(): CommandItem[] {
  return [
    { id: "nav-dashboard", label: "Dashboard", category: "navigate", href: "/dashboard", shortcut: "H", keywords: ["home", "overview"] },
    { id: "nav-documents", label: "Documents", category: "navigate", href: "/bank", shortcut: "B", keywords: ["bank", "files"] },
    { id: "nav-builder", label: "Resume Builder", category: "navigate", href: "/builder", keywords: ["create", "build", "resume"] },
    { id: "nav-tailor", label: "Tailor Resume", category: "navigate", href: "/tailor", shortcut: "T", keywords: ["customize", "job"] },
    { id: "nav-cover-letter", label: "Cover Letter", category: "navigate", href: "/cover-letter", keywords: ["letter", "write"] },
    { id: "nav-settings", label: "Settings", category: "navigate", href: "/settings", shortcut: "S", keywords: ["config", "preferences", "llm"] },
  ];
}

/**
 * Get the list of action commands.
 */
export function getActionCommands(): CommandItem[] {
  return [
    { id: "act-upload", label: "Upload Resume", category: "actions", href: "/bank", shortcut: "Ctrl+U", keywords: ["import", "file", "pdf"] },
    { id: "act-build", label: "Build Resume", category: "actions", href: "/builder", keywords: ["create", "new", "generate"] },
    { id: "act-tailor", label: "Tailor to Job", category: "actions", href: "/tailor", keywords: ["customize", "match", "job"] },
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
    const updated = [commandId, ...recent.filter((id) => id !== commandId)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_ACTIONS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Build recent command items from stored IDs and the full command list.
 */
export function buildRecentCommands(recentIds: string[], allCommands: CommandItem[]): CommandItem[] {
  const result: CommandItem[] = [];
  for (const id of recentIds) {
    const original = allCommands.find((c) => c.id === id);
    if (original) {
      result.push({ ...original, category: "recent" });
    }
  }
  return result;
}
