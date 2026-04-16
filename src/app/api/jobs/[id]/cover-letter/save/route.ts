/**
 * @route POST /api/jobs/[id]/cover-letter/save
 * @description Save a cover letter version for a job
 * @auth Required
 * @request { content: string, tone?: string, version?: number }
 * @response CoverLetterSaveResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { saveCoverLetter } from "@/lib/db/cover-letters";
import { getJob } from "@/lib/db/jobs";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function POST(
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

    const body = await request.json();
    const { content, highlights = [] } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Cover letter content is required" },
        { status: 400 }
      );
    }

    const coverLetter = saveCoverLetter(
      params.id,
      content,
      highlights,
      authResult.userId
    );

    return NextResponse.json({
      success: true,
      coverLetter: {
        id: coverLetter.id,
        content: coverLetter.content,
        highlights: coverLetter.highlights,
        version: coverLetter.version,
        createdAt: coverLetter.createdAt,
      },
    });
  } catch (error) {
    console.error("Save cover letter error:", error);
    return NextResponse.json(
      { error: "Failed to save cover letter" },
      { status: 500 }
    );
  }
}
