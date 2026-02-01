"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  Home,
  Upload,
  User,
  FileText,
  Briefcase,
  MessageSquare,
  Settings,
  BarChart3,
  Keyboard,
} from "lucide-react";

interface Shortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  description: string;
  action: () => void;
  category: "navigation" | "actions" | "general";
}

interface KeyboardShortcutsContextType {
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);

  const shortcuts: Shortcut[] = useMemo(() => [
    // Navigation
    { key: "h", description: "Go to Dashboard", action: () => router.push("/"), category: "navigation" },
    { key: "u", description: "Go to Upload", action: () => router.push("/upload"), category: "navigation" },
    { key: "p", description: "Go to Profile", action: () => router.push("/profile"), category: "navigation" },
    { key: "d", description: "Go to Documents", action: () => router.push("/documents"), category: "navigation" },
    { key: "j", description: "Go to Jobs", action: () => router.push("/jobs"), category: "navigation" },
    { key: "i", description: "Go to Interview Prep", action: () => router.push("/interview"), category: "navigation" },
    { key: "a", description: "Go to Analytics", action: () => router.push("/analytics"), category: "navigation" },
    { key: "s", description: "Go to Settings", action: () => router.push("/settings"), category: "navigation" },
    // General
    { key: "?", shift: true, description: "Show keyboard shortcuts", action: () => setShowHelp(true), category: "general" },
    { key: "Escape", description: "Close dialogs", action: () => setShowHelp(false), category: "general" },
  ], [router]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      // Still allow Escape in inputs
      if (event.key === "Escape") {
        setShowHelp(false);
      }
      return;
    }

    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey;
      const metaMatch = shortcut.meta ? event.metaKey : true;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase() ||
        (shortcut.key === "?" && event.key === "/" && event.shiftKey);

      if (keyMatch && ctrlMatch && metaMatch && shiftMatch) {
        event.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <KeyboardShortcutsContext.Provider value={{ showHelp, setShowHelp }}>
      {children}
      <ShortcutsHelpDialog open={showHelp} onOpenChange={setShowHelp} shortcuts={shortcuts} />
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
  const generalShortcuts = shortcuts.filter((s) => s.category === "general");

  const icons: Record<string, React.ElementType> = {
    h: Home,
    u: Upload,
    p: User,
    d: FileText,
    j: Briefcase,
    i: MessageSquare,
    a: BarChart3,
    s: Settings,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Navigation */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Navigation</h3>
            <div className="space-y-2">
              {navigationShortcuts.map((shortcut) => {
                const Icon = icons[shortcut.key];
                return (
                  <div key={shortcut.key} className="flex items-center justify-between">
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

          {/* General */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">General</h3>
            <div className="space-y-2">
              {generalShortcuts.map((shortcut) => (
                <div key={shortcut.key} className="flex items-center justify-between">
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

function ShortcutKey({ shortcut }: { shortcut: Shortcut }) {
  const isMac = typeof window !== "undefined" && navigator.platform.includes("Mac");
  const parts: string[] = [];

  if (shortcut.ctrl) {
    parts.push(isMac ? "⌘" : "Ctrl");
  }
  if (shortcut.shift) {
    parts.push("⇧");
  }
  parts.push(shortcut.key.toUpperCase());

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
