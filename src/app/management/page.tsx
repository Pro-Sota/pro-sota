"use client";

import {
  Briefcase,
  Users,
  Building2,
  ClipboardList,
  FileText,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Plus,
  UserPlus,
  Upload,
  CalendarPlus,
} from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      title: "Projetos Ativos",
      value: "18",
      change: "+2 este mês",
      trend: "up",
      icon: Briefcase,
    },
    {
      title: "Clientes",
      value: "42",
      change: "+4 novos",
      trend: "up",
      icon: Building2,
    },
    {
      title: "Membros da Equipa",
      value: "24",
      change: "19 disponíveis",
      trend: "flat",
      icon: Users,
    },
    {
      title: "Tarefas Pendentes",
      value: "46",
      change: "12 para hoje",
      trend: "down",
      icon: ClipboardList,
    },
  ];

  const quickActions = [
    { label: "Novo Projeto", icon: Plus },
    { label: "Adicionar Cliente", icon: UserPlus },
    { label: "Carregar Documento", icon: Upload },
    { label: "Agendar Reunião", icon: CalendarPlus },
  ];

  const revenue = [
    { month: "Fev", value: 62 },
    { month: "Mar", value: 74 },
    { month: "Abr", value: 68 },
    { month: "Mai", value: 81 },
    { month: "Jun", value: 90 },
    { month: "Jul", value: 100 },
  ];

  const workload = [
    { label: "Disponíveis", count: 19, style: "bg-slate-900" },
    { label: "Em projeto", count: 4, style: "bg-slate-400" },
    { label: "Ausentes / Férias", count: 1, style: "bg-slate-200" },
  ];
  const workloadTotal = workload.reduce((sum, w) => sum + w.count, 0);

  const deadlines = [
    {
      title: "Revisão Estrutural",
      project: "Torre de Escritórios",
      date: "Hoje",
      urgent: true,
    },
    {
      title: "Reunião com Cliente",
      project: "Moradia de Luxo",
      date: "Amanhã",
      urgent: false,
    },
    {
      title: "Submissão da Licença",
      project: "Museu",
      date: "Sexta-feira",
      urgent: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-slate-500">
            Bem-vindo de volta. Aqui está uma visão geral do seu gabinete de
            arquitetura.
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="cursor-pointer flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <action.icon size={16} className="text-slate-500" />
              {action.label}
            </button>
          ))}
        </div>

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <item.icon size={18} className="text-slate-600" />
                </div>

                {item.trend !== "flat" && (
                  <span
                    className={
                      item.trend === "up"
                        ? "text-slate-900"
                        : "text-slate-400"
                    }
                  >
                    {item.trend === "up" ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <ArrowDownRight size={16} />
                    )}
                  </span>
                )}
              </div>

              <h2 className="mt-5 text-sm text-slate-500">{item.title}</h2>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {item.value}
              </p>
              <p className="mt-2 text-sm text-slate-500">{item.change}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid gap-4 xl:grid-cols-3">
          {/* Project Progress */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 xl:col-span-2">
            <h2 className="text-base font-semibold text-slate-900">
              Projetos Ativos
            </h2>

            <div className="mt-6 space-y-5">
              {[
                { name: "Museu da Cidade", progress: 80 },
                { name: "Torre de Escritórios", progress: 52 },
                { name: "Moradia de Luxo", progress: 35 },
                { name: "Centro Comercial", progress: 92 },
              ].map((project) => (
                <div key={project.name}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-700">{project.name}</span>
                    <span className="text-slate-500">
                      {project.progress}%
                    </span>
                  </div>

                  <div className="h-1.5 rounded-full bg-slate-100">
                    <div
                      className="h-1.5 rounded-full bg-slate-900"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold text-slate-900">
              Próximos Prazos
            </h2>

            <div className="mt-6 space-y-5">
              {deadlines.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <CalendarDays
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      item.urgent ? "text-slate-900" : "text-slate-400"
                    }`}
                  />

                  <div>
                    <p className="font-medium text-slate-900">
                      {item.title}
                    </p>
                    <p className="text-sm text-slate-500">{item.project}</p>
                    <p
                      className={`text-xs font-medium ${
                        item.urgent ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {item.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Financials + Workload */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Receita
              </h2>
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <Wallet size={14} className="text-slate-400" />
                Últimos 6 meses
              </div>
            </div>

            <div className="mt-8 flex h-36 items-end gap-3">
              {revenue.map((month) => (
                <div
                  key={month.month}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div className="flex h-28 w-full items-end">
                    <div
                      className={`w-full rounded-md transition ${
                        month.month === "Jul"
                          ? "bg-slate-900"
                          : "bg-slate-200"
                      }`}
                      style={{ height: `${month.value}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400">
                    {month.month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold text-slate-900">
              Carga da Equipa
            </h2>

            <div className="mt-6 flex h-2.5 overflow-hidden rounded-full bg-slate-100">
              {workload.map((w) => (
                <div
                  key={w.label}
                  className={w.style}
                  style={{ width: `${(w.count / workloadTotal) * 100}%` }}
                />
              ))}
            </div>

            <div className="mt-5 space-y-3">
              {workload.map((w) => (
                <div
                  key={w.label}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${w.style}`} />
                    <span className="text-slate-600">{w.label}</span>
                  </div>
                  <span className="font-medium text-slate-900">
                    {w.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-5 text-base font-semibold text-slate-900">
              Atividade Recente
            </h2>

            <div className="space-y-4">
              {[
                {
                  text: "João carregou FloorPlan_V4.pdf",
                  time: "Há 20 minutos",
                },
                {
                  text: "Cliente aprovou o projeto do Museu",
                  time: "Há 1 hora",
                },
                {
                  text: "Fatura #1024 foi paga",
                  time: "Ontem",
                },
              ].map((activity) => (
                <div
                  key={activity.text}
                  className="border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                >
                  <p className="font-medium text-slate-900">
                    {activity.text}
                  </p>
                  <span className="text-sm text-slate-500">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-5 text-base font-semibold text-slate-900">
              Documentos Recentes
            </h2>

            <div className="space-y-1">
              {[
                "Planta Baixa.pdf",
                "Layout Elétrico.dwg",
                "Contrato do Projeto.pdf",
                "Orçamento.xlsx",
              ].map((doc) => (
                <div
                  key={doc}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-slate-50"
                >
                  <FileText size={16} className="shrink-0 text-slate-400" />
                  <span className="text-sm text-slate-700">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}