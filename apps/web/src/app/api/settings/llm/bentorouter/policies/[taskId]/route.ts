import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAuthError } from "@/lib/auth";
import { updateSlothingBentoTaskPolicy } from "@/lib/llm/bentorouter-client";

export const dynamic = "force-dynamic";

const taskPolicySchema = z.object({
  primaryModel: z.string().optional(),
  fallbacks: z.array(z.string()).optional(),
  guardrails: z
    .object({
      maxRequestCostUsd: z.number().optional(),
      timeoutMs: z.number().optional(),
      maxRetries: z.number().optional(),
    })
    .optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { taskId: string } },
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const parsed = taskPolicySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid policy", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(
      await updateSlothingBentoTaskPolicy(
        decodeURIComponent(params.taskId),
        parsed.data,
      ),
    );
  } catch (error) {
    console.error("BentoRouter policy update error:", error);
    return NextResponse.json(
      { error: "Failed to update BentoRouter policy" },
      { status: 500 },
    );
  }
}
