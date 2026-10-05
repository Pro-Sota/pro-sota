"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, X } from "lucide-react";

import { Database } from "@/app/lib/supabase/models";
import { savePhase } from "@/actions/phase";
import CustomSelect from "@/app/components/custom_select";

type Phase =
  Database["public"]["Tables"]["project_phases"]["Row"];

type PhaseStatus = "not_started" | "in_progress" | "completed";

type Props = {
  projectId: string;
  phase?: Phase | null;
  onCancelAction?: () => void;
};

const STATUS_OPTIONS: {
  value: PhaseStatus;
  label: string;
}[] = [
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
    label: "Concluída",
  },
];

function getDateValue(value: string | null | undefined) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function PhaseForm({
  projectId,
  phase = null,
  onCancelAction,
}: Props) {
  const router = useRouter();

  const isEditing = Boolean(phase);

  const [name, setName] = useState(phase?.name ?? "");

  const [description, setDescription] = useState(
    phase?.description ?? ""
  );

  const [status, setStatus] = useState<PhaseStatus>(
    (phase?.status as PhaseStatus) ?? "not_started"
  );

  const [plannedStart, setPlannedStart] = useState(
    getDateValue(phase?.planned_start)
  );

  const [plannedEnd, setPlannedEnd] = useState(
    getDateValue(phase?.planned_end)
  );

  const [actualStart, setActualStart] = useState(
    getDateValue(phase?.actual_start)
  );

  const [actualEnd, setActualEnd] = useState(
    getDateValue(phase?.actual_end)
  );

  const [sortOrder, setSortOrder] = useState(
    phase?.sort_order !== null &&
      phase?.sort_order !== undefined
      ? String(phase.sort_order)
      : ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function validate() {
    if (!name.trim()) {
      return "O nome da fase é obrigatório.";
    }

    if (
      plannedStart &&
      plannedEnd &&
      plannedEnd < plannedStart
    ) {
      return "A data de conclusão prevista não pode ser anterior à data de início.";
    }

    if (
      actualStart &&
      actualEnd &&
      actualEnd < actualStart
    ) {
      return "A data de conclusão real não pode ser anterior à data de início.";
    }

    return null;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      await savePhase(phase?.phase_id ?? null, {
        project_id: projectId,
        name: name.trim(),
        description: description.trim() || null,
        status,
        planned_start: plannedStart || null,
        planned_end: plannedEnd || null,
        actual_start: actualStart || null,
        actual_end: actualEnd || null,
        sort_order: sortOrder.trim() === ""
          ? null
          : Number(sortOrder),
      });

      if (onCancelAction) {
        onCancelAction();
      } else {
        if (phase?.phase_id) {
          router.push(
            `/management/projects/${projectId}/phases/${phase.phase_id}`
          );
        } else {
          router.push(
            `/management/projects/${projectId}/phases`
          );
        }

        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro ao guardar a fase."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-4xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
      >
        {/* Header */}

        <div className="border-b border-gray-200 px-6 py-5 sm:px-8">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? "Editar fase" : "Nova fase"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {isEditing
              ? "Actualize as informações e o planeamento desta fase."
              : "Adicione uma nova fase ao projecto."}
          </p>
        </div>

        {/* Form */}

        <div className="space-y-8 px-6 py-7 sm:px-8">
          {/* General information */}

          <section>
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-900">
                Informações gerais
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Identificação e estado actual da fase.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5">
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
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10 disabled:bg-gray-50"
                />
              </div>

              {/* Description */}

              <div>
                <label
                  htmlFor="phase-description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Descrição
                </label>

                <textarea
                  id="phase-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Descreva os objectivos e âmbito desta fase..."
                  rows={4}
                  disabled={saving}
                  className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10 disabled:bg-gray-50"
                />
              </div>

              {/* Status */}

              <div>
                <label
                  htmlFor="phase-status"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Estado
                </label>

                <CustomSelect
                  id="phase-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value as PhaseStatus
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10 disabled:bg-gray-50"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </CustomSelect>
              </div>
            </div>
          </section>

          {/* Planned schedule */}

          <section className="border-t border-gray-100 pt-8">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-900">
                Planeamento
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Defina o período previsto para a fase.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Planned start */}

              <div>
                <label
                  htmlFor="planned-start"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Início previsto
                </label>

                <input
                  id="planned-start"
                  type="date"
                  value={plannedStart}
                  onChange={(event) =>
                    setPlannedStart(event.target.value)
                  }
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10 disabled:bg-gray-50"
                />
              </div>

              {/* Planned end */}

              <div>
                <label
                  htmlFor="planned-end"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Conclusão prevista
                </label>

                <input
                  id="planned-end"
                  type="date"
                  value={plannedEnd}
                  onChange={(event) =>
                    setPlannedEnd(event.target.value)
                  }
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10 disabled:bg-gray-50"
                />
              </div>
            </div>
          </section>

          {/* Actual execution */}

          <section className="border-t border-gray-100 pt-8">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-900">
                Execução
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Registe as datas reais de execução da fase.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Actual start */}

              <div>
                <label
                  htmlFor="actual-start"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Início real
                </label>

                <input
                  id="actual-start"
                  type="date"
                  value={actualStart}
                  onChange={(event) =>
                    setActualStart(event.target.value)
                  }
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10 disabled:bg-gray-50"
                />
              </div>

              {/* Actual end */}

              <div>
                <label
                  htmlFor="actual-end"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Conclusão real
                </label>

                <input
                  id="actual-end"
                  type="date"
                  value={actualEnd}
                  onChange={(event) =>
                    setActualEnd(event.target.value)
                  }
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10 disabled:bg-gray-50"
                />
              </div>
            </div>
          </section>

          {/* Organization */}

          <section className="border-t border-gray-100 pt-8">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-900">
                Organização
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Defina a posição desta fase dentro do projecto.
              </p>
            </div>

            <div className="max-w-xs">
              <label
                htmlFor="sort-order"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Ordem da fase
              </label>

              <input
                id="sort-order"
                type="number"
                min={0}
                step={1}
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(event.target.value)
                }
                placeholder="Ex.: 1"
                disabled={saving}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10 disabled:bg-gray-50"
              />
            </div>
          </section>

          {/* Error */}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}

        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-8">
          <button
            type="button"
            onClick={onCancelAction ?? (() => router.back())}
            disabled={saving}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Cancelar
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#002950] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#003b70] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                A guardar...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEditing
                  ? "Guardar alterações"
                  : "Criar fase"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}