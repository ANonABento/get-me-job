import type {
  DocumentSourceMap,
  ResolvedSourceSpan,
  ResolvedSourceSpans,
  SourceQuality,
} from "./types";

function qualityFor(foundCount: number, missingCount: number): SourceQuality {
  if (foundCount === 0) return "missing";
  return missingCount > 0 ? "partial" : "exact";
}

export function resolveSourceSpanIds(
  sourceMap: DocumentSourceMap,
  sourceSpanIds: string[],
): ResolvedSourceSpans {
  const lineById = new Map(sourceMap.lines.map((line) => [line.id, line]));
  const tokenById = new Map(
    sourceMap.lines.flatMap((line) =>
      line.tokens.map(
        (token) =>
          [
            token.id,
            {
              id: token.id,
              page: token.page,
              text: token.text,
              bbox: token.bbox,
              tokenIds: [token.id] as string[],
            },
          ] as const,
      ),
    ),
  );

  const spans: ResolvedSourceSpan[] = [];
  const missingIds: string[] = [];
  const seen = new Set<string>();

  for (const id of sourceSpanIds) {
    if (seen.has(id)) continue;
    seen.add(id);

    const line = lineById.get(id);
    if (line) {
      spans.push({
        id: line.id,
        page: line.page,
        text: line.text,
        bbox: line.bbox,
        tokenIds: line.tokenIds,
      });
      continue;
    }

    const token = tokenById.get(id);
    if (token) {
      spans.push(token);
      continue;
    }

    missingIds.push(id);
  }

  return {
    spans,
    missingIds,
    sourceQuality: qualityFor(spans.length, missingIds.length),
  };
}

export function sourceQualityForSpanIds(
  sourceMap: DocumentSourceMap,
  sourceSpanIds: string[],
): SourceQuality {
  return resolveSourceSpanIds(sourceMap, sourceSpanIds).sourceQuality;
}
