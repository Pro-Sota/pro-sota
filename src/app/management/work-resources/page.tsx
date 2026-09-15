"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  History,
  ArrowRightLeft,
  CheckCircle2,
  Package,
  MoreVertical,
  X,
  Wrench,
  CircleAlert,
  Boxes,
} from "lucide-react";
import CustomSelect from "@/app/components/custom_select";
import { StatCard } from "@/app/components/StatCard";

type Activity = {
  id: string;
};

type EquipmentStatus =
  | "Disponível"
  | "Em Utilização"
  | "Atrasado"
  | "Em Falta";

type Asset = {
  id: string;
  name: string;
  category: string;
  location: string;
  holder: string;
  status: EquipmentStatus;
  checkoutDate: string;
  returnDate: string;
  brand?: string;
  model?: string;
  acquisitionDate?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  replacementValue?: number;
};

const activities: Activity[] = [];

const STATUS_STYLES: Record<EquipmentStatus, string> = {
  Disponível:
    "border border-emerald-200 bg-emerald-50 text-emerald-700",
  "Em Utilização":
    "border border-blue-200 bg-blue-50 text-blue-700",
  Atrasado:
    "border border-amber-200 bg-amber-50 text-amber-700",
  "Em Falta":
    "border border-red-200 bg-red-50 text-red-700",
};

const STATUS_DOTS: Record<EquipmentStatus, string> = {
  Disponível: "bg-emerald-500",
  "Em Utilização": "bg-blue-500",
  Atrasado: "bg-amber-500",
  "Em Falta": "bg-red-500",
};

const formatCurrency = (value?: number) => {
  if (value == null) return "—";

  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    maximumFractionDigits: 0,
  }).format(value);
};

