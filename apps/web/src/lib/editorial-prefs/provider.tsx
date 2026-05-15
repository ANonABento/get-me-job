"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_EDITORIAL_PREFS,
  EDITORIAL_PREFS_STORAGE_KEY,
  parseEditorialPrefs,
  type EditorialPrefs,
} from "./types";

interface EditorialPrefsContextValue {
  prefs: EditorialPrefs;
  setPref: <K extends keyof EditorialPrefs>(
    key: K,
    value: EditorialPrefs[K],
  ) => void;
  resetPrefs: () => void;
}

const EditorialPrefsContext = createContext<EditorialPrefsContextValue | null>(
  null,
);

function readStoredPrefs(): EditorialPrefs {
  try {
    const raw = localStorage.getItem(EDITORIAL_PREFS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_EDITORIAL_PREFS };
    return parseEditorialPrefs(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_EDITORIAL_PREFS };
  }
}

function applyToDocument(prefs: EditorialPrefs) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-accent", prefs.accent);
  root.setAttribute("data-display", prefs.display);
  root.setAttribute("data-radius", prefs.radius);
  root.setAttribute("data-density", prefs.density);
  root.setAttribute("data-ink", prefs.ink);
}

function persist(prefs: EditorialPrefs) {
  try {
    localStorage.setItem(EDITORIAL_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage blocked — keep in memory only.
  }
}

export function EditorialPrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<EditorialPrefs>(DEFAULT_EDITORIAL_PREFS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = readStoredPrefs();
    setPrefs(stored);
    applyToDocument(stored);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyToDocument(prefs);
    persist(prefs);
  }, [mounted, prefs]);

  useEffect(() => {
    if (!mounted) return;
    const handler = (event: StorageEvent) => {
      if (event.key !== EDITORIAL_PREFS_STORAGE_KEY) return;
      setPrefs(readStoredPrefs());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [mounted]);

  const setPref = useCallback(
    <K extends keyof EditorialPrefs>(key: K, value: EditorialPrefs[K]) => {
      setPrefs((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetPrefs = useCallback(() => {
    setPrefs({ ...DEFAULT_EDITORIAL_PREFS });
  }, []);

  const value = useMemo<EditorialPrefsContextValue>(
    () => ({ prefs, setPref, resetPrefs }),
    [prefs, setPref, resetPrefs],
  );

  return (
    <EditorialPrefsContext.Provider value={value}>
      {children}
    </EditorialPrefsContext.Provider>
  );
}

export function useEditorialPrefs(): EditorialPrefsContextValue {
  const ctx = useContext(EditorialPrefsContext);
  if (!ctx) {
    throw new Error(
      "useEditorialPrefs must be used inside <EditorialPrefsProvider>",
    );
  }
  return ctx;
}
