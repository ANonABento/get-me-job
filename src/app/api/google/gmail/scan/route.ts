/**
 * @route GET /api/google/gmail/scan
 * @description Scan inbox for job-related emails
 * @auth Required
 * @response GoogleGmailScanResponse from @/types/api
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { searchJobEmails, parseJobEmail } from "@/lib/google/gmail";
import { isGoogleConnected } from "@/lib/google/client";

export async function GET(request: NextRequest) {
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
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30");
    const maxResults = parseInt(searchParams.get("maxResults") || "50");

    const since = new Date();
    since.setDate(since.getDate() - days);

    const messages = await searchJobEmails({ since, maxResults });

    const parsed = messages.map((msg) => ({
      id: msg.id,
      threadId: msg.threadId,
      subject: msg.subject,
      from: msg.from,
      date: msg.date.toISOString(),
      snippet: msg.snippet,
      labels: msg.labels,
      parsed: parseJobEmail(msg),
    }));

    // Sort by confidence (highest first)
    parsed.sort((a, b) => b.parsed.confidence - a.parsed.confidence);

    return NextResponse.json({
      success: true,
      count: parsed.length,
      emails: parsed,
    });
  } catch (error) {
    console.error("Gmail scan error:", error);
    return NextResponse.json(
      { error: "Failed to scan emails" },
      { status: 500 }
    );
  }
}
