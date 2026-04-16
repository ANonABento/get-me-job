/**
 * @route GET /api/google/tasks/sync
 * @route POST /api/google/tasks/sync
 * @description List tasks from Google Tasks or sync/create/complete tasks
 * @auth Required
 * @request { action?: "complete" | "sync", syncType?: string, taskId?: string }
 * @response GoogleTasksListResponse | GoogleTasksSyncResponse from @/types/api
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  listJobSearchTasks,
  syncReminderToTasks,
  createFollowUpTask,
  createDeadlineTask,
  completeTask,
} from "@/lib/google/tasks";
import { getReminders } from "@/lib/db/reminders";
import { getJobs } from "@/lib/db/jobs";
import { isGoogleConnected } from "@/lib/google/client";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const connected = await isGoogleConnected();
  if (!connected) {
    return NextResponse.json(
      { error: "Google account not connected" },
      { status: 400 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const showCompleted = searchParams.get("showCompleted") !== "false";

    const tasks = await listJobSearchTasks(showCompleted);

    return NextResponse.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Tasks list error:", error);
    return NextResponse.json(
      { error: "Failed to list tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const connected = await isGoogleConnected();
  if (!connected) {
    return NextResponse.json(
      { error: "Google account not connected" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { action, syncType, ...data } = body;

    // Handle specific actions
    if (action === "complete") {
      if (!data.taskId) {
        return NextResponse.json(
          { error: "Missing required field: taskId" },
          { status: 400 }
        );
      }
      const success = await completeTask(data.taskId);
      return NextResponse.json({ success });
    }

    if (action === "follow_up") {
      if (!data.company || !data.role || !data.interviewDate) {
        return NextResponse.json(
          { error: "Missing required fields: company, role, interviewDate" },
          { status: 400 }
        );
      }
      const taskId = await createFollowUpTask(
        data.company,
        data.role,
        new Date(data.interviewDate)
      );
      return NextResponse.json({
        success: taskId !== null,
        taskId,
      });
    }

    if (action === "deadline") {
      if (!data.company || !data.role || !data.deadline) {
        return NextResponse.json(
          { error: "Missing required fields: company, role, deadline" },
          { status: 400 }
        );
      }
      const taskId = await createDeadlineTask(
        data.company,
        data.role,
        new Date(data.deadline)
      );
      return NextResponse.json({
        success: taskId !== null,
        taskId,
      });
    }

    // Default: sync reminders
    const results: { title: string; success: boolean; taskId?: string }[] = [];
    const jobs = getJobs(authResult.userId);
    const reminders = getReminders({ userId: authResult.userId });

    const type = syncType || "all";

    if (type === "all" || type === "reminders") {
      const activeReminders = reminders.filter((r) => !r.completed);

      for (const reminder of activeReminders) {
        const job = jobs.find((j) => j.id === reminder.jobId);
        const jobInfo = job
          ? { title: job.title, company: job.company }
          : undefined;

        const taskId = await syncReminderToTasks(reminder, jobInfo);
        results.push({
          title: reminder.title,
          success: taskId !== null,
          taskId: taskId || undefined,
        });

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    if (type === "all" || type === "deadlines") {
      const jobsWithDeadlines = jobs.filter((j) => j.deadline);

      for (const job of jobsWithDeadlines) {
        const taskId = await createDeadlineTask(
          job.company,
          job.title,
          new Date(job.deadline!)
        );
        results.push({
          title: `Deadline: ${job.title} at ${job.company}`,
          success: taskId !== null,
          taskId: taskId || undefined,
        });

        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: failedCount === 0,
      synced: successCount,
      failed: failedCount,
      results,
    });
  } catch (error) {
    console.error("Tasks sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync tasks" },
      { status: 500 }
    );
  }
}
