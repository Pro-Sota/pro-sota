"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  History,
  ArrowRightLeft,
  CheckCircle2,
  Package,
  Users
} from "lucide-react";
import Loader from "@/app/components/loader";
import CustomSelect from "@/app/components/custom_select";

type Activity = {
  id: string;
}

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
};

const activities: Activity[] = [];

export default function EquipmentPage() {

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [loading, setLoading] = useState(true);

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

  const assets: Asset[] = [
  ];

  const stats = [
    {
      label: "Total de Materiais",
      value: assets.length,
    },
    {
      label: "Disponíveis",
      value: assets.filter((a) => a.status === "Disponível").length,
    },
    {
      label: "Em Utilização",
      value: assets.filter((a) => a.status === "Em Utilização").length,
    },
    {
      label: "Em Falta / Atrasados",
      value: assets.filter(
        (a) => a.status === "Em Falta" || a.status === "Atrasado"
      ).length,
      warn: assets.some(
        (a) => a.status === "Em Falta" || a.status === "Atrasado"
      ),
    },
  ];

  const statusDot = {
    Disponível: "bg-green-500",
    "Em Utilização": "bg-blue-500",
    Atrasado: "bg-amber-500",
    "Em Falta": "bg-red-500",
  };

  const filtered = assets.filter((a) => {
    const matchesQuery =
      query.trim() === "" ||
      [a.id, a.name, a.holder, a.location]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());
    const matchesStatus =
      statusFilter === "Todos os Estados" ||
      a.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

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


  if (loading) return (<Loader />);

  return (
    <div className="min-h-screen p-6 text-gray-900 md:p-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 border-b border-gray-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Recursos de obra
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Acompanhe materiais e ferramentas da obra, saiba onde estão e quem é o responsável por cada item.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-[#BD9655] px-4 py-2 text-sm font-medium text-[#002950] transition hover:bg-[#BD9655]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ">
            <Plus size={16} />
            Registar Material
          </button>
        </div>

        {/* Stat summary — quiet, no color unless something needs attention */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {s.label}
              </p>
              <p
                className={`mt-1 text-2xl font-semibold ${s.warn ? "text-red-600" : "text-gray-900"
                  }`}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Search & filter */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-96">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar por material, código, responsável ou localização"
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>

          <CustomSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-gray-400 focus:outline-none"
          >
            <option>Todos os Estados</option>
            <option>Disponível</option>
            <option>Em Utilização</option>
            <option>Atrasado</option>
            <option>Em Falta</option>
          </CustomSelect>
        </div>

        {/* Assets table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-[1600px] w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500 overflow-x-auto">
                <th className="px-5 py-3">Código</th>
                <th className="px-5 py-3">Material</th>
                <th className="px-5 py-3">Categoria</th>
                <th className="px-5 py-3">Localização</th>
                <th className="px-5 py-3">Responsável</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Marca</th>
                <th className="px-5 py-3">Modelo</th>
                <th className="px-5 py-3">Data de aquisição</th>
                <th className="px-5 py-3">Ultima manutenção</th>
                <th className="px-5 py-3">Próxima manutenção</th>
                <th className="px-5 py-3">Valor de substituição</th>
                <th className="px-5 py-3 text-right">{""}</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-500">
                    {item.id}
                  </td>
                  <td className="px-5 py-3.5 font-medium">{item.name}</td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {item.category}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {item.location}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{item.holder}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-gray-700">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${statusDot[item.status]
                          }`}
                      />
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {item.returnDate}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-3 text-gray-500">
                      <button
                        className="rounded p-1.5 hover:bg-gray-100 hover:text-gray-900"
                        title="Histórico"                      >
                        <History size={15} />
                      </button>
                      <button
                        className="rounded p-1.5 hover:bg-gray-100 hover:text-gray-900"
                        title="Dar Entrada"
                      >
                        <CheckCircle2 size={15} />
                      </button>
                      <button className="rounded p-1.5 hover:bg-gray-100 hover:text-gray-900" title="Transferir">
                        <ArrowRightLeft size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <Package className="mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm font-medium text-gray-700">
                Nenhum material registado
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Registe o primeiro material para começar a gerir o inventário.
              </p>
            </div>
          )}
          {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Registar Material
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Adicione um novo equipamento ao inventário.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="rounded-md p-2 hover:bg-gray-100"
                  >
                    ✕
                  </button>
                </div>

                {/* Body */}
                <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Código
                    </label>
                    <input
                      className="w-full rounded-lg border px-3 py-2"
                      value={newEquipment.id}
                      onChange={(e) =>
                        setNewEquipment({
                          ...newEquipment,
                          id: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Nome
                    </label>
                    <input
                      className="w-full rounded-lg border px-3 py-2"
                      value={newEquipment.name}
                      onChange={(e) =>
                        setNewEquipment({
                          ...newEquipment,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Categoria
                    </label>
                    <input
                      className="w-full rounded-lg border px-3 py-2"
                      placeholder="Ferramenta, EPI..."
                      value={newEquipment.category}
                      onChange={(e) =>
                        setNewEquipment({
                          ...newEquipment,
                          category: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Localização
                    </label>
                    <input
                      className="w-full rounded-lg border px-3 py-2"
                      value={newEquipment.location}
                      onChange={(e) =>
                        setNewEquipment({
                          ...newEquipment,
                          location: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Responsável
                    </label>
                    <input
                      className="w-full rounded-lg border px-3 py-2"
                      value={newEquipment.holder}
                      onChange={(e) =>
                        setNewEquipment({
                          ...newEquipment,
                          holder: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Estado
                    </label>
                    <select
                      className="w-full rounded-lg border px-3 py-2"
                      value={newEquipment.status}
                      onChange={(e) =>
                        setNewEquipment({
                          ...newEquipment,
                          status: e.target.value as EquipmentStatus,
                        })
                      }
                    >
                      <option>Disponível</option>
                      <option>Em Utilização</option>
                      <option>Atrasado</option>
                      <option>Em Falta</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium">
                      Data Prevista de Devolução
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-lg border px-3 py-2"
                      value={newEquipment.returnDate}
                      onChange={(e) =>
                        setNewEquipment({
                          ...newEquipment,
                          returnDate: e.target.value,
                        })
                      }
                    />
                  </div>

                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t px-6 py-4">
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={handleSaveEquipment}
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
                  >
                    Registar Material
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Movimentações Recentes
          </h2>
          {activities.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              Nenhuma movimentação recente.
            </div>
          ) : (
            activities.map(() => {
              return (<></>);
            })
          )}
        </div>
      </div>
    </div>
  );
}


function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <Users size={32} className="text-gray-400" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900">
        Nenhum cliente encontrado
      </h3>

      <p className="mt-2 max-w-sm text-sm text-gray-500">
        Não encontramos nenhum cliente que corresponda aos filtros ou à pesquisa.
        Limpa os filtros ou adiciona um novo cliente.
      </p>

      <div className="mt-6 flex gap-3">
        <button
          onClick={onReset}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Limpar filtros
        </button>

        <button className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
          <span className="flex items-center gap-2">
            <Plus size={16} />
            Novo Cliente
          </span>
        </button>
      </div>
    </div>
  );
}