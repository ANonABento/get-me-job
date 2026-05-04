/**
 * Upload stress + edge-case verification harness.
 *
 * Goals:
 *  1. Generate hostile fixtures programmatically (no large committed binaries).
 *  2. Drive them through the real `/api/upload` route handler.
 *  3. Capture response shape, real DB-call call counts, fs writes, and durations.
 *  4. Provide a stable, reusable surface so future hostile inputs slot in.
 *
 * Design: the route handler imports DB / LLM / fs modules lazily or via top-level
 * imports. Tests mock those modules with vitest so the route runs end-to-end
 * (auth, magic byte validation, size limit, file hashing, filename routing) but
 * never hits the real SQLite extension or shells out to OCR.
 *
 * The harness exposes a single `runStressFixture(fixture)` function plus a
 * `createStressFixture(type)` factory so adding a new hostile input is one
 * extra entry in `HOSTILE_INPUT_TYPES` plus a `case` in `createStressFixture`.
 */
import { NextRequest } from "next/server";

export const HOSTILE_INPUT_TYPES = [
  "100-page resume",
  "corrupt PDF",
  "password-protected PDF",
  "empty PDF",
  "wrong file type renamed",
  "concurrent uploads",
  "50MB file",
  "filename injection",
  "nested PDF",
  "unicode-heavy",
] as const;

export type HostileInputType = (typeof HOSTILE_INPUT_TYPES)[number];
export type Severity = "critical" | "high" | "medium" | "low";

export interface StressFixture {
  type: HostileInputType;
  filename: string;
  mimeType: string;
  bytes: Uint8Array;
  expectedBehavior: string;
  notes?: string;
}

export interface CallCounts {
  saveDocument: number;
  insertBankEntries: number;
  writeFile: number;
  unlink: number;
}

export interface StressResult {
  type: HostileInputType;
  status: number;
  body: unknown;
  /** Filename actually persisted to the documents table (if any) */
  persistedFilename?: string;
  /** Filesystem path the upload route attempted to write */
  persistedPath?: string;
  /** Counts of mocked DB / fs side effects observed during the request. */
  calls: CallCounts;
  durationMs: number;
  error?: string;
}

export interface ResultAnalysis {
  graceful: boolean;
  integrityPreserved: boolean;
  pathTraversalSafe: boolean;
  filenameSanitised: boolean;
  severity: Severity;
  summary: string;
  followUpTitle?: string;
  followUpBody?: string;
}

type UploadHandler = (request: NextRequest) => Promise<Response>;

// ---------------------------------------------------------------------------
// PDF emitter (minimal, ASCII only, deterministic)
// ---------------------------------------------------------------------------

const TEXT_ENCODER = new TextEncoder();

function encodeAscii(value: string): Uint8Array {
  return TEXT_ENCODER.encode(value);
}

