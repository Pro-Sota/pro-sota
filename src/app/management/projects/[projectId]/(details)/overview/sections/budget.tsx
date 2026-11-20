import { BarChart3 } from "lucide-react";

import type { OverviewData } from "@/services/project_overview";

import EmptyState from "../components/empty_state";
import SectionCard from "../components/section_card";
import { BRAND_BG, LABELS, SECTION_IDS } from "../constants";
import {
  formatCurrency,
  formatPercentage,
  normalizeAmount,
  plural,
} from "../components/format";

type BudgetItem = OverviewData["budgetByPhase"][number];

type BudgetStatus = "none" | "ok" | "warning" | "over" | "unbudgeted";

interface BudgetState {
  total: number;
  used: number;
  remaining: number;
  /** Real execution percentage (can exceed 100). */
  percentage: number;
  /** Percentage used for the bar width (0–100). */
  visual: number;
  status: BudgetStatus;
}

/** Normalise once and derive every flag from the same numbers. */
function getBudgetState(budget: BudgetItem): BudgetState {
  const total = normalizeAmount(budget.total);
  const used = normalizeAmount(budget.used);
  const remaining = total - used;

  if (total === 0) {
    // Money spent with no budget defined must not look like "nothing happened".
    const status: BudgetStatus = used > 0 ? "unbudgeted" : "none";
    return { total, used, remaining, percentage: 0, visual: used > 0 ? 100 : 0, status };
  }

  const percentage = (used / total) * 100;
  const status: BudgetStatus =
    used > total ? "over" : percentage >= 90 ? "warning" : "ok";

  return {
    total,
    used,
    remaining,
    percentage,
    visual: Math.min(100, percentage),
    status,
  };
}

const isExceeded = (s: BudgetStatus) => s === "over" || s === "unbudgeted";

const BAR_COLOR: Record<BudgetStatus, string> = {
  none: BRAND_BG,
  ok: BRAND_BG,
  warning: "bg-amber-500",
  over: "bg-red-500",
  unbudgeted: "bg-red-500",
};

const TEXT_COLOR: Record<BudgetStatus, string> = {
  none: "text-gray-500",
  ok: "text-gray-500",
  warning: "text-amber-700",
  over: "font-medium text-red-600",
  unbudgeted: "font-medium text-red-600",
};

function statusText(state: BudgetState): string {
  switch (state.status) {
    case "over":
      return `${LABELS.overBy} ${formatCurrency(Math.abs(state.remaining))}`;
    case "unbudgeted":
      return LABELS.spentWithoutBudget;
    case "none":
      return LABELS.budgetNotDefined;
    default:
      return `${formatPercentage(state.percentage)} ${LABELS.executed}`;
  }
}

function BudgetProgress({ budget }: { budget: BudgetItem }) {
  const state = getBudgetState(budget);
  const showBalance = state.status === "ok" || state.status === "warning";

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <span className="text-sm font-medium text-gray-800">{budget.phase}</span>
        <span className="text-xs text-gray-500">
          {formatCurrency(state.used)} / {formatCurrency(state.total)}
        </span>
      </div>

      <div
        role="progressbar"
        aria-label={`${LABELS.budgetExecution} — ${budget.phase}`}
        aria-valuenow={Math.round(state.visual)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={statusText(state)}
        className="h-2 overflow-hidden rounded-full bg-gray-100"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${BAR_COLOR[state.status]}`}
          style={{ width: `${state.visual}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={`text-xs ${TEXT_COLOR[state.status]}`}>
          {statusText(state)}
        </span>

        {showBalance && (
          <span className="text-xs text-gray-500">
            {LABELS.balance}: {formatCurrency(state.remaining)}
          </span>
        )}
      </div>
    </div>
  );
}

function BudgetSummary({ states }: { states: BudgetState[] }) {
  const total = states.reduce((sum, s) => sum + s.total, 0);
  const used = states.reduce((sum, s) => sum + s.used, 0);
  const percentage = total > 0 ? (used / total) * 100 : 0;
  const exceededCount = states.filter((s) => isExceeded(s.status)).length;

  return (
    <div className="mb-5 flex flex-col gap-3 rounded-md bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs text-gray-500">{LABELS.totalExecuted}</p>
        <p className="mt-0.5 text-sm font-semibold text-gray-900">
          {formatCurrency(used)} / {formatCurrency(total)}
          {total > 0 && (
            <span className="ml-2 font-normal text-gray-500">
              ({formatPercentage(percentage)})
            </span>
          )}
        </p>
      </div>

      {exceededCount > 0 && (
        <p className="text-xs font-medium text-red-600">
          {plural(exceededCount, "fase excedida", "fases excedidas")}
        </p>
      )}
    </div>
  );
}

export default function BudgetSection({ data }: { data: OverviewData }) {
  // Compute each phase's state once, then sort: exceeded first, then by %.
  const entries = data.budgetByPhase
    .map((budget) => ({ budget, state: getBudgetState(budget) }))
    .sort((a, b) => {
      const exA = isExceeded(a.state.status) ? 1 : 0;
      const exB = isExceeded(b.state.status) ? 1 : 0;
      if (exA !== exB) return exB - exA;
      return b.state.percentage - a.state.percentage;
    });

  return (
    <SectionCard
      id={SECTION_IDS.budget}
      title={LABELS.budgetByPhase}
    >
      {entries.length > 0 ? (
        <>
          <BudgetSummary states={entries.map((e) => e.state)} />

          <div className="grid grid-cols-1 gap-x-10 gap-y-5 lg:grid-cols-2">
            {entries.map(({ budget }, index) => (
              // If BudgetItem has a phase id, use it here instead of the index.
              <BudgetProgress key={`${budget.phase}-${index}`} budget={budget} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState icon={BarChart3} title={LABELS.emptyBudget} />
      )}
    </SectionCard>
  );
}