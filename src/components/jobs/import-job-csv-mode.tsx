"use client";

import type React from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ImportJobActions } from "./import-job-actions";

interface ImportJobCsvModeProps {
  csvContent: string;
  csvFileName: string;
  parsing: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onParse: () => void;
}

export function ImportJobCsvMode({
  csvContent,
  csvFileName,
  parsing,
  onFileChange,
  onCancel,
  onParse,
}: ImportJobCsvModeProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Upload CSV File</Label>
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={onFileChange}
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            {csvFileName ? (
              <span className="text-sm font-medium">{csvFileName}</span>
            ) : (
              <>
                <span className="text-sm font-medium">Click to upload CSV</span>
                <span className="text-xs text-muted-foreground">
                  or drag and drop
                </span>
              </>
            )}
          </label>
        </div>
      </div>

      <div className="rounded-lg bg-muted/50 p-3 text-sm">
        <p className="font-medium mb-2">Expected columns:</p>
        <ul className="text-muted-foreground text-xs space-y-1">
          <li><span className="font-medium text-foreground">title</span> (required) - Job title or position</li>
          <li><span className="font-medium text-foreground">company</span> (required) - Company name</li>
          <li><span className="text-muted-foreground">location, type, remote, salary, description, url</span> - optional</li>
        </ul>
      </div>

      <ImportJobActions
        disabled={parsing || !csvContent.trim()}
        loading={parsing}
        icon={FileSpreadsheet}
        submitLabel="Parse CSV"
        onCancel={onCancel}
        onSubmit={onParse}
      />
    </div>
  );
}
