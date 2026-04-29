import { describe, it, expect } from "vitest";
import * as constants from "./constants";
import {
  ALLOWED_MIME_TYPES,
  backupDataSchema,
  compareResumesSchema,
  createInterviewSessionSchema,
  DEFAULT_MODEL_BY_PROVIDER,
  DOCUMENT_TYPES,
  EMAIL_TEMPLATE_TYPES,
  FILE_SIGNATURES,
  INTERVIEW_CATEGORIES,
  JOB_STATUSES,
  JOB_STATUS_LABELS,
  LLM_PROVIDERS,
  NOTIFICATION_ACTIONS,
  PATHS,
  REMINDER_TYPES,
  STORAGE_KEYS,
  THEMES,
  updateProfileSchema,
  validateFileMagicBytes,
  fullExportDataSchema,
} from "./constants";

describe("constants barrel", () => {
  it("should expose representative exports from every domain module", () => {
    expect(PATHS.DATABASE).toContain("data/get-me-job.db");

    expect(THEMES).toEqual(["light", "dark", "system"]);
    expect(STORAGE_KEYS.ONBOARDING_COMPLETED).toBe("get_me_job_onboarding_completed");

    expect(JOB_STATUSES).toContain("pending");
    expect(JOB_STATUSES).toContain("interviewing");
    expect(JOB_STATUS_LABELS.withdrawn).toBe("Withdrawn");
    expect(updateProfileSchema.safeParse({ contact: { name: "Jane Doe" } }).success).toBe(true);

    expect(INTERVIEW_CATEGORIES).toContain("technical");
    expect(
      createInterviewSessionSchema.safeParse({
        jobId: "job-1",
        questions: [{ question: "Tell me about a project", category: "behavioral" }],
        mode: "voice",
      }).success
    ).toBe(true);

    expect(DOCUMENT_TYPES).toContain("resume");
    expect(DOCUMENT_TYPES).toContain("reference_letter");

    expect(LLM_PROVIDERS).toContain("openai");
    expect(DEFAULT_MODEL_BY_PROVIDER.openai).toBe("gpt-4o-mini");

    expect(EMAIL_TEMPLATE_TYPES).toContain("thank_you");
    expect(REMINDER_TYPES).toContain("interview");
    expect(NOTIFICATION_ACTIONS).toContain("markAllRead");

    expect(compareResumesSchema.safeParse({ beforeId: "before", afterId: "after" }).success).toBe(
      true
    );
    expect(backupDataSchema.safeParse({ version: "1.0", data: {} }).success).toBe(true);
  });

  it("should keep backup helper schemas private", () => {
    expect(constants).not.toHaveProperty("backupContactSchema");
    expect(constants).not.toHaveProperty("backupProfileSchema");
    expect(constants).not.toHaveProperty("backupJobSchema");
    expect(constants).not.toHaveProperty("exportCoverLetterSchema");
    expect(constants).not.toHaveProperty("exportBankEntrySchema");
  });
});

describe("ALLOWED_MIME_TYPES", () => {
  it("should include application/pdf", () => {
    expect(ALLOWED_MIME_TYPES).toContain("application/pdf");
  });

  it("should include text/plain", () => {
    expect(ALLOWED_MIME_TYPES).toContain("text/plain");
  });

  it("should include DOCX MIME type", () => {
    expect(ALLOWED_MIME_TYPES).toContain(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  });
});

describe("FILE_SIGNATURES", () => {
  it("should have PDF magic bytes", () => {
    expect(FILE_SIGNATURES["application/pdf"]).toEqual([0x25, 0x50, 0x44, 0x46]);
  });

  it("should have DOCX magic bytes (PK zip header)", () => {
    const docxMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    expect(FILE_SIGNATURES[docxMime]).toEqual([0x50, 0x4b, 0x03, 0x04]);
  });
});

describe("validateFileMagicBytes", () => {
  it("should validate PDF magic bytes", () => {
    const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]);
    expect(validateFileMagicBytes(pdfBuffer, "application/pdf")).toBe(true);
  });

  it("should reject invalid PDF magic bytes", () => {
    const invalidBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
    expect(validateFileMagicBytes(invalidBuffer, "application/pdf")).toBe(false);
  });

  it("should validate DOCX magic bytes (PK zip header)", () => {
    const docxMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const docxBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00]);
    expect(validateFileMagicBytes(docxBuffer, docxMime)).toBe(true);
  });

  it("should reject invalid DOCX magic bytes", () => {
    const docxMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const invalidBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
    expect(validateFileMagicBytes(invalidBuffer, docxMime)).toBe(false);
  });

  it("should validate text/plain by checking for null bytes", () => {
    const textBuffer = Buffer.from("Hello, world!");
    expect(validateFileMagicBytes(textBuffer, "text/plain")).toBe(true);
  });

  it("should reject text/plain with null bytes", () => {
    const binaryBuffer = Buffer.from([0x48, 0x65, 0x00, 0x6c]);
    expect(validateFileMagicBytes(binaryBuffer, "text/plain")).toBe(false);
  });

  it("should return true for unknown MIME types", () => {
    const buffer = Buffer.from("anything");
    expect(validateFileMagicBytes(buffer, "application/unknown")).toBe(true);
  });

  it("should reject buffer shorter than signature", () => {
    const shortBuffer = Buffer.from([0x25, 0x50]);
    expect(validateFileMagicBytes(shortBuffer, "application/pdf")).toBe(false);
  });
});

describe("fullExportDataSchema", () => {
  it("should validate a complete export payload", () => {
    const validExport = {
      version: "2.0",
      exportedAt: "2024-01-01T00:00:00.000Z",
      data: {
        profile: { contact: { name: "John" } },
        jobs: [{ id: "j1", title: "Dev", company: "Acme", description: "Build stuff" }],
        coverLetters: [
          { id: "cl1", jobId: "j1", content: "Dear...", highlights: ["skill"], version: 1 },
        ],
        bankEntries: [
          { id: "b1", category: "experience", content: { company: "Acme" }, confidenceScore: 0.9 },
        ],
        llmConfig: { provider: "openai", model: "gpt-4o" },
      },
      stats: { totalJobs: 1, totalCoverLetters: 1, totalBankEntries: 1 },
    };

    const result = fullExportDataSchema.safeParse(validExport);
    expect(result.success).toBe(true);
  });

  it("should reject export without version", () => {
    const invalid = { data: { jobs: [] } };
    const result = fullExportDataSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("should accept minimal export with only version and data", () => {
    const minimal = { version: "2.0", data: {} };
    const result = fullExportDataSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it("should validate cover letter schema within export", () => {
    const withInvalidCoverLetter = {
      version: "2.0",
      data: {
        coverLetters: [{ id: "cl1" }], // missing required fields
      },
    };
    const result = fullExportDataSchema.safeParse(withInvalidCoverLetter);
    expect(result.success).toBe(false);
  });

  it("should validate bank entry schema within export", () => {
    const withInvalidBankEntry = {
      version: "2.0",
      data: {
        bankEntries: [{ id: "b1" }], // missing required fields
      },
    };
    const result = fullExportDataSchema.safeParse(withInvalidBankEntry);
    expect(result.success).toBe(false);
  });
});
