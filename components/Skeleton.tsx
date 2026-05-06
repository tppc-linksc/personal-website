"use client";

export function Skeleton({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded bg-[var(--line-muted)] ${className}`}
      {...props}
    />
  );
}

export function HeroSkeleton() {
  return (
    <section className="glass-panel hero-fusion-panel relative mt-4 min-h-[520px] overflow-hidden rounded-[30px] px-5 py-6 md:min-h-[520px] md:px-8 md:py-8 xl:min-h-[560px]">
      <div className="hero-scene-layer" aria-hidden="true">
        <Skeleton className="absolute inset-0 h-full w-full" />
      </div>
      <div className="relative z-10 max-w-[48rem] pt-2 md:max-w-[52%] md:pt-8 xl:max-w-[46%]">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-3 h-14 w-3/4 md:h-20" />
        <Skeleton className="mt-5 h-20 w-full max-w-xl" />
        <div className="mt-7 flex gap-3">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </div>
    </section>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="glass-panel overflow-hidden rounded-[24px] p-4">
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
  );
}

export function ProjectsSectionSkeleton() {
  return (
    <section className="glass-panel mt-4 rounded-[30px] px-4 py-4 md:px-5 md:py-5">
      <div className="mb-4 flex items-center justify-between px-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
      </div>
    </section>
  );
}

export function RoadmapSkeleton() {
  return (
    <article className="glass-panel rounded-[24px] px-4 py-3 md:px-5">
      <Skeleton className="h-4 w-20" />
      <div className="mt-2 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 flex-1" />
          </div>
        ))}
      </div>
    </article>
  );
}

export function AboutSkeleton() {
  return (
    <article className="glass-panel rounded-[24px] px-4 py-3 md:px-5">
      <div className="grid min-h-[210px] grid-cols-[minmax(0,1fr)_minmax(132px,34%)] items-center gap-4">
        <div>
          <Skeleton className="h-4 w-16" />
          <Skeleton className="mt-2 h-6 w-3/4" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-2/3" />
          <div className="mt-2 flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-[190px] rounded-2xl" />
      </div>
    </article>
  );
}

export function FooterSkeleton() {
  return (
    <footer className="glass-panel mt-4 flex items-center justify-between rounded-[24px] px-5 py-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-20" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
      </div>
    </footer>
  );
}

export function HomePageSkeleton() {
  return (
    <main className="min-h-screen px-3 py-4 md:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header skeleton */}
        <div className="flex items-center justify-between py-4">
          <Skeleton className="h-8 w-40" />
          <div className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>

        <HeroSkeleton />
        <ProjectsSectionSkeleton />

        <div className="home-split-inline mt-4 grid grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-4">
          <RoadmapSkeleton />
          <AboutSkeleton />
        </div>

        <FooterSkeleton />
      </div>
    </main>
  );
}
