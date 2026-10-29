// app/.../projects/[id]/loading.tsx
// One file that covers every tab (overview, phases, tasks, documents,
// approvals, team) because Next.js applies a parent loading.tsx to all
// child routes that don't define their own.

function Bar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-neutral-200/70 motion-reduce:animate-none ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="mx-auto min-w-0 max-w-[1600px] space-y-5 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8"
    >
      <span className="sr-only">A carregar</span>

      {/* Page title + action */}
      <div className="mb-1 flex items-center justify-between gap-4 sm:mb-2">
        <div className="space-y-2">
          <Bar className="h-6 w-40 sm:w-52" />
          <Bar className="h-3.5 w-56 max-w-full sm:w-72" />
        </div>
        <Bar className="h-10 w-28 shrink-0 rounded-xl" />
      </div>

      {/* Summary cards (hidden on phones to keep the skeleton short) */}
      <div className="hidden gap-4 sm:grid sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="space-y-3 rounded-2xl border border-neutral-200/80 bg-white p-5 sm:p-6"
          >
            <Bar className="h-3.5 w-24" />
            <Bar className="h-7 w-16" />
          </div>
        ))}
      </div>

      {/* Search / filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Bar className="h-10 w-full rounded-xl sm:w-64" />
        <Bar className="h-10 w-24 rounded-xl" />
      </div>

      {/* Generic content: rows work for tasks, approvals, documents, team */}
      <div className="mt-1 divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white sm:mt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
            <Bar className="h-9 w-9 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Bar className="h-3.5 w-2/3 max-w-xs" />
              <Bar className="h-3 w-1/3 max-w-[10rem]" />
            </div>
            <Bar className="hidden h-6 w-20 rounded-full sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}