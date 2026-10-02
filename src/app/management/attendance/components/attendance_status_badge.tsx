import type { AttendanceStatus } from "@/services/attendance";

const labels: Record<AttendanceStatus, string> = {
    Presente: "Presente",
    Atrasado: "Atrasado",
    Ausente: "Ausente",
    "Em falta": "Em falta",
};

const classes: Record<AttendanceStatus, string> = {
    Presente:
        "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
    Atrasado:
        "bg-amber-50 text-amber-700 ring-amber-600/10",
    Ausente:
        "bg-red-50 text-red-700 ring-red-600/10",
    "Em falta":
        "bg-slate-100 text-slate-600 ring-slate-500/10",
};

const dots: Record<AttendanceStatus, string> = {
    Presente: "bg-emerald-500",
    Atrasado: "bg-amber-500",
    Ausente: "bg-red-500",
    "Em falta": "bg-slate-400",
};

type AttendanceStatusBadgeProps = {
    status: AttendanceStatus;
};

export default function AttendanceStatusBadge({
    status,
}: AttendanceStatusBadgeProps) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${classes[status]}`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${dots[status]}`}
                aria-hidden="true"
            />
            {labels[status]}
        </span>
    );
}