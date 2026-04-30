export function ImportJobError({ message }: { message: string }) {
  return (
    <div className="rounded-[var(--radius)] bg-destructive/10 border-[length:var(--border-width)] border-destructive/20 p-3 text-sm text-destructive">
      {message}
    </div>
  );
}
