/**
 * @route GET /api/opportunities
 * @description List opportunities with filters and full-text search
 * @route POST /api/opportunities
 * @description Create an opportunity
 * @auth Required
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  createOpportunity,
  listOpportunities,
  parseOpportunityFilters,
} from "@/lib/opportunities";
import { validationErrorResponse } from "@/lib/api-utils";
import { createOpportunitySchema } from "@/types/opportunity";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const filters = parseOpportunityFilters(request.nextUrl.searchParams);
    return NextResponse.json({
      opportunities: listOpportunities(authResult.userId, filters),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }

    console.error("List opportunities error:", error);
    return NextResponse.json(
      { error: "Failed to list opportunities" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const parseResult = createOpportunitySchema.safeParse(await request.json());
    if (!parseResult.success) {
      return validationErrorResponse(parseResult.error);
    }

    const opportunity = createOpportunity(parseResult.data, authResult.userId);
    return NextResponse.json({ opportunity }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }

    console.error("Create opportunity error:", error);
    return NextResponse.json(
      { error: "Failed to create opportunity" },
      { status: 500 }
    );
  }
}
