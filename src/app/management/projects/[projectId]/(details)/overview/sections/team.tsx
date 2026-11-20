import { Users } from "lucide-react";

import EmptyState from "../components/empty_state";
import SectionCard from "../components/section_card";
import { LABELS } from "../constants";
import type { TeamMember } from "../types";

export default function TeamSection({ members }: { members: TeamMember[] }) {
  // Most overdue work first, then most open work.
  const sorted = [...members].sort(
    (a, b) =>
      b.overdueTasks - a.overdueTasks ||
      b.openTasks + b.openRfis - (a.openTasks + a.openRfis),
  );

  return (
    <SectionCard title={LABELS.team}>
      {sorted.length > 0 ? (
        <ul className="divide-y divide-gray-100">
          {sorted.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-800">
                  {member.name}
                </p>
                {member.role && (
                  <p className="mt-0.5 text-xs text-gray-500">{member.role}</p>
                )}
              </div>

              <dl className="flex shrink-0 gap-4 text-right text-xs text-gray-500">
                <div>
                  <dt className="sr-only">{LABELS.teamOpenRfis}</dt>
                  <dd>
                    <span className="font-semibold text-gray-900">
                      {member.openRfis}
                    </span>{" "}
                    {LABELS.kindRfi.slice(0, 3).toLowerCase()}.
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">{LABELS.teamOpenTasks}</dt>
                  <dd>
                    <span className="font-semibold text-gray-900">
                      {member.openTasks}
                    </span>{" "}
                    {LABELS.kindTask.toLowerCase()}s
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">{LABELS.teamOverdue}</dt>
                  <dd
                    className={member.overdueTasks > 0 ? "text-red-600" : undefined}
                  >
                    <span className="font-semibold">{member.overdueTasks}</span>{" "}
                    {LABELS.teamOverdue}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={Users} title={LABELS.emptyTeam} />
      )}
    </SectionCard>
  );
}