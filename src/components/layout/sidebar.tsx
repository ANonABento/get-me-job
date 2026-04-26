"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Home,
  Database,
  Briefcase,
  MessageSquare,
  Settings,
  Menu,
  X,
  Rocket,
  BarChart3,
  Mail,
  Calendar,
  DollarSign,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useLLMStatus } from "@/hooks/useLLMStatus";

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
export const FEATURES = {
  tailorResume: true,   // Tailor Resume
  jobTracker: false,    // Jobs, Calendar, Email Templates
  interview: true,      // Interview Prep
  salary: false,        // Salary Tools
  analytics: true,      // Analytics dashboard
};

export const navigationGroups: NavGroup[] = [
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
      { name: "Document Studio", href: "/studio", icon: Sparkles },
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

export const bottomNavigation: NavItem[] = [
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const llmStatus = useLLMStatus();

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
        className="fixed top-4 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-lg bg-card border shadow-md lg:hidden"
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
                <span className="text-lg font-bold gradient-text">Taida</span>
                <span className="text-2xs text-muted-foreground">怠惰</span>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2.5 text-muted-foreground hover:text-foreground"
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
                      aria-label={collapsed ? item.name : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 min-h-[44px]",
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
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                aria-label={collapsed ? item.name : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 min-h-[44px]",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                <div className="relative shrink-0">
                  <item.icon className="h-5 w-5" />
                  {item.href === "/settings" && (
                    <span
                      className={cn(
                        "absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card",
                        llmStatus.configured
                          ? "bg-emerald-500"
                          : "bg-muted-foreground/40"
                      )}
                      title={
                        llmStatus.configured
                          ? `LLM configured (${llmStatus.provider})`
                          : "LLM not configured"
                      }
                    />
                  )}
                </div>
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
