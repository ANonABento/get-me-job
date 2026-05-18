import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/web-vitals", () => ({
  recordWebVital: vi.fn(),
}));

import { POST } from "./route";
import { recordWebVital } from "@/lib/db/web-vitals";
import {
  expectRouteResponseContract,
  invokeRouteHandler,
  jsonRequest,
  routeContext,
} from "@/test/contract";

describe("/api/monitoring/vitals route contract", () => {
  beforeEach(() => {
    vi.mocked(recordWebVital).mockClear();
  });

  it("records a valid Core Web Vital metric", async () => {
    const response = await invokeRouteHandler(
      POST,
      jsonRequest(
        "http://localhost/api/monitoring/vitals",
        {
          metricId: "v1",
          name: "LCP",
          value: 1234,
          delta: 1234,
          rating: "good",
          navigationType: "navigate",
          pathname: "/en/dashboard",
        },
        "POST",
      ),
      routeContext(),
    );

    await expectRouteResponseContract(response.clone());
    expect(response.status).toBe(202);
    expect(recordWebVital).toHaveBeenCalledWith(
      expect.objectContaining({
        metricId: "v1",
        name: "LCP",
        pathname: "/en/dashboard",
      }),
    );
  });

  it("rejects invalid metric payloads", async () => {
    const response = await invokeRouteHandler(
      POST,
      jsonRequest(
        "http://localhost/api/monitoring/vitals",
        { name: "not-a-metric" },
        "POST",
      ),
      routeContext(),
    );

    expect(response.status).toBe(400);
    expect(recordWebVital).not.toHaveBeenCalled();
  });
});
