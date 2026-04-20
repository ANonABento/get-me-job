export function uploadSuccessMessage(entriesCreated: number, fileName: string): string {
  if (entriesCreated > 0) {
    const noun = entriesCreated === 1 ? "entry" : "entries";
    return `Added ${entriesCreated} ${noun} from ${fileName}`;
  }
  return `Uploaded ${fileName}`;
}
