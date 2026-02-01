import { NextRequest, NextResponse } from "next/server";
import { getCoverLettersByJob } from "@/lib/db/cover-letters";
import { getJob } from "@/lib/db/jobs";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = getJob(params.id);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const coverLetters = getCoverLettersByJob(params.id);

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
