"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import {
  Home,
  User,
  Database,
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
  DollarSign,
  LogIn,
  Upload,
  FileText,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { NotificationCenter } from "@/components/notifications/notification-center";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// Feature flags — set to true to enable sections
const FEATURES = {
  jobTracker: false,    // Jobs, Calendar, Email Templates
  interview: false,     // Interview Prep
  salary: false,        // Salary Tools
  analytics: false,     // Analytics dashboard
};

const navigationGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: Home },
    ],
  },
  {
    label: "Resume",
    items: [
      { name: "Documents", href: "/bank", icon: Database },
      { name: "Resume Builder", href: "/builder", icon: FileText },
      { name: "Tailor Resume", href: "/tailor", icon: Sparkles },
    ],
  },
  ...(FEATURES.jobTracker ? [{
    label: "Job Tracker",
    items: [
      { name: "Jobs", href: "/jobs", icon: Briefcase },
      { name: "Calendar", href: "/calendar", icon: Calendar },
      { name: "Email Templates", href: "/emails", icon: Mail },
    ],
  }] : []),
  ...(FEATURES.interview ? [{
    label: "Interview",
    items: [
      { name: "Interview Prep", href: "/interview", icon: MessageSquare },
    ],
  }] : []),
  ...(FEATURES.salary ? [{
    label: "Negotiation",
    items: [
      { name: "Salary Tools", href: "/salary", icon: DollarSign },
    ],
  }] : []),
  ...(FEATURES.analytics ? [{
    label: "Insights",
    items: [
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  }] : []),
];

const bottomNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
];

function SidebarUserSection({ collapsed }: { collapsed: boolean }) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <Link
        href="/sign-in"
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200",
          collapsed && "justify-center px-2"
        )}
      >
        <LogIn className="h-5 w-5 shrink-0" />
        {!collapsed && <span>Sign In</span>}
      </Link>
    );
  }

  return (
    <>
      <SignedIn>
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5",
            collapsed && "justify-center px-2"
          )}
        >
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">
                Press <kbd className="px-1 py-0.5 rounded bg-muted text-2xs font-mono">?</kbd> for shortcuts
              </p>
            </div>
          )}
        </div>
      </SignedIn>
      <SignedOut>
        <Link
          href="/sign-in"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200",
            collapsed && "justify-center px-2"
          )}
        >
          <LogIn className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sign In</span>}
        </Link>
      </SignedOut>
    </>
  );
}

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
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Main navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r transition-all duration-300 ease-in-out grain",
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
                <span className="text-lg font-bold gradient-text">Get Me Job</span>
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
        <nav className="flex-1 overflow-y-auto p-3">
          {navigationGroups.map((group, groupIndex) => (
            <div key={group.label} className={cn(groupIndex > 0 && (collapsed ? "mt-3 pt-3 border-t border-border/50" : "mt-4"))}>
              {/* Section label - only show when expanded */}
              {!collapsed && (
                <div className="px-3 mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {group.label}
                  </span>
                </div>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
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
                        <div className="absolute left-full ml-2 hidden group-hover:flex items-center z-50">
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
              </div>
            </div>
          ))}
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

        {/* User Profile Footer */}
        <div className="border-t p-3">
          <SidebarUserSection collapsed={collapsed} />
        </div>
      </aside>

      {/* Spacer for main content */}
      <div className={cn(
        "hidden lg:block shrink-0 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )} />
    </>
  );
}
