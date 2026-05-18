import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { logEnvValidation } from "@/lib/env";
import { captureException, initializeErrorMonitoring } from "@/lib/monitoring";
import { onRequestError, register } from "./instrumentation";

vi.mock("@/lib/env", () => ({
  logEnvValidation: vi.fn(),
}));

vi.mock("@/lib/monitoring", () => ({
  captureException: vi.fn(),
  initializeErrorMonitoring: vi.fn(),
}));

const mockedLogEnvValidation = vi.mocked(logEnvValidation);
const mockedInitializeErrorMonitoring = vi.mocked(initializeErrorMonitoring);
const mockedCaptureException = vi.mocked(captureException);

describe("instrumentation register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("logs env validation in the Node runtime", async () => {
    vi.stubEnv("NEXT_RUNTIME", "nodejs");

    await register();

    expect(mockedLogEnvValidation).toHaveBeenCalledTimes(1);
    expect(mockedInitializeErrorMonitoring).toHaveBeenCalledTimes(1);
  });

  it("does not log env validation in the Edge runtime", async () => {
    vi.stubEnv("NEXT_RUNTIME", "edge");

    await register();

    expect(mockedLogEnvValidation).not.toHaveBeenCalled();
    expect(mockedInitializeErrorMonitoring).not.toHaveBeenCalled();
  });

  it("captures request errors through monitoring", () => {
    const error = new Error("boom");

    onRequestError(error, { path: "/x" }, { routerKind: "app" });

    expect(mockedCaptureException).toHaveBeenCalledWith(
      error,
      expect.objectContaining({ source: "next_request_error" }),
    );
  });
});
