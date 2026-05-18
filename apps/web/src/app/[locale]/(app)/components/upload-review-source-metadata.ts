import type { BankEntry, SourceBbox } from "@/types";

export type ReviewSourceState = "located" | "partially located" | "not located";

function firstBboxKey(bboxes: SourceBbox[] | undefined): {
  page: number;
  y: number;
  x: number;
} {
  if (!Array.isArray(bboxes) || bboxes.length === 0) {
    return { page: Infinity, y: Infinity, x: Infinity };
  }

  let page = Infinity;
  let y = Infinity;
  let x = Infinity;
  for (const [bboxPage, x0, y0] of bboxes) {
    if (
      bboxPage < page ||
      (bboxPage === page && (y0 < y || (y0 === y && x0 < x)))
    ) {
      page = bboxPage;
      y = y0;
      x = x0;
    }
  }
  return { page, y, x };
}

export function getReviewPreviewBboxes(
  entry: BankEntry,
  isRoot: boolean,
): SourceBbox[] | undefined {
  if (
    isRoot &&
    Array.isArray(entry.sourceHeaderBbox) &&
    entry.sourceHeaderBbox.length > 0
  ) {
    return entry.sourceHeaderBbox;
  }
  return Array.isArray(entry.sourceBbox) && entry.sourceBbox.length > 0
    ? entry.sourceBbox
    : undefined;
}

export function getReviewSourceState(
  entry: BankEntry,
  isRoot: boolean,
): ReviewSourceState {
  if (getReviewPreviewBboxes(entry, isRoot)?.length) {
    if (
      isRoot &&
      (!Array.isArray(entry.sourceHeaderBbox) ||
        entry.sourceHeaderBbox.length === 0) &&
      Array.isArray(entry.sourceBbox) &&
      entry.sourceBbox.length > 0
    ) {
      return "partially located";
    }
    return "located";
  }
  return "not located";
}

export function compareReviewSourceOrder(a: BankEntry, b: BankEntry): number {
  const aOrder = Number(a.sourceOrder ?? a.content.sourceOrder);
  const bOrder = Number(b.sourceOrder ?? b.content.sourceOrder);
  const aHasOrder = Number.isFinite(aOrder);
  const bHasOrder = Number.isFinite(bOrder);
  if (aHasOrder || bHasOrder) {
    if (!aHasOrder) return 1;
    if (!bHasOrder) return -1;
    if (aOrder !== bOrder) return aOrder - bOrder;
  }

  const aHeader = firstBboxKey(a.sourceHeaderBbox);
  const bHeader = firstBboxKey(b.sourceHeaderBbox);
  if (aHeader.page !== bHeader.page) return aHeader.page - bHeader.page;
  if (aHeader.y !== bHeader.y) return aHeader.y - bHeader.y;
  if (aHeader.x !== bHeader.x) return aHeader.x - bHeader.x;

  const aSource = firstBboxKey(a.sourceBbox);
  const bSource = firstBboxKey(b.sourceBbox);
  if (aSource.page !== bSource.page) return aSource.page - bSource.page;
  if (aSource.y !== bSource.y) return aSource.y - bSource.y;
  if (aSource.x !== bSource.x) return aSource.x - bSource.x;

  const aCreated = Date.parse(a.createdAt);
  const bCreated = Date.parse(b.createdAt);
  if (Number.isFinite(aCreated) && Number.isFinite(bCreated)) {
    const createdDelta = bCreated - aCreated;
    if (createdDelta !== 0) return createdDelta;
  }
  return a.id.localeCompare(b.id);
}
