/**
 * @route GET /api/opportunities/[id]
 * @description Get one opportunity
 * @route PATCH /api/opportunities/[id]
 * @description Update an opportunity
 * @route DELETE /api/opportunities/[id]
 * @description Delete an opportunity
 * @auth Required
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  deleteOpportunity,
  getOpportunity,
  updateOpportunity,
} from "@/lib/opportunities";
import { validationErrorResponse } from "@/lib/api-utils";
import { updateOpportunitySchema } from "@/types/opportunity";
import { ZodError } from "zod";

interface OpportunityRouteContext {
  params: { id: string };
}

export async function GET(
  _request: NextRequest,
  { params }: OpportunityRouteContext
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const opportunity = getOpportunity(params.id, authResult.userId);
    if (!opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ opportunity });
  } catch (error) {
    console.error("Get opportunity error:", error);
    return NextResponse.json(
      { error: "Failed to get opportunity" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: OpportunityRouteContext
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const parseResult = updateOpportunitySchema.safeParse(await request.json());
    if (!parseResult.success) {
      return validationErrorResponse(parseResult.error);
    }

    const opportunity = updateOpportunity(
      params.id,
      parseResult.data,
      authResult.userId
    );

    if (!opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ opportunity });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }

    console.error("Update opportunity error:", error);
    return NextResponse.json(
      { error: "Failed to update opportunity" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: OpportunityRouteContext
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const deleted = deleteOpportunity(params.id, authResult.userId);
    if (!deleted) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete opportunity error:", error);
    return NextResponse.json(
      { error: "Failed to delete opportunity" },
      { status: 500 }
    );
  }
}
