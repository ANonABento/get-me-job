import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  updateContact: vi.fn(),
  deleteContact: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/db/contacts", () => ({
  updateContact: mocks.updateContact,
  deleteContact: mocks.deleteContact,
}));

import { DELETE, PATCH } from "./route";

function patchRequest(body: unknown) {
  return new NextRequest("http://localhost/api/contacts/contact-1", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("contact detail route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.isAuthError.mockReturnValue(false);
    mocks.updateContact.mockReturnValue({
      id: "contact-1",
      userId: "user-1",
      name: "Avery Lee",
      createdAt: "2026-04-01T00:00:00.000Z",
      updatedAt: "2026-04-01T00:00:00.000Z",
    });
    mocks.deleteContact.mockReturnValue(true);
  });

  it("updates a contact", async () => {
    const response = await PATCH(patchRequest({ role: "Hiring Manager" }), {
      params: { id: "contact-1" },
    });

    expect(response.status).toBe(200);
    expect(mocks.updateContact).toHaveBeenCalledWith(
      "contact-1",
      { role: "Hiring Manager" },
      "user-1"
    );
  });

  it("returns 404 when updating a missing contact", async () => {
    mocks.updateContact.mockReturnValue(null);

    const response = await PATCH(patchRequest({ role: "Hiring Manager" }), {
      params: { id: "missing" },
    });

    expect(response.status).toBe(404);
  });

  it("rejects invalid update dates", async () => {
    const response = await PATCH(patchRequest({ nextFollowup: "2026-13-01" }), {
      params: { id: "contact-1" },
    });

    expect(response.status).toBe(400);
    expect(mocks.updateContact).not.toHaveBeenCalled();
  });

  it("deletes a contact", async () => {
    const response = await DELETE(
      new NextRequest("http://localhost/api/contacts/contact-1"),
      { params: { id: "contact-1" } }
    );

    expect(response.status).toBe(200);
    expect(mocks.deleteContact).toHaveBeenCalledWith("contact-1", "user-1");
  });
});
