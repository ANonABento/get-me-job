import { describe, expect, it } from "vitest";
import { getTableName } from "drizzle-orm";
import { getTableConfig, type AnyPgTable } from "drizzle-orm/pg-core";
import { companyResearch, knowledgeChunks } from "./schema";

function indexColumnNames(indexName: string, table: AnyPgTable): string[] {
  const config = getTableConfig(table);
  const index = config.indexes.find((candidate) => candidate.config.name === indexName);
  return index?.config.columns.map((column) => (column as { name: string }).name) ?? [];
}

describe("Drizzle schema", () => {
  it("includes persisted knowledge chunks for Neon db:push", () => {
    expect(getTableName(knowledgeChunks)).toBe("knowledge_chunks");

    const columns = getTableConfig(knowledgeChunks).columns.map((column) => column.name);
    expect(columns).toEqual([
      "id",
      "user_id",
      "document_id",
      "section_type",
      "content",
      "content_hash",
      "embedding",
      "metadata_json",
      "created_at",
    ]);
  });

  it("keeps duplicate-prone lookup paths protected by unique indexes", () => {
    const knowledgeIndex = getTableConfig(knowledgeChunks).indexes.find(
      (index) => index.config.name === "idx_knowledge_chunks_user_hash"
    );
    expect(knowledgeIndex?.config.unique).toBe(true);
    expect(indexColumnNames("idx_knowledge_chunks_user_hash", knowledgeChunks)).toEqual([
      "user_id",
      "content_hash",
    ]);

    const companyIndex = getTableConfig(companyResearch).indexes.find(
      (index) => index.config.name === "idx_company_research_user_company"
    );
    expect(companyIndex?.config.unique).toBe(true);
    expect(indexColumnNames("idx_company_research_user_company", companyResearch)).toEqual([
      "user_id",
      "company_name",
    ]);
  });
});
