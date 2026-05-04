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

const HTML_ENTITY_REPLACEMENTS: Array<[RegExp, string]> = [
  [/&nbsp;/gi, " "],
  [/&amp;/gi, "&"],
  [/&lt;/gi, "<"],
  [/&gt;/gi, ">"],
  [/&quot;/gi, '"'],
  [/&#39;/g, "'"],
];

export function coverLetterHtmlToText(html: string): string {
  if (!html) return "";

  let text = html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<\/p>/gi, "")
    .replace(/<[^>]*>/g, "");

  for (const [pattern, replacement] of HTML_ENTITY_REPLACEMENTS) {
    text = text.replace(pattern, replacement);
  }

  return text
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
