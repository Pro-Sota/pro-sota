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
  ArrowRight,
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
import Link from "next/link";

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

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: "currency",
    currency: CURRENCY,
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(value);
}

function isOverdue(dateStr: string): boolean {
  if (!dateStr) return false;
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return false;
  return parsed.getTime() < Date.now();
}

function countOpen(items: { status: string }[]): number {
  return items.filter((i) => i.status !== "Respondido").length;
}

function calculateKpis(): KpiConfig[] {
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

function KpiGrid() {
  const kpis = calculateKpis();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 w-full">
      {kpis.length ? (
        kpis.map((kpi) => {
          const IconComponent = kpi.icon;
          return (
            <KpiCard
              key={kpi.title}
              icon={<IconComponent size={20} />}
              title={kpi.title}
              value={kpi.value}
            />
          );
        })
      ) : (
        <KpiEmptyState />
      )}
    </div>
  );
}

function KpiEmptyState() {
  return (
    <div className="col-span-full rounded-lg border border-gray-200 bg-gray-50 p-8 sm:p-12">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200">
          <BarChart3 className="h-6 w-6 text-gray-500" />
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-semibold text-gray-900">
            {LABELS.noKpis}
          </h3>
          <p className="text-sm text-gray-600 max-w-sm">
            {LABELS.kpiDescription}
          </p>
        </div>

        <div className="flex items-start gap-2 mt-4 px-3 py-2.5 bg-blue-50 rounded-lg border border-blue-200 text-left">
          <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">{LABELS.connectData}</p>
        </div>
      </div>
    </div>
  );
}

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: { label: string; href: string };
}

function SectionCard({ title, subtitle, children, action }: SectionCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4 sm:py-5 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">{title}</h2>
          {subtitle && (
            <span className="text-xs text-gray-500 mt-0.5 block">{subtitle}</span>
          )}
        </div>
        {action && (
          
            <Link href={action.href}
            className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1 whitespace-nowrap ml-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 rounded px-2 py-1"
          >
            {action.label}
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  message,
}: {
  icon: LucideIcon;
  title: string;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 sm:py-14 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 mb-3">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <h3 className="text-sm font-medium text-gray-900">
        {LABELS.noData} {title.toLowerCase()}
      </h3>
      <p className="mt-1 text-sm text-gray-500 max-w-xs">
        {message || LABELS.dataWillAppear}
      </p>
    </div>
  );
}

function ProgressBar({ percent, overBudget = false }: { percent: number; overBudget?: boolean }) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div
      className="h-2 bg-gray-100 rounded-full overflow-hidden"
      role="progressbar"
      aria-label={`Progresso: ${clamped}%`}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-all ${
          overBudget ? "bg-red-500" : "bg-blue-600"
        }`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

function TrackerList({ items }: { items: TrackerItem[] }) {
  return (
    <div className="divide-y divide-gray-100">
      {items.map((item, idx) => (
        <div
          key={item.id}
          className={`flex justify-between items-center gap-4 py-3 ${
            idx === 0 ? "" : ""
          }`}
        >
          <div className="min-w-0">
            <p className="text-sm text-gray-900">
              <span className="text-gray-400 text-xs mr-2">{item.id}</span>
              <span className="truncate inline-block max-w-xs">{item.subject}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">Prazo {item.due}</p>
          </div>
          <div className="flex-shrink-0">
            <StatusPill status={item.status} />
          </div>
        </div>
      ))}
    </div>
  );
}

function RisksBanner({ risks }: { risks: Risk[] }) {
  return (
    <div className="space-y-2">
      {risks.map((risk, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-md bg-red-50 border border-red-200 px-3 py-2.5 text-red-700"
        >
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              risk.severity === "high" ? "bg-red-600" : "bg-amber-500"
            }`}
          />
          <span className="text-sm">{risk.text}</span>
        </div>
      ))}
    </div>
  );
}

