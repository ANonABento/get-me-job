/**
 * Pure utility functions for keyboard shortcut matching.
 * Separated from React components for testability.
 */

export interface ShortcutDefinition {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  description: string;
  category: "navigation" | "actions" | "general";
}

export interface ShortcutEvent {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}

/**
 * Check if a keyboard event matches a shortcut definition.
 */
export function matchesShortcut(event: ShortcutEvent, shortcut: ShortcutDefinition): boolean {
  // Special case: ? is Shift+/ on most keyboards
  const keyMatch =
    event.key.toLowerCase() === shortcut.key.toLowerCase() ||
    (shortcut.key === "?" && event.key === "/" && event.shiftKey);

  if (!keyMatch) return false;

  // For ctrl/meta shortcuts, ignore shift (Cmd+Enter can send shift on some keyboards)
  if (shortcut.ctrl || shortcut.meta) {
    const ctrlOk = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : true;
    const metaOk = shortcut.meta ? event.metaKey : true;
    return ctrlOk && metaOk;
  }

  // Plain shortcuts: no modifier keys should be active
  const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
  return !event.ctrlKey && !event.metaKey && shiftMatch;
}

/**
 * Check if the event target is an input element where shortcuts should be suppressed.
 */
export function isInputTarget(target: HTMLElement): boolean {
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
}

/**
 * Format a shortcut for display, respecting platform conventions.
 */
export function formatShortcutKeys(shortcut: ShortcutDefinition, isMac: boolean): string[] {
  const parts: string[] = [];

  if (shortcut.ctrl) {
    parts.push(isMac ? "⌘" : "Ctrl");
  }
  if (shortcut.shift) {
    parts.push("⇧");
  }

  const displayKey = shortcut.key === "Enter" ? "↵" : shortcut.key.toUpperCase();
  parts.push(displayKey);

  return parts;
}
