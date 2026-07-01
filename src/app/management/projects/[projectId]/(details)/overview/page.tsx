import Timeline from "@/components/timeline";
import KpiCard from "./components/kpi_card";



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
    id: "1",
    name: "Site Analysis",
    start: "2026-07-01",
    end: "2026-07-05",
    progress: 40
  },
  {
  id: "2",
  name: "Site Visits",
  start:"2026-07-06",
  end: "2026-07-10",
  progress: 40
}
]

export default function Overview() {
  return (
    <div className="space-y-10 px-4 md:px-8 overflow-x-hidden w-full max-w-full">
      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 w-full min-w-0">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} />
        ))}
      </div>

      {/* Timeline */}
      <div className="w-full max-w-full overflow-hidden min-w-0">
        <Timeline />
      </div>
    </div>
  );
}
