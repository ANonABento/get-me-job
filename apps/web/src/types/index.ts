import type { DocumentType } from "@/lib/constants/documents";
import type { EmailTemplateType } from "@/lib/constants/email";
import type { Profile } from "@slothing/shared/types";

export type { DocumentType };
export type { EmailTemplateType };
export type {
  BankCategory,
  BankEntry,
  Certification,
  ContactInfo,
  Education,
  Experience,
  GroupedBankEntries,
  JobDescription,
  JobMatch,
  JobStatus,
  LLMConfig,
  Opportunity,
  OpportunityStatus,
  Profile,
  Project,
  Skill,
  SourceBbox,
  SourceLinkMetadata,
} from "@slothing/shared/types";
export { BANK_CATEGORIES } from "@slothing/shared/types";

export interface CoverLetterData {
  targetCompany?: string;
  targetPosition?: string;
  reusableParagraphs: string[];
  keySellingPoints: string[];
  tone?: string;
}

export interface PortfolioProjectData {
  name: string;
  description?: string;
  url?: string;
  technologies: string[];
  proofPoints: string[];
  bullets: string[];
}

export interface PortfolioData {
  projects: PortfolioProjectData[];
  links: string[];
  caseStudies: string[];
  technologies: string[];
  proofPoints: string[];
}

export interface CareerNotesProjectData {
  name: string;
  description?: string;
  bullets: string[];
  technologies: string[];
}

export interface CareerNotesData {
  paragraphs: string[];
  bullets: string[];
  achievements: string[];
  projects: CareerNotesProjectData[];
  skills: string[];
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
  | { docType: "portfolio"; data: PortfolioData }
  | { docType: "career_notes"; data: CareerNotesData }
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
  fileHash?: string;
  uploadedAt: string;
}

export interface Settings {
  llm: import("@slothing/shared/types").LLMConfig;
  theme: "light" | "dark" | "system";
  locale?: string;
}

export interface EmailTemplate {
  type: EmailTemplateType;
  subject: string;
  body: string;
  placeholders: string[];
}
