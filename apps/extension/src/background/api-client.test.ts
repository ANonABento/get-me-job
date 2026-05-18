import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getStorage: vi.fn(),
  setStorage: vi.fn(),
  clearSessionAuthCache: vi.fn(),
  markAuthSeen: vi.fn(),
}));

vi.mock("./storage", () => ({
  getStorage: mocks.getStorage,
  setStorage: mocks.setStorage,
  clearSessionAuthCache: mocks.clearSessionAuthCache,
  markAuthSeen: mocks.markAuthSeen,
}));

import { SlothingAPIClient } from "./api-client";
import type { ScrapedJob } from "@/shared/types";

const job: ScrapedJob = {
  title: "Frontend Engineer",
  company: "Acme",
  description:
    "Build polished TypeScript application experiences for customers.",
  requirements: ["TypeScript"],
  url: "https://example.com/job",
  source: "greenhouse",
};

describe("SlothingAPIClient one-click generation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getStorage.mockResolvedValue({
      authToken: "token-1",
      apiBaseUrl: "http://localhost:3000",
      settings: {},
    });
    vi.stubGlobal("fetch", vi.fn());
  });

  it("imports the job before tailoring a resume", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ opportunityIds: ["opp-1"], imported: 1 }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ savedResume: { id: "resume-1" }, jobId: "opp-1" }),
          { status: 200 },
        ),
      );

    const client = new SlothingAPIClient("http://localhost:3000");
    const result = await client.tailorFromJob(job);

    expect(result.savedResume.id).toBe("resume-1");
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "http://localhost:3000/api/tailor",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          action: "generate",
          jobDescription: job.description,
          jobTitle: job.title,
          company: job.company,
          opportunityId: "opp-1",
        }),
      }),
    );
  });

  it("imports the job before generating a cover letter", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ opportunityIds: ["opp-1"], imported: 1 }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ savedCoverLetter: { id: "cl-1" } }), {
          status: 200,
        }),
      );

    const client = new SlothingAPIClient("http://localhost:3000");
    const result = await client.generateCoverLetterFromJob(job);

    expect(result.savedCoverLetter.id).toBe("cl-1");
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "http://localhost:3000/api/cover-letter/generate",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          action: "generate",
          jobDescription: job.description,
          jobTitle: job.title,
          company: job.company,
          opportunityId: "opp-1",
        }),
      }),
    );
  });

  it("does not call the API when the scraped description is too short", async () => {
    const client = new SlothingAPIClient("http://localhost:3000");

    await expect(
      client.tailorFromJob({ ...job, description: "Too short" }),
    ).rejects.toThrow("Couldn't read the full job description");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("threads baseResumeId through to /api/tailor when supplied (#34)", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ opportunityIds: ["opp-1"], imported: 1 }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ savedResume: { id: "resume-1" }, jobId: "opp-1" }),
          { status: 200 },
        ),
      );

    const client = new SlothingAPIClient("http://localhost:3000");
    await client.tailorFromJob(job, "base-resume-42");

    const tailorCall = vi.mocked(fetch).mock.calls[1];
    expect(tailorCall[0]).toBe("http://localhost:3000/api/tailor");
    const tailorBody = JSON.parse(
      (tailorCall[1] as RequestInit).body as string,
    );
    expect(tailorBody).toEqual({
      action: "generate",
      jobDescription: job.description,
      jobTitle: job.title,
      company: job.company,
      opportunityId: "opp-1",
      baseResumeId: "base-resume-42",
    });
  });
});

describe("SlothingAPIClient.listResumes (#34)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getStorage.mockResolvedValue({
      authToken: "token-1",
      apiBaseUrl: "http://localhost:3000",
      settings: {},
    });
    vi.stubGlobal("fetch", vi.fn());
  });

  it("returns the resumes array from /api/extension/resumes", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          resumes: [
            {
              id: "r-1",
              name: "Senior Backend · Acme",
              targetRole: "Senior Backend",
              updatedAt: "2026-05-10T12:00:00.000Z",
            },
          ],
        }),
        { status: 200 },
      ),
    );

    const client = new SlothingAPIClient("http://localhost:3000");
    const resumes = await client.listResumes();

    expect(resumes).toHaveLength(1);
    expect(resumes[0]).toMatchObject({
      id: "r-1",
      targetRole: "Senior Backend",
    });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/extension/resumes",
      expect.objectContaining({
        headers: expect.objectContaining({ "X-Extension-Token": "token-1" }),
      }),
    );
  });

  it("returns an empty array when the response omits a resumes field", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    const client = new SlothingAPIClient("http://localhost:3000");
    const resumes = await client.listResumes();

    expect(resumes).toEqual([]);
  });

  it("throws when the request fails with a non-2xx response", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "boom" }), { status: 500 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "boom" }), { status: 500 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "boom" }), { status: 500 }),
      );

    const client = new SlothingAPIClient("http://localhost:3000");
    await expect(client.listResumes()).rejects.toThrow();
  });

  it("retries transient read failures and returns the eventual response", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response("Service unavailable", { status: 503 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            resumes: [
              {
                id: "r-2",
                name: "Recovered resume",
                targetRole: "Engineer",
                updatedAt: "2026-05-18T00:00:00.000Z",
              },
            ],
          }),
          { status: 200 },
        ),
      );

    const client = new SlothingAPIClient("http://localhost:3000");
    const resumes = await client.listResumes();

    expect(resumes).toHaveLength(1);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("does not retry 401 and clears auth immediately", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
      }),
    );

    const client = new SlothingAPIClient("http://localhost:3000");
    await expect(client.listResumes()).rejects.toThrow(
      "Authentication expired",
    );

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(mocks.setStorage).toHaveBeenCalledWith({
      authToken: undefined,
      tokenExpiry: undefined,
    });
    expect(mocks.clearSessionAuthCache).toHaveBeenCalled();
  });

  it("does not retry non-idempotent import mutations", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "try later" }), { status: 503 }),
    );

    const client = new SlothingAPIClient("http://localhost:3000");
    await expect(client.importJob(job)).rejects.toThrow("try later");
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
