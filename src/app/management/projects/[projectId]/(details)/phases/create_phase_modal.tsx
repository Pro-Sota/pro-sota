"use client";

import { FormEvent, useState } from "react";
import { Loader2, X } from "lucide-react";

import { createPhase } from "@/actions/phase";

interface AddPhaseModalProps {
  projectId: string;
  nextSortOrder: number;
  onClose: () => void;
  onCreated?: () => void;
}

export default function AddPhaseModal({
  projectId,
  nextSortOrder,
  onClose,
  onCreated,
}: AddPhaseModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [plannedStart, setPlannedStart] = useState("");
  const [plannedEnd, setPlannedEnd] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("O nome da fase é obrigatório.");
      return;
    }

    if (
      plannedStart &&
      plannedEnd &&
      plannedEnd < plannedStart
    ) {
      setError(
        "A data prevista de conclusão não pode ser anterior à data de início."
      );
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await createPhase({
        project_id: projectId,
        name: trimmedName,
        description: description.trim() || null,
        planned_start: plannedStart || null,
        planned_end: plannedEnd || null,
        sort_order: nextSortOrder,
      });

      onCreated?.();
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível criar a fase."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-phase-title"
        className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl"
      >
        {/* Header */}

        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <h2
              id="add-phase-title"
              className="text-lg font-semibold text-gray-900"
            >
              Adicionar fase
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Crie uma nova fase para este projecto.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Fechar"
            className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
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
                htmlFor="phase-name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Nome da fase
              </label>

              <input
                id="phase-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Ex.: Estudo Prévio"
                autoFocus
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/20 disabled:bg-gray-50"
              />
            </div>

            {/* Description */}

            <div>
              <label
                htmlFor="phase-description"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Descrição
                <span className="ml-1 font-normal text-gray-400">
                  (opcional)
                </span>
              </label>

              <textarea
                id="phase-description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Descreva brevemente esta fase..."
                rows={3}
                disabled={isSubmitting}
                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/20 disabled:bg-gray-50"
              />
            </div>

            {/* Dates */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="planned-start"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Data de início prevista
                </label>

                <input
                  id="planned-start"
                  type="date"
                  value={plannedStart}
                  onChange={(event) =>
                    setPlannedStart(event.target.value)
                  }
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/20 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label
                  htmlFor="planned-end"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Data de conclusão prevista
                </label>

                <input
                  id="planned-end"
                  type="date"
                  value={plannedEnd}
                  min={plannedStart || undefined}
                  onChange={(event) =>
                    setPlannedEnd(event.target.value)
                  }
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/20 disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Error */}

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
              >
                {error}
              </div>
            )}
          </div>

          {/* Footer */}

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting || !name.trim()
              }
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#BD9655] px-4 py-2.5 text-sm font-medium text-[#002950] transition-colors hover:bg-[#BD9655]/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {isSubmitting
                ? "A adicionar..."
                : "Adicionar fase"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}