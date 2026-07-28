"use client";
import { ProjectFormState } from "./page";
import { ProgressBar } from "./ProgressBar";
import { SummaryRow } from "./SummaryRow";

/* ------------------------------ summary panel ----------------------------- */
export function SummaryPanel({
  form,
  progress,
  duration,
}: {
  form: ProjectFormState;
  progress: number;
  duration: { invalid: boolean; label?: string } | null;
}) {
  const currencyFormatter = new Intl.NumberFormat("pt-PT");
  const budgetDisplay = form.budget
    ? `Kz ${currencyFormatter.format(Number(form.budget))}`
    : "—";
  const location = [form.municipality, form.state_province]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Resumo
        </h3>
        <span className="font-mono text-xs font-medium text-slate-500">
          {progress}%
        </span>
      </div>

      <ProgressBar value={progress} />

      <dl className="mt-5 space-y-3.5 text-sm">
        <SummaryRow label="Nome" value={form.title || "—"} />
        <SummaryRow label="Cliente" value={form.client_id || "—"} />
        <SummaryRow label="Tipo" value={form.type || "—"} />
        <SummaryRow label="Localização" value={location || "—"} />
        <SummaryRow
          label="Duração"
          value={duration && !duration.invalid ? (duration.label as string) : "—"}
        />
        <SummaryRow label="Gestor" value={form.projectManagerId || "—"} />
        <SummaryRow
          label="Equipa"
          value={
            form.teamMembers.length > 0
              ? `${form.teamMembers.length} membro${form.teamMembers.length !== 1 ? "s" : ""}`
              : "—"
          }
        />
        <div className="border-t border-slate-100 pt-3.5">
          <SummaryRow label="Orçamento" value={budgetDisplay} emphasize />
        </div>
      </dl>
    </div>
  );
}