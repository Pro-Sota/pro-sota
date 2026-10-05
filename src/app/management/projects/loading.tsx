"use client";

import { useSearchParams } from "next/navigation";

import {
  MapSkeleton,
  ProjectGridSkeleton,
  ProjectTableSkeleton,
  Skeleton,
} from "@/app/components/project_skeletons";

/**
 * Place at: app/management/projects/loading.tsx
 *
 * Shown while the server fetches projects. It reads ?view= so the skeleton
 * matches the layout the person is about to see.
 */
export default function ProjectsLoading() {
  const view = useSearchParams().get("view");

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-gray-900">
      <header className="bg-white">
        <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Projectos
          </h1>

          <Skeleton className="mt-3 h-3 w-64 max-w-full" />
        </div>
      </header>

      <div className="border-b border-gray-200/50 bg-white">
        <div className="flex flex-col gap-3.5 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <Skeleton className="h-10 w-full rounded-lg" />

          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
      </div>

      <main className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {view === "list" ? (
          <ProjectTableSkeleton />
        ) : view === "map" ? (
          <MapSkeleton />
        ) : (
          <ProjectGridSkeleton />
        )}
      </main>
    </div>
  );
}