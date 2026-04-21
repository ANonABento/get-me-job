import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarLoading() {
  return (
    <div className="min-h-screen pb-24">
      <div className="hero-gradient border-b">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Skeleton className="h-5 w-40 mb-6" />
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <Skeleton className="h-7 w-32 rounded-full" />
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-5 w-full max-w-xl" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-36 rounded-md" />
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>

          <div className="grid grid-cols-7 gap-2 pt-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={`day-${i}`} className="h-6 w-full" />
            ))}
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={`cell-${i}`} className="h-20 w-full rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
