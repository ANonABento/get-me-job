import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { recordWebVital } from "@/lib/db/web-vitals";
import { nowEpoch } from "@/lib/format/time";
import { getClientIdentifier, rateLimiters } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const webVitalSchema = z.object({
  metricId: z.string().trim().min(1).max(120),
  name: z.enum(["CLS", "FCP", "FID", "INP", "LCP", "TTFB"]),
  value: z.number().finite().nonnegative(),
  delta: z.number().finite(),
  rating: z.enum(["good", "needs-improvement", "poor"]),
  navigationType: z.string().trim().max(80).optional().nullable(),
  pathname: z.string().trim().max(300).optional().nullable(),
});

export async function POST(request: NextRequest) {
  const rateLimit = rateLimiters.standard(getClientIdentifier(request));
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.max(1, Math.ceil((rateLimit.resetAt - nowEpoch()) / 1000)),
          ),
        },
      },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = webVitalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  recordWebVital({
    ...parsed.data,
    userAgent: request.headers.get("user-agent"),
  });

  return NextResponse.json({ ok: true }, { status: 202 });
}
