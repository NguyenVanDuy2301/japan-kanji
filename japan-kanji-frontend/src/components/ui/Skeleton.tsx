export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[var(--color-paper-3)] ${className}`}
      {...props}
    />
  );
}
