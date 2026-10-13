
"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactNode, ComponentType } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarDays,
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
import { useRouter } from "next/navigation";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface OverviewClientPageProps {
  data: OverviewData;
}

interface SectionCardProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    href: string;
  };
  children: ReactNode;
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
  upcomingMilestones: "Próximas etapas",
  recentActivities: "Actividades recentes",
  rfis: "Solicitações de informação",
  submissions: "Submissões",
  budgetByPhase: "Orçamento por fase",
  noData: "Sem dados",
  dataWillAppear:
    "Esta secção será preenchida quando existirem registos disponíveis.",
} as const;

const CURRENCY_LOCALE = "pt-AO";
const PROJECT_TIME_ZONE = "Africa/Luanda";
const TASKS_HREF = "tasks";
const PHASES_HREF = "phases";

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

function formatMilestoneDate(value: string): string {
  if (!value) return "—";

  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(isDateOnly ? `${value}T12:00:00` : value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(CURRENCY_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: PROJECT_TIME_ZONE,
  }).format(date);
}

/* -------------------------------------------------------------------------- */
/* Shared components                                                          */
/* -------------------------------------------------------------------------- */

function SectionCard({
  title,
  subtitle,
  action,
  children,
}: SectionCardProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
      <header className="flex flex-col gap-2 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
        <div className="min-w-0">
          <h2 className="font-semibold text-gray-900">{title}</h2>

          {subtitle && (
            <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
          )}
        </div>

        {action && (
          <Link
            href={action.href}
            className="inline-flex w-fit shrink-0 items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950]"
          >
            {action.label}
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        )}
      </header>

      <div className="px-5 py-5 sm:px-6">{children}</div>
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
        <Icon
          size={20}
          className="text-gray-400"
          aria-hidden="true"
        />
      </div>

      <h3 className="text-sm font-medium text-gray-900">
        {LABELS.noData}: {title.toLowerCase()}
      </h3>

      <p className="mt-1 max-w-sm text-sm text-gray-500">{message}</p>
    </div>
  );
}


/* -------------------------------------------------------------------------- */
/* Schedule section                                                           */
/* -------------------------------------------------------------------------- */

function ScheduleSection({ data }: { data: OverviewData }) {
  const projectBase = `/management/projects/${data.project.id}`;

  const chartPhases = data.phases.map((phase) => ({
    id: phase.id,
    name: phase.name,
    sortOrder: phase.sortOrder ?? 0,
    progress: Math.max(0, Math.min(100, phase.progress ?? 0)),
  }));

  const chartSteps = data.tasks.map((task) => ({
    id: task.id,
    name: task.name,
    phaseId: task.phaseId,
    startDate: task.startDate,
    endDate: task.endDate,
    progress: Math.max(0, Math.min(100, task.progress)),
  }));

  return (
    <SectionCard
      title={LABELS.schedule}
      action={{
        label: "Ver tarefas",
        href: `${projectBase}/${TASKS_HREF}`,
      }}
    >
      {chartPhases.length > 0 ? (
        <GanttChart
          phases={chartPhases}
          steps={chartSteps}
          deliverables={[]}
        />
      ) : (
        <EmptyState
          icon={CalendarDays}
          title={LABELS.schedule}
          message="Ainda não existem fases neste projecto. Adicione fases para visualizar o cronograma."
        />
      )}
    </SectionCard>
  );
}


/* -------------------------------------------------------------------------- */
/* Risks section                                                              */
/* -------------------------------------------------------------------------- */

