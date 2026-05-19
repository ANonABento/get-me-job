/**
 * @route POST /api/bank/imports/[parseRunId]/commit
 * @description Commit reviewed parser-v2 components into the profile bank
 * @auth Required
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  deleteBankEntriesBySource,
  getDocumentArtifact,
  getDocumentParseRunById,
  getProfile,
  insertBankEntries,
  updateProfile,
} from "@/lib/db";
import { isParsedResumeV2Result } from "@/lib/ingest/diagnostics";
import { buildParseRunBankEntries } from "@/lib/ingest/parse-run-bank-import";
import { parserV2ProfileToAutoPromoteInput } from "@/lib/ingest/parser-v2-profile-promotion";
import { mergeParsedProfileForAutoPromote } from "@/lib/profile/auto-promote";

export const dynamic = "force-dynamic";

const commitParseRunSchema = z.object({
  acceptedComponentIds: z.array(z.string()).optional(),
  edits: z.record(z.string(), z.unknown()).optional(),
  autoPromoteProfile: z.boolean().optional().default(false),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { parseRunId: string } },
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = commitParseRunSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const parseRun = getDocumentParseRunById(
      params.parseRunId,
      authResult.userId,
    );
    if (!parseRun) {
      return NextResponse.json(
        { error: "Parse run not found" },
        { status: 404 },
      );
    }
    if (parseRun.status !== "ready") {
      return NextResponse.json(
        { error: "Parse run is not ready to commit" },
        { status: 409 },
      );
    }

    const artifact = getDocumentArtifact(
      parseRun.artifactId,
      authResult.userId,
    );
    if (!artifact || artifact.documentId !== parseRun.documentId) {
      return NextResponse.json(
        { error: "Document artifact not found" },
        { status: 404 },
      );
    }

    const entries = buildParseRunBankEntries({
      parseRun,
      sourceMap: artifact.sourceMap,
      acceptedComponentIds: parsed.data.acceptedComponentIds,
      edits: parsed.data.edits,
    });

    if (entries.length === 0) {
      return NextResponse.json({
        success: true,
        parseRunId: parseRun.id,
        documentId: parseRun.documentId,
        inserted: 0,
        entryIds: [],
        profilePromoted: false,
      });
    }

    deleteBankEntriesBySource(parseRun.documentId, authResult.userId);
    const entryIds = insertBankEntries(entries, authResult.userId);
    let profilePromoted = false;

    if (
      parsed.data.autoPromoteProfile &&
      isParsedResumeV2Result(parseRun.structured)
    ) {
      try {
        const existingProfile = getProfile(authResult.userId);
        const promoted = mergeParsedProfileForAutoPromote(
          existingProfile,
          parserV2ProfileToAutoPromoteInput(parseRun.structured.profile),
        );
        if (Object.keys(promoted).length > 0) {
          updateProfile(promoted, authResult.userId);
          profilePromoted = true;
        }
      } catch (promotionError) {
        console.error(
          "Parser-v2 profile auto-promotion failed:",
          promotionError,
        );
      }
    }

    return NextResponse.json({
      success: true,
      parseRunId: parseRun.id,
      documentId: parseRun.documentId,
      inserted: entryIds.length,
      entryIds,
      profilePromoted,
    });
  } catch (error) {
    console.error("Commit parse run import error:", error);
    return NextResponse.json(
      { error: "Failed to commit parse run import" },
      { status: 500 },
    );
  }
}
