import { z } from "zod";

export const EMAIL_TEMPLATE_TYPES = [
  "follow_up",
  "thank_you",
  "networking",
  "status_inquiry",
  "negotiation",
] as const;

export type EmailTemplateType = (typeof EMAIL_TEMPLATE_TYPES)[number];

export const emailTemplateTypeSchema = z.enum(EMAIL_TEMPLATE_TYPES);

export const generateEmailSchema = z.object({
  type: emailTemplateTypeSchema,
  jobId: z.string().optional(),
  interviewerName: z.string().max(200).optional(),
  interviewDate: z.string().optional(),
  daysAfter: z.number().int().min(1).max(365).optional(),
  targetCompany: z.string().max(200).optional(),
  connectionName: z.string().max(200).optional(),
  customNote: z.string().max(2000).optional(),
  useLLM: z.boolean().optional().default(true),
});

export type GenerateEmailInput = z.infer<typeof generateEmailSchema>;
