/**
 * Integration tests for the @slothing/mcp server.
 *
 * We connect a real MCP `Client` to our `McpServer` via an in-memory
 * transport pair, stub `fetch`, and exercise every tool the server exposes
 * plus the bad-token error shape.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { buildServer } from "../src/server.js";

const BASE_URL = "https://slothing.test";
const VALID_TOKEN = "valid-token";

interface StubResponseSpec {
  status: number;
  body: unknown;
  /** When set, asserts the inbound request matched (method + path). */
  expectPath?: string;
  expectMethod?: string;
}

interface FetchCall {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
}

/**
 * Build a fetch stub that matches incoming requests against a queue of
 * scripted responses. Throws if the queue runs out so tests fail loudly
 * instead of silently passing on a missing assertion.
 */
function makeFetchStub(queue: StubResponseSpec[]) {
  const calls: FetchCall[] = [];

  const stub: typeof fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input.toString();
    const method = (init?.method ?? "GET").toUpperCase();
    const headers: Record<string, string> = {};
    const h = new Headers(init?.headers);
    h.forEach((v, k) => {
      headers[k.toLowerCase()] = v;
    });

    let body: unknown = undefined;
    if (typeof init?.body === "string") {
      try {
        body = JSON.parse(init.body) as unknown;
      } catch {
        body = init.body;
      }
    }

    calls.push({ url, method, headers, body });

    const next = queue.shift();
    if (!next) {
      throw new Error(`Unexpected fetch: ${method} ${url}`);
    }
    if (next.expectMethod) {
      expect(method).toBe(next.expectMethod);
    }
    if (next.expectPath) {
      expect(url).toContain(next.expectPath);
    }

    return new Response(next.body == null ? "" : JSON.stringify(next.body), {
      status: next.status,
      headers: { "Content-Type": "application/json" },
    });
  };

  return { stub, calls, queue };
}

async function connectClient(fetchImpl: typeof fetch, token = VALID_TOKEN) {
  const server = buildServer({
    config: { baseUrl: BASE_URL, token },
    fetchImpl,
  });
  const [serverTransport, clientTransport] =
    InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test-client", version: "0.0.0" });
  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);
  return { client, server };
}

