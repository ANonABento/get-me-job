import { describe, it, expect } from "vitest";
import {
  matchesShortcut,
  isInputTarget,
  formatShortcutKeys,
  type ShortcutDefinition,
  type ShortcutEvent,
} from "./keyboard-shortcuts";

function makeEvent(overrides: Partial<ShortcutEvent> = {}): ShortcutEvent {
  return {
    key: "",
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    ...overrides,
  };
}

describe("matchesShortcut", () => {
  it("matches a simple key shortcut", () => {
    const shortcut: ShortcutDefinition = {
      key: "h",
      description: "Go home",
      category: "navigation",
    };
    expect(matchesShortcut(makeEvent({ key: "h" }), shortcut)).toBe(true);
  });

  it("does not match wrong key", () => {
    const shortcut: ShortcutDefinition = {
      key: "h",
      description: "Go home",
      category: "navigation",
    };
    expect(matchesShortcut(makeEvent({ key: "b" }), shortcut)).toBe(false);
  });

  it("does not match simple key when ctrl is pressed", () => {
    const shortcut: ShortcutDefinition = {
      key: "h",
      description: "Go home",
      category: "navigation",
    };
    expect(matchesShortcut(makeEvent({ key: "h", ctrlKey: true }), shortcut)).toBe(false);
  });

  it("does not match simple key when shift is pressed", () => {
    const shortcut: ShortcutDefinition = {
      key: "h",
      description: "Go home",
      category: "navigation",
    };
    expect(matchesShortcut(makeEvent({ key: "h", shiftKey: true }), shortcut)).toBe(false);
  });

  it("matches ctrl shortcut with ctrlKey", () => {
    const shortcut: ShortcutDefinition = {
      key: "u",
      ctrl: true,
      description: "Upload",
      category: "actions",
    };
    expect(matchesShortcut(makeEvent({ key: "u", ctrlKey: true }), shortcut)).toBe(true);
  });

  it("matches ctrl shortcut with metaKey (Mac Cmd)", () => {
    const shortcut: ShortcutDefinition = {
      key: "u",
      ctrl: true,
      description: "Upload",
      category: "actions",
    };
    expect(matchesShortcut(makeEvent({ key: "u", metaKey: true }), shortcut)).toBe(true);
  });

  it("does not match ctrl shortcut without modifier", () => {
    const shortcut: ShortcutDefinition = {
      key: "u",
      ctrl: true,
      description: "Upload",
      category: "actions",
    };
    expect(matchesShortcut(makeEvent({ key: "u" }), shortcut)).toBe(false);
  });

  it("matches ? shortcut with shift+/", () => {
    const shortcut: ShortcutDefinition = {
      key: "?",
      shift: true,
      description: "Help",
      category: "general",
    };
    expect(
      matchesShortcut(makeEvent({ key: "/", shiftKey: true }), shortcut)
    ).toBe(true);
  });

  it("matches / key for focus search", () => {
    const shortcut: ShortcutDefinition = {
      key: "/",
      description: "Focus search",
      category: "actions",
    };
    expect(matchesShortcut(makeEvent({ key: "/" }), shortcut)).toBe(true);
  });

  it("matches Escape key", () => {
    const shortcut: ShortcutDefinition = {
      key: "Escape",
      description: "Close",
      category: "general",
    };
    expect(matchesShortcut(makeEvent({ key: "Escape" }), shortcut)).toBe(true);
  });

  it("matches ctrl+Enter", () => {
    const shortcut: ShortcutDefinition = {
      key: "Enter",
      ctrl: true,
      description: "Submit",
      category: "actions",
    };
    expect(
      matchesShortcut(makeEvent({ key: "Enter", ctrlKey: true }), shortcut)
    ).toBe(true);
  });

  it("matches ctrl+e with metaKey", () => {
    const shortcut: ShortcutDefinition = {
      key: "e",
      ctrl: true,
      description: "Export",
      category: "actions",
    };
    expect(
      matchesShortcut(makeEvent({ key: "e", metaKey: true }), shortcut)
    ).toBe(true);
  });

  it("is case-insensitive for key matching", () => {
    const shortcut: ShortcutDefinition = {
      key: "b",
      description: "Go to bank",
      category: "navigation",
    };
    // Key matching is case-insensitive (toLowerCase comparison)
    expect(matchesShortcut(makeEvent({ key: "B" }), shortcut)).toBe(true);
    expect(matchesShortcut(makeEvent({ key: "b" }), shortcut)).toBe(true);
  });
});

describe("isInputTarget", () => {
  it("returns true for INPUT elements", () => {
    const el = { tagName: "INPUT", isContentEditable: false } as HTMLElement;
    expect(isInputTarget(el)).toBe(true);
  });

  it("returns true for TEXTAREA elements", () => {
    const el = { tagName: "TEXTAREA", isContentEditable: false } as HTMLElement;
    expect(isInputTarget(el)).toBe(true);
  });

  it("returns true for contentEditable elements", () => {
    const el = { tagName: "DIV", isContentEditable: true } as HTMLElement;
    expect(isInputTarget(el)).toBe(true);
  });

  it("returns false for regular elements", () => {
    const el = { tagName: "DIV", isContentEditable: false } as HTMLElement;
    expect(isInputTarget(el)).toBe(false);
  });

  it("returns false for BUTTON elements", () => {
    const el = { tagName: "BUTTON", isContentEditable: false } as HTMLElement;
    expect(isInputTarget(el)).toBe(false);
  });
});

describe("formatShortcutKeys", () => {
  it("formats simple key", () => {
    const shortcut: ShortcutDefinition = {
      key: "h",
      description: "Home",
      category: "navigation",
    };
    expect(formatShortcutKeys(shortcut, true)).toEqual(["H"]);
    expect(formatShortcutKeys(shortcut, false)).toEqual(["H"]);
  });

  it("formats ctrl shortcut for Mac", () => {
    const shortcut: ShortcutDefinition = {
      key: "u",
      ctrl: true,
      description: "Upload",
      category: "actions",
    };
    expect(formatShortcutKeys(shortcut, true)).toEqual(["⌘", "U"]);
  });

  it("formats ctrl shortcut for Windows", () => {
    const shortcut: ShortcutDefinition = {
      key: "u",
      ctrl: true,
      description: "Upload",
      category: "actions",
    };
    expect(formatShortcutKeys(shortcut, false)).toEqual(["Ctrl", "U"]);
  });

  it("formats shift+key", () => {
    const shortcut: ShortcutDefinition = {
      key: "?",
      shift: true,
      description: "Help",
      category: "general",
    };
    expect(formatShortcutKeys(shortcut, true)).toEqual(["⇧", "?"]);
  });

  it("formats Enter key with arrow symbol", () => {
    const shortcut: ShortcutDefinition = {
      key: "Enter",
      ctrl: true,
      description: "Submit",
      category: "actions",
    };
    expect(formatShortcutKeys(shortcut, true)).toEqual(["⌘", "↵"]);
    expect(formatShortcutKeys(shortcut, false)).toEqual(["Ctrl", "↵"]);
  });

  it("formats Escape key", () => {
    const shortcut: ShortcutDefinition = {
      key: "Escape",
      description: "Close",
      category: "general",
    };
    expect(formatShortcutKeys(shortcut, true)).toEqual(["ESCAPE"]);
  });
});
