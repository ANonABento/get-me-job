export interface SourceBbox {
  page: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface SourceToken {
  id: string;
  page: number;
  lineId: string;
  text: string;
  bbox: SourceBbox;
}

export interface SourceLine {
  id: string;
  page: number;
  text: string;
  tokenIds: string[];
  tokens: SourceToken[];
  bbox: SourceBbox;
}

export interface SourceMapPage {
  page: number;
  width: number;
  height: number;
  lineIds: string[];
}

export interface DocumentSourceMap {
  pages: SourceMapPage[];
  lines: SourceLine[];
  rawText: string;
}

export interface SourceGroundedText {
  text: string;
  sourceSpanIds: string[];
}

export interface ParsedContactV2 {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  confidence: number;
  sourceSpanIds: string[];
}

export interface ParsedExperienceV2 {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  highlights: SourceGroundedText[];
  skills: string[];
  sourceSpanIds: string[];
}

export interface ParsedEducationV2 {
  id: string;
  institution: string;
  location?: string;
  degree: string;
  field: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  highlights: SourceGroundedText[];
  sourceSpanIds: string[];
}

export interface ParsedSkillV2 {
  id: string;
  name: string;
  category: "technical" | "soft" | "language" | "tool" | "other";
  sourceSpanIds: string[];
}

export interface ParsedProjectV2 {
  id: string;
  name: string;
  description: string;
  url?: string;
  technologies: string[];
  highlights: SourceGroundedText[];
  startDate?: string;
  endDate?: string;
  sourceSpanIds: string[];
}

export interface ParsedResumeV2Profile {
  contact: ParsedContactV2;
  summary?: SourceGroundedText;
  experiences: ParsedExperienceV2[];
  education: ParsedEducationV2[];
  skills: ParsedSkillV2[];
  projects: ParsedProjectV2[];
  rawText: string;
}

export interface ParsedResumeV2Result {
  profile: ParsedResumeV2Profile;
  sectionsDetected: string[];
  confidence: number;
  rawText: string;
  warnings: string[];
}
