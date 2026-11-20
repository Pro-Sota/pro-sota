import { TrendingUp } from "lucide-react";

import type { OverviewData } from "@/services/project_overview";

import EmptyState from "../components/empty_state";
import SectionCard from "../components/section_card";
import {
  BRAND_BG,
  LABELS,
  PLAN_SEVERE,
  PLAN_TOLERANCE,
} from "../constants";
import { dayNumber, toDateKey, todayDayNumber } from "../components/deadlines";
import { clampPercent, formatPercentage } from "../components/format";

function computePlan(tasks: OverviewData["tasks"]) {
  const today = todayDayNumber();
  let count = 0;
  let planned = 0;
  let actual = 0;

  for (const task of tasks) {
    const startKey = toDateKey(task.startDate);
    const endKey = toDateKey(task.endDate);
    if (!startKey || !endKey) continue;

    const start = dayNumber(startKey);
    const end = dayNumber(endKey);
    if (end < start) continue;

    const total = end - start + 1;
    const elapsed = today - start + 1;

    planned += clampPercent((elapsed / total) * 100);
    actual += clampPercent(task.progress);
    count += 1;
  }

  if (count === 0) return null;
  return { planned: planned / count, actual: actual / count, count };
}

function verdict(delta: number) {
  if (delta > PLAN_TOLERANCE) {
    return { label: LABELS.ahead, text: "text-green-700", bar: "bg-green-500" };
  }
  if (delta >= -PLAN_TOLERANCE) {
    return { label: LABELS.onTrack, text: "text-green-700", bar: BRAND_BG };
  }
  if (delta >= -PLAN_SEVERE) {
    return { label: LABELS.slightlyBehind, text: "text-amber-700", bar: "bg-amber-500" };
  }
  return { label: LABELS.behind, text: "font-medium text-red-600", bar: "bg-red-500" };
}

function Bar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-gray-800">{label}</span>
        <span className="font-semibold text-gray-900">
          {formatPercentage(value)}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 overflow-hidden rounded-full bg-gray-100"
      >
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function PlanVsActualSection({ data }: { data: OverviewData }) {
  const plan = computePlan(data.tasks);

  return (
    <SectionCard title={LABELS.planVsActual} subtitle={LABELS.planBasis}>
      {plan ? (
        (() => {
          const delta = plan.actual - plan.planned;
          const v = verdict(delta);
          const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";

          return (
            <div className="space-y-6">
              <div>
                <p className={`text-2xl font-semibold ${v.text}`}>
                  {sign}
                  {Math.abs(Math.round(delta * 10) / 10)} {LABELS.pointsShort}
                </p>
                <p className={`mt-1 text-sm ${v.text}`}>{v.label}</p>
              </div>

              <div className="space-y-4">
                <Bar label={LABELS.planned} value={plan.planned} color="bg-gray-400" />
                <Bar label={LABELS.actual} value={plan.actual} color={v.bar} />
              </div>
            </div>
          );
        })()
      ) : (
        <EmptyState
          icon={TrendingUp}
          title={LABELS.emptyPlan}
          message={LABELS.emptyPlanMessage}
        />
      )}
    </SectionCard>
  );
}