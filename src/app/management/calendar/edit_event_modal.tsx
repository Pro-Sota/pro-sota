"use client";

import {
  CalendarDays,
  Clock3,
  MapPin,
  FileText,
  LoaderCircle,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import type { EventType } from "./types";
import type { CalendarEventDetails } from "./view_event_modal";

export type UpdateCalendarEventInput = {
  event_id: string;
  title: string;
  event_type: EventType;
  start_at: string;
  end_at: string;
  location: string | null;
  description: string | null;
  all_day: boolean;
};

type EditEventModalProps = {
  open: boolean;
  event: CalendarEventDetails | null;
  onCloseAction: () => void;
  onSaveAction: (
    input: UpdateCalendarEventInput,
  ) => Promise<void> | void;
};

type FormState = {
  title: string;
  event_type: EventType;
  start_at: string;
  end_at: string;
  location: string;
  description: string;
  all_day: boolean;
};

const EVENT_OPTIONS: { value: EventType; label: string }[] = [
  { value: "meeting", label: "Reunião" },
  { value: "site_visit", label: "Visita à obra" },
  { value: "deadline", label: "Prazo" },
  { value: "task", label: "Tarefa" },
  { value: "submission", label: "Entrega" },
  { value: "project", label: "Projecto" },
];

const TIME_ZONE = "Africa/Luanda";
const ANGOLA_OFFSET = "+01:00";

function toLuandaInput(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

function fromLuandaInput(value: string) {
  if (!value) return "";

  const date = new Date(`${value}:00${ANGOLA_OFFSET}`);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString();
}

function createInitialForm(
  event: CalendarEventDetails,
): FormState {
  return {
    title: event.title,
    event_type: event.event_type,
    start_at: toLuandaInput(event.start_at),
    end_at: toLuandaInput(event.end_at),
    location: event.location ?? "",
    description: event.description ?? "",
    all_day: event.all_day,
  };
}

const inputClassName =
  "mt-1.5 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/20 disabled:cursor-not-allowed disabled:bg-gray-50";

const labelClassName =
  "block text-sm font-medium text-gray-700";

export default function EditEventModal({
  open,
  event,
  onCloseAction,
  onSaveAction,
}: EditEventModalProps) {
  const [form, setForm] = useState<FormState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && event) {
      setForm(createInitialForm(event));
      setError(null);
    } else {
      setForm(null);
      setError(null);
      setIsSaving(false);
    }
  }, [open, event]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(keyboardEvent: KeyboardEvent) {
      if (keyboardEvent.key === "Escape" && !isSaving) {
        onCloseAction();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, isSaving, onCloseAction]);

  if (!open || !event || !form) {
    return null;
  }

  function updateField<K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) {
    setForm((current) =>
      current ? { ...current, [key]: value } : current,
    );
  }

  async function handleSubmit(
    submitEvent: React.FormEvent<HTMLFormElement>,
  ) {
    submitEvent.preventDefault();
    setError(null);

    const title = form!.title.trim();

    if (!title) {
      setError("Indique o título do evento.");
      return;
    }

    if (!form!.start_at || !form!.end_at) {
      setError("Indique a data e a hora de início e de fim.");
      return;
    }

    const startAt = fromLuandaInput(form!.start_at);
    const endAt = fromLuandaInput(form!.end_at);

    if (!startAt || !endAt) {
      setError("Indique datas e horas válidas.");
      return;
    }

    if (new Date(endAt).getTime() <= new Date(startAt).getTime()) {
      setError(
        "A data e a hora de fim devem ser posteriores ao início.",
      );
      return;
    }

    setIsSaving(true);

    try {
      await onSaveAction({
        event_id: event!.event_id,
        title,
        event_type: form!.event_type,
        start_at: startAt,
        end_at: endAt,
        location: form!.location.trim() || null,
        description: form!.description.trim() || null,
        all_day: form!.all_day,
      });

      onCloseAction();
    } catch (saveError) {
      console.error("Erro ao actualizar evento:", saveError);

      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível guardar as alterações. Tente novamente.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-[2px]"
      onMouseDown={(mouseEvent) => {
        if (
          mouseEvent.target === mouseEvent.currentTarget &&
          !isSaving
        ) {
          onCloseAction();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-event-title"
        className="my-auto w-full max-w-xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3EBDD]">
              <CalendarDays className="h-5 w-5 text-[#002950]" />
            </div>

            <div>
              <h2
                id="edit-event-title"
                className="text-lg font-semibold text-gray-900"
              >
                Editar evento
              </h2>

              <p className="mt-0.5 text-sm text-gray-500">
                Actualize os detalhes do evento.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseAction}
            disabled={isSaving}
            aria-label="Fechar edição do evento"
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[65vh] space-y-5 overflow-y-auto px-5 py-6 sm:px-6">
            <div>
              <label
                htmlFor="edit-event-title-input"
                className={labelClassName}
              >
                Título *
              </label>

              <input
                id="edit-event-title-input"
                type="text"
                required
                maxLength={150}
                value={form.title}
                onChange={(eventInput) =>
                  updateField("title", eventInput.target.value)
                }
                placeholder="Ex.: Reunião com o cliente"
                disabled={isSaving}
                className={inputClassName}
              />
            </div>

            <div>
              <label
                htmlFor="edit-event-type"
                className={labelClassName}
              >
                Tipo de evento *
              </label>

              <select
                id="edit-event-type"
                value={form.event_type}
                onChange={(eventInput) =>
                  updateField(
                    "event_type",
                    eventInput.target.value as EventType,
                  )
                }
                disabled={isSaving}
                className={inputClassName}
              >
                {EVENT_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="edit-event-start"
                  className={labelClassName}
                >
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    Início *
                  </span>
                </label>

                <input
                  id="edit-event-start"
                  type="datetime-local"
                  required
                  value={form.start_at}
                  onChange={(eventInput) =>
                    updateField("start_at", eventInput.target.value)
                  }
                  disabled={isSaving}
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="edit-event-end"
                  className={labelClassName}
                >
                  <span className="inline-flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-gray-400" />
                    Fim *
                  </span>
                </label>

                <input
                  id="edit-event-end"
                  type="datetime-local"
                  required
                  value={form.end_at}
                  onChange={(eventInput) =>
                    updateField("end_at", eventInput.target.value)
                  }
                  disabled={isSaving}
                  className={inputClassName}
                />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
              <input
                type="checkbox"
                checked={form.all_day}
                onChange={(eventInput) =>
                  updateField("all_day", eventInput.target.checked)
                }
                disabled={isSaving}
                className="h-4 w-4 rounded border-gray-300 accent-[#002950] focus:ring-[#BD9655]"
              />

              <span className="text-sm font-medium text-gray-700">
                Evento de dia inteiro
              </span>
            </label>

            <div>
              <label
                htmlFor="edit-event-location"
                className={labelClassName}
              >
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  Localização
                </span>
              </label>

              <input
                id="edit-event-location"
                type="text"
                maxLength={250}
                value={form.location}
                onChange={(eventInput) =>
                  updateField("location", eventInput.target.value)
                }
                placeholder="Indique o local do evento"
                disabled={isSaving}
                className={inputClassName}
              />
            </div>

            <div>
              <label
                htmlFor="edit-event-description"
                className={labelClassName}
              >
                <span className="inline-flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  Descrição
                </span>
              </label>

              <textarea
                id="edit-event-description"
                rows={4}
                maxLength={5000}
                value={form.description}
                onChange={(eventInput) =>
                  updateField(
                    "description",
                    eventInput.target.value,
                  )
                }
                placeholder="Adicione informações relevantes..."
                disabled={isSaving}
                className={`${inputClassName} resize-y`}
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
              >
                {error}
              </p>
            )}
          </div>

          <footer className="flex flex-col-reverse gap-2 border-t border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onCloseAction}
              disabled={isSaving}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#002950] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003968] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving && (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              )}

              {isSaving ? "A guardar..." : "Guardar alterações"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}