// Core profile types for Taida
import type { DocumentType } from "@/lib/constants/documents";

export type { DocumentType };

export interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  avatarUrl?: string;
  headline?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  workStyle?: string[];
  targetRoles?: string[];
  targetSalaryMin?: string;
  targetSalaryMax?: string;
  targetSalaryCurrency?: string;
  openToRecruiters?: boolean;
  shareContactInfo?: boolean;
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

export interface CoverLetterData {
  targetCompany?: string;
  targetPosition?: string;
  keySellingPoints: string[];
  tone?: string;
}

export interface ReferenceLetterData {
  refereeName?: string;
  relationship?: string;
  keyEndorsements: string[];
}

export interface CertificateData {
  certName?: string;
  issuer?: string;
  date?: string;
  credentialId?: string;
}

export type ParsedDocumentData =
  | { docType: "resume"; data: Partial<Profile> }
  | { docType: "cover_letter"; data: CoverLetterData }
  | { docType: "reference_letter"; data: ReferenceLetterData }
  | { docType: "certificate"; data: CertificateData };

export interface Document {
  id: string;
  filename: string;
  type: DocumentType;
  mimeType: string;
  size: number;
  path: string;
  extractedText?: string;
  parsedData?: ParsedDocumentData;
  uploadedAt: string;
}

// Job application types
export type JobStatus = 'pending' | 'saved' | 'applied' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn' | 'dismissed';

export type { Opportunity, OpportunityStatus } from './opportunity';

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
  linkedResumeId?: string;
  linkedCoverLetterId?: string;
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
  locale?: string;
}

// Profile bank types
export const BANK_CATEGORIES = [
  'experience',
  'skill',
  'project',
  'education',
  'achievement',
  'certification',
  'hackathon',
] as const;

export type BankCategory = (typeof BANK_CATEGORIES)[number];

export interface BankEntry {
  id: string;
  userId: string;
  category: BankCategory;
  content: Record<string, unknown>;
  sourceDocumentId?: string;
  confidenceScore: number;
  createdAt: string;
}

export interface GroupedBankEntries {
  experience: BankEntry[];
  skill: BankEntry[];
  project: BankEntry[];
  education: BankEntry[];
  achievement: BankEntry[];
  certification: BankEntry[];
  hackathon: BankEntry[];
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
