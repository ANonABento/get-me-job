import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      error: "V2 template previews are disabled. Use V3 visual templates.",
      code: "legacy_template_preview_disabled",
    },
    { status: 410 },
  );
}
