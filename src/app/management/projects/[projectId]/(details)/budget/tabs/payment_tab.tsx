import {
    ArrowDownLeft,
    CreditCard,
    Receipt,
} from "lucide-react";

import type {
    PaymentRecord,
    InvoicingSummary,
} from "../types"

import { StatCard } from "../components/stats_card";
import SectionHeader from "../components/section_header";
import EmptyState from "../components/empty_state";

interface PaymentsTabProps {
    payments: PaymentRecord[];
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

export default function PaymentsTab({
    payments,
    summary,
}: PaymentsTabProps) {
    const paymentRate =
        summary.invoiced > 0
            ? (summary.received / summary.invoiced) * 100
            : 0;

    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Total recebido"
                    value={currency.format(summary.received)}
                    icon={ArrowDownLeft} subtitle={""} />

                <StatCard
                    title="Por receber"
                    value={currency.format(summary.pending)}
                    icon={Receipt} subtitle={""} />

                <StatCard
                    title="Taxa de recebimento"
                    value={`${paymentRate.toFixed(1)}%`}
                    icon={CreditCard} subtitle={""} />
            </div>

            <div className="rounded-xl border bg-white p-6">
                <SectionHeader
                    title="Pagamentos recebidos"
                    description="Registo de pagamentos associados às facturas do projecto."
                />

                {payments.length === 0 ? (
                    <div className="mt-6">
                        <EmptyState
                            title="Sem pagamentos"
                            description="Ainda não existem pagamentos registados para este projecto."
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
                                        Data
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Método
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Referência
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Valor
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {payments.map((payment) => (
                                    <tr
                                        key={payment.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="px-4 py-4 font-medium">
                                            {payment.invoice?.invoice_number ||
                                                "—"}
                                        </td>

                                        <td className="px-4 py-4 text-muted-foreground">
                                            {dateFormatter.format(
                                                new Date(payment.payment_date),
                                            )}
                                        </td>

                                        <td className="px-4 py-4">
                                            {payment.payment_method || "—"}
                                        </td>

                                        <td className="px-4 py-4 text-muted-foreground">
                                            {payment.reference || "—"}
                                        </td>

                                        <td className="px-4 py-4 text-right font-semibold">
                                            {currency.format(payment.amount)}
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