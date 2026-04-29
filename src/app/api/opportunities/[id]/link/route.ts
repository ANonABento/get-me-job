import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { linkOpportunityDocument } from "@/lib/opportunities";

interface RouteContext {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    let body: {
      resumeId?: unknown;
      coverLetterId?: unknown;
    };

    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json(
        { error: "Request body must be valid JSON" },
        { status: 400 },
      );
    }

    const resumeId =
      typeof body.resumeId === "string" && body.resumeId.trim()
        ? body.resumeId.trim()
        : undefined;
    const coverLetterId =
      typeof body.coverLetterId === "string" && body.coverLetterId.trim()
        ? body.coverLetterId.trim()
        : undefined;

    if (!resumeId && !coverLetterId) {
      return NextResponse.json(
        { error: "resumeId or coverLetterId is required" },
        { status: 400 },
      );
    }

    const opportunity = linkOpportunityDocument(
      params.id,
      { resumeId, coverLetterId },
      authResult.userId,
    );
    if (!opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, opportunity });
  } catch (error) {
    console.error("Link opportunity error:", error);
    return NextResponse.json(
      { error: "Failed to link opportunity" },
      { status: 500 },
    );
  }
}
