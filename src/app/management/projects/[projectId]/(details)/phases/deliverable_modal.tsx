"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Save, X } from "lucide-react";

import type { Database } from "@/app/lib/supabase/models";
import { SaveTaskInput, saveTask } from "@/services/project_phases";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

type DeliverableTask = Pick<
  TaskRow,
  | "task_id"
  | "title"
  | "description"
  | "stage_id"
  | "start_date"
  | "due_date"
  | "position"
>;

type StageOption = {
  stage_id: string;
  name: string;
};

type Props = {
  projectId: string;
  phaseId: string;
  stages: StageOption[];
  task?: DeliverableTask | null;
  onClose: () => void;
  onSaved?: () => void;
};

type TaskFormState = {
  title: string;
  description: string;
  stageId: string;
  startDate: string;
  dueDate: string;
  position: string;
};

type SaveTaskResult = {
  success?: boolean;
  error?: string;
};

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-70";

const LABEL_CLASS = "mb-2 block text-sm font-medium text-gray-700";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getDateInputValue(
  value: string | null | undefined,
): string {
  return value ? value.slice(0, 10) : "";
}

function getInitialFormState(
  task?: DeliverableTask | null,
): TaskFormState {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    stageId: task?.stage_id ?? "",
    startDate: getDateInputValue(task?.start_date),
    dueDate: getDateInputValue(task?.due_date),
    position: String(task?.position ?? 0),
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
  stages,
  task = null,
  onClose,
  onSaved,
}: Props) {
  const editing = Boolean(task);

  const [form, setForm] = useState<TaskFormState>(() =>
    getInitialFormState(task),
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField<K extends keyof TaskFormState>(
    field: K,
    value: TaskFormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  }

  function handleClose() {
    if (!saving) {
      onClose();
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (saving) return;

    setError("");

    if (!projectId || !phaseId) {
      setError(
        "Não foi possível identificar o projecto ou a fase.",
      );
      return;
    }

    const title = form.title.trim();
    const description = form.description.trim();
    const position = Number(form.position);

    if (!title) {
      setError("O título é obrigatório.");
      return;
    }

    if (title.length > 200) {
      setError("O título não pode exceder 200 caracteres.");
      return;
    }

    if (description.length > 5000) {
      setError(
        "A descrição não pode exceder 5000 caracteres.",
      );
      return;
    }

    if (
      form.position.trim() === "" ||
      !Number.isInteger(position) ||
      position < 0
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

    if (
      form.stageId &&
      !stages.some(
        (stage) => stage.stage_id === form.stageId,
      )
    ) {
      setError(
        "A etapa seleccionada não pertence à fase actual.",
      );
      return;
    }

    const payload: SaveTaskInput = {
      id: task?.task_id,
      projectId,
      phaseId,
      stageId: form.stageId || null,
      title,
      description: description || null,
      startDate: form.startDate || null,
      dueDate: form.dueDate || null,
      position,
    };

    setSaving(true);

    try {
      const result = (await saveTask(payload)) as
        | SaveTaskResult
        | undefined;

      if (result?.success === false) {
        setError(
          result.error ||
            "Não foi possível guardar o entregável.",
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
        if (event.target === event.currentTarget) {
          handleClose();
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
              {editing
                ? "Editar entregável"
                : "Novo entregável"}
            </h2>

            <p
              id="deliverable-modal-description"
              className="mt-1 text-sm text-gray-500"
            >
              {editing
                ? "Actualice os dados e o planeamento deste entregável."
                : "Preencha os dados para adicionar um entregável à fase."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            aria-label="Fechar janela"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] disabled:opacity-50"
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
            {editing && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-900">
                  Estado e progresso geridos pelo fluxo de revisão
                </p>

                <p className="mt-1 text-xs leading-relaxed text-blue-800">
                  O colaborador submete o entregável para revisão.
                  O progresso só é considerado concluído depois da
                  aprovação do revisor.
                </p>
              </div>
            )}

            {/* Title */}
            <div>
              <label
                htmlFor="deliverable-title"
                className={LABEL_CLASS}
              >
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

            {/* Stage */}
            <div>
              <label
                htmlFor="deliverable-stage"
                className={LABEL_CLASS}
              >
                Etapa associada
              </label>

              <select
                id="deliverable-stage"
                name="stage_id"
                value={form.stageId}
                onChange={(event) =>
                  updateField("stageId", event.target.value)
                }
                disabled={saving || stages.length === 0}
                className={`${INPUT_CLASS} bg-white`}
              >
                <option value="">Sem etapa associada</option>

                {stages.map((stage) => (
                  <option
                    key={stage.stage_id}
                    value={stage.stage_id}
                  >
                    {stage.name}
                  </option>
                ))}
              </select>

              <p className="mt-1.5 text-xs text-gray-500">
                {stages.length > 0
                  ? "Seleccione a etapa desta fase a que o entregável pertence."
                  : "Não existem etapas disponíveis nesta fase."}
              </p>
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
                placeholder="Descreva o trabalho a realizar e os resultados esperados..."
                rows={4}
                maxLength={5000}
                disabled={saving}
                className={`${INPUT_CLASS} resize-y`}
              />
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

            {/* Position */}
            <div>
              <label
                htmlFor="deliverable-position"
                className={LABEL_CLASS}
              >
                Ordem de apresentação
              </label>

              <input
                id="deliverable-position"
                name="position"
                type="number"
                min={0}
                step={1}
                value={form.position}
                onChange={(event) =>
                  updateField("position", event.target.value)
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
              onClick={handleClose}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#002950] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#003968] disabled:cursor-not-allowed disabled:opacity-60"
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
                  {editing
                    ? "Guardar alterações"
                    : "Criar entregável"}
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}