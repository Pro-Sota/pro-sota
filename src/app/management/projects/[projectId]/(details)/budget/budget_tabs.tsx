"use client";

import { useEffect, useState } from "react";
import { Wallet, BriefcaseBusiness, HardHat, CircleDollarSign } from "lucide-react";

import { getProjectCosts, getCostsByCategory } from "@/services/budget";
import { StatCard, SectionHeader, EmptyState, LoadingGrid } from "./components";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    maximumFractionDigits: 0,
  }).format(value);

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function CostsTab({ projectId }: { projectId: string }) {
  const [costs, setCosts] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [costsData, summaryData] = await Promise.all([
        getProjectCosts(projectId),
        getCostsByCategory(projectId),
      ]);

      setCosts(costsData);
      setSummary(summaryData);
      setLoading(false);
    };

    loadData();
  }, [projectId]);

  if (loading) return <LoadingGrid />;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Custos"
        description="Acompanhe os custos previstos e reais por fase, categoria e fornecedor."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Custo total"
          value={formatCurrency(summary?.total || 0)}
          subtitle="Custos registados"
          icon={Wallet}
        />

        <StatCard
          title="Materiais"
          value={formatCurrency(summary?.materials || 0)}
          subtitle="Materiais e acabamentos"
          icon={BriefcaseBusiness}
        />

        <StatCard
          title="Mão de obra"
          value={formatCurrency(summary?.labor || 0)}
          subtitle="Custos de execução"
          icon={HardHat}
        />

        <StatCard
          title="Outros custos"
          value={formatCurrency(summary?.other || 0)}
          subtitle="Outras despesas"
          icon={CircleDollarSign}
        />
      </div>

      {costs.length > 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionHeader
            title="Registo de custos"
            description="Detalhe dos custos registados no projecto."
          />

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Data</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Descrição</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Categoria</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Fornecedor</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {costs.map((cost) => (
                  <tr key={cost.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{formatDate(cost.date)}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{cost.description}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          cost.category === "materials"
                            ? "bg-purple-100 text-purple-700"
                            : cost.category === "labor"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {cost.category === "materials" && "Materiais"}
                        {cost.category === "labor" && "Mão de obra"}
                        {cost.category === "other" && "Outros"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{cost.supplier || "-"}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {formatCurrency(cost.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Wallet}
          title="Registo de custos"
          description="Adicione e acompanhe despesas, fornecedores, materiais, mão de obra e outros custos associados ao projecto."
        />
      )}
    </div>
  );
}