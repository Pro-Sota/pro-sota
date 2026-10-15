
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Save, X } from "lucide-react";

import type { Database } from "@/app/lib/supabase/models";

import {
  saveDeliverable,
  type SaveDeliverableInput,
} from "@/actions/phase_deliverable";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Deliverable =
  Database["public"]["Tables"]["deliverables"]["Row"];

type DeliverableStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "on_hold"
  | "cancelled";

type Props = {
  projectId: string;
  phaseId: string;
  deliverable?: Deliverable | null;
  onClose: () => void;
  onSaved?: () => void;
};

type DeliverableFormState = {
  title: string;
  description: string;
  status: DeliverableStatus;
  progress: string;
  startDate: string;
  dueDate: string;
  sortOrder: string;
};

type SaveDeliverableResult = {
  success?: boolean;
  error?: string;
  id?: string;
};

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const STATUS_OPTIONS: {
  value: DeliverableStatus;
  label: string;
}[] = [
  { value: "not_started", label: "Por iniciar" },
  { value: "in_progress", label: "Em curso" },
  { value: "completed", label: "Concluído" },
  { value: "on_hold", label: "Em espera" },
  { value: "cancelled", label: "Cancelado" },
];

const STATUS_STYLES: Record<DeliverableStatus, string> = {
  not_started: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  on_hold: "bg-amber-100 text-amber-800",
  cancelled: "bg-red-100 text-red-800",
};

const DEFAULT_STATUS: DeliverableStatus = "not_started";

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-70";

const LABEL_CLASS =
  "mb-2 block text-sm font-medium text-gray-700";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getDateInputValue(
  value: string | null | undefined,
): string {
  return value ? value.slice(0, 10) : "";
}

function normalizeStatus(status: string | null | undefined): DeliverableStatus {
  switch (status) {
    case "not_started":
    case "in_progress":
    case "completed":
    case "on_hold":
    case "cancelled":
      return status;
    default:
      return DEFAULT_STATUS;
  }
}

function getStatusLabel(status: DeliverableStatus): string {
  return (
    STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    "Por iniciar"
  );
}