describe("@slothing/mcp server", () => {
  let opened: Array<{ close: () => Promise<void> | void }> = [];

  beforeEach(() => {
    opened = [];
  });

  afterEach(async () => {
    for (const { close } of opened) {
      try {
        await close();
      } catch {
        // ignore
      }
    }
  });

  it("registers all tools", async () => {
    const { stub } = makeFetchStub([]);
    const { client, server } = await connectClient(stub);
    opened.push({ close: () => server.close() });
    opened.push({ close: () => client.close() });

    const result = await client.listTools();
    const names = result.tools.map((t) => t.name).sort();
    expect(names).toEqual(
      [
        "get_opportunity_detail",
        "get_profile",
        "list_opportunities",
        "save_answer",
        "search_answer_bank",
        "slothing_push_job",
        "slothing_scrape_url",
        "slothing_update_status",
      ].sort(),
    );
  });

  it("get_profile calls GET /api/extension/profile and returns the body", async () => {
    const profileBody = {
      contact: { name: "Ada Lovelace" },
      computed: { firstName: "Ada", yearsExperience: 7 },
    };
    const { stub, calls } = makeFetchStub([
      {
        status: 200,
        body: profileBody,
        expectMethod: "GET",
        expectPath: "/api/extension/profile",
      },
    ]);
    const { client, server } = await connectClient(stub);
    opened.push({ close: () => server.close() });
    opened.push({ close: () => client.close() });

    const result = await client.callTool({
      name: "get_profile",
      arguments: {},
    });

    expect(result.isError).not.toBe(true);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.headers["x-extension-token"]).toBe(VALID_TOKEN);
    const text = (result.content as Array<{ type: string; text: string }>)[0]
      ?.text;
    expect(text).toContain("Ada Lovelace");
    expect(JSON.parse(text!)).toEqual(profileBody);
  });

  it("list_opportunities forwards status + limit as query params", async () => {
    const body = { opportunities: [], total: 0 };
    const { stub, calls } = makeFetchStub([
      {
        status: 200,
        body,
        expectMethod: "GET",
        expectPath: "/api/extension/opportunities",
      },
    ]);
    const { client, server } = await connectClient(stub);
    opened.push({ close: () => server.close() });
    opened.push({ close: () => client.close() });

    const result = await client.callTool({
      name: "list_opportunities",
      arguments: { status: "pending,applied", limit: 25 },
    });

    expect(result.isError).not.toBe(true);
    expect(calls[0]?.url).toContain("status=pending%2Capplied");
    expect(calls[0]?.url).toContain("limit=25");
  });

  it("get_opportunity_detail percent-encodes the opportunity id", async () => {
    const body = { id: "abc/def", title: "Engineer" };
    const { stub, calls } = makeFetchStub([
      {
        status: 200,
        body,
        expectMethod: "GET",
        expectPath: "/api/extension/opportunities/",
      },
    ]);
    const { client, server } = await connectClient(stub);
    opened.push({ close: () => server.close() });
    opened.push({ close: () => client.close() });

    const result = await client.callTool({
      name: "get_opportunity_detail",
      arguments: { opportunityId: "abc/def" },
    });

    expect(result.isError).not.toBe(true);
    // The forward slash inside the id must be encoded so it does not become
    // a new path segment.
    expect(calls[0]?.url).toContain("/api/extension/opportunities/abc%2Fdef");
  });

  it("search_answer_bank POSTs the question and surfaces matches", async () => {
    const body = { results: [{ id: "1", similarity: 0.9, answer: "Yes" }] };
    const { stub, calls } = makeFetchStub([
      {
        status: 200,
        body,
        expectMethod: "POST",
        expectPath: "/api/extension/learned-answers/search",
      },
    ]);
    const { client, server } = await connectClient(stub);
    opened.push({ close: () => server.close() });
    opened.push({ close: () => client.close() });

    const result = await client.callTool({
      name: "search_answer_bank",
      arguments: { question: "Are you authorized to work?" },
    });

    expect(result.isError).not.toBe(true);
    expect(calls[0]?.body).toEqual({ question: "Are you authorized to work?" });
    const text = (result.content as Array<{ type: string; text: string }>)[0]
      ?.text;
    expect(text).toContain("similarity");
  });

  it("save_answer POSTs the full question/answer payload", async () => {
    const body = { id: "ans-1", question: "Why us?", answer: "Mission fit." };
    const { stub, calls } = makeFetchStub([
      {
        status: 200,
        body,
        expectMethod: "POST",
        expectPath: "/api/extension/learned-answers",
      },
    ]);
    const { client, server } = await connectClient(stub);
    opened.push({ close: () => server.close() });
    opened.push({ close: () => client.close() });

    const result = await client.callTool({
      name: "save_answer",
      arguments: {
        question: "Why us?",
        answer: "Mission fit.",
        sourceUrl: "https://example.com/apply",
        sourceCompany: "ExampleCo",
      },
    });

    expect(result.isError).not.toBe(true);
    expect(calls[0]?.body).toEqual({
      question: "Why us?",
      answer: "Mission fit.",
      sourceUrl: "https://example.com/apply",
      sourceCompany: "ExampleCo",
    });
  });

  it("slothing_push_job POSTs a structured opportunity payload", async () => {
    const body = {
      imported: 1,
      opportunityIds: ["job-1"],
      pendingCount: 3,
      dedupedIds: [],
    };
    const { stub, calls } = makeFetchStub([
      {
        status: 201,
        body,
        expectMethod: "POST",
        expectPath: "/api/opportunities/from-extension",
      },
    ]);
    const { client, server } = await connectClient(stub);
    opened.push({ close: () => server.close() });
    opened.push({ close: () => client.close() });

    const result = await client.callTool({
      name: "slothing_push_job",
      arguments: {
        title: "Frontend Engineer",
        company: "Acme",
        description: "Build product UI",
        url: "https://example.com/jobs/frontend",
        source: "agent",
      },
    });

    expect(result.isError).not.toBe(true);
    expect(calls[0]?.body).toEqual({
      title: "Frontend Engineer",
      company: "Acme",
      description: "Build product UI",
      url: "https://example.com/jobs/frontend",
      source: "agent",
    });
  });

  it("slothing_update_status PATCHes the encoded opportunity id", async () => {
    const body = { opportunity: { id: "job/1", status: "applied" } };
    const { stub, calls } = makeFetchStub([
      {
        status: 200,
        body,
        expectMethod: "PATCH",
        expectPath: "/api/extension/opportunities/job%2F1/status",
      },
    ]);
    const { client, server } = await connectClient(stub);
    opened.push({ close: () => server.close() });
    opened.push({ close: () => client.close() });

    const result = await client.callTool({
      name: "slothing_update_status",
      arguments: { opportunityId: "job/1", status: "applied" },
    });

    expect(result.isError).not.toBe(true);
    expect(calls[0]?.body).toEqual({ status: "applied" });
  });

  it("slothing_scrape_url POSTs the URL to the extension scrape endpoint", async () => {
    const body = {
      opportunity: {
        title: "Engineer",
        company: "Acme",
        url: "https://jobs.lever.co/acme/123",
      },
    };
    const { stub, calls } = makeFetchStub([
      {
        status: 200,
        body,
        expectMethod: "POST",
        expectPath: "/api/extension/opportunities/scrape",
      },
    ]);
    const { client, server } = await connectClient(stub);
    opened.push({ close: () => server.close() });
    opened.push({ close: () => client.close() });

    const result = await client.callTool({
      name: "slothing_scrape_url",
      arguments: { url: "https://jobs.lever.co/acme/123" },
    });

    expect(result.isError).not.toBe(true);
    expect(calls[0]?.body).toEqual({
      url: "https://jobs.lever.co/acme/123",
    });
  });

  it("returns an MCP tool error when the token is rejected (401)", async () => {
    const { stub } = makeFetchStub([
      {
        status: 401,
        body: { error: "Invalid token" },
      },
    ]);
    const { client, server } = await connectClient(stub, "bad-token");
    opened.push({ close: () => server.close() });
    opened.push({ close: () => client.close() });

    const result = await client.callTool({
      name: "get_profile",
      arguments: {},
    });

    expect(result.isError).toBe(true);
    const text = (result.content as Array<{ type: string; text: string }>)[0]
      ?.text;
    expect(text).toMatch(/401/);
    expect(text).toMatch(/SLOTHING_TOKEN/);
  });
});
