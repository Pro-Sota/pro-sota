import { HardHat } from "lucide-react";

import EmptyState from "../components/empty_state";
import SectionCard from "../components/section_card";
import { LABELS } from "../constants";
import { formatMilestoneDate } from "../components/format";
import type { SiteReport } from "../types";

export default function SiteReportsSection({ items }: { items: SiteReport[] }) {
  return (
    <SectionCard title={LABELS.siteReports}>
      {items.length > 0 ? (
        <ul className="divide-y divide-gray-100">
          {items.map((report) => (
            <li key={report.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="text-sm font-medium text-gray-800">
                  {formatMilestoneDate(report.date)}
                </p>

                {typeof report.headcount === "number" && (
                  <span className="text-xs text-gray-500">
                    {report.headcount} {LABELS.workers}
                  </span>
                )}

                {report.weatherDelay && (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                    {LABELS.weatherDelay}
                  </span>
                )}
              </div>

              <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                {report.summary}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={HardHat} title={LABELS.emptySiteReports} />
      )}
    </SectionCard>
  );
}