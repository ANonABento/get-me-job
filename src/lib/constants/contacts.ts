import { z } from "zod";

export const CONTACT_FOLLOW_UP_FILTERS = [
  "all",
  "due",
  "upcoming",
  "none",
] as const;

export type ContactFollowUpFilter = (typeof CONTACT_FOLLOW_UP_FILTERS)[number];

export const contactFollowUpFilterSchema = z.enum(CONTACT_FOLLOW_UP_FILTERS);

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

const optionalDate = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && value === date.toISOString().slice(0, 10);
  }, "Enter a valid date")
  .optional();

export const createContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  role: optionalText(200),
  company: optionalText(200),
  email: z.string().trim().email("Enter a valid email").max(320).optional().or(z.literal("")),
  linkedin: z.string().trim().url("Enter a valid LinkedIn URL").max(500).optional().or(z.literal("")),
  lastContacted: optionalDate,
  nextFollowup: optionalDate,
  notes: optionalText(5000),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;

export const updateContactSchema = createContactSchema.partial();

export type UpdateContactInput = z.infer<typeof updateContactSchema>;
