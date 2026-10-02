"use client";

import { Download } from "lucide-react";
import type { AttendanceRecord, Profile } from "../types";
import { formatTime } from "../utils/attendance_dates";

type AttendanceExportProps = {
    profiles: Profile[];
    attendanceByProfile: Map<string, AttendanceRecord>;
    selectedDate: string;
};

export default function AttendanceExport({
    profiles,
    attendanceByProfile,
    selectedDate,
}: AttendanceExportProps) {
    function exportCsv() {
        const headers = [
            "Colaborador",
            "Área",
            "Cargo",
            "Entrada",
            "Saída",
            "Estado",
        ];

        const rows = profiles.map((profile) => {
            const record = attendanceByProfile.get(profile.profile_id);

            return [
                `${profile.first_name} ${profile.last_name}`.trim(),
                profile.department ?? "",
                profile.job_title ?? "",
                formatTime(record?.check_in ?? null),
                formatTime(record?.check_out ?? null),
                record?.status ?? "Em falta",
            ];
        });

        const escapeCsvValue = (value: string) =>
            `"${value.replaceAll('"', '""')}"`;

        const csv = [headers, ...rows]
            .map((row) => row.map(escapeCsvValue).join(","))
            .join("\r\n");

        const blob = new Blob(["\uFEFF", csv], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download = `presenca-${selectedDate}.csv`;

        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();

        URL.revokeObjectURL(url);
    }

    return (
        <button
            type="button"
            onClick={exportCsv}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-[#BD9655] hover:text-[#002950]"
            aria-label="Exportar presença em CSV"
        >
            <Download className="h-4 w-4" />
            Exportar
        </button>
    );
}