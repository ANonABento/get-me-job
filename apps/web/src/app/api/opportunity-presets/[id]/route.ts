/**
 * @route PATCH /api/opportunity-presets/[id]
 * @route DELETE /api/opportunity-presets/[id]
 * @description Update or delete a saved preset. Spec:
 *   docs/opportunity-customization-spec.md §4 bucket A.
 * @auth NextAuth session
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  deleteOpportunityPreset,
  updateOpportunityPreset,
} from "@/lib/db/opportunity-presets";
import { updateOpportunityPresetSchema } from "@slothing/shared/schemas";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, ctx: RouteParams) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;
  const { id } = await ctx.params;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateOpportunityPresetSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const preset = updateOpportunityPreset(id, parsed.data, authResult.userId);
    if (!preset) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ preset });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, ctx: RouteParams) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;
  const { id } = await ctx.params;

  try {
    const deleted = deleteOpportunityPreset(id, authResult.userId);
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
