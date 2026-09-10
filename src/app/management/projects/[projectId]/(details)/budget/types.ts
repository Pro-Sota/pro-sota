import type {
  BudgetPageData,
  FinancialActivity,
  ProjectBudget,
  BudgetRevision,
  ProjectCost,
  ProjectInvoice,
  PaymentRecord,
  CostsSummary,
  InvoicingSummary,
  BudgetMetrics,
} from "@/services/budget";

export type {
  BudgetPageData,
  FinancialActivity,
  ProjectBudget,
  BudgetRevision,
  ProjectCost,
  ProjectInvoice,
  PaymentRecord,
  CostsSummary,
  InvoicingSummary,
  BudgetMetrics,
};

export type BudgetTab =
  | "overview"
  | "budget"
  | "costs"
  | "invoices"
  | "payments";

export interface BudgetPageProps {
  projectId: string;
  data: BudgetPageData;
}