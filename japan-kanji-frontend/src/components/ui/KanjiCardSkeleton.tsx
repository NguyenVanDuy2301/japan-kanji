import { Skeleton } from "./Skeleton";

export function KanjiCardSkeleton() {
  return (
    <div className="bg-[var(--color-paper-1)] pt-6 flex flex-col items-center border border-[var(--color-ink-2)] overflow-hidden h-full min-h-[180px]">
      <Skeleton className="w-16 h-16 mb-4" />
      <Skeleton className="w-20 h-6 mb-2" />
      <Skeleton className="w-24 h-4 mb-4" />
      <div className="mt-auto w-full bg-[var(--color-paper-2)] border-t border-[var(--color-ink-2)] p-2.5">
        <Skeleton className="w-full h-4 mx-auto" />
      </div>
    </div>
  );
}
