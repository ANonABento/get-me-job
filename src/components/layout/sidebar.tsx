"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import {
  Home,
  Upload,
  User,
  FileText,
  Briefcase,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Rocket,
  BarChart3,
  Sun,
  Moon,
  Monitor,
  Mail,
  Calendar,
} from "lucide-react";
import { NotificationCenter } from "@/components/notifications/notification-center";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "My Profile", href: "/profile", icon: User },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Interview Prep", href: "/interview", icon: MessageSquare },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Email Templates", href: "/emails", icon: Mail },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

const bottomNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-card border shadow-md lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex h-16 items-center border-b",
          collapsed ? "justify-center px-3" : "justify-between px-4"
        )}>
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-bg text-white font-bold text-lg shadow-md">
              <Rocket className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-bold gradient-text">Columbus</span>
                <span className="text-2xs text-muted-foreground">Job Assistant</span>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "gradient-bg text-white shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-white")} />
                {!collapsed && <span>{item.name}</span>}

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-2 hidden group-hover:flex items-center">
                    <div className="bg-popover text-popover-foreground text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg border whitespace-nowrap">
                      {item.name}
                    </div>
                  </div>
                )}

                {/* Active indicator */}
                {isActive && !collapsed && (
                  <div className="absolute right-2 h-2 w-2 rounded-full bg-white/50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom navigation */}
        <div className="border-t p-3 space-y-1">
          {/* Notification Center */}
          <NotificationCenter collapsed={collapsed} />

          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-2 hidden group-hover:flex items-center">
                    <div className="bg-popover text-popover-foreground text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg border whitespace-nowrap">
                      {item.name}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}

          {/* Theme toggle */}
          <button
            onClick={cycleTheme}
            title={`Theme: ${theme} (click to change)`}
            className={cn(
              "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200",
              collapsed && "justify-center px-2"
            )}
          >
            <ThemeIcon className="h-5 w-5 shrink-0" />
            {!collapsed && (
              <span className="capitalize">{theme === "system" ? `System (${resolvedTheme})` : theme}</span>
            )}

            {/* Tooltip for collapsed state */}
            {collapsed && (
              <div className="absolute left-full ml-2 hidden group-hover:flex items-center">
                <div className="bg-popover text-popover-foreground text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg border whitespace-nowrap capitalize">
                  {theme} mode
                </div>
              </div>
            )}
          </button>

          {/* Collapse button - desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "hidden lg:flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200",
              collapsed && "justify-center px-2"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* Footer - only when expanded */}
        {!collapsed && (
          <div className="border-t p-4">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Press <kbd className="px-1.5 py-0.5 rounded bg-muted-foreground/20 text-2xs font-mono">?</kbd> for keyboard shortcuts
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* Spacer for main content */}
      <div className={cn(
        "hidden lg:block shrink-0 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )} />
    </>
  );
}
