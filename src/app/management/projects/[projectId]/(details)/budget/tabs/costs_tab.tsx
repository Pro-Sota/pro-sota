import {
    BriefcaseBusiness,
    CircleDollarSign,
    Package,
    Users,
} from "lucide-react";

import type {
    ProjectCost,
    CostsSummary,
} from "../types";

import { StatCard } from "../components/stats_card";
import SectionHeader from "../components/section_header";
import EmptyState from "../components/empty_state";

interface CostsTabProps {
    costs: ProjectCost[];
    summary: CostsSummary;
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

const categoryLabels = {
    materials: "Materiais",
    labor: "Mão de obra",
    other: "Outros",
};

export default function CostsTab({
    costs,
    summary,
}: CostsTabProps) {
    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Total de custos"
                    value={currency.format(summary.total)}
                    icon={CircleDollarSign} subtitle={""} />

                <StatCard
                    title="Materiais"
                    value={currency.format(summary.materials)}
                    icon={Package} subtitle={""} />

                <StatCard
                    title="Mão de obra"
                    value={currency.format(summary.labor)}
                    icon={Users} subtitle={""} />

                <StatCard
                    title="Outros"
                    value={currency.format(summary.other)}
                    icon={BriefcaseBusiness} subtitle={""} />
            </div>

            <div className="rounded-xl border bg-white p-6">
                <SectionHeader
                    title="Registo de custos"
                    description="Custos efectivamente registados no projecto."
                />

                {costs.length === 0 ? (
                    <div className="mt-6">
                        <EmptyState
                            title="Sem custos registados"
                            description="Quando forem registados custos neste projecto, eles aparecerão aqui."
                        />
                    </div>
                ) : (
                    <div className="mt-6 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="px-4 py-3 font-medium">
                                        Descrição
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Categoria
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Fornecedor
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Data
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Valor
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {costs.map((cost) => (
                                    <tr
                                        key={cost.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="px-4 py-4">
                                            <p className="font-medium">
                                                {cost.description}
                                            </p>

                                            {cost.notes && (
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {cost.notes}
                                                </p>
                                            )}
                                        </td>

                                        <td className="px-4 py-4">
                                            {categoryLabels[cost.category]}
                                        </td>

                                        <td className="px-4 py-4 text-muted-foreground">
                                            {cost.supplier || "—"}
                                        </td>

                                        <td className="px-4 py-4 text-muted-foreground">
                                            {dateFormatter.format(
                                                new Date(cost.date),
                                            )}
                                        </td>

                                        <td className="px-4 py-4 text-right font-semibold">
                                            {currency.format(cost.amount)}
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