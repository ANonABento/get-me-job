import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getOpportunity, changeOpportunityStatus } from "@/lib/opportunities";
import { deleteJob } from "@/lib/db/jobs";

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const opportunity = getOpportunity(params.id, authResult.userId);
    if (!opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ opportunity });
  } catch (error) {
    console.error("Get opportunity error:", error);
    return NextResponse.json(
      { error: "Failed to get opportunity" },
      { status: 500 },
    );
  }
}

const VALID_STATUSES = ["pending", "saved", "applied", "interviewing", "offer", "rejected", "expired", "dismissed"] as const;

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await request.json();

    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status", validStatuses: VALID_STATUSES },
        { status: 400 },
      );
    }

    const opportunity = changeOpportunityStatus(params.id, body.status, authResult.userId);
    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }
    return NextResponse.json({ opportunity });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", errors: error.errors.map(e => ({ field: e.path.join("."), message: e.message })) },
        { status: 400 },
      );
    }
    console.error("Update opportunity error:", error);
    return NextResponse.json({ error: "Failed to update opportunity" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const existing = getOpportunity(params.id, authResult.userId);
    if (!existing) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }
    deleteJob(params.id, authResult.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete opportunity error:", error);
    return NextResponse.json({ error: "Failed to delete opportunity" }, { status: 500 });
  }
}
