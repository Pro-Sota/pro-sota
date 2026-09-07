"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  Calculator,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  CreditCard,
  FileCheck2,
  FileText,
  FolderOpen,
  HardHat,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

type Tab =
  | "overview"
  | "budget"
  | "costs"
  | "invoices"
  | "payments"
  | "site"
  | "documents";

type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  trend?: string;
  trendType?: "up" | "down" | "neutral";
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    maximumFractionDigits: 0,
  }).format(value);

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = "neutral",
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>

          <h3 className="mt-2 truncate text-2xl font-semibold tracking-tight text-gray-900">
            {value}
          </h3>

          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
          <Icon size={20} />
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-1 text-xs">
          {trendType === "up" && (
            <ArrowUpRight size={14} className="text-green-600" />
          )}

          {trendType === "down" && (
            <ArrowDownRight size={14} className="text-red-500" />
          )}

          <span
            className={
              trendType === "up"
                ? "text-green-600"
                : trendType === "down"
                  ? "text-red-500"
                  : "text-gray-500"
            }
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
        <Icon size={22} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-gray-900">{title}</h3>

      <p className="mt-1 max-w-md text-sm text-gray-500">{description}</p>
    </div>
  );
}

export default function BudgetPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  /*
   * Temporary project data.
   *
   * Replace these values with data coming from Supabase.
   */
  const financialData = {
    approvedBudget: 12_500_000,
    contractedValue: 11_800_000,
    actualCost: 7_450_000,
    invoiced: 8_200_000,
    received: 6_500_000,
    pending: 1_700_000,
  };

  const budgetUsed = useMemo(() => {
    if (!financialData.approvedBudget) return 0;

    return Math.min(
      (financialData.actualCost / financialData.approvedBudget) * 100,
      100
    );
  }, [financialData]);

  const expectedMargin =
    financialData.contractedValue - financialData.actualCost;

  const expectedMarginPercentage =
    financialData.contractedValue > 0
      ? (expectedMargin / financialData.contractedValue) * 100
      : 0;

  const budgetDeviation =
    financialData.actualCost - financialData.approvedBudget;

  const tabs: {
    id: Tab;
    label: string;
    icon: React.ElementType;
  }[] = [
    {
      id: "overview",
      label: "Resumo",
      icon: BarChart3,
    },
    {
      id: "budget",
      label: "Orçamento",
      icon: Calculator,
    },
    {
      id: "costs",
      label: "Custos",
      icon: Wallet,
    },
    {
      id: "invoices",
      label: "Facturação",
      icon: Receipt,
    },
    {
      id: "payments",
      label: "Pagamentos",
      icon: CreditCard,
    },
    {
      id: "site",
      label: "Obra",
      icon: HardHat,
    },
    {
      id: "documents",
      label: "Documentos",
      icon: FolderOpen,
    },
  ];

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-[#F7F7F5]">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <BriefcaseBusiness size={15} />

              <span>Projecto</span>

              <ChevronRight size={14} />

              <span className="font-medium text-gray-700">Financeiro</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              Financeiro
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-gray-500 sm:text-base">
              Acompanhe o orçamento, custos, facturação, pagamentos e
              desempenho financeiro do projecto.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <FileText size={17} />
              Exportar
            </button>

            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800"
            >
              <Calculator size={17} />
              Nova revisão
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-7 overflow-x-auto">
          <div className="flex min-w-max gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition",
                    active
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                  ].join(" ")}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Financial stats */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                  title="Orçamento aprovado"
                  value={formatCurrency(financialData.approvedBudget)}
                  subtitle="Valor total aprovado"
                  icon={Calculator}
                />

                <StatCard
                  title="Valor contratado"
                  value={formatCurrency(financialData.contractedValue)}
                  subtitle="Valor adjudicado / contratado"
                  icon={BriefcaseBusiness}
                />

                <StatCard
                  title="Custo real"
                  value={formatCurrency(financialData.actualCost)}
                  subtitle="Custos registados até ao momento"
                  icon={Wallet}
                  trend={`${budgetUsed.toFixed(1)}% do orçamento utilizado`}
                  trendType="neutral"
                />

                <StatCard
                  title="Facturado"
                  value={formatCurrency(financialData.invoiced)}
                  subtitle="Total de facturas emitidas"
                  icon={Receipt}
                />

                <StatCard
                  title="Recebido"
                  value={formatCurrency(financialData.received)}
                  subtitle="Total efectivamente recebido"
                  icon={CircleDollarSign}
                  trend="Pagamentos recebidos"
                  trendType="up"
                />

                <StatCard
                  title="Pendente"
                  value={formatCurrency(financialData.pending)}
                  subtitle="Valor ainda por receber"
                  icon={Clock3}
                  trend="A acompanhar"
                  trendType="neutral"
                />
              </div>

              {/* Budget performance */}
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <SectionHeader
                    title="Orçamento vs. custo real"
                    description="Comparação entre o valor aprovado e os custos registados."
                  />

                  <div className="space-y-6">
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                        <span className="font-medium text-gray-700">
                          Orçamento aprovado
                        </span>

                        <span className="font-semibold text-gray-900">
                          {formatCurrency(financialData.approvedBudget)}
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full w-full rounded-full bg-gray-200" />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                        <span className="font-medium text-gray-700">
                          Custo real
                        </span>

                        <span className="font-semibold text-gray-900">
                          {formatCurrency(financialData.actualCost)}
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-orange-500 transition-all"
                          style={{ width: `${budgetUsed}%` }}
                        />
                      </div>

                      <div className="mt-2 flex justify-between text-xs text-gray-500">
                        <span>{budgetUsed.toFixed(1)}% utilizado</span>

                        <span>
                          Restante{" "}
                          {formatCurrency(
                            Math.max(
                              financialData.approvedBudget -
                                financialData.actualCost,
                              0
                            )
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Margin */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <SectionHeader
                    title="Margem estimada"
                    description="Estimativa com base no valor contratado e custo actual."
                  />

                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-orange-50">
                      <TrendingUp
                        size={30}
                        className="text-orange-600"
                      />
                    </div>

                    <div>
                      <p className="text-3xl font-semibold text-gray-900">
                        {expectedMarginPercentage.toFixed(1)}%
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Margem estimada
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl bg-gray-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-gray-500">
                        Resultado estimado
                      </span>

                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(expectedMargin)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial alerts */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <SectionHeader
                  title="Indicadores financeiros"
                  description="Pontos que merecem acompanhamento."
                />

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600">
                        <TrendingDown size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Controlo de custos
                        </p>

                        <p className="text-xs text-gray-500">
                          Custos abaixo do orçamento aprovado.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                        <Clock3 size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Recebimentos pendentes
                        </p>

                        <p className="text-xs text-gray-500">
                          Existem valores por receber.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <ClipboardCheck size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Revisões
                        </p>

                        <p className="text-xs text-gray-500">
                          Nenhuma revisão pendente de aprovação.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent activity */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <SectionHeader
                  title="Actividade financeira"
                  description="Últimos movimentos associados ao projecto."
                />

                <div className="divide-y divide-gray-100">
                  {[
                    {
                      title: "Factura #FT-2026-004",
                      description: "Factura emitida",
                      value: "+ 1.200.000 Kz",
                      date: "Hoje",
                    },
                    {
                      title: "Pagamento recebido",
                      description: "Transferência bancária",
                      value: "+ 850.000 Kz",
                      date: "Ontem",
                    },
                    {
                      title: "Custo de materiais",
                      description: "Fornecedor de materiais",
                      value: "- 420.000 Kz",
                      date: "22 Ago 2026",
                    },
                    {
                      title: "Revisão do orçamento",
                      description: "Revisão #03 aprovada",
                      value: "12.500.000 Kz",
                      date: "20 Ago 2026",
                    },
                  ].map((item) => (
                    <div
                      key={`${item.title}-${item.date}`}
                      className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                          <FileCheck2 size={17} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {item.title}
                          </p>

                          <p className="text-xs text-gray-500">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-6 sm:justify-end">
                        <span className="text-xs text-gray-400">
                          {item.date}
                        </span>

                        <span className="text-sm font-semibold text-gray-900">
                          {item.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "budget" && (
            <div className="space-y-6">
              <SectionHeader
                title="Orçamento"
                description="Gerir propostas, revisões, quantidades, preços e alterações ao orçamento."
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Orçamento inicial"
                  value={formatCurrency(10_800_000)}
                  subtitle="Proposta inicial"
                  icon={FileText}
                />

                <StatCard
                  title="Orçamento aprovado"
                  value={formatCurrency(financialData.approvedBudget)}
                  subtitle="Última versão aprovada"
                  icon={FileCheck2}
                />

                <StatCard
                  title="Trabalhos a mais"
                  value={formatCurrency(1_250_000)}
                  subtitle="Alterações aprovadas"
                  icon={ArrowUpRight}
                />

                <StatCard
                  title="Trabalhos a menos"
                  value={formatCurrency(320_000)}
                  subtitle="Reduções aprovadas"
                  icon={ArrowDownRight}
                />
              </div>

              <EmptyState
                icon={Calculator}
                title="Mapa de quantidades"
                description="Aqui será apresentado o detalhe dos itens do orçamento, quantidades, preços unitários, totais e respectivas revisões."
              />
            </div>
          )}

          {activeTab === "costs" && (
            <div className="space-y-6">
              <SectionHeader
                title="Custos"
                description="Acompanhe os custos previstos e reais por fase, categoria e fornecedor."
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Custo total"
                  value={formatCurrency(financialData.actualCost)}
                  subtitle="Custos registados"
                  icon={Wallet}
                />

                <StatCard
                  title="Materiais"
                  value={formatCurrency(2_850_000)}
                  subtitle="Materiais e acabamentos"
                  icon={BriefcaseBusiness}
                />

                <StatCard
                  title="Mão de obra"
                  value={formatCurrency(2_100_000)}
                  subtitle="Custos de execução"
                  icon={HardHat}
                />

                <StatCard
                  title="Outros custos"
                  value={formatCurrency(2_500_000)}
                  subtitle="Outras despesas"
                  icon={CircleDollarSign}
                />
              </div>

              <EmptyState
                icon={Wallet}
                title="Registo de custos"
                description="Adicione e acompanhe despesas, fornecedores, materiais, mão de obra e outros custos associados ao projecto."
              />
            </div>
          )}

          {activeTab === "invoices" && (
            <div className="space-y-6">
              <SectionHeader
                title="Facturação"
                description="Controle as facturas emitidas, pagas e pendentes."
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                  title="Facturado"
                  value={formatCurrency(financialData.invoiced)}
                  subtitle="Total emitido"
                  icon={Receipt}
                />

                <StatCard
                  title="Recebido"
                  value={formatCurrency(financialData.received)}
                  subtitle="Total recebido"
                  icon={CircleDollarSign}
                />

                <StatCard
                  title="Pendente"
                  value={formatCurrency(financialData.pending)}
                  subtitle="Por receber"
                  icon={Clock3}
                  trend="Requer acompanhamento"
                  trendType="neutral"
                />
              </div>

              <EmptyState
                icon={Receipt}
                title="Facturas do projecto"
                description="Aqui serão listadas as facturas, respectivas datas, valores, vencimentos, estado e documentos associados."
              />
            </div>
          )}

          {activeTab === "payments" && (
            <div className="space-y-6">
              <SectionHeader
                title="Pagamentos"
                description="Acompanhe os pagamentos recebidos e os movimentos financeiros do projecto."
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                  title="Total recebido"
                  value={formatCurrency(financialData.received)}
                  subtitle="Pagamentos confirmados"
                  icon={CreditCard}
                />

                <StatCard
                  title="Por receber"
                  value={formatCurrency(financialData.pending)}
                  subtitle="Pagamentos pendentes"
                  icon={Clock3}
                />

                <StatCard
                  title="Taxa de recebimento"
                  value={`${((financialData.received / financialData.invoiced) * 100).toFixed(1)}%`}
                  subtitle="Facturado vs. recebido"
                  icon={TrendingUp}
                />
              </div>

              <EmptyState
                icon={CreditCard}
                title="Histórico de pagamentos"
                description="Registe pagamentos, datas, métodos de pagamento, referências bancárias e documentos comprovativos."
              />
            </div>
          )}

          {activeTab === "site" && (
            <div className="space-y-6">
              <SectionHeader
                title="Obra e fiscalização"
                description="Registos técnicos e administrativos relacionados com a execução da obra."
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    title: "Autos de medição",
                    description: "Medições e trabalhos executados.",
                    icon: ClipboardCheck,
                  },
                  {
                    title: "Relatórios de obra",
                    description: "Relatórios de acompanhamento.",
                    icon: FileText,
                  },
                  {
                    title: "Ocorrências",
                    description: "Incidentes e situações registadas.",
                    icon: HardHat,
                  },
                  {
                    title: "Não conformidades",
                    description: "Problemas e acções correctivas.",
                    icon: FileCheck2,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.title}
                      type="button"
                      className="group rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-gray-300 hover:shadow"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                        <Icon size={20} />
                      </div>

                      <h3 className="mt-4 text-sm font-semibold text-gray-900">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        {item.description}
                      </p>

                      <div className="mt-4 flex items-center gap-1 text-xs font-medium text-gray-500 transition group-hover:text-gray-900">
                        Ver registos
                        <ChevronRight size={14} />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <EmptyState
                  icon={HardHat}
                  title="Diário de obra"
                  description="Registe actividades, equipas, condições da obra, materiais, equipamentos e acontecimentos diários."
                />

                <EmptyState
                  icon={FileText}
                  title="Pedidos de esclarecimento"
                  description="Controle pedidos, respostas, responsáveis, prazos e documentação associada."
                />
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-6">
              <SectionHeader
                title="Documentos financeiros"
                description="Documentos associados ao orçamento, execução e facturação do projecto."
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    title: "Propostas",
                    description: "Propostas comerciais e versões submetidas.",
                    icon: FileText,
                  },
                  {
                    title: "Contratos",
                    description: "Contratos e documentos de adjudicação.",
                    icon: FileCheck2,
                  },
                  {
                    title: "Autos",
                    description: "Autos de medição e documentos de obra.",
                    icon: ClipboardCheck,
                  },
                  {
                    title: "Facturas",
                    description: "Facturas emitidas e recebidas.",
                    icon: Receipt,
                  },
                  {
                    title: "Recibos",
                    description: "Recibos e comprovativos de pagamento.",
                    icon: CreditCard,
                  },
                  {
                    title: "Outros documentos",
                    description: "Documentos financeiros adicionais.",
                    icon: FolderOpen,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.title}
                      type="button"
                      className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-gray-300 hover:shadow"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                        <Icon size={20} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {item.title}
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          {item.description}
                        </p>
                      </div>

                      <ChevronRight
                        size={17}
                        className="ml-auto shrink-0 text-gray-400"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer information */}
        <div className="mt-8 flex flex-col gap-2 border-t border-gray-200 py-5 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Informação financeira do projecto
          </span>

          <span>
            Última actualização: Hoje
          </span>
        </div>
      </div>
    </div>
  );
}