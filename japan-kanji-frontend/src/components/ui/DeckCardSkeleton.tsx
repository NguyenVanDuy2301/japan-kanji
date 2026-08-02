import { Skeleton } from "./Skeleton";

export function DeckCardSkeleton() {
  return (
    <div className="bg-white p-6 border border-neutral-200 shadow-sm flex flex-col justify-between h-48">
      <div>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <Skeleton className="h-10 w-full rounded" />
      </div>
      <div className="flex justify-between items-center mt-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-8 w-20 rounded" />
      </div>
    </div>
  );
}
