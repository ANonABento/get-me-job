"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface ExportToSheetsButtonProps {
  title: string;
  data: {
    headers: string[];
    rows: string[][];
  };
  onSuccess?: (result: { spreadsheetId: string; spreadsheetUrl: string }) => void;
  size?: "default" | "sm" | "lg" | "icon";
}

export function ExportToSheetsButton({
  title,
  data,
  onSuccess,
  size = "default",
}: ExportToSheetsButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    try {
      const res = await fetch("/api/google/auth");
      const data = await res.json();
      setConnected(data.connected);
    } catch {
      setConnected(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    setError(null);

    try {
      const res = await fetch("/api/google/sheets/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, headers: data.headers, rows: data.rows }),
      });

      const result = await res.json();

      if (result.success) {
        setExported(true);
        onSuccess?.({
          spreadsheetId: result.spreadsheetId,
          spreadsheetUrl: result.spreadsheetUrl,
        });
        // Open the sheet in a new tab
        if (result.spreadsheetUrl) {
          window.open(result.spreadsheetUrl, "_blank");
        }
      } else {
        setError(result.error || "Failed to create spreadsheet");
      }
    } catch (err) {
      console.error("Export failed:", err);
      setError("Failed to export to Google Sheets");
    } finally {
      setExporting(false);
    }
  }

  if (connected === false) {
    return null;
  }

  if (connected === null) {
    return (
      <Button variant="outline" size={size} disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Sheets
      </Button>
    );
  }

  if (exported) {
    return (
      <Button variant="outline" size={size} className="text-green-600" disabled>
        <CheckCircle className="h-4 w-4 mr-2" />
        Exported
      </Button>
    );
  }

  if (error) {
    return (
      <Button variant="outline" size={size} onClick={handleExport} disabled={exporting}>
        <AlertCircle className="h-4 w-4 mr-2" />
        Retry
      </Button>
    );
  }

  return (
    <Button variant="outline" size={size} onClick={handleExport} disabled={exporting}>
      {exporting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Table className="h-4 w-4 mr-2" />
      )}
      {exporting ? "Exporting..." : "Sheets"}
    </Button>
  );
}
