/**
 * @route POST /api/upload
 * @description Upload a document (resume/cover letter) with automatic parsing and profile bank ingestion
 * @auth Required
 * @request FormData with file field
 * @response UploadResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import crypto from "crypto";
import path from "path";
import { parseSearchParams } from "@/lib/api-utils";
import { generateId } from "@/lib/utils";
import {
  saveDocument,
  getDocumentByFileHash,
  DuplicateDocumentError,
  getProfile,
  updateProfile,
  getLLMConfig,
} from "@/lib/db";
import { extractTextFromFile } from "@/lib/parser/pdf";
import { classifyDocument } from "@/lib/parser/document-classifier";
import {
  smartParseResume,
  type SmartParseResult,
} from "@/lib/parser/smart-parser";
import {
  parseCareerNotesBasic,
  parseCoverLetterBasic,
  parsePortfolioBasic,
} from "@/lib/parser/resume";
import { cachePdfBytes } from "@/lib/parse/pdf-cache";
import {
  deriveHeaderSearchNeedles,
  deriveSearchNeedles,
  extractPdfPositions,
  findSourceLinksForBboxes,
  findPositionsForText,
  type AnchorBbox,
  type PositionTuple,
} from "@/lib/parse/pdf-positions";
import {
  listBankEntriesPaginated,
  updateBankEntryPositions,
} from "@/lib/db/profile-bank";
import { isLLMConfigured } from "@/lib/llm/is-configured";
import type { ParsedDocumentData } from "@/types";
import {
  MAX_FILE_SIZE_BYTES,
  ALLOWED_MIME_TYPES,
  validateFileMagicBytes,
  PATHS,
} from "@/lib/constants";
import { sanitizeFilename } from "@/lib/upload/filename";
import { requireAuth, isAuthError } from "@/lib/auth";
import { mergeParsedProfileForAutoPromote } from "@/lib/profile/auto-promote";
import { uploadQuerySchema } from "@/lib/schemas";
import { log } from "@/lib/log";

export const dynamic = "force-dynamic";

/**
 * Heuristic for detecting password-protected / encrypted PDFs from the parser
 * error message. pdf-parse throws strings that vary by build, so match the
 * common substrings rather than a strict equality.
 */
const ENCRYPTION_HINTS = ["encrypt", "password", "permission denied"];

function isEncryptedPdfError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();
  return ENCRYPTION_HINTS.some((hint) => lower.includes(hint));
}

function buildExistingDocumentResponse(
  existing: NonNullable<ReturnType<typeof getDocumentByFileHash>>,
): NextResponse {
  return NextResponse.json(
    {
      error: "Duplicate file upload",
      existing: {
        id: existing.id,
        filename: existing.filename,
        uploaded_at: existing.uploadedAt,
        uploadedAt: existing.uploadedAt,
        type: existing.type,
        size: existing.size,
      },
    },
    { status: 409 },
  );
}

