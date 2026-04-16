/**
 * @route POST /api/google/drive/upload
 * @description Upload file to Google Drive (FormData: file, type, fileName, createShareableLink)
 * @auth Required
 * @request FormData { file: File, type: "resume" | "cover_letter" | "backup", fileName?: string, createShareableLink?: string, content?: string }
 * @response GoogleDriveUploadResponse from @/types/api
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  uploadResume,
  uploadCoverLetter,
  uploadBackup,
  createShareableLink,
} from "@/lib/google/drive";
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
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as
      | "resume"
      | "cover_letter"
      | "backup"
      | null;
    const fileName = formData.get("fileName") as string | null;
    const createLink = formData.get("createShareableLink") === "true";

    // Handle backup separately (JSON string, not file)
    if (type === "backup") {
      const content = formData.get("content") as string;
      if (!content) {
        return NextResponse.json(
          { error: "No content provided for backup" },
          { status: 400 }
        );
      }

      const result = await uploadBackup(content);

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        fileId: result.fileId,
        webViewLink: result.webViewLink,
      });
    }

    // Handle file uploads
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadFn = type === "cover_letter" ? uploadCoverLetter : uploadResume;

    const result = await uploadFn(
      fileName || file.name,
      buffer,
      file.type || "application/pdf"
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    let shareableLink: string | null = null;
    if (createLink && result.fileId) {
      shareableLink = await createShareableLink(result.fileId);
    }

    return NextResponse.json({
      success: true,
      fileId: result.fileId,
      webViewLink: result.webViewLink,
      shareableLink,
    });
  } catch (error) {
    console.error("Drive upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