export default function OverviewClientPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="space-y-6 sm:space-y-8 w-full">
          {/* Header */}
          <div className="border-b border-gray-200 pb-6">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Visão Geral do Projecto
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Acompanhe o progresso, riscos e tarefas do seu projecto de arquitetura.
            </p>
          </div>

          {/* KPI Grid */}
          <KpiGrid />

          {/* Schedule Section */}
          <SectionCard title={LABELS.schedule}>
            <div className="w-full overflow-hidden">
                <EmptyState icon={CircleAlert} title={LABELS.schedule} />
           
            </div>
          </SectionCard>

          {/* Risks Section */}
          <SectionCard title={LABELS.projectRisks}>
            {risks.length ? (
              <RisksBanner risks={risks} />
            ) : (
              <EmptyState icon={CircleAlert} title={LABELS.projectRisks} />
            )}
          </SectionCard>

          {/* Milestones & Activities Grid */}
          <div className="grid lg:grid-cols-2 gap-6 w-full">
            {/* Upcoming Milestones */}
            <SectionCard title={LABELS.upcomingMilestones}>
              {upcomingMilestones.length > 0 ? (
                <div className="divide-y divide-gray-100 -mx-6 px-6">
                  {upcomingMilestones.map((m: Milestone, idx) => {
                    const overdue = isOverdue(m.date);

                    return (
                      <div
                        key={m.name}
                        className={`flex justify-between items-center gap-4 py-3 ${
                          idx === 0 ? "" : ""
                        }`}
                      >
                        <span className="text-sm text-gray-700">{m.name}</span>
                        <span
                          className={`text-sm font-mono whitespace-nowrap text-right ${
                            overdue
                              ? "text-red-600 font-medium"
                              : "text-gray-500"
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
                <EmptyState
                  icon={CalendarDays}
                  title={LABELS.upcomingMilestones}
                />
              )}
            </SectionCard>

            {/* Recent Activities */}
            <SectionCard title={LABELS.recentActivities}>
              {recentActivity.length > 0 ? (
                <div className="divide-y divide-gray-100 -mx-6 px-6">
                  {recentActivity.map((a: Activity, idx) => (
                    <div
                      key={`${a.who}-${a.time}`}
                      className={`py-3 ${idx === 0 ? "" : ""}`}
                    >
                      <p className="text-sm text-gray-700">{a.text}</p>
                      <p className="text-xs text-gray-500 mt-1.5">
                        {a.who} · {a.time}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Inbox} title={LABELS.recentActivities} />
              )}
            </SectionCard>
          </div>

          {/* RFIs & Submissions Grid */}
          <div className="grid lg:grid-cols-2 gap-6 w-full">
            <SectionCard
              title={LABELS.rfis}
              subtitle={`${countOpen(rfis)} ${LABELS.openCount}`}
            >
              {rfis.length > 0 ? (
                <TrackerList items={rfis} />
              ) : (
                <EmptyState icon={CircleAlert} title={LABELS.rfis} />
              )}
            </SectionCard>

            <SectionCard
              title={LABELS.submissions}
              subtitle={`${countOpen(submittals)} ${LABELS.openCount}`}
            >
              {submittals.length > 0 ? (
                <TrackerList items={submittals} />
              ) : (
                <EmptyState icon={ListChecks} title={LABELS.submissions} />
              )}
            </SectionCard>
          </div>

          {/* Approvals & Budget Grid */}
          <div className="grid lg:grid-cols-2 gap-6 w-full">
            {/* Pending Approvals */}
            <SectionCard title={LABELS.pendingApprovals}>
              {approvals.length > 0 ? (
                <div className="divide-y divide-gray-100 -mx-6 px-6">
                  {approvals.map((a: ApprovalItem, idx) => {
                    const overdue = isOverdue(a.date);

                    return (
                      <div
                        key={a.item}
                        className={`flex justify-between items-center gap-4 py-3 ${
                          idx === 0 ? "" : ""
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm text-gray-700 truncate">
                            {a.item}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {LABELS.waiting} {a.requestedFrom}
                          </p>
                        </div>
                        <span
                          className={`text-sm font-mono shrink-0 whitespace-nowrap ${
                            overdue
                              ? "text-red-600 font-medium"
                              : "text-gray-500"
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
                <EmptyState
                  icon={Clock3Icon}
                  title={LABELS.pendingApprovals}
                />
              )}
            </SectionCard>

            {/* Budget by Phase */}
            <SectionCard title={LABELS.budgetByPhase}>
              {budgetByPhase.length > 0 ? (
                <div className="space-y-4 -mx-6 px-6">
                  {budgetByPhase.map((b: BudgetPhase) => {
                    const pct =
                      b.total > 0 ? Math.round((b.used / b.total) * 100) : 0;

                    return (
                      <div key={b.phase}>
                        <div className="flex justify-between items-baseline text-sm mb-2">
                          <span className="text-gray-700">{b.phase}</span>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {formatCompactCurrency(b.used)} /{" "}
                            {formatCompactCurrency(b.total)}
                          </span>
                        </div>
                        <ProgressBar
                          percent={pct}
                          overBudget={pct >= 100}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={BarChart3}
                  title={LABELS.budgetByPhase}
                />
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}