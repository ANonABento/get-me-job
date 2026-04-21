import { Skeleton, SkeletonJobCard } from "@/components/ui/skeleton";

export default function JobsLoading() {
  return (
    <div className="min-h-screen pb-24">
      <div className="hero-gradient border-b">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Skeleton className="h-5 w-40 mb-6" />
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <Skeleton className="h-7 w-32 rounded-full" />
              <Skeleton className="h-10 w-72" />
              <Skeleton className="h-5 w-full max-w-xl" />
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-2xl border bg-card p-5 text-center space-y-2">
                <Skeleton className="h-8 w-10 mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-11 w-24 rounded-md" />
                <Skeleton className="h-11 w-24 rounded-md" />
                <Skeleton className="h-11 w-28 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 border-b">
        <div className="flex flex-col lg:flex-row gap-4">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonJobCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
