import { pluralize } from "@/lib/text/pluralize";

export function uploadSuccessMessage(entriesCreated: number, fileName: string): string {
  if (entriesCreated > 0) {
    return `Added ${pluralize(entriesCreated, "entry", "entries")} from ${fileName}`;
  }
  return `Uploaded ${fileName}`;
}
