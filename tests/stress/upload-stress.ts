import { NextRequest } from "next/server";

export const HOSTILE_INPUT_TYPES = [
  "100-page resume",
  "corrupt PDF",
  "password-protected PDF",
  "empty PDF",
  "wrong file type renamed",
  "concurrent uploads",
  "huge file",
  "filename injection",
  "zip bomb / nested PDF",
  "unicode-heavy resume",
] as const;

export type HostileInputType = (typeof HOSTILE_INPUT_TYPES)[number];

export type Severity = "critical" | "high" | "medium" | "low";

export interface StressFixture {
  type: HostileInputType;
  filename: string;
  mimeType: string;
  bytes: Uint8Array;
  expectedBehavior: string;
}

export interface StressResult {
  type: HostileInputType;
  status: number;
  body: unknown;
  documentsBefore: number;
  documentsAfter: number;
  bankEntriesBefore: number;
  bankEntriesAfter: number;
  durationMs: number;
  error?: string;
}

export interface ResultAnalysis {
  graceful: boolean;
  integrityPreserved: boolean;
  severity: Severity;
  summary: string;
  followUpTitle?: string;
}

type UploadHandler = (request: NextRequest) => Promise<Response>;

function encodeAscii(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function escapePdfLiteral(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function createMinimalPdf(pages: string[], paddingBytes = 0): Uint8Array {
  const objects: string[] = [];
  const pageObjectIds: number[] = [];

  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  objects.push("2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\n");
  objects.push("3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");

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
        `/MediaBox [0 0 612 792] /Contents ${contentObjectId} 0 R >>\nendobj\n`
    );
    objects.push(
      `${contentObjectId} 0 obj\n` +
        `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`
    );
  }

  const kids = pageObjectIds.map((id) => `${id} 0 R`).join(" ");
  objects[1] = `2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>\nendobj\n`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
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

  if (paddingBytes > 0) {
    pdf += `% padding\n${"0".repeat(paddingBytes)}`;
  }

  return encodeAscii(pdf);
}

function repeatedResumePage(page: number): string {
  return [
    `Fictional Candidate page ${page}`,
    "Experience: Staff Engineer at Example Systems",
    "Skills: TypeScript, React, Node.js, SQLite",
    "Project: Built resilient document ingestion pipelines",
  ].join(" | ");
}

export function createStressFixture(type: HostileInputType): StressFixture {
  switch (type) {
    case "100-page resume":
      return {
        type,
        filename: "fictional-100-page-resume.pdf",
        mimeType: "application/pdf",
        bytes: createMinimalPdf(
          Array.from({ length: 100 }, (_, index) => repeatedResumePage(index + 1))
        ),
        expectedBehavior: "Completes parsing or caps work without timing out or crashing.",
      };
    case "corrupt PDF": {
      const pdf = createMinimalPdf([repeatedResumePage(1), repeatedResumePage(2)]);
      return {
        type,
        filename: "corrupt-truncated.pdf",
        mimeType: "application/pdf",
        bytes: pdf.slice(0, Math.floor(pdf.length / 2)),
        expectedBehavior: "Returns a clear parse error and writes no partial document or bank rows.",
      };
    }
    case "password-protected PDF":
      return {
        type,
        filename: "password-protected.pdf",
        mimeType: "application/pdf",
        bytes: encodeAscii(
          "%PDF-1.7\n1 0 obj\n<< /Type /Catalog /Encrypt << /Filter /Standard /V 1 >> >>\nendobj\n%%EOF\n"
        ),
        expectedBehavior: "Detects password protection and asks the user to remove the password.",
      };
    case "empty PDF":
      return {
        type,
        filename: "blank.pdf",
        mimeType: "application/pdf",
        bytes: createMinimalPdf([""]),
        expectedBehavior: "Returns a no parseable content response and creates no spurious entries.",
      };
    case "wrong file type renamed":
      return {
        type,
        filename: "renamed-image.pdf",
        mimeType: "application/pdf",
        bytes: new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, ...encodeAscii("JFIF")]),
        expectedBehavior: "Rejects before parsing because content magic does not match PDF.",
      };
    case "concurrent uploads":
      return {
        type,
        filename: "same-file-uploaded-five-times.pdf",
        mimeType: "application/pdf",
        bytes: createMinimalPdf([repeatedResumePage(1)]),
        expectedBehavior: "Five simultaneous uploads dedupe to one persisted record.",
      };
    case "huge file":
      return {
        type,
        filename: "huge-padded.pdf",
        mimeType: "application/pdf",
        bytes: createMinimalPdf([repeatedResumePage(1)], 50 * 1024 * 1024),
        expectedBehavior: "Rejects before parsing with a clear file too large error.",
      };
    case "filename injection":
      return {
        type,
        filename: "../../etc/passwd<script>alert(1)</script>.pdf",
        mimeType: "application/pdf",
        bytes: createMinimalPdf([repeatedResumePage(1)]),
        expectedBehavior: "Stores only a sanitized display filename and never uses it in paths.",
      };
    case "zip bomb / nested PDF":
      return {
        type,
        filename: "nested-embedded-pdfs.pdf",
        mimeType: "application/pdf",
        bytes: createMinimalPdf([
          `Embedded payload marker ${String.fromCharCode(...createMinimalPdf(["inner"]))}`,
        ]),
        expectedBehavior: "Does not recurse into embedded documents without explicit limits.",
      };
    case "unicode-heavy resume":
      return {
        type,
        filename: "unicode-heavy-resume.pdf",
        mimeType: "application/pdf",
        bytes: createMinimalPdf([
          "Ana Gomez | ML Engineer | مرحبا שלום | ∑ λ π ∞ | emoji: rocket sparkle laptop",
        ]),
        expectedBehavior: "Preserves text end-to-end without crashing or corrupting storage.",
      };
  }
}

