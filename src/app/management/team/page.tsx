"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Users,
  HardHat,
  Building2,
  Briefcase,
  Mail,
  Phone,
  MoreVertical,
} from "lucide-react";
import { StatCard } from "@/app/components/StatCard";

export default function TeamPage() {
  const [view, setView] = useState<"grid" | "list">("grid");

  const employees: {
    id: number;
    name: string;
    role: string;
    department: string;
    email: string;
    phone: string;
    projects: number;
    status: string;
  }[] = [];

const stats = [
  {
    title: "Colaboradores",
    value: employees.length,
    icon: Users,
  },
  {
    title: "Arquitectos",
    value: employees.filter(
      (employee) => employee.department === "Architecture"
    ).length,
    icon: Building2,
  },
  {
    title: "Engenheiros",
    value: employees.filter(
      (employee) => employee.department === "Engineering"
    ).length,
    icon: HardHat,
  },
  {
    title: "Disponíveis",
    value: employees.filter(
      (employee) => employee.status === "Available"
    ).length,
    icon: Briefcase,
  },
];

  const statusStyles: Record<string, string> = {
    Active: "bg-slate-900 text-white",
    Available: "bg-slate-200 text-slate-700",
    Busy: "bg-slate-100 text-slate-500 border border-slate-300",
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              Pro-Sota Team
            </h1>
            <p className="mt-1 text-slate-500">
              Gerir arquitectos, engenheiro e colaboradores da empresa.
            </p>
          </div>

          <button className="cursor-pointer flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 active:bg-slate-950">
            <Plus size={16} />
            Add Colaborador
          </button>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} icon={<stat.icon />} title={stat.title} value={`${stat.value}`} />
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              placeholder="Search employee..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <select className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-slate-400">
              <option>Todos os departamentos</option>
              <option>Arquitectura</option>
              <option>Engenharia</option>
              <option>Construção</option>
              <option>IT</option>
              <option>Recursos humanos</option>
            </select>

            <div className="flex overflow-hidden rounded-lg border border-slate-200">
              <button
                onClick={() => setView("grid")}
                aria-label="Grid view"
                aria-pressed={view === "grid"}
                className={`p-2.5 transition cursor-pointer ${view === "grid"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-500 hover:bg-slate-50"
                  }`}
              >
                <LayoutGrid size={16} />
              </button>

              <button
                onClick={() => setView("list")}
                aria-label="List view"
                aria-pressed={view === "list"}
                className={`cursor-pointer p-2.5 border-l border-slate-200 transition ${view === "list"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-500 hover:bg-slate-50"
                  }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Employees */}
        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-8 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Users className="h-8 w-8 text-slate-400" />
            </div>

            <h3 className="mt-6 text-xl font-semibold text-slate-900">
              Nenhum colaborador encontrado
            </h3>

            <p className="mt-2 max-w-md text-sm text-slate-500">
              Ainda não existem colaboradores registados. Adicione o primeiro membro da
              equipa para começar a gerir arquitectos, engenheiros e restantes
              colaboradores.
            </p>

            <button className="mt-6 flex cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800">
              <Plus size={16} />
              Adicionar colaborador
            </button>
          </div>
        ) : (
          <div
            className={
              view === "grid"
                ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                : "space-y-3"
            }
          >
            {employees.map((employee) =>
              view === "grid" ? (
                <div
                  key={employee.id}
                  className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-medium text-white">
                        {initials(employee.name)}
                      </div>

                      <div>
                        <h3 className="font-medium text-slate-900">
                          {employee.name}
                        </h3>
                        <p className="text-sm text-slate-500">{employee.role}</p>
                      </div>
                    </div>

                    <button
                      aria-label="More options"
                      className="rounded-md p-1 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  <div className="mt-5 space-y-2.5 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-slate-400" />
                      {employee.department}
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Mail size={14} className="shrink-0 text-slate-400" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />
                      {employee.phone}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs text-slate-400">Projects</p>
                      <p className="font-medium text-slate-900">
                        {employee.projects}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[employee.status]
                        }`}
                    >
                      {employee.status}
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  key={employee.id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-medium text-white">
                      {initials(employee.name)}
                    </div>

                    <div>
                      <h3 className="font-medium text-slate-900">
                        {employee.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {employee.role} · {employee.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 sm:ml-auto">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      {employee.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />
                      {employee.phone}
                    </div>
                    <div className="text-slate-400">
                      <span className="font-medium text-slate-900">
                        {employee.projects}
                      </span>{" "}
                      projects
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[employee.status]
                        }`}
                    >
                      {employee.status}
                    </span>
                    <button
                      aria-label="More options"
                      className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>)
        }
      </div>
    </div>

  )
}