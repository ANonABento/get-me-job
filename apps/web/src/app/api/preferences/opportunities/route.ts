/**
 * @route GET /api/preferences/opportunities
 * @route PATCH /api/preferences/opportunities
 * @description Single-row preferences for the opportunities surface
 *   (display density, default sort, visible badges, scrape knobs).
 *   Spec: docs/opportunity-customization-spec.md §3.1 + §4 buckets C+D.
 * @auth NextAuth session
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  getViewPreferences,
  setViewPreferences,
  VISIBLE_BADGE_KEYS,
} from "@/lib/db/opportunity-view-preferences";
import { opportunitySortIdSchema } from "@slothing/shared/schemas";

export const dynamic = "force-dynamic";

const updatePreferencesSchema = z
  .object({
    displayDensity: z.enum(["comfortable", "compact"]),
    defaultSortId: opportunitySortIdSchema,
    visibleBadges: z.array(z.enum(VISIBLE_BADGE_KEYS)),
    scrapeThrottleMs: z.number().int().min(100).max(5000),
    scrapeChunkSize: z.number().int().min(1).max(50),
    scrapeMaxJobs: z.number().int().min(1).max(1000),
    scrapeMaxPages: z.number().int().min(1).max(200),
    scrapeDedupeEnabled: z.boolean(),
  })
  .partial();

export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;
  try {
    const preferences = getViewPreferences(authResult.userId);
    return NextResponse.json({ preferences });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updatePreferencesSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const preferences = setViewPreferences(authResult.userId, parsed.data);
    return NextResponse.json({ preferences });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
