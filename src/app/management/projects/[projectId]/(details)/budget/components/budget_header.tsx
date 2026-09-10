import {
  Calculator,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import type { ProjectBudget } from "../types";

interface BudgetHeaderProps {
  projectId: string;
  budget: ProjectBudget | null;
}

export default function BudgetHeader({
  projectId,
  budget,
}: BudgetHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Link
          href={`/management/projects/${projectId}`}
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar ao projecto
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
            <Calculator className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Financeiro
            </h1>

            <p className="text-sm text-muted-foreground">
              Orçamento, custos, facturação e pagamentos
            </p>
          </div>
        </div>
      </div>

      {!budget && (
        <div className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
          Este projecto ainda não possui um orçamento financeiro.
        </div>
      )}
    </div>
  );
}