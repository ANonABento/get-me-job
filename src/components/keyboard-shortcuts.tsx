"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Home,
  Upload,
  FileText,
  Settings,
  Keyboard,
  Search,
  Sparkles,
} from "lucide-react";
import {
  matchesShortcut,
  isInputTarget,
  formatShortcutKeys,
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

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);
  // Ref for handleKeyDown — always reads latest shortcuts without stale closure
  const pageShortcutsRef = useRef<Map<string, Shortcut[]>>(new Map());
  // State for rendering — triggers re-render so allShortcuts memo recomputes
  const [pageShortcutsMap, setPageShortcutsMap] = useState<Map<string, Shortcut[]>>(new Map());

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

  const globalShortcuts: Shortcut[] = useMemo(() => [
    // Navigation
    { key: "h", description: "Go to Dashboard", action: () => router.push("/dashboard"), category: "navigation" },
    { key: "b", description: "Go to Documents", action: () => router.push("/bank"), category: "navigation" },
    { key: "t", description: "Go to Tailor Resume", action: () => router.push("/tailor"), category: "navigation" },
    { key: "s", description: "Go to Settings", action: () => router.push("/settings"), category: "navigation" },
    // General
    { key: "?", shift: true, description: "Show keyboard shortcuts", action: () => setShowHelp(true), category: "general" },
    { key: "Escape", description: "Close dialogs", action: () => setShowHelp(false), category: "general" },
  ], [router]);

  const allShortcuts = useMemo(() => {
    const pageShortcuts = Array.from(pageShortcutsMap.values()).flat();
    return [...globalShortcuts, ...pageShortcuts];
  }, [globalShortcuts, pageShortcutsMap]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    const inInput = isInputTarget(target);
    const pageShortcuts = Array.from(pageShortcutsRef.current.values()).flat();

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
  }, [globalShortcuts]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const contextValue = useMemo(() => ({
    showHelp,
    setShowHelp,
    registerShortcuts,
    unregisterShortcuts,
  }), [showHelp, registerShortcuts, unregisterShortcuts]);

  return (
    <KeyboardShortcutsContext.Provider value={contextValue}>
      {children}
      <ShortcutsHelpDialog open={showHelp} onOpenChange={setShowHelp} shortcuts={allShortcuts} />
    </KeyboardShortcutsContext.Provider>
  );
}

export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error("useKeyboardShortcuts must be used within KeyboardShortcutsProvider");
  }
  return context;
}

/**
 * Hook for pages to register their own shortcuts.
 * Shortcuts are automatically cleaned up when the component unmounts.
 */
export function useRegisterShortcuts(id: string, shortcuts: Shortcut[]) {
  const { registerShortcuts, unregisterShortcuts } = useKeyboardShortcuts();
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    registerShortcuts(id, shortcutsRef.current);
    return () => unregisterShortcuts(id);
  }, [id, registerShortcuts, unregisterShortcuts]);
}

// Re-export for convenience
export type { Shortcut };

function ShortcutsHelpDialog({
  open,
  onOpenChange,
  shortcuts,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortcuts: Shortcut[];
}) {
  const navigationShortcuts = shortcuts.filter((s) => s.category === "navigation");
  const actionShortcuts = shortcuts.filter((s) => s.category === "actions");
  const generalShortcuts = shortcuts.filter((s) => s.category === "general");

  const icons: Record<string, React.ElementType> = {
    h: Home,
    b: FileText,
    t: Sparkles,
    s: Settings,
    "/": Search,
    u: Upload,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Navigate faster with keyboard shortcuts across the app.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Navigation */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Navigation</h3>
            <div className="space-y-2">
              {navigationShortcuts.map((shortcut, i) => {
                const Icon = icons[shortcut.key];
                return (
                  <div key={`nav-${shortcut.key}-${i}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                      <span className="text-sm">{shortcut.description}</span>
                    </div>
                    <ShortcutKey shortcut={shortcut} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Page Actions */}
          {actionShortcuts.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Page Actions</h3>
              <div className="space-y-2">
                {actionShortcuts.map((shortcut, i) => {
                  const Icon = icons[shortcut.key];
                  return (
                    <div key={`act-${shortcut.key}-${i}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                        <span className="text-sm">{shortcut.description}</span>
                      </div>
                      <ShortcutKey shortcut={shortcut} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* General */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">General</h3>
            <div className="space-y-2">
              {generalShortcuts.map((shortcut, i) => (
                <div key={`gen-${shortcut.key}-${i}`} className="flex items-center justify-between">
                  <span className="text-sm">{shortcut.description}</span>
                  <ShortcutKey shortcut={shortcut} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t text-center">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">?</kbd> anytime to show this dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShortcutKey({ shortcut }: { shortcut: ShortcutDefinition }) {
  const isMac = typeof window !== "undefined" && navigator.platform.includes("Mac");
  const parts = formatShortcutKeys(shortcut, isMac);

  return (
    <div className="flex items-center gap-1">
      {parts.map((part, i) => (
        <kbd
          key={i}
          className="px-2 py-1 rounded bg-muted text-xs font-mono min-w-[24px] text-center"
        >
          {part}
        </kbd>
      ))}
    </div>
  );
}
