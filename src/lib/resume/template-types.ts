// Shared resume template type definitions
// Extracted to avoid circular imports between templates.ts and template-analyzer.ts

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  preview?: string;
  styles: TemplateStyles;
}

export interface CoverLetterTemplate {
  id: string;
  name: string;
  description: string;
  preview?: string;
  styles: CoverLetterTemplateStyles;
}

export interface TemplateStyles {
  fontFamily: string;
  fontSize: string;
  headerSize: string;
  sectionHeaderSize: string;
  lineHeight: string;
  accentColor: string;
  layout: "single-column" | "two-column";
  headerStyle: "centered" | "left" | "minimal";
  bulletStyle: "disc" | "dash" | "arrow" | "none";
  sectionDivider: "line" | "space" | "none";
}

export interface CoverLetterTemplateStyles {
  fontFamily: string;
  fontSize: string;
  headerSize: string;
  lineHeight: string;
  accentColor: string;
  layout: "letter";
  headerStyle: "centered" | "left" | "minimal";
  paragraphSpacing: string;
  bodyMaxWidth: string;
  pagePadding: string;
  signatureSpacing: string;
}

export type DocumentTemplate = ResumeTemplate | CoverLetterTemplate;
