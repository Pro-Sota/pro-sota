import { ShieldCheck } from "lucide-react";

import EmptyState from "../components/empty_state";
import ListRow from "../components/list_row";
import SectionCard from "../components/section_card";
import { LABELS } from "../constants";
import { formatMilestoneDate } from "../components/format";
import type { SafetySummary } from "../types";

function Stat({
  label,
  value,
  tone = "text-gray-900",
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="rounded-md bg-gray-50 px-4 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-0.5 text-2xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

export default function SafetySection({ summary }: { summary: SafetySummary }) {
  return (
    <SectionCard title={LABELS.safety}>
      <div className="grid grid-cols-2 gap-3">
        <Stat label={LABELS.daysSinceIncident} value={summary.daysSinceIncident} />
        <Stat
          label={LABELS.openActions}
          value={summary.openActions}
          tone={summary.openActions > 0 ? "text-amber-700" : "text-gray-900"}
        />
      </div>

      {summary.incidents.length > 0 ? (
        <ul className="mt-5 divide-y divide-gray-100">
          {summary.incidents.map((incident) => (
            <ListRow
              key={incident.id}
              title={incident.title}
              meta={formatMilestoneDate(incident.date)}
              status={incident.status}
            />
          ))}
        </ul>
      ) : (
        <EmptyState icon={ShieldCheck} title={LABELS.emptySafety} message=" " />
      )}
    </SectionCard>
  );
}