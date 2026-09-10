"use client";

import { useState } from "react";
import { BudgetPageProps, BudgetTab } from "./types";
import BudgetHeader from "./components/budget_header";
import BudgetTabs from "./tabs/budget_tab";

import OverviewTab from "./components/overview_tab";
import CostsTab from "./tabs/costs_tab";
import InvoicesTab from "./tabs/invoices_tab";
import PaymentsTab from "./tabs/payment_tab";

function BudgetTabContent({
  budget,
  revisions,
}: {
  budget: BudgetPageProps["data"]["budget"];
  revisions: BudgetPageProps["data"]["revisions"];
}) {
  return <BudgetTabs budget={budget} revisions={revisions} />;
}

export default function BudgetPageClient({
  projectId,
  data,
}: BudgetPageProps) {
  const [activeTab, setActiveTab] =
    useState<BudgetTab>("overview");

  return (
    <div className="space-y-6">
      <BudgetHeader
        projectId={projectId}
        budget={data.budget}
      />

      {activeTab === "overview" && (
        <OverviewTab
          data={data}
        />
      )}

      {activeTab === "budget" && (
        <BudgetTabContent
          budget={data.budget}
          revisions={data.revisions}
        />
      )}

      {activeTab === "costs" && (
        <CostsTab
          costs={data.costs}
          summary={data.costsSummary}
        />
      )}

      {activeTab === "invoices" && (
        <InvoicesTab
          invoices={data.invoices}
          summary={data.invoicingSummary}
        />
      )}

      {activeTab === "payments" && (
        <PaymentsTab
          payments={data.payments}
          summary={data.invoicingSummary}
        />
      )}
    </div>
  );
}