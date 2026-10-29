import { Skeleton } from "./Skeleton";

export function KanjiCardSkeleton() {
  return (
    <div className="bg-[var(--color-paper-1)] rounded-xl pt-6 flex flex-col items-center border border-[var(--color-border-subtle)] shadow-[var(--shadow-card)] overflow-hidden h-full min-h-[190px]">
      <Skeleton className="w-16 h-16 mb-4 rounded-xl" />
      <Skeleton className="w-20 h-5 mb-2" />
      <Skeleton className="w-24 h-4 mb-4" />
      <div className="mt-auto w-full bg-[var(--color-paper-2)] border-t border-[var(--color-border-subtle)] p-2.5">
        <Skeleton className="w-2/3 h-4 mx-auto" />
      </div>
    </div>
  );
}
