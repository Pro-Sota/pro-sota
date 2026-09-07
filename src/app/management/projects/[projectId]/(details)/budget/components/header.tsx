import {
  BriefcaseBusiness,
  Calculator,
  ChevronRight,
  FileText,
} from "lucide-react";
import { TABS, type Tab } from "./constants";

type HeaderProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

export function PageHeader() {
  return (
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
  );
}

export function TabNavigation({ activeTab, onTabChange }: HeaderProps) {
  return (
    <div className="mt-7 overflow-x-auto">
      <div className="flex min-w-max gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
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
  );
}