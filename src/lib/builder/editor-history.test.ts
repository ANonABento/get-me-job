import { describe, expect, it } from "vitest";
import {
  canRedoEditorHistory,
  canUndoEditorHistory,
  createEditorHistory,
  pushEditorHistory,
  redoEditorHistory,
  undoEditorHistory,
} from "./editor-history";

describe("editor history", () => {
  it("creates history with the initial present state", () => {
    const history = createEditorHistory("first");

    expect(history).toEqual({ past: [], present: "first", future: [] });
    expect(canUndoEditorHistory(history)).toBe(false);
    expect(canRedoEditorHistory(history)).toBe(false);
  });

  it("pushes new states and clears redo history", () => {
    const first = createEditorHistory("first");
    const second = pushEditorHistory(first, "second");
    const undone = undoEditorHistory(second);
    const third = pushEditorHistory(undone, "third");

    expect(third).toEqual({
      past: ["first"],
      present: "third",
      future: [],
    });
  });

  it("undoes and redoes states", () => {
    const history = pushEditorHistory(
      pushEditorHistory(createEditorHistory("first"), "second"),
      "third"
    );

    const undone = undoEditorHistory(history);
    expect(undone.present).toBe("second");
    expect(canRedoEditorHistory(undone)).toBe(true);

    const redone = redoEditorHistory(undone);
    expect(redone.present).toBe("third");
    expect(canUndoEditorHistory(redone)).toBe(true);
  });

  it("returns the same history when undo or redo is unavailable", () => {
    const history = createEditorHistory("first");

    expect(undoEditorHistory(history)).toBe(history);
    expect(redoEditorHistory(history)).toBe(history);
  });

  it("respects max depth", () => {
    const history = pushEditorHistory(
      pushEditorHistory(pushEditorHistory(createEditorHistory(1), 2, 2), 3, 2),
      4,
      2
    );

    expect(history.past).toEqual([2, 3]);
  });
});
