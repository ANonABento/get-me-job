/**
 * Google Docs Create API
 *
 * POST /api/google/docs/create - Create a new Google Doc
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  createDoc,
  createInterviewPrepDoc,
  exportResumeToDoc,
  exportCoverLetterToDoc,
  createCompanyResearchDoc,
} from "@/lib/google/docs";
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
    const { type, ...data } = body;

    let result;

    switch (type) {
      case "interview_prep":
        if (!data.jobTitle || !data.company) {
          return NextResponse.json(
            { error: "Missing required fields: jobTitle, company" },
            { status: 400 }
          );
        }
        result = await createInterviewPrepDoc(
          data.jobTitle,
          data.company,
          data.questions || []
        );
        break;

      case "resume":
        if (!data.title || !data.content) {
          return NextResponse.json(
            { error: "Missing required fields: title, content" },
            { status: 400 }
          );
        }
        result = await exportResumeToDoc(data.title, data.content);
        break;

      case "cover_letter":
        if (!data.company || !data.role || !data.content) {
          return NextResponse.json(
            { error: "Missing required fields: company, role, content" },
            { status: 400 }
          );
        }
        result = await exportCoverLetterToDoc(
          data.company,
          data.role,
          data.content
        );
        break;

      case "company_research":
        if (!data.company) {
          return NextResponse.json(
            { error: "Missing required field: company" },
            { status: 400 }
          );
        }
        result = await createCompanyResearchDoc(data.company, data.content || {});
        break;

      case "custom":
        if (!data.title) {
          return NextResponse.json(
            { error: "Missing required field: title" },
            { status: 400 }
          );
        }
        result = await createDoc(data.title, data.content, data.folderId);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid document type. Use: interview_prep, resume, cover_letter, company_research, or custom" },
          { status: 400 }
        );
    }

    if (!result) {
      return NextResponse.json(
        { error: "Failed to create document" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      docId: result.docId,
      docUrl: result.docUrl,
    });
  } catch (error) {
    console.error("Docs create error:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
