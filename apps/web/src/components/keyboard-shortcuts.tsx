"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { ShortcutsHelpDialog } from "@/components/keyboard-shortcuts-dialog";
import { useOptionalCommandPalette } from "@/components/command-palette/command-palette-provider";
import {
  matchesShortcut,
  isInputTarget,
  type ShortcutDefinition,
} from "@/lib/keyboard-shortcuts";

interface Shortcut extends ShortcutDefinition {
  action: () => void;
}

interface KeyboardShortcutsContextType {
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
  registerShortcuts: (id: string, shortcuts: Shortcut[]) => void;
  unregisterShortcuts: (id: string) => void;
}

const KeyboardShortcutsContext = createContext<
  KeyboardShortcutsContextType | undefined
>(undefined);

export function KeyboardShortcutsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const commandPalette = useOptionalCommandPalette();
  const [showHelp, setShowHelp] = useState(false);
  // Ref for handleKeyDown — always reads latest shortcuts without stale closure
  const pageShortcutsRef = useRef<Map<string, Shortcut[]>>(new Map());
  // State for rendering — triggers re-render so allShortcuts memo recomputes
  const [pageShortcutsMap, setPageShortcutsMap] = useState<
    Map<string, Shortcut[]>
  >(new Map());

  const registerShortcuts = useCallback((id: string, shortcuts: Shortcut[]) => {
    pageShortcutsRef.current.set(id, shortcuts);
    setPageShortcutsMap((prev) => new Map(prev).set(id, shortcuts));
  }, []);

  const unregisterShortcuts = useCallback((id: string) => {
    pageShortcutsRef.current.delete(id);
    setPageShortcutsMap((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const globalShortcuts: Shortcut[] = useMemo(
    () => [
      // Navigation
      {
        key: "h",
        description: "Go to Dashboard",
        action: () => router.push("/dashboard"),
        category: "navigation",
      },
      {
        key: "b",
        description: "Go to Documents",
        action: () => router.push("/components"),
        category: "navigation",
      },
      {
        key: "t",
        description: "Go to Document Studio",
        action: () => router.push("/studio"),
        category: "navigation",
      },
      {
        key: "s",
        description: "Go to Settings",
        action: () => router.push("/settings"),
        category: "navigation",
      },
      // General
      {
        key: "k",
        ctrl: true,
        description: "Open command palette",
        action: () => commandPalette?.toggle(),
        category: "general",
      },
      {
        key: "?",
        shift: true,
        description: "Show keyboard shortcuts",
        action: () => setShowHelp(true),
        category: "general",
      },
      {
        key: "Escape",
        description: "Close dialogs",
        action: () => setShowHelp(false),
        category: "general",
      },
    ],
    [commandPalette, router],
  );

  const allShortcuts = useMemo(() => {
    const pageShortcuts = Array.from(pageShortcutsMap.values()).flat();
    return [...globalShortcuts, ...pageShortcuts];
  }, [globalShortcuts, pageShortcutsMap]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const inInput = isInputTarget(target);
      const pageShortcuts = Array.from(
        pageShortcutsRef.current.values(),
      ).flat();

      // Page shortcuts with ctrl/meta should work even in inputs
      for (const shortcut of pageShortcuts) {
        if (shortcut.ctrl || shortcut.meta) {
          if (matchesShortcut(event, shortcut)) {
            event.preventDefault();
            shortcut.action();
            return;
          }
        }
      }

      // Allow Escape everywhere — fire all Escape handlers
      if (event.key === "Escape") {
        for (const shortcut of [...globalShortcuts, ...pageShortcuts]) {
          if (shortcut.key === "Escape") {
            shortcut.action();
          }
        }
        return;
      }

      // Block non-modifier shortcuts when in input fields
      if (inInput) return;

      // Check page shortcuts first (higher priority), then global
      for (const shortcut of [...pageShortcuts, ...globalShortcuts]) {
        if (matchesShortcut(event, shortcut)) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [globalShortcuts],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const contextValue = useMemo(
    () => ({
      showHelp,
      setShowHelp,
      registerShortcuts,
      unregisterShortcuts,
    }),
    [showHelp, registerShortcuts, unregisterShortcuts],
  );

  return (
    <KeyboardShortcutsContext.Provider value={contextValue}>
      {children}
      <ShortcutsHelpDialog
        open={showHelp}
        onOpenChange={setShowHelp}
        shortcuts={allShortcuts}
      />
    </KeyboardShortcutsContext.Provider>
  );
}

export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error(
      "useKeyboardShortcuts must be used within KeyboardShortcutsProvider",
    );
  }
  return context;
}

/**
 * Hook for pages to register their own shortcuts.
 * Shortcuts are automatically cleaned up when the component unmounts.
 */
export function useRegisterShortcuts(id: string, shortcuts: Shortcut[]) {
  const { registerShortcuts, unregisterShortcuts } = useKeyboardShortcuts();

  useEffect(() => {
    registerShortcuts(id, shortcuts);
    return () => unregisterShortcuts(id);
  }, [id, shortcuts, registerShortcuts, unregisterShortcuts]);
}

// Re-export for convenience
export type { Shortcut };
