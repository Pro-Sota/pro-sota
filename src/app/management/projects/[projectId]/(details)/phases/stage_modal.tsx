
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { X, Loader2, Save } from "lucide-react";
import { savePhaseStage } from "@/actions/phase_stages";
import type { Database } from "@/app/lib/supabase/models";

type Stage = Database["public"]["Tables"]["phase_stages"]["Row"];

type StageStatus = "not_started" | "in_progress" | "completed";

type Props = {
  projectId: string;
  phaseId: string;
  stage?: Stage | null;
  onClose: () => void;
  onSaved?: () => void;
};

function normalizeStageStatus(status: string): StageStatus {
  switch (status) {
    case "in_progress":
    case "completed":
    case "not_started":
      return status;
    default:
      return "not_started";
  }
}
type SaveResult = {
  success: boolean;
  error?: string;
  stageId?: string;
};

const STATUS_OPTIONS: {
  value: StageStatus;
  label: string;
}[] = [
    { value: "not_started", label: "Por iniciar" },
    { value: "in_progress", label: "Em curso" },
    { value: "completed", label: "Concluído" },
  ];

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70";

const labelClass = "mb-2 block text-sm font-medium text-gray-700";

function toDateInput(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Não foi possível guardar a etapa. Tente novamente.";
}

