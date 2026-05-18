import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listGoogleConnectedUserIds: vi.fn(),
  searchInterviewEvents: vi.fn(),
  listAllOpportunities: vi.fn(),
  matchOpportunityForCalendarEvent: vi.fn(),
  hasProcessedExternalCalendarEvent: vi.fn(),
  recordExternalCalendarEvent: vi.fn(),
  createNotification: vi.fn(),
  createSuggestedStatusUpdate: vi.fn(),
  getCalendarPullEnabled: vi.fn(),
  setCalendarLastPulledAt: vi.fn(),
  changeOpportunityStatus: vi.fn(),
}));

vi.mock("@/lib/cron-auth", () => ({
  requireCronAuth: vi.fn(async () => null),
}));
vi.mock("@/lib/db/cron-runs", () => ({
  recordCronRun: vi.fn(),
}));
vi.mock("@/lib/google/client", () => ({
  listGoogleConnectedUserIds: mocks.listGoogleConnectedUserIds,
}));
vi.mock("@/lib/google/calendar", () => ({
  searchInterviewEvents: mocks.searchInterviewEvents,
}));
vi.mock("@/lib/opportunities", () => ({
  listAllOpportunities: mocks.listAllOpportunities,
  changeOpportunityStatus: mocks.changeOpportunityStatus,
}));
vi.mock("@/lib/calendar/match-opportunity", () => ({
  matchOpportunityForCalendarEvent: mocks.matchOpportunityForCalendarEvent,
}));
vi.mock("@/lib/db/external-calendar-events", () => ({
  hasProcessedExternalCalendarEvent: mocks.hasProcessedExternalCalendarEvent,
  recordExternalCalendarEvent: mocks.recordExternalCalendarEvent,
}));
vi.mock("@/lib/db/notifications", () => ({
  createNotification: mocks.createNotification,
}));
vi.mock("@/lib/db/suggested-status-updates", () => ({
  createSuggestedStatusUpdate: mocks.createSuggestedStatusUpdate,
}));
vi.mock("@/lib/settings/calendar-sync", () => ({
  getCalendarPullEnabled: mocks.getCalendarPullEnabled,
  setCalendarLastPulledAt: mocks.setCalendarLastPulledAt,
}));

import { GET } from "./route";
import { requireCronAuth } from "@/lib/cron-auth";
import { getRequest, invokeRouteHandler, routeContext } from "@/test/contract";

describe("/api/cron/google/calendar-sync", () => {
  const opportunity = {
    id: "opp-1",
    company: "Anthropic",
    title: "Engineer",
    type: "job",
    source: "manual",
    status: "saved",
    summary: "",
    createdAt: "2026-05-10T00:00:00.000Z",
    updatedAt: "2026-05-10T00:00:00.000Z",
  };
  const event = {
    id: "event-1",
    title: "Anthropic interview",
    startDate: new Date("2026-05-10T00:00:00.000Z"),
    calendarId: "primary",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireCronAuth).mockResolvedValue(null);
    mocks.listGoogleConnectedUserIds.mockResolvedValue(["user-1"]);
    mocks.searchInterviewEvents.mockResolvedValue([event]);
    mocks.listAllOpportunities.mockReturnValue([opportunity]);
    mocks.matchOpportunityForCalendarEvent.mockReturnValue({
      opportunity,
      score: 100,
      confidence: 0.9,
      reason: "company in title",
      evidence: ["Anthropic interview"],
    });
    mocks.hasProcessedExternalCalendarEvent.mockReturnValue(false);
    mocks.createNotification.mockReturnValue({ id: "notif-1" });
    mocks.getCalendarPullEnabled.mockReturnValue(true);
  });

  it("propagates auth failures", async () => {
    vi.mocked(requireCronAuth).mockResolvedValueOnce(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/cron/google/calendar-sync"),
      routeContext(),
    );

    expect(response.status).toBe(401);
    expect(mocks.searchInterviewEvents).not.toHaveBeenCalled();
  });

  it("auto-links matched interviews when enabled", async () => {
    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/cron/google/calendar-sync"),
      routeContext(),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      matched: 1,
      autoLinked: 1,
      suggested: 0,
    });
    expect(mocks.changeOpportunityStatus).toHaveBeenCalledWith(
      "opp-1",
      "interviewing",
      "user-1",
    );
  });

  it("creates suggested updates when auto-link is off", async () => {
    mocks.getCalendarPullEnabled.mockReturnValue(false);

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/cron/google/calendar-sync"),
      routeContext(),
    );

    await expect(response.json()).resolves.toMatchObject({
      matched: 1,
      autoLinked: 0,
      suggested: 1,
    });
    expect(mocks.createSuggestedStatusUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        notificationId: "notif-1",
        opportunityId: "opp-1",
        suggestedStatus: "interviewing",
        confidence: 0.9,
        evidence: ["Anthropic interview"],
      }),
    );
  });

  it("creates suggested updates for lower-confidence matches even when auto-link is on", async () => {
    mocks.matchOpportunityForCalendarEvent.mockReturnValue({
      opportunity,
      score: 70,
      confidence: 0.58,
      reason: "company in attendee domain",
      evidence: ["recruiting@anthropic.com"],
    });

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/cron/google/calendar-sync"),
      routeContext(),
    );

    await expect(response.json()).resolves.toMatchObject({
      matched: 1,
      autoLinked: 0,
      suggested: 1,
    });
    expect(mocks.changeOpportunityStatus).not.toHaveBeenCalled();
    expect(mocks.createSuggestedStatusUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        confidence: 0.58,
        reason: "company in attendee domain",
      }),
    );
  });

  it("skips already processed events", async () => {
    mocks.hasProcessedExternalCalendarEvent.mockReturnValue(true);

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/cron/google/calendar-sync"),
      routeContext(),
    );

    await expect(response.json()).resolves.toMatchObject({
      matched: 0,
      skipped: 1,
    });
    expect(mocks.createNotification).not.toHaveBeenCalled();
  });
});
