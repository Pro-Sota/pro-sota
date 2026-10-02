import {
    CheckCircle2,
    Clock3,
    UserX,
    Users,
    XCircle,
} from "lucide-react";
import type { AttendanceSummary } from "../types";

type AttendanceStatsProps = {
    summary: AttendanceSummary;
};

export default function AttendanceStats({
    summary,
}: AttendanceStatsProps) {
    const cards = [
        {
            label: "Equipa",
            value: summary.total,
            icon: Users,
            iconClass: "text-[#BD9655]",
        },
        {
            label: "Presentes",
            value: summary.present,
            icon: CheckCircle2,
            iconClass: "text-emerald-600",
        },
        {
            label: "Atrasados",
            value: summary.late,
            icon: Clock3,
            iconClass: "text-amber-600",
        },
        {
            label: "Ausentes",
            value: summary.absent,
            icon: UserX,
            iconClass: "text-red-500",
        },
        {
            label: "Em falta",
            value: summary.missing,
            icon: XCircle,
            iconClass: "text-slate-400",
        },
    ];

    const attendanceRate =
        summary.total > 0
            ? Math.round(
                  (summary.present / summary.total) * 100,
              )
            : 0;

    return (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {cards.map(
                ({
                    label,
                    value,
                    icon: Icon,
                    iconClass,
                }) => (
                    <div
                        key={label}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm text-slate-500">
                                {label}
                            </span>

                            <Icon
                                className={`h-5 w-5 shrink-0 ${iconClass}`}
                                aria-hidden="true"
                            />
                        </div>

                        <p className="mt-3 text-2xl font-semibold text-[#002950]">
                            {value}
                        </p>

                        {label === "Presentes" &&
                            summary.total > 0 && (
                                <p className="mt-1 text-xs text-slate-400">
                                    {attendanceRate}% da equipa
                                </p>
                            )}
                    </div>
                ),
            )}
        </div>
    );
}