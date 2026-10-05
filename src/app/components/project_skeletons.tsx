/* -------------------------------------------------------------------------- */
/* Primitive                                                                  */
/* -------------------------------------------------------------------------- */

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded bg-gray-200/70 motion-safe:animate-pulse ${className}`}
    />
  );
}

function LoadingLabel() {
  return <span className="sr-only">A carregar projectos…</span>;
}

/* -------------------------------------------------------------------------- */
/* Grid                                                                       */
/* -------------------------------------------------------------------------- */

function ProjectCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white">
      <Skeleton className="aspect-video w-full rounded-none" />

      <div className="flex flex-col gap-2 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-2.5 w-16" />
        </div>

        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-1/2" />

        <div className="mt-1 flex flex-col gap-1.5">
          <Skeleton className="h-3 w-2/5" />
          <Skeleton className="h-3 w-1/3" />
        </div>

        <div className="mt-2 flex items-center justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-8" />
        </div>

        <Skeleton className="h-1.5 w-full rounded-full" />

        <div className="mt-1 flex items-center gap-6">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="ml-auto h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

/**
 * IMPORTANT: keep the grid classes identical to the ones used in
 * ProjectGridView so the layout doesn't jump when real data arrives.
 */
export function ProjectGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-busy="true"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      <LoadingLabel />

      {Array.from({ length: count }).map((_, index) => (
        <ProjectCardSkeleton key={index} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* List                                                                       */
/* -------------------------------------------------------------------------- */

function ProjectRowSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white">
      <div className="flex items-center gap-4 px-4 py-4 sm:px-5">
        <Skeleton className="h-16 w-24 shrink-0 rounded-xl" />

        <div className="min-w-0 flex-1">
          <Skeleton className="mb-2 h-2.5 w-32" />
          <Skeleton className="h-4 w-2/5" />

          <div className="mt-2 flex gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Skeleton className="h-1.5 flex-1 rounded-full" />
            <Skeleton className="h-3 w-9" />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-14 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectTableSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div role="status" aria-busy="true" className="space-y-2.5">
      <LoadingLabel />

      {Array.from({ length: count }).map((_, index) => (
        <ProjectRowSkeleton key={index} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Map                                                                        */
/* -------------------------------------------------------------------------- */

export function MapSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="relative h-[60vh] min-h-[360px] overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-100"
    >
      <LoadingLabel />

      <Skeleton className="absolute inset-0 rounded-none" />
    </div>
  );
}