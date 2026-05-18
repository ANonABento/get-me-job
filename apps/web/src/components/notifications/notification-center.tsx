"use client";

import { useState, useEffect, useCallback, type KeyboardEvent } from "react";
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
import { useRouter } from "next/navigation";
import type { Notification, NotificationType } from "@/lib/db/notifications";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { useErrorToast } from "@/hooks/use-error-toast";
import { useA11yTranslations } from "@/lib/i18n/use-a11y-translations";

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

function getUndoAction(notification: Notification): {
  opportunityId: string;
  previousStatus: string;
  currentStatus: string;
} | null {
  if (notification.type !== "application_update" || !notification.link) {
    return null;
  }

  const params = new URLSearchParams(notification.link.split("?")[1] ?? "");
  const opportunityId = params.get("id");
  const previousStatus = params.get("undoStatus");
  const currentStatus = params.get("currentStatus");

  if (!opportunityId || !previousStatus || !currentStatus) return null;

  return { opportunityId, previousStatus, currentStatus };
}

function formatSuggestionConfidence(confidence?: number | null): string | null {
  if (confidence === undefined || confidence === null) return null;
  return `${Math.round(confidence * 100)}% confidence`;
}

type NotificationGroupId = "needs_review" | "due_soon" | "updated" | "system";

interface NotificationGroup {
  id: NotificationGroupId;
  title: string;
  notifications: Notification[];
}

const groupLabels: Record<NotificationGroupId, string> = {
  needs_review: "Needs review",
  due_soon: "Due soon / overdue",
  updated: "Updated automatically",
  system: "System",
};

const groupOrder: NotificationGroupId[] = [
  "needs_review",
  "due_soon",
  "updated",
  "system",
];

function notificationSearchText(notification: Notification): string {
  return `${notification.title} ${notification.message ?? ""} ${
    notification.link ?? ""
  }`.toLowerCase();
}

function getNotificationGroup(notification: Notification): NotificationGroupId {
  const searchText = notificationSearchText(notification);

  if (
    notification.type === "system" ||
    /\b(disconnected|failed|missing|quota|billing|api key|sync)\b/.test(
      searchText,
    )
  ) {
    return "system";
  }

  if (
    notification.suggestedStatusUpdate?.state === "pending" ||
    searchText.includes("waiting for review") ||
    searchText.includes("ready to review") ||
    searchText.includes("/opportunities/review")
  ) {
    return "needs_review";
  }

  if (
    notification.type === "reminder_due" ||
    notification.type === "reminder_overdue" ||
    notification.type === "job_deadline"
  ) {
    return "due_soon";
  }

  return "updated";
}

function groupNotifications(
  notifications: Notification[],
): NotificationGroup[] {
  const grouped = new Map<NotificationGroupId, Notification[]>(
    groupOrder.map((id) => [id, []]),
  );

  for (const notification of notifications) {
    grouped.get(getNotificationGroup(notification))?.push(notification);
  }

  return groupOrder.flatMap((id) => {
    const groupItems = grouped.get(id) ?? [];
    return groupItems.length > 0
      ? [{ id, title: groupLabels[id], notifications: groupItems }]
      : [];
  });
}

function getActionLabel(notification: Notification): string {
  const searchText = notificationSearchText(notification);

  if (notification.suggestedStatusUpdate?.state === "pending") {
    return "Open opportunity";
  }

  if (
    searchText.includes("waiting for review") ||
    searchText.includes("ready to review") ||
    searchText.includes("/opportunities/review")
  ) {
    return "Review queue";
  }

  if (
    notification.type === "reminder_due" ||
    notification.type === "reminder_overdue" ||
    notification.type === "job_deadline"
  ) {
    return "Open opportunity";
  }

  if (notification.type === "system") {
    return "Open settings";
  }

  return "Open opportunities";
}

interface NotificationCenterProps {
  collapsed?: boolean;
  variant?: "sidebar" | "appbar";
}

