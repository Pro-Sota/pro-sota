"use client";

import { useState } from "react";
import { X, Loader2, Save } from "lucide-react";

type MilestoneStatus =
  | "upcoming"
  | "in_progress"
  | "completed"
  | "missed"
  | "cancelled";

type Milestone = {
  id: string;
  title: string;
  description: string | null;
  status: MilestoneStatus;
  date: string;
  sort_order: number;
};

type Props = {
  projectId: string;
  phaseId: string;
  milestone?: Milestone | null;
  onClose: () => void;
  onSaved?: () => void;
};

const STATUS_OPTIONS = [
  { value: "upcoming", label: "Por iniciar" },
  { value: "in_progress", label: "Em curso" },
  { value: "completed", label: "Concluído" },
  { value: "missed", label: "Não cumprido" },
  { value: "cancelled", label: "Cancelado" },
] as const;

export function MilestoneModal({
  projectId,
  phaseId,
  milestone = null,
  onClose,
  onSaved,
}: Props) {
  const editing = Boolean(milestone);

  const [title, setTitle] = useState(
    milestone?.title ?? ""
  );

  const [description, setDescription] = useState(
    milestone?.description ?? ""
  );

  const [status, setStatus] =
    useState<MilestoneStatus>(
      milestone?.status ?? "upcoming"
    );

  const [date, setDate] = useState(
    milestone?.date
      ? milestone.date.slice(0, 10)
      : ""
  );

  const [sortOrder, setSortOrder] = useState(
    String(milestone?.sort_order ?? 0)
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

    if (!date) {
      setError("A data é obrigatória.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      // Server Action aqui

      onSaved?.();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível guardar o milestone."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
        {/* Header */}

        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editing
                ? "Editar milestone"
                : "Adicionar milestone"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Registe um marco importante desta fase.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-6">
            <div>
              <label
                htmlFor="milestone-title"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Título
              </label>

              <input
                id="milestone-title"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Ex.: Aprovação do Estudo Prévio"
                disabled={saving}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10"
              />
            </div>

            <div>
              <label
                htmlFor="milestone-description"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Descrição
              </label>

              <textarea
                id="milestone-description"
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="milestone-status"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Estado
                </label>

                <select
                  id="milestone-status"
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value as MilestoneStatus
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
                  htmlFor="milestone-date"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Data
                </label>

                <input
                  id="milestone-date"
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(e.target.value)
                  }
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10"
                />
              </div>
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