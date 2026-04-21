import { Skeleton, SkeletonStatCard, SkeletonInsights } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen">
      <div className="hero-gradient border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4">
              <Skeleton className="h-7 w-52 rounded-full" />
              <Skeleton className="h-12 w-80" />
              <Skeleton className="h-12 w-72" />
              <Skeleton className="h-5 w-full max-w-xl" />
              <Skeleton className="h-5 w-3/4 max-w-md" />
              <Skeleton className="h-11 w-44 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4 lg:w-80">
              <SkeletonStatCard className="col-span-2" />
              <SkeletonStatCard />
              <SkeletonStatCard />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <SkeletonInsights />
          <SkeletonInsights />
        </div>
        <SkeletonInsights />
      </div>
    </div>
  );
}
