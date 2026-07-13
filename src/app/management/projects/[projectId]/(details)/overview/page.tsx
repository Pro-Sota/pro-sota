import KpiCard from "./components/kpi_card";
import GanttChart from "@/app/components/gantt";

const kpis = [
  { title: "Progress", value: "30" },
  { title: "Days remaining", value: "30" },
  { title: "Budget used", value: "$120k" },
  { title: "Open issues", value: "10" },
  { title: "Completed tasks", value: "100 / 200" },
  { title: "Pending approvals", value: "7" },
];

const tasks = [
  {
    start: new Date(2026, 6, 1),
    end: new Date(2026, 6, 5),
    name: "Task 1",
    id: "1",
    type: "task" as const,
    progress: 50,
    isDisabled: false,
  },
  {
    start: new Date(2026, 6, 1),
    end: new Date(2026, 6, 5),
    name: "Task 2",
    id: "2",
    type: "task" as const,
    progress: 50,
    isDisabled: false,
  },
  {
    start: new Date(2026, 8, 1),
    end: new Date(2026, 8, 5),
    name: "Task 3",
    id: "3",
    type: "task" as const,
    progress: 50,
    isDisabled: false,
  },
  {
    start: new Date(2026, 7, 1),
    end: new Date(2026, 7, 5),
    name: "Task 4",
    id: "4",
    type: "task" as const,
    progress: 50,
    isDisabled: true,
  },
];

// ---- New overview data ----

const upcomingMilestones = [
  { name: "Permit submission", date: "Jul 18, 2026" },
  { name: "Client design review", date: "Jul 22, 2026" },
  { name: "Tender package due", date: "Aug 15, 2026" },
];

const recentActivity = [
  { text: "A-201 Floor Plans revised to Rev C", who: "M. Alves", time: "2h ago" },
  { text: "RFI-014 answered by structural engineer", who: "J. Costa", time: "5h ago" },
  { text: "Client approved kitchen elevations", who: "Client", time: "Yesterday" },
  { text: "New comment on MEP coordination drawing", who: "R. Silva", time: "Yesterday" },
];

const rfis = [
  { id: "RFI-017", subject: "Steel beam clash at gridline C4", status: "Overdue", due: "Jul 08, 2026" },
  { id: "RFI-016", subject: "Ceiling height in lobby", status: "Open", due: "Jul 15, 2026" },
  { id: "RFI-015", subject: "Window frame finish confirmation", status: "Open", due: "Jul 17, 2026" },
  { id: "RFI-014", subject: "Structural clash at column B2", status: "Answered", due: "Jul 10, 2026" },
];

const submittals = [
  { id: "SUB-042", subject: "Curtain wall shop drawings", status: "Overdue", due: "Jul 09, 2026" },
  { id: "SUB-041", subject: "Elevator specifications", status: "Open", due: "Jul 19, 2026" },
  { id: "SUB-040", subject: "Fire-rated door schedule", status: "Answered", due: "Jul 05, 2026" },
];

const drawings = [
  { code: "A-101", name: "Ground floor plan", rev: "C", status: "For review" },
  { code: "A-201", name: "Elevations", rev: "C", status: "Issued" },
  { code: "S-301", name: "Structural framing plan", rev: "B", status: "Superseded" },
  { code: "M-401", name: "MEP layout", rev: "A", status: "Issued" },
];

const consultants = [
  { discipline: "Structural", status: "Coordinated" },
  { discipline: "MEP", status: "Pending" },
  { discipline: "Civil", status: "Coordinated" },
  { discipline: "Landscape", status: "Conflict" },
];

const approvals = [
  { item: "Kitchen elevations", requestedFrom: "Client", date: "Jul 11, 2026" },
  { item: "Facade material sample", requestedFrom: "Client", date: "Jul 12, 2026" },
  { item: "Structural steel spec", requestedFrom: "Structural engineer", date: "Jul 13, 2026" },
];

const budgetByPhase = [
  { phase: "Concept Design", used: 25000, total: 25000 },
  { phase: "Schematic Design", used: 40000, total: 40000 },
  { phase: "Technical Design", used: 55000, total: 85000 },
  { phase: "Tender", used: 0, total: 15000 },
];

const risks = [
  { text: "Curtain wall shop drawings overdue by 4 days", severity: "high" as const },
  { text: "Landscape consultant coordination unresolved", severity: "high" as const },
  { text: "MEP layout awaiting structural sign-off", severity: "medium" as const },
];

