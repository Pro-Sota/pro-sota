import { LucideIcon } from "lucide-react";

export default function KpiCard({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) {

  const hasPercentage = ["progress"].includes(title.toLowerCase())
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-center justify-between ">
        <span className="rounded-lg bg-slate-100 p-2 text-slate-600">{icon}</span>
      </div>
      <p className="mt-5 text-sm text-gray-500">{title}</p>
      <h2 className="mt-1 text-2xl font-bold">{value}</h2>
    </div>
  );
}
