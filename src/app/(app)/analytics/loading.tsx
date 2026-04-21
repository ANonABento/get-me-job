import { Skeleton, SkeletonStatCard, SkeletonCard } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen pb-24">
      <div className="hero-gradient border-b">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Skeleton className="h-5 w-40 mb-6" />
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-4">
              <Skeleton className="h-7 w-32 rounded-full" />
              <Skeleton className="h-10 w-80" />
              <Skeleton className="h-5 w-full max-w-xl" />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
              <Skeleton className="h-9 w-36 rounded-md" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-20 rounded-md" />
                <Skeleton className="h-9 w-20 rounded-md" />
                <Skeleton className="h-9 w-24 rounded-md" />
                <Skeleton className="h-9 w-20 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <SkeletonCard className="h-80" />
            <SkeletonCard className="h-80" />
          </div>
          <SkeletonCard className="h-96" />
        </div>
      </div>
    </div>
  );
}
