import KpiCard from "./components/kpi_card";
import GanttChart from "@/app/components/gantt";
import { CalendarDays, CircleAlert, Clock3Icon, Inbox, ListChecks, LucideIcon, TrendingUp, Wallet } from "lucide-react";

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
import { BarChart3, AlertCircle } from "lucide-react";

// Type definitions
interface Risk {
  text: string;
  severity: "high" | "medium" | "low";
}

type Kpi = {
  icon:LucideIcon;
  title:string;
  value:string;
}

const progress = [];
const remainingDays = [];
const budget = [];
const openQuestions = [];
const completedTasks = [];
const pendingApprovals = []

const maxTasks = 0;

const kpis = [
  { icon: TrendingUp, title: "Progresso", value: `${progress.length}` },
  { icon: CalendarDays, title: "Dias restantes", value:` ${remainingDays.length}` },
  // { icon: Wallet, title: "Orçamento usado", value: budget.length },
  { icon: CircleAlert, title: "Questões abertas", value: `${openQuestions.length}` },
  { icon: ListChecks, title: "Tarefas concluídas", value: `${completedTasks.length} / ${maxTasks}`} ,
  { icon: Clock3Icon, title: "Aprovações pendentes", value: `${pendingApprovals.length}` },
];

const CURRENCY = "AOA";
const CURRENCY_LOCALE = "pt-AO";

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

function KpiGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 w-full min-w-0">
      {kpis.length ? (
        kpis.map((kpi) => {
          // Create a component element from the icon reference
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
 * Empty State Component for KPI Grid
 * Shows when no KPI data is available
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
            No KPIs Available
          </h3>
          <p className="text-sm text-slate-600 max-w-sm">
            Dashboard metrics will appear here once project data is loaded.
          </p>
        </div>

        {/* Help Text */}
        <div className="flex items-center gap-2 mt-6 px-4 py-3 bg-blue-50 rounded-lg border border-blue-100">
          <AlertCircle size={16} className="text-blue-600 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            Connect your project data to see real-time KPIs
          </p>
        </div>
      </div>
    </div>
  );
}


export default function Overview() {
  return (
    <div className="space-y-10 p-12 w-full min-w-0">
     <KpiGrid />

      <SectionCard title="Cronograma">
        <div className="w-full min-w-0 overflow-hidden">
          {tasks.length ? (
            <GanttChart tasks={tasks} />
          ) : (
            <EmptyState title="Schedule" />
          )}
        </div>
      </SectionCard>

      <SectionCard title="Riscos do projecto">
        {risks.length ? (
          <RisksBanner risks={risks} />
        ) : (
          <EmptyState title="Riscos do projecto" />
        )}
      </SectionCard>

      <div className="grid lg:grid-cols-2 gap-6 w-full min-w-0">
        <SectionCard title="Próximas etapas">
          {upcomingMilestones.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {upcomingMilestones.map((m: { name: string; date: string }) => {
                const overdue = isOverdue(m.date);

                return (
                  <div
                    key={m.name}
                    className="flex justify-between items-center py-3 gap-4"
                  >
                    <span className="text-sm text-slate-700">{m.name}</span>

                    <span
                      className={`text-sm font-mono ${
                        overdue ? "text-red-600 font-medium" : "text-slate-500"
                      }`}
                    >
                      {m.date}
                      {overdue ? " · atrasado" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="Próximas metas" />
          )}
        </SectionCard>

        <SectionCard title="Atividades recentes">
          {recentActivity.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentActivity.map((a: { who: string; time: string; text: string }) => (
                <div key={`${a.who}-${a.time}`} className="py-3">
                  <p className="text-sm text-slate-700">{a.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {a.who} · {a.time}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Actividade recentes"  />
          )}
        </SectionCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 w-full min-w-0">
        <SectionCard title="Solicitação de informação" subtitle={`${countOpen(rfis)} em aberto`}>
          {rfis.length > 0 ? (
            <TrackerList items={rfis} />
          ) : (
            <EmptyState title="Solicitações de informação"  />
          )}
        </SectionCard>

        <SectionCard
          title="Submissões"
          subtitle={`${countOpen(submittals)} em aberto`}
        >
          {submittals.length > 0 ? (
            <TrackerList items={submittals} />
          ) : (
            <EmptyState title="Submissões" />
          )}
        </SectionCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 w-full min-w-0">
        <SectionCard title="Aprovações pendentes">
          {approvals.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {approvals.map((a: any) => {
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
                        A aguardar {a.requestedFrom}
                      </p>
                    </div>

                    <span
                      className={`text-sm font-mono shrink-0 ${
                        overdue ? "text-red-600 font-medium" : "text-slate-500"
                      }`}
                    >
                      {a.date}
                      {overdue ? " · atrasado" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Aprovações pendentes"
            />
          )}
        </SectionCard>

        <SectionCard title="Orçamento por fase">
          {budgetByPhase.length > 0 ? (
            <div className="space-y-4">
              {budgetByPhase.map((b: { phase: string; used: number; total: number }) => {
                const pct =
                  b.total > 0 ? Math.round((b.used / b.total) * 100) : 0;

                return (
                  <div key={b.phase}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-700">{b.phase}</span>

                      <span className="font-mono text-slate-500">
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
            <EmptyState title="Orçamento" />
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
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

function EmptyState({
  title,
  message,
}: {
  title: string;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Inbox size={36} className="text-slate-300 mb-3" />

      <h3 className="text-sm font-medium text-slate-700">
        Sem {title.toLowerCase()}
      </h3>

      {message && <p className="mt-1 text-sm text-slate-400">{message}</p>}
      {!message && (
        <p className="mt-1 text-sm text-slate-400">
          Os dados aparecerão aqui assim que estiverem disponíveis.
        </p>
      )}
    </div>
  );
}

function ProgressBar({
  percent,
  overBudget = false,
}: {
  percent: number;
  overBudget?: boolean;
}) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div
      className="h-2 bg-slate-100 rounded-full overflow-hidden"
      role="progressbar"
      aria-label={`Progress: ${clamped}%`}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full ${
          overBudget ? "bg-red-500" : "bg-blue-700"
        }`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

function TrackerList({
  items,
}: {
  items: {
    id: string;
    subject: string;
    status: string;
    due: string;
  }[];
}) {
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

function RisksBanner({ risks }: { risks: Risk[] }) {
  return (
    <div className="space-y-2">
      {risks.map((risk, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-red-700"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              risk.severity === "high" ? "bg-red-600" : "bg-amber-500"
            }`}
          />

          {risk.text}
        </div>
      ))}
    </div>
  );
}