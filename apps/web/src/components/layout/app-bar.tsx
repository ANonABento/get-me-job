"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Bell, ChevronDown, Moon, Plus, Search, Sun } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useCommandPalette } from "@/components/command-palette/use-command-palette";
import { useTheme } from "@/components/theme-provider";
import { useProfileSnapshot } from "@/hooks/use-profile-snapshot";
import { cn } from "@/lib/utils";

interface AppBarProps {
  className?: string;
}

export function AppBar({ className }: AppBarProps) {
  const t = useTranslations("nav");
  const { setOpen: setPaletteOpen } = useCommandPalette();
  const { isDark, toggleDark } = useTheme();
  const profile = useProfileSnapshot();

  return (
    <header
      className={cn(
        "app-shell-bar sticky top-0 z-30 flex h-14 flex-shrink-0 items-center gap-4 border-b border-rule bg-page",
        className,
      )}
      style={{
        // Surfaces don't have a Tailwind utility yet — use the static editorial token.
        backgroundColor: "var(--bg)",
        borderColor: "var(--rule)",
      }}
    >
      <Link
        href="/dashboard"
        className="flex w-[212px] flex-shrink-0 items-center gap-2.5 truncate"
        style={{
          fontFamily: "var(--display)",
          fontSize: "18px",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "var(--ink)",
        }}
      >
        <span className="grid h-8 w-8 flex-shrink-0 place-items-center">
          <Image
            src="/brand/slothing-mark.png"
            alt=""
            width={32}
            height={32}
            priority
            className="h-8 w-8"
          />
        </span>
        <span className="truncate">{t("brand")}</span>
      </Link>

      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        aria-label="Open search"
        className="group mx-auto flex h-9 w-full max-w-[520px] flex-1 items-center gap-2.5 px-3 text-left text-sm transition-colors"
        style={{
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

      <div className="flex flex-shrink-0 items-center gap-1.5">
        <button
          type="button"
          className="hidden h-9 items-center gap-1.5 px-3.5 text-[13.5px] font-medium transition-colors md:inline-flex"
          style={{
            backgroundColor: "var(--ink)",
            color: "var(--bg)",
            borderRadius: "var(--r-md)",
          }}
          onClick={() => setPaletteOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <span>New</span>
          <ChevronDown className="h-2.5 w-2.5" aria-hidden="true" />
        </button>

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

        <button
          type="button"
          aria-label="Notifications"
          className="relative grid h-9 w-9 place-items-center transition-colors"
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
          <Bell className="h-4 w-4" aria-hidden="true" />
          <span
            aria-hidden="true"
            className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: "var(--brand)" }}
          />
        </button>

        <Link
          href="/profile"
          className="flex items-center gap-2 py-1 pl-1 pr-2.5 text-[13px] transition-colors"
          style={{
            backgroundColor: "var(--paper)",
            border: "1px solid var(--rule)",
            borderRadius: "var(--r-md)",
            color: "var(--ink)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--rule-strong)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--rule)";
          }}
          aria-label={t("items.profile")}
        >
          <span
            className="relative grid h-7 w-7 place-items-center overflow-hidden font-bold"
            style={{
              borderRadius: "var(--r-sm)",
              backgroundColor: "var(--brand-soft)",
              border: "1px solid var(--rule)",
              color: "var(--brand-dark)",
              fontFamily: "var(--display)",
              fontSize: "13px",
            }}
          >
            {/* Initials live as the underlying layer; the avatar img
                covers them when it loads successfully and self-hides
                on error (e.g. stale seed URL like example.com). */}
            <span aria-hidden="true">{profile.initials}</span>
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : null}
          </span>
          <ChevronDown className="h-2.5 w-2.5" aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
