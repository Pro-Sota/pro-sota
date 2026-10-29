import type { ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/* Primitives                                                                 */
/* -------------------------------------------------------------------------- */

function Bar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-neutral-200/70 motion-reduce:animate-none ${className}`}
    />
  );
}

function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-neutral-200/80 bg-white p-4 sm:p-5 ${className}`}
    >
      {children}
    </div>
  );
}

function Shell({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="min-w-0 space-y-4 sm:space-y-5"
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/** Title + subtitle on the left, action button on the right. */
function SectionHeader({ withAction = true }: { withAction?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-2">
        <Bar className="h-6 w-40 sm:w-52" />
        <Bar className="h-3.5 w-56 max-w-full sm:w-72" />
      </div>
      {withAction && <Bar className="h-10 w-28 shrink-0 rounded-xl" />}
    </div>
  );
}

function StatCards({ count = 3 }: { count?: number }) {
  return (
    <div
      className={`grid grid-cols-1 gap-3 sm:gap-4 ${
        count === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"
      }`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="space-y-3">
          <Bar className="h-3.5 w-24" />
          <Bar className="h-8 w-20" />
          <Bar className="h-3 w-32" />
        </Card>
      ))}
    </div>
  );
}

function FilterBar() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Bar className="h-10 w-full rounded-xl sm:w-64" />
      <Bar className="h-10 w-24 rounded-xl" />
      <Bar className="h-10 w-24 rounded-xl" />
    </div>
  );
}

function ListRows({
  rows = 6,
  avatar = false,
}: {
  rows?: number;
  avatar?: boolean;
}) {
  return (
    <Card className="divide-y divide-neutral-100 p-0 sm:p-0">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
          {avatar ? (
            <Bar className="h-10 w-10 shrink-0 rounded-full" />
          ) : (
            <Bar className="h-5 w-5 shrink-0 rounded-md" />
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <Bar className="h-3.5 w-2/3 max-w-xs" />
            <Bar className="h-3 w-1/3 max-w-[10rem]" />
          </div>
          <Bar className="hidden h-6 w-20 rounded-full sm:block" />
          <Bar className="h-6 w-6 shrink-0 rounded-md" />
        </div>
      ))}
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Module skeletons                                                           */
/* -------------------------------------------------------------------------- */

export function OverviewSkeleton() {
  return (
    <Shell label="A carregar visão geral">
      <StatCards count={4} />

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="space-y-4">
          <Bar className="h-5 w-36" />
          <Bar className="h-3 w-full rounded-full" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Bar className="h-4 w-4 shrink-0 rounded-full" />
                <Bar className="h-3.5 w-full max-w-md" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <Bar className="h-5 w-28" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <Bar className="h-3.5 w-24" />
              <Bar className="h-3.5 w-16" />
            </div>
          ))}
        </Card>
      </div>
    </Shell>
  );
}

export function PhasesSkeleton() {
  return (
    <Shell label="A carregar fases">
      <SectionHeader />

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Bar className="h-8 w-8 shrink-0 rounded-full" />
                <Bar className="h-4 w-40 sm:w-56" />
              </div>
              <Bar className="h-6 w-20 shrink-0 rounded-full" />
            </div>
            <Bar className="h-2 w-full rounded-full" />
            <div className="flex gap-4">
              <Bar className="h-3 w-24" />
              <Bar className="h-3 w-24" />
            </div>
          </Card>
        ))}
      </div>
    </Shell>
  );
}

export function TasksSkeleton() {
  return (
    <Shell label="A carregar tarefas">
      <SectionHeader />
      <FilterBar />
      <ListRows rows={7} />
    </Shell>
  );
}

export function DocumentsSkeleton() {
  return (
    <Shell label="A carregar documentos">
      <SectionHeader />
      <FilterBar />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="space-y-4">
            <div className="flex items-center gap-3">
              <Bar className="h-11 w-11 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Bar className="h-3.5 w-3/4" />
                <Bar className="h-3 w-1/2" />
              </div>
            </div>
            <Bar className="h-3 w-full" />
          </Card>
        ))}
      </div>
    </Shell>
  );
}

export function ApprovalsSkeleton() {
  return (
    <Shell label="A carregar aprovações">
      <SectionHeader withAction={false} />
      <StatCards count={3} />
      <ListRows rows={5} />
    </Shell>
  );
}

export function TeamSkeleton() {
  return (
    <Shell label="A carregar equipa">
      <SectionHeader />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="flex items-center gap-4">
            <Bar className="h-12 w-12 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Bar className="h-4 w-32" />
              <Bar className="h-3 w-24" />
              <Bar className="h-3 w-40 max-w-full" />
            </div>
          </Card>
        ))}
      </div>
    </Shell>
  );
}