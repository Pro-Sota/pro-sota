import { Package } from "lucide-react";

import EmptyState from "../components/empty_state";
import ListRow from "../components/list_row";
import SectionCard from "../components/section_card";
import { LABELS } from "../constants";
import { dayNumber, toDateKey } from "../components/deadlines";
import { formatMilestoneDate } from "../components/format";
import type { ProcurementItem } from "../types";

function atRisk(item: ProcurementItem): boolean {
  const expected = toDateKey(item.expectedDelivery);
  const required = toDateKey(item.requiredBy);
  return !!expected && !!required && dayNumber(expected) > dayNumber(required);
}

export default function ProcurementSection({
  items,
}: {
  items: ProcurementItem[];
}) {
  // Items at risk of arriving late first.
  const sorted = [...items].sort(
    (a, b) => Number(atRisk(b)) - Number(atRisk(a)),
  );

  return (
    <SectionCard title={LABELS.procurement}>
      {sorted.length > 0 ? (
        <ul className="divide-y divide-gray-100">
          {sorted.map((item) => {
            const meta = [
              item.longLead && LABELS.longLead,
              `${LABELS.expectedDelivery}: ${formatMilestoneDate(item.expectedDelivery)}`,
              atRisk(item) && LABELS.deliveryRisk,
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <ListRow
                key={item.id}
                title={item.name}
                meta={meta}
                status={item.status}
              />
            );
          })}
        </ul>
      ) : (
        <EmptyState icon={Package} title={LABELS.emptyProcurement} />
      )}
    </SectionCard>
  );
}