import { z } from "zod";

export const REMINDER_TYPES = [
  "follow_up",
  "deadline",
  "interview",
  "custom",
] as const;

export type ReminderType = (typeof REMINDER_TYPES)[number];

export const reminderTypeSchema = z.enum(REMINDER_TYPES);

export const createReminderSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  type: reminderTypeSchema.optional().default("custom"),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().min(1, "Due date is required"),
});

export type CreateReminderInput = z.infer<typeof createReminderSchema>;
