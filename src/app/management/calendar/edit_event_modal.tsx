"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Pencil } from "lucide-react";

// NOTE: this action must exist in "@/actions/calendar".
// Expected signature: updateCalendarEventAction(id: string, data: EventPayload)
//   => Promise<{ success: boolean; error?: string }>
import { updateCalendarEventAction } from "@/actions/calendar";
import EventForm, {
  buildEventPayload,
  eventToFormValues,
  type CalendarClientOption,
  type CalendarParticipant,
  type CalendarSupplierOption,
  type EventFormValues,
  type SelectedAttendee,
} from "./components/calendar_event_form";

export type EditableCalendarEvent = {
  id: string;
  title: string;
  event_type: string;
  start_at: string;
  end_at: string;
  location: string | null;
  description: string | null;
};

type EditMeetingModalProps = {
  open: boolean;
  onClose: () => void;
  event: EditableCalendarEvent | null;
  participants: CalendarParticipant[];
  clients: CalendarClientOption[];
  suppliers: CalendarSupplierOption[];
  /** Attendees already invited, if you store them (optional). */
  initialAttendees?: SelectedAttendee[];
};

export default function EditMeetingModal({
  open,
  onClose,
  event,
  participants,
  clients,
  suppliers,
  initialAttendees = [],
}: EditMeetingModalProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const parsed = useMemo(
    () => (event ? eventToFormValues(event) : null),
    [event],
  );

  useEffect(() => {
    if (!open) return;

    setError("");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, submitting]);

  if (!open || !event || !parsed) return null;

  const { mode, values } = parsed;

  const handleClose = () => {
    if (!submitting) onClose();
  };

  const handleSubmit = async (formValues: EventFormValues) => {
    setError("");
    setSubmitting(true);

    try {
      const result = await updateCalendarEventAction(
        event.id,
        buildEventPayload(formValues, mode),
      );

      if (!result.success) {
        setError(result.error || "Não foi possível actualizar o evento.");
        return;
      }

      onClose();
      router.refresh();
    } catch {
      setError("Não foi possível contactar o servidor. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-meeting-title"
        className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#002950]/[0.06]">
              <Pencil className="h-5 w-5 text-[#002950]" />
            </div>

            <div className="min-w-0">
              <h2
                id="edit-meeting-title"
                className="font-semibold tracking-tight text-gray-900"
              >
                {mode === "event" ? "Editar evento" : "Editar reunião"}
              </h2>
              <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                Altere os detalhes e guarde as alterações.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            aria-label="Fechar"
            className="ml-3 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* key forces a fresh form state when a different event is opened */}
        <EventForm
          key={event.id}
          mode={mode}
          initialValues={{ ...values, attendees: initialAttendees }}
          participants={participants}
          clients={clients}
          suppliers={suppliers}
          submitting={submitting}
          error={error}
          submitLabel="Guardar alterações"
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </section>
    </div>
  );
}