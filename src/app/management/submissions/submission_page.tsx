"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  RotateCcw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import type {
  Submission,
  SubmissionStatus,
  SubmissionType,
} from "@/services/submissions";
import CustomSelect from "@/app/components/custom_select";

interface Props {
  submissions: Submission[];
  /** Calculate this on the server from the authenticated user's role and project access. */
  canReview: boolean;
  projectName?: string;
}

type StatusFilter =
  | "all"
  | "pending"
  | "under_review"
  | "approved"
  | "changes_requested"
  | "rejected";

const STATUS: Record<
  SubmissionStatus,
  { label: string; className: string; icon: typeof Clock3 }
> = {
  draft: {
    label: "Rascunho",
    className: "bg-gray-100 text-gray-600",
    icon: FileText,
  },
  pending: {
    label: "Pendente",
    className: "bg-amber-100 text-amber-800",
    icon: Clock3,
  },
  under_review: {
    label: "Em revisão",
    className: "bg-blue-100 text-blue-800",
    icon: Eye,
  },
  approved: {
    label: "Aprovada",
    className: "bg-emerald-100 text-emerald-800",
    icon: CheckCircle2,
  },
  changes_requested: {
    label: "Alterações solicitadas",
    className: "bg-orange-100 text-orange-800",
    icon: RotateCcw,
  },
  rejected: {
    label: "Rejeitada",
    className: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

const TYPE_LABELS: Record<SubmissionType, string> = {
  design: "Design",
  technical: "Técnico",
  client_approval: "Aprovação do cliente",
  permit: "Licenciamento",
};

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos os estados" },
  { value: "pending", label: "Pendentes" },
  { value: "under_review", label: "Em revisão" },
  { value: "approved", label: "Aprovadas" },
  { value: "changes_requested", label: "Alterações solicitadas" },
  { value: "rejected", label: "Rejeitadas" },
];

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function ProjectSubmissionReview({
  submissions: initialSubmissions,
  canReview,
  projectName,
}: Props) {
  const params = useParams();
  const projectId = params.projectId as string;

  const [submissions, setSubmissions] =
    useState<Submission[]>(initialSubmissions);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [typeFilter, setTypeFilter] = useState<SubmissionType | "all">("all");

  useEffect(() => {
    setSubmissions(initialSubmissions);
  }, [initialSubmissions]);

  const submitted = useMemo(
    () => submissions.filter((item) => item.status !== "draft"),
    [submissions],
  );

  const stats = useMemo(
    () => ({
      pending: submitted.filter((item) => item.status === "pending").length,
      underReview: submitted.filter((item) => item.status === "under_review").length,
      approved: submitted.filter((item) => item.status === "approved").length,
      changes: submitted.filter((item) => item.status === "changes_requested").length,
      rejected: submitted.filter((item) => item.status === "rejected").length,
    }),
    [submitted],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-PT");

    return submitted
      .filter((item) => {
        const searchable = [
          item.title,
          item.description ?? "",
          TYPE_LABELS[item.type],
        ]
          .join(" ")
          .toLocaleLowerCase("pt-PT");

        return !normalizedQuery || searchable.includes(normalizedQuery);
      })
      .filter((item) => statusFilter === "all" || item.status === statusFilter)
      .filter((item) => typeFilter === "all" || item.type === typeFilter)
      .sort((a, b) => {
        // Keep items needing a decision near the top when viewing all states.
        const priority: Record<SubmissionStatus, number> = {
          pending: 0,
          under_review: 1,
          changes_requested: 2,
          rejected: 3,
          approved: 4,
          draft: 5,
        };
        return priority[a.status] - priority[b.status];
      });
  }, [submitted, query, statusFilter, typeFilter]);

  const resetFilters = () => {
    setQuery("");
    setStatusFilter("pending");
    setTypeFilter("all");
  };

  const reviewHref = (submissionId: string) =>
    `/management/projects/${projectId}/approvals-and-reviews/${submissionId}`;

  return (
    <main className="min-h-screen bg-[#F7F7F5] text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <Link
                href={`/management/projects/${projectId}`}
                className="transition hover:text-[#002950]"
              >
                Projecto
              </Link>
              <span>/</span>
              <span>Submissões</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Aprovações &amp; Submissões
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Reveja documentos e entregáveis do projecto, registe decisões e
              acompanhe os itens que aguardam aprovação.
              {projectName ? ` Projecto: ${projectName}.` : ""}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 lg:self-center">
            {canReview ? (
              <>
                <ShieldCheck size={17} className="text-[#BD9655]" />
                <span>Permissão de revisão</span>
              </>
            ) : (
              <>
                <Eye size={17} className="text-gray-500" />
                <span>Consulta apenas</span>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
        <section aria-label="Resumo das submissões" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`rounded-xl border bg-white p-4 text-left transition hover:border-amber-300 ${
              statusFilter === "pending" ? "border-amber-400 ring-1 ring-amber-100" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-gray-500">Pendentes</span>
              <Clock3 size={18} className="text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{stats.pending}</p>
            <p className="mt-1 text-xs text-gray-500">Aguardam decisão</p>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("under_review")}
            className={`rounded-xl border bg-white p-4 text-left transition hover:border-blue-300 ${
              statusFilter === "under_review" ? "border-blue-400 ring-1 ring-blue-100" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-gray-500">Em revisão</span>
              <Eye size={18} className="text-blue-600" />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{stats.underReview}</p>
            <p className="mt-1 text-xs text-gray-500">Em análise</p>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("approved")}
            className={`rounded-xl border bg-white p-4 text-left transition hover:border-emerald-300 ${
              statusFilter === "approved" ? "border-emerald-400 ring-1 ring-emerald-100" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-gray-500">Aprovadas</span>
              <CheckCircle2 size={18} className="text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{stats.approved}</p>
            <p className="mt-1 text-xs text-gray-500">Decisões concluídas</p>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("changes_requested")}
            className={`rounded-xl border bg-white p-4 text-left transition hover:border-orange-300 ${
              statusFilter === "changes_requested" ? "border-orange-400 ring-1 ring-orange-100" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-gray-500">Alterações</span>
              <AlertCircle size={18} className="text-orange-600" />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{stats.changes}</p>
            <p className="mt-1 text-xs text-gray-500">Requerem acompanhamento</p>
          </button>
        </section>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-4 sm:p-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="relative min-w-0 flex-1">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Pesquisar submissões..."
                  aria-label="Pesquisar submissões"
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:w-[420px]">
                <CustomSelect
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(event.target.value as SubmissionType | "all")
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#002950]"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="design">Design</option>
                  <option value="technical">Técnico</option>
                  <option value="client_approval">Aprovação do cliente</option>
                  <option value="permit">Licenciamento</option>
                </CustomSelect>

                <CustomSelect
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#002950]"
                >
                  {FILTERS.map((filter) => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </CustomSelect>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
              <span>
                {filtered.length} {filtered.length === 1 ? "submissão encontrada" : "submissões encontradas"}
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="font-medium text-[#002950] underline-offset-4 hover:underline"
              >
                Repor filtros
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <FileText size={38} className="mx-auto mb-3 text-gray-300" />
              <h2 className="font-semibold text-gray-800">Nenhuma submissão encontrada</h2>
              <p className="mt-1 text-sm text-gray-500">
                Altere os filtros ou a pesquisa para consultar outras submissões.
              </p>
            </div>
          ) : (
            <div className="max-h-[620px] overflow-auto">
              <table className="w-full min-w-[900px] border-separate border-spacing-0 text-left text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50">
                  <tr>
                    <th className="border-b border-gray-200 px-5 py-3 font-semibold text-gray-600">Submissão</th>
                    <th className="border-b border-gray-200 px-4 py-3 font-semibold text-gray-600">Tipo</th>
                    <th className="border-b border-gray-200 px-4 py-3 font-semibold text-gray-600">Data de envio</th>
                    <th className="border-b border-gray-200 px-4 py-3 font-semibold text-gray-600">Estado</th>
                    <th className="border-b border-gray-200 px-5 py-3 text-right font-semibold text-gray-600">Acção</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((submission) => {
                    const config = STATUS[submission.status] ?? STATUS.pending;
                    const StatusIcon = config.icon;
                    const needsDecision =
                      submission.status === "pending" ||
                      submission.status === "under_review" ||
                      submission.status === "changes_requested";

                    return (
                      <tr key={submission.id} className="group bg-white hover:bg-gray-50/80">
                        <td className="max-w-[360px] border-b border-gray-100 px-5 py-4 align-top">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#002950]/5 text-[#002950]">
                              <FileText size={17} />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-gray-900" title={submission.title}>
                                {submission.title}
                              </p>
                              {submission.description ? (
                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                                  {submission.description}
                                </p>
                              ) : (
                                <p className="mt-1 text-xs text-gray-400">Sem descrição</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="border-b border-gray-100 px-4 py-4 align-top text-gray-600">
                          {TYPE_LABELS[submission.type]}
                        </td>
                        <td className="whitespace-nowrap border-b border-gray-100 px-4 py-4 align-top text-gray-600">
                          {formatDate(submission.submitted_at)}
                        </td>
                        <td className="border-b border-gray-100 px-4 py-4 align-top">
                          <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}>
                            <StatusIcon size={13} />
                            {config.label}
                          </span>
                        </td>
                        <td className="border-b border-gray-100 px-5 py-4 text-right align-top">
                          <Link
                            href={reviewHref(submission.id)}
                            className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${
                              canReview && needsDecision
                                ? "bg-[#002950] text-white hover:bg-[#003b70]"
                                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {canReview && needsDecision ? "Rever submissão" : "Ver detalhes"}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="flex items-start gap-3 rounded-xl border border-[#BD9655]/30 bg-white p-4">
          <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#BD9655]" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Decisões de revisão</p>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Abra uma submissão para consultar os documentos e o histórico, aprovar,
              rejeitar ou solicitar alterações com comentários. As decisões devem ser
              validadas no servidor; ocultar acções nesta página não substitui as
              verificações de permissões no backend.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
