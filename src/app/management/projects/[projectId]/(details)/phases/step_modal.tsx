"use client";

import { useState } from "react";
import { X, Loader2, Save } from "lucide-react";

type StepStatus =
  | "not_started"
  | "in_progress"
  | "completed";

type Step = {
  step_id: string;
  phase_id: string;
  name: string;
  description: string | null;
  status: StepStatus;
  progress: number | null;
  planned_start: string | null;
  planned_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  sort_order: number | null;
};

type Props = {
  projectId: string;
  phaseId: string;
  step?: Step | null;
  onClose: () => void;
  onSaved?: () => void;
};

const STATUS_OPTIONS = [
  {
    value: "not_started",
    label: "Por iniciar",
  },
  {
    value: "in_progress",
    label: "Em curso",
  },
  {
    value: "completed",
    label: "Concluído",
  },
] as const;

export function StepModal({
  projectId,
  phaseId,
  step = null,
  onClose,
  onSaved,
}: Props) {
  const editing = Boolean(step);

  const [name, setName] = useState(step?.name ?? "");

  const [description, setDescription] = useState(
    step?.description ?? ""
  );

  const [status, setStatus] = useState<StepStatus>(
    step?.status ?? "not_started"
  );

  const [progress, setProgress] = useState(
    String(step?.progress ?? 0)
  );

  const [plannedStart, setPlannedStart] = useState(
    step?.planned_start?.slice(0, 10) ?? ""
  );

  const [plannedEnd, setPlannedEnd] = useState(
    step?.planned_end?.slice(0, 10) ?? ""
  );

  const [actualStart, setActualStart] = useState(
    step?.actual_start?.slice(0, 10) ?? ""
  );

  const [actualEnd, setActualEnd] = useState(
    step?.actual_end?.slice(0, 10) ?? ""
  );

  const [sortOrder, setSortOrder] = useState(
    String(step?.sort_order ?? 0)
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!name.trim()) {
      setError("O nome da etapa é obrigatório.");
      return;
    }

    const parsedProgress = Number(progress);

    if (
      Number.isNaN(parsedProgress) ||
      parsedProgress < 0 ||
      parsedProgress > 100
    ) {
      setError("O progresso deve estar entre 0 e 100.");
      return;
    }

    if (
      plannedStart &&
      plannedEnd &&
      plannedStart > plannedEnd
    ) {
      setError(
        "A data de início prevista não pode ser posterior à data de fim."
      );
      return;
    }

    if (
      actualStart &&
      actualEnd &&
      actualStart > actualEnd
    ) {
      setError(
        "A data de início real não pode ser posterior à data de fim."
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      /*
       * Server Action / API aqui.
       *
       * Dados a guardar:
       *
       * {
       *   step_id: step?.step_id,
       *   phase_id: phaseId,
       *   name: name.trim(),
       *   description: description.trim() || null,
       *   status,
       *   progress: parsedProgress,
       *   planned_start: plannedStart || null,
       *   planned_end: plannedEnd || null,
       *   actual_start: actualStart || null,
       *   actual_end: actualEnd || null,
       *   sort_order: Number(sortOrder) || 0,
       * }
       */

      onSaved?.();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível guardar a etapa."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editing ? "Editar etapa" : "Adicionar etapa"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Defina uma etapa desta fase e o seu progresso.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Fechar"
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-6">
            {/* Name */}
            <div>
              <label
                htmlFor="step-name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Nome da etapa
              </label>

              <input
                id="step-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Desenvolvimento do projecto"
                disabled={saving}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="step-description"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Descrição
              </label>

              <textarea
                id="step-description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                rows={3}
                placeholder="Descrição opcional..."
                disabled={saving}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10"
              />
            </div>

            {/* Status + Progress */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="step-status"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Estado
                </label>

                <select
                  id="step-status"
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value as StepStatus
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="step-progress"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Progresso (%)
                </label>

                <input
                  id="step-progress"
                  type="number"
                  min={0}
                  max={100}
                  value={progress}
                  onChange={(e) =>
                    setProgress(e.target.value)
                  }
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10"
                />
              </div>
            </div>

            {/* Planned dates */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-900">
                Planeamento
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="step-planned-start"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Início previsto
                  </label>

                  <input
                    id="step-planned-start"
                    type="date"
                    value={plannedStart}
                    onChange={(e) =>
                      setPlannedStart(e.target.value)
                    }
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="step-planned-end"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Fim previsto
                  </label>

                  <input
                    id="step-planned-end"
                    type="date"
                    value={plannedEnd}
                    onChange={(e) =>
                      setPlannedEnd(e.target.value)
                    }
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10"
                  />
                </div>
              </div>
            </div>

            {/* Actual dates */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-900">
                Execução
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="step-actual-start"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Início real
                  </label>

                  <input
                    id="step-actual-start"
                    type="date"
                    value={actualStart}
                    onChange={(e) =>
                      setActualStart(e.target.value)
                    }
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="step-actual-end"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Fim real
                  </label>

                  <input
                    id="step-actual-end"
                    type="date"
                    value={actualEnd}
                    onChange={(e) =>
                      setActualEnd(e.target.value)
                    }
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10"
                  />
                </div>
              </div>
            </div>

            {/* Sort order */}
            <div>
              <label
                htmlFor="step-sort-order"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Ordem
              </label>

              <input
                id="step-sort-order"
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(e.target.value)
                }
                disabled={saving}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#002950] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#003b70] disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  A guardar...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {editing
                    ? "Guardar alterações"
                    : "Adicionar"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}