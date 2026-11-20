import { CalendarClock, CircleCheck } from "lucide-react";

import EmptyState from "../components/empty_state";
import SectionCard from "../components/section_card";
import { LABELS } from "../constants";
import {
  KIND_LABEL,
  relativeDays,
  type DeadlineItem,
} from "../components/deadlines";
import { formatMilestoneDate, plural } from "../components/format";

function DeadlineRow({ item }: { item: DeadlineItem }) {
  const badge =
    item.days < 0
      ? "bg-red-50 text-red-700"
      : item.days <= 3
        ? "bg-amber-50 text-amber-700"
        : "bg-gray-100 text-gray-700";

  return (
    <li className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="truncate text-sm text-gray-800">{item.title}</p>
        <p className="mt-1 text-xs text-gray-500">
          {KIND_LABEL[item.kind]} · {formatMilestoneDate(item.dateKey)}
        </p>
      </div>

      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${badge}`}
      >
        {relativeDays(item.days)}
      </span>
    </li>
  );
}

export function UpcomingSection({ items }: { items: DeadlineItem[] }) {
  return (
    <SectionCard
      title={LABELS.upcomingDeadlines}
      subtitle={plural(items.length, "prazo", "prazos")}
    >
      {items.length > 0 ? (
        <ul className="divide-y divide-gray-100">
          {items.map((item) => (
            <DeadlineRow key={item.id} item={item} />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={CalendarClock}
          title={LABELS.emptyUpcoming}
          message={LABELS.emptyUpcomingMessage}
        />
      )}
    </SectionCard>
  );
}

export function OverdueSection({ items }: { items: DeadlineItem[] }) {
  return (
    <SectionCard
      title={LABELS.overdueItems}
      subtitle={plural(items.length, "item", "itens")}
    >
      {items.length > 0 ? (
        <ul className="divide-y divide-gray-100">
          {items.map((item) => (
            <DeadlineRow key={item.id} item={item} />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={CircleCheck}
          title={LABELS.emptyOverdue}
          message={LABELS.emptyOverdueMessage}
        />
      )}
    </SectionCard>
  );
}