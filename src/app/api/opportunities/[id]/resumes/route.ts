/**
 * @route GET /api/opportunities/[id]/resumes
 * @description List all generated resumes for an opportunity
 * @route DELETE /api/opportunities/[id]/resumes
 * @description Remove a generated resume by ID
 * @auth Required
 * @response ResumesListResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { getGeneratedResumes, deleteGeneratedResume } from "@/lib/db";
import { unlink } from "fs/promises";
import path from "path";
import { requireAuth, isAuthError } from "@/lib/auth";

// GET - List all generated resumes for an opportunity
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const resumes = getGeneratedResumes(params.id, authResult.userId);

    return NextResponse.json({ resumes });
  } catch (error) {
    console.error("Get resumes error:", error);
    return NextResponse.json(
      { error: "Failed to get generated resumes" },
      { status: 500 },
    );
  }
}

// DELETE - Delete a specific resume (body contains resumeId)
export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const { resumeId, htmlPath } = await request.json();

    if (!resumeId) {
      return NextResponse.json(
        { error: "resumeId is required" },
        { status: 400 },
      );
    }

    // Delete from database
    deleteGeneratedResume(resumeId, authResult.userId);

    // Try to delete the file (optional - don't fail if file doesn't exist)
    if (htmlPath) {
      try {
        const filePath = path.join(process.cwd(), "public", htmlPath);
        await unlink(filePath);
      } catch {
        // File might not exist, that's OK
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete resume error:", error);
    return NextResponse.json(
      { error: "Failed to delete resume" },
      { status: 500 },
    );
  }
}
