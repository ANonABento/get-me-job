export interface HighlightSegment {
  text: string;
  type: "matched" | "missing" | "plain";
}

/**
 * Split text into segments highlighting matched and missing keywords.
 * Keywords are matched case-insensitively as whole words.
 */
export function highlightKeywords(
  text: string,
  matchedKeywords: string[],
  missingKeywords: string[]
): HighlightSegment[] {
  if ((!matchedKeywords.length && !missingKeywords.length) || !text) {
    return [{ text, type: "plain" }];
  }

  // Build a map of lowercase keyword -> type, matched takes priority
  const keywordMap = new Map<string, "matched" | "missing">();
  for (const kw of missingKeywords) {
    keywordMap.set(kw.toLowerCase(), "missing");
  }
  for (const kw of matchedKeywords) {
    keywordMap.set(kw.toLowerCase(), "matched");
  }

  // Sort keywords by length descending so longer phrases match first
  const allKeywords = Array.from(keywordMap.keys()).sort(
    (a, b) => b.length - a.length
  );

  // Build regex that matches any keyword as whole word (case-insensitive)
  const escaped = allKeywords.map((kw) =>
    kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  if (escaped.length === 0) return [{ text, type: "plain" }];

  const pattern = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");

  const segments: HighlightSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    // Add plain text before match
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), type: "plain" });
    }

    const matchedText = match[0];
    const type = keywordMap.get(matchedText.toLowerCase()) ?? "plain";
    segments.push({ text: matchedText, type });

    lastIndex = pattern.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), type: "plain" });
  }

  return segments;
}
