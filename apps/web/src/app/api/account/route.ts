import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAuthError, requireUserAuth } from "@/lib/auth";
import { deleteAccountData } from "@/lib/db/account-deletion";

export const dynamic = "force-dynamic";

const deleteAccountSchema = z.object({
  confirmation: z.literal("DELETE"),
});

export async function DELETE(request: NextRequest) {
  const authResult = await requireUserAuth(request);
  if (isAuthError(authResult)) return authResult;

  const body = await request.json().catch(() => null);
  const parsed = deleteAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Type "DELETE" to confirm account deletion.' },
      { status: 400 },
    );
  }

  try {
    const result = deleteAccountData(authResult.userId);
    return NextResponse.json({ ok: true, deleted: result });
  } catch (error) {
    console.error("Account deletion failed:", error);
    return NextResponse.json(
      { error: "Failed to delete account data" },
      { status: 500 },
    );
  }
}