export function StageModal({
  projectId,
  phaseId,
  stage = null,
  onClose,
  onSaved,
}: Props) {
  const editing = Boolean(stage);

  const [name, setName] = useState(stage?.name ?? "");
  const [description, setDescription] = useState(
    stage?.description ?? "",
  );
  const [status, setStatus] = useState<StageStatus>(
    normalizeStageStatus(stage?.status ?? "not_started"),
  );
  const [progress, setProgress] = useState(
    String(stage?.progress ?? 0),
  );
  const [plannedStart, setPlannedStart] = useState(
    toDateInput(stage?.planned_start),
  );
  const [plannedEnd, setPlannedEnd] = useState(
    toDateInput(stage?.planned_end),
  );
  const [actualStart, setActualStart] = useState(
    toDateInput(stage?.actual_start),
  );
  const [actualEnd, setActualEnd] = useState(
    toDateInput(stage?.actual_end),
  );
  const [sortOrder, setSortOrder] = useState(
    String(stage?.sort_order ?? 0),
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Reset the form if the modal is reused for a different stage.
  useEffect(() => {
    setName(stage?.name ?? "");
    setDescription(stage?.description ?? "");
    setStatus(normalizeStageStatus(stage?.status ?? "not_started"));
    setProgress(String(stage?.progress ?? 0));
    setPlannedStart(toDateInput(stage?.planned_start));
    setPlannedEnd(toDateInput(stage?.planned_end));
    setActualStart(toDateInput(stage?.actual_start));
    setActualEnd(toDateInput(stage?.actual_end));
    setSortOrder(String(stage?.sort_order ?? 0));
    setError("");
    setSaving(false);
  }, [stage, phaseId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setError("");

    if (!projectId || !phaseId) {
      setError("Não foi possível identificar o projecto ou a fase.");
      return;
    }

    const cleanName = name.trim();

    if (!cleanName) {
      setError("O nome da etapa é obrigatório.");
      return;
    }

    const parsedProgress = Number(progress);

    if (
      progress.trim() === "" ||
      !Number.isFinite(parsedProgress) ||
      parsedProgress < 0 ||
      parsedProgress > 100
    ) {
      setError("O progresso deve estar entre 0 e 100.");
      return;
    }

    const parsedSortOrder = Number(sortOrder);

    if (
      sortOrder.trim() === "" ||
      !Number.isInteger(parsedSortOrder) ||
      parsedSortOrder < 0
    ) {
      setError(
        "A ordem deve ser um número inteiro igual ou superior a zero.",
      );
      return;
    }

    if (plannedStart && plannedEnd && plannedStart > plannedEnd) {
      setError(
        "O início previsto não pode ser posterior ao fim previsto.",
      );
      return;
    }

    if (actualStart && actualEnd && actualStart > actualEnd) {
      setError(
        "O início real não pode ser posterior ao fim real.",
      );
      return;
    }

    // A completed stage should always have 100% progress.
    const finalProgress =
      status === "completed" ? 100 : parsedProgress;

    setSaving(true);

    try {
      const result = (await savePhaseStage({
        projectId,
        phaseId,
        stageId: stage?.stage_id ?? null,
        name: cleanName,
        description: description.trim() || null,
        status,
        progress: finalProgress,
        planned_start: plannedStart || null,
        planned_end: plannedEnd || null,
        actual_start: actualStart || null,
        actual_end: actualEnd || null,
        sort_order: parsedSortOrder,
      })) as SaveResult;

      if (!result?.success) {
        setError(
          result?.error ||
          "Não foi possível guardar a etapa. Verifique os dados e tente novamente.",
        );
        return;
      }

      // Notify the parent so it can refresh the server-rendered data.
      onSaved?.();
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stage-modal-title"
        aria-describedby="stage-modal-description"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl"
      >
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <h2
              id="stage-modal-title"
              className="text-lg font-semibold text-gray-900"
            >
              {editing ? "Editar etapa" : "Adicionar etapa"}
            </h2>

            <p
              id="stage-modal-description"
              className="mt-1 text-sm text-gray-500"
            >
              Defina uma etapa desta fase e o seu progresso.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Fechar"
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-5 px-6 py-6">
            <div>
              <label htmlFor="stage-name" className={labelClass}>
                Nome da etapa
              </label>

              <input
                id="stage-name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex.: Desenvolvimento do projecto"
                required
                maxLength={200}
                disabled={saving}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="stage-description" className={labelClass}>
                Descrição
              </label>

              <textarea
                id="stage-description"
                name="description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                rows={3}
                maxLength={5000}
                placeholder="Descrição opcional..."
                disabled={saving}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="stage-status" className={labelClass}>
                  Estado
                </label>

                <select
                  id="stage-status"
                  name="status"
                  value={status}
                  onChange={(event) => {
                    const nextStatus = event.target.value as StageStatus;
                    setStatus(nextStatus);

                    if (nextStatus === "completed") {
                      setProgress("100");
                    }
                  }}
                  disabled={saving}
                  className={inputClass}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="stage-progress" className={labelClass}>
                  Progresso (%)
                </label>

                <input
                  id="stage-progress"
                  name="progress"
                  type="number"
                  min={0}
                  max={100}
                  step="any"
                  value={progress}
                  onChange={(event) =>
                    setProgress(event.target.value)
                  }
                  required
                  disabled={saving || status === "completed"}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-900">
                Planeamento
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="stage-planned-start"
                    className={labelClass}
                  >
                    Início previsto
                  </label>

                  <input
                    id="stage-planned-start"
                    name="planned_start"
                    type="date"
                    value={plannedStart}
                    max={plannedEnd || undefined}
                    onChange={(event) =>
                      setPlannedStart(event.target.value)
                    }
                    disabled={saving}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="stage-planned-end"
                    className={labelClass}
                  >
                    Fim previsto
                  </label>

                  <input
                    id="stage-planned-end"
                    name="planned_end"
                    type="date"
                    value={plannedEnd}
                    min={plannedStart || undefined}
                    onChange={(event) =>
                      setPlannedEnd(event.target.value)
                    }
                    disabled={saving}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-900">
                Execução
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="stage-actual-start"
                    className={labelClass}
                  >
                    Início real
                  </label>

                  <input
                    id="stage-actual-start"
                    name="actual_start"
                    type="date"
                    value={actualStart}
                    max={actualEnd || undefined}
                    onChange={(event) =>
                      setActualStart(event.target.value)
                    }
                    disabled={saving}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="stage-actual-end"
                    className={labelClass}
                  >
                    Fim real
                  </label>

                  <input
                    id="stage-actual-end"
                    name="actual_end"
                    type="date"
                    value={actualEnd}
                    min={actualStart || undefined}
                    onChange={(event) =>
                      setActualEnd(event.target.value)
                    }
                    disabled={saving}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="stage-sort-order" className={labelClass}>
                Ordem
              </label>

              <input
                id="stage-sort-order"
                name="sort_order"
                type="number"
                min={0}
                step={1}
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(event.target.value)
                }
                required
                disabled={saving}
                className={inputClass}
              />

              <p className="mt-1 text-xs text-gray-500">
                Determina a posição desta etapa na fase.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#002950] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#003b70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BD9655] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  A guardar...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {editing
                    ? "Guardar alterações"
                    : "Adicionar etapa"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
