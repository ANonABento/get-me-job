export {
  COVER_LETTER_TEMPLATES,
  getCoverLetterTemplate,
} from "@/lib/resume/template-data";
export type {
  CoverLetterTemplate,
  CoverLetterTemplateStyles,
} from "@/lib/resume/template-data";
export { generateCoverLetterHTML } from "@/lib/resume/pdf";

export interface CoverLetterDocument {
  opening: string;
  body: string;
  closing: string;
}

export function splitCoverLetterParagraphs(content: string): string[] {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

export function createBlankCoverLetterDocument(): CoverLetterDocument {
  return {
    opening: "",
    body: "",
    closing: "",
  };
}

export function coverLetterContentToDocument(
  content: string
): CoverLetterDocument {
  const paragraphs = splitCoverLetterParagraphs(content);

  if (paragraphs.length === 0) {
    return createBlankCoverLetterDocument();
  }

  if (paragraphs.length === 1) {
    return {
      opening: paragraphs[0],
      body: "",
      closing: "",
    };
  }

  if (paragraphs.length === 2) {
    return {
      opening: paragraphs[0],
      body: "",
      closing: paragraphs[1],
    };
  }

  return {
    opening: paragraphs[0],
    body: paragraphs.slice(1, -1).join("\n\n"),
    closing: paragraphs[paragraphs.length - 1],
  };
}

export function composeCoverLetterContent(
  document: CoverLetterDocument
): string {
  return [document.opening, document.body, document.closing]
    .map((section) => section.trim())
    .filter(Boolean)
    .join("\n\n");
}
