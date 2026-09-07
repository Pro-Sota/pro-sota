import {
  ArrowDownRight,
  ArrowUpRight,
  Calculator,
  FileCheck2,
  FileText,
  Wallet,
  BriefcaseBusiness,
  HardHat,
  CircleDollarSign,
  Receipt,
  Clock3,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "../components/stats_card";
import { EmptyState } from "../components/overview_tab";
import { formatCurrency, calculateReceivementRate } from "../utils";
import { FINANCIAL_DATA } from "./constants";

export function BudgetTab() {
  return (
    <div className="space-y-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Orçamento</h2>
        <p className="mt-1 text-sm text-gray-500">
          Gerir propostas, revisões, quantidades, preços e alterações ao orçamento.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Orçamento inicial"
          value={formatCurrency(10_800_000)}
          subtitle="Proposta inicial"
          icon={FileText}
        />

        <StatCard
          title="Orçamento aprovado"
          value={formatCurrency(FINANCIAL_DATA.approvedBudget)}
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
  );
}

export function CostsTab() {
  return (
    <div className="space-y-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Custos</h2>
        <p className="mt-1 text-sm text-gray-500">
          Acompanhe os custos previstos e reais por fase, categoria e fornecedor.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Custo total"
          value={formatCurrency(FINANCIAL_DATA.actualCost)}
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
  );
}

export function InvoicesTab() {
  return (
    <div className="space-y-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Facturação</h2>
        <p className="mt-1 text-sm text-gray-500">
          Controle as facturas emitidas, pagas e pendentes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Facturado"
          value={formatCurrency(FINANCIAL_DATA.invoiced)}
          subtitle="Total emitido"
          icon={Receipt}
        />

        <StatCard
          title="Recebido"
          value={formatCurrency(FINANCIAL_DATA.received)}
          subtitle="Total recebido"
          icon={CircleDollarSign}
        />

        <StatCard
          title="Pendente"
          value={formatCurrency(FINANCIAL_DATA.pending)}
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
  );
}

export function PaymentsTab() {
  const receivementRate = calculateReceivementRate(
    FINANCIAL_DATA.received,
    FINANCIAL_DATA.invoiced
  );

  return (
    <div className="space-y-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Pagamentos</h2>
        <p className="mt-1 text-sm text-gray-500">
          Acompanhe os pagamentos recebidos e os movimentos financeiros do projecto.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total recebido"
          value={formatCurrency(FINANCIAL_DATA.received)}
          subtitle="Pagamentos confirmados"
          icon={CircleDollarSign}
        />

        <StatCard
          title="Por receber"
          value={formatCurrency(FINANCIAL_DATA.pending)}
          subtitle="Pagamentos pendentes"
          icon={Clock3}
        />

        <StatCard
          title="Taxa de recebimento"
          value={`${receivementRate.toFixed(1)}%`}
          subtitle="Facturado vs. recebido"
          icon={TrendingUp}
        />
      </div>

      <EmptyState
        icon={CircleDollarSign}
        title="Histórico de pagamentos"
        description="Registe pagamentos, datas, métodos de pagamento, referências bancárias e documentos comprovativos."
      />
    </div>
  );
}