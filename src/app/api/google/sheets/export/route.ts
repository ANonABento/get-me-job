/**
 * Google Sheets Export API
 *
 * POST /api/google/sheets/export - Export data to Google Sheets
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  exportJobTrackerToSheet,
  createSalaryComparisonSheet,
  createApplicationTrackingSheet,
  createSpreadsheet,
  updateSheet,
} from "@/lib/google/sheets";
import { getJobs } from "@/lib/db/jobs";
import { isGoogleConnected } from "@/lib/google/client";

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
    const { type, data } = body;

    let result;

    switch (type) {
      case "job_tracker":
        const jobs = getJobs();
        result = await exportJobTrackerToSheet(jobs);
        break;

      case "salary_comparison":
        if (!data?.offers || !Array.isArray(data.offers)) {
          return NextResponse.json(
            { error: "Missing required field: data.offers (array)" },
            { status: 400 }
          );
        }
        result = await createSalaryComparisonSheet(data.offers);
        break;

      case "application_tracker":
        result = await createApplicationTrackingSheet();
        break;

      case "custom":
        if (!data?.title) {
          return NextResponse.json(
            { error: "Missing required field: data.title" },
            { status: 400 }
          );
        }
        result = await createSpreadsheet(
          data.title,
          data.sheetTitles || ["Sheet1"]
        );

        // If initial data provided, populate sheets
        if (result && data.sheets) {
          for (const [sheetName, values] of Object.entries(data.sheets)) {
            if (Array.isArray(values)) {
              await updateSheet(
                result.spreadsheetId,
                `${sheetName}!A1`,
                values as (string | number | boolean)[][]
              );
            }
          }
        }
        break;

      default:
        return NextResponse.json(
          { error: "Invalid export type. Use: job_tracker, salary_comparison, application_tracker, or custom" },
          { status: 400 }
        );
    }

    if (!result) {
      return NextResponse.json(
        { error: "Failed to create spreadsheet" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      spreadsheetId: result.spreadsheetId,
      spreadsheetUrl: result.spreadsheetUrl,
    });
  } catch (error) {
    console.error("Sheets export error:", error);
    return NextResponse.json(
      { error: "Failed to export to sheets" },
      { status: 500 }
    );
  }
}
