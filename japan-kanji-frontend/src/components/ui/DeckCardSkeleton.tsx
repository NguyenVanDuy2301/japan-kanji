import { Skeleton } from "./Skeleton";

export function DeckCardSkeleton() {
  return (
    <div className="bg-[var(--color-paper-1)] p-5 rounded-xl border border-[var(--color-border-subtle)] shadow-[var(--shadow-card)] flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-5 w-2/3 mb-2" />
          <Skeleton className="h-3.5 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-9 w-20 rounded-lg shrink-0" />
    </div>
  );
}
