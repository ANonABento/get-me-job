import { NextRequest, NextResponse } from "next/server";
import { requireCronAuth } from "@/lib/cron-auth";
import { recordCronRun } from "@/lib/db/cron-runs";
import { nowEpoch, nowIso, parseToDate, toIso } from "@/lib/format/time";
import { listGoogleConnectedUserIds } from "@/lib/google/client";
import { searchInterviewEvents } from "@/lib/google/calendar";
import {
  listAllOpportunities,
  changeOpportunityStatus,
} from "@/lib/opportunities";
import { matchOpportunityForCalendarEvent } from "@/lib/calendar/match-opportunity";
import { createNotification } from "@/lib/db/notifications";
import {
  hasProcessedExternalCalendarEvent,
  recordExternalCalendarEvent,
} from "@/lib/db/external-calendar-events";
import { createSuggestedStatusUpdate } from "@/lib/db/suggested-status-updates";
import {
  buildStatusAutomationNotificationMessage,
  shouldAutoApplyStatusUpdate,
} from "@/lib/status-automation/confidence";
import {
  getCalendarPullEnabled,
  setCalendarLastPulledAt,
} from "@/lib/settings/calendar-sync";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PROVIDER = "google";
const LOOKBACK_MS = 24 * 60 * 60 * 1000;

interface CalendarSyncSummary {
  ok: true;
  cron: "google.calendar-sync";
  usersProcessed: number;
  eventsScanned: number;
  matched: number;
  autoLinked: number;
  suggested: number;
  skipped: number;
  errors: number;
  durationMs: number;
}

export async function GET(request: NextRequest) {
  const authError = await requireCronAuth(request);
  if (authError) return authError;

  const startedAt = nowEpoch();
  const startedIso = nowIso();
  const summary: CalendarSyncSummary = {
    ok: true,
    cron: "google.calendar-sync",
    usersProcessed: 0,
    eventsScanned: 0,
    matched: 0,
    autoLinked: 0,
    suggested: 0,
    skipped: 0,
    errors: 0,
    durationMs: 0,
  };

  const sinceDate =
    parseToDate(nowEpoch() - LOOKBACK_MS) ?? parseToDate(nowEpoch())!;
  const userIds = await listGoogleConnectedUserIds();

  for (const userId of userIds) {
    try {
      summary.usersProcessed += 1;
      const autoLinkEnabled = getCalendarPullEnabled(userId);
      const events = await searchInterviewEvents(userId, sinceDate);
      const opportunities = listAllOpportunities(userId);

      for (const event of events) {
        summary.eventsScanned += 1;
        if (hasProcessedExternalCalendarEvent(userId, PROVIDER, event.id)) {
          summary.skipped += 1;
          continue;
        }

        const match = matchOpportunityForCalendarEvent(event, opportunities);
        if (!match) {
          recordExternalCalendarEvent({
            userId,
            provider: PROVIDER,
            externalEventId: event.id,
            calendarId: event.calendarId,
            action: "unmatched",
            eventTitle: event.title,
            eventStart: toIso(event.startDate),
          });
          summary.skipped += 1;
          continue;
        }

        summary.matched += 1;

        if (autoLinkEnabled && shouldAutoApplyStatusUpdate(match.confidence)) {
          changeOpportunityStatus(match.opportunity.id, "interviewing", userId);
          createNotification(
            {
              type: "interview_scheduled",
              title: "Interview detected",
              message: buildStatusAutomationNotificationMessage({
                company: match.opportunity.company,
                title: match.opportunity.title,
                previousStatus: match.opportunity.status,
                nextStatus: "interviewing",
                reason: match.reason,
                confidence: match.confidence,
                evidence: match.evidence,
                action: "updated",
              }),
              link: `/opportunities?id=${match.opportunity.id}`,
            },
            userId,
          );
          recordExternalCalendarEvent({
            userId,
            provider: PROVIDER,
            externalEventId: event.id,
            calendarId: event.calendarId,
            matchedOpportunityId: match.opportunity.id,
            action: "auto_linked",
            eventTitle: event.title,
            eventStart: toIso(event.startDate),
          });
          summary.autoLinked += 1;
          continue;
        }

        const notification = createNotification(
          {
            type: "application_update",
            title: "Suggested status update",
            message: buildStatusAutomationNotificationMessage({
              company: match.opportunity.company,
              title: match.opportunity.title,
              nextStatus: "interviewing",
              reason: match.reason,
              confidence: match.confidence,
              evidence: match.evidence,
              action: "suggested",
            }),
            link: `/opportunities?id=${match.opportunity.id}`,
          },
          userId,
        );
        createSuggestedStatusUpdate({
          userId,
          notificationId: notification.id,
          opportunityId: match.opportunity.id,
          suggestedStatus: "interviewing",
          sourceProvider: PROVIDER,
          sourceEventId: event.id,
          confidence: match.confidence,
          reason: match.reason,
          evidence: match.evidence,
        });
        recordExternalCalendarEvent({
          userId,
          provider: PROVIDER,
          externalEventId: event.id,
          calendarId: event.calendarId,
          matchedOpportunityId: match.opportunity.id,
          action: "suggested",
          eventTitle: event.title,
          eventStart: toIso(event.startDate),
        });
        summary.suggested += 1;
      }

      setCalendarLastPulledAt(nowIso(), userId);
    } catch (error) {
      summary.errors += 1;
      console.error(`Google calendar pull failed for user ${userId}:`, error);
    }
  }

  summary.durationMs = nowEpoch() - startedAt;
  recordCronRun({
    cron: "google.calendar-sync",
    status: summary.errors === 0 ? "success" : "failure",
    startedAt: startedIso,
    durationMs: summary.durationMs,
    summary: { ...summary },
  });
  return NextResponse.json(summary);
}
