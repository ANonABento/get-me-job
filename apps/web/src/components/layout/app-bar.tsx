"use client";

import { useMemo } from "react";
import { ChevronUp, Moon, Search, Sun } from "lucide-react";
import { useCommandPalette } from "@/components/command-palette/use-command-palette";
import { LocaleSwitcherCompact } from "@/components/i18n/locale-switcher";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { useTheme } from "@/components/theme-provider";
import { useRegisterShortcuts } from "@/components/keyboard-shortcuts";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useOptionalChrome } from "./chrome-provider";

interface AppBarProps {
  className?: string;
}

export function AppBar({ className }: AppBarProps) {
  const { setOpen: setPaletteOpen } = useCommandPalette();
  const { isDark, toggleDark } = useTheme();
  const chrome = useOptionalChrome();
  const appbarHidden = chrome?.appbarHidden ?? false;

  // Keep Cmd/Ctrl+Shift+B registered regardless of visibility so the
  // user can always bring the bar back from the keyboard.
  useRegisterShortcuts(
    "appbar-toggle",
    useMemo(
      () =>
        chrome
          ? [
              {
                key: "b",
                ctrl: true,
                shift: true,
                description: "Toggle top bar",
                category: "general" as const,
                action: chrome.toggleAppbar,
              },
            ]
          : [],
      [chrome],
    ),
  );

  if (appbarHidden) {
    // Hidden mode — the AppBar fully unmounts. The restore affordance
    // lives in the sidebar header (next to the logo) instead of a
    // floating top-right button, so the chrome stays anchored to the
    // sidebar. Keyboard shortcut (Ctrl/Cmd+Shift+B) is still live.
    return null;
  }

  return (
    <header
      className={cn(
        "app-shell-bar sticky top-0 z-30 flex h-14 flex-shrink-0 items-center gap-4 border-b border-rule bg-page px-4",
        className,
      )}
      style={{
        // Surfaces don't have a Tailwind utility yet — use the static editorial token.
        backgroundColor: "var(--bg)",
        borderColor: "var(--rule)",
      }}
    >
      {/* Brand / logo migrated to the sidebar header so the AppBar can
          fully hide without losing the visual anchor.

          The search is `position: fixed` and pinned to the viewport
          center (left-1/2 -translate-x-1/2) rather than centered inside
          the AppBar's flex container, so it sits at the optical center
          of the screen regardless of sidebar width / rail-mode state.
          Right cluster stays in the AppBar's normal flex flow and floats
          right via `ml-auto`. */}
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        aria-label="Open search"
        className="group fixed left-1/2 top-2.5 z-40 flex h-9 -translate-x-1/2 items-center gap-2.5 px-3 text-left text-sm transition-colors"
        style={{
          width: "min(520px, calc(100vw - 480px))",
          backgroundColor: "var(--paper)",
          border: "1px solid var(--rule)",
          borderRadius: "var(--r-md)",
          color: "var(--ink-3)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--rule-strong)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--rule)";
        }}
      >
        <Search className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        <span className="flex-1 truncate">
          Search jobs, notes, or components…
        </span>
        <span
          className="ml-auto hidden font-mono text-[10px] uppercase tracking-wider sm:inline-block"
          style={{
            color: "var(--ink-3)",
            border: "1px solid var(--rule)",
            borderRadius: "var(--r-sm)",
            padding: "1px 6px",
          }}
        >
          ⌘ K
        </span>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          onClick={toggleDark}
          className="grid h-9 w-9 place-items-center transition-colors"
          style={{
            color: "var(--ink-2)",
            border: "1px solid transparent",
            borderRadius: "var(--r-md)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--rule)";
            e.currentTarget.style.backgroundColor = "var(--paper)";
            e.currentTarget.style.color = "var(--ink)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "transparent";
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--ink-2)";
          }}
        >
          {isDark ? (
            <Moon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Sun className="h-4 w-4" aria-hidden="true" />
          )}
        </button>

        <LocaleSwitcherCompact className="[&_button]:h-9" />

        <NotificationCenter variant="appbar" />

        {/* Profile chip removed — the sidebar's bottom-nav profile row
            is the single source of truth. It persists even when the
            top bar is hidden, so the AppBar no longer duplicates it. */}

        {chrome ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={chrome.toggleAppbar}
                aria-label="Hide top bar"
                data-testid="appbar-hide-toggle"
                className="grid h-9 w-9 place-items-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronUp className="h-4 w-4" aria-hidden />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Hide top bar (Ctrl/Cmd+Shift+B)
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
    </header>
  );
}
