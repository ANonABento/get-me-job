import { NextRequest, NextResponse } from "next/server";
import {
  getEmailDraft,
  updateEmailDraft,
  deleteEmailDraft,
} from "@/lib/db/email-drafts";
import { requireAuth, isAuthError } from "@/lib/auth";

// GET - Get a specific email draft
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const draft = getEmailDraft(params.id);

    if (!draft) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ draft });
  } catch (error) {
    console.error("Get draft error:", error);
    return NextResponse.json(
      { error: "Failed to get email draft" },
      { status: 500 }
    );
  }
}

// PUT - Update an email draft
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const { subject, body, context } = await request.json();

    const draft = updateEmailDraft(params.id, {
      subject,
      body,
      context,
    });

    if (!draft) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ draft });
  } catch (error) {
    console.error("Update draft error:", error);
    return NextResponse.json(
      { error: "Failed to update email draft" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an email draft
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const success = deleteEmailDraft(params.id);

    if (!success) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete draft error:", error);
    return NextResponse.json(
      { error: "Failed to delete email draft" },
      { status: 500 }
    );
  }
}
