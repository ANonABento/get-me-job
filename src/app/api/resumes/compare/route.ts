import { NextRequest, NextResponse } from "next/server";
import { getGeneratedResume } from "@/lib/db/resumes";
import { compareResumes } from "@/lib/resume/compare";
import type { TailoredResume } from "@/lib/resume/generator";

export async function POST(request: NextRequest) {
  try {
    const { beforeId, afterId } = await request.json();

    if (!beforeId || !afterId) {
      return NextResponse.json(
        { error: "Both beforeId and afterId are required" },
        { status: 400 }
      );
    }

    const beforeResume = getGeneratedResume(beforeId);
    const afterResume = getGeneratedResume(afterId);

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

    const beforeContent = JSON.parse(beforeResume.contentJson) as TailoredResume;
    const afterContent = JSON.parse(afterResume.contentJson) as TailoredResume;

    const comparison = compareResumes(
      beforeContent,
      afterContent,
      beforeResume.matchScore,
      afterResume.matchScore
    );

    return NextResponse.json({
      comparison,
      before: {
        id: beforeResume.id,
        createdAt: beforeResume.createdAt,
        matchScore: beforeResume.matchScore,
        content: beforeContent,
      },
      after: {
        id: afterResume.id,
        createdAt: afterResume.createdAt,
        matchScore: afterResume.matchScore,
        content: afterContent,
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
