import { Skeleton } from "@/components/Skeleton";

export default function ProjectDetailLoading() {
  return (
    <main className="min-h-screen px-3 py-4 md:px-6">
      <div className="mx-auto max-w-4xl">
        <Skeleton className="mb-6 h-8 w-32" />
        <Skeleton className="mb-4 h-12 w-2/3" />
        <Skeleton className="mb-8 h-64 w-full rounded-2xl" />
        <Skeleton className="mb-4 h-6 w-1/3" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-2 h-4 w-3/4" />
      </div>
    </main>
  );
}
