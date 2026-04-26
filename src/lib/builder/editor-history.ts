export interface EditorHistory<T> {
  past: T[];
  present: T;
  future: T[];
}

export function createEditorHistory<T>(present: T): EditorHistory<T> {
  return {
    past: [],
    present,
    future: [],
  };
}

export function pushEditorHistory<T>(
  history: EditorHistory<T>,
  next: T,
  maxDepth = 100
): EditorHistory<T> {
  if (Object.is(history.present, next)) {
    return history;
  }

  return {
    past: [...history.past, history.present].slice(-maxDepth),
    present: next,
    future: [],
  };
}

export function undoEditorHistory<T>(
  history: EditorHistory<T>
): EditorHistory<T> {
  const previous = history.past.at(-1);
  if (previous === undefined) {
    return history;
  }

  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  };
}

export function redoEditorHistory<T>(
  history: EditorHistory<T>
): EditorHistory<T> {
  const next = history.future[0];
  if (next === undefined) {
    return history;
  }

  return {
    past: [...history.past, history.present],
    present: next,
    future: history.future.slice(1),
  };
}

export function canUndoEditorHistory<T>(history: EditorHistory<T>): boolean {
  return history.past.length > 0;
}

export function canRedoEditorHistory<T>(history: EditorHistory<T>): boolean {
  return history.future.length > 0;
}
