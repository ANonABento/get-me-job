/**
 * @route POST /api/google/gmail/send
 * @description Send an email via Gmail
 * @auth Required
 * @request { to: string, subject: string, body: string, replyTo?: string, threadId?: string, cc?: string, bcc?: string }
 * @response GoogleGmailSendResponse from @/types/api
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { sendEmail } from "@/lib/google/gmail";
import { isGoogleConnected } from "@/lib/google/client";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const connected = await isGoogleConnected();
  if (!connected) {
    return NextResponse.json(
      { error: "Google account not connected" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { to, subject, body: emailBody, replyTo, threadId, cc, bcc } = body;

    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, body" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const result = await sendEmail(to, subject, emailBody, {
      replyTo,
      threadId,
      cc,
      bcc,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("Gmail send error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
