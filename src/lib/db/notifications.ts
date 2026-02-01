import db from "./schema";
import { generateId } from "@/lib/utils";

export type NotificationType =
  | "reminder_due"
  | "reminder_overdue"
  | "application_update"
  | "interview_scheduled"
  | "job_deadline"
  | "system"
  | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

// Create a new notification
export function createNotification(
  notification: Omit<Notification, "id" | "read" | "createdAt">
): Notification {
  const id = generateId();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO notifications (id, type, title, message, link, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    notification.type,
    notification.title,
    notification.message || null,
    notification.link || null,
    now
  );

  return {
    id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    link: notification.link,
    read: false,
    createdAt: now,
  };
}

// Get all notifications
export function getNotifications(options?: {
  unreadOnly?: boolean;
  limit?: number;
}): Notification[] {
  const { unreadOnly = false, limit = 50 } = options || {};

  let query = "SELECT * FROM notifications";

  if (unreadOnly) {
    query += " WHERE read = 0";
  }

  query += " ORDER BY created_at DESC LIMIT ?";

  const stmt = db.prepare(query);
  const rows = stmt.all(limit) as Array<{
    id: string;
    type: string;
    title: string;
    message: string | null;
    link: string | null;
    read: number;
    created_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    type: row.type as NotificationType,
    title: row.title,
    message: row.message || undefined,
    link: row.link || undefined,
    read: Boolean(row.read),
    createdAt: row.created_at,
  }));
}

// Mark notification as read
export function markNotificationRead(id: string): void {
  const stmt = db.prepare("UPDATE notifications SET read = 1 WHERE id = ?");
  stmt.run(id);
}

// Mark all notifications as read
export function markAllNotificationsRead(): void {
  const stmt = db.prepare("UPDATE notifications SET read = 1 WHERE read = 0");
  stmt.run();
}

// Delete a notification
export function deleteNotification(id: string): void {
  const stmt = db.prepare("DELETE FROM notifications WHERE id = ?");
  stmt.run(id);
}

// Delete all read notifications
export function deleteReadNotifications(): void {
  const stmt = db.prepare("DELETE FROM notifications WHERE read = 1");
  stmt.run();
}

// Get unread notification count
export function getUnreadNotificationCount(): number {
  const stmt = db.prepare(
    "SELECT COUNT(*) as count FROM notifications WHERE read = 0"
  );
  const row = stmt.get() as { count: number };
  return row.count;
}

// Create reminder notification
export function createReminderNotification(
  reminderTitle: string,
  jobTitle: string,
  isOverdue: boolean,
  jobId: string
): Notification {
  return createNotification({
    type: isOverdue ? "reminder_overdue" : "reminder_due",
    title: isOverdue ? "Overdue Reminder" : "Reminder Due",
    message: `${reminderTitle} for ${jobTitle}`,
    link: `/jobs?id=${jobId}`,
  });
}

// Create application update notification
export function createApplicationUpdateNotification(
  jobTitle: string,
  newStatus: string,
  jobId: string
): Notification {
  return createNotification({
    type: "application_update",
    title: "Application Status Updated",
    message: `${jobTitle} is now "${newStatus}"`,
    link: `/jobs?id=${jobId}`,
  });
}
