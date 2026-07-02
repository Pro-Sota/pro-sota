import KpiCard from "./components/kpi_card";
import GanttChart from "@/components/gantt";

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

export default function Overview() {
  return (
    <div className="space-y-10 px-4 md:px-8 w-full min-w-0 overflow-x-hidden">
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
    </div>
  );
}