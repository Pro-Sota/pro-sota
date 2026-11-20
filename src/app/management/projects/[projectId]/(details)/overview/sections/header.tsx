import Link from "next/link";
import { Pencil } from "lucide-react";

import type { OverviewData } from "@/services/project_overview";

import { FOCUS_RING, LABELS, NOT_DEFINED, ROUTES } from "../constants";
import { formatMilestoneDate } from "../components/format";

export default function ProjectHeader({
  project,
  projectBase,
  isAdmin,
}: {
  project: OverviewData["project"];
  projectBase: string;
  isAdmin: boolean;
}) {
  const location = [project.municipality, project.country || LABELS.defaultCountry]
    .filter(Boolean)
    .join(", ");

  const metadata: [string, string][] = [
    [LABELS.location, location || NOT_DEFINED],
    [LABELS.type, project.type || NOT_DEFINED],
    [LABELS.start, formatMilestoneDate(project.startDate)],
    [LABELS.end, formatMilestoneDate(project.endDate)],
  ];

  return (
    <header className="border-b border-gray-200 pb-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            {project.code || LABELS.defaultCode}
          </p>
          <h1 className="mt-1 break-words text-xl tracking-wider text-gray-900 sm:text-2xl">
            {project.name || LABELS.unnamedProject}
          </h1>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span className="inline-flex w-fit items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700">
            {project.status || LABELS.statusUndefined}
          </span>

          {isAdmin && (
            <Link
              href={`${projectBase}/${ROUTES.edit}`}
              className={`inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 ${FOCUS_RING}`}
            >
              <Pencil size={15} aria-hidden="true" />
              {LABELS.editProject}
            </Link>
          )}
        </div>
      </div>

      <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-sm">
        {metadata.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs text-gray-500">{label}</dt>
            <dd className="mt-0.5 break-words font-medium text-gray-800">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </header>
  );
}