function buildExtractedTextPreview(extractedText: string): string {
  return `${extractedText
    .slice(0, 500)
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()}...`;
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const query = parseSearchParams(
    request.nextUrl.searchParams,
    uploadQuerySchema,
  );
  if (!query.ok) return query.response;
  const forceUpload = query.data.force;

  // Track the on-disk file (if written) so we can clean up on any error path.
  let writtenFilePath: string | undefined;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    log.debug("upload", "file received");

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const maxMB = MAX_FILE_SIZE_BYTES / (1024 * 1024);
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxMB}MB` },
        { status: 400 },
      );
    }

    // Validate MIME type
    if (
      !ALLOWED_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_MIME_TYPES)[number],
      )
    ) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed types: PDF, DOCX, and TXT" },
        { status: 400 },
      );
    }

    // Read file bytes for magic byte validation
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");

    // Validate magic bytes match claimed MIME type
    const magicBytesValid = validateFileMagicBytes(buffer, file.type);
    log.debug("upload", "magic bytes validated", { valid: magicBytesValid });
    if (!magicBytesValid) {
      return NextResponse.json(
        {
          error:
            "File content does not match its type. Please upload a valid document.",
        },
        { status: 400 },
      );
    }

    const existingDocument = getDocumentByFileHash(fileHash, authResult.userId);
    if (existingDocument && !forceUpload) {
      return buildExistingDocumentResponse(existingDocument);
    }

    // Ensure upload directory exists
    await mkdir(PATHS.UPLOADS, { recursive: true });

    if (existingDocument && forceUpload) {
      const { deleteSourceDocuments } = await import("@/lib/db/profile-bank");
      deleteSourceDocuments([existingDocument.id], authResult.userId);
      await unlink(existingDocument.path).catch(() => undefined);
    }

    // Generate unique filename and persist to disk so the parser (which reads
    // from a path, not memory) has something to open.
    const ext = path.extname(file.name);
    const id = generateId();
    const filename = `${id}${ext}`;
    const filePath = path.join(PATHS.UPLOADS, filename);
    await writeFile(filePath, buffer);
    writtenFilePath = filePath;

    // ------------------------------------------------------------------
    // Parse FIRST. We only persist the document row (and bank entries) once
    // we have a successful parse — issues #218/#219/#220 all stem from the
    // legacy ordering where the row was saved even when the PDF was corrupt,
    // password-protected, or empty.
    // ------------------------------------------------------------------
    let extractedText: string;
    try {
      extractedText = await extractTextFromFile(filePath);
      log.debug("upload", "text extracted", {
        chars: extractedText.length,
      });
    } catch (err) {
      console.error(
        "[upload] Text extraction failed:",
        err instanceof Error ? err.stack : err,
      );
      await unlink(filePath).catch(() => undefined);
      writtenFilePath = undefined;

      if (isEncryptedPdfError(err)) {
        return NextResponse.json(
          {
            error: "password_protected",
            message:
              "This PDF is password-protected. Please remove the password and re-upload.",
          },
          { status: 422 },
        );
      }
      return NextResponse.json(
        {
          error: "parse_failed",
          message:
            "We couldn't read this PDF. The file may be corrupted — please re-export and try again.",
        },
        { status: 422 },
      );
    }

    if (!extractedText || extractedText.trim().length === 0) {
      console.warn("[upload] Empty extraction — rejecting upload");
      await unlink(filePath).catch(() => undefined);
      writtenFilePath = undefined;
      return NextResponse.json(
        {
          error: "empty_document",
          message: "Could not extract any text from this PDF.",
        },
        { status: 422 },
      );
    }

    // Classifier uses the user's configured LLM provider when available so
    // upload respects /settings/llm (no hardcoded Ollama fallback). Heavy
    // resume parsing is still gated behind the explicit /api/parse action —
    // only the lightweight (500-char, 50-token) classifier hits the provider
    // here. `isLLMConfigured` mirrors the LLMClient env-fallback logic so a
    // DB-empty config with `OPENAI_API_KEY` set in `.env.local` still routes
    // through OpenAI instead of falling through to filename heuristics.
    const userLLMConfig = getLLMConfig(authResult.userId);
    const classifierConfig = isLLMConfigured(userLLMConfig)
      ? userLLMConfig
      : null;
    const docType = await classifyDocument(
      extractedText,
      file.name,
      classifierConfig,
    );

    // Parse document content — deterministic parser only. All LLM calls are now
    // reserved for explicit parse actions from the UI.
    let parsedData: ParsedDocumentData | undefined;
    let smartResult: SmartParseResult | undefined;
    if (docType === "resume") {
      try {
        smartResult = await smartParseResume(extractedText, null);
        parsedData = { docType: "resume", data: smartResult.profile };
        log.debug("upload", "smart parse complete", {
          confidence: smartResult.confidence,
          sections: smartResult.sectionsDetected,
          llmUsed: smartResult.llmUsed,
          llmSections: smartResult.llmSectionsCount,
        });
        if (smartResult.warnings.length > 0) {
          log.debug("upload", "parse warnings", {
            warnings: smartResult.warnings,
          });
        }
      } catch (err) {
        console.error(
          "[upload] Document parsing failed:",
          err instanceof Error ? err.stack : err,
        );
      }
    } else if (docType === "cover_letter") {
      parsedData = {
        docType: "cover_letter",
        data: parseCoverLetterBasic(extractedText),
      };
    } else if (docType === "portfolio") {
      parsedData = {
        docType: "portfolio",
        data: parsePortfolioBasic(extractedText),
      };
    } else if (docType === "career_notes") {
      parsedData = {
        docType: "career_notes",
        data: parseCareerNotesBasic(extractedText),
      };
    }

    // Sanitize the persisted display filename so XSS / path traversal cannot
    // ride in via the documents table (issue #222). The on-disk path is
    // server-generated above, so we only need to clean what gets stored.
    const safeFilename = sanitizeFilename(file.name);

    // Save to database — wrapped to catch the (user_id, file_hash) UNIQUE
    // constraint violation that closes the concurrent-upload race (issue #221).
    try {
      saveDocument(
        {
          id,
          filename: safeFilename,
          type: docType,
          mimeType: file.type,
          size: file.size,
          path: filePath,
          extractedText,
          parsedData,
          fileHash,
        },
        authResult.userId,
      );
      log.debug("upload", "document saved");
    } catch (err) {
      if (err instanceof DuplicateDocumentError) {
        // A racing request beat us to the insert. Drop our on-disk copy and
        // return the same 409 shape the pre-write check would have produced.
        await unlink(filePath).catch(() => undefined);
        writtenFilePath = undefined;
        const winner = getDocumentByFileHash(fileHash, authResult.userId);
        if (winner) {
          return buildExistingDocumentResponse(winner);
        }
        return NextResponse.json(
          { error: "Duplicate file upload" },
          { status: 409 },
        );
      }
      throw err;
    }

    // Ingest into knowledge bank — writes to profile_bank table (what the UI reads)
    let entriesCreated = 0;
    if (parsedData?.docType === "resume" && parsedData.data) {
      try {
        const { populateBankFromProfile } =
          await import("@/lib/resume/info-bank");
        const result = populateBankFromProfile(
          parsedData.data,
          id,
          authResult.userId,
        );
        entriesCreated = result.inserted;
        if (entriesCreated > 0) {
          log.debug("upload", "bank entries ingested", { entriesCreated });
        } else {
          log.debug("upload", "no structured bank entries found");
        }
      } catch (err) {
        console.error(
          "[upload] Bank ingest failed:",
          err instanceof Error ? err.stack : err,
        );
      }

      try {
        const existingProfile = getProfile(authResult.userId);
        const promoted = mergeParsedProfileForAutoPromote(
          existingProfile,
          parsedData.data,
        );
        if (Object.keys(promoted).length > 0) {
          updateProfile(promoted, authResult.userId);
          log.debug("upload", "auto-promoted parsed resume into profile");
        }
      } catch (err) {
        console.error(
          "[upload] Profile auto-promote failed:",
          err instanceof Error ? err.stack : err,
        );
      }
    } else if (
      parsedData?.docType === "cover_letter" ||
      parsedData?.docType === "portfolio" ||
      parsedData?.docType === "career_notes"
    ) {
      try {
        const { populateBankFromParsedDocument } =
          await import("@/lib/resume/info-bank");
        const result = populateBankFromParsedDocument(
          parsedData,
          id,
          authResult.userId,
        );
        entriesCreated = result.inserted;
        if (entriesCreated > 0) {
          log.debug("upload", "career document bank entries ingested", {
            entriesCreated,
            docType: parsedData.docType,
          });
        } else {
          log.debug("upload", "no structured career document entries found", {
            docType: parsedData.docType,
          });
        }
      } catch (err) {
        console.error(
          "[upload] Career document bank ingest failed:",
          err instanceof Error ? err.stack : err,
        );
      }
    }

    // PF.1 + PF.3 — best-effort: extract per-text-item positions from the
    // PDF, fuzzy-match every newly-created bank entry back to its source
    // location, and stash the original PDF bytes in a TTL cache so the
    // review modal can render a preview. Wrapped in try/catch — a parse
    // failure here must not break the upload itself.
    if (
      entriesCreated > 0 &&
      (file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf"))
    ) {
      try {
        cachePdfBytes(id, authResult.userId, buffer, "application/pdf");
        const positions = await extractPdfPositions(buffer);
        const docEntries = listBankEntriesPaginated({
          userId: authResult.userId,
          sourceDocumentId: id,
          limit: 1000,
        });
        let matched = 0;
        const misses: { category: string; needle: string }[] = [];
        // PF P2.1 — Two-pass matching: roots first (experience,
        // project, education), then bullets anchored under their
        // parent's bbox. Anchoring lets the matcher accept short
        // generic bullets that wouldn't pass the global threshold.
        const ROOT_CATEGORIES = new Set([
          "experience",
          "project",
          "education",
          "certification",
          "hackathon",
        ]);
        const rootEntries = docEntries.filter((e) =>
          ROOT_CATEGORIES.has(e.category),
        );
        const childEntries = docEntries.filter(
          (e) => !ROOT_CATEGORIES.has(e.category),
        );

        /** Resolved root bboxes keyed by entry id, used as anchors. */
        const rootBboxes = new Map<string, PositionTuple[]>();

        const resolveBboxes = (
          entry: (typeof docEntries)[number],
          candidates: string[],
          anchorBbox?: AnchorBbox,
          recordMiss = true,
        ): PositionTuple[] => {
          if (candidates.length === 0) {
            if (recordMiss) {
              misses.push({ category: entry.category, needle: "(empty)" });
            }
            return [];
          }
          let bboxes: PositionTuple[] = [];
          for (const needle of candidates) {
            bboxes = findPositionsForText(needle, positions.items, {
              category: entry.category,
              anchorBbox,
            });
            if (bboxes.length > 0) break;
          }
          if (bboxes.length === 0 && recordMiss) {
            misses.push({ category: entry.category, needle: candidates[0] });
          }
          return bboxes;
        };

        const persistEntryMatch = (
          entry: (typeof docEntries)[number],
          bboxes: PositionTuple[],
          headerBboxes?: PositionTuple[],
        ) => {
          if (bboxes.length === 0) return;
          const firstPage = bboxes[0][0];
          const linkBboxes =
            headerBboxes && headerBboxes.length > 0
              ? [...headerBboxes, ...bboxes]
              : bboxes;
          const sourceLinks = findSourceLinksForBboxes(
            positions.links,
            positions.items,
            linkBboxes,
          );
          updateBankEntryPositions(entry.id, authResult.userId, {
            page: firstPage,
            bboxes,
            headerBboxes,
            sourceLinks,
          });
        };

        for (const entry of rootEntries) {
          const headerBboxes = resolveBboxes(
            entry,
            deriveHeaderSearchNeedles(entry.category, entry.content),
            undefined,
            false,
          );
          const bboxes = resolveBboxes(
            entry,
            deriveSearchNeedles(entry.category, entry.content),
          );
          const effectiveBboxes = bboxes.length > 0 ? bboxes : headerBboxes;
          persistEntryMatch(
            entry,
            effectiveBboxes,
            headerBboxes.length > 0 ? headerBboxes : undefined,
          );
          if (effectiveBboxes.length > 0) {
            rootBboxes.set(
              entry.id,
              headerBboxes.length > 0 ? headerBboxes : effectiveBboxes,
            );
            matched += 1;
          }
        }

        // Build per-page sorted list of root y0s so each child's
        // anchor band can extend to the next-sibling-root's y0.
        // Only the TOP y0 per root contributes — a parent header that
        // matched two visual lines (e.g. "Babysitter" wrapped to a
        // second line "Private Residence | Waterloo, IA") would
        // otherwise add its own second-line y0 to the sorted list,
        // and the anchor for THAT same parent would then cap at its
        // own second line instead of at the real next sibling.
        const rootsByPage = new Map<number, number[]>();
        for (const bboxes of rootBboxes.values()) {
          if (bboxes.length === 0) continue;
          let topY = Infinity;
          let topPage = bboxes[0][0];
          for (const [page, , y0] of bboxes) {
            if (y0 < topY) {
              topY = y0;
              topPage = page;
            }
          }
          const arr = rootsByPage.get(topPage) ?? [];
          arr.push(topY);
          rootsByPage.set(topPage, arr);
        }
        for (const arr of rootsByPage.values()) arr.sort((a, b) => a - b);

        for (const entry of childEntries) {
          let anchorBbox: AnchorBbox | undefined;
          const parentId =
            typeof entry.content.parentId === "string"
              ? entry.content.parentId
              : undefined;
          const parentBboxes = parentId ? rootBboxes.get(parentId) : undefined;
          if (parentBboxes && parentBboxes.length > 0) {
            // Pick the top-most parent bbox as the anchor origin —
            // a wrapped header (two visual lines) would otherwise
            // land on its lower line and cut off bullets that sit
            // between the two parent lines.
            let topY = Infinity;
            let topPage = parentBboxes[0][0];
            for (const [page, , y0] of parentBboxes) {
              if (y0 < topY) {
                topY = y0;
                topPage = page;
              }
            }
            const pageRoots = rootsByPage.get(topPage) ?? [];
            const nextRootY = pageRoots.find((y) => y > topY + 1);
            anchorBbox = {
              page: topPage,
              y0: topY,
              yMax: nextRootY ?? topY + 400,
            };
          }
          const bboxes = resolveBboxes(
            entry,
            deriveSearchNeedles(entry.category, entry.content),
            anchorBbox,
          );
          persistEntryMatch(entry, bboxes);
          if (bboxes.length > 0) {
            matched += 1;
          }
        }
        log.debug("upload", "bank entries matched to positions", {
          matched,
          total: docEntries.length,
          misses: misses
            .slice(0, 20)
            .map(
              (m) =>
                `  [${m.category}] "${m.needle.slice(0, 80)}${m.needle.length > 80 ? "…" : ""}"`,
            ),
        });
      } catch (err) {
        console.error(
          "[upload] PDF position extraction failed (preview unavailable for this upload):",
          err instanceof Error ? `${err.message}\n${err.stack}` : err,
        );
      }
    }

    return NextResponse.json({
      success: true,
      document: {
        id,
        filename: safeFilename,
        type: docType,
        mimeType: file.type,
        size: file.size,
        extractedText: buildExtractedTextPreview(extractedText),
      },
      entriesCreated,
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
    console.error(
      "[upload] Upload error:",
      error instanceof Error ? error.stack : error,
    );
    if (writtenFilePath) {
      await unlink(writtenFilePath).catch(() => undefined);
    }
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
