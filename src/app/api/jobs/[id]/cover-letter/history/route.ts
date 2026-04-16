/**
 * @route GET /api/jobs/[id]/cover-letter/history
 * @description List all cover letter versions for a job
 * @auth Required
 * @response CoverLetterHistoryResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { getCoverLettersByJob } from "@/lib/db/cover-letters";
import { getJob } from "@/lib/db/jobs";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const job = getJob(params.id, authResult.userId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const coverLetters = getCoverLettersByJob(params.id, authResult.userId);

    return NextResponse.json({
      versions: coverLetters.map((cl) => ({
        id: cl.id,
        content: cl.content,
        highlights: cl.highlights,
        version: cl.version,
        createdAt: cl.createdAt,
      })),
    });
  } catch (error) {
    console.error("Cover letter history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cover letter history" },
      { status: 500 }
    );
  }
}
