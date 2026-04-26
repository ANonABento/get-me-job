import type React from "react";
import type { BankCategory } from "@/types";
import {
  Award,
  Briefcase,
  FolderOpen,
  GraduationCap,
  Shield,
  Wrench,
} from "lucide-react";
import type { FieldDef } from "./chunk-card.types";

export const CATEGORY_CONFIG: Record<
  BankCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  experience: { label: "Experience", icon: Briefcase, color: "bg-info/10 text-info" },
  education: { label: "Education", icon: GraduationCap, color: "bg-success/10 text-success" },
  skill: { label: "Skill", icon: Wrench, color: "bg-primary/10 text-primary" },
  project: { label: "Project", icon: FolderOpen, color: "bg-accent/10 text-accent" },
  achievement: { label: "Achievement", icon: Award, color: "bg-warning/10 text-warning" },
  certification: { label: "Certification", icon: Shield, color: "bg-info/10 text-info" },
};

export const CATEGORY_FIELDS: Record<BankCategory, FieldDef[]> = {
  experience: [
    { key: "title", label: "Job Title", type: "text", placeholder: "e.g. Software Engineer" },
    { key: "company", label: "Company", type: "text", placeholder: "e.g. Acme Corp" },
    { key: "location", label: "Location", type: "text", placeholder: "e.g. San Francisco, CA" },
    { key: "startDate", label: "Start Date", type: "text", placeholder: "e.g. 2020-01" },
    { key: "endDate", label: "End Date", type: "text", placeholder: "e.g. 2023-06" },
    { key: "current", label: "Current Position", type: "checkbox" },
    { key: "description", label: "Description", type: "textarea", placeholder: "Brief description of the role" },
    { key: "highlights", label: "Highlights (one per line)", type: "list", placeholder: "Key accomplishments..." },
    { key: "skills", label: "Skills (one per line)", type: "list", placeholder: "React\nTypeScript\nNode.js" },
  ],
  education: [
    { key: "institution", label: "Institution", type: "text", placeholder: "e.g. MIT" },
    { key: "degree", label: "Degree", type: "text", placeholder: "e.g. BS Computer Science" },
    { key: "field", label: "Field of Study", type: "text", placeholder: "e.g. Computer Science" },
    { key: "startDate", label: "Start Date", type: "text", placeholder: "e.g. 2016" },
    { key: "endDate", label: "End Date", type: "text", placeholder: "e.g. 2020" },
    { key: "gpa", label: "GPA", type: "text", placeholder: "e.g. 3.8" },
    { key: "highlights", label: "Highlights (one per line)", type: "list", placeholder: "Dean's list\nResearch assistant" },
  ],
  skill: [
    { key: "name", label: "Skill Name", type: "text", placeholder: "e.g. TypeScript" },
    {
      key: "category",
      label: "Category",
      type: "select",
      options: [
        { value: "technical", label: "Technical" },
        { value: "soft", label: "Soft" },
        { value: "language", label: "Language" },
        { value: "tool", label: "Tool" },
        { value: "other", label: "Other" },
      ],
    },
    {
      key: "proficiency",
      label: "Proficiency",
      type: "select",
      options: [
        { value: "beginner", label: "Beginner" },
        { value: "intermediate", label: "Intermediate" },
        { value: "advanced", label: "Advanced" },
        { value: "expert", label: "Expert" },
      ],
    },
  ],
  project: [
    { key: "name", label: "Project Name", type: "text", placeholder: "e.g. My App" },
    { key: "description", label: "Description", type: "textarea", placeholder: "What does this project do?" },
    { key: "url", label: "URL", type: "text", placeholder: "https://github.com/..." },
    { key: "technologies", label: "Technologies (one per line)", type: "list", placeholder: "React\nNode.js" },
    { key: "highlights", label: "Highlights (one per line)", type: "list", placeholder: "Key features..." },
  ],
  certification: [
    { key: "name", label: "Certification Name", type: "text", placeholder: "e.g. AWS Solutions Architect" },
    { key: "issuer", label: "Issuer", type: "text", placeholder: "e.g. Amazon Web Services" },
    { key: "date", label: "Date", type: "text", placeholder: "e.g. 2023-03" },
    { key: "url", label: "URL", type: "text", placeholder: "https://..." },
  ],
  achievement: [
    { key: "description", label: "Description", type: "textarea", placeholder: "Describe the achievement..." },
  ],
};

export const SKILL_CATEGORY_COLORS: Record<string, string> = {
  technical: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  soft: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  language: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  tool: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  other: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};
