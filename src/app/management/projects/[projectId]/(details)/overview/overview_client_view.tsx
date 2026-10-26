"use client";

import { useState } from "react";
import Link from "next/link";
import type { ReactNode, ComponentType } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ChevronDown,
  CircleAlert,
  Clock3,
  Inbox,
  ListChecks,
  Pencil,
  TrendingUp,
} from "lucide-react";

import GanttChart from "@/app/components/gant_chart/gantt";
import KpiCard from "./components/kpi_card";
import { StatusPill } from "./components/status_pill";

import type { OverviewData } from "@/services/project_overview";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface OverviewClientPageProps {
  data: OverviewData;
  isAdmin: boolean;
}

interface SectionCardProps {
  id?: string;
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    href: string;
  };
  headerExtra?: ReactNode;
  children: ReactNode;
  /** CSS height value, or "auto" for no limit. */
  height?: string;
  /**
   * "max"   → card shrinks to its content and scrolls past `height` (default)
   * "fixed" → card is always exactly `height` (use for side-by-side cards)
   */
  heightMode?: "max" | "fixed";
  scrollable?: boolean;
}

type EmptyStateProps = {
  icon: ComponentType<{
    size?: number;
    className?: string;
    "aria-hidden"?: boolean | "true" | "false";
  }>;
  title: string;
  message?: string;
};

type BudgetItem = OverviewData["budgetByPhase"][number];
type RiskItem = OverviewData["risks"][number];

interface RequestListItem {
  id: string;
  subject: string;
  status: string;
  due: string;
}

type KpiTone = "default" | "warning" | "danger";

interface KpiItem {
  icon: ComponentType<{ size?: number; "aria-hidden"?: boolean | "true" | "false" }>;
  title: string;
  value: string;
  href: string;
  tone: KpiTone;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const LABELS = {
  progress: "Progresso",
  remainingDays: "Dias restantes",
  openQuestions: "Questões abertas",
  completedTasks: "Tarefas concluídas",
  pendingApprovals: "Aprovações pendentes",
  schedule: "Cronograma do projecto",
  projectRisks: "Riscos do projecto",
  recentActivities: "Actividades recentes",
  rfis: "Solicitações de informação",
  submissions: "Submissões",
  budgetByPhase: "Orçamento por fase",
  viewAll: "Ver todos",
  dataWillAppear:
    "Esta secção será preenchida quando existirem registos disponíveis.",
} as const;

const NO_DEADLINE = "Sem prazo";
const NOT_DEFINED = "Não definido";

const CURRENCY_LOCALE = "pt-AO";
const PROJECT_TIME_ZONE = "Africa/Luanda";
const CARD_HEIGHT = "360px";

/* Sub-routes of /management/projects/[id]. Adjust if your routes differ. */
const ROUTES = {
  tasks: "tasks",
  rfis: "rfis",
  submissions: "submissions",
  risks: "risks",
  edit: "edit",
} as const;

/* Section anchor ids (used by KPI cards to scroll to a section). */
const SECTION_IDS = {
  schedule: "cronograma",
  approvals: "aprovacoes",
  rfis: "rfis",
  submissions: "submissoes",
  risks: "riscos",
  budget: "orcamento",
} as const;

const REMAINING_DAYS_WARNING_THRESHOLD = 14;

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

const currencyFormatter = new Intl.NumberFormat(CURRENCY_LOCALE, {
  style: "currency",
  currency: "AOA",
  notation: "compact",
  maximumFractionDigits: 1,
});

const percentageFormatter = new Intl.NumberFormat(CURRENCY_LOCALE, {
  maximumFractionDigits: 1,
});

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return currencyFormatter.format(value);
}

