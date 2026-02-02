import { z } from "zod";

// Contact information schema
export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().max(30, "Phone number is too long").optional().or(z.literal("")),
  location: z.string().max(100, "Location is too long").optional().or(z.literal("")),
  linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  github: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
});

// Experience schema
export const experienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1, "Company name is required"),
  title: z.string().min(1, "Job title is required"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
});

// Education schema
export const educationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
  highlights: z.array(z.string()).default([]),
});

// Skill schema
export const skillSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Skill name is required").max(50, "Skill name is too long"),
  category: z.enum(["technical", "soft", "language", "tool", "other"]).default("technical"),
  proficiency: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
});

// Project schema
export const projectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  technologies: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
});

// Full profile schema
export const profileSchema = z.object({
  id: z.string().optional(),
  contact: contactSchema,
  summary: z.string().max(2000, "Summary is too long").optional(),
  rawText: z.string().optional(),
  experiences: z.array(experienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  skills: z.array(skillSchema).default([]),
  projects: z.array(projectSchema).default([]),
  certifications: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    issuer: z.string().min(1),
    date: z.string().optional(),
    url: z.string().url().optional().or(z.literal("")),
  })).default([]),
});

// Partial profile schema for updates
export const profileUpdateSchema = profileSchema.partial();

// Type exports
export type ContactInput = z.infer<typeof contactSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// Validation helper
export function validateProfile(data: unknown): { success: true; data: ProfileInput } | { success: false; errors: z.ZodError } {
  const result = profileSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function validateProfileUpdate(data: unknown): { success: true; data: ProfileUpdateInput } | { success: false; errors: z.ZodError } {
  const result = profileUpdateSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
