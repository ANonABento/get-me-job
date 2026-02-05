// Shared types for Columbus extension

// Re-export types from main app (for reference when building standalone)
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

export interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'tool' | 'other';
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  technologies: string[];
  highlights: string[];
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
}

// Extension-specific types
export interface ExtensionProfile extends Profile {
  computed: ComputedProfileFields;
}

export interface ComputedProfileFields {
  firstName?: string;
  lastName?: string;
  currentCompany?: string;
  currentTitle?: string;
  mostRecentSchool?: string;
  mostRecentDegree?: string;
  mostRecentField?: string;
  graduationYear?: string;
  yearsExperience?: number;
  skillsList?: string;
}

// Field detection types
export type FieldType =
  | 'firstName' | 'lastName' | 'fullName'
  | 'email' | 'phone' | 'address'
  | 'city' | 'state' | 'zipCode' | 'country'
  | 'linkedin' | 'github' | 'website' | 'portfolio'
  | 'currentCompany' | 'currentTitle'
  | 'education' | 'degree' | 'school' | 'graduationYear' | 'gpa' | 'fieldOfStudy'
  | 'experience' | 'yearsExperience'
  | 'resume' | 'coverLetter'
  | 'salary' | 'salaryExpectation'
  | 'startDate' | 'availability'
  | 'workAuthorization' | 'sponsorship'
  | 'veteranStatus' | 'disability' | 'gender' | 'ethnicity'
  | 'skills' | 'summary'
  | 'customQuestion'
  | 'unknown';

export interface DetectedField {
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  fieldType: FieldType;
  confidence: number;
  suggestedValue?: string;
  label?: string;
  placeholder?: string;
}

export interface FieldSignals {
  name: string;
  id: string;
  type: string;
  placeholder: string;
  autocomplete: string;
  label: string;
  ariaLabel: string;
  nearbyText: string;
  parentClasses: string[];
}

// Scraper types
export interface ScrapedJob {
  title: string;
  company: string;
  location?: string;
  description: string;
  requirements: string[];
  responsibilities?: string[];
  salary?: string;
  type?: 'full-time' | 'part-time' | 'contract' | 'internship';
  remote?: boolean;
  url: string;
  source: string;
  sourceJobId?: string;
  deadline?: string;
  postedAt?: string;
  keywords?: string[];
}

// Learning types
export interface LearnedAnswer {
  id: string;
  question: string;
  questionNormalized: string;
  answer: string;
  sourceUrl?: string;
  sourceCompany?: string;
  timesUsed: number;
  createdAt: string;
}

export interface SimilarAnswer {
  id: string;
  question: string;
  answer: string;
  similarity: number;
  timesUsed: number;
}

// Message types for background/content communication
export type MessageType =
  | 'GET_PROFILE'
  | 'FILL_FORM'
  | 'SCRAPE_JOB'
  | 'SCRAPE_JOB_LIST'
  | 'IMPORT_JOB'
  | 'IMPORT_JOBS_BATCH'
  | 'SAVE_ANSWER'
  | 'SEARCH_ANSWERS'
  | 'GET_LEARNED_ANSWERS'
  | 'DELETE_ANSWER'
  | 'GET_AUTH_STATUS'
  | 'OPEN_AUTH'
  | 'LOGOUT';

export interface ExtensionMessage<T = unknown> {
  type: MessageType;
  payload?: T;
}

export interface ExtensionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Storage types
export interface ExtensionStorage {
  authToken?: string;
  tokenExpiry?: string;
  apiBaseUrl: string;
  cachedProfile?: ExtensionProfile;
  profileCachedAt?: string;
  settings: ExtensionSettings;
}

export interface ExtensionSettings {
  autoFillEnabled: boolean;
  showConfidenceIndicators: boolean;
  minimumConfidence: number;
  learnFromAnswers: boolean;
  notifyOnJobDetected: boolean;
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  autoFillEnabled: true,
  showConfidenceIndicators: true,
  minimumConfidence: 0.5,
  learnFromAnswers: true,
  notifyOnJobDetected: true,
};

export const DEFAULT_API_BASE_URL = 'http://localhost:3000';