function RisksSection({ data }: { data: OverviewData }) {
  return (
    <SectionCard title={LABELS.projectRisks}>
      {data.risks.length > 0 ? (
        <ul className="space-y-2">
          {data.risks.map((risk) => (
            <li
              key={risk.id}
              className="flex items-start gap-3 rounded-md border border-gray-200 px-3 py-3"
            >
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  risk.severity === "high"
                    ? "bg-red-500"
                    : risk.severity === "medium"
                      ? "bg-amber-500"
                      : "bg-green-500"
                }`}
                aria-hidden="true"
              />

              <p className="text-sm text-gray-700">{risk.text}</p>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={CircleAlert}
          title={LABELS.projectRisks}
        />
      )}
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Milestones section                                                         */
/* -------------------------------------------------------------------------- */

function MilestonesSection({ data }: { data: OverviewData }) {
  const projectBase = `/management/projects/${data.project.id}`;

  return (
    <SectionCard
      title={LABELS.upcomingMilestones}
      action={{
        label: "Ver fases",
        href: `${projectBase}/${PHASES_HREF}`,
      }}
    >
      {data.milestones.length > 0 ? (
        <ul className="divide-y divide-gray-100">
          {data.milestones.map((milestone) => (
            <li
              key={milestone.id}
              className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <p className="min-w-0 text-sm text-gray-700">
                {milestone.name}
              </p>

              <time
                dateTime={milestone.date}
                className="shrink-0 text-xs text-gray-500"
              >
                {formatMilestoneDate(milestone.date)}
              </time>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title={LABELS.upcomingMilestones}
          message="As etapas e os marcos serão apresentados quando existirem registos associados ao projecto."
        />
      )}
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Activities section                                                         */
/* -------------------------------------------------------------------------- */

function ActivitiesSection({ data }: { data: OverviewData }) {
  return (
    <SectionCard title={LABELS.recentActivities}>
      {data.activities.length > 0 ? (
        <ul className="divide-y divide-gray-100">
          {data.activities.map((activity) => (
            <li key={activity.id} className="py-3 first:pt-0 last:pb-0">
              <p className="text-sm text-gray-700">{activity.text}</p>

              <p className="mt-1 text-xs text-gray-500">
                {activity.who} · {activity.time}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Inbox}
          title={LABELS.recentActivities}
        />
      )}
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* RFI and submissions sections                                               */
/* -------------------------------------------------------------------------- */

function RequestsSection({ data }: { data: OverviewData }) {
  const sections = [
    {
      title: LABELS.rfis,
      items: data.rfis,
    },
    {
      title: LABELS.submissions,
      items: data.submittals,
    },
  ];

  return (
    <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
      {sections.map(({ title, items }) => (
        <SectionCard
          key={title}
          title={title}
          subtitle={`${items.length} em aberto`}
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
                      Prazo: {item.due}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <StatusPill status={item.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={ListChecks} title={title} />
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
    <SectionCard title={LABELS.pendingApprovals}>
      {data.approvals.length > 0 ? (
        <ul className="divide-y divide-gray-100">
          {data.approvals.map((approval) => (
            <li
              key={approval.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-gray-800">
                  {approval.item}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  À aguardar {approval.requestedFrom}
                </p>
              </div>

              <span className="shrink-0 text-xs text-gray-500">
                {approval.date}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Clock3}
          title={LABELS.pendingApprovals}
        />
      )}
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Budget section                                                             */
/* -------------------------------------------------------------------------- */

function BudgetProgress({ budget }: { budget: BudgetItem }) {
  const total = Number.isFinite(budget.total)
    ? Math.max(0, budget.total)
    : 0;

  const used = Number.isFinite(budget.used)
    ? Math.max(0, budget.used)
    : 0;

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

function BudgetSection({ data }: { data: OverviewData }) {
  return (
    <SectionCard title={LABELS.budgetByPhase}>
      {data.budgetByPhase.length > 0 ? (
        <div className="space-y-5">
          {data.budgetByPhase.map((budget) => (
            <BudgetProgress key={budget.phase} budget={budget} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BarChart3}
          title={LABELS.budgetByPhase}
        />
      )}
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Edit project dialog data                                                   */
/* -------------------------------------------------------------------------- */

function getOptionalString(
  project: OverviewData["project"],
  key: string,
  fallback = "",
): string {
  const value: unknown = project[key as keyof typeof project];

  return typeof value === "string" ? value : fallback;
}

/* -------------------------------------------------------------------------- */
/* Main page                                                                  */
/* -------------------------------------------------------------------------- */

export default function OverviewClientPage({
  data,
}: OverviewClientPageProps) {
  const { project, kpis } = data;
  const projectBase = `/management/projects/${project.id}`;

  const router = useRouter();

  const kpiItems = [
    {
      icon: TrendingUp,
      title: LABELS.progress,
      value: `${kpis.progress}%`,
    },
    {
      icon: CalendarDays,
      title: LABELS.remainingDays,
      value:
        kpis.remainingDays === null
          ? "—"
          : String(kpis.remainingDays),
    },
    {
      icon: CircleAlert,
      title: LABELS.openQuestions,
      value: String(kpis.openQuestions),
    },
    {
      icon: ListChecks,
      title: LABELS.completedTasks,
      value: `${kpis.completedTasks} / ${kpis.totalTasks}`,
    },
    {
      icon: Clock3,
      title: LABELS.pendingApprovals,
      value: String(kpis.pendingApprovals),
    },
  ];

  return (
    <main className="min-h-screen bg-[#F7F7F5]">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Project header */}
        <header className="border-b border-gray-200 pb-5">
          <Link
            href={projectBase}
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950]"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Voltar ao projecto
          </Link>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                {project.code ?? "Pro-Sota"}
              </p>

              <h1 className="mt-1 text-2xl font-semibold text-gray-900 sm:text-3xl">
                Visão Geral do Projecto
              </h1>

              <p className="mt-2 text-sm text-gray-600">
                {project.name}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex w-fit items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700">
                {project.status}
              </span>

              <button
                type="button"
                onClick={() => router.push(projectBase+"/edit")}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950]"
              >
                <Pencil size={15} aria-hidden="true" />
                Editar projecto
              </button>
            </div>
          </div>
        </header>

        {/* Project KPIs */}
        <section
          aria-label="Indicadores do projecto"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5"
        >
          {kpiItems.map(({ icon: Icon, title, value }) => (
            <KpiCard
              key={title}
              icon={<Icon size={20} aria-hidden="true" />}
              title={title}
              value={value}
            />
          ))}
        </section>

        <ScheduleSection data={data} />

        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
          <RisksSection data={data} />
          <MilestonesSection data={data} />
        </div>

        <ActivitiesSection data={data} />

        <RequestsSection data={data} />

        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
          <ApprovalsSection data={data} />
          <BudgetSection data={data} />
        </div>

        <footer className="border-t border-gray-200 pt-4 text-xs text-gray-500">
          Pro-Sota · Dados do projecto carregados no servidor
        </footer>
      </div>
    </main>
  );
}
