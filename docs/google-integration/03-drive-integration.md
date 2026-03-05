# Phase 3: Drive Integration

> Store resumes, cover letters, and job search documents in Google Drive

---

## Overview

| Field | Value |
|-------|-------|
| **Phase** | 3 |
| **Priority** | High |
| **Effort** | Medium (4-5 days) |
| **Dependencies** | Phase 1 (OAuth Foundation) |
| **Blocks** | Phase 5 (Docs & Sheets) |

---

## Goals

1. Upload generated resumes and cover letters to Google Drive
2. Organize files in a "Get Me Job" folder structure
3. Import existing resumes from Drive for parsing
4. Generate shareable links for applications
5. Backup entire job search data to Drive

---

## Features

### 3.1 Folder Structure

```
Google Drive/
└── Get Me Job/
    ├── Resumes/
    │   ├── Base Resume.pdf
    │   ├── TechCorp - Software Engineer.pdf
    │   └── StartupXYZ - Full Stack Developer.pdf
    ├── Cover Letters/
    │   ├── TechCorp - Cover Letter.pdf
    │   └── StartupXYZ - Cover Letter.pdf
    ├── Company Research/
    │   ├── TechCorp.md
    │   └── StartupXYZ.md
    └── Backups/
        └── job-search-backup-2026-03-05.json
```

### 3.2 Upload Features

| Feature | Description |
|---------|-------------|
| **Save Resume** | Upload tailored resume PDF to Drive |
| **Save Cover Letter** | Upload cover letter to Drive |
| **Quick Share** | Generate shareable link for applications |
| **Auto-organize** | Files named and organized by company |

### 3.3 Import Features

| Feature | Description |
|---------|-------------|
| **Import Resume** | Select resume from Drive for parsing |
| **Browse Files** | File picker for Drive documents |
| **Drag & Drop** | Alternative to local file upload |

---

## Tasks

### 3.1 Drive Operations Library

**File:** `src/lib/google/drive.ts`