export function createUploadRequest(fixture: StressFixture): NextRequest {
  const formData = new FormData();
  const arrayBuffer = new ArrayBuffer(fixture.bytes.byteLength);
  new Uint8Array(arrayBuffer).set(fixture.bytes);
  formData.append(
    "file",
    new File([arrayBuffer], fixture.filename, { type: fixture.mimeType })
  );
  return new NextRequest("http://localhost/api/upload", {
    method: "POST",
    body: formData,
  });
}

export async function uploadFixture(
  handler: UploadHandler,
  fixture: StressFixture,
  counts: {
    documents: () => number;
    bankEntries: () => number;
  }
): Promise<StressResult> {
  const documentsBefore = counts.documents();
  const bankEntriesBefore = counts.bankEntries();
  const startedAt = performance.now();

  try {
    const response = await handler(createUploadRequest(fixture));
    const body = await response.json().catch(() => null);

    return {
      type: fixture.type,
      status: response.status,
      body,
      documentsBefore,
      documentsAfter: counts.documents(),
      bankEntriesBefore,
      bankEntriesAfter: counts.bankEntries(),
      durationMs: Math.round(performance.now() - startedAt),
    };
  } catch (error) {
    return {
      type: fixture.type,
      status: 0,
      body: null,
      documentsBefore,
      documentsAfter: counts.documents(),
      bankEntriesBefore,
      bankEntriesAfter: counts.bankEntries(),
      durationMs: Math.round(performance.now() - startedAt),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function uploadConcurrentFixture(
  handler: UploadHandler,
  fixture: StressFixture,
  counts: {
    documents: () => number;
    bankEntries: () => number;
  },
  concurrency = 5
): Promise<StressResult[]> {
  return Promise.all(
    Array.from({ length: concurrency }, () => uploadFixture(handler, fixture, counts))
  );
}

function bodyError(body: unknown): string {
  if (body && typeof body === "object" && "error" in body) {
    const error = (body as { error: unknown }).error;
    return typeof error === "string" ? error : "";
  }
  return "";
}

export function analyzeStressResult(result: StressResult): ResultAnalysis {
  const documentsCreated = result.documentsAfter - result.documentsBefore;
  const entriesCreated = result.bankEntriesAfter - result.bankEntriesBefore;
  const error = bodyError(result.body);

  if (result.error) {
    return {
      graceful: false,
      integrityPreserved: documentsCreated === 0 && entriesCreated === 0,
      severity: "high",
      summary: `Unhandled exception: ${result.error}`,
      followUpTitle: `Stress fix - ${result.type} - prevent unhandled upload exception`,
    };
  }

  if (result.type === "wrong file type renamed" || result.type === "huge file") {
    const graceful = result.status === 400 && error.length > 0;
    return {
      graceful,
      integrityPreserved: documentsCreated === 0 && entriesCreated === 0,
      severity: graceful ? "low" : "high",
      summary: graceful ? error : "Rejected input did not fail cleanly before persistence.",
      followUpTitle: graceful
        ? undefined
        : `Stress fix - ${result.type} - reject before persistence`,
    };
  }

  if (
    ["corrupt PDF", "password-protected PDF", "empty PDF"].includes(result.type) &&
    result.status === 200 &&
    documentsCreated > 0
  ) {
    return {
      graceful: false,
      integrityPreserved: false,
      severity: "medium",
      summary: "Upload returned success and persisted a document after extraction produced no usable text.",
      followUpTitle: `Stress fix - ${result.type} - fail parse errors before saving documents`,
    };
  }

  return {
    graceful: result.status >= 200 && result.status < 500,
    integrityPreserved: true,
    severity: "low",
    summary: "No crash observed by the harness; review response details for UX polish.",
  };
}

export function createAllStressFixtures(): StressFixture[] {
  return HOSTILE_INPUT_TYPES.map(createStressFixture);
}
