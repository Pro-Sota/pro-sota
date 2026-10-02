import type { AttendanceStatus } from "@/services/attendance";

type LegendItem = {
    status: AttendanceStatus;
    label: string;
    className: string;
};

const items: LegendItem[] = [
    {
        status: "Presente",
        label: "Presente",
        className: "bg-emerald-500",
    },
    {
        status: "Atrasado",
        label: "Atrasado",
        className: "bg-amber-500",
    },
    {
        status: "Ausente",
        label: "Ausente",
        className: "bg-red-500",
    },
    {
        status: "Em falta",
        label: "Sem registo",
        className: "border border-slate-300 bg-white",
    },
];

export default function AttendanceLegend() {
    return (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-200 px-5 py-4">
            {items.map((item) => (
                <div
                    key={item.status}
                    className="flex items-center gap-2 text-xs text-slate-500"
                >
                    <span
                        className={`h-2.5 w-2.5 rounded-full ${item.className}`}
                        aria-hidden="true"
                    />
                    <span>{item.label}</span>
                </div>
            ))}

            <div className="flex items-center gap-2 text-xs text-slate-500">
                <span
                    className="h-2 w-2 rounded-full bg-slate-100"
                    aria-hidden="true"
                />
                <span>Data futura</span>
            </div>
        </div>
    );
}