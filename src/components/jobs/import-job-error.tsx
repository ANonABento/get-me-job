export function ImportJobError({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
      {message}
    </div>
  );
}
