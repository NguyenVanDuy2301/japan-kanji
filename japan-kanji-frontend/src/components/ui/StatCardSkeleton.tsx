import { Skeleton } from "./Skeleton";

export function StatCardSkeleton() {
  return (
    <div className="bg-white p-6 border border-neutral-200 shadow-sm flex items-center justify-between">
      <div className="flex-1">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton className="h-12 w-12 rounded-full" />
    </div>
  );
}