export function NotificationCenter({
  collapsed = false,
  variant = "sidebar",
}: NotificationCenterProps) {
  const a11yT = useA11yTranslations();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasFetchedNotifications, setHasFetchedNotifications] = useState(false);
  const showErrorToast = useErrorToast();
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  const fetchNotifications = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        }
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
        setHasFetchedNotifications(true);
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [showErrorToast],
  );

  // Warm the panel data on mount without changing closed-panel layout.
  useEffect(() => {
    fetchNotifications(false);
  }, [fetchNotifications]);

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
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
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
    const confirmed = await confirm({
      title: "Delete this notification?",
      description: "This permanently removes the notification from your feed.",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;

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

  const handleUndoStatus = async (notification: Notification) => {
    const action = getUndoAction(notification);
    if (!action) return;

    try {
      const response = await fetch(
        `/api/opportunities/${action.opportunityId}/status/undo`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            previousStatus: action.previousStatus,
            currentStatus: action.currentStatus,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Undo failed");
      }

      if (!notification.read) {
        await handleMarkRead(notification.id);
      }
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    } catch (error) {
      showErrorToast(error, {
        title: "Could not undo status update",
        fallbackDescription:
          "The opportunity may have changed since Gmail updated it.",
      });
    }
  };

  const handleSuggestedStatusAction = async (
    notification: Notification,
    action: "acceptSuggestedStatus" | "dismissSuggestedStatus",
  ) => {
    try {
      const response = await fetch(`/api/notifications/${notification.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error("Could not update suggestion");
      }

      const state =
        action === "acceptSuggestedStatus" ? "accepted" : "dismissed";
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                read: true,
                suggestedStatusUpdate: item.suggestedStatusUpdate
                  ? { ...item.suggestedStatusUpdate, state }
                  : item.suggestedStatusUpdate,
              }
            : item,
        ),
      );
      if (!notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      showErrorToast(error, {
        title: "Could not update suggestion",
        fallbackDescription: "Please try again.",
      });
    }
  };

  const handleDeleteRead = async () => {
    const confirmed = await confirm({
      title: "Delete read notifications?",
      description:
        "This permanently removes all notifications that are already marked read.",
      confirmLabel: "Delete read",
    });
    if (!confirmed) return;

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

  const handleToggleOpen = () => {
    const nextOpen = !isOpen;

    if (nextOpen) {
      const needsInitialBody = !hasFetchedNotifications;
      if (needsInitialBody) {
        setLoading(true);
      }
      void fetchNotifications(needsInitialBody);
    }

    setIsOpen(nextOpen);
  };

  const handleOpenNotification = (notification: Notification) => {
    if (!notification.link) return;

    if (!notification.read) {
      void handleMarkRead(notification.id);
    }
    setIsOpen(false);
    router.push(notification.link);
  };

  const handleNotificationKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    notification: Notification,
  ) => {
    if (!notification.link) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    handleOpenNotification(notification);
  };

  const groups = groupNotifications(notifications);
  const unreadLabel = unreadCount === 1 ? "1 unread" : `${unreadCount} unread`;
  const cappedUnreadCount = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        type="button"
        onClick={handleToggleOpen}
        className={cn(
          variant === "appbar"
            ? "relative grid h-9 w-9 place-items-center transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            : "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200",
          variant === "sidebar" && collapsed && "justify-center px-2",
        )}
        style={
          variant === "appbar"
            ? {
                color: "var(--ink-2)",
                border: "1px solid transparent",
                borderRadius: "var(--r-md)",
              }
            : undefined
        }
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <div className="relative">
          <Bell
            className={cn(
              "shrink-0",
              variant === "appbar" ? "h-4 w-4" : "h-5 w-5",
            )}
            aria-hidden="true"
          />
          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute flex items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground",
                variant === "appbar"
                  ? "-right-2 -top-2 h-4 min-w-[1rem]"
                  : "-right-1.5 -top-1.5 h-4 min-w-[1rem]",
              )}
            >
              {cappedUnreadCount}
            </span>
          )}
        </div>
        {variant === "sidebar" && !collapsed && <span>Notifications</span>}

        {/* Tooltip for collapsed state */}
        {variant === "sidebar" && collapsed && (
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
            aria-label={a11yT("notifications")}
            className={cn(
              "absolute z-50 flex max-h-[min(70vh,560px)] w-[min(calc(100vw_-_2rem),420px)] flex-col overflow-hidden rounded-xl border bg-card shadow-xl",
              variant === "appbar"
                ? "right-0 top-full mt-2"
                : collapsed
                  ? "left-full ml-3 bottom-0 mb-0"
                  : "left-0 bottom-full mb-2",
            )}
            style={
              variant === "sidebar" && collapsed
                ? { transform: "translateY(50%)" }
                : undefined
            }
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b p-4">
              <div>
                <h3 className="font-semibold leading-none">Notifications</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {unreadLabel}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                    title={a11yT("markAllAsRead")}
                    aria-label={a11yT("markAllAsRead")}
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                )}
                {notifications.some((n) => n.read) && (
                  <button
                    type="button"
                    onClick={handleDeleteRead}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                    title={a11yT("deleteReadNotifications")}
                    aria-label={a11yT("deleteReadNotifications")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                  aria-label={a11yT("closeNotifications")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notifications list */}
            <div className="min-h-[188px] flex-1 overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div
                  className="min-h-[188px] space-y-3 p-4"
                  aria-label="Loading notifications"
                >
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="space-y-2">
                    <div className="h-14 rounded-lg bg-muted/70" />
                    <div className="h-14 rounded-lg bg-muted/50" />
                    <div className="h-14 rounded-lg bg-muted/40" />
                  </div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex min-h-[188px] flex-col items-center justify-center p-8 text-center text-muted-foreground">
                  <Bell
                    className="mx-auto mb-3 h-8 w-8 opacity-50"
                    aria-hidden="true"
                  />
                  <p className="font-medium text-foreground">
                    No action needed
                  </p>
                  <p className="mt-1 text-sm">
                    Deadlines, imports, and status suggestions will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {groups.map((group) => (
                    <section key={group.id} aria-labelledby={group.id}>
                      <div className="sticky top-0 z-10 border-b bg-card/95 px-4 py-2 backdrop-blur">
                        <h4
                          id={group.id}
                          className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                        >
                          {group.title}
                        </h4>
                      </div>
                      <div className="divide-y">
                        {group.notifications.map((notification) => {
                          const Icon = typeIcons[notification.type] || Bell;
                          const colorClass =
                            typeColors[notification.type] ||
                            "text-muted-foreground";
                          const undoAction = getUndoAction(notification);
                          const suggestion = notification.suggestedStatusUpdate;
                          const suggestionConfidence =
                            formatSuggestionConfidence(suggestion?.confidence);
                          const canOpen = Boolean(notification.link);

                          return (
                            <div
                              key={notification.id}
                              role={canOpen ? "link" : undefined}
                              tabIndex={canOpen ? 0 : undefined}
                              onClick={() =>
                                handleOpenNotification(notification)
                              }
                              onKeyDown={(event) =>
                                handleNotificationKeyDown(event, notification)
                              }
                              className={cn(
                                "p-3 transition-colors",
                                canOpen && "cursor-pointer hover:bg-muted/50",
                                !notification.read && "bg-muted/30",
                              )}
                            >
                              <div className="flex gap-3">
                                <div
                                  className={cn("mt-0.5 shrink-0", colorClass)}
                                >
                                  <Icon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <p
                                      className={cn(
                                        "text-sm leading-5",
                                        !notification.read && "font-medium",
                                      )}
                                    >
                                      {notification.title}
                                    </p>
                                    <div className="flex shrink-0 items-center gap-1">
                                      {!notification.read && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleMarkRead(notification.id);
                                          }}
                                          className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                          title={a11yT("markAsRead")}
                                          aria-label={a11yT("markAsRead")}
                                        >
                                          <Check className="h-3.5 w-3.5" />
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          void handleDelete(notification.id);
                                        }}
                                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                                        title={a11yT("delete")}
                                        aria-label={a11yT("deleteNotification")}
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                  {notification.message && (
                                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                                      {notification.message}
                                    </p>
                                  )}
                                  {suggestion && (
                                    <div className="mt-2 space-y-1 rounded-md border bg-background/60 p-2 text-xs text-muted-foreground">
                                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                        {suggestionConfidence && (
                                          <span>{suggestionConfidence}</span>
                                        )}
                                        {suggestion.reason && (
                                          <span>{suggestion.reason}</span>
                                        )}
                                      </div>
                                      {suggestion.evidence
                                        ?.slice(0, 2)
                                        .map((item, index) => (
                                          <p
                                            key={index}
                                            className="line-clamp-1 italic"
                                          >
                                            {item}
                                          </p>
                                        ))}
                                      {suggestion.state === "pending" && (
                                        <div className="flex items-center gap-2 pt-1">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              void handleSuggestedStatusAction(
                                                notification,
                                                "acceptSuggestedStatus",
                                              );
                                            }}
                                            className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                          >
                                            <Check className="h-3 w-3" />
                                            Accept
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              void handleSuggestedStatusAction(
                                                notification,
                                                "dismissSuggestedStatus",
                                              );
                                            }}
                                            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 font-medium text-foreground transition-colors hover:bg-muted"
                                          >
                                            <X className="h-3 w-3" />
                                            Dismiss
                                          </button>
                                        </div>
                                      )}
                                      {suggestion.state !== "pending" && (
                                        <p className="font-medium capitalize">
                                          {suggestion.state}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                                    <p className="text-xs text-muted-foreground">
                                      {formatRelativeTime(
                                        notification.createdAt,
                                      )}
                                    </p>
                                    {canOpen && (
                                      <span
                                        className="text-xs font-medium text-primary"
                                        aria-hidden="true"
                                      >
                                        {getActionLabel(notification)}
                                      </span>
                                    )}
                                    {undoAction && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          void handleUndoStatus(notification);
                                        }}
                                        className="text-xs font-medium text-primary hover:underline"
                                      >
                                        Undo
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
      {confirmDialog}
    </div>
  );
}
