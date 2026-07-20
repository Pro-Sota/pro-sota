import KpiCard from "./components/kpi_card";
import GanttChart from "@/app/components/gantt";
import { risks, upcomingMilestones, recentActivity, rfis, approvals, submittals, budgetByPhase } from "./data";
import { StatusPill } from "./components/status_pill";
import { kpis } from "./types"

// NOTE: budget currency is currently assumed — verify against the real
// project currency (e.g. Kz vs USD) and adjust the locale/currency code below.
const CURRENCY = "AOA";
const CURRENCY_LOCALE = "pt-AO";

function formatCurrency(valueInThousands: number): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(valueInThousands * 1000) + "";
}

function formatCompactCurrency(value: number): string {
    return new Intl.NumberFormat(CURRENCY_LOCALE, {
      style: "currency",
      currency: CURRENCY,
      notation: "compact",
      maximumFractionDigits: 0,
    }).format(value);
  }

function isOverdue(dateStr: string): boolean {
  if (!dateStr) return false
  const parsed = new Date(dateStr)
  if (isNaN(parsed.getTime())) return false
  return parsed.getTime() < Date.now()
}

function countOpen(items: { status: string }[]): number {
  return items.filter(i => i.status !== "Answered").length
}

export default function Overview() {
  return (
    <div className="space-y-10 p-12 w-full min-w-0">
      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 w-full min-w-0">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} />
        ))}
      </div>

      {/* Gantt — wrapped in the same SectionCard treatment as every other
          section, instead of floating as its own unstyled layer. */}
      <SectionCard title="Cronograma">
        <div className="w-full min-w-0 overflow-hidden">
          <GanttChart />
        </div>
      </SectionCard>

      {/* Risks — surfaced above the fold since these need attention first */}
      {risks.length > 0 && (
        <RisksBanner risks={risks} />
      )}

      {/* Upcoming milestones + recent activity */}
      <div className="grid lg:grid-cols-2 gap-6 w-full min-w-0">
        <SectionCard title="Próximas etapas">
          {upcomingMilestones.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {upcomingMilestones.map((m) => {
                const overdue = isOverdue(m.date)
                return (
                  <div key={m.name} className="flex justify-between items-center py-3 gap-4">
                    <span className="text-sm text-slate-700">{m.name}</span>
                    <span className={`text-sm font-mono ${overdue ? "text-red-600 font-medium" : "text-slate-500"}`}>
                      {m.date}{overdue ? " · atrasado" : ""}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState message="Sem etapas próximas." />
          )}
        </SectionCard>

        <SectionCard title="Actividades recentes">
          {recentActivity.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentActivity.map((a) => (
                <div key={`${a.who}-${a.time}`} className="py-3">
                  <p className="text-sm text-slate-700">{a.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{a.who} · {a.time}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Sem actividade recente." />
          )}
        </SectionCard>
      </div>

      {/* RFIs + Submittals */}
      <div className="grid lg:grid-cols-2 gap-6 w-full min-w-0">
        <SectionCard title="RFIs" subtitle={`${countOpen(rfis)} em aberto`}>
          {rfis.length > 0 ? <TrackerList items={rfis} /> : <EmptyState message="Sem RFIs registados." />}
        </SectionCard>

        <SectionCard title="Submissões" subtitle={`${countOpen(submittals)} em aberto`}>
          {submittals.length > 0 ? <TrackerList items={submittals} /> : <EmptyState message="Sem submissões registadas." />}
        </SectionCard>
      </div>


      {/* Client approvals + Budget breakdown */}
      <div className="grid lg:grid-cols-2 gap-6 w-full min-w-0">
        <SectionCard title="Aprovações pendentes">
          {approvals.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {approvals.map((a) => {
                const overdue = isOverdue(a.date)
                return (
                  <div key={a.item} className="flex justify-between items-center py-3 gap-4">
                    <div className="min-w-0">
                      <p className="text-sm text-slate-700 truncate">{a.item}</p>
                      <p className="text-xs text-slate-400 mt-0.5">A aguardar {a.requestedFrom}</p>
                    </div>
                    <span className={`text-sm font-mono shrink-0 ${overdue ? "text-red-600 font-medium" : "text-slate-500"}`}>
                      {a.date}{overdue ? " · atrasado" : ""}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState message="Sem aprovações pendentes." />
          )}
        </SectionCard>

        <SectionCard title="Orçamento por fase">
          {budgetByPhase.length > 0 ? (
            <div className="space-y-4">
              {budgetByPhase.map((b) => {
                const pct = b.total > 0 ? Math.round((b.used / b.total) * 100) : 0;
                return (
                  <div key={b.phase}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-700">{b.phase}</span>
                      <span className="font-mono text-slate-500">
                        {formatCompactCurrency(b.used)} / {formatCompactCurrency(b.total)}
                      </span>
                    </div>
                    <ProgressBar percent={pct} overBudget={pct >= 100} />
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState message="Sem dados de orçamento." />
          )}
        </SectionCard>
      </div>
    </div>
  );
}

// ---- Local presentational components ----



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
        {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-sm text-slate-400">{message}</p>;
}

function ProgressBar({ percent, overBudget = false }: { percent: number; overBudget?: boolean }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div
      className="h-2 bg-slate-100 rounded-full overflow-hidden"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full ${overBudget ? "bg-red-500" : "bg-blue-700"}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

function TrackerList({
  items,
}: {
  items: { id: string; subject: string; status: string; due: string }[];
}) {
  return (
    <div className="divide-y divide-slate-100">
      {items.map((item) => (
        <div key={item.id} className="flex justify-between items-center py-3 gap-4">
          <div className="min-w-0">
            <p className="text-sm text-slate-700 truncate">
              <span className="font-mono text-slate-400 mr-2">{item.id}</span>
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

function RisksBanner({
  risks,
}: {
  risks: { text: string; severity: "high" | "medium" }[];
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-5 w-full min-w-0">
      <h2 className="font-semibold text-red-800 mb-3 text-sm">
        Requer atenção
      </h2>
      <div className="space-y-2">
        {risks.map((r, i) => (
          <div key={`${r.text}-${i}`} className="flex items-center gap-2 text-sm text-red-700">
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                r.severity === "high" ? "bg-red-600" : "bg-amber-500"
              }`}
            />
            {r.text}
          </div>
        ))}
      </div>
    </div>
  );
}