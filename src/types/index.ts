// Core profile types for Columbus

export interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface Experience {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  highlights: string[];
  skills: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  highlights: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  technologies: string[];
  highlights: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'tool' | 'other';
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date?: string;
  url?: string;
}

export interface Profile {
  id: string;
  contact: ContactInfo;
  summary?: string;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  rawText?: string;
  createdAt: string;
  updatedAt: string;
}

// Document types
export interface Document {
  id: string;
  filename: string;
  type: 'resume' | 'cover_letter' | 'portfolio' | 'certificate' | 'other';
  mimeType: string;
  size: number;
  path: string;
  extractedText?: string;
  parsedData?: Partial<Profile>;
  uploadedAt: string;
}

// Job application types
export type JobStatus = 'saved' | 'applied' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn';

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  location?: string;
  type?: 'full-time' | 'part-time' | 'contract' | 'internship';
  remote?: boolean;
  salary?: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  keywords: string[];
  url?: string;
  status?: JobStatus;
  appliedAt?: string;
  deadline?: string;
  notes?: string;
  createdAt: string;
}

export interface JobMatch {
  jobId: string;
  profileId: string;
  overallScore: number;
  skillMatches: { skill: string; matched: boolean; relevance: number }[];
  experienceMatches: { experienceId: string; relevance: number }[];
  gaps: string[];
  suggestions: string[];
}

// LLM configuration
export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'ollama' | 'openrouter';
  apiKey?: string;
  baseUrl?: string;
  model: string;
}

// Settings
export interface Settings {
  llm: LLMConfig;
  theme: 'light' | 'dark' | 'system';
}

// Email template types
export type EmailTemplateType =
  | 'follow_up'
  | 'thank_you'
  | 'networking'
  | 'status_inquiry'
  | 'negotiation';

export interface EmailTemplate {
  type: EmailTemplateType;
  subject: string;
  body: string;
  placeholders: string[];
}
