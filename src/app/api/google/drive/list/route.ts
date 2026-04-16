/**
 * @route GET /api/google/drive/list
 * @description List files from Google Drive
 * @auth Required
 * @response GoogleDriveListResponse from @/types/api
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  listFiles,
  listResumes,
  listCoverLetters,
  listBackups,
  getOrCreateSubfolder,
} from "@/lib/google/drive";
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
    const folder = searchParams.get("folder"); // 'resumes', 'cover_letters', 'backups', or custom

    let files;

    switch (folder) {
      case "resumes":
        files = await listResumes();
        break;
      case "cover_letters":
        files = await listCoverLetters();
        break;
      case "backups":
        files = await listBackups();
        break;
      case null:
        // List root folder
        files = await listFiles();
        break;
      default:
        // Custom folder name
        const folderId = await getOrCreateSubfolder(folder);
        files = await listFiles(folderId);
    }

    return NextResponse.json({
      success: true,
      folder: folder || "root",
      count: files.length,
      files,
    });
  } catch (error) {
    console.error("Drive list error:", error);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 }
    );
  }
}
