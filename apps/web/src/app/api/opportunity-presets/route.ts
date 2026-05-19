/**
 * @route GET /api/opportunity-presets[?scope=review|list]
 * @route POST /api/opportunity-presets
 * @description CRUD for the user's saved filter+sort presets. Drives the
 *   pinned-chip bar in the review queue and (later) the opportunities
 *   list view. Spec: docs/opportunity-customization-spec.md §4 bucket A.
 * @auth NextAuth session
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  createOpportunityPreset,
  listOpportunityPresets,
} from "@/lib/db/opportunity-presets";
import {
  createOpportunityPresetSchema,
  opportunityPresetScopeSchema,
  type OpportunityPresetScope,
} from "@slothing/shared/schemas";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const scopeParam = request.nextUrl.searchParams.get("scope");
  let scope: OpportunityPresetScope | undefined;
  if (scopeParam) {
    const parsed = opportunityPresetScopeSchema.safeParse(scopeParam);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid scope" }, { status: 400 });
    }
    scope = parsed.data;
  }

  try {
    const presets = listOpportunityPresets(authResult.userId, scope);
    return NextResponse.json({ presets });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createOpportunityPresetSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const preset = createOpportunityPreset(parsed.data, authResult.userId);
    return NextResponse.json({ preset }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
