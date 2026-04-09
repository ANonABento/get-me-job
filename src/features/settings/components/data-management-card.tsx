import { Download, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXPORT_OPTIONS } from "@/features/settings/constants";
import { SettingsStatusBanner } from "@/features/settings/components/settings-status-banner";
import type {
  ExportType,
  ImportType,
  SettingsStatusResult,
} from "@/features/settings/types";

interface DataManagementCardProps {
  exporting: ExportType | null;
  importResult: SettingsStatusResult | null;
  importing: boolean;
  onExport: (type: ExportType) => void;
  onImport: (
    event: React.ChangeEvent<HTMLInputElement>,
    type: ImportType
  ) => void;
}

export function DataManagementCard({
  exporting,
  importResult,
  importing,
  onExport,
  onImport,
}: DataManagementCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <Download className="h-5 w-5" />
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
            {EXPORT_OPTIONS.map((option) => {
              const Icon = option.icon;

              return (
                <Button
                  key={option.type}
                  variant="outline"
                  onClick={() => onExport(option.type)}
                  disabled={Boolean(exporting)}
                  className="justify-start"
                >
                  {exporting === option.type ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Icon className={`h-4 w-4 mr-2 ${option.iconClassName}`} />
                  )}
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import Data
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <FileImportButton
              accept=".json,.csv"
              importing={importing}
              label="Import Jobs (JSON/CSV)"
              onImport={(event) => onImport(event, "jobs")}
              type="jobs"
            />
            <FileImportButton
              accept=".json"
              importing={importing}
              label="Restore Backup"
              onImport={(event) => onImport(event, "backup")}
              type="backup"
            />
          </div>
        </div>

        {importResult ? <SettingsStatusBanner result={importResult} /> : null}
      </div>
    </div>
  );
}

interface FileImportButtonProps {
  accept: string;
  importing: boolean;
  label: string;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type: ImportType;
}

function FileImportButton({
  accept,
  importing,
  label,
  onImport,
  type,
}: FileImportButtonProps) {
  const iconClassName = type === "backup" ? "text-violet-500" : "text-blue-500";

  return (
    <div className="relative">
      <input
        type="file"
        accept={accept}
        onChange={onImport}
        disabled={importing}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      <Button variant="outline" disabled={importing} className="w-full justify-start pointer-events-none">
        {importing ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Upload className={`h-4 w-4 mr-2 ${iconClassName}`} />
        )}
        {label}
      </Button>
    </div>
  );
}

