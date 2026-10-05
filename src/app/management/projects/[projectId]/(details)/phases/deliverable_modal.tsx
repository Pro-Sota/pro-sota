"use client";

import { useState } from "react";
import { X, Loader2, Save } from "lucide-react";

type DeliverableStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "on_hold"
  | "cancelled";

type Deliverable = {
  id: string;
  phase_id: string;
  title: string;
  description: string | null;
  status: DeliverableStatus;
  progress: number;
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  sort_order: number;
};

type Props = {
  projectId: string;
  phaseId: string;
  deliverable?: Deliverable | null;
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
  {
    value: "on_hold",
    label: "Em espera",
  },
  {
    value: "cancelled",
    label: "Cancelado",
  },
] as const;

export function DeliverableModal({
  projectId,
  phaseId,
  deliverable = null,
  onClose,
  onSaved,
}: Props) {
  const editing = Boolean(deliverable);

  const [title, setTitle] = useState(
    deliverable?.title ?? ""
  );

  const [description, setDescription] = useState(
    deliverable?.description ?? ""
  );

  const [status, setStatus] =
    useState<DeliverableStatus>(
      deliverable?.status ?? "not_started"
    );

  const [progress, setProgress] = useState(
    String(deliverable?.progress ?? 0)
  );

  const [startDate, setStartDate] = useState(
    deliverable?.start_date?.slice(0, 10) ?? ""
  );

  const [dueDate, setDueDate] = useState(
    deliverable?.due_date?.slice(0, 10) ?? ""
  );

  const [sortOrder, setSortOrder] = useState(
    String(deliverable?.sort_order ?? 0)
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!title.trim()) {
      setError("O título é obrigatório.");
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
      startDate &&
      dueDate &&
      startDate > dueDate
    ) {
      setError(
        "A data de início não pode ser posterior à data de entrega."
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
       *   id: deliverable?.id,
       *   phase_id: phaseId,
       *   title: title.trim(),
       *   description: description.trim() || null,
       *   status,
       *   progress: parsedProgress,
       *   start_date: startDate
       *     ? `${startDate}T00:00:00`
       *     : null,
       *   due_date: dueDate
       *     ? `${dueDate}T23:59:59`
       *     : null,
       *   completed_at:
       *     status === "completed"
       *       ? deliverable?.completed_at ?? new Date().toISOString()
       *       : null,
       *   sort_order: Number(sortOrder) || 0,
       * }
       */

      onSaved?.();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível guardar o entregável."
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
              {editing
                ? "Editar entregável"
                : "Adicionar entregável"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Registe um resultado ou documento esperado
              desta fase.
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
            {/* Title */}
            <div>
              <label
                htmlFor="deliverable-title"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Título
              </label>

              <input
                id="deliverable-title"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Ex.: Plantas do Estudo Prévio"
                disabled={saving}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="deliverable-description"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Descrição
              </label>

              <textarea
                id="deliverable-description"
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
                  htmlFor="deliverable-status"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Estado
                </label>

                <select
                  id="deliverable-status"
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value as DeliverableStatus
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
                  htmlFor="deliverable-progress"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Progresso (%)
                </label>

                <input
                  id="deliverable-progress"
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

            {/* Dates */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-900">
                Prazos
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="deliverable-start-date"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Data de início
                  </label>

                  <input
                    id="deliverable-start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) =>
                      setStartDate(e.target.value)
                    }
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="deliverable-due-date"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Data de entrega
                  </label>

                  <input
                    id="deliverable-due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) =>
                      setDueDate(e.target.value)
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
                htmlFor="deliverable-sort-order"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Ordem
              </label>

              <input
                id="deliverable-sort-order"
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