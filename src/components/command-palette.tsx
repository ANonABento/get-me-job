"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Home,
  Database,
  FileText,
  Sparkles,
  PenLine,
  Settings,
  Upload,
  ArrowRight,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  filterCommands,
  getNavigationCommands,
  getActionCommands,
  loadRecentActions,
  saveRecentAction,
  buildRecentCommands,
  type CommandItem,
} from "@/lib/command-palette";

const COMMAND_ICONS: Record<string, LucideIcon> = {
  "nav-dashboard": Home,
  "nav-documents": Database,
<<<<<<< HEAD
  "nav-studio": Sparkles,
=======
  "nav-studio": FileText,
>>>>>>> 0e974c5 (Consolidate document routes into studio)
  "nav-settings": Settings,
  "act-upload": Upload,
  "act-build": FileText,
  "act-cover-letter": PenLine,
  "act-tailor": Sparkles,
};

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const navigationCommands = useMemo(() => getNavigationCommands(), []);
  const actionCommands = useMemo(() => getActionCommands(), []);

  const allBaseCommands = useMemo(
    () => [...navigationCommands, ...actionCommands],
    [navigationCommands, actionCommands]
  );

  const recentCommands = useMemo(() => {
    if (!open) return [];
    const recentIds = loadRecentActions();
    return buildRecentCommands(recentIds, allBaseCommands);
  }, [open, allBaseCommands]);

  const allCommands = useMemo(
    () => [...recentCommands, ...navigationCommands, ...actionCommands],
    [recentCommands, navigationCommands, actionCommands]
  );

  const filteredCommands = useMemo(
    () => filterCommands(allCommands, query),
    [allCommands, query]
  );

  // Group filtered commands by category for display
  const grouped = useMemo(() => {
    const groups: { category: string; label: string; items: CommandItem[] }[] = [];
    const recent = filteredCommands.filter((c) => c.category === "recent");
    const navigate = filteredCommands.filter((c) => c.category === "navigate");
    const actions = filteredCommands.filter((c) => c.category === "actions");

    if (recent.length > 0) groups.push({ category: "recent", label: "Recent", items: recent });
    if (navigate.length > 0) groups.push({ category: "navigate", label: "Navigate", items: navigate });
    if (actions.length > 0) groups.push({ category: "actions", label: "Actions", items: actions });

    return groups;
  }, [filteredCommands]);

  // Flatten for index-based keyboard navigation
  const flatItems = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  const flatItemIndexes = useMemo(() => {
    const map = new Map<CommandItem, number>();
    flatItems.forEach((item, i) => map.set(item, i));
    return map;
  }, [flatItems]);

  // Reset state when opening/closing
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      // Focus input after dialog animation
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Reset selection when filtered results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.querySelector("[data-selected=true]");
    selected?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const executeCommand = useCallback(
    (item: CommandItem) => {
      saveRecentAction(item.id);
      setOpen(false);
      if (item.href) {
        router.push(item.href);
      }
    },
    [router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % Math.max(flatItems.length, 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => (i - 1 + flatItems.length) % Math.max(flatItems.length, 1));
          break;
        case "Enter":
          e.preventDefault();
          if (flatItems[selectedIndex]) {
            executeCommand(flatItems[selectedIndex]);
          }
          break;
      }
    },
    [flatItems, selectedIndex, executeCommand]
  );

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-lg p-0 gap-0 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        <DialogTitle className="sr-only">Command Palette</DialogTitle>

        {/* Search input */}
        <div className="flex items-center border-b px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Search commands"
          />
          <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[300px] overflow-y-auto p-2" role="listbox">
          {flatItems.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.category}>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  {group.label}
                </div>
                {group.items.map((item) => {
                  const globalIndex = flatItemIndexes.get(item) ?? 0;
                  const isSelected = globalIndex === selectedIndex;
                  const Icon = COMMAND_ICONS[item.id] ?? (item.category === "recent" ? Clock : ArrowRight);

                  return (
                    <button
                      key={`${item.category}-${item.id}`}
                      role="option"
                      aria-selected={isSelected}
                      data-selected={isSelected}
                      onClick={() => executeCommand(item)}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        isSelected
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground hover:bg-accent/50"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.shortcut && (
                        <kbd className="ml-auto px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono text-muted-foreground">
                          {item.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-4 py-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-muted font-mono">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-muted font-mono">↵</kbd> select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-muted font-mono">esc</kbd> close
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
