import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  execute: vi.fn(),
}));

vi.mock("./client", () => ({
  getClient: () => dbMocks,
}));

vi.mock("@/lib/utils", () => ({
  generateId: () => "test-template-id",
}));

import {
  saveCustomTemplate,
  updateCustomTemplateMetadata,
} from "./custom-templates";

const analyzedStyles = {
  styles: {
    fontFamily: "Inter",
    fontSize: "11pt",
    headerSize: "18pt",
    sectionHeaderSize: "12pt",
    lineHeight: "1.4",
    accentColor: "#111111",
    layout: "single-column",
    headerStyle: "left",
    bulletStyle: "disc",
    sectionDivider: "line",
  },
  charsPerLine: 95,
  margins: {
    top: "0.5in",
    bottom: "0.5in",
    left: "0.5in",
    right: "0.5in",
  },
  sectionGap: "8pt",
} as any;

function result(rows: unknown[] = [], rowsAffected = 0) {
  return { rows, rowsAffected };
}

describe("Custom Template Database Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.execute.mockImplementation(
      (statement: string | { sql: string }) => {
        const sql = typeof statement === "string" ? statement : statement.sql;
        if (sql.startsWith("PRAGMA table_info")) {
          return Promise.resolve(
            result([
              { name: "source_filename" },
              { name: "source_type" },
              { name: "description" },
              { name: "updated_at" },
            ]),
          );
        }
        return Promise.resolve(result([], 1));
      },
    );
  });

  it("should save templates without a source document", async () => {
    const template = await saveCustomTemplate(
      "Modern",
      analyzedStyles,
      undefined,
      "user-1",
    );

    expect(template.id).toBe("test-template-id");
    expect(dbMocks.execute).toHaveBeenCalledWith({
      sql: expect.not.stringContaining("WHERE EXISTS"),
      args: [
        "test-template-id",
        "user-1",
        "Modern",
        null,
        null,
        null,
        null,
        JSON.stringify(analyzedStyles),
        expect.any(String),
        expect.any(String),
      ],
    });
  });

  it("should reject templates linked to source documents outside the user", async () => {
    dbMocks.execute.mockImplementation(
      (statement: string | { sql: string }) => {
        const sql = typeof statement === "string" ? statement : statement.sql;
        if (sql.startsWith("PRAGMA table_info")) {
          return Promise.resolve(
            result([
              { name: "source_filename" },
              { name: "source_type" },
              { name: "description" },
              { name: "updated_at" },
            ]),
          );
        }
        if (sql.includes("INSERT INTO custom_templates")) {
          return Promise.resolve(result([], 0));
        }
        return Promise.resolve(result([], 1));
      },
    );

    await expect(
      saveCustomTemplate("Modern", analyzedStyles, "doc-1", "user-1"),
    ).rejects.toThrow("Source document not found");
    expect(dbMocks.execute).toHaveBeenCalledWith({
      sql: expect.stringContaining("WHERE EXISTS"),
      args: [
        "test-template-id",
        "user-1",
        "Modern",
        null,
        "doc-1",
        null,
        null,
        JSON.stringify(analyzedStyles),
        expect.any(String),
        expect.any(String),
        "doc-1",
        "user-1",
      ],
    });
  });

  it("should update template display metadata", async () => {
    const updated = await updateCustomTemplateMetadata(
      "template-1",
      {
        name: "Boardroom",
        description: "Dense executive layout",
      },
      "user-1",
    );

    expect(updated).toBe(true);
    expect(dbMocks.execute).toHaveBeenCalledWith({
      sql: "UPDATE custom_templates SET name = ?, description = ?, updated_at = ? WHERE id = ? AND user_id = ?",
      args: [
        "Boardroom",
        "Dense executive layout",
        expect.any(String),
        "template-1",
        "user-1",
      ],
    });
  });
});
