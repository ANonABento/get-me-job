/**
 * Minimal HTTP client around the Slothing `/api/extension/*` surface.
 *
 * The MCP server is a thin adapter: every tool ultimately hits one of the
 * existing extension-token-authenticated routes on the Slothing web app. We
 * deliberately do not add any new server-side endpoints — the same
 * `X-Extension-Token` header path the Slothing browser extension uses covers
 * the MCP server too.
 */
export interface ApiClientConfig {
  /** Base URL of the Slothing web app, e.g. `http://localhost:3000`. */
  baseUrl: string;
  /** Extension token (minted via `POST /api/extension/auth`). */
  token: string;
  /** Optional fetch override for tests / custom transports. */
  fetchImpl?: typeof fetch;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export interface ApiClient {
  request<T>(path: string, init?: RequestInit): Promise<T>;
  get<T>(
    path: string,
    query?: Record<string, string | number | undefined>,
  ): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
  patch<T>(path: string, body: unknown): Promise<T>;
}

/**
 * Build a small typed HTTP client. All requests:
 *
 * - Join `baseUrl` + `path` safely (trailing slash on the base is OK).
 * - Set `X-Extension-Token` and `Content-Type: application/json`.
 * - Throw `ApiError` on non-2xx responses with the parsed JSON body when
 *   available — preserving the HTTP status so callers can surface a clear
 *   "bad token" error over MCP.
 */
export function createApiClient(config: ApiClientConfig): ApiClient {
  const fetchImpl = config.fetchImpl ?? fetch;
  const base = config.baseUrl.replace(/\/+$/, "");
  const token = config.token;

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
    const headers = new Headers(init.headers);
    headers.set("X-Extension-Token", token);
    headers.set("Accept", "application/json");
    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetchImpl(url, { ...init, headers });
    const text = await response.text();
    let parsed: unknown = null;
    if (text.length > 0) {
      try {
        parsed = JSON.parse(text) as unknown;
      } catch {
        parsed = text;
      }
    }

    if (!response.ok) {
      const message =
        extractMessage(parsed) ?? response.statusText ?? "Request failed";
      throw new ApiError(
        `Slothing API ${response.status} ${message}`,
        response.status,
        parsed,
      );
    }

    return parsed as T;
  }

  async function get<T>(
    path: string,
    query?: Record<string, string | number | undefined>,
  ): Promise<T> {
    const params = new URLSearchParams();
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) continue;
        params.set(key, String(value));
      }
    }
    const suffix = params.toString();
    const finalPath = suffix.length > 0 ? `${path}?${suffix}` : path;
    return request<T>(finalPath, { method: "GET" });
  }

  async function post<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, {
      method: "POST",
      body: JSON.stringify(body ?? {}),
    });
  }

  async function patch<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body ?? {}),
    });
  }

  return { request, get, post, patch };
}

function extractMessage(parsed: unknown): string | undefined {
  if (parsed && typeof parsed === "object" && "error" in parsed) {
    const err = (parsed as { error: unknown }).error;
    if (typeof err === "string") return err;
  }
  return undefined;
}
