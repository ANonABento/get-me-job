import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { generateId } from "@/lib/utils";
import { saveDocument, getLLMConfig } from "@/lib/db";
import { extractTextFromFile } from "@/lib/parser/pdf";
import { classifyDocument } from "@/lib/parser/document-classifier";
import { parseDocumentByType } from "@/lib/parser/resume";
import { smartParseResume, type SmartParseResult } from "@/lib/parser/smart-parser";
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

    console.log(`[upload] File received: ${file.name} (${file.size} bytes, ${file.type})`);

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
        { error: "Invalid file type. Allowed types: PDF, DOCX, and TXT" },
        { status: 400 }
      );
    }

    // Read file bytes for magic byte validation
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate magic bytes match claimed MIME type
    const magicBytesValid = validateFileMagicBytes(buffer, file.type);
    console.log(`[upload] Magic bytes validated: ${magicBytesValid}`);
    if (!magicBytesValid) {
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
      console.log(`[upload] Text extracted: ${extractedText.length} chars`);
    } catch (err) {
      console.error("[upload] Text extraction failed:", err instanceof Error ? err.stack : err);
    }

    // Classify document type using LLM with filename fallback
    const llmConfig = getLLMConfig();
    const docType = await classifyDocument(extractedText, file.name, llmConfig);

    // Parse document content — smart parser (deterministic first, LLM fallback)
    let parsedData: ParsedDocumentData | undefined;
    let smartResult: SmartParseResult | undefined;
    if (extractedText && docType !== "portfolio" && docType !== "other") {
      try {
        if (docType === "resume") {
          // Use smart parser pipeline for resumes
          smartResult = await smartParseResume(extractedText, llmConfig);
          parsedData = { docType: "resume", data: smartResult.profile };
          console.log(
            `[upload] Smart parse: confidence=${smartResult.confidence.toFixed(2)}, ` +
            `sections=${smartResult.sectionsDetected.join(",")}, ` +
            `llmUsed=${smartResult.llmUsed}, llmSections=${smartResult.llmSectionsCount}`
          );
          if (smartResult.warnings.length > 0) {
            console.log(`[upload] Parse warnings: ${smartResult.warnings.join("; ")}`);
          }
        } else if (llmConfig) {
          // Non-resume doc types still use LLM-based parsing
          const parseResult = await parseDocumentByType(extractedText, docType, llmConfig);
          if (parseResult.coverLetter) {
            parsedData = { docType: "cover_letter", data: parseResult.coverLetter };
          } else if (parseResult.referenceLetter) {
            parsedData = { docType: "reference_letter", data: parseResult.referenceLetter };
          } else if (parseResult.certificate) {
            parsedData = { docType: "certificate", data: parseResult.certificate };
          }
        }
      } catch (err) {
        console.error("[upload] Document parsing failed:", err instanceof Error ? err.stack : err);
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
    console.log(`[upload] Document saved: ${id}`);

    // Ingest into knowledge bank — writes to profile_bank table (what the UI reads)
    if (parsedData?.data) {
      try {
        const { insertBankEntries } = await import("@/lib/db/profile-bank");
        const profile = parsedData.data as Record<string, unknown>;
        const entries: Array<{ category: "experience" | "education" | "skill" | "project" | "certification" | "achievement"; content: Record<string, unknown>; sourceDocumentId: string }> = [];

        // Chunk profile into bank entries (only valid BankCategory types)
        const experiences = profile.experiences as Record<string, unknown>[] | undefined;
        if (experiences?.length) {
          for (const exp of experiences) {
            entries.push({ category: "experience", content: exp, sourceDocumentId: id });
          }
        }
        const education = profile.education as Record<string, unknown>[] | undefined;
        if (education?.length) {
          for (const edu of education) {
            entries.push({ category: "education", content: edu, sourceDocumentId: id });
          }
        }
        const skills = profile.skills as Record<string, unknown>[] | undefined;
        if (skills?.length) {
          for (const skill of skills) {
            entries.push({ category: "skill", content: skill, sourceDocumentId: id });
          }
        }
        const projects = profile.projects as Record<string, unknown>[] | undefined;
        if (projects?.length) {
          for (const proj of projects) {
            entries.push({ category: "project", content: proj, sourceDocumentId: id });
          }
        }

        // If no structured entries (basic parser), store the raw text as a single entry
        if (entries.length === 0 && extractedText) {
          const contact = profile.contact as Record<string, unknown> | undefined;
          const name = (contact?.name as string) || file.name;
          entries.push({
            category: "experience",
            content: { title: "Uploaded Resume", company: name, description: extractedText.slice(0, 2000) },
            sourceDocumentId: id,
          });
          console.log("[upload] No structured sections found — stored as raw entry");
        }

        if (entries.length > 0) {
          insertBankEntries(entries, authResult.userId);
          console.log(`[upload] Ingested ${entries.length} entries into bank`);
        }
      } catch (err) {
        console.error("[upload] Bank ingest failed:", err instanceof Error ? err.stack : err);
      }
    }

    return NextResponse.json({
      success: true,
      document: {
        id,
        filename: file.name,
        type: docType,
        size: file.size,
        extractedText: extractedText ? extractedText.slice(0, 500) + "..." : null,
      },
      ...(smartResult && {
        parsing: {
          confidence: smartResult.confidence,
          sectionsDetected: smartResult.sectionsDetected,
          llmUsed: smartResult.llmUsed,
          llmSectionsCount: smartResult.llmSectionsCount,
          warnings: smartResult.warnings,
        },
      }),
    });
  } catch (error) {
    console.error("[upload] Upload error:", error instanceof Error ? error.stack : error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
