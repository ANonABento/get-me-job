/**
 * Google Drive Import API
 *
 * POST /api/google/drive/import - Download file content from Google Drive
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { downloadFile, getFileMetadata } from "@/lib/google/drive";
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
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { error: "No file ID provided" },
        { status: 400 }
      );
    }

    // Get file metadata first
    const metadata = await getFileMetadata(fileId);
    if (!metadata) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Download the file content
    const content = await downloadFile(fileId);
    if (!content) {
      return NextResponse.json(
        { error: "Failed to download file" },
        { status: 500 }
      );
    }

    // Return the file content as base64 for the client to process
    return NextResponse.json({
      success: true,
      fileId,
      fileName: metadata.name,
      mimeType: metadata.mimeType,
      content: content.toString("base64"),
    });
  } catch (error) {
    console.error("Drive import error:", error);
    return NextResponse.json(
      { error: "Failed to import file" },
      { status: 500 }
    );
  }
}
