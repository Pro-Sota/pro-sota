import {
    AlertCircle,
    Clock3,
    LogIn,
    LogOut,
} from "lucide-react";

import type { AttendanceAttention as Attention } from "../types";

type AttentionStatus =
    | "Em falta"
    | "Atrasado"
    | "Sem saída";

type Props = {
    attention: Attention;
    onStatusClick?: (status: AttentionStatus) => void;
};

export default function AttendanceAttention({
    attention,
    onStatusClick,
}: Props) {
    const total =
        attention.missingCheckIns +
        attention.lateArrivals +
        attention.missingCheckouts;

    if (total === 0) {
        return null;
    }

    return (
        <section
            className="mb-4 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/60"
            aria-labelledby="attendance-attention-title"
        >
            <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3">
                    <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 ring-1 ring-amber-200"
                        aria-hidden="true"
                    >
                        <AlertCircle className="h-4 w-4" />
                    </div>

                    <div>
                        <h2
                            id="attendance-attention-title"
                            className="text-sm font-semibold text-[#002950]"
                        >
                            Requer atenção
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Existem registos de presença que ainda precisam
                            de ser tratados.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {attention.missingCheckIns > 0 && (
                        <button
                            type="button"
                            onClick={() =>
                                onStatusClick?.("Em falta")
                            }
                            aria-label={`Ver ${attention.missingCheckIns} registos sem entrada`}
                            className="inline-flex items-center gap-2 rounded-lg border border-white bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-amber-200 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-1"
                        >
                            <LogIn
                                className="h-3.5 w-3.5 text-slate-500"
                                aria-hidden="true"
                            />

                            {attention.missingCheckIns} sem entrada
                        </button>
                    )}

                    {attention.lateArrivals > 0 && (
                        <button
                            type="button"
                            onClick={() =>
                                onStatusClick?.("Atrasado")
                            }
                            aria-label={`Ver ${attention.lateArrivals} chegada${attention.lateArrivals === 1 ? "" : "s"} atrasada${attention.lateArrivals === 1 ? "" : "s"}`}
                            className="inline-flex items-center gap-2 rounded-lg border border-white bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-amber-200 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-1"
                        >
                            <Clock3
                                className="h-3.5 w-3.5 text-amber-600"
                                aria-hidden="true"
                            />

                            {attention.lateArrivals} atrasado
                            {attention.lateArrivals === 1 ? "" : "s"}
                        </button>
                    )}

                    {attention.missingCheckouts > 0 && (
                        <button
                            type="button"
                            onClick={() =>
                                onStatusClick?.("Sem saída")
                            }
                            aria-label={`Ver ${attention.missingCheckouts} registos sem saída`}
                            className="inline-flex items-center gap-2 rounded-lg border border-white bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-amber-200 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-1"
                        >
                            <LogOut
                                className="h-3.5 w-3.5 text-slate-500"
                                aria-hidden="true"
                            />

                            {attention.missingCheckouts} sem saída
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}