function escapePdfLiteral(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

/**
 * Build a minimal but valid PDF (one object per page + content stream).
 * Optionally pad the trailing comment so the file is much larger than its
 * useful content (used for the 50MB case).
 */
export function createMinimalPdf(
  pages: string[],
  paddingBytes = 0,
): Uint8Array {
  const objects: string[] = [];
  const pageObjectIds: number[] = [];

  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  // Filled in once we know all page object ids.
  objects.push("");
  objects.push(
    "3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  );

  for (const pageText of pages) {
    const pageObjectId = objects.length + 1;
    const contentObjectId = pageObjectId + 1;
    pageObjectIds.push(pageObjectId);

    const stream = pageText
      ? `BT /F1 12 Tf 72 720 Td (${escapePdfLiteral(pageText)}) Tj ET`
      : "";

    objects.push(
      `${pageObjectId} 0 obj\n` +
        `<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 3 0 R >> >> ` +
        `/MediaBox [0 0 612 792] /Contents ${contentObjectId} 0 R >>\nendobj\n`,
    );
    objects.push(
      `${contentObjectId} 0 obj\n` +
        `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`,
    );
  }

  const kids = pageObjectIds.map((id) => `${id} 0 R`).join(" ");
  objects[1] = `2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>\nendobj\n`;

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += object;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${offsets[index].toString().padStart(10, "0")} 00000 n \n`;
  }
  pdf +=
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n` +
    `startxref\n${xrefOffset}\n%%EOF\n`;

  if (paddingBytes <= 0) return encodeAscii(pdf);

  // Pad with a comment line so we never invalidate the trailer. The %%EOF
  // marker has already been written; PDF readers treat trailing bytes after
  // the final %%EOF as ignorable.
  const head = encodeAscii(pdf);
  const padBlock = encodeAscii(`% padding\n`);
  const padding = new Uint8Array(paddingBytes);
  padding.fill(0x20); // ASCII space — inert filler.
  const out = new Uint8Array(head.length + padBlock.length + padding.length);
  out.set(head, 0);
  out.set(padBlock, head.length);
  out.set(padding, head.length + padBlock.length);
  return out;
}

function repeatedResumePage(page: number): string {
  return [
    `Fictional Candidate page ${page}`,
    "Experience: Staff Engineer at Example Systems",
    "Skills: TypeScript, React, Node.js, SQLite",
    "Project: Built resilient document ingestion pipelines",
  ].join(" | ");
}

// ---------------------------------------------------------------------------
// Hostile fixture factory
// ---------------------------------------------------------------------------

export function createStressFixture(type: HostileInputType): StressFixture {
  switch (type) {
    case "100-page resume":
      return {
        type,
        filename: "fictional-100-page-resume.pdf",
        mimeType: "application/pdf",
        bytes: createMinimalPdf(
          Array.from({ length: 100 }, (_, index) =>
            repeatedResumePage(index + 1),
          ),
        ),
        expectedBehavior:
          "Accepts under size limit; parses/classifies without timing out or crashing.",
      };
    case "corrupt PDF": {
      const pdf = createMinimalPdf([
        repeatedResumePage(1),
        repeatedResumePage(2),
      ]);
      return {
        type,
        filename: "corrupt-truncated.pdf",
        mimeType: "application/pdf",
        bytes: pdf.slice(0, Math.floor(pdf.length / 2)),
        expectedBehavior:
          "Returns a clean parse error and writes no source document or bank rows.",
      };
    }
    case "password-protected PDF":
      return {
        type,
        filename: "password-protected.pdf",
        mimeType: "application/pdf",
        // Marker the route would observe if it had encryption-aware parsing.
        bytes: encodeAscii(
          "%PDF-1.7\n1 0 obj\n<< /Type /Catalog /Encrypt << /Filter /Standard /V 1 /R 4 /U (xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx) /O (xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx) /P -1340 >> /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count 0 /Kids [] >>\nendobj\nxref\n0 3\n0000000000 65535 f \n0000000015 00000 n \n0000000150 00000 n \ntrailer\n<< /Size 3 /Root 1 0 R /Encrypt 1 0 R >>\nstartxref\n200\n%%EOF\n",
        ),
        expectedBehavior:
          "Detects password protection and returns a password-specific 4xx so the user can remove the password.",
      };
    case "empty PDF":
      return {
        type,
        filename: "blank.pdf",
        mimeType: "application/pdf",
        bytes: createMinimalPdf([""]),
        expectedBehavior:
          "Returns a no-parseable-content error and creates no bank entries (and ideally no source document).",
      };
    case "wrong file type renamed":
      return {
        type,
        filename: "renamed-image.pdf",
        mimeType: "application/pdf",
        // Real JPEG SOI/JFIF header — magic byte validator must reject this.
        bytes: new Uint8Array([
          0xff,
          0xd8,
          0xff,
          0xe0,
          0x00,
          0x10,
          ...encodeAscii("JFIF"),
        ]),
        expectedBehavior:
          "Rejected with HTTP 400 before the file is written or parsed (magic byte mismatch).",
      };
    case "concurrent uploads":
      return {
        type,
        filename: "same-file-uploaded-five-times.pdf",
        mimeType: "application/pdf",
        bytes: createMinimalPdf([repeatedResumePage(1)]),
        expectedBehavior:
          "Five simultaneous uploads of the same bytes dedupe to exactly one persisted document (T1 contract).",
      };
    case "50MB file":
      return {
        type,
        filename: "huge-padded.pdf",
        mimeType: "application/pdf",
        // Keep it just over 50MB. The route's MAX_FILE_SIZE_BYTES is 10MB so
        // this proves the pre-write size guard fires before any parsing.
        bytes: createMinimalPdf([repeatedResumePage(1)], 50 * 1024 * 1024),
        expectedBehavior:
          "Rejected with HTTP 400 by the size guard before any disk write or parse.",
      };
    case "filename injection":
      return {
        type,
        filename: "../../etc/passwd<script>alert(1)</script>.pdf",
        mimeType: "application/pdf",
        bytes: createMinimalPdf([repeatedResumePage(1)]),
        expectedBehavior:
          "Filesystem path is generated server-side (no traversal), and the persisted display filename is sanitised so the API response cannot be used as an XSS vector.",
      };
    case "nested PDF": {
      const inner = createMinimalPdf(["inner payload"]);
      // Embed the inner PDF's bytes inside a page text stream so any naive
      // parser that recurses on `%PDF-` markers would loop.
      const innerLatin1 = Array.from(inner)
        .map((byte) => String.fromCharCode(byte))
        .join("");
      return {
        type,
        filename: "nested-embedded-pdfs.pdf",
        mimeType: "application/pdf",
        bytes: createMinimalPdf([
          `Outer page with embedded marker: ${innerLatin1.slice(0, 200)}`,
        ]),
        expectedBehavior:
          "Outer PDF parsed once; inner PDF marker is not recursively expanded.",
      };
    }
    case "unicode-heavy":
      return {
        type,
        filename: "unicode-heavy-resume.pdf",
        mimeType: "application/pdf",
        bytes: createMinimalPdf([
          // Emoji, Arabic (RTL), Hebrew (RTL), CJK, math symbols, ZWJ.
          "Ana \u{1F680} | ML Engineer | مرحبا שלום | 你好 | ∑ λ π ∞ | flag: \u{1F1FA}\u{1F1F8}",
        ]),
        expectedBehavior:
          "Multibyte/RTL/emoji content survives upload; no crash, no truncation in stored filename, no encoding error.",
      };
  }
}

export function createAllStressFixtures(): StressFixture[] {
  return HOSTILE_INPUT_TYPES.map(createStressFixture);
}

// ---------------------------------------------------------------------------
// Request construction
// ---------------------------------------------------------------------------

/**
 * Build a File-like object that the upload route can consume without
 * re-parsing a real multipart body. Going through `NextRequest({ body: form })`
 * triggers Node's experimental multipart parser which is extremely slow for
 * 50MB+ payloads and races on parallel calls. Instead we construct a stub
 * NextRequest whose `formData()` resolves to a Map-shaped object holding our
 * File-like, mirroring what the route handler actually reads.
 */
export function createUploadRequest(
  fixture: StressFixture,
  url = "http://localhost/api/upload",
): NextRequest {
  // Build a plain Buffer-backed object that satisfies the small surface the
  // route uses: `name`, `type`, `size`, `arrayBuffer()`.
  const arrayBuffer = new ArrayBuffer(fixture.bytes.byteLength);
  new Uint8Array(arrayBuffer).set(fixture.bytes);
  const fileLike = {
    name: fixture.filename,
    type: fixture.mimeType,
    size: fixture.bytes.byteLength,
    arrayBuffer: async () => arrayBuffer,
  } as unknown as File;

  const formDataLike = {
    get: (key: string) => (key === "file" ? fileLike : null),
  } as unknown as FormData;

  // The route only reads `nextUrl.searchParams` and `formData()`; provide
  // both without invoking Node's multipart parser.
  const nextUrl = new URL(url);
  return {
    nextUrl,
    formData: async () => formDataLike,
    headers: new Headers({ "content-type": "multipart/form-data" }),
    method: "POST",
    url: nextUrl.toString(),
    body: null,
  } as unknown as NextRequest;
}

// ---------------------------------------------------------------------------
// Driving a single fixture
// ---------------------------------------------------------------------------

export interface RunOptions {
  /** Real or mocked POST handler. */
  handler: UploadHandler;
  /** Snapshot of DB / fs call counts captured by tests via vitest mocks. */
  snapshot: () => CallCounts;
  /**
   * Sniffer for the persistFilename / persistPath used by the route. Tests
   * read the most recent `saveDocument` call args to populate this.
   */
  observe?: () => { filename?: string; path?: string };
}

export async function runStressFixture(
  fixture: StressFixture,
  options: RunOptions,
): Promise<StressResult> {
  const before = options.snapshot();
  const startedAt = performance.now();
  let status = 0;
  let body: unknown = null;
  let runtimeError: string | undefined;

  try {
    const response = await options.handler(createUploadRequest(fixture));
    status = response.status;
    body = await response.json().catch(() => null);
  } catch (error) {
    runtimeError = error instanceof Error ? error.message : String(error);
  }

  const after = options.snapshot();
  const observed = options.observe?.() ?? {};
  return {
    type: fixture.type,
    status,
    body,
    persistedFilename: observed.filename,
    persistedPath: observed.path,
    calls: {
      saveDocument: after.saveDocument - before.saveDocument,
      insertBankEntries: after.insertBankEntries - before.insertBankEntries,
      writeFile: after.writeFile - before.writeFile,
      unlink: after.unlink - before.unlink,
    },
    durationMs: Math.round(performance.now() - startedAt),
    error: runtimeError,
  };
}

export async function runConcurrentStress(
  fixture: StressFixture,
  options: RunOptions,
  concurrency = 5,
): Promise<StressResult[]> {
  const before = options.snapshot();
  const startedAt = performance.now();

  const responses = await Promise.allSettled(
    Array.from({ length: concurrency }, () =>
      options.handler(createUploadRequest(fixture)),
    ),
  );

  const results: StressResult[] = [];
  for (const settled of responses) {
    let status = 0;
    let body: unknown = null;
    let error: string | undefined;
    if (settled.status === "fulfilled") {
      status = settled.value.status;
      body = await settled.value.json().catch(() => null);
    } else {
      error =
        settled.reason instanceof Error
          ? settled.reason.message
          : String(settled.reason);
    }
    results.push({
      type: fixture.type,
      status,
      body,
      calls: {
        saveDocument: 0,
        insertBankEntries: 0,
        writeFile: 0,
        unlink: 0,
      },
      durationMs: Math.round(performance.now() - startedAt),
      error,
    });
  }

  // Aggregate the call deltas onto the first result so callers don't have to
  // sum them across the array.
  const after = options.snapshot();
  if (results[0]) {
    results[0].calls = {
      saveDocument: after.saveDocument - before.saveDocument,
      insertBankEntries: after.insertBankEntries - before.insertBankEntries,
      writeFile: after.writeFile - before.writeFile,
      unlink: after.unlink - before.unlink,
    };
  }
  return results;
}

// ---------------------------------------------------------------------------
// Result analysis
// ---------------------------------------------------------------------------

function bodyError(body: unknown): string {
  if (body && typeof body === "object" && body !== null && "error" in body) {
    const error = (body as { error: unknown }).error;
    return typeof error === "string" ? error : "";
  }
  return "";
}

const HTML_INJECTION_PATTERNS = [
  /<\s*script/i,
  /<\s*img[^>]*onerror/i,
  /javascript:/i,
];

const PATH_TRAVERSAL_PATTERNS = [/\.\.[\\/]/];

export function analyzeStressResult(result: StressResult): ResultAnalysis {
  const error = bodyError(result.body);

  // Path safety / sanitisation always evaluated when we have an observation.
  const persistedFilename = result.persistedFilename ?? "";
  const persistedPath = result.persistedPath ?? "";
  const filenameSanitised = !HTML_INJECTION_PATTERNS.some((pattern) =>
    pattern.test(persistedFilename),
  );
  const pathTraversalSafe =
    persistedPath.length === 0 ||
    !PATH_TRAVERSAL_PATTERNS.some((pattern) => pattern.test(persistedPath));

  if (result.error) {
    return {
      graceful: false,
      integrityPreserved:
        result.calls.saveDocument === 0 && result.calls.insertBankEntries === 0,
      pathTraversalSafe,
      filenameSanitised,
      severity: "high",
      summary: `Unhandled exception: ${result.error}`,
      followUpTitle: `Stress fix — ${result.type} — prevent unhandled upload exception`,
      followUpBody:
        "Upload route threw an unhandled exception. Wrap the failing call site in a typed error path that returns 4xx with a user-actionable message.",
    };
  }

  // Inputs we expect to be rejected outright before any persistence.
  if (
    result.type === "wrong file type renamed" ||
    result.type === "50MB file"
  ) {
    const graceful = result.status === 400 && error.length > 0;
    return {
      graceful,
      integrityPreserved:
        result.calls.saveDocument === 0 &&
        result.calls.insertBankEntries === 0 &&
        result.calls.writeFile === 0,
      pathTraversalSafe,
      filenameSanitised,
      severity: graceful ? "low" : "high",
      summary: graceful
        ? error
        : `Expected pre-write 400 rejection. Got status=${result.status}, writeFile=${result.calls.writeFile}.`,
      followUpTitle: graceful
        ? undefined
        : `Stress fix — ${result.type} — reject before persistence`,
      followUpBody: graceful
        ? undefined
        : "The size / magic-byte guard let a hostile file reach disk or persistence. Tighten the guard so the request is rejected before any side effects.",
    };
  }

  if (result.type === "concurrent uploads") {
    // After issue #221 fix: a UNIQUE(user_id, file_hash) index lets exactly
    // one INSERT win; the rest throw and are rewritten to 409. We treat any
    // race that lets more than one row land as a regression.
    const persistedSomewhere = result.calls.saveDocument;
    if (persistedSomewhere <= 1) {
      return {
        graceful: true,
        integrityPreserved: true,
        pathTraversalSafe,
        filenameSanitised,
        severity: "low",
        summary: `Concurrent dedupe held: saveDocument=${persistedSomewhere}.`,
      };
    }
    return {
      graceful: false,
      integrityPreserved: false,
      pathTraversalSafe,
      filenameSanitised,
      severity: "high",
      summary: `Concurrent dedupe race: saveDocument fired ${persistedSomewhere} times for identical bytes.`,
      followUpTitle: `Stress fix — concurrent uploads — make dedupe race-safe`,
      followUpBody:
        "Multiple parallel uploads of the same file hash all reached saveDocument because dedupe relies on a non-atomic SELECT-then-INSERT sequence. Add a unique constraint on (user_id, file_hash) and convert insertion to INSERT … ON CONFLICT, or wrap the SELECT/INSERT pair in a transaction with row-level locking.",
    };
  }

  if (result.type === "filename injection") {
    const traversalReachedDisk =
      persistedPath.length > 0 &&
      PATH_TRAVERSAL_PATTERNS.some((pattern) => pattern.test(persistedPath));
    const xssInDisplay = !filenameSanitised;
    const responseLeaksHostile = JSON.stringify(result.body ?? "").includes(
      "<script>",
    );

    if (traversalReachedDisk) {
      return {
        graceful: false,
        integrityPreserved: false,
        pathTraversalSafe: false,
        filenameSanitised,
        severity: "critical",
        summary:
          "Hostile filename produced a filesystem path containing `..` — path traversal reached disk.",
        followUpTitle: `Stress fix — filename injection — block path traversal`,
        followUpBody:
          "The upload route used user-supplied filename segments to compose the on-disk path. Replace with a server-generated UUID + sanitised extension only.",
      };
    }
    if (xssInDisplay || responseLeaksHostile) {
      return {
        graceful: true,
        integrityPreserved: true,
        pathTraversalSafe: true,
        filenameSanitised: false,
        severity: "medium",
        summary:
          "On-disk path is safe, but the persisted display filename and API response still contain unescaped HTML. Future UI surfaces are at risk if any one renderer skips escaping.",
        followUpTitle: `Stress fix — filename injection — sanitise persisted display filename`,
        followUpBody:
          "Persist a cleaned display name (strip `<`, `>`, control chars, leading dot/slash sequences) at upload time, while keeping the original in a separate column if forensics need it.",
      };
    }
    return {
      graceful: true,
      integrityPreserved: true,
      pathTraversalSafe: true,
      filenameSanitised: true,
      severity: "low",
      summary: "Filename injection neutralised at write and at persistence.",
    };
  }

  if (
    result.type === "corrupt PDF" ||
    result.type === "password-protected PDF" ||
    result.type === "empty PDF"
  ) {
    // Post-fix expectations (issues #218/#219/#220): the route must reject
    // unparseable PDFs with a 4xx and persist NEITHER a documents row nor
    // bank entries.
    const persistedSourceDoc = result.calls.saveDocument > 0;
    const persistedBank = result.calls.insertBankEntries > 0;
    if (persistedBank) {
      return {
        graceful: false,
        integrityPreserved: false,
        pathTraversalSafe,
        filenameSanitised,
        severity: "high",
        summary: `Bank entries inserted (${result.calls.insertBankEntries}) for an unparseable PDF.`,
        followUpTitle: `Stress fix — ${result.type} — block bank ingestion on parse failure`,
        followUpBody:
          "Bank ingestion ran for content that produced no usable text. Gate `insertBankEntries` on `smartParseResume.confidence > 0` and a non-empty section list.",
      };
    }
    if (persistedSourceDoc) {
      return {
        graceful: false,
        integrityPreserved: false,
        pathTraversalSafe,
        filenameSanitised,
        severity: "medium",
        summary: `Upload persisted a source document despite parse failure (saveDocument=${result.calls.saveDocument}).`,
        followUpTitle: `Stress fix — ${result.type} — fail parse errors before saving documents`,
        followUpBody:
          "The route still wrote a documents row for an unparseable PDF. Move the parse step before saveDocument and abort with 4xx on failure.",
      };
    }
    if (result.status >= 400 && result.status < 500) {
      return {
        graceful: true,
        integrityPreserved: true,
        pathTraversalSafe,
        filenameSanitised,
        severity: "low",
        summary: `Upload rejected the unparseable file with status ${result.status} before persistence.`,
      };
    }
    return {
      graceful: false,
      integrityPreserved: true,
      pathTraversalSafe,
      filenameSanitised,
      severity: "medium",
      summary: `Upload returned ${result.status} for an unparseable PDF without persisting; expected an explicit 4xx.`,
      followUpTitle: `Stress fix — ${result.type} — surface a 4xx for unparseable PDFs`,
      followUpBody:
        "Route returned a non-4xx status for an unparseable PDF. Map parse failures to a typed 422 (parse_failed / password_protected / empty_document) so the UI can render an actionable message.",
    };
  }

  // Default: pass-through inputs (100-page resume, nested PDF, unicode).
  return {
    graceful: result.status >= 200 && result.status < 500,
    integrityPreserved: true,
    pathTraversalSafe,
    filenameSanitised,
    severity: "low",
    summary: `Status ${result.status}; saveDocument=${result.calls.saveDocument}, bank=${result.calls.insertBankEntries}.`,
  };
}

export const SEVERITY_RANK: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function isFollowUpRequired(severity: Severity): boolean {
  return SEVERITY_RANK[severity] >= SEVERITY_RANK.medium;
}
