import { z } from "zod";

export const SKILL_CATEGORIES = [
  "technical",
  "soft",
  "language",
  "tool",
  "other",
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export const skillCategorySchema = z.enum(SKILL_CATEGORIES);

export const PROFICIENCY_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
] as const;

export type ProficiencyLevel = (typeof PROFICIENCY_LEVELS)[number];

export const proficiencySchema = z.enum(PROFICIENCY_LEVELS);

export const contactInfoSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(50).optional(),
  location: z.string().max(200).optional(),
  linkedin: z.string().url().optional().or(z.literal("")),
  github: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
});

export const experienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1).max(200),
  title: z.string().min(1).max(200),
  location: z.string().max(200).optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string().max(5000),
  highlights: z.array(z.string()),
  skills: z.array(z.string()),
});

export const educationSchema = z.object({
  id: z.string(),
  institution: z.string().min(1).max(200),
  degree: z.string().min(1).max(200),
  field: z.string().max(200),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  gpa: z.string().max(20).optional(),
  highlights: z.array(z.string()),
});

export const skillSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  category: skillCategorySchema,
  proficiency: proficiencySchema.optional(),
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000),
  url: z.string().url().optional().or(z.literal("")),
  technologies: z.array(z.string()),
  highlights: z.array(z.string()),
});

export const certificationSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  issuer: z.string().min(1).max(200),
  date: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
});

export const updateProfileSchema = z.object({
  contact: contactInfoSchema.optional(),
  summary: z.string().max(5000).optional(),
  experiences: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  skills: z.array(skillSchema).optional(),
  projects: z.array(projectSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  rawText: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
