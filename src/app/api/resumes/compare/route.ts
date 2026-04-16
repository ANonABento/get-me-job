/**
 * @route POST /api/resumes/compare
 * @description Compare two resume versions with section-level scoring and metrics
 * @auth Required
 * @request { resumeIdA: string, resumeIdB: string }
 * @response ResumeCompareResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { getGeneratedResume } from "@/lib/db/resumes";
import { compareResumes, calculateSectionScores, calculateResumeMetrics } from "@/lib/resume/compare";
import { compareResumesSchema } from "@/lib/constants";
import type { TailoredResume } from "@/lib/resume/generator";
import { requireAuth, isAuthError } from "@/lib/auth";

function parseResumeContent(json: string, label: string): TailoredResume | NextResponse {
  try {
    return JSON.parse(json) as TailoredResume;
  } catch {
    return NextResponse.json({ error: `${label} resume has invalid content` }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const rawData = await request.json();

    // Validate input with Zod
    const parseResult = compareResumesSchema.safeParse(rawData);
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 }
      );
    }

    const { beforeId, afterId } = parseResult.data;

    const beforeResume = getGeneratedResume(beforeId, authResult.userId);
    const afterResume = getGeneratedResume(afterId, authResult.userId);

    if (!beforeResume) {
      return NextResponse.json(
        { error: "Before resume not found" },
        { status: 404 }
      );
    }

    if (!afterResume) {
      return NextResponse.json(
        { error: "After resume not found" },
        { status: 404 }
      );
    }

    const beforeResult = parseResumeContent(beforeResume.contentJson, "Before");
    if (beforeResult instanceof NextResponse) return beforeResult;
    const beforeContent = beforeResult;

    const afterResult = parseResumeContent(afterResume.contentJson, "After");
    if (afterResult instanceof NextResponse) return afterResult;
    const afterContent = afterResult;

    const comparison = compareResumes(
      beforeContent,
      afterContent,
      beforeResume.matchScore,
      afterResume.matchScore
    );

    const sectionScores = calculateSectionScores(beforeContent, afterContent);
    const beforeMetrics = calculateResumeMetrics(beforeContent);
    const afterMetrics = calculateResumeMetrics(afterContent);

    return NextResponse.json({
      comparison,
      sectionScores,
      before: {
        id: beforeResume.id,
        createdAt: beforeResume.createdAt,
        matchScore: beforeResume.matchScore,
        content: beforeContent,
        metrics: beforeMetrics,
      },
      after: {
        id: afterResume.id,
        createdAt: afterResume.createdAt,
        matchScore: afterResume.matchScore,
        content: afterContent,
        metrics: afterMetrics,
      },
    });
  } catch (error) {
    console.error("Resume comparison error:", error);
    return NextResponse.json(
      { error: "Failed to compare resumes" },
      { status: 500 }
    );
  }
}
