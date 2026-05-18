import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { runDevCleanSlate } from "@/lib/dev/clean-slate";

export const dynamic = "force-dynamic";

const DEV_TOOLS_HEADER = "x-slothing-dev-tools";
const DEV_TOOLS_HEADER_VALUE = "enabled";

export async function DELETE(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (request.headers.get(DEV_TOOLS_HEADER) !== DEV_TOOLS_HEADER_VALUE) {
    return NextResponse.json(
      { error: "Dev tools are not enabled for this request." },
      { status: 403 },
    );
  }

  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const result = await runDevCleanSlate(authResult.userId);

    return NextResponse.json({
      success: true,
      userId: authResult.userId,
      ...result,
    });
  } catch (error) {
    console.error("[dev-clean-slate] reset failed:", error);
    return NextResponse.json(
      { error: "Failed to reset local dev data." },
      { status: 500 },
    );
  }
}
