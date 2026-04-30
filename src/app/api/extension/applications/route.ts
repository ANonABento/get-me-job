/**
 * @route POST /api/extension/applications
 * @description Log application submissions detected by the Columbus extension.
 * @auth Extension token via X-Extension-Token
 */
import { NextRequest, NextResponse } from "next/server";
import { requireExtensionAuth } from "@/lib/extension-auth";
import { createJob } from "@/lib/db/jobs";
import { createNotification } from "@/lib/db/notifications";
import {
  buildAppliedJobFromExtension,
  parseExtensionApplicationPayload,
} from "@/lib/extension-applications";

export async function POST(request: NextRequest) {
  const authResult = requireExtensionAuth(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    let rawData: unknown;
    try {
      rawData = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const parseResult = parseExtensionApplicationPayload(rawData);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", errors: parseResult.errors },
        { status: 400 }
      );
    }

    const appliedAt = parseResult.application.submittedAt || new Date().toISOString();
    const application = createJob(
      buildAppliedJobFromExtension(parseResult.application, appliedAt),
      authResult.userId
    );

    createNotification(
      {
        type: "application_update",
        title: "Application logged",
        message: `${application.title} at ${application.company} was marked as applied.`,
        link: "/opportunities",
      },
      authResult.userId
    );

    return NextResponse.json(
      {
        applicationId: application.id,
        status: application.status,
        appliedAt: application.appliedAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Extension application logging error:", error);
    return NextResponse.json(
      { error: "Failed to log application" },
      { status: 500 }
    );
  }
}
