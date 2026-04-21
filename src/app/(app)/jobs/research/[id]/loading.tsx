import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function CompanyResearchLoading() {
  return (
    <div className="min-h-screen">
      <div className="hero-gradient border-b">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Skeleton className="h-5 w-28 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-7 w-40 rounded-full" />
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-5 w-56" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <SkeletonCard className="h-64" />
        <SkeletonCard className="h-80" />
        <SkeletonCard className="h-64" />
      </div>
    </div>
  );
}
