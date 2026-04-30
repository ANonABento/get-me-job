import { db, notifications, eq, and, desc } from "../index";
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
export async function createNotification(
  userId: string,
  notification: Omit<Notification, "id" | "read" | "createdAt">,
): Promise<Notification> {
  const id = generateId();
  const now = new Date();

  await db.insert(notifications).values({
    id,
    userId,
    type: notification.type,
    title: notification.title,
    message: notification.message ?? null,
    link: notification.link ?? null,
    read: false,
    createdAt: now,
  });

  return {
    id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    link: notification.link,
    read: false,
    createdAt: now.toISOString(),
  };
}

// Get all notifications for a user
export async function getNotifications(
  userId: string,
  options?: { unreadOnly?: boolean; limit?: number },
): Promise<Notification[]> {
  const { unreadOnly = false, limit = 50 } = options ?? {};

  let query;
  if (unreadOnly) {
    query = db
      .select()
      .from(notifications)
      .where(
        and(eq(notifications.userId, userId), eq(notifications.read, false)),
      )
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  } else {
    query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  const rows = await query;

  return rows.map((row) => ({
    id: row.id,
    type: row.type as NotificationType,
    title: row.title,
    message: row.message ?? undefined,
    link: row.link ?? undefined,
    read: row.read ?? false,
    createdAt: row.createdAt?.toISOString() ?? "",
  }));
}

// Mark notification as read
export async function markNotificationRead(
  userId: string,
  notificationId: string,
): Promise<void> {
  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId),
      ),
    );
}

// Mark all notifications as read
export async function markAllNotificationsRead(userId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(eq(notifications.userId, userId), eq(notifications.read, false)),
    );
}

// Delete a notification
export async function deleteNotification(
  userId: string,
  notificationId: string,
): Promise<void> {
  await db
    .delete(notifications)
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId),
      ),
    );
}

// Delete all read notifications
export async function deleteReadNotifications(userId: string): Promise<void> {
  await db
    .delete(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.read, true)));
}

// Get unread notification count
export async function getUnreadNotificationCount(
  userId: string,
): Promise<number> {
  const rows = await db
    .select()
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), eq(notifications.read, false)),
    );

  return rows.length;
}

// Create reminder notification
export async function createReminderNotification(
  userId: string,
  reminderTitle: string,
  jobTitle: string,
  isOverdue: boolean,
  jobId: string,
): Promise<Notification> {
  return createNotification(userId, {
    type: isOverdue ? "reminder_overdue" : "reminder_due",
    title: isOverdue ? "Overdue Reminder" : "Reminder Due",
    message: `${reminderTitle} for ${jobTitle}`,
    link: `/opportunities?id=${jobId}`,
  });
}

// Create application update notification
export async function createApplicationUpdateNotification(
  userId: string,
  jobTitle: string,
  newStatus: string,
  jobId: string,
): Promise<Notification> {
  return createNotification(userId, {
    type: "application_update",
    title: "Application Status Updated",
    message: `${jobTitle} is now "${newStatus}"`,
    link: `/opportunities?id=${jobId}`,
  });
}
