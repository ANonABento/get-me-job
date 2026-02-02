import { NextRequest, NextResponse } from "next/server";
import {
  getEmailDrafts,
  createEmailDraft,
} from "@/lib/db/email-drafts";
import { requireAuth, isAuthError } from "@/lib/auth";

// GET - List all email drafts
export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const drafts = getEmailDrafts();

    return NextResponse.json({ drafts });
  } catch (error) {
    console.error("Get drafts error:", error);
    return NextResponse.json(
      { error: "Failed to get email drafts" },
      { status: 500 }
    );
  }
}

// POST - Create a new email draft
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const { type, jobId, subject, body, context } = await request.json();

    if (!type || !subject || !body) {
      return NextResponse.json(
        { error: "type, subject, and body are required" },
        { status: 400 }
      );
    }

    const draft = createEmailDraft({
      type,
      jobId,
      subject,
      body,
      context,
    });

    return NextResponse.json({ draft });
  } catch (error) {
    console.error("Create draft error:", error);
    return NextResponse.json(
      { error: "Failed to create email draft" },
      { status: 500 }
    );
  }
}
