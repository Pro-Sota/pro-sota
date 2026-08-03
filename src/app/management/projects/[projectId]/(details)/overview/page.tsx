"use client";
import KpiCard from "./components/kpi_card";
import GanttChart from "@/app/components/gantt";
import {
  CalendarDays,
  CircleAlert,
  Clock3Icon,
  Inbox,
  ListChecks,
  LucideIcon,
  TrendingUp,
  BarChart3,
  AlertCircle,
} from "lucide-react";

import {
  risks,
  upcomingMilestones,
  recentActivity,
  rfis,
  tasks,
  approvals,
  submittals,
  budgetByPhase,
} from "./data";
import { StatusPill } from "./components/status_pill";
import { useEffect, useState } from "react";
import Loader from "@/app/components/loader";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Risk {
  text: string;
  severity: "high" | "medium" | "low";
}

interface KpiConfig {
  icon: LucideIcon;
  title: string;
  value: string;
}

interface Milestone {
  name: string;
  date: string;
}

interface Activity {
  who: string;
  time: string;
  text: string;
}

interface ApprovalItem {
  item: string;
  date: string;
  requestedFrom: string;
}

interface TrackerItem {
  id: string;
  subject: string;
  status: string;
  due: string;
}

interface BudgetPhase {
  phase: string;
  used: number;
  total: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CURRENCY = "AOA";
const CURRENCY_LOCALE = "pt-AO";

const LABELS = {
  progress: "Progresso",
  remainingDays: "Dias restantes",
  openQuestions: "Questões abertas",
  completedTasks: "Tarefas concluídas",
  pendingApprovals: "Aprovações pendentes",
  schedule: "Cronograma",
  projectRisks: "Riscos do projecto",
  upcomingMilestones: "Próximas etapas",
  recentActivities: "Actividades recentes",
  rfis: "Solicitação de informação",
  submissions: "Submissões",
  budgetByPhase: "Orçamento por fase",
  openCount: "em aberto",
  overdue: "atrasado",
  noData: "Sem dados",
  dataWillAppear: "Os dados aparecerão aqui assim que estiverem disponíveis.",
  connectData: "Conecte seus dados de projeto para ver KPIs em tempo real",
  noKpis: "Nenhum KPI disponível",
  kpiDescription: "As métricas do dashboard aparecerão aqui assim que os dados do projeto forem carregados.",
  waiting: "À aguardar",
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Formats a number as currency in Angolan Kwanza
 */
function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: "currency",
    currency: CURRENCY,
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Checks if a date string is in the past (overdue)
 */
function isOverdue(dateStr: string): boolean {
  if (!dateStr) return false;
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return false;
  return parsed.getTime() < Date.now();
}

/**
 * Counts items with status other than "Respondido"
 */
function countOpen(items: { status: string }[]): number {
  return items.filter((i) => i.status !== "Respondido").length;
}

/**
 * Calculates KPI metrics from data
 */
function calculateKpis(): KpiConfig[] {
  // These should be calculated from your actual data
  const progress = [];
  const remainingDays = [];
  const openQuestions = [];
  const completedTasks = [];
  const pendingApprovals = [];
  const maxTasks = 0;

  return [
    {
      icon: TrendingUp,
      title: LABELS.progress,
      value: `${progress.length}`,
    },
    {
      icon: CalendarDays,
      title: LABELS.remainingDays,
      value: `${remainingDays.length}`,
    },
    {
      icon: CircleAlert,
      title: LABELS.openQuestions,
      value: `${openQuestions.length}`,
    },
    {
      icon: ListChecks,
      title: LABELS.completedTasks,
      value: `${completedTasks.length} / ${maxTasks}`,
    },
    {
      icon: Clock3Icon,
      title: LABELS.pendingApprovals,
      value: `${pendingApprovals.length}`,
    },
  ];
}

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * KPI Grid - Displays key performance indicators
 */
function KpiGrid() {
  const kpis = calculateKpis();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 w-full min-w-0">
      {kpis.length ? (
        kpis.map((kpi) => {
          const IconComponent = kpi.icon;
          return (
            <KpiCard
              key={kpi.title}
              icon={<IconComponent size={22} />}
              title={kpi.title}
              value={kpi.value}
            />
          );
        })
      ) : (
        <div className="col-span-full">
          <KpiEmptyState />
        </div>
      )}
    </div>
  );
}

/**
 * Empty State for KPI Grid - Shows when no data is available
 */
function KpiEmptyState() {
  return (
    <div className="w-full rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-12">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        {/* Icon Container */}
        <div className="relative">
          <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50" />
          <div className="relative bg-white rounded-full p-4 border border-slate-200">
            <BarChart3 size={32} className="text-slate-400" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-900">
            {LABELS.noKpis}
          </h3>
          <p className="text-sm text-slate-600 max-w-sm">
            {LABELS.kpiDescription}
          </p>
        </div>

        {/* Help Text */}
        <div className="flex items-center gap-2 mt-6 px-4 py-3 bg-blue-50 rounded-lg border border-blue-100">
          <AlertCircle size={16} className="text-blue-600 flex-shrink-0" />
          <p className="text-xs text-blue-700">{LABELS.connectData}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Section Card - Reusable container for dashboard sections
 */
interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

function SectionCard({ title, subtitle, children }: SectionCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 w-full min-w-0">
      <div className="flex justify-between items-baseline mb-4">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        {subtitle && (
          <span className="text-xs text-slate-400">{subtitle}</span>
        )}
      </div>
      {children}
    </div>
  );
}

/**
 * Empty State - Generic empty state component
 */
interface EmptyStateProps {
  title: string;
  message?: string;
}

function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Inbox size={36} className="text-slate-300 mb-3" />
      <h3 className="text-sm font-medium text-slate-700">
        {LABELS.noData} {title.toLowerCase()}
      </h3>
      <p className="mt-1 text-sm text-slate-400">
        {message || LABELS.dataWillAppear}
      </p>
    </div>
  );
}