export default function EquipmentPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos os Estados");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newEquipment, setNewEquipment] = useState({
    id: "",
    name: "",
    category: "",
    location: "",
    holder: "",
    status: "Disponível" as EquipmentStatus,
    returnDate: "",
  });

  const assets: Asset[] = [];

  const stats = useMemo(
    () => [
      {
        label: "Total de Materiais",
        value: assets.length,
        icon: <Boxes size={18} />,
      },
      {
        label: "Disponíveis",
        value: assets.filter((a) => a.status === "Disponível").length,
        icon: <CheckCircle2 size={18} />,
      },
      {
        label: "Em Utilização",
        value: assets.filter((a) => a.status === "Em Utilização").length,
        icon: <Wrench size={18} />,
      },
      {
        label: "Em Falta / Atrasados",
        value: assets.filter(
          (a) => a.status === "Em Falta" || a.status === "Atrasado"
        ).length,
        icon: <CircleAlert size={18} />,
        warn: assets.some(
          (a) => a.status === "Em Falta" || a.status === "Atrasado"
        ),
      },
    ],
    [assets]
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return assets.filter((asset) => {
      const matchesQuery =
        normalizedQuery === "" ||
        [
          asset.id,
          asset.name,
          asset.category,
          asset.holder,
          asset.location,
          asset.brand,
          asset.model,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesStatus =
        statusFilter === "Todos os Estados" ||
        asset.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter, assets]);

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("Todos os Estados");
  };

  const handleSaveEquipment = () => {
    console.log(newEquipment);

    // Save to API here

    setIsAddModalOpen(false);

    setNewEquipment({
      id: "",
      name: "",
      category: "",
      location: "",
      holder: "",
      status: "Disponível",
      returnDate: "",
    });
  };

  return (
    <div className="min-h-screen p-6 text-slate-900 md:p-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Recursos de obra
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Acompanhe materiais e ferramentas da obra, saiba onde estão e
              quem é o responsável por cada item.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#BD9655] px-4 py-2 text-sm font-medium text-[#002950] transition hover:bg-[#BD9655]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
          >
            <Plus size={16} />
            Registar Material
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              title={stat.label}
              icon={stat.icon} 
              value={`${stat.value}`}            />
          ))}
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-96">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Pesquisar por material, código, responsável ou localização"
              aria-label="Pesquisar materiais"
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <CustomSelect
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filtrar por estado"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
          >
            <option>Todos os Estados</option>
            <option>Disponível</option>
            <option>Em Utilização</option>
            <option>Atrasado</option>
            <option>Em Falta</option>
          </CustomSelect>
        </div>

        {/* Results summary */}
        <div className="mb-3 flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {filtered.length}{" "}
            {filtered.length === 1 ? "material encontrado" : "materiais encontrados"}
          </p>

          {(query || statusFilter !== "Todos os Estados") && (
            <button
              type="button"
              onClick={clearFilters}
              className="w-fit font-medium text-[#002950] hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1700px] w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Código</th>
                  <th className="px-5 py-3">Material</th>
                  <th className="px-5 py-3">Categoria</th>
                  <th className="px-5 py-3">Localização</th>
                  <th className="px-5 py-3">Responsável</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Marca</th>
                  <th className="px-5 py-3">Modelo</th>
                  <th className="px-5 py-3">Aquisição</th>
                  <th className="px-5 py-3">Última manutenção</th>
                  <th className="px-5 py-3">Próxima manutenção</th>
                  <th className="px-5 py-3">Substituição</th>
                  <th className="px-5 py-3 text-right">Ações</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                      {item.id}
                    </td>

                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-medium text-slate-900">
                          {item.name}
                        </p>

                        {item.returnDate && (
                          <p className="mt-0.5 text-xs text-slate-400">
                            Devolução: {item.returnDate}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-slate-600">
                      {item.category || "—"}
                    </td>

                    <td className="px-5 py-3.5 text-slate-600">
                      {item.location || "—"}
                    </td>

                    <td className="px-5 py-3.5 text-slate-600">
                      {item.holder || "—"}
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[item.status]}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${STATUS_DOTS[item.status]}`}
                        />
                        {item.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-slate-600">
                      {item.brand || "—"}
                    </td>

                    <td className="px-5 py-3.5 text-slate-600">
                      {item.model || "—"}
                    </td>

                    <td className="px-5 py-3.5 text-slate-600">
                      {item.acquisitionDate || "—"}
                    </td>

                    <td className="px-5 py-3.5 text-slate-600">
                      {item.lastMaintenance || "—"}
                    </td>

                    <td className="px-5 py-3.5 text-slate-600">
                      {item.nextMaintenance || "—"}
                    </td>

                    <td className="px-5 py-3.5 text-slate-600">
                      {formatCurrency(item.replacementValue)}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          aria-label={`Histórico de ${item.name}`}
                          title="Histórico"
                          className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                          <History size={15} />
                        </button>

                        <button
                          type="button"
                          aria-label={`Dar entrada de ${item.name}`}
                          title="Dar Entrada"
                          className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                          <CheckCircle2 size={15} />
                        </button>

                        <button
                          type="button"
                          aria-label={`Transferir ${item.name}`}
                          title="Transferir"
                          className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                          <ArrowRightLeft size={15} />
                        </button>

                        <button
                          type="button"
                          aria-label={`Mais opções para ${item.name}`}
                          title="Mais opções"
                          className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                          <MoreVertical size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <Package size={28} className="text-slate-400" />
              </div>

              <h3 className="text-base font-semibold text-slate-900">
                {query || statusFilter !== "Todos os Estados"
                  ? "Nenhum material encontrado"
                  : "Nenhum material registado"}
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                {query || statusFilter !== "Todos os Estados"
                  ? "Não encontramos materiais que correspondam aos filtros ou à pesquisa."
                  : "Registe o primeiro material para começar a gerir os recursos da obra."}
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {(query || statusFilter !== "Todos os Estados") && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Limpar filtros
                  </button>
                )}

                {!query && statusFilter === "Todos os Estados" && (
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#BD9655] px-4 py-2 text-sm font-medium text-[#002950] transition hover:bg-[#BD9655]/90"
                  >
                    <Plus size={16} />
                    Registar Material
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Movimentações Recentes
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Histórico recente de entradas, saídas e transferências.
            </p>
          </div>

          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <History size={22} className="text-slate-400" />
              </div>

              <p className="text-sm font-medium text-slate-700">
                Nenhuma movimentação recente
              </p>

              <p className="mt-1 text-xs text-slate-400">
                As movimentações dos materiais aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activities.map((activity) => (
                <div key={activity.id} className="px-5 py-4">
                  {/* Activity content */}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add equipment modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-equipment-title"
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2
                  id="add-equipment-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  Registar Material
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Adicione um novo equipamento ao inventário.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Fechar"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="grid max-h-[70vh] grid-cols-1 gap-4 overflow-y-auto p-6 md:grid-cols-2">
              <FormField label="Código">
                <input
                  className="form-input"
                  value={newEquipment.id}
                  onChange={(event) =>
                    setNewEquipment({
                      ...newEquipment,
                      id: event.target.value,
                    })
                  }
                />
              </FormField>

              <FormField label="Nome">
                <input
                  className="form-input"
                  value={newEquipment.name}
                  onChange={(event) =>
                    setNewEquipment({
                      ...newEquipment,
                      name: event.target.value,
                    })
                  }
                />
              </FormField>

              <FormField label="Categoria">
                <input
                  className="form-input"
                  placeholder="Ferramenta, EPI..."
                  value={newEquipment.category}
                  onChange={(event) =>
                    setNewEquipment({
                      ...newEquipment,
                      category: event.target.value,
                    })
                  }
                />
              </FormField>

              <FormField label="Localização">
                <input
                  className="form-input"
                  value={newEquipment.location}
                  onChange={(event) =>
                    setNewEquipment({
                      ...newEquipment,
                      location: event.target.value,
                    })
                  }
                />
              </FormField>

              <FormField label="Responsável">
                <input
                  className="form-input"
                  value={newEquipment.holder}
                  onChange={(event) =>
                    setNewEquipment({
                      ...newEquipment,
                      holder: event.target.value,
                    })
                  }
                />
              </FormField>

              <FormField label="Estado">
                <select
                  className="form-input"
                  value={newEquipment.status}
                  onChange={(event) =>
                    setNewEquipment({
                      ...newEquipment,
                      status: event.target.value as EquipmentStatus,
                    })
                  }
                >
                  <option>Disponível</option>
                  <option>Em Utilização</option>
                  <option>Atrasado</option>
                  <option>Em Falta</option>
                </select>
              </FormField>

              <FormField
                label="Data Prevista de Devolução"
                className="md:col-span-2"
              >
                <input
                  type="date"
                  className="form-input"
                  value={newEquipment.returnDate}
                  onChange={(event) =>
                    setNewEquipment({
                      ...newEquipment,
                      returnDate: event.target.value,
                    })
                  }
                />
              </FormField>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50/50 px-6 py-4">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSaveEquipment}
                className="rounded-lg bg-[#002950] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#002950]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
              >
                Registar Material
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      {children}
    </div>
  );
}