function formatPercentage(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${percentageFormatter.format(value)}%`;
}

function formatMilestoneDate(value: string | null | undefined): string {
  if (!value) return NO_DEADLINE;

  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(isDateOnly ? `${value}T12:00:00` : value);

  if (Number.isNaN(date.getTime())) return NO_DEADLINE;

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: PROJECT_TIME_ZONE,
  }).format(date);
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "Data desconhecida";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Data desconhecida";

  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: PROJECT_TIME_ZONE,
  }).format(date);
}

/* -------------------------------------------------------------------------- */
/* Shared components                                                          */
/* -------------------------------------------------------------------------- */

function SectionCard({
  id,
  title,
  subtitle,
  action,
  headerExtra,
  children,
  height = "360px",
  heightMode = "max",
  scrollable = true,
}: SectionCardProps) {
  const style =
    height === "auto"
      ? undefined
      : heightMode === "fixed"
        ? { height }
        : { maxHeight: height };

  return (
    <section
      id={id}
      className="flex min-w-0 scroll-mt-6 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
      style={style}
    >
      <header className="flex shrink-0 flex-col gap-2 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
        <div className="min-w-0">
          <h2 className="font-semibold text-gray-900">{title}</h2>

          {subtitle && (
            <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
          )}
        </div>

        {(action || headerExtra) && (
          <div className="flex shrink-0 items-center gap-2">
            {headerExtra}

            {action && (
              <Link
                href={action.href}
                className="inline-flex w-fit shrink-0 items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950]"
              >
                {action.label}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            )}
          </div>
        )}
      </header>

      <div
        className={`min-w-0 px-5 py-5 sm:px-6 ${
          scrollable
            ? "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain"
            : "overflow-visible"
        }`}
      >
        {children}
      </div>
    </section>
  );
}

function EmptyState({
  icon: Icon,
  title,
  message = LABELS.dataWillAppear,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center sm:py-10">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
        <Icon size={20} className="text-gray-400" aria-hidden="true" />
      </div>

      <h3 className="text-sm font-medium text-gray-900">{title}</h3>

      <p className="mt-1 max-w-sm text-sm text-gray-500">{message}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Schedule section                                                           */
/* -------------------------------------------------------------------------- */

function ScheduleSection({ data }: { data: OverviewData }) {
  const [isOpen, setIsOpen] = useState(true);
  const projectBase = `/management/projects/${data.project.id}`;
  const contentId = "schedule-content";

  const chartPhases = data.phases.map((phase) => ({
    id: phase.id,
    name: phase.name,
    sortOrder: phase.sortOrder ?? 0,
    progress: Math.max(0, Math.min(100, phase.progress ?? 0)),
  }));

  const chartStages = data.tasks.map((task) => ({
    id: task.id,
    name: task.name,
    phaseId: task.phaseId,
    startDate: task.startDate,
    endDate: task.endDate,
    progress: Math.max(0, Math.min(100, task.progress)),
  }));

  const chartDeliverables = data.deliverables.map((deliverable) => ({
    id: deliverable.id,
    name: deliverable.title,
    phaseId: deliverable.phase_id,
    startDate: deliverable.start_date,
    endDate: deliverable.due_date,
    progress: Math.max(0, Math.min(100, deliverable.progress)),
    sortOrder: deliverable.sort_order,
  }));

  return (
    <SectionCard
      id={SECTION_IDS.schedule}
      title={LABELS.schedule}
      height="auto"
      scrollable={false}
      action={{
        label: "Ver tarefas",
        href: `${projectBase}/${ROUTES.tasks}`,
      }}
      headerExtra={
        chartPhases.length > 0 ? (
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls={contentId}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950]"
          >
            {isOpen ? "Recolher" : "Expandir"}
            <ChevronDown
              size={14}
              aria-hidden="true"
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
        ) : null
      }
    >
      <div id={contentId} hidden={!isOpen}>
        {chartPhases.length > 0 ? (
          <GanttChart
            phases={chartPhases}
            steps={chartStages}
            deliverables={chartDeliverables}
          />
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="Sem fases no cronograma"
            message="Ainda não existem fases neste projecto. Adicione fases para visualizar o cronograma."
          />
        )}
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Risks section                                                              */
/* -------------------------------------------------------------------------- */

type Severity = "high" | "medium" | "low";

const SEVERITY_ORDER: Record<Severity, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const SEVERITY_META: Record<
  Severity,
  { label: string; plural: string; dot: string; badge: string }
> = {
  high: {
    label: "Alta",
    plural: "altos",
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700",
  },
  medium: {
    label: "Média",
    plural: "médios",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700",
  },
  low: {
    label: "Baixa",
    plural: "baixos",
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-700",
  },
};

function normalizeSeverity(value: RiskItem["severity"]): Severity {
  return value === "high" || value === "medium" ? value : "low";
}

function RisksSection({ data }: { data: OverviewData }) {
  const risks = [...data.risks].sort(
    (a, b) =>
      SEVERITY_ORDER[normalizeSeverity(a.severity)] -
      SEVERITY_ORDER[normalizeSeverity(b.severity)],
  );

  const counts = risks.reduce<Record<Severity, number>>(
    (acc, risk) => {
      acc[normalizeSeverity(risk.severity)] += 1;
      return acc;
    },
    { high: 0, medium: 0, low: 0 },
  );

  const subtitle =
    risks.length > 0
      ? (["high", "medium", "low"] as const)
          .filter((severity) => counts[severity] > 0)
          .map(
            (severity) =>
              `${counts[severity]} ${SEVERITY_META[severity].plural}`,
          )
          .join(" · ")
      : undefined;

  return (
    <SectionCard
      id={SECTION_IDS.risks}
      title={LABELS.projectRisks}
      subtitle={subtitle}
      height="320px"
      action={{
        label: LABELS.viewAll,
        href: ROUTES.risks,
      }}
    >
      {risks.length > 0 ? (
        <ul className="space-y-2">
          {risks.map((risk) => {
            const severity = normalizeSeverity(risk.severity);
            const meta = SEVERITY_META[severity];

            return (
              <li
                key={risk.id}
                className="flex items-start gap-3 rounded-md border border-gray-200 px-3 py-3"
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${meta.dot}`}
                  aria-hidden="true"
                />

                <p className="min-w-0 flex-1 text-sm text-gray-700">
                  {risk.text}
                </p>

                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${meta.badge}`}
                >
                  <span className="sr-only">Severidade: </span>
                  {meta.label}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState icon={CircleAlert} title="Sem riscos registados" />
      )}
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Activities section                                                         */
/* -------------------------------------------------------------------------- */

function ActivitiesSection({ data }: { data: OverviewData }) {
  return (
    <SectionCard title={LABELS.recentActivities} height="360px">
      {data.activities.length > 0 ? (
        <ul className="divide-y divide-gray-100">
          {data.activities.map((activity) => (
            <li
              key={activity.activity_id}
              className="py-3 first:pt-0 last:pb-0"
            >
              <p className="text-sm text-gray-700">
                {activity.description || activity.activity_type}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {activity.user_name || "Utilizador desconhecido"} ·{" "}
                {formatDateTime(activity.created_at)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={Inbox} title="Sem actividades recentes" />
      )}
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* RFI and submissions sections                                               */
/* -------------------------------------------------------------------------- */

function RequestsSection({ data }: { data: OverviewData }) {
  const projectBase = `/management/projects/${data.project.id}`;

  const rfiItems: RequestListItem[] = data.rfis.map((rfi) => ({
    id: rfi.id,
    subject: rfi.subject,
    status: rfi.status,
    due: rfi.due,
  }));

  const submissionItems: RequestListItem[] = data.submittals.map(
    (submission) => ({
      id: submission.submission_id,
      subject: submission.title,
      status: submission.status,
      due: formatMilestoneDate(submission.due_date),
    }),
  );

  const sections: {
    id: string;
    title: string;
    emptyTitle: string;
    href: string;
    items: RequestListItem[];
  }[] = [
    {
      id: SECTION_IDS.rfis,
      title: LABELS.rfis,
      emptyTitle: "Sem solicitações de informação",
      href: `${projectBase}/${ROUTES.rfis}`,
      items: rfiItems,
    },
    {
      id: SECTION_IDS.submissions,
      title: LABELS.submissions,
      emptyTitle: "Sem submissões",
      href: `${projectBase}/${ROUTES.submissions}`,
      items: submissionItems,
    },
  ];

  return (
    <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
      {sections.map(({ id, title, emptyTitle, href, items }) => (
        <SectionCard
          key={id}
          id={id}
          title={title}
          subtitle={`${items.length} registos`}
          height="320px"
          heightMode="fixed"
          action={{ label: LABELS.viewAll, href }}
        >
          {items.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-gray-800">
                      {item.subject}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Prazo: {item.due || NO_DEADLINE}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <StatusPill status={item.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={ListChecks} title={emptyTitle} />
          )}
        </SectionCard>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Approvals section                                                          */
/* -------------------------------------------------------------------------- */

function ApprovalsSection({ data }: { data: OverviewData }) {
  return (
    <SectionCard
      id={SECTION_IDS.approvals}
      title={LABELS.pendingApprovals}
      subtitle={`${data.approvals.length} submissões por rever`}
      height="360px"
    >
      {data.approvals.length > 0 ? (
        <ul className="divide-y divide-gray-100">
          {data.approvals.map((approval) => (
            <li
              key={approval.submission_id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-800">
                  {approval.title}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {approval.type} · Submetido em{" "}
                  {formatDateTime(approval.submitted_at)}
                </p>
              </div>

              <div className="shrink-0">
                <StatusPill status={approval.status} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Clock3}
          title="Sem aprovações pendentes"
          message="Não existem submissões pendentes de revisão."
        />
      )}
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Budget section                                                             */
/* -------------------------------------------------------------------------- */

function normalizeAmount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function BudgetProgress({ budget }: { budget: BudgetItem }) {
  const total = normalizeAmount(budget.total);
  const used = normalizeAmount(budget.used);

  const actualPercentage = total > 0 ? (used / total) * 100 : 0;
  const visualPercentage = Math.min(100, actualPercentage);
  const isOverBudget = total > 0 && used > total;
  const remaining = total - used;

  const barColor = isOverBudget
    ? "bg-red-500"
    : actualPercentage >= 90
      ? "bg-amber-500"
      : "bg-[#002950]";

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <span className="text-sm font-medium text-gray-800">
          {budget.phase}
        </span>

        <span className="text-xs text-gray-500">
          {formatCurrency(used)} / {formatCurrency(total)}
        </span>
      </div>

      <div
        role="progressbar"
        aria-label={`Execução do orçamento — ${budget.phase}`}
        aria-valuenow={visualPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={
          total > 0
            ? `${formatPercentage(actualPercentage)} executado`
            : "Orçamento não definido"
        }
        className="h-2 overflow-hidden rounded-full bg-gray-100"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${barColor}`}
          style={{ width: `${visualPercentage}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={`text-xs ${
            isOverBudget
              ? "font-medium text-red-600"
              : actualPercentage >= 90
                ? "text-amber-700"
                : "text-gray-500"
          }`}
        >
          {isOverBudget
            ? `Excedido em ${formatCurrency(Math.abs(remaining))}`
            : total > 0
              ? `${formatPercentage(actualPercentage)} executado`
              : "Orçamento não definido"}
        </span>

        {total > 0 && !isOverBudget && (
          <span className="text-xs text-gray-500">
            Saldo: {formatCurrency(remaining)}
          </span>
        )}
      </div>
    </div>
  );
}

function BudgetSummary({ budgets }: { budgets: BudgetItem[] }) {
  const total = budgets.reduce((sum, b) => sum + normalizeAmount(b.total), 0);
  const used = budgets.reduce((sum, b) => sum + normalizeAmount(b.used), 0);
  const percentage = total > 0 ? (used / total) * 100 : 0;
  const overBudgetCount = budgets.filter(
    (b) => normalizeAmount(b.total) > 0 && normalizeAmount(b.used) > normalizeAmount(b.total),
  ).length;

  return (
    <div className="mb-5 flex flex-col gap-3 rounded-md bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs text-gray-500">Total executado</p>
        <p className="mt-0.5 text-sm font-semibold text-gray-900">
          {formatCurrency(used)} / {formatCurrency(total)}
          {total > 0 && (
            <span className="ml-2 font-normal text-gray-500">
              ({formatPercentage(percentage)})
            </span>
          )}
        </p>
      </div>

      {overBudgetCount > 0 && (
        <p className="text-xs font-medium text-red-600">
          {overBudgetCount}{" "}
          {overBudgetCount === 1 ? "fase excedida" : "fases excedidas"}
        </p>
      )}
    </div>
  );
}

function BudgetSection({ data }: { data: OverviewData }) {
  // Over-budget phases first, then by execution percentage (highest first).
  const budgets = [...data.budgetByPhase].sort((a, b) => {
    const ta = normalizeAmount(a.total);
    const tb = normalizeAmount(b.total);
    const ua = normalizeAmount(a.used);
    const ub = normalizeAmount(b.used);

    const overA = ta > 0 && ua > ta ? 1 : 0;
    const overB = tb > 0 && ub > tb ? 1 : 0;
    if (overA !== overB) return overB - overA;

    const pa = ta > 0 ? ua / ta : 0;
    const pb = tb > 0 ? ub / tb : 0;
    return pb - pa;
  });

  return (
    <SectionCard
      id={SECTION_IDS.budget}
      title={LABELS.budgetByPhase}
      height="480px"
    >
      {budgets.length > 0 ? (
        <>
          <BudgetSummary budgets={budgets} />

          <div className="grid grid-cols-1 gap-x-10 gap-y-5 lg:grid-cols-2">
            {budgets.map((budget) => (
              <BudgetProgress key={budget.phase} budget={budget} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState icon={BarChart3} title="Sem orçamento por fase" />
      )}
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Header                                                                     */
/* -------------------------------------------------------------------------- */

function ProjectHeader({
  project,
  projectBase,
  isAdmin,
}: {
  project: OverviewData["project"];
  projectBase: string;
  isAdmin: boolean;
}) {
  const location = [project.municipality, project.country || "Angola"]
    .filter(Boolean)
    .join(", ");

  const metadata: [string, string][] = [
    ["Localização", location || NOT_DEFINED],
    ["Tipo", project.type || NOT_DEFINED],
    ["Início", formatMilestoneDate(project.startDate)],
    ["Conclusão", formatMilestoneDate(project.endDate)],
  ];

  return (
    <header className="border-b border-gray-200 pb-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            {project.code || "Pro-Sota"}
          </p>

          <h1 className="mt-1 break-words text-2xl font-semibold text-gray-900 sm:text-3xl">
            {project.name || "Projecto sem nome"}
          </h1>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span className="inline-flex w-fit items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700">
            {project.status || "Estado não definido"}
          </span>

          {isAdmin && (
            <Link
              href={`${projectBase}/${ROUTES.edit}`}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950]"
            >
              <Pencil size={15} aria-hidden="true" />
              Editar projecto
            </Link>
          )}
        </div>
      </div>

      <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-sm">
        {metadata.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs text-gray-500">{label}</dt>
            <dd className="mt-0.5 break-words font-medium text-gray-800">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Main page                                                                  */
/* -------------------------------------------------------------------------- */

const TONE_RING: Record<KpiTone, string> = {
  default: "",
  warning: "ring-1 ring-amber-400",
  danger: "ring-1 ring-red-400",
};

export default function OverviewClientPage({
  data,
  isAdmin,
}: OverviewClientPageProps) {
  const { project, kpis } = data;
  const projectBase = `/management/projects/${project.id}`;

  const remainingDaysTone: KpiTone =
    kpis.remainingDays === null
      ? "default"
      : kpis.remainingDays < 0
        ? "danger"
        : kpis.remainingDays <= REMAINING_DAYS_WARNING_THRESHOLD
          ? "warning"
          : "default";

  const kpiItems: KpiItem[] = [
    {
      icon: TrendingUp,
      title: LABELS.progress,
      value: `${kpis.progress}%`,
      href: `#${SECTION_IDS.schedule}`,
      tone: "default",
    },
    {
      icon: CalendarDays,
      title: LABELS.remainingDays,
      value: kpis.remainingDays === null ? "—" : String(kpis.remainingDays),
      href: `#${SECTION_IDS.schedule}`,
      tone: remainingDaysTone,
    },
    {
      icon: CircleAlert,
      title: LABELS.openQuestions,
      value: String(kpis.openQuestions),
      href: `#${SECTION_IDS.rfis}`,
      tone: "default",
    },
    {
      icon: ListChecks,
      title: LABELS.completedTasks,
      value: `${kpis.completedTasks} / ${kpis.totalTasks}`,
      href: `${projectBase}/${ROUTES.tasks}`,
      tone: "default",
    },
    {
      icon: Clock3,
      title: LABELS.pendingApprovals,
      value: String(kpis.pendingApprovals),
      href: `#${SECTION_IDS.approvals}`,
      tone: kpis.pendingApprovals > 0 ? "warning" : "default",
    },
  ];

  return (
    <main className="min-h-0 bg-[#F7F7F5]">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <ProjectHeader
          project={project}
          projectBase={projectBase}
          isAdmin={isAdmin}
        />

        {/* Project KPIs */}
        <section
          aria-label="Indicadores do projecto"
          className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5"
        >
          {kpiItems.map(({ icon: Icon, title, value, href, tone }, index) => (
            <Link
              key={title}
              href={href}
              className={`block min-w-0 rounded-lg transition-shadow hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] ${
                TONE_RING[tone]
              } ${index === kpiItems.length - 1 ? "col-span-2 lg:col-span-1" : ""}`}
            >
              <KpiCard
                icon={<Icon size={20} aria-hidden="true" />}
                title={title}
                value={value}
              />
            </Link>
          ))}
        </section>

        <ScheduleSection data={data} />

        {/* Main grid: work queues on the left, risks and activity on the right */}
        <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="min-w-0 space-y-6 xl:col-span-2">
            <ApprovalsSection data={data} />
            <RequestsSection data={data} />
          </div>

          <div className="min-w-0 space-y-6">
            <RisksSection data={data} />
            <ActivitiesSection data={data} />
          </div>
        </div>


        <footer className="border-t border-gray-200 pt-4 text-xs text-gray-500">
          Pro-Sota · Dados do projecto carregados no servidor
        </footer>
      </div>
    </main>
  );
}