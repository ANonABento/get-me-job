/**
 * @route PATCH /api/extension/opportunities/[id]/status
 * @description Change an opportunity status via extension-token auth.
 * @auth Extension token
 */
import { NextRequest, NextResponse } from "next/server";
import { validationErrorResponse } from "@/lib/api-utils";
import { requireExtensionAuth } from "@/lib/extension-auth";
import { changeOpportunityStatus } from "@/lib/opportunities";
import { safeTrackActivity } from "@/lib/streak/track";
import { opportunityStatusChangeSchema } from "@/types/opportunity";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authResult = requireExtensionAuth(request);
  if (!authResult.success) return authResult.response;

  try {
    const parseResult = opportunityStatusChangeSchema.safeParse(
      await request.json(),
    );
    if (!parseResult.success) {
      return validationErrorResponse(parseResult.error);
    }

    const opportunity = changeOpportunityStatus(
      params.id,
      parseResult.data.status,
      authResult.userId,
    );

    if (!opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 },
      );
    }

    const trackingResults = [
      await safeTrackActivity(authResult.userId, "opp_status_changed"),
    ];
    if (parseResult.data.status === "applied") {
      trackingResults.push(
        await safeTrackActivity(authResult.userId, "opp_applied"),
      );
    }

    return NextResponse.json({
      opportunity,
      unlocked: trackingResults.flatMap((result) => result.unlocked),
    });
  } catch (error) {
    console.error("Extension opportunity status error:", error);
    return NextResponse.json(
      { error: "Failed to change opportunity status" },
      { status: 500 },
    );
  }
}