```typescript
import { google, drive_v3 } from 'googleapis';
import { createDriveClient } from './client';
import { Readable } from 'stream';

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

const ROOT_FOLDER_NAME = 'Get Me Job';
const SUBFOLDERS = ['Resumes', 'Cover Letters', 'Company Research', 'Backups'];

/**
 * Get or create the root "Get Me Job" folder
 */
export async function getOrCreateRootFolder(): Promise<string> {
  const drive = await createDriveClient();

  // Search for existing folder
  const response = await drive.files.list({
    q: `name='${ROOT_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
  });

  if (response.data.files && response.data.files.length > 0) {
    return response.data.files[0].id!;
  }

  // Create new folder
  const folder = await drive.files.create({
    requestBody: {
      name: ROOT_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id',
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
    fields: 'files(id, name)',
  });

  if (response.data.files && response.data.files.length > 0) {
    return response.data.files[0].id!;
  }

  // Create new subfolder
  const folder = await drive.files.create({
    requestBody: {
      name: subfolderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [rootFolderId],
    },
    fields: 'id',
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

    const targetFolderId = folderId || await getOrCreateRootFolder();

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [targetFolderId],
      },
      media: {
        mimeType,
        body: Readable.from(typeof content === 'string' ? Buffer.from(content) : content),
      },
      fields: 'id, webViewLink, webContentLink',
    });

    return {
      success: true,
      fileId: response.data.id || undefined,
      webViewLink: response.data.webViewLink || undefined,
      webContentLink: response.data.webContentLink || undefined,
    };
  } catch (error) {
    console.error('Failed to upload file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Upload a resume to the Resumes folder
 */
export async function uploadResume(
  fileName: string,
  content: Buffer,
  mimeType = 'application/pdf'
): Promise<UploadResult> {
  const folderId = await getOrCreateSubfolder('Resumes');
  return uploadFile(fileName, content, mimeType, folderId);
}

/**
 * Upload a cover letter to the Cover Letters folder
 */
export async function uploadCoverLetter(
  fileName: string,
  content: Buffer,
  mimeType = 'application/pdf'
): Promise<UploadResult> {
  const folderId = await getOrCreateSubfolder('Cover Letters');
  return uploadFile(fileName, content, mimeType, folderId);
}

/**
 * Upload a backup file
 */
export async function uploadBackup(
  content: string
): Promise<UploadResult> {
  const folderId = await getOrCreateSubfolder('Backups');
  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `job-search-backup-${timestamp}.json`;
  return uploadFile(fileName, content, 'application/json', folderId);
}

/**
 * Create a shareable link for a file
 */
export async function createShareableLink(fileId: string): Promise<string | null> {
  try {
    const drive = await createDriveClient();

    // Create anyone-with-link permission
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Get the shareable link
    const file = await drive.files.get({
      fileId,
      fields: 'webViewLink',
    });

    return file.data.webViewLink || null;
  } catch (error) {
    console.error('Failed to create shareable link:', error);
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

  const targetFolderId = folderId || await getOrCreateRootFolder();

  let query = `'${targetFolderId}' in parents and trashed=false`;
  if (mimeType) {
    query += ` and mimeType='${mimeType}'`;
  }

  const response = await drive.files.list({
    q: query,
    fields: 'files(id, name, mimeType, webViewLink, webContentLink, createdTime, modifiedTime, size)',
    orderBy: 'modifiedTime desc',
  });

  return (response.data.files || []).map(file => ({
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
  const folderId = await getOrCreateSubfolder('Resumes');
  return listFiles(folderId);
}

/**
 * Download file content
 */
export async function downloadFile(fileId: string): Promise<Buffer | null> {
  try {
    const drive = await createDriveClient();

    const response = await drive.files.get({
      fileId,
      alt: 'media',
    }, {
      responseType: 'arraybuffer',
    });

    return Buffer.from(response.data as ArrayBuffer);
  } catch (error) {
    console.error('Failed to download file:', error);
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
    console.error('Failed to delete file:', error);
    return false;
  }
}
```

### 3.2 API Routes

**File:** `src/app/api/google/drive/upload/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { uploadResume, uploadCoverLetter, createShareableLink } from '@/lib/google/drive';
import { isGoogleConnected } from '@/lib/google/client';

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const connected = await isGoogleConnected();
  if (!connected) {
    return NextResponse.json(
      { error: 'Google account not connected' },
      { status: 400 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'resume' | 'cover_letter';
    const fileName = formData.get('fileName') as string;
    const createLink = formData.get('createShareableLink') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadFn = type === 'cover_letter' ? uploadCoverLetter : uploadResume;

    const result = await uploadFn(
      fileName || file.name,
      buffer,
      file.type || 'application/pdf'
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
    console.error('Drive upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
```

**File:** `src/app/api/google/drive/list/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { listFiles, listResumes, getOrCreateSubfolder } from '@/lib/google/drive';
import { isGoogleConnected } from '@/lib/google/client';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const connected = await isGoogleConnected();
  if (!connected) {
    return NextResponse.json(
      { error: 'Google account not connected' },
      { status: 400 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const folder = searchParams.get('folder'); // 'resumes', 'cover_letters', etc.

    let files;
    if (folder === 'resumes') {
      files = await listResumes();
    } else if (folder) {
      const folderId = await getOrCreateSubfolder(folder);
      files = await listFiles(folderId);
    } else {
      files = await listFiles();
    }

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Drive list error:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}
```

**File:** `src/app/api/google/drive/import/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { downloadFile } from '@/lib/google/drive';
import { isGoogleConnected } from '@/lib/google/client';

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const connected = await isGoogleConnected();
  if (!connected) {
    return NextResponse.json(
      { error: 'Google account not connected' },
      { status: 400 }
    );
  }

  try {
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: 'No file ID provided' }, { status: 400 });
    }

    const content = await downloadFile(fileId);
    if (!content) {
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
    }

    // Return the file content as base64 for the client to process
    return NextResponse.json({
      success: true,
      content: content.toString('base64'),
    });
  } catch (error) {
    console.error('Drive import error:', error);
    return NextResponse.json(
      { error: 'Failed to import file' },
      { status: 500 }
    );
  }
}
```

### 3.3 UI Components

**File:** `src/components/google/DriveFilePicker.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FolderOpen, FileText, Loader2 } from 'lucide-react';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
}

interface DriveFilePickerProps {
  onSelect: (file: DriveFile) => void;
  folder?: string;
  accept?: string[];
}

export function DriveFilePicker({ onSelect, folder = 'resumes', accept }: DriveFilePickerProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadFiles();
    }
  }, [open, folder]);

  async function loadFiles() {
    setLoading(true);
    try {
      const res = await fetch(`/api/google/drive/list?folder=${folder}`);
      const data = await res.json();

      let filteredFiles = data.files || [];
      if (accept && accept.length > 0) {
        filteredFiles = filteredFiles.filter((f: DriveFile) =>
          accept.some(type => f.mimeType.includes(type))
        );
      }

      setFiles(filteredFiles);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(file: DriveFile) {
    onSelect(file);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FolderOpen className="mr-2 h-4 w-4" />
          Import from Google Drive
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select File from Google Drive</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No files found in this folder
          </p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {files.map(file => (
              <button
                key={file.id}
                onClick={() => handleSelect(file)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted text-left"
              >
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  {file.modifiedTime && (
                    <p className="text-sm text-muted-foreground">
                      Modified: {new Date(file.modifiedTime).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

**File:** `src/components/google/SaveToDriveButton.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Cloud, Loader2, CheckCircle, Link } from 'lucide-react';
import { toast } from 'sonner';

interface SaveToDriveButtonProps {
  file: File | Blob;
  fileName: string;
  type: 'resume' | 'cover_letter';
  onSuccess?: (result: { fileId: string; shareableLink?: string }) => void;
}

export function SaveToDriveButton({ file, fileName, type, onSuccess }: SaveToDriveButtonProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(createLink = false) {
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', fileName);
      formData.append('type', type);
      formData.append('createShareableLink', String(createLink));

      const res = await fetch('/api/google/drive/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setSaved(true);
        toast.success('Saved to Google Drive');

        if (data.shareableLink) {
          navigator.clipboard.writeText(data.shareableLink);
          toast.success('Shareable link copied to clipboard');
        }

        onSuccess?.({
          fileId: data.fileId,
          shareableLink: data.shareableLink,
        });
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save to Drive');
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <Button variant="outline" className="text-green-600" disabled>
        <CheckCircle className="mr-2 h-4 w-4" />
        Saved to Drive
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button onClick={() => handleSave(false)} disabled={saving}>
        {saving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Cloud className="mr-2 h-4 w-4" />
        )}
        Save to Drive
      </Button>
      <Button variant="outline" onClick={() => handleSave(true)} disabled={saving}>
        <Link className="mr-2 h-4 w-4" />
        Save & Get Link
      </Button>
    </div>
  );
}
```

---

## Integration Points

### Resume Generation Page
- Add "Save to Drive" button after PDF generation
- Add "Get Shareable Link" for quick application submission

### Upload Page
- Add "Import from Drive" as alternative to local upload
- Show Drive file picker for resume selection

### Documents Page
- Show files from Google Drive alongside local files
- Sync status indicator

---

## Testing

### Manual Testing Checklist

- [ ] Folder structure is created on first use
- [ ] Can upload resume to Resumes folder
- [ ] Can upload cover letter to Cover Letters folder
- [ ] Can create shareable link
- [ ] Can list files from Drive
- [ ] Can import/download file from Drive
- [ ] Can delete file from Drive

---

## Acceptance Criteria

1. [ ] "Get Me Job" folder structure created in Drive
2. [ ] Resumes saved to Resumes subfolder
3. [ ] Cover letters saved to Cover Letters subfolder
4. [ ] Shareable links generated for applications
5. [ ] File picker shows Drive contents
6. [ ] Can import resume from Drive for parsing
7. [ ] Backup functionality works

---

*Status: Not Started*
*Created: March 2026*
