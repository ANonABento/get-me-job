/**
 * Google Drive Operations
 *
 * Store resumes, cover letters, and job search documents in Google Drive
 */

import { Readable } from "stream";
import { createDriveClient } from "./client";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
}

export interface UploadResult {
  success: boolean;
  fileId?: string;
  webViewLink?: string;
  webContentLink?: string;
  error?: string;
}

const ROOT_FOLDER_NAME = "Get Me Job";
const SUBFOLDERS = ["Resumes", "Cover Letters", "Company Research", "Backups"];

/**
 * Get or create the root "Get Me Job" folder
 */
export async function getOrCreateRootFolder(): Promise<string> {
  const drive = await createDriveClient();

  // Search for existing folder
  const response = await drive.files.list({
    q: `name='${ROOT_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id, name)",
  });

  if (response.data.files && response.data.files.length > 0) {
    return response.data.files[0].id!;
  }

  // Create new folder
  const folder = await drive.files.create({
    requestBody: {
      name: ROOT_FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
    },
    fields: "id",
  });

  return folder.data.id!;
}

/**
 * Get or create a subfolder within the root folder
 */
export async function getOrCreateSubfolder(
  subfolderName: string
): Promise<string> {
  const drive = await createDriveClient();
  const rootFolderId = await getOrCreateRootFolder();

  // Search for existing subfolder
  const response = await drive.files.list({
    q: `name='${subfolderName}' and '${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id, name)",
  });

  if (response.data.files && response.data.files.length > 0) {
    return response.data.files[0].id!;
  }

  // Create new subfolder
  const folder = await drive.files.create({
    requestBody: {
      name: subfolderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [rootFolderId],
    },
    fields: "id",
  });

  return folder.data.id!;
}

/**
 * Initialize folder structure
 */
export async function initializeFolderStructure(): Promise<void> {
  for (const subfolder of SUBFOLDERS) {
    await getOrCreateSubfolder(subfolder);
  }
}

/**
 * Upload a file to Google Drive
 */