/**
 * Progress Bar - Visual representation of percentage
 */
interface ProgressBarProps {
  percent: number;
  overBudget?: boolean;
}

function ProgressBar({ percent, overBudget = false }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div
      className="h-2 bg-slate-100 rounded-full overflow-hidden"
      role="progressbar"
      aria-label={`Progresso: ${clamped}%`}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full ${overBudget ? "bg-red-500" : "bg-blue-700"
          }`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

/**
 * Tracker List - Displays items with status and due dates
 */
interface TrackerListProps {
  items: TrackerItem[];
}

function TrackerList({ items }: TrackerListProps) {
  return (
    <div className="divide-y divide-slate-100">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex justify-between items-center py-3 gap-4"
        >
          <div className="min-w-0">
            <p className="text-sm text-slate-700 truncate">
              <span className="font-mono text-slate-400 mr-2">
                {item.id}
              </span>
              {item.subject}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Prazo {item.due}</p>
          </div>
          <StatusPill status={item.status} />
        </div>
      ))}
    </div>
  );
}

/**
 * Risks Banner - Displays project risks with severity indicators
 */
interface RisksBannerProps {
  risks: Risk[];
}

function RisksBanner({ risks }: RisksBannerProps) {
  return (
    <div className="space-y-2">
      {risks.map((risk, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-red-700"
        >
          <span
            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${risk.severity === "high" ? "bg-red-600" : "bg-amber-500"
              }`}
            aria-label={`Severidade: ${risk.severity}`}
          />
          <span className="text-sm">{risk.text}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Overview() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return (<Loader />)

  return (
    <div className="space-y-10 p-12 w-full min-w-0">
      {/* KPI Grid */}
      <KpiGrid />

      {/* Schedule Section */}
      <SectionCard title={LABELS.schedule}>
        <div className="w-full min-w-0 overflow-hidden">
          {tasks.length ? (
            <GanttChart tasks={tasks} />
          ) : (
            <EmptyState title={LABELS.schedule} />
          )}
        </div>
      </SectionCard>

      {/* Risks Section */}
      <SectionCard title={LABELS.projectRisks}>
        {risks.length ? (
          <RisksBanner risks={risks} />
        ) : (
          <EmptyState title={LABELS.projectRisks} />
        )}
      </SectionCard>

      {/* Milestones & Activities Grid */}
      <div className="grid lg:grid-cols-2 gap-6 w-full min-w-0">
        {/* Upcoming Milestones */}
        <SectionCard title={LABELS.upcomingMilestones}>
          {upcomingMilestones.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {upcomingMilestones.map((m: Milestone) => {
                const overdue = isOverdue(m.date);

                return (
                  <div
                    key={m.name}
                    className="flex justify-between items-center py-3 gap-4"
                  >
                    <span className="text-sm text-slate-700">{m.name}</span>
                    <span
                      className={`text-sm font-mono whitespace-nowrap ${overdue ? "text-red-600 font-medium" : "text-slate-500"
                        }`}
                    >
                      {m.date}
                      {overdue ? ` · ${LABELS.overdue}` : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title={LABELS.upcomingMilestones} />
          )}
        </SectionCard>

        {/* Recent Activities */}
        <SectionCard title={LABELS.recentActivities}>
          {recentActivity.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentActivity.map((a: Activity) => (
                <div key={`${a.who}-${a.time}`} className="py-3">
                  <p className="text-sm text-slate-700">{a.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {a.who} · {a.time}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title={LABELS.recentActivities} />
          )}
        </SectionCard>
      </div>

      {/* RFIs & Submissions Grid */}
      <div className="grid lg:grid-cols-2 gap-6 w-full min-w-0">
        <SectionCard
          title={LABELS.rfis}
          subtitle={`${countOpen(rfis)} ${LABELS.openCount}`}
        >
          {rfis.length > 0 ? (
            <TrackerList items={rfis} />
          ) : (
            <EmptyState title={LABELS.rfis} />
          )}
        </SectionCard>

        <SectionCard
          title={LABELS.submissions}
          subtitle={`${countOpen(submittals)} ${LABELS.openCount}`}
        >
          {submittals.length > 0 ? (
            <TrackerList items={submittals} />
          ) : (
            <EmptyState title={LABELS.submissions} />
          )}
        </SectionCard>
      </div>

      {/* Approvals & Budget Grid */}
      <div className="grid lg:grid-cols-2 gap-6 w-full min-w-0">
        {/* Pending Approvals */}
        <SectionCard title={LABELS.pendingApprovals}>
          {approvals.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {approvals.map((a: ApprovalItem) => {
                const overdue = isOverdue(a.date);

                return (
                  <div
                    key={a.item}
                    className="flex justify-between items-center py-3 gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-slate-700 truncate">
                        {a.item}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {LABELS.waiting} {a.requestedFrom}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-mono shrink-0 whitespace-nowrap ${overdue ? "text-red-600 font-medium" : "text-slate-500"
                        }`}
                    >
                      {a.date}
                      {overdue ? ` · ${LABELS.overdue}` : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title={LABELS.pendingApprovals} />
          )}
        </SectionCard>

        {/* Budget by Phase */}
        <SectionCard title={LABELS.budgetByPhase}>
          {budgetByPhase.length > 0 ? (
            <div className="space-y-4">
              {budgetByPhase.map((b: BudgetPhase) => {
                const pct =
                  b.total > 0 ? Math.round((b.used / b.total) * 100) : 0;

                return (
                  <div key={b.phase}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-700">{b.phase}</span>
                      <span className="font-mono text-slate-500 whitespace-nowrap ml-2">
                        {formatCompactCurrency(b.used)} /{" "}
                        {formatCompactCurrency(b.total)}
                      </span>
                    </div>
                    <ProgressBar percent={pct} overBudget={pct >= 100} />
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title={LABELS.budgetByPhase} />
          )}
        </SectionCard>
      </div>
    </div>
  );
}