"use client";

import { useState, useEffect, useCallback } from "react";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
  AlertCircle,
  Calendar,
  Briefcase,
  Clock,
  Info,
} from "lucide-react";
import Link from "next/link";
import type { Notification, NotificationType } from "@/lib/db/notifications";
import { useErrorToast } from "@/hooks/use-error-toast";

const typeIcons: Record<NotificationType, typeof Bell> = {
  reminder_due: Clock,
  reminder_overdue: AlertCircle,
  application_update: Briefcase,
  interview_scheduled: Calendar,
  job_deadline: AlertCircle,
  system: Info,
  info: Info,
};

const typeColors: Record<NotificationType, string> = {
  reminder_due: "text-warning",
  reminder_overdue: "text-destructive",
  application_update: "text-info",
  interview_scheduled: "text-primary",
  job_deadline: "text-warning",
  system: "text-muted-foreground",
  info: "text-muted-foreground",
};

interface NotificationCenterProps {
  collapsed?: boolean;
}

export function NotificationCenter({ collapsed = false }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const showErrorToast = useErrorToast();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications?limit=20");
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      showErrorToast(error, {
        title: "Could not load notifications",
        fallbackDescription: "Please try opening notifications again.",
      });
    } finally {
      setLoading(false);
    }
  }, [showErrorToast]);

  // Fetch notifications on mount and when opening
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/notifications?countOnly=true");
        const data = await res.json();
        setUnreadCount(data.count || 0);
      } catch {
        // Ignore polling errors
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markRead" }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      showErrorToast(error, {
        title: "Could not mark notification read",
        fallbackDescription: "Please try again.",
      });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllRead" }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      showErrorToast(error, {
        title: "Could not mark notifications read",
        fallbackDescription: "Please try again.",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      const notification = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (notification && !notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      showErrorToast(error, {
        title: "Could not delete notification",
        fallbackDescription: "Please try again.",
      });
    }
  };

  const handleDeleteRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteRead" }),
      });
      setNotifications((prev) => prev.filter((n) => !n.read));
    } catch (error) {
      showErrorToast(error, {
        title: "Could not clear notifications",
        fallbackDescription: "Please try again.",
      });
    }
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200",
          collapsed && "justify-center px-2"
        )}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <div className="relative">
          <Bell className="h-5 w-5 shrink-0" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        {!collapsed && <span>Notifications</span>}

        {/* Tooltip for collapsed state */}
        {collapsed && (
          <div className="absolute left-full ml-2 hidden group-hover:flex items-center z-50">
            <div className="bg-popover text-popover-foreground text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg border whitespace-nowrap">
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </div>
          </div>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div
            role="dialog"
            aria-label="Notifications"
            className={cn(
              "absolute z-50 w-80 max-h-[70vh] flex flex-col bg-card border rounded-xl shadow-xl",
              collapsed
                ? "left-full ml-3 bottom-0 mb-0"
                : "left-0 bottom-full mb-2"
            )}
            style={collapsed ? { transform: "translateY(50%)" } : undefined}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                    title="Mark all as read"
                    aria-label="Mark all as read"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                )}
                {notifications.some((n) => n.read) && (
                  <button
                    onClick={handleDeleteRead}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                    title="Delete read notifications"
                    aria-label="Delete read notifications"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                  aria-label="Close notifications"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notifications list */}
            <div className="flex-1 overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => {
                    const Icon = typeIcons[notification.type] || Bell;
                    const colorClass = typeColors[notification.type] || "text-muted-foreground";

                    const content = (
                      <div
                        className={cn(
                          "p-3 hover:bg-muted/50 transition-colors",
                          !notification.read && "bg-muted/30"
                        )}
                      >
                        <div className="flex gap-3">
                          <div className={cn("shrink-0 mt-0.5", colorClass)}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className={cn(
                                  "text-sm",
                                  !notification.read && "font-medium"
                                )}
                              >
                                {notification.title}
                              </p>
                              <div className="flex items-center gap-1 shrink-0">
                                {!notification.read && (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleMarkRead(notification.id);
                                    }}
                                    className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors"
                                    title="Mark as read"
                                    aria-label="Mark as read"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDelete(notification.id);
                                  }}
                                  className="p-1 text-muted-foreground hover:text-destructive rounded hover:bg-muted transition-colors"
                                  title="Delete"
                                  aria-label="Delete notification"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                            {notification.message && (
                              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatRelativeTime(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );

                    if (notification.link) {
                      return (
                        <Link
                          key={notification.id}
                          href={notification.link}
                          onClick={() => {
                            if (!notification.read) {
                              handleMarkRead(notification.id);
                            }
                            setIsOpen(false);
                          }}
                        >
                          {content}
                        </Link>
                      );
                    }

                    return <div key={notification.id}>{content}</div>;
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
