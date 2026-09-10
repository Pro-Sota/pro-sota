"use client";

import {
  CircleDollarSign,
  CreditCard,
  FileText,
  Receipt,
  WalletCards,
} from "lucide-react";

import type { BudgetTab } from "../types";

interface BudgetTabsProps {
  activeTab: BudgetTab;
  onChange: (tab: BudgetTab) => void;
}

const tabs: {
  id: BudgetTab;
  label: string;
  icon: typeof CircleDollarSign;
}[] = [
  {
    id: "overview",
    label: "Resumo",
    icon: CircleDollarSign,
  },
  {
    id: "budget",
    label: "Orçamento",
    icon: WalletCards,
  },
  {
    id: "costs",
    label: "Custos",
    icon: CreditCard,
  },
  {
    id: "invoices",
    label: "Facturação",
    icon: FileText,
  },
  {
    id: "payments",
    label: "Pagamentos",
    icon: Receipt,
  },
];

export default function BudgetTabs({
  activeTab,
  onChange,
}: BudgetTabsProps) {
  return (
    <div className="overflow-x-auto border-b">
      <div className="flex min-w-max gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={[
                "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition",
                active
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}