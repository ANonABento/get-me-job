import { NextResponse } from "next/server";
import { TEMPLATES } from "@/lib/resume/pdf";

export async function GET() {
  return NextResponse.json({
    templates: TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
    })),
  });
}
