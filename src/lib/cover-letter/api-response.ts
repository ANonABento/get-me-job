type CoverLetterApiPayload = {
  content?: unknown;
  error?: unknown;
};

export type CoverLetterApiResult =
  | { ok: true; content: string }
  | { ok: false; error: string };

function isCoverLetterApiPayload(value: unknown): value is CoverLetterApiPayload {
  return typeof value === "object" && value !== null;
}

export async function readCoverLetterApiResult(
  response: Response,
  fallbackError: string
): Promise<CoverLetterApiResult> {
  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    return { ok: false, error: fallbackError };
  }

  if (!isCoverLetterApiPayload(payload)) {
    return { ok: false, error: fallbackError };
  }

  if (!response.ok) {
    return {
      ok: false,
      error: typeof payload.error === "string" ? payload.error : fallbackError,
    };
  }

  if (typeof payload.content !== "string") {
    return { ok: false, error: fallbackError };
  }

  return { ok: true, content: payload.content };
}
