import { Inbox } from "lucide-react";

import type { OverviewData } from "@/services/project_overview";

import EmptyState from "../components/empty_state";
import SectionCard from "../components/section_card";
import { LABELS } from "../constants";
import { formatDateTime } from "../components/format";

export default function ActivitiesSection({ data }: { data: OverviewData }) {
  return (
    <SectionCard title={LABELS.recentActivities}>
      {data.activities.length > 0 ? (
        <ul className="divide-y divide-gray-100">
          {data.activities.map((activity) => (
            <li
              key={activity.activity_id}
              className="py-3 first:pt-0 last:pb-0"
            >
              <p className="text-sm text-gray-700">
                {activity.description || activity.entity_type}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {activity.user_name || LABELS.unknownUser} ·{" "}
                {formatDateTime(activity.created_at)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={Inbox} title={LABELS.emptyActivities} />
      )}
    </SectionCard>
  );
}