function getStatusStyle(status: DeliverableStatus): string {
  return STATUS_STYLES[status] ?? STATUS_STYLES.not_started;
}

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function getInitialFormState(
  deliverable?: Deliverable | null,
): DeliverableFormState {
  return {
    title: deliverable?.title ?? "",
    description: deliverable?.description ?? "",
    status: normalizeStatus(deliverable?.status),
    progress: String(deliverable?.progress ?? 0),
    startDate: getDateInputValue(deliverable?.start_date),
    dueDate: getDateInputValue(deliverable?.due_date),
    sortOrder: String(deliverable?.sort_order ?? 0),
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Não foi possível guardar o entregável. Tente novamente.";
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function DeliverableModal({
  projectId,
  phaseId,
  deliverable = null,
  onClose,
  onSaved,
}: Props) {
  const editing = Boolean(deliverable);

  const [form, setForm] = useState<DeliverableFormState>(() =>
    getInitialFormState(deliverable),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(getInitialFormState(deliverable));
    setError("");
  }, [deliverable, phaseId]);

  const progressValue = clampProgress(Number(form.progress));
  const selectedStatus = getStatusLabel(form.status);

  function updateField<K extends keyof DeliverableFormState>(
    field: K,
    value: DeliverableFormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  }

  function handleStatusChange(value: string) {
    const nextStatus = normalizeStatus(value);

    setForm((current) => ({
      ...current,
      status: nextStatus,
      progress:
        nextStatus === "completed"
          ? "100"
          : current.status === "completed" && current.progress === "100"
            ? "0"
            : current.progress,
    }));

    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setError("");

    if (!projectId || !phaseId) {
      setError("Não foi possível identificar o projecto ou a fase.");
      return;
    }

    const title = form.title.trim();
    const description = form.description.trim();
    const progress = Number(form.progress);
    const sortOrder = Number(form.sortOrder);

    if (!title) {
      setError("O título é obrigatório.");
      return;
    }

    if (title.length > 200) {
      setError("O título não pode exceder 200 caracteres.");
      return;
    }

    if (
      form.progress.trim() === "" ||
      !Number.isFinite(progress) ||
      progress < 0 ||
      progress > 100
    ) {
      setError("O progresso deve estar entre 0 e 100.");
      return;
    }

    if (
      form.sortOrder.trim() === "" ||
      !Number.isInteger(sortOrder) ||
      sortOrder < 0
    ) {
      setError(
        "A ordem deve ser um número inteiro igual ou superior a zero.",
      );
      return;
    }

    if (
      form.startDate &&
      form.dueDate &&
      form.startDate > form.dueDate
    ) {
      setError(
        "A data de início não pode ser posterior à data de entrega.",
      );
      return;
    }

    // A completed deliverable must have 100% progress.
    const finalProgress =
      form.status === "completed" ? 100 : progress;

    setSaving(true);

    try {
      const payload: SaveDeliverableInput = {
        id: deliverable?.id,
        projectId,
        phaseId,
        title,
        description: description || null,
        status: form.status,
        progress: finalProgress,
        start_date: form.startDate
          ? `${form.startDate}T00:00:00`
          : null,
        due_date: form.dueDate
          ? `${form.dueDate}T23:59:59`
          : null,
        completed_at:
          form.status === "completed"
            ? deliverable?.completed_at ?? new Date().toISOString()
            : null,
        sort_order: sortOrder,
      };

      const result = (await saveDeliverable(
        payload,
      )) as SaveDeliverableResult | void;

      // Support actions that return { success: true } or return void
      // after a successful write. Explicit failures are displayed.
      if (
        result &&
        typeof result === "object" &&
        result.success === false
      ) {
        setError(
          result.error || "Não foi possível guardar o entregável.",
        );
        return;
      }

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="deliverable-modal-title"
        aria-describedby="deliverable-modal-description"
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <h2
              id="deliverable-modal-title"
              className="text-lg font-semibold text-gray-900"
            >
              {editing ? "Editar entregável" : "Novo entregável"}
            </h2>

            <p
              id="deliverable-modal-description"
              className="mt-1 text-sm text-gray-500"
            >
              {editing
                ? "Actualize os dados e o estado deste entregável."
                : "Preencha os dados para adicionar um entregável à fase."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Fechar janela"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
          noValidate
        >
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {/* Current status */}
            {editing && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Estado actual do entregável
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusStyle(form.status)}`}
                  >
                    {selectedStatus}
                  </span>

                  <span className="text-sm text-gray-500">
                    {progressValue}% concluído
                  </span>
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="deliverable-title" className={LABEL_CLASS}>
                Título <span className="text-red-500">*</span>
              </label>

              <input
                id="deliverable-title"
                name="title"
                type="text"
                value={form.title}
                onChange={(event) =>
                  updateField("title", event.target.value)
                }
                placeholder="Ex.: Plantas de arquitectura"
                required
                maxLength={200}
                disabled={saving}
                className={INPUT_CLASS}
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="deliverable-description"
                className={LABEL_CLASS}
              >
                Descrição
              </label>

              <textarea
                id="deliverable-description"
                name="description"
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Descreva o entregável..."
                rows={3}
                maxLength={5000}
                disabled={saving}
                className={`${INPUT_CLASS} resize-y`}
              />
            </div>

            {/* Status and progress */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="deliverable-status"
                  className={LABEL_CLASS}
                >
                  Estado
                </label>

                <select
                  id="deliverable-status"
                  name="status"
                  value={form.status}
                  onChange={(event) =>
                    handleStatusChange(event.target.value)
                  }
                  disabled={saving}
                  className={`${INPUT_CLASS} bg-white`}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {editing && (
                  <p className="mt-1.5 text-xs text-gray-500">
                    O estado actual é carregado automaticamente ao editar.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="deliverable-progress"
                  className={LABEL_CLASS}
                >
                  Progresso (%)
                </label>

                <div className="relative">
                  <input
                    id="deliverable-progress"
                    name="progress"
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    value={form.progress}
                    onChange={(event) =>
                      updateField("progress", event.target.value)
                    }
                    disabled={saving || form.status === "completed"}
                    required
                    className={`${INPUT_CLASS} pr-10`}
                  />

                  <span
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400"
                    aria-hidden="true"
                  >
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">
                  Pré-visualização do progresso
                </span>

                <span className="text-xs font-semibold text-gray-700">
                  {progressValue}%
                </span>
              </div>

              <div
                className="h-2 overflow-hidden rounded-full bg-gray-100"
                role="progressbar"
                aria-label="Progresso do entregável"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressValue}
              >
                <div
                  className="h-full rounded-full bg-[#BD9655] transition-all"
                  style={{ width: `${progressValue}%` }}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="deliverable-start-date"
                  className={LABEL_CLASS}
                >
                  Data de início
                </label>

                <input
                  id="deliverable-start-date"
                  name="start_date"
                  type="date"
                  value={form.startDate}
                  max={form.dueDate || undefined}
                  onChange={(event) =>
                    updateField("startDate", event.target.value)
                  }
                  disabled={saving}
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label
                  htmlFor="deliverable-due-date"
                  className={LABEL_CLASS}
                >
                  Data de entrega
                </label>

                <input
                  id="deliverable-due-date"
                  name="due_date"
                  type="date"
                  value={form.dueDate}
                  min={form.startDate || undefined}
                  onChange={(event) =>
                    updateField("dueDate", event.target.value)
                  }
                  disabled={saving}
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            {/* Sort order */}
            <div>
              <label
                htmlFor="deliverable-sort-order"
                className={LABEL_CLASS}
              >
                Ordem de apresentação
              </label>

              <input
                id="deliverable-sort-order"
                name="sort_order"
                type="number"
                min={0}
                step={1}
                value={form.sortOrder}
                onChange={(event) =>
                  updateField("sortOrder", event.target.value)
                }
                disabled={saving}
                required
                className={INPUT_CLASS}
              />

              <p className="mt-1.5 text-xs text-gray-500">
                Um número menor apresenta o entregável primeiro.
              </p>
            </div>

            {/* Error */}
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

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-white px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#002950] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#003968] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BD9655] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                  A guardar...
                </>
              ) : (
                <>
                  <Save size={16} aria-hidden="true" />
                  {editing ? "Guardar alterações" : "Criar entregável"}
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
