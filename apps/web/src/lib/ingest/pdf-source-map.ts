import {
  extractPdfPositions,
  type PdfPositionItem,
  type PdfPositionDocument,
} from "@/lib/parse/pdf-positions";
import type {
  DocumentSourceMap,
  SourceBbox,
  SourceLine,
  SourceMapPage,
  SourceToken,
} from "./types";

interface PendingLine {
  page: number;
  tokens: PdfPositionItem[];
}

function bboxForItems(items: PdfPositionItem[]): SourceBbox {
  return {
    page: items[0]?.page ?? 1,
    x0: Math.min(...items.map((item) => item.x0)),
    y0: Math.min(...items.map((item) => item.y0)),
    x1: Math.max(...items.map((item) => item.x1)),
    y1: Math.max(...items.map((item) => item.y1)),
  };
}

function bboxForItem(item: PdfPositionItem): SourceBbox {
  return {
    page: item.page,
    x0: item.x0,
    y0: item.y0,
    x1: item.x1,
    y1: item.y1,
  };
}

function lineCenter(line: PendingLine): number {
  const bbox = bboxForItems(line.tokens);
  return (bbox.y0 + bbox.y1) / 2;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function lineBaseline(line: PendingLine): number {
  return median(line.tokens.map((token) => token.y0));
}

function sameVisualLine(line: PendingLine, item: PdfPositionItem): boolean {
  const maxHeight = Math.max(
    item.y1 - item.y0,
    ...line.tokens.map((token) => token.y1 - token.y0),
    8,
  );
  const baselineTolerance = Math.max(3, Math.min(maxHeight * 0.25, 8));
  if (Math.abs(lineBaseline(line) - item.y0) <= baselineTolerance) {
    return true;
  }

  const overlapY0 = Math.max(
    item.y0,
    Math.min(...line.tokens.map((token) => token.y0)),
  );
  const overlapY1 = Math.min(
    item.y1,
    Math.max(...line.tokens.map((token) => token.y1)),
  );
  const overlap = Math.max(0, overlapY1 - overlapY0);
  const itemHeight = Math.max(item.y1 - item.y0, 1);
  return (
    overlap / itemHeight >= 0.7 &&
    Math.abs(lineCenter(line) - (item.y0 + item.y1) / 2) <= maxHeight * 0.45
  );
}

function shouldJoinWithoutLeadingSpace(
  previous: PdfPositionItem,
  current: PdfPositionItem,
): boolean {
  const currentText = current.text.trim();
  const previousText = previous.text.trim();
  if (!currentText || !previousText) return true;
  if (/^[,.;:%)]/.test(currentText)) return true;
  if (/^['’]s\b/i.test(currentText)) return true;
  if (previousText === "(" || previousText.endsWith("(")) return true;
  return current.x0 - previous.x1 <= 1;
}

function sanitizePdfSourceText(text: string): string {
  return text
    .replace(/þÿ/g, "")
    .replace(/\u0000/g, "")
    .replace(/(\d)Í(?=-[A-Za-z]{2,})/g, "$1");
}

function lineText(tokens: PdfPositionItem[]): string {
  return sanitizePdfSourceText(
    tokens.reduce((text, token, index) => {
      const tokenText = token.text.trim();
      if (!tokenText) return text;
      if (index === 0 || !text) return tokenText;
      const previous = tokens[index - 1];
      const gap = token.x0 - previous.x1;
      const prefix =
        gap >= 72 && previous.text.trim() !== "|" && tokenText !== "|"
          ? " | "
          : shouldJoinWithoutLeadingSpace(previous, token)
            ? ""
            : " ";
      return `${text}${prefix}${tokenText}`;
    }, ""),
  );
}

function lineId(page: number, lineIndex: number): string {
  return `p${page}-l${String(lineIndex + 1).padStart(3, "0")}`;
}

function tokenId(lineIdentifier: string, tokenIndex: number): string {
  return `${lineIdentifier}-t${String(tokenIndex + 1).padStart(3, "0")}`;
}

function buildLines(items: PdfPositionItem[]): SourceLine[] {
  const byPage = new Map<number, PdfPositionItem[]>();
  for (const item of items) {
    const pageItems = byPage.get(item.page) ?? [];
    pageItems.push(item);
    byPage.set(item.page, pageItems);
  }

  const lines: SourceLine[] = [];
  for (const [page, pageItems] of [...byPage.entries()].sort(
    ([a], [b]) => a - b,
  )) {
    const pending: PendingLine[] = [];
    const sortedItems = [...pageItems].sort((a, b) => {
      const yDelta = a.y0 - b.y0;
      return Math.abs(yDelta) < 2 ? a.x0 - b.x0 : yDelta;
    });

    for (const item of sortedItems) {
      const currentLine = pending.find((line) => sameVisualLine(line, item));
      if (currentLine) {
        currentLine.tokens.push(item);
      } else {
        pending.push({ page, tokens: [item] });
      }
    }

    pending.sort((a, b) => {
      const yDelta = bboxForItems(a.tokens).y0 - bboxForItems(b.tokens).y0;
      if (Math.abs(yDelta) > 2) return yDelta;
      return bboxForItems(a.tokens).x0 - bboxForItems(b.tokens).x0;
    });

    for (const [lineIndex, pendingLine] of pending.entries()) {
      pendingLine.tokens.sort((a, b) => a.x0 - b.x0);
      const id = lineId(page, lineIndex);
      const tokens: SourceToken[] = pendingLine.tokens.map((token, index) => ({
        id: tokenId(id, index),
        page,
        lineId: id,
        text: token.text.trim(),
        bbox: bboxForItem(token),
      }));
      lines.push({
        id,
        page,
        text: lineText(pendingLine.tokens),
        tokenIds: tokens.map((token) => token.id),
        tokens,
        bbox: bboxForItems(pendingLine.tokens),
      });
    }
  }
  return lines;
}

export async function buildPdfSourceMap(
  buffer: Buffer,
): Promise<DocumentSourceMap> {
  const positions = await extractPdfPositions(buffer, { includeJunk: true });
  return buildPdfSourceMapFromPositions(positions);
}

export function buildPdfSourceMapFromPositions(
  positions: Pick<PdfPositionDocument, "items" | "pageDimensions">,
): DocumentSourceMap {
  const lines = buildLines(positions.items).filter((line) => line.text);
  const pages: SourceMapPage[] = positions.pageDimensions.map((page) => ({
    ...page,
    lineIds: lines
      .filter((line) => line.page === page.page)
      .map((line) => line.id),
  }));

  return {
    pages,
    lines,
    rawText: lines.map((line) => line.text).join("\n"),
  };
}
