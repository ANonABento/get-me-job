import { logEnvValidation } from "@/lib/env";
import { captureException, initializeErrorMonitoring } from "@/lib/monitoring";

export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") return;

  logEnvValidation();
  initializeErrorMonitoring();
}

export function onRequestError(
  error: unknown,
  request: unknown,
  context: unknown,
) {
  captureException(error, {
    request,
    context,
    source: "next_request_error",
  });
}
