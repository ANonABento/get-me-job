import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function ExtensionLoading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-full max-w-md" />
        </div>
        <SkeletonCard className="h-64" />
      </div>
    </div>
  );
}
