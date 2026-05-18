import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAuthError, requireAuth } from "@/lib/auth";
import {
  getActivationFunnelCounts,
  trackActivationEvent,
} from "@/lib/db/product-analytics";

export const dynamic = "force-dynamic";

const eventSchema = z.object({
  event: z.enum([
    "waitlist_joined",
    "opportunity_created",
    "resume_uploaded",
    "resume_tailored",
    "extension_connected",
  ]),
  source: z.string().trim().max(80).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  return NextResponse.json({
    ok: true,
    funnel: getActivationFunnelCounts(authResult.userId),
  });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const body = await request.json().catch(() => null);
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const event = trackActivationEvent({
    ...parsed.data,
    userId: authResult.userId,
  });

  return NextResponse.json({ ok: true, event }, { status: 201 });
}
