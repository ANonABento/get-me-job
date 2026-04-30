import { splitCoverLetterParagraphs } from "@/lib/builder/cover-letter-document";
import type { TipTapJSONContent } from "./types";

function paragraphFromText(text: string): TipTapJSONContent {
  const lines = text.split("\n");
  const content = lines.flatMap((line, index): TipTapJSONContent[] => {
    const nodes: TipTapJSONContent[] = [];
    if (index > 0) nodes.push({ type: "hardBreak" });
    if (line) nodes.push({ type: "text", text: line });
    return nodes;
  });

  return content.length > 0
    ? { type: "paragraph", content }
    : { type: "paragraph" };
}

export function createBlankCoverLetterTipTapDocument(): TipTapJSONContent {
  return {
    type: "doc",
    content: [{ type: "paragraph" }],
  };
}

export function isBlankCoverLetterTipTapDocument(
  content: TipTapJSONContent | undefined,
): boolean {
  if (!content?.content || content.content.length === 0) return true;

  function hasVisibleText(node: TipTapJSONContent): boolean {
    if (typeof node.text === "string" && node.text.trim()) return true;
    return Array.isArray(node.content) && node.content.some(hasVisibleText);
  }

  return !content.content.some(hasVisibleText);
}

export function coverLetterTextToTipTapDocument(
  text: string,
): TipTapJSONContent {
  const paragraphs = splitCoverLetterParagraphs(text);

  if (paragraphs.length === 0) {
    return createBlankCoverLetterTipTapDocument();
  }

  return {
    type: "doc",
    content: paragraphs.map(paragraphFromText),
  };
}
