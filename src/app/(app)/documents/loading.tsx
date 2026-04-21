import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Skeleton className="h-6 w-48" />
    </div>
  );
}
