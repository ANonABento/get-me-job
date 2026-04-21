import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function EmailsLoading() {
  return (
    <div className="min-h-screen pb-24">
      <div className="hero-gradient border-b">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Skeleton className="h-5 w-40 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-5 w-full max-w-xl" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card p-4 space-y-3"
            >
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SkeletonCard className="h-96" />
          <SkeletonCard className="h-96" />
        </div>
      </div>
    </div>
  );
}
