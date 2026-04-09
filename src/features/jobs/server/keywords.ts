import { TECH_KEYWORDS } from "@/features/jobs/schemas";

export function extractKeywordsBasic(text: string): string[] {
  const lowerText = text.toLowerCase();
  const matchedRanges: Array<{ start: number; end: number }> = [];
  const matches: string[] = [];

  const sortedKeywords = [...TECH_KEYWORDS].sort((left, right) => right.length - left.length);

  for (const keyword of sortedKeywords) {
    let startIndex = lowerText.indexOf(keyword);

    while (startIndex !== -1) {
      const endIndex = startIndex + keyword.length;
      const isNestedMatch = matchedRanges.some(
        (range) => startIndex >= range.start && endIndex <= range.end
      );

      if (!isNestedMatch) {
        matchedRanges.push({ start: startIndex, end: endIndex });
        matches.push(keyword);
        break;
      }

      startIndex = lowerText.indexOf(keyword, startIndex + 1);
    }
  }

  return TECH_KEYWORDS.filter((keyword) => matches.includes(keyword));
}
