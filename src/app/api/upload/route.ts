import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { generateId } from "@/lib/utils";
import { saveDocument, getLLMConfig } from "@/lib/db";
import { extractTextFromFile } from "@/lib/parser/pdf";
import { classifyDocument } from "@/lib/parser/document-classifier";
import { parseDocumentByType } from "@/lib/parser/resume";
import type { ParsedDocumentData } from "@/types";
import {
  MAX_FILE_SIZE_BYTES,
  ALLOWED_MIME_TYPES,
  validateFileMagicBytes,
  PATHS,
} from "@/lib/constants";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const maxMB = MAX_FILE_SIZE_BYTES / (1024 * 1024);
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxMB}MB` },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed types: PDF and TXT" },
        { status: 400 }
      );
    }

    // Read file bytes for magic byte validation
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate magic bytes match claimed MIME type
    if (!validateFileMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { error: "File content does not match its type. Please upload a valid document." },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    await mkdir(PATHS.UPLOADS, { recursive: true });

    // Generate unique filename
    const ext = path.extname(file.name);
    const id = generateId();
    const filename = `${id}${ext}`;
    const filePath = path.join(PATHS.UPLOADS, filename);
    await writeFile(filePath, buffer);

    // Extract text
    let extractedText: string | undefined;
    try {
      extractedText = await extractTextFromFile(filePath);
    } catch (err) {
      console.error("Text extraction failed:", err);
    }

    // Classify document type using LLM with filename fallback
    const llmConfig = getLLMConfig();
    const docType = await classifyDocument(extractedText, file.name, llmConfig);

    // Parse document content with type-specific prompt
    let parsedData: ParsedDocumentData | undefined;
    if (extractedText && llmConfig && docType !== "portfolio" && docType !== "other") {
      try {
        const parseResult = await parseDocumentByType(extractedText, docType, llmConfig);
        if (parseResult.parsedProfile) {
          parsedData = { docType: "resume", data: parseResult.parsedProfile };
        } else if (parseResult.coverLetter) {
          parsedData = { docType: "cover_letter", data: parseResult.coverLetter };
        } else if (parseResult.referenceLetter) {
          parsedData = { docType: "reference_letter", data: parseResult.referenceLetter };
        } else if (parseResult.certificate) {
          parsedData = { docType: "certificate", data: parseResult.certificate };
        }
      } catch (err) {
        console.error("Document parsing failed:", err);
      }
    }

    // Save to database
    saveDocument({
      id,
      filename: file.name,
      type: docType,
      mimeType: file.type,
      size: file.size,
      path: filePath,
      extractedText,
      parsedData,
    }, authResult.userId);

    return NextResponse.json({
      success: true,
      document: {
        id,
        filename: file.name,
        type: docType,
        size: file.size,
        extractedText: extractedText ? extractedText.slice(0, 500) + "..." : null,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
