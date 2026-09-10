import {
    CircleCheck,
    Clock3,
    FileText,
    TriangleAlert,
} from "lucide-react";

import type {
    ProjectInvoice,
    InvoicingSummary,
} from "../types";

import { StatCard } from "../components/stats_card";
import SectionHeader from "../components/section_header";
import EmptyState from "../components/empty_state";

interface InvoicesTabProps {
    invoices: ProjectInvoice[];
    summary: InvoicingSummary;
}

const currency = new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("pt-AO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
});

const statusLabels = {
    pending: "Pendente",
    paid: "Paga",
    overdue: "Vencida",
};

export default function InvoicesTab({
    invoices,
    summary,
}: InvoicesTabProps) {
    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Total facturado"
                    value={currency.format(summary.invoiced)}
                    icon={FileText} subtitle={""} />

                <StatCard
                    title="Facturas pagas"
                    value={currency.format(summary.paid)}
                    icon={CircleCheck} subtitle={""} />

                <StatCard
                    title="Por receber"
                    value={currency.format(summary.pending)}
                    icon={Clock3} subtitle={""} />
            </div>

            <div className="rounded-xl border bg-white p-6">
                <SectionHeader
                    title="Facturas"
                    description="Facturação emitida para este projecto."
                />

                {invoices.length === 0 ? (
                    <div className="mt-6">
                        <EmptyState
                            title="Sem facturas"
                            description="Ainda não existem facturas registadas para este projecto."
                        />
                    </div>
                ) : (
                    <div className="mt-6 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="px-4 py-3 font-medium">
                                        Factura
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Emissão
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Vencimento
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Estado
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Valor
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {invoices.map((invoice) => (
                                    <tr
                                        key={invoice.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="px-4 py-4 font-medium">
                                            {invoice.invoice_number}
                                        </td>

                                        <td className="px-4 py-4 text-muted-foreground">
                                            {dateFormatter.format(
                                                new Date(invoice.issued_date),
                                            )}
                                        </td>

                                        <td className="px-4 py-4 text-muted-foreground">
                                            {dateFormatter.format(
                                                new Date(invoice.due_date),
                                            )}
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                {invoice.status === "overdue" && (
                                                    <TriangleAlert className="h-4 w-4 text-red-500" />
                                                )}

                                                {invoice.status === "paid" && (
                                                    <CircleCheck className="h-4 w-4 text-green-600" />
                                                )}

                                                {invoice.status === "pending" && (
                                                    <Clock3 className="h-4 w-4 text-amber-500" />
                                                )}

                                                {statusLabels[invoice.status]}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 text-right font-semibold">
                                            {currency.format(invoice.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}