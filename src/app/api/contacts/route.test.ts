import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  getContacts: vi.fn(),
  createContact: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/db/contacts", () => ({
  getContacts: mocks.getContacts,
  createContact: mocks.createContact,
}));

import { GET, POST } from "./route";

function contactsRequest(path = "/api/contacts") {
  return new NextRequest(`http://localhost${path}`);
}

function createRequest(body: unknown) {
  return new NextRequest("http://localhost/api/contacts", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("contacts route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.isAuthError.mockReturnValue(false);
    mocks.getContacts.mockReturnValue({
      contacts: [],
      total: 0,
      page: 1,
      pageSize: 8,
      totalPages: 1,
    });
    mocks.createContact.mockReturnValue({
      id: "contact-1",
      userId: "user-1",
      name: "Avery Lee",
      createdAt: "2026-04-01T00:00:00.000Z",
      updatedAt: "2026-04-01T00:00:00.000Z",
    });
  });

  it("passes search, follow-up filter, and pagination to getContacts", async () => {
    const response = await GET(
      contactsRequest("/api/contacts?q=avery&followUp=due&page=2&pageSize=8")
    );

    expect(response.status).toBe(200);
    expect(mocks.getContacts).toHaveBeenCalledWith(
      {
        page: 2,
        pageSize: 8,
        query: "avery",
        followUpFilter: "due",
      },
      "user-1"
    );
  });

  it("falls back to all for invalid follow-up filters", async () => {
    await GET(contactsRequest("/api/contacts?followUp=late"));

    expect(mocks.getContacts).toHaveBeenCalledWith(
      {
        page: undefined,
        pageSize: undefined,
        query: undefined,
        followUpFilter: "all",
      },
      "user-1"
    );
  });

  it("ignores malformed pagination parameters", async () => {
    await GET(contactsRequest("/api/contacts?page=2abc&pageSize=8.5"));

    expect(mocks.getContacts).toHaveBeenCalledWith(
      {
        page: undefined,
        pageSize: undefined,
        query: undefined,
        followUpFilter: "all",
      },
      "user-1"
    );
  });

  it("creates a valid contact", async () => {
    const response = await POST(
      createRequest({
        name: "Avery Lee",
        role: "Recruiter",
        company: "Tech Co",
        email: "avery@example.com",
        linkedin: "https://www.linkedin.com/in/avery",
        nextFollowup: "2026-05-01",
        notes: "Intro call",
      })
    );

    expect(response.status).toBe(201);
    expect(mocks.createContact).toHaveBeenCalledWith(
      {
        name: "Avery Lee",
        role: "Recruiter",
        company: "Tech Co",
        email: "avery@example.com",
        linkedin: "https://www.linkedin.com/in/avery",
        nextFollowup: "2026-05-01",
        notes: "Intro call",
      },
      "user-1"
    );
  });

  it("rejects contacts without a name", async () => {
    const response = await POST(createRequest({ name: "" }));

    expect(response.status).toBe(400);
    expect(mocks.createContact).not.toHaveBeenCalled();
  });

  it("rejects invalid contact dates", async () => {
    const response = await POST(
      createRequest({
        name: "Avery Lee",
        lastContacted: "2026-02-31",
        nextFollowup: "tomorrow",
      })
    );

    expect(response.status).toBe(400);
    expect(mocks.createContact).not.toHaveBeenCalled();
  });
});
