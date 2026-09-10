import { History, Wallet } from "lucide-react";

import type {
  ProjectBudget,
  BudgetRevision,
} from "../types";

import SectionHeader from "../components/section_header";
import EmptyState from "../components/empty_state";

interface BudgetTabProps {
  budget: ProjectBudget | null;
  revisions: BudgetRevision[];
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

export default function BudgetTab({
  budget,
  revisions,
}: BudgetTabProps) {
  if (!budget) {
    return (
      <EmptyState
        title="Orçamento não configurado"
        description="Este projecto ainda não possui um orçamento financeiro."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-orange-600" />

            <p className="text-sm text-muted-foreground">
              Orçamento aprovado
            </p>
          </div>

          <p className="mt-4 text-2xl font-semibold">
            {currency.format(
              budget.approved_budget,
            )}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <p className="text-sm text-muted-foreground">
            Valor contratado
          </p>

          <p className="mt-4 text-2xl font-semibold">
            {currency.format(
              budget.contracted_value,
            )}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <p className="text-sm text-muted-foreground">
            Custo actual
          </p>

          <p className="mt-4 text-2xl font-semibold">
            {currency.format(
              budget.actual_cost,
            )}
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <SectionHeader
          title="Revisões do orçamento"
          description="Histórico das alterações ao orçamento."
        />

        {revisions.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="Sem revisões"
              description="Ainda não existem revisões registadas para este orçamento."
            />
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 font-medium">
                    Revisão
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Valor
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Estado
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Data
                  </th>
                </tr>
              </thead>

              <tbody>
                {revisions.map((revision) => (
                  <tr
                    key={revision.id}
                    className="border-b last:border-0"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <History className="h-4 w-4 text-muted-foreground" />

                        <div>
                          <p className="font-medium">
                            Revisão{" "}
                            {revision.revision_number}
                          </p>

                          {revision.description && (
                            <p className="text-xs text-muted-foreground">
                              {revision.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 font-medium">
                      {currency.format(
                        revision.amount,
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs">
                        {revision.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-muted-foreground">
                      {dateFormatter.format(
                        new Date(revision.created_at),
                      )}
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