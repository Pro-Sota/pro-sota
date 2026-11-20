import { ClipboardList } from "lucide-react";

import EmptyState from "../components/empty_state";
import ListRow from "../components/list_row";
import SectionCard from "../components/section_card";
import { LABELS } from "../constants";
import { isClosedStatus } from "../components/deadlines";
import { formatMilestoneDate } from "../components/format";
import type { IssueItem } from "../types";

export default function IssuesSection({ items }: { items: IssueItem[] }) {
  const open = items.filter((item) => !isClosedStatus(item.status)).length;

  return (
    <SectionCard
      title={LABELS.issues}
      subtitle={items.length > 0 ? `${open} ${LABELS.openIssues}` : undefined}
    >
      {items.length > 0 ? (
        <ul className="divide-y divide-gray-100">
          {items.map((item) => (
            <ListRow
              key={item.id}
              title={item.title}
              meta={[
                item.location,
                item.due && `${LABELS.due}: ${formatMilestoneDate(item.due)}`,
              ]
                .filter(Boolean)
                .join(" · ") || "—"}
              status={item.status}
            />
          ))}
        </ul>
      ) : (
        <EmptyState icon={ClipboardList} title={LABELS.emptyIssues} />
      )}
    </SectionCard>
  );
}