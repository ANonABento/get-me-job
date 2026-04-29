/**
 * @route PATCH /api/opportunities/[id]/status
 * @description Change an opportunity status
 * @auth Required
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { validationErrorResponse } from "@/lib/api-utils";
import { changeOpportunityStatus } from "@/lib/opportunities";
import { opportunityStatusChangeSchema } from "@/types/opportunity";

interface OpportunityStatusRouteContext {
  params: { id: string };
}

export async function PATCH(
  request: NextRequest,
  { params }: OpportunityStatusRouteContext
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const parseResult = opportunityStatusChangeSchema.safeParse(
      await request.json()
    );
    if (!parseResult.success) {
      return validationErrorResponse(parseResult.error);
    }

    const opportunity = changeOpportunityStatus(
      params.id,
      parseResult.data.status,
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
    console.error("Change opportunity status error:", error);
    return NextResponse.json(
      { error: "Failed to change opportunity status" },
      { status: 500 }
    );
  }
}
