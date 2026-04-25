"use client";

import type { ChangeEvent } from "react";
import { CheckCircle, Database, Download, FileJson, FileSpreadsheet, HardDrive, Loader2, Upload, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExportType, ImportPreview, ImportResult } from "@/app/(app)/settings/use-data-io";

interface DataManagementProps {
  exporting: ExportType | null;
  importing: boolean;
  importResult: ImportResult | null;
  showImportPreview: ImportPreview | null;
  onExport: (type: ExportType) => void;
  onImportFile: (event: ChangeEvent<HTMLInputElement>, type: "jobs" | "backup") => Promise<void>;
  onFullImportPreview: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onConfirmFullImport: () => Promise<void>;
  onCancelImportPreview: () => void;
}

export function DataManagement(props: DataManagementProps) {
  const {
    exporting,
    importing,
    importResult,
    showImportPreview,
    onExport,
    onImportFile,
    onFullImportPreview,
    onConfirmFullImport,
    onCancelImportPreview,
  } = props;

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <Database className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold">Data Management</h2>
          <p className="text-sm text-muted-foreground">Export your data or import from backups</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="outline" onClick={() => onExport("profile")} disabled={!!exporting} className="justify-start">
              {exporting === "profile" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileJson className="h-4 w-4 mr-2 text-blue-500" />
              )}
              Export Profile (JSON)
            </Button>
            <Button variant="outline" onClick={() => onExport("jobs-json")} disabled={!!exporting} className="justify-start">
              {exporting === "jobs-json" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileJson className="h-4 w-4 mr-2 text-green-500" />
              )}
              Export Jobs (JSON)
            </Button>
            <Button variant="outline" onClick={() => onExport("jobs-csv")} disabled={!!exporting} className="justify-start">
              {exporting === "jobs-csv" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-500" />
              )}
              Export Jobs (CSV)
            </Button>
            <Button variant="outline" onClick={() => onExport("backup")} disabled={!!exporting} className="justify-start">
              {exporting === "backup" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <HardDrive className="h-4 w-4 mr-2 text-violet-500" />
              )}
              Full Backup
            </Button>
            <Button
              variant="outline"
              onClick={() => onExport("full-export")}
              disabled={!!exporting}
              className="justify-start sm:col-span-2"
            >
              {exporting === "full-export" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-2 text-primary" />
              )}
              Export All Data (JSON)
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import Data
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="relative">
              <input
                type="file"
                accept=".json,.csv"
                onChange={(event) => void onImportFile(event, "jobs")}
                disabled={importing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <Button variant="outline" disabled={importing} className="w-full justify-start pointer-events-none">
                {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileJson className="h-4 w-4 mr-2 text-blue-500" />}
                Import Jobs (JSON/CSV)
              </Button>
            </div>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={(event) => void onImportFile(event, "backup")}
                disabled={importing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <Button variant="outline" disabled={importing} className="w-full justify-start pointer-events-none">
                {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <HardDrive className="h-4 w-4 mr-2 text-violet-500" />}
                Restore Backup
              </Button>
            </div>
            <div className="relative sm:col-span-2">
              <input
                type="file"
                accept=".json"
                onChange={(event) => void onFullImportPreview(event)}
                disabled={importing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <Button variant="outline" disabled={importing} className="w-full justify-start pointer-events-none">
                {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2 text-primary" />}
                Import All Data (JSON)
              </Button>
            </div>
          </div>
        </div>

        {showImportPreview && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
            <h4 className="font-medium text-sm">Confirm Import</h4>
            <p className="text-sm text-muted-foreground">
              The following data will be imported (duplicates will be skipped):
            </p>
            <ul className="text-sm space-y-1">
              {Object.entries(showImportPreview.stats).map(([key, count]) => (
                <li key={key} className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-success" />
                  <span>
                    {key}: {count}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                onClick={() => void onConfirmFullImport()}
                disabled={importing}
                className="gradient-bg text-white hover:opacity-90"
              >
                {importing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Importing...
                  </>
                ) : (
                  "Confirm Import"
                )}
              </Button>
              <Button size="sm" variant="outline" onClick={onCancelImportPreview} disabled={importing}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {importResult && (
          <div
            className={`flex items-center gap-3 p-4 rounded-xl ${
              importResult.success
                ? "bg-success/10 text-success border border-success/20"
                : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}
          >
            {importResult.success ? <CheckCircle className="h-5 w-5 shrink-0" /> : <XCircle className="h-5 w-5 shrink-0" />}
            <span className="font-medium">{importResult.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
