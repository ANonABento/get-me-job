import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function TailorLoading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <SkeletonCard className="h-96" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32 rounded-md" />
              <Skeleton className="h-10 w-28 rounded-md" />
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="h-6 w-44" />
            <SkeletonCard className="h-96" />
          </div>
        </div>
      </div>
    </div>
  );
}
