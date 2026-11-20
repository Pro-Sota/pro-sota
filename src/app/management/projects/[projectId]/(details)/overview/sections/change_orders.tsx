import { FileDiff } from "lucide-react";

import EmptyState from "../components/empty_state";
import ListRow from "../components/list_row";
import SectionCard from "../components/section_card";
import { LABELS } from "../constants";
import { formatCurrency, formatMilestoneDate, plural } from "../components/format";
import type { ChangeOrder } from "../types";

export default function ChangeOrdersSection({ items }: { items: ChangeOrder[] }) {
  const total = items.reduce(
    (sum, item) => sum + (Number.isFinite(item.value) ? item.value : 0),
    0,
  );

  return (
    <SectionCard
      title={LABELS.changeOrders}
      subtitle={
        items.length > 0
          ? `${plural(items.length, "ordem", "ordens")} · ${formatCurrency(total)}`
          : undefined
      }
    >
      {items.length > 0 ? (
        <ul className="divide-y divide-gray-100">
          {items.map((item) => (
            <ListRow
              key={item.id}
              title={item.title}
              meta={[formatCurrency(item.value), item.date && formatMilestoneDate(item.date)]
                .filter(Boolean)
                .join(" · ")}
              status={item.status}
            />
          ))}
        </ul>
      ) : (
        <EmptyState icon={FileDiff} title={LABELS.emptyChangeOrders} />
      )}
    </SectionCard>
  );
}