import { NextRequest, NextResponse } from "next/server";
import { getGeneratedResume } from "@/lib/db/resumes";
import { compareResumes, calculateSectionScores, calculateResumeMetrics } from "@/lib/resume/compare";
import { compareResumesSchema } from "@/lib/constants";
import type { TailoredResume } from "@/lib/resume/generator";
import { requireAuth, isAuthError } from "@/lib/auth";

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

    // Safely parse JSON content
    let beforeContent: TailoredResume;
    let afterContent: TailoredResume;

    try {
      beforeContent = JSON.parse(beforeResume.contentJson) as TailoredResume;
    } catch {
      return NextResponse.json(
        { error: "Before resume has invalid content" },
        { status: 400 }
      );
    }

    try {
      afterContent = JSON.parse(afterResume.contentJson) as TailoredResume;
    } catch {
      return NextResponse.json(
        { error: "After resume has invalid content" },
        { status: 400 }
      );
    }

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
