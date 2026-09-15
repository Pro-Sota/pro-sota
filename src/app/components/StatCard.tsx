"use client";
export function StatCard({
  icon, title, value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="rounded-lg bg-gray-100 p-2 text-gray-700">{icon}</span>
      </div>
      <p className="mt-5 text-sm text-gray-500">{title}</p>
      <h2 className="mt-1 text-3xl text-[#002950] font-bold">{value}</h2>
    </div>
  );
}
