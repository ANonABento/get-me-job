import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createWaitlistEntry: vi.fn(),
  trackActivationEvent: vi.fn(),
}));

vi.mock("@/lib/db/waitlist", () => ({
  createWaitlistEntry: mocks.createWaitlistEntry,
}));

vi.mock("@/lib/db/product-analytics", () => ({
  trackActivationEvent: mocks.trackActivationEvent,
}));

import { POST } from "./route";

function post(body: unknown) {
  return new NextRequest("http://localhost/api/waitlist", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/waitlist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createWaitlistEntry.mockReturnValue({
      id: "wait-1",
      email: "avery@example.com",
      source: "pricing",
      interest: "Hosted launch",
      createdAt: "2026-05-18T12:00:00.000Z",
    });
  });

  it("creates a waitlist entry and records the funnel event", async () => {
    const response = await POST(
      post({
        email: "Avery@Example.com",
        source: "pricing",
        interest: "Hosted launch",
      }),
    );

    expect(response.status).toBe(201);
    expect(mocks.createWaitlistEntry).toHaveBeenCalledWith({
      email: "Avery@Example.com",
      source: "pricing",
      interest: "Hosted launch",
    });
    expect(mocks.trackActivationEvent).toHaveBeenCalledWith(
      expect.objectContaining({ event: "waitlist_joined", source: "pricing" }),
    );
  });

  it("rejects invalid emails", async () => {
    const response = await POST(post({ email: "nope" }));

    expect(response.status).toBe(400);
    expect(mocks.createWaitlistEntry).not.toHaveBeenCalled();
  });
});
