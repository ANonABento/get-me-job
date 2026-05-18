import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createWaitlistEntry } from "@/lib/db/waitlist";
import { trackActivationEvent } from "@/lib/db/product-analytics";

export const dynamic = "force-dynamic";

const waitlistSchema = z.object({
  email: z.string().trim().email().max(254),
  source: z.string().trim().max(80).optional(),
  interest: z.string().trim().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = waitlistSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const entry = createWaitlistEntry(parsed.data);
    try {
      trackActivationEvent({
        event: "waitlist_joined",
        source: parsed.data.source ?? "pricing",
        metadata: { interest: parsed.data.interest ?? null },
      });
    } catch (analyticsError) {
      console.error("Waitlist analytics failed:", analyticsError);
    }

    return NextResponse.json({ ok: true, entry }, { status: 201 });
  } catch (error) {
    console.error("Waitlist signup failed:", error);
    return NextResponse.json(
      { error: "Failed to join waitlist" },
      { status: 500 },
    );
  }
}
