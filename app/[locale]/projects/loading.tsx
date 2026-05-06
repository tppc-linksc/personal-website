import { Skeleton } from "@/components/Skeleton";

export default function ProjectsLoading() {
  return (
    <main className="min-h-screen px-3 py-4 md:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header skeleton */}
        <div className="flex items-center justify-between py-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-6 w-24" />
          <div className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>

        {/* Filter skeleton */}
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>

        {/* Grid skeleton */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-panel overflow-hidden rounded-[24px] p-4">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="mt-4 h-5 w-3/4" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-2/3" />
              <div className="mt-4 flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
