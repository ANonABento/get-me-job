/**
 * Google Sheets Operations
 *
 * Export job tracker to Sheets, salary comparisons
 */

import { google } from "googleapis";
import { createGoogleClient } from "./client";
import { getOrCreateRootFolder } from "./drive";
import type { JobDescription } from "@/types";

export interface SpreadsheetResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

export interface SalaryOffer {
  company: string;
  role: string;
  baseSalary: number;
  bonus?: number;
  equity?: number;
  benefits?: string;
  location?: string;
  notes?: string;
}

type CellValue = string | number | boolean | null | undefined;

/**
 * Create a new spreadsheet
 */
export async function createSpreadsheet(
  title: string,
  sheetTitles: string[] = ["Sheet1"]
): Promise<SpreadsheetResult | null> {
  try {
    const auth = await createGoogleClient();
    const sheets = google.sheets({ version: "v4", auth });
    const drive = google.drive({ version: "v3", auth });

    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title },
        sheets: sheetTitles.map((sheetTitle) => ({
          properties: { title: sheetTitle },
        })),
      },
    });

    const spreadsheetId = response.data.spreadsheetId!;
    const spreadsheetUrl = response.data.spreadsheetUrl!;

    // Move to Get Me Job folder
    const folderId = await getOrCreateRootFolder();
    await drive.files.update({
      fileId: spreadsheetId,
      addParents: folderId,
      fields: "id, parents",
    });

    return { spreadsheetId, spreadsheetUrl };
  } catch (error) {
    console.error("Failed to create spreadsheet:", error);
    return null;
  }
}

/**
 * Get spreadsheet data
 */
export async function getSheetData(
  spreadsheetId: string,
  range: string
): Promise<CellValue[][] | null> {
  try {
    const auth = await createGoogleClient();
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return (response.data.values as CellValue[][]) || [];
  } catch (error) {
    console.error("Failed to get sheet data:", error);
    return null;
  }
}

/**
 * Update sheet values
 */
export async function updateSheet(
  spreadsheetId: string,
  range: string,
  values: CellValue[][]
): Promise<boolean> {
  try {
    const auth = await createGoogleClient();
    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });

    return true;
  } catch (error) {
    console.error("Failed to update sheet:", error);
    return false;
  }
}

/**
 * Append data to a sheet
 */
export async function appendToSheet(
  spreadsheetId: string,
  range: string,
  values: CellValue[][]
): Promise<boolean> {
  try {
    const auth = await createGoogleClient();
    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });

    return true;
  } catch (error) {
    console.error("Failed to append to sheet:", error);
    return false;
  }
}

/**
 * Clear sheet range
 */
export async function clearSheet(
  spreadsheetId: string,
  range: string
): Promise<boolean> {
  try {
    const auth = await createGoogleClient();
    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });

    return true;
  } catch (error) {
    console.error("Failed to clear sheet:", error);
    return false;
  }
}

/**
 * Export job tracker to a new spreadsheet
 */
