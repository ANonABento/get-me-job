import { NextRequest, NextResponse } from "next/server";
import {
  getInterviewSessions,
  createInterviewSession,
} from "@/lib/db/interviews";

// GET - List all interview sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId") || undefined;

    const sessions = getInterviewSessions(jobId);

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Get sessions error:", error);
    return NextResponse.json(
      { error: "Failed to get interview sessions" },
      { status: 500 }
    );
  }
}

// POST - Create a new interview session
export async function POST(request: NextRequest) {
  try {
    const { jobId, questions, mode } = await request.json();

    if (!jobId || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: "jobId and questions array are required" },
        { status: 400 }
      );
    }

    const session = createInterviewSession(jobId, questions, mode);

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Create session error:", error);
    return NextResponse.json(
      { error: "Failed to create interview session" },
      { status: 500 }
    );
  }
}