export default function Overview() {
  return (
    <div className="space-y-10 px-4 w-full min-w-0 py-4 mt-4">
      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 w-full min-w-0">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} />
        ))}
      </div>

      {/* Gantt */}
      <div className="w-full min-w-0 overflow-hidden">
        <GanttChart />
      </div>

      {/* Risks — surfaced above the fold since these need attention first */}
      {risks.length > 0 && (
        <RisksBanner risks={risks} />
      )}

      {/* Upcoming milestones + recent activity */}
      <div className="grid lg:grid-cols-2 gap-6 w-full min-w-0">
        <SectionCard title="Upcoming milestones">
          <div className="divide-y divide-slate-100">
            {upcomingMilestones.map((m) => (
              <div key={m.name} className="flex justify-between items-center py-3">
                <span className="text-sm text-slate-700">{m.name}</span>
                <span className="text-sm font-mono text-slate-500">{m.date}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent activity">
          <div className="divide-y divide-slate-100">
            {recentActivity.map((a, i) => (
              <div key={i} className="py-3">
                <p className="text-sm text-slate-700">{a.text}</p>
                <p className="text-xs text-slate-400 mt-0.5">{a.who} · {a.time}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* RFIs + Submittals */}
      <div className="grid lg:grid-cols-2 gap-6 w-full min-w-0">
        <SectionCard title="RFIs" subtitle={`${rfis.filter(r => r.status !== "Answered").length} open`}>
          <TrackerList items={rfis} />
        </SectionCard>

        <SectionCard title="Submittals" subtitle={`${submittals.filter(s => s.status !== "Answered").length} open`}>
          <TrackerList items={submittals} />
        </SectionCard>
      </div>

      {/* Drawing register + Consultant coordination */}
      <div className="grid lg:grid-cols-2 gap-6 w-full min-w-0">
        <SectionCard title="Drawing register">
          <div className="divide-y divide-slate-100">
            {drawings.map((d) => (
              <div key={d.code} className="flex justify-between items-center py-3">
                <div>
                  <span className="text-sm font-mono text-slate-500 mr-2">{d.code}</span>
                  <span className="text-sm text-slate-700">{d.name}</span>
                  <span className="text-xs text-slate-400 ml-2">Rev {d.rev}</span>
                </div>
                <StatusPill status={d.status} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Consultant coordination">
          <div className="grid grid-cols-2 gap-3">
            {consultants.map((c) => (
              <div key={c.discipline} className="flex justify-between items-center border border-slate-100 rounded-lg px-3 py-2.5">
                <span className="text-sm text-slate-700">{c.discipline}</span>
                <StatusPill status={c.status} />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Client approvals + Budget breakdown */}
      <div className="grid lg:grid-cols-2 gap-6 w-full min-w-0">
        <SectionCard title="Pending approvals">
          <div className="divide-y divide-slate-100">
            {approvals.map((a) => (
              <div key={a.item} className="flex justify-between items-center py-3">
                <div>
                  <p className="text-sm text-slate-700">{a.item}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Awaiting {a.requestedFrom}</p>
                </div>
                <span className="text-sm font-mono text-slate-500">{a.date}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Budget by phase">
          <div className="space-y-4">
            {budgetByPhase.map((b) => {
              const pct = b.total > 0 ? Math.round((b.used / b.total) * 100) : 0;
              return (
                <div key={b.phase}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-700">{b.phase}</span>
                    <span className="font-mono text-slate-500">
                      ${(b.used / 1000).toFixed(0)}k / ${(b.total / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct >= 100 ? "bg-red-500" : "bg-blue-700"}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
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

function statusColors(status: string) {
  switch (status) {
    case "Completed":
    case "Answered":
    case "Coordinated":
    case "Issued":
      return "bg-green-50 text-green-700 border-green-200";
    case "Open":
    case "For review":
    case "Pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Overdue":
    case "Conflict":
      return "bg-red-50 text-red-700 border-red-200";
    case "Superseded":
    default:
      return "bg-slate-50 text-slate-500 border-slate-200";
  }
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border h-fit ${statusColors(status)}`}>
      {status}
    </span>
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
            <p className="text-xs text-slate-400 mt-0.5">Due {item.due}</p>
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
        Needs attention
      </h2>
      <div className="space-y-2">
        {risks.map((r, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-red-700">
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