export async function exportJobTrackerToSheet(
  jobs: JobDescription[]
): Promise<SpreadsheetResult | null> {
  const timestamp = new Date().toISOString().split("T")[0];
  const result = await createSpreadsheet(`Job Tracker Export - ${timestamp}`, [
    "All Jobs",
    "By Status",
    "Timeline",
  ]);

  if (!result) return null;

  const { spreadsheetId } = result;

  // Headers for main sheet
  const headers = [
    "Company",
    "Title",
    "Status",
    "Location",
    "Remote",
    "Salary",
    "Applied Date",
    "Deadline",
    "URL",
    "Notes",
  ];

  // Job data rows
  const jobRows = jobs.map((job) => [
    job.company,
    job.title,
    job.status || "saved",
    job.location || "",
    job.remote ? "Yes" : "No",
    job.salary || "",
    job.appliedAt || "",
    job.deadline || "",
    job.url || "",
    job.notes || "",
  ]);

  // Write main data
  await updateSheet(spreadsheetId, "All Jobs!A1", [headers, ...jobRows]);

  // Create status summary
  const statusCounts: Record<string, number> = {};
  jobs.forEach((job) => {
    const status = job.status || "saved";
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const statusRows = Object.entries(statusCounts).map(([status, count]) => [
    status,
    count,
  ]);
  await updateSheet(spreadsheetId, "By Status!A1", [
    ["Status", "Count"],
    ...statusRows,
  ]);

  // Create timeline data (jobs with dates)
  const timelineJobs = jobs
    .filter((j) => j.appliedAt || j.createdAt)
    .sort((a, b) => {
      const dateA = a.appliedAt || a.createdAt;
      const dateB = b.appliedAt || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

  const timelineRows = timelineJobs.map((job) => [
    job.appliedAt || job.createdAt,
    job.company,
    job.title,
    job.status || "saved",
  ]);

  await updateSheet(spreadsheetId, "Timeline!A1", [
    ["Date", "Company", "Title", "Status"],
    ...timelineRows,
  ]);

  return result;
}

/**
 * Create salary comparison spreadsheet
 */
export async function createSalaryComparisonSheet(
  offers: SalaryOffer[]
): Promise<SpreadsheetResult | null> {
  const result = await createSpreadsheet("Salary Comparison", [
    "Offers",
    "Analysis",
  ]);

  if (!result) return null;

  const { spreadsheetId } = result;

  // Main offers table
  const headers = [
    "Company",
    "Role",
    "Location",
    "Base Salary",
    "Bonus",
    "Equity",
    "Total Comp",
    "Benefits",
    "Notes",
  ];

  const offerRows = offers.map((offer, index) => [
    offer.company,
    offer.role,
    offer.location || "",
    offer.baseSalary,
    offer.bonus || 0,
    offer.equity || 0,
    // Formula for total comp
    `=D${index + 2}+E${index + 2}+F${index + 2}`,
    offer.benefits || "",
    offer.notes || "",
  ]);

  await updateSheet(spreadsheetId, "Offers!A1", [headers, ...offerRows]);

  // Analysis sheet with summary stats
  const analysisData = [
    ["Salary Analysis", ""],
    ["", ""],
    ["Total Offers", offers.length],
    ["", ""],
    ["Base Salary", ""],
    ["  Highest", `=MAX(Offers!D:D)`],
    ["  Lowest", `=MIN(Offers!D:D)`],
    ["  Average", `=AVERAGE(Offers!D:D)`],
    ["", ""],
    ["Total Compensation", ""],
    ["  Highest", `=MAX(Offers!G:G)`],
    ["  Lowest", `=MIN(Offers!G:G)`],
    ["  Average", `=AVERAGE(Offers!G:G)`],
  ];

  await updateSheet(spreadsheetId, "Analysis!A1", analysisData);

  return result;
}

/**
 * Create application tracking spreadsheet with templates
 */
export async function createApplicationTrackingSheet(): Promise<SpreadsheetResult | null> {
  const timestamp = new Date().toISOString().split("T")[0];
  const result = await createSpreadsheet(`Application Tracker - ${timestamp}`, [
    "Applications",
    "Follow-ups",
    "Contacts",
  ]);

  if (!result) return null;

  const { spreadsheetId } = result;

  // Applications sheet headers
  await updateSheet(spreadsheetId, "Applications!A1", [
    [
      "Date Applied",
      "Company",
      "Position",
      "Status",
      "Source",
      "Referral",
      "Notes",
      "Next Steps",
    ],
  ]);

  // Follow-ups sheet
  await updateSheet(spreadsheetId, "Follow-ups!A1", [
    ["Date", "Company", "Contact", "Type", "Notes", "Response"],
  ]);

  // Contacts sheet
  await updateSheet(spreadsheetId, "Contacts!A1", [
    ["Company", "Name", "Title", "Email", "LinkedIn", "Notes"],
  ]);

  return result;
}
