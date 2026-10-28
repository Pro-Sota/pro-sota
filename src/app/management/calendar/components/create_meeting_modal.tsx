"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, CalendarDays } from "lucide-react";

import { createCalendarEventAction } from "@/actions/calendar";
import EventForm, {
  buildEventPayload,
  type CalendarClientOption,
  type CalendarParticipant,
  type CalendarSupplierOption,
  type EventFormValues,
} from "./calendar_event_form";

// Re-exported so existing imports keep working.
export type {
  CalendarClientOption,
  CalendarParticipant,
  CalendarSupplierOption,
} from "./calendar_event_form";

type CreateMeetingModalProps = {
  open: boolean;
  onClose: () => void;
  participants: CalendarParticipant[];
  clients: CalendarClientOption[];
  suppliers: CalendarSupplierOption[];
  mode?: "meeting" | "event";
};

export default function CreateMeetingModal({
  open,
  onClose,
  participants,
  clients,
  suppliers,
  mode = "meeting",
}: CreateMeetingModalProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setError("");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, submitting]);

  if (!open) return null;

  const handleClose = () => {
    if (!submitting) onClose();
  };

  const handleSubmit = async (values: EventFormValues) => {
    setError("");
    setSubmitting(true);

    try {
      const result = await createCalendarEventAction(
        buildEventPayload(values, mode),
      );

      if (!result.success) {
        setError(result.error || "Não foi possível guardar o evento.");
        return;
      }

      onClose(); // form unmounts, so its state resets automatically
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
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-meeting-title"
        className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#002950]/[0.06]">
              <CalendarDays className="h-5 w-5 text-[#002950]" />
            </div>

            <div className="min-w-0">
              <h2
                id="create-meeting-title"
                className="font-semibold tracking-tight text-gray-900"
              >
                {mode === "event" ? "Novo evento" : "Agendar reunião"}
              </h2>
              <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                Defina os detalhes e convide os participantes.
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

        <EventForm
          mode={mode}
          participants={participants}
          clients={clients}
          suppliers={suppliers}
          submitting={submitting}
          error={error}
          submitLabel={mode === "event" ? "Criar evento" : "Agendar reunião"}
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </section>
    </div>
  );
}