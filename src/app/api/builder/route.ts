import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getBankEntries } from "@/lib/db/profile-bank";
import { bankEntriesToResume } from "@/lib/resume/bank-to-resume";
import { generateResumeHTML } from "@/lib/resume/pdf";
import type { ContactInfo } from "@/types";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await request.json();
    const { entryIds, templateId = "classic", contact } = body as {
      entryIds: string[];
      templateId?: string;
      contact?: ContactInfo;
    };

    if (!Array.isArray(entryIds) || entryIds.length === 0) {
      return NextResponse.json(
        { error: "entryIds must be a non-empty array" },
        { status: 400 }
      );
    }

    const allEntries = getBankEntries(authResult.userId);
    const selectedEntries = allEntries.filter((e) => entryIds.includes(e.id));

    const resume = bankEntriesToResume(
      selectedEntries,
      contact || { name: "Your Name" }
    );

    const html = generateResumeHTML(resume, templateId, authResult.userId);

    return NextResponse.json({ html, resume });
  } catch (error) {
    console.error("Builder error:", error);
    return NextResponse.json(
      { error: "Failed to generate resume" },
      { status: 500 }
    );
  }
}
