/**
 * @route GET /api/bank/documents/[id]/match-report
 * @description Per-entry match diagnostics for a parsed document. For
 *   each bank entry that came from this document, returns which needle
 *   variant (if any) hit, the per-tier attempt scores, and the
 *   resulting bboxes. Used to debug missing preview highlights without
 *   tailing the dev server.
 *
 *   Dev-only: gated behind `NODE_ENV !== 'production'` to avoid leaking
 *   match internals (and the cached PDF position stream) as a side
 *   channel in deployed environments.
 *
 * @auth Required. Caller must own the document (per-user PDF cache
 *   enforces this implicitly — a different user's documentId returns
 *   no cached bytes).
 */
import { NextRequest, NextResponse } from "next/server";

import { requireAuth, isAuthError } from "@/lib/auth";
import { listBankEntriesPaginated } from "@/lib/db/profile-bank";
import { getCachedPdfBytes } from "@/lib/parse/pdf-cache";
import {
  deriveSearchNeedles,
  extractPdfPositions,
  findPositionsWithDiagnostic,
  type MatchDiagnostic,
} from "@/lib/parse/pdf-positions";

export const dynamic = "force-dynamic";

interface EntryReport {
  id: string;
  category: string;
  candidates: string[];
  bestCandidateIndex: number | null;
  diagnostic: MatchDiagnostic | null;
  sourceOrder?: number;
  sourceHeaderBbox?: unknown;
  sourceLinks?: unknown;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Match diagnostics are dev-only" },
      { status: 404 },
    );
  }

  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const documentId = params.id;
  if (!documentId) {
    return NextResponse.json({ error: "Missing document id" }, { status: 400 });
  }

  const cached = getCachedPdfBytes(documentId, authResult.userId);
  if (!cached) {
    return NextResponse.json(
      { error: "PDF bytes not in cache — re-upload to regenerate." },
      { status: 404 },
    );
  }

  const positions = await extractPdfPositions(cached.bytes);
  const entries = listBankEntriesPaginated({
    userId: authResult.userId,
    sourceDocumentId: documentId,
    limit: 1000,
  });

  const reports: EntryReport[] = entries.map((entry) => {
    const candidates = deriveSearchNeedles(entry.category, entry.content);
    if (candidates.length === 0) {
      return {
        id: entry.id,
        category: entry.category,
        candidates: [],
        bestCandidateIndex: null,
        diagnostic: null,
        sourceOrder: entry.sourceOrder,
        sourceHeaderBbox: entry.sourceHeaderBbox,
        sourceLinks: entry.sourceLinks,
      };
    }
    let winningIndex: number | null = null;
    let winningDiagnostic: MatchDiagnostic | null = null;
    for (let i = 0; i < candidates.length; i += 1) {
      const diagnostic = findPositionsWithDiagnostic(
        candidates[i],
        positions.items,
        { category: entry.category },
      );
      if (diagnostic.bboxes.length > 0) {
        winningIndex = i;
        winningDiagnostic = diagnostic;
        break;
      }
      if (!winningDiagnostic) winningDiagnostic = diagnostic;
    }
    return {
      id: entry.id,
      category: entry.category,
      candidates,
      bestCandidateIndex: winningIndex,
      diagnostic: winningDiagnostic,
      sourceOrder: entry.sourceOrder,
      sourceHeaderBbox: entry.sourceHeaderBbox,
      sourceLinks: entry.sourceLinks,
    };
  });

  const matched = reports.filter((r) => r.bestCandidateIndex !== null).length;

  return NextResponse.json({
    documentId,
    pageCount: positions.pageDimensions.length,
    itemCount: positions.items.length,
    linkCount: positions.links.length,
    totalEntries: reports.length,
    matched,
    missed: reports.length - matched,
    reports,
  });
}
