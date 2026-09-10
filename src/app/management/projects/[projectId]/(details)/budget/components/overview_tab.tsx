import {
  CircleDollarSign,
  CreditCard,
  FileText,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import type {BudgetPageData}  from "../types";
import {StatCard} from "./stats_card";
import SectionHeader from "./section_header";
import EmptyState from "./empty_state";

interface OverviewTabProps {
  data: BudgetPageData;
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

export default function OverviewTab({
  data,
}: OverviewTabProps) {
  const budget = data.budget;
  const metrics = data.metrics;

  if (!budget || !metrics) {
    return (
      <EmptyState
        title="Sem dados financeiros"
        description="Este projecto ainda não possui um orçamento financeiro configurado."
      />
    );
  }

  const budgetUsed = Math.min(
    Math.max(metrics.budgetUsed, 0),
    100,
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Orçamento aprovado"
          value={currency.format(
            budget.approved_budget
          )}
          icon={Wallet} subtitle={""}        />

        <StatCard
          title="Valor contratado"
          value={currency.format(
            budget.contracted_value
          )}
          icon={CircleDollarSign} subtitle={""}        />

        <StatCard
          title="Custos realizados"
          value={currency.format(
            metrics.totalCosts
          )}
          icon={CreditCard} subtitle={""}        />

        <StatCard
          title="Facturado"
          value={currency.format(
            metrics.totalInvoiced
          )}
          icon={FileText} subtitle={""}        />

        <StatCard
          title="Recebido"
          value={currency.format(
            metrics.totalReceived
          )}
          icon={TrendingUp} subtitle={""}        />

        <StatCard
          title="Por receber"
          value={currency.format(
            metrics.totalPending
          )}
          icon={TrendingDown} subtitle={""}        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6">
          <SectionHeader
            title="Execução do orçamento"
            description="Custos realizados em relação ao orçamento aprovado."
          />

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Utilização
              </span>

              <span className="font-medium">
                {budgetUsed.toFixed(1)}%
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-orange-500 transition-all"
                style={{
                  width: `${budgetUsed}%`,
                }}
              />
            </div>

            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span>
                {currency.format(metrics.totalCosts)}
              </span>

              <span>
                {currency.format(
                  budget.approved_budget,
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <SectionHeader
            title="Margem prevista"
            description="Estimativa baseada no valor contratado e nos custos realizados."
          />

          <div className="mt-6">
            <p className="text-3xl font-semibold">
              {currency.format(
                metrics.expectedMargin,
              )}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {metrics.expectedMarginPercentage.toFixed(
                1,
              )}
              % do valor contratado
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <SectionHeader
          title="Actividade financeira recente"
          description="Últimos movimentos registados no projecto."
        />

        {data.activity.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="Sem actividade financeira"
              description="Ainda não existem facturas, pagamentos, custos ou revisões registados."
            />
          </div>
        ) : (
          <div className="mt-6 divide-y">
            {data.activity.map((activity:any) => (
              <div
                key={activity.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {activity.title}
                  </p>

                  <p className="truncate text-sm text-muted-foreground">
                    {activity.description}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {dateFormatter.format(
                      new Date(activity.date),
                    )}
                  </p>
                </div>

                <p className="shrink-0 text-sm font-semibold">
                  {currency.format(activity.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}