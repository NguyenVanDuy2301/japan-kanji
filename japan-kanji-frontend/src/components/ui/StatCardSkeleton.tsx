import { Skeleton } from "./Skeleton";

export function StatCardSkeleton() {
  return (
    <div className="bg-[var(--color-paper-1)] p-6 rounded-xl border border-[var(--color-border-subtle)] shadow-[var(--shadow-card)] flex items-center justify-between">
      <div className="flex-1">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton className="h-12 w-12 rounded-xl" />
    </div>
  );
}
