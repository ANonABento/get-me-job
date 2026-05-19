import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      error: "Use /api/templates/migrate to import a V3 visual template.",
      code: "legacy_template_analysis_disabled",
    },
    { status: 410 },
  );
}
