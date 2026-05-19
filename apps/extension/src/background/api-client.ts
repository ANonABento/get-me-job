// Slothing API client for extension

import type {
  AnswerBankMatch,
  ChatJobContext,
  ExtensionProfile,
  ExtensionResumeSummary,
  ScrapedJob,
  LearnedAnswer,
  SimilarAnswer,
  TrackedApplicationPayload,
  SaveCorrectionPayload,
} from "@/shared/types";
import { createOpportunitySchema } from "@slothing/shared/schemas";
import {
  clearSessionAuthCache,
  getStorage,
  markAuthSeen,
  setStorage,
} from "./storage";

type RetryPolicy = "none" | "safe" | "once";

const TRANSIENT_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);
const CHAT_RETRY_STATUS_CODES = new Set([500, 502, 503, 504]);

export class SlothingAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private async getAuthToken(): Promise<string | null> {
    const storage = await getStorage();
    if (!storage.authToken) return null;

    // Check expiry
    if (storage.tokenExpiry) {
      const expiry = new Date(storage.tokenExpiry);
      if (expiry < new Date()) {
        // Token expired, clear it
        await setStorage({ authToken: undefined, tokenExpiry: undefined });
        return null;
      }
    }

    return storage.authToken;
  }

  private async authenticatedFetch<T>(
    path: string,
    options: RequestInit = {},
    retryPolicy: RetryPolicy = inferRetryPolicy(options),
  ): Promise<T> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const maxAttempts =
      retryPolicy === "safe" ? 3 : retryPolicy === "once" ? 2 : 1;
    let lastResponse: Response | null = null;
    let sawRetry = false;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      let response: Response;
      try {
        response = await fetch(`${this.baseUrl}${path}`, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            "X-Extension-Token": token,
            ...options.headers,
          },
        });
      } catch (error) {
        if (attempt < maxAttempts) {
          sawRetry = true;
          await waitForRetry(retryDelayMs(attempt));
          continue;
        }
        throw error;
      }

      if (response.status === 401) {
        // Clear invalid token AND the fast-path session cache (#30) so the
        // next popup open re-verifies instead of trusting a stale verdict.
        await setStorage({ authToken: undefined, tokenExpiry: undefined });
        await clearSessionAuthCache();
        throw new Error("Authentication expired");
      }

      if (response.ok) {
        return response.json();
      }

      lastResponse = response;

      if (
        attempt < maxAttempts &&
        TRANSIENT_STATUS_CODES.has(response.status)
      ) {
        sawRetry = true;
        await waitForRetry(retryDelayMs(attempt, response));
        continue;
      }

      const error = await response
        .json()
        .catch(() => ({ error: "Request failed" }));
      const fallback = sawRetry
        ? `Request still failing after retry: ${response.status}`
        : `Request failed: ${response.status}`;
      throw new Error(error.error || fallback);
    }

    throw new Error(
      sawRetry && lastResponse
        ? `Request still failing after retry: ${lastResponse.status}`
        : "Request failed",
    );
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    if (!token) return false;

    try {
      await this.authenticatedFetch("/api/extension/auth/verify", {}, "safe");
      // Record the working-auth breadcrumb so the popup can distinguish a
      // true logout from a service-worker state-loss after this point.
      // See #27.
      await markAuthSeen();
      return true;
    } catch {
      return false;
    }
  }

  async getProfile(): Promise<ExtensionProfile> {
    return this.authenticatedFetch<ExtensionProfile>(
      "/api/extension/profile",
      {},
      "safe",
    );
  }

  async importJob(job: ScrapedJob): Promise<{
    imported: number;
    opportunityIds: string[];
    pendingCount: number;
  }> {
    const opportunity = {
      type: "job" as const,
      title: job.title,
      company: job.company,
      source: normalizeOpportunitySource(job.source),
      sourceUrl: job.url,
      sourceId: job.sourceJobId,
      summary: job.description,
      responsibilities: job.responsibilities || [],
      requiredSkills: job.requirements || [],
      techStack: job.keywords || [],
      jobType: job.type,
      remoteType: job.remote ? ("remote" as const) : undefined,
      deadline: job.deadline,
    };

    createOpportunitySchema.parse(opportunity);

    return this.authenticatedFetch("/api/opportunities/from-extension", {
      method: "POST",
      body: JSON.stringify({
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        requirements: job.requirements,
        responsibilities: job.responsibilities || [],
        keywords: job.keywords || [],
        type: job.type,
        remote: job.remote,
        salary: job.salary,
        url: job.url,
        source: job.source,
        sourceJobId: job.sourceJobId,
        postedAt: job.postedAt,
        deadline: job.deadline,
      }),
    });
  }

  async importJobsBatch(jobs: ScrapedJob[]): Promise<{
    imported: number;
    opportunityIds: string[];
    pendingCount: number;
    dedupedIds?: string[];
    failed?: Array<{
      sourceJobId?: string;
      title?: string;
      company?: string;
      errors: Array<{ field: string; message: string }>;
    }>;
  }> {
    return this.authenticatedFetch("/api/opportunities/from-extension", {
      method: "POST",
      body: JSON.stringify({ jobs }),
    });
  }

  /**
   * Returns the user's already-imported sourceJobIds for a given source.
   * Drives the bulk-scrape pre-row dupe filter — orchestrator skips rows
   * whose ID is in this set.
   */
  async listSourceJobIds(source: string): Promise<string[]> {
    const response = await this.authenticatedFetch<{ ids: string[] }>(
      `/api/extension/source-ids?source=${encodeURIComponent(source)}`,
    );
    return response.ids ?? [];
  }

  async trackApplied(payload: TrackedApplicationPayload): Promise<{
    opportunityId: string;
    deduped: boolean;
  }> {
    const scrapedJob = payload.scrapedJob || undefined;
    const title = scrapedJob?.title || payload.headline || payload.title;
    const company = scrapedJob?.company || payload.host.replace(/^www\./, "");
    const notes = [
      payload.headline ? `Headline: ${payload.headline}` : undefined,
      payload.thumbnailDataUrl
        ? "Screenshot captured by extension."
        : undefined,
    ]
      .filter(Boolean)
      .join("\n");

    const response = await this.authenticatedFetch<{
      opportunityIds: string[];
      dedupedIds?: string[];
    }>("/api/opportunities/from-extension", {
      method: "POST",
      body: JSON.stringify({
        title,
        company,
        location: scrapedJob?.location,
        description:
          scrapedJob?.description ||
          payload.headline ||
          "Application submitted via extension.",
        requirements: scrapedJob?.requirements || [],
        responsibilities: scrapedJob?.responsibilities || [],
        keywords: scrapedJob?.keywords || [],
        type: scrapedJob?.type,
        remote: scrapedJob?.remote,
        salary: scrapedJob?.salary,
        url: scrapedJob?.url || payload.url,
        source: scrapedJob?.source || payload.host,
        sourceJobId: scrapedJob?.sourceJobId,
        postedAt: scrapedJob?.postedAt,
        deadline: scrapedJob?.deadline,
        status: "applied",
        appliedAt: payload.submittedAt,
        notes,
      }),
    });

    const opportunityId = response.opportunityIds[0];
    if (!opportunityId) {
      throw new Error("Application was not tracked");
    }

    return {
      opportunityId,
      deduped: Boolean(response.dedupedIds?.includes(opportunityId)),
    };
  }

  async tailorFromJob(
    job: ScrapedJob,
    baseResumeId?: string,
  ): Promise<{
    opportunityId: string;
    savedResume: { id: string };
    jobId: string;
  }> {
    const jobDescription = getReadableJobDescription(job);
    const imported = await this.importJob(job);
    const opportunityId = getImportedOpportunityId(imported.opportunityIds);

    const requestBody: {
      action: "generate";
      jobDescription: string;
      jobTitle: string;
      company: string;
      opportunityId: string;
      baseResumeId?: string;
    } = {
      action: "generate",
      jobDescription,
      jobTitle: job.title,
      company: job.company,
      opportunityId,
    };
    // Only thread the id through when the popup picked a non-default resume —
    // omitting the field keeps the request body byte-identical to the legacy
    // shape, so existing tests + telemetry don't churn for the master case.
    if (baseResumeId) {
      requestBody.baseResumeId = baseResumeId;
    }

    const response = await this.authenticatedFetch<{
      savedResume?: { id?: string };
      jobId?: string;
    }>("/api/tailor", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    if (!response.savedResume?.id || !response.jobId) {
      throw new Error("Tailored resume was generated without a saved resume.");
    }

    return {
      opportunityId,
      savedResume: { id: response.savedResume.id },
      jobId: response.jobId,
    };
  }

  async listResumes(): Promise<ExtensionResumeSummary[]> {
    const response = await this.authenticatedFetch<{
      resumes: ExtensionResumeSummary[];
    }>("/api/extension/resumes", {}, "safe");
    return response.resumes ?? [];
  }

  async generateCoverLetterFromJob(job: ScrapedJob): Promise<{
    opportunityId: string;
    savedCoverLetter: { id: string };
  }> {
    const jobDescription = getReadableJobDescription(job);
    const imported = await this.importJob(job);
    const opportunityId = getImportedOpportunityId(imported.opportunityIds);

    const response = await this.authenticatedFetch<{
      savedCoverLetter?: { id?: string };
    }>("/api/cover-letter/generate", {
      method: "POST",
      body: JSON.stringify({
        action: "generate",
        jobDescription,
        jobTitle: job.title,
        company: job.company,
        opportunityId,
      }),
    });

    if (!response.savedCoverLetter?.id) {
      throw new Error("Cover letter was generated without a saved document.");
    }

    return {
      opportunityId,
      savedCoverLetter: { id: response.savedCoverLetter.id },
    };
  }

  async saveLearnedAnswer(data: {
    question: string;
    answer: string;
    sourceUrl?: string;
    sourceCompany?: string;
  }): Promise<LearnedAnswer> {
    return this.authenticatedFetch("/api/extension/learned-answers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async searchSimilarAnswers(question: string): Promise<SimilarAnswer[]> {
    const response = await this.authenticatedFetch<{
      results: SimilarAnswer[];
    }>("/api/extension/learned-answers/search", {
      method: "POST",
      body: JSON.stringify({ question }),
    });
    return response.results;
  }

  // P2/#35 — inline answer-bank search on long textareas.
  // Calls /api/answer-bank/match with `q` and optional `limit` (defaults to 5
  // server-side, capped). Used by the floating bulb popover decorator.
  async matchAnswerBank(q: string, limit?: number): Promise<AnswerBankMatch[]> {
    const params = new URLSearchParams({ q });
    if (typeof limit === "number" && Number.isFinite(limit)) {
      params.set("limit", String(limit));
    }
    const response = await this.authenticatedFetch<{
      results: AnswerBankMatch[];
    }>(`/api/answer-bank/match?${params.toString()}`);
    return response.results;
  }

  async getLearnedAnswers(): Promise<LearnedAnswer[]> {
    const response = await this.authenticatedFetch<{
      answers: LearnedAnswer[];
    }>("/api/extension/learned-answers");
    return response.answers;
  }

  async deleteLearnedAnswer(id: string): Promise<void> {
    await this.authenticatedFetch(`/api/extension/learned-answers/${id}`, {
      method: "DELETE",
    });
  }

  async updateLearnedAnswer(
    id: string,
    answer: string,
  ): Promise<LearnedAnswer> {
    return this.authenticatedFetch(`/api/extension/learned-answers/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ answer }),
    });
  }

  /**
   * P4/#40 — Inline AI assistant streaming consumer.
   *
   * Opens an SSE request to /api/extension/chat and yields tokens as they
   * arrive. Service workers DO have `fetch` + `body.getReader()` (verified on
   * Chrome MV3 + Firefox MV2), so we don't need `EventSource` here — which
   * matters because EventSource can't attach the X-Extension-Token header.
   *
   * The server emits three SSE frame shapes:
   *   data: {"token": "..."}     // per token chunk
   *   data: {"done": true}        // end of stream
   *   data: {"error": "..."}      // mid-stream failure (followed by done:true)
   *
   * We yield string tokens to the caller and throw on `{error}` frames so the
   * background's port handler can forward a CHAT_STREAM_ERROR to the UI.
   */
  async *chat(
    prompt: string,
    jobContext?: ChatJobContext,
  ): AsyncGenerator<string, void, void> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${this.baseUrl}/api/extension/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Extension-Token": token,
        Accept: "text/event-stream",
      },
      body: JSON.stringify({ prompt, jobContext }),
    }).catch(async (error) => {
      await waitForRetry(retryDelayMs(1));
      const retried = await fetch(`${this.baseUrl}/api/extension/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Extension-Token": token,
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ prompt, jobContext }),
      });
      if (!retried.ok && CHAT_RETRY_STATUS_CODES.has(retried.status)) {
        throw error;
      }
      return retried;
    });

    if (!response.ok && CHAT_RETRY_STATUS_CODES.has(response.status)) {
      await waitForRetry(retryDelayMs(1, response));
      const retryResponse = await fetch(`${this.baseUrl}/api/extension/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Extension-Token": token,
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ prompt, jobContext }),
      });
      if (retryResponse.ok) {
        yield* readChatStream(retryResponse);
        return;
      }
    }

    if (!response.ok) {
      // 401: invalidate the token, mirror authenticatedFetch() so the popup
      // notices the session lost state on the next open.
      if (response.status === 401) {
        await setStorage({ authToken: undefined, tokenExpiry: undefined });
        await clearSessionAuthCache();
        throw new Error("Authentication expired");
      }
      let errMessage = `Request failed: ${response.status}`;
      try {
        const body = (await response.json()) as { error?: string };
        if (body?.error) errMessage = body.error;
      } catch {
        // Body wasn't JSON; keep the generic message.
      }
      throw new Error(errMessage);
    }

    yield* readChatStream(response);
  }

  /**
   * Persist a user correction so the per-domain field mapping grows stronger
   * over time. See task #33 in docs/extension-roadmap-2026-05.md. The server
   * upserts into `field_mappings`, bumping `hit_count` on existing rows and
   * inserting fresh rows otherwise.
   */
  async saveCorrection(payload: SaveCorrectionPayload): Promise<{
    saved: boolean;
    hitCount: number;
  }> {
    return this.authenticatedFetch("/api/extension/field-mappings/correct", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}

async function* readChatStream(
  response: Response,
): AsyncGenerator<string, void, void> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body");
  }
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE frames are separated by a blank line (\n\n). We split on it and
    // hold the trailing partial in `buffer`.
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      const line = frame.split("\n").find((l) => l.startsWith("data: "));
      if (!line) continue;
      const dataStr = line.slice(6).trim();
      if (!dataStr) continue;
      let parsed: { token?: string; done?: boolean; error?: string };
      try {
        parsed = JSON.parse(dataStr);
      } catch {
        continue;
      }
      if (parsed.error) {
        throw new Error(parsed.error);
      }
      if (parsed.token) {
        yield parsed.token;
      }
      if (parsed.done) {
        return;
      }
    }
  }
}

function inferRetryPolicy(options: RequestInit): RetryPolicy {
  const method = (options.method || "GET").toUpperCase();
  return method === "GET" ? "safe" : "none";
}

function retryDelayMs(attempt: number, response?: Response): number {
  const retryAfter = response?.headers.get("Retry-After");
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds >= 0 && seconds < 5) {
      return seconds * 1000;
    }
  }

  const base = attempt === 1 ? 250 : 750;
  const jitter = Math.floor(Math.random() * 75);
  return base + jitter;
}

async function waitForRetry(delayMs: number): Promise<void> {
  if (process.env.NODE_ENV === "test") return;
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

function getReadableJobDescription(job: ScrapedJob): string {
  const description = job.description?.trim() ?? "";
  if (description.length < 20) {
    throw new Error("Couldn't read the full job description from this page.");
  }
  return description;
}

function getImportedOpportunityId(opportunityIds: string[]): string {
  const opportunityId = opportunityIds[0];
  if (!opportunityId) {
    throw new Error("Job import did not return an opportunity id.");
  }
  return opportunityId;
}

function normalizeOpportunitySource(source: string) {
  const normalized = source.toLowerCase();
  if (normalized.includes("linkedin")) return "linkedin";
  if (normalized.includes("indeed")) return "indeed";
  if (normalized.includes("greenhouse")) return "greenhouse";
  if (normalized.includes("lever")) return "lever";
  if (normalized.includes("waterloo")) return "waterlooworks";
  if (normalized.includes("devpost")) return "devpost";
  return "url";
}

// Singleton instance
let client: SlothingAPIClient | null = null;
let clientBaseUrl: string | null = null;

export async function getAPIClient(): Promise<SlothingAPIClient> {
  const storage = await getStorage();
  if (!client || clientBaseUrl !== storage.apiBaseUrl) {
    client = new SlothingAPIClient(storage.apiBaseUrl);
    clientBaseUrl = storage.apiBaseUrl;
  }
  return client;
}

export function resetAPIClient(): void {
  client = null;
  clientBaseUrl = null;
}
