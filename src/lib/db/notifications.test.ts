import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

// Mock the database module
vi.mock("./schema", () => {
  const mockDb = {
    prepare: vi.fn(),
  };
  return { default: mockDb };
});

// Mock utils to control ID generation
vi.mock("@/lib/utils", () => ({
  generateId: () => "test-notification-id",
}));

import db from "./schema";
import {
  createNotification,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteReadNotifications,
  getUnreadNotificationCount,
  createReminderNotification,
  createApplicationUpdateNotification,
} from "./notifications";

describe("Notification Database Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createNotification", () => {
    it("should create a notification and return it", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const result = createNotification({
        type: "info",
        title: "Test Notification",
        message: "This is a test",
        link: "/test",
      });

      expect(db.prepare).toHaveBeenCalled();
      expect(mockRun).toHaveBeenCalledWith(
        "test-notification-id",
        "info",
        "Test Notification",
        "This is a test",
        "/test",
        expect.any(String),
        "default",
      );
      expect(result.id).toBe("test-notification-id");
      expect(result.type).toBe("info");
      expect(result.title).toBe("Test Notification");
      expect(result.read).toBe(false);
    });

    it("should handle optional message and link", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const result = createNotification({
        type: "system",
        title: "System Alert",
      });

      expect(mockRun).toHaveBeenCalledWith(
        "test-notification-id",
        "system",
        "System Alert",
        null,
        null,
        expect.any(String),
        "default",
      );
      expect(result.message).toBeUndefined();
      expect(result.link).toBeUndefined();
    });
  });

  describe("getNotifications", () => {
    it("should return all notifications ordered by created_at DESC", () => {
      const mockRows = [
        {
          id: "notif-1",
          type: "info",
          title: "First Notification",
          message: "Message 1",
          link: "/link1",
          read: 0,
          created_at: "2024-01-15T00:00:00.000Z",
        },
        {
          id: "notif-2",
          type: "reminder_due",
          title: "Second Notification",
          message: null,
          link: null,
          read: 1,
          created_at: "2024-01-14T00:00:00.000Z",
        },
      ];

      const mockAll = vi.fn().mockReturnValue(mockRows);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      const result = getNotifications();

      expect(db.prepare).toHaveBeenCalledWith(
        "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
      );
      expect(mockAll).toHaveBeenCalledWith("default", 50);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("notif-1");
      expect(result[0].read).toBe(false);
      expect(result[1].read).toBe(true);
      expect(result[1].message).toBeUndefined();
      expect(result[1].link).toBeUndefined();
    });

    it("should filter unread only when specified", () => {
      const mockAll = vi.fn().mockReturnValue([]);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      getNotifications({ unreadOnly: true });

      expect(db.prepare).toHaveBeenCalledWith(
        "SELECT * FROM notifications WHERE user_id = ? AND read = 0 ORDER BY created_at DESC LIMIT ?",
      );
    });

    it("should respect limit parameter", () => {
      const mockAll = vi.fn().mockReturnValue([]);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      getNotifications({ limit: 10 });

      expect(mockAll).toHaveBeenCalledWith("default", 10);
    });

    it("should use default limit of 50", () => {
      const mockAll = vi.fn().mockReturnValue([]);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      getNotifications();

      expect(mockAll).toHaveBeenCalledWith("default", 50);
    });
  });

  describe("markNotificationRead", () => {
    it("should mark a single notification as read", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      markNotificationRead("notif-1");

      expect(db.prepare).toHaveBeenCalledWith(
        "UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?",
      );
      expect(mockRun).toHaveBeenCalledWith("notif-1", "default");
    });
  });

  describe("markAllNotificationsRead", () => {
    it("should mark all unread notifications as read", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      markAllNotificationsRead();

      expect(db.prepare).toHaveBeenCalledWith(
        "UPDATE notifications SET read = 1 WHERE read = 0 AND user_id = ?",
      );
      expect(mockRun).toHaveBeenCalledWith("default");
    });
  });

  describe("deleteNotification", () => {
    it("should delete a notification by id", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      deleteNotification("notif-1");

      expect(db.prepare).toHaveBeenCalledWith(
        "DELETE FROM notifications WHERE id = ? AND user_id = ?",
      );
      expect(mockRun).toHaveBeenCalledWith("notif-1", "default");
    });
  });

  describe("deleteReadNotifications", () => {
    it("should delete all read notifications", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      deleteReadNotifications();

      expect(db.prepare).toHaveBeenCalledWith(
        "DELETE FROM notifications WHERE read = 1 AND user_id = ?",
      );
      expect(mockRun).toHaveBeenCalledWith("default");
    });
  });

  describe("getUnreadNotificationCount", () => {
    it("should return count of unread notifications", () => {
      const mockGet = vi.fn().mockReturnValue({ count: 5 });
      (db.prepare as Mock).mockReturnValue({ get: mockGet });

      const result = getUnreadNotificationCount();

      expect(db.prepare).toHaveBeenCalledWith(
        "SELECT COUNT(*) as count FROM notifications WHERE read = 0 AND user_id = ?",
      );
      expect(mockGet).toHaveBeenCalledWith("default");
      expect(result).toBe(5);
    });

    it("should return 0 when no unread notifications", () => {
      const mockGet = vi.fn().mockReturnValue({ count: 0 });
      (db.prepare as Mock).mockReturnValue({ get: mockGet });

      const result = getUnreadNotificationCount();

      expect(mockGet).toHaveBeenCalledWith("default");
      expect(result).toBe(0);
    });
  });

  describe("createReminderNotification", () => {
    it("should create a due reminder notification", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const result = createReminderNotification(
        "Follow up",
        "Software Engineer",
        false,
        "job-123",
      );

      expect(result.type).toBe("reminder_due");
      expect(result.title).toBe("Reminder Due");
      expect(result.message).toBe("Follow up for Software Engineer");
      expect(result.link).toBe("/opportunities?id=job-123");
    });

    it("should create an overdue reminder notification", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const result = createReminderNotification(
        "Submit application",
        "Data Analyst",
        true,
        "job-456",
      );

      expect(result.type).toBe("reminder_overdue");
      expect(result.title).toBe("Overdue Reminder");
    });
  });

  describe("createApplicationUpdateNotification", () => {
    it("should create an application update notification", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const result = createApplicationUpdateNotification(
        "Frontend Developer",
        "interviewing",
        "job-789",
      );

      expect(result.type).toBe("application_update");
      expect(result.title).toBe("Application Status Updated");
      expect(result.message).toBe('Frontend Developer is now "interviewing"');
      expect(result.link).toBe("/opportunities?id=job-789");
    });
  });
});
