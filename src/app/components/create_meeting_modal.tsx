"use client";

import { useEffect, useState } from "react";
import {
  X,
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  FileText,
  Video,
} from "lucide-react";

type CreateMeetingModalProps = {
  open: boolean;
  onClose: () => void;
};

const meetingTypes = [
  "Reunião de projecto",
  "Reunião com cliente",
  "Reunião interna",
  "Reunião com fornecedor",
  "Apresentação",
  "Outro",
];

export default function CreateMeetingModal({
  open,
  onClose,
}: CreateMeetingModalProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Reunião de projecto");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [participants, setParticipants] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !date || !startTime || !endTime) {
      return;
    }

    setSubmitting(true);

    try {
      /*
       * Connect your Supabase calendar/meetings service here.
       *
       * Example:
       *
       * await createMeeting({
       *   title,
       *   type,
       *   date,
       *   start_time: startTime,
       *   end_time: endTime,
       *   location,
       *   meeting_link: meetingLink,
       *   participants,
       *   notes,
       * });
       */

      console.log("Meeting:", {
        title,
        type,
        date,
        startTime,
        endTime,
        location,
        meetingLink,
        participants,
        notes,
      });

      onClose();

      setTitle("");
      setType("Reunião de projecto");
      setDate("");
      setStartTime("");
      setEndTime("");
      setLocation("");
      setMeetingLink("");
      setParticipants("");
      setNotes("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-meeting-title"
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#002950]/5">
                <CalendarDays className="h-5 w-5 text-[#002950]" />
              </div>

              <div>
                <h2
                  id="create-meeting-title"
                  className="text-lg font-semibold text-gray-900"
                >
                  Agendar reunião
                </h2>

                <p className="mt-0.5 text-sm text-gray-500">
                  Crie uma nova reunião para a equipa.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto px-6 py-6 hide-scrollbar"
        >
          <div className="space-y-6">
            {/* Basic information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Informações da reunião
              </h3>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="meeting-title"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Título
                  </label>

                  <input
                    id="meeting-title"
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Ex.: Reunião de coordenação"
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="meeting-type"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Tipo
                  </label>

                  <select
                    id="meeting-type"
                    value={type}
                    onChange={(event) => setType(event.target.value)}
                    className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10"
                  >
                    {meetingTypes.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="meeting-date"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Data
                  </label>

                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      id="meeting-date"
                      type="date"
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3.5 text-sm text-gray-900 outline-none transition focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Time */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Horário
              </h3>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="meeting-start"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Hora de início
                  </label>

                  <div className="relative">
                    <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      id="meeting-start"
                      type="time"
                      value={startTime}
                      onChange={(event) => setStartTime(event.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3.5 text-sm text-gray-900 outline-none transition focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="meeting-end"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Hora de fim
                  </label>

                  <div className="relative">
                    <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      id="meeting-end"
                      type="time"
                      value={endTime}
                      onChange={(event) => setEndTime(event.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3.5 text-sm text-gray-900 outline-none transition focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Local
              </h3>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="meeting-location"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Local da reunião
                  </label>

                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      id="meeting-location"
                      type="text"
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      placeholder="Ex.: Sala de reuniões"
                      className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="meeting-link"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Link de videoconferência
                  </label>

                  <div className="relative">
                    <Video className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      id="meeting-link"
                      type="url"
                      value={meetingLink}
                      onChange={(event) =>
                        setMeetingLink(event.target.value)
                      }
                      placeholder="https://..."
                      className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div>
              <label
                htmlFor="meeting-participants"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Participantes
              </label>

              <div className="relative">
                <Users className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />

                <input
                  id="meeting-participants"
                  type="text"
                  value={participants}
                  onChange={(event) =>
                    setParticipants(event.target.value)
                  }
                  placeholder="Ex.: João Silva, Maria Costa, Cliente"
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10"
                />
              </div>

              <p className="mt-1.5 text-xs text-gray-400">
                Poderá seleccionar os membros da equipa quando o calendário
                estiver ligado aos perfis.
              </p>
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="meeting-notes"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Agenda / notas
              </label>

              <div className="relative">
                <FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />

                <textarea
                  id="meeting-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Adicione a agenda ou notas da reunião..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                !title.trim() ||
                !date ||
                !startTime ||
                !endTime
              }
              className="cursor-pointer rounded-lg bg-[#BD9655] px-5 py-2.5 text-sm font-semibold text-[#002950] transition hover:bg-[#C8A66E] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
            >
              {submitting ? "A agendar..." : "Agendar reunião"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
