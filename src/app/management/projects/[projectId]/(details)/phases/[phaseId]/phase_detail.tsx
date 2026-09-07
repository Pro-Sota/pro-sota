"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit2,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { Phase } from "../types";
import { ProgressBar } from "../ProgressBar";
import { PhaseEditModal } from "../phase_edit_modal";

// Mock data - replace with actual data fetching
const mockPhase: Phase = {
  id: "phase-1",
  name: "Comercial e Adjudicação",
  status: "Current",
  progress: 0,
  description:
    "Fase inicial de comercialização e adjudicação do projecto. Inclui negociação de termos, formalização de contratos e alinhamento inicial com o cliente.",
  startDate: "2024-01-15",
  endDate: "2024-02-28",
};

const mockDeliverables = [
  { id: "1", name: "Proposta Técnica", status: "Completed", dueDate: "2024-01-20" },
  { id: "2", name: "Orçamento Detalhado", status: "Completed", dueDate: "2024-01-25" },
  { id: "3", name: "Cronograma Geral", status: "Current", dueDate: "2024-02-05" },
  { id: "4", name: "Contrato Assinado", status: "Pending", dueDate: "2024-02-28" },
];

const mockMilestones = [
  {
    id: "1",
    name: "Apresentação Inicial",
    status: "Completed",
    date: "2024-01-15",
  },
  {
    id: "2",
    name: "Aprovação da Proposta",
    status: "Completed",
    date: "2024-01-22",
  },
  { id: "3", name: "Reunião Final", status: "Current", date: "2024-02-15" },
  { id: "4", name: "Assinatura de Contrato", status: "Pending", date: "2024-02-28" },
];

const mockActivity = [
  {
    id: "1",
    who: "João Silva",
    action: "atualizou o cronograma",
    time: "Há 2 dias",
  },
  {
    id: "2",
    who: "Maria Costa",
    action: "aprovou a proposta técnica",
    time: "Há 5 dias",
  },
  {
    id: "3",
    who: "Pedro Oliveira",
    action: "adicionou comentário no orçamento",
    time: "Há 1 semana",
  },
];

const STATUS_COLORS = {
  Completed: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", label: "Concluída" },
  Current: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", label: "Em curso" },
  Upcoming: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-500", label: "Por iniciar" },
  Pending: { bg: "bg-gray-100", border: "border-gray-200", text: "text-gray-600", label: "Pendente" },
  "In Review": { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", label: "Em revisão" },
};

export default function PhaseDetailPage({ params }: { params: { phaseId: string } }) {
  const router = useRouter();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>(mockPhase);

  const handleSavePhase = (updated: Phase) => {
    setPhase(updated);
    setEditModalOpen(false);
    // TODO: Save to database
  };

  const statusConfig = STATUS_COLORS[phase.status as keyof typeof STATUS_COLORS];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header with back button */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 rounded px-2 py-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setEditModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            >
              <Edit2 className="h-4 w-4" />
              Editar
            </button>
            <button
              onClick={() => {
                if (confirm("Tem a certeza que deseja eliminar esta fase?")) {
                  router.back();
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-700 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-900 focus-visible:ring-offset-2"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-6">
          {/* Hero Card - Phase Overview */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className={`border-b ${statusConfig.border} bg-gradient-to-r ${statusConfig.bg} px-6 sm:px-8 py-6 sm:py-8`}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {phase.name}
                    </h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.border} ${statusConfig.bg} ${statusConfig.text}`}>
                      {STATUS_COLORS[phase.status as keyof typeof STATUS_COLORS]?.label}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-3 max-w-2xl">
                    {phase.description}
                  </p>

                  <div className="flex flex-wrap gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-mono">
                        {phase.startDate} até {phase.endDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 text-right">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    Progresso
                  </p>
                  <p className="text-4xl font-bold text-gray-900 font-mono">
                    {phase.progress}%
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 sm:px-8 py-6">
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <label className="text-sm font-medium text-gray-700">
                    Barra de progresso
                  </label>
                </div>
                <ProgressBar percent={phase.progress} />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Deliverables */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4 sm:py-5">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <h2 className="font-semibold text-gray-900">Entregas</h2>
                    <span className="ml-auto text-sm text-gray-500">
                      {mockDeliverables.filter((d) => d.status === "Completed").length} de{" "}
                      {mockDeliverables.length}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {mockDeliverables.map((deliverable, idx) => (
                    <div
                      key={deliverable.id}
                      className={`flex items-center justify-between gap-4 px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors ${
                        idx === 0 ? "" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          {deliverable.status === "Completed" && (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                          )}
                          {deliverable.status === "Current" && (
                            <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
                          )}
                          {deliverable.status === "Pending" && (
                            <AlertCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {deliverable.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Prazo: {deliverable.dueDate}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                          deliverable.status === "Completed"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : deliverable.status === "Current"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-gray-50 text-gray-600 border-gray-200"
                        }`}>
                          {deliverable.status === "Completed"
                            ? "Concluída"
                            : deliverable.status === "Current"
                            ? "Em curso"
                            : "Pendente"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4 sm:py-5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-gray-400" />
                    <h2 className="font-semibold text-gray-900">Etapas</h2>
                    <span className="ml-auto text-sm text-gray-500">
                      {mockMilestones.filter((m) => m.status === "Completed").length} de{" "}
                      {mockMilestones.length}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {mockMilestones.map((milestone, idx) => (
                    <div
                      key={milestone.id}
                      className={`flex items-center justify-between gap-4 px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors ${
                        idx === 0 ? "" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {milestone.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 font-mono">
                          {milestone.date}
                        </p>
                      </div>

                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                          milestone.status === "Completed"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : milestone.status === "Current"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-gray-50 text-gray-600 border-gray-200"
                        }`}>
                          {milestone.status === "Completed"
                            ? "Concluída"
                            : milestone.status === "Current"
                            ? "Em curso"
                            : "Pendente"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Team */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4 sm:py-5">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">Equipa</h3>
                  </div>
                </div>

                <div className="px-6 py-4 space-y-3">
                 {/*  {phase.team?.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">
                        {member.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                    </div>
                  ))} */}
                </div>
              </div>

              {/* Activity */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4 sm:py-5">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">Actividade</h3>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {mockActivity.map((activity, idx) => (
                    <div
                      key={activity.id}
                      className={`px-6 py-3 sm:py-4 text-sm ${idx === 0 ? "" : ""}`}
                    >
                      <p className="text-gray-900">
                        <span className="font-medium">{activity.who}</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <PhaseEditModal
        phase={phase}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSavePhase}
      />
    </div>
  );
}