export async function uploadFile(
  fileName: string,
  content: Buffer | string,
  mimeType: string,
  folderId?: string
): Promise<UploadResult> {
  try {
    const drive = await createDriveClient();

    const targetFolderId = folderId || (await getOrCreateRootFolder());

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [targetFolderId],
      },
      media: {
        mimeType,
        body: Readable.from(
          typeof content === "string" ? Buffer.from(content) : content
        ),
      },
      fields: "id, webViewLink, webContentLink",
    });

    return {
      success: true,
      fileId: response.data.id || undefined,
      webViewLink: response.data.webViewLink || undefined,
      webContentLink: response.data.webContentLink || undefined,
    };
  } catch (error) {
    console.error("Failed to upload file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Upload a resume to the Resumes folder
 */
export async function uploadResume(
  fileName: string,
  content: Buffer,
  mimeType = "application/pdf"
): Promise<UploadResult> {
  const folderId = await getOrCreateSubfolder("Resumes");
  return uploadFile(fileName, content, mimeType, folderId);
}

/**
 * Upload a cover letter to the Cover Letters folder
 */
export async function uploadCoverLetter(
  fileName: string,
  content: Buffer,
  mimeType = "application/pdf"
): Promise<UploadResult> {
  const folderId = await getOrCreateSubfolder("Cover Letters");
  return uploadFile(fileName, content, mimeType, folderId);
}

/**
 * Upload company research to the Company Research folder
 */
export async function uploadCompanyResearch(
  companyName: string,
  content: string
): Promise<UploadResult> {
  const folderId = await getOrCreateSubfolder("Company Research");
  const fileName = `${companyName}.md`;
  return uploadFile(fileName, content, "text/markdown", folderId);
}

/**
 * Upload a backup file
 */
export async function uploadBackup(content: string): Promise<UploadResult> {
  const folderId = await getOrCreateSubfolder("Backups");
  const timestamp = new Date().toISOString().split("T")[0];
  const fileName = `job-search-backup-${timestamp}.json`;
  return uploadFile(fileName, content, "application/json", folderId);
}

/**
 * Create a shareable link for a file
 */
export async function createShareableLink(
  fileId: string
): Promise<string | null> {
  try {
    const drive = await createDriveClient();

    // Create anyone-with-link permission
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // Get the shareable link
    const file = await drive.files.get({
      fileId,
      fields: "webViewLink",
    });

    return file.data.webViewLink || null;
  } catch (error) {
    console.error("Failed to create shareable link:", error);
    return null;
  }
}

/**
 * List files in a folder
 */
export async function listFiles(
  folderId?: string,
  mimeType?: string
): Promise<DriveFile[]> {
  const drive = await createDriveClient();

  const targetFolderId = folderId || (await getOrCreateRootFolder());

  let query = `'${targetFolderId}' in parents and trashed=false`;
  if (mimeType) {
    query += ` and mimeType='${mimeType}'`;
  }

  const response = await drive.files.list({
    q: query,
    fields:
      "files(id, name, mimeType, webViewLink, webContentLink, createdTime, modifiedTime, size)",
    orderBy: "modifiedTime desc",
  });

  return (response.data.files || []).map((file) => ({
    id: file.id!,
    name: file.name!,
    mimeType: file.mimeType!,
    webViewLink: file.webViewLink || undefined,
    webContentLink: file.webContentLink || undefined,
    createdTime: file.createdTime || undefined,
    modifiedTime: file.modifiedTime || undefined,
    size: file.size || undefined,
  }));
}

/**
 * List resumes from Drive
 */
export async function listResumes(): Promise<DriveFile[]> {
  const folderId = await getOrCreateSubfolder("Resumes");
  return listFiles(folderId);
}

/**
 * List cover letters from Drive
 */
export async function listCoverLetters(): Promise<DriveFile[]> {
  const folderId = await getOrCreateSubfolder("Cover Letters");
  return listFiles(folderId);
}

/**
 * List backups from Drive
 */
export async function listBackups(): Promise<DriveFile[]> {
  const folderId = await getOrCreateSubfolder("Backups");
  return listFiles(folderId, "application/json");
}

/**
 * Download file content
 */
export async function downloadFile(fileId: string): Promise<Buffer | null> {
  try {
    const drive = await createDriveClient();

    const response = await drive.files.get(
      {
        fileId,
        alt: "media",
      },
      {
        responseType: "arraybuffer",
      }
    );

    return Buffer.from(response.data as ArrayBuffer);
  } catch (error) {
    console.error("Failed to download file:", error);
    return null;
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(fileId: string): Promise<DriveFile | null> {
  try {
    const drive = await createDriveClient();

    const response = await drive.files.get({
      fileId,
      fields:
        "id, name, mimeType, webViewLink, webContentLink, createdTime, modifiedTime, size",
    });

    return {
      id: response.data.id!,
      name: response.data.name!,
      mimeType: response.data.mimeType!,
      webViewLink: response.data.webViewLink || undefined,
      webContentLink: response.data.webContentLink || undefined,
      createdTime: response.data.createdTime || undefined,
      modifiedTime: response.data.modifiedTime || undefined,
      size: response.data.size || undefined,
    };
  } catch (error) {
    console.error("Failed to get file metadata:", error);
    return null;
  }
}

/**
 * Delete a file
 */
export async function deleteFile(fileId: string): Promise<boolean> {
  try {
    const drive = await createDriveClient();
    await drive.files.delete({ fileId });
    return true;
  } catch (error) {
    console.error("Failed to delete file:", error);
    return false;
  }
}

/**
 * Move a file to trash
 */
export async function trashFile(fileId: string): Promise<boolean> {
  try {
    const drive = await createDriveClient();
    await drive.files.update({
      fileId,
      requestBody: { trashed: true },
    });
    return true;
  } catch (error) {
    console.error("Failed to trash file:", error);
    return false;
  }
}
