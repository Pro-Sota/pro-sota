import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";

/* =========================================================
   TYPES
========================================================= */

export interface ProjectBudget {
  id: string;
  project_id: string;
  approved_budget: number;
  contracted_value: number;
  actual_cost: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetRevision {
  id: string;
  budget_id: string;
  revision_number: number;
  amount: number;
  description?: string;
  status: "pending" | "approved" | "rejected";
  created_by: string;
  created_at: string;
}

export interface ProjectCost {
  id: string;
  project_id: string;
  category: "materials" | "labor" | "other";
  description: string;
  amount: number;
  date: string;
  supplier?: string;
  notes?: string;
  created_at: string;
}

export interface ProjectInvoice {
  id: string;
  project_id: string;
  invoice_number: string;
  amount: number;
  issued_date: string;
  due_date: string;
  status: "pending" | "paid" | "overdue";
  notes?: string;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference?: string;
  notes?: string;
  created_at: string;

  invoice?: {
    invoice_number: string;
    project_id: string;
  };
}

export interface FinancialActivity {
  id: string;
  type: "invoice" | "payment" | "cost" | "revision";
  title: string;
  description: string;
  amount: number;
  date: string;
  created_at: string;
}

export interface CostsSummary {
  materials: number;
  labor: number;
  other: number;
  total: number;
}

export interface InvoicingSummary {
  invoiced: number;
  paid: number;
  received: number;
  pending: number;
}

export interface BudgetMetrics {
  budgetUsed: number;
  expectedMargin: number;
  expectedMarginPercentage: number;
  budgetDeviation: number;
  totalCosts: number;
  totalInvoiced: number;
  totalReceived: number;
  totalPending: number;
}

export interface BudgetPageData {
  budget: ProjectBudget | null;
  revisions: BudgetRevision[];
  costs: ProjectCost[];
  costsSummary: CostsSummary;
  invoices: ProjectInvoice[];
  invoicingSummary: InvoicingSummary;
  payments: PaymentRecord[];
  activity: FinancialActivity[];
  metrics: BudgetMetrics | null;
}

/* =========================================================
   SUPABASE
========================================================= */

async function getSupabase() {
  const cookieStore = await cookies();

  return createClient(cookieStore);
}

/* =========================================================
   BUDGET
========================================================= */

export async function getProjectBudget(
  projectId: string,
): Promise<ProjectBudget | null> {
  const supabase = await getSupabase();

  try {
    const { data, error } = await supabase
      .from("project_budgets")
      .select("*")
      .eq("project_id", projectId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching project budget:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error fetching project budget:", error);
    return null;
  }
}

/* =========================================================
   BUDGET REVISIONS
========================================================= */

export async function getBudgetRevisions(
  projectId: string,
): Promise<BudgetRevision[]> {
  const supabase = await getSupabase();

  try {
    const budget = await getProjectBudget(projectId);

    if (!budget) {
      return [];
    }

    const { data, error } = await supabase
      .from("budget_revisions")
      .select("*")
      .eq("budget_id", budget.id)
      .order("revision_number", {
        ascending: false,
      });

    if (error) {
      console.error("Error fetching budget revisions:", error);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error("Unexpected error fetching budget revisions:", error);
    return [];
  }
}

/* =========================================================
   COSTS
========================================================= */

export async function getProjectCosts(
  projectId: string,
): Promise<ProjectCost[]> {
  const supabase = await getSupabase();

  try {
    const { data, error } = await supabase
      .from("project_costs")
      .select("*")
      .eq("project_id", projectId)
      .order("date", {
        ascending: false,
      });

    if (error) {
      console.error("Error fetching project costs:", error);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error("Unexpected error fetching project costs:", error);
    return [];
  }
}

export async function getCostsByCategory(
  projectId: string,
): Promise<CostsSummary> {
  const costs = await getProjectCosts(projectId);

  const summary = costs.reduce<CostsSummary>(
    (result, cost) => {
      if (cost.category === "materials") {
        result.materials += Number(cost.amount) || 0;
      }

      if (cost.category === "labor") {
        result.labor += Number(cost.amount) || 0;
      }

      if (cost.category === "other") {
        result.other += Number(cost.amount) || 0;
      }

      return result;
    },
    {
      materials: 0,
      labor: 0,
      other: 0,
      total: 0,
    },
  );

  summary.total =
    summary.materials +
    summary.labor +
    summary.other;

  return summary;
}

/* =========================================================
   INVOICES
========================================================= */

export async function getProjectInvoices(
  projectId: string,
): Promise<ProjectInvoice[]> {
  const supabase = await getSupabase();

  try {
    const { data, error } = await supabase
      .from("project_invoices")
      .select("*")
      .eq("project_id", projectId)
      .order("issued_date", {
        ascending: false,
      });

    if (error) {
      console.error("Error fetching project invoices:", error);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error("Unexpected error fetching project invoices:", error);
    return [];
  }
}

export async function getInvoicingSummary(
  projectId: string,
): Promise<InvoicingSummary> {
  const invoices = await getProjectInvoices(projectId);

  const invoiced = invoices.reduce(
    (sum, invoice) => sum + (Number(invoice.amount) || 0),
    0,
  );

  const paid = invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce(
      (sum, invoice) => sum + (Number(invoice.amount) || 0),
      0,
    );

  const pending = invoices
    .filter(
      (invoice) =>
        invoice.status === "pending" ||
        invoice.status === "overdue",
    )
    .reduce(
      (sum, invoice) => sum + (Number(invoice.amount) || 0),
      0,
    );

  return {
    invoiced,
    paid,
    received: paid,
    pending,
  };
}

/* =========================================================
   PAYMENTS
========================================================= */

export async function getProjectPayments(
  projectId: string,
): Promise<PaymentRecord[]> {
  const supabase = await getSupabase();

  try {
    /*
      payment_records.invoice_id
        ↓
      project_invoices.id
        ↓
      project_invoices.project_id
    */

    const { data, error } = await supabase
      .from("payment_records")
      .select(`
        *,
        invoice:project_invoices!invoice_id (
          invoice_number,
          project_id
        )
      `)
      .eq("invoice.project_id", projectId)
      .order("payment_date", {
        ascending: false,
      });

    if (error) {
      console.error("Error fetching project payments:", error);
      return [];
    }

    return (data ?? []) as PaymentRecord[];
  } catch (error) {
    console.error("Unexpected error fetching project payments:", error);
    return [];
  }
}

/* =========================================================
   FINANCIAL ACTIVITY
========================================================= */

export async function getFinancialActivity(
  projectId: string,
  limit = 10,
): Promise<FinancialActivity[]> {
  try {
    const [
      invoices,
      payments,
      costs,
      revisions,
    ] = await Promise.all([
      getProjectInvoices(projectId),
      getProjectPayments(projectId),
      getProjectCosts(projectId),
      getBudgetRevisions(projectId),
    ]);

    const invoiceActivity: FinancialActivity[] = invoices.map(
      (invoice) => ({
        id: `invoice-${invoice.id}`,
        type: "invoice",
        title: `Factura ${invoice.invoice_number}`,
        description:
          invoice.status === "paid"
            ? "Factura paga"
            : invoice.status === "overdue"
              ? "Factura vencida"
              : "Factura pendente",
        amount: Number(invoice.amount) || 0,
        date: invoice.issued_date,
        created_at: invoice.created_at,
      }),
    );

    const paymentActivity: FinancialActivity[] = payments.map(
      (payment) => ({
        id: `payment-${payment.id}`,
        type: "payment",
        title: "Pagamento recebido",
        description:
          payment.payment_method
            ? `Pagamento por ${payment.payment_method}`
            : "Pagamento registado",
        amount: Number(payment.amount) || 0,
        date: payment.payment_date,
        created_at: payment.created_at,
      }),
    );

    const costActivity: FinancialActivity[] = costs.map(
      (cost) => ({
        id: `cost-${cost.id}`,
        type: "cost",
        title: "Custo registado",
        description: cost.description,
        amount: Number(cost.amount) || 0,
        date: cost.date,
        created_at: cost.created_at,
      }),
    );

    const revisionActivity: FinancialActivity[] = revisions.map(
      (revision) => ({
        id: `revision-${revision.id}`,
        type: "revision",
        title: `Revisão ${revision.revision_number}`,
        description:
          revision.description ||
          `Revisão de orçamento ${revision.status}`,
        amount: Number(revision.amount) || 0,
        date: revision.created_at,
        created_at: revision.created_at,
      }),
    );

    return [
      ...invoiceActivity,
      ...paymentActivity,
      ...costActivity,
      ...revisionActivity,
    ]
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime(),
      )
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching financial activity:", error);
    return [];
  }
}

/* =========================================================
   METRICS
========================================================= */

export async function calculateBudgetMetrics(
  projectId: string,
): Promise<BudgetMetrics | null> {
  try {
    const [
      budget,
      costs,
      invoicing,
    ] = await Promise.all([
      getProjectBudget(projectId),
      getCostsByCategory(projectId),
      getInvoicingSummary(projectId),
    ]);

    if (!budget) {
      return null;
    }

    const approvedBudget =
      Number(budget.approved_budget) || 0;

    const contractedValue =
      Number(budget.contracted_value) || 0;

    const totalCosts =
      Number(costs.total) || 0;

    const budgetUsed =
      approvedBudget > 0
        ? (totalCosts / approvedBudget) * 100
        : 0;

    const expectedMargin =
      contractedValue - totalCosts;

    const expectedMarginPercentage =
      contractedValue > 0
        ? (expectedMargin / contractedValue) * 100
        : 0;

    const budgetDeviation =
      totalCosts - approvedBudget;

    return {
      budgetUsed,
      expectedMargin,
      expectedMarginPercentage,
      budgetDeviation,
      totalCosts,
      totalInvoiced: invoicing.invoiced,
      totalReceived: invoicing.received,
      totalPending: invoicing.pending,
    };
  } catch (error) {
    console.error("Error calculating budget metrics:", error);
    return null;
  }
}

/* =========================================================
   PAGE DATA
========================================================= */

export async function getBudgetPageData(
  projectId: string,
): Promise<BudgetPageData> {
  const [
    budget,
    revisions,
    costs,
    costsSummary,
    invoices,
    invoicingSummary,
    payments,
    activity,
    metrics,
  ] = await Promise.all([
    getProjectBudget(projectId),
    getBudgetRevisions(projectId),
    getProjectCosts(projectId),
    getCostsByCategory(projectId),
    getProjectInvoices(projectId),
    getInvoicingSummary(projectId),
    getProjectPayments(projectId),
    getFinancialActivity(projectId),
    calculateBudgetMetrics(projectId),
  ]);

  return {
    budget,
    revisions,
    costs,
    costsSummary,
    invoices,
    invoicingSummary,
    payments,
    activity,
    metrics,
  };
}

/* =========================================================
   MUTATIONS
========================================================= */

export async function createCost(
  cost: Omit<ProjectCost, "id" | "created_at">,
): Promise<ProjectCost | null> {
  const supabase = await getSupabase();

  try {
    const { data, error } = await supabase
      .from("project_costs")
      .insert(cost)
      .select()
      .single();

    if (error) {
      console.error("Error creating cost:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error creating cost:", error);
    return null;
  }
}

export async function createInvoice(
  invoice: Omit<ProjectInvoice, "id" | "created_at">,
): Promise<ProjectInvoice | null> {
  const supabase = await getSupabase();

  try {
    const { data, error } = await supabase
      .from("project_invoices")
      .insert(invoice)
      .select()
      .single();

    if (error) {
      console.error("Error creating invoice:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error creating invoice:", error);
    return null;
  }
}

export async function recordPayment(
  payment: Omit<PaymentRecord, "id" | "created_at" | "invoice">,
): Promise<PaymentRecord | null> {
  const supabase = await getSupabase();

  try {
    const { data, error } = await supabase
      .from("payment_records")
      .insert(payment)
      .select()
      .single();

    if (error) {
      console.error("Error recording payment:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error recording payment:", error);
    return null;
  }
}

export async function updateBudget(
  projectId: string,
  updates: Partial<
    Omit<
      ProjectBudget,
      "id" | "project_id" | "created_at" | "updated_at"
    >
  >,
): Promise<ProjectBudget | null> {
  const supabase = await getSupabase();

  try {
    const { data, error } = await supabase
      .from("project_budgets")
      .update(updates)
      .eq("project_id", projectId)
      .select()
      .single();

    if (error) {
      console.error("Error updating budget:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error updating budget:", error);
    return null;
  }
}