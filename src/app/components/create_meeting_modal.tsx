
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  FileText,
  Video,
  Search,
  Check,
  Loader2,
  UserRound,
  Building2,
  Handshake,
  Trash2,
  ChevronDown,
} from "lucide-react";

import { createCalendarEventAction } from "@/actions/calendar";
import CustomSelect from "./custom_select";

export type CalendarParticipant = {
  profile_id: string;
  first_name: string | null;
  email: string | null;
};

export type CalendarClientOption = {
  client_id: string;
  first_name: string;
  last_name: string;
   email: string | null;
   organization_name:string |null;
   client_type:string;
};

export type CalendarSupplierOption = {
  supplier_id: string;
  supplier_name: string;
};

type ParticipantCategory = "team" | "clients" | "suppliers";

type CreateMeetingModalProps = {
  open: boolean;
  onClose: () => void;
  participants: CalendarParticipant[];
  clients: CalendarClientOption[];
  suppliers: CalendarSupplierOption[];
  mode?: "meeting" | "event";
};

type SelectedAttendee = {
  key: string;
  id: string;
  name: string;
  email: string | null;
  category: ParticipantCategory;
};

const meetingTypes = [
  "Reunião de projecto",
  "Reunião com cliente",
  "Reunião interna",
  "Reunião com fornecedor",
  "Apresentação",
  "Outro",
];

const eventTypes = ["Reunião", "Visita à obra", "Prazo"];

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10";

const iconInputClass =
  "w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10";

const categoryLabels: Record<ParticipantCategory, string> = {
  team: "Equipa",
  clients: "Clientes",
  suppliers: "Fornecedores",
};

const categoryIcons = {
  team: UserRound,
  clients: Building2,
  suppliers: Handshake,
};

const categoryStyles: Record<ParticipantCategory, string> = {
  team: "bg-[#002950]/[0.07] text-[#002950]",
  clients: "bg-[#BD9655]/15 text-[#78551F]",
  suppliers: "bg-emerald-50 text-emerald-800",
};

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase();

export default function CreateMeetingModal({
  open,
  onClose,
  participants,
  clients,
  suppliers,
  mode = "meeting",
}: CreateMeetingModalProps) {
  const router = useRouter();
  const types = mode === "event" ? eventTypes : meetingTypes;

  const [title, setTitle] = useState("");
  const [type, setType] = useState(
    mode === "event" ? "Reunião" : "Reunião de projecto",
  );
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");

  const [activeCategory, setActiveCategory] =
    useState<ParticipantCategory>("team");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<
    Record<string, SelectedAttendee>
  >({});

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedAttendees = useMemo(
    () => Object.values(selected),
    [selected],
  );

  const categoryCounts = useMemo(
    () => ({
      team: selectedAttendees.filter((item) => item.category === "team")
        .length,
      clients: selectedAttendees.filter(
        (item) => item.category === "clients",
      ).length,
      suppliers: selectedAttendees.filter(
        (item) => item.category === "suppliers",
      ).length,
    }),
    [selectedAttendees],
  );

  const currentOptions = useMemo<SelectedAttendee[]>(() => {
    if (activeCategory === "team") {
      return participants.map((person) => ({
        key: `profile:${person.profile_id}`,
        id: person.profile_id,
        name: person.first_name?.trim() || person.email || "Utilizador",
        email: person.email,
        category: "team",
      }));
    }

    if (activeCategory === "clients") {
      return clients.map((client) => ({
        key: `client:${client.client_id}`,
        id: client.client_id,
        name: `${client.first_name} ${client.last_name}`,
        email: client.email,
        category: "clients",
      }));
    }

    return suppliers.map((supplier) => ({
      key: `supplier:${supplier.supplier_id}`,
      id: supplier.supplier_id,
      name: supplier.supplier_name,
      email: null,
      category: "suppliers",
    }));
  }, [activeCategory, participants, clients, suppliers]);

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    const options = currentOptions.filter(
      (option) =>
        option.name.toLocaleLowerCase().includes(query) ||
        (option.email ?? "").toLocaleLowerCase().includes(query),
    );

    return options;
  }, [currentOptions, search]);

  useEffect(() => {
    if (!open) return;

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

  useEffect(() => {
    if (open) setError("");
  }, [open]);

  if (!open) return null;

  const toggleAttendee = (attendee: SelectedAttendee) => {
    setSelected((current) => {
      const next = { ...current };

      if (next[attendee.key]) {
        delete next[attendee.key];
      } else {
        next[attendee.key] = attendee;
      }

      return next;
    });
  };

  const removeAttendee = (key: string) => {
    setSelected((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const resetForm = () => {
    setTitle("");
    setType(mode === "event" ? "Reunião" : "Reunião de projecto");
    setDate("");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setMeetingLink("");
    setNotes("");
    setActiveCategory("team");
    setSearch("");
    setSelected({});
    setError("");
  };

  const handleClose = () => {
    if (!submitting) onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    setError("");

    if (!title.trim() || !date || !startTime || !endTime) {
      setError("Preencha o título, a data e as horas.");
      return;
    }

    const startsAt = new Date(`${date}T${startTime}:00+01:00`);
    const endsAt = new Date(`${date}T${endTime}:00+01:00`);

    if (
      !Number.isFinite(startsAt.getTime()) ||
      !Number.isFinite(endsAt.getTime()) ||
      endsAt <= startsAt
    ) {
      setError("A hora de fim deve ser posterior à hora de início.");
      return;
    }

    const eventType =
      mode === "meeting" || type === "Reunião"
        ? "meeting"
        : type === "Visita à obra"
          ? "site_visit"
          : "deadline";

    const description = [
      mode === "meeting" ? `Tipo de reunião: ${type}` : "",
      meetingLink.trim()
        ? `Videoconferência: ${meetingLink.trim()}`
        : "",
      notes.trim(),
    ]
      .filter(Boolean)
      .join("\n\n");

    setSubmitting(true);

    try {
      const result = await createCalendarEventAction({
        title: title.trim(),
        event_type: eventType,
        start_at: startsAt.toISOString(),
        end_at: endsAt.toISOString(),
        location: location.trim() || null,
        description: description || null,
      });

      if (!result.success) {
        setError(result.error || "Não foi possível guardar o evento.");
        return;
      }

      resetForm();
      onClose();
      router.refresh();
    } catch {
      setError("Não foi possível contactar o servidor. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const ActiveIcon = categoryIcons[activeCategory];

  const categories: {
    id: ParticipantCategory;
    label: string;
    Icon: typeof UserRound;
  }[] = [
    { id: "team", label: "Equipa", Icon: UserRound },
    { id: "clients", label: "Clientes", Icon: Building2 },
    { id: "suppliers", label: "Fornecedores", Icon: Handshake },
  ];

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

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
            <section>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Informações
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Os campos com * são obrigatórios.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="meeting-title"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Título <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="meeting-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Ex.: Reunião de coordenação"
                    maxLength={200}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="meeting-type"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Tipo
                  </label>
                  <CustomSelect
                    id="meeting-type"
                    value={type}
                    onChange={(event) => setType(event.target.value)}
                    className={`${inputClass} cursor-pointer`}
                  >
                    {types.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </CustomSelect>
                </div>

                <div>
                  <label
                    htmlFor="meeting-date"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Data <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="meeting-date"
                      type="date"
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                      required
                      className={iconInputClass}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="meeting-start"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Hora de início <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="meeting-start"
                      type="time"
                      value={startTime}
                      onChange={(event) => setStartTime(event.target.value)}
                      required
                      className={iconInputClass}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="meeting-end"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Hora de fim <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="meeting-end"
                      type="time"
                      value={endTime}
                      onChange={(event) => setEndTime(event.target.value)}
                      required
                      className={iconInputClass}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="meeting-location"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Local
                  </label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="meeting-location"
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      placeholder="Sala de reuniões"
                      maxLength={300}
                      className={iconInputClass}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="meeting-link"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Videoconferência
                    <span className="ml-1 font-normal text-gray-400">
                      (opcional)
                    </span>
                  </label>
                  <div className="relative">
                    <Video className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="meeting-link"
                      type="url"
                      value={meetingLink}
                      onChange={(event) => setMeetingLink(event.target.value)}
                      placeholder="https://..."
                      className={iconInputClass}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Participant picker */}
            <section className="rounded-2xl border border-gray-200 bg-gray-50/50 p-3.5 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#002950]/[0.07]">
                    <Users className="h-4 w-4 text-[#002950]" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Participantes
                    </h3>
                    <p className="mt-0.5 text-xs leading-5 text-gray-500">
                      Adicione membros da equipa, clientes ou fornecedores.
                    </p>
                  </div>
                </div>

                <span className="shrink-0 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold tabular-nums text-gray-700">
                  {selectedAttendees.length}
                </span>
              </div>

              {/* Selected participants */}
              {selectedAttendees.length > 0 && (
                <div className="mt-3.5 rounded-xl border border-gray-200 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-600">
                      Seleccionados
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelected({})}
                      className="text-xs font-medium text-gray-400 transition hover:text-red-600"
                    >
                      Limpar tudo
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {selectedAttendees.map((attendee) => (
                      <span
                        key={attendee.key}
                        className="inline-flex max-w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 py-1 pl-2 pr-1 text-xs text-gray-700"
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[9px] font-semibold ${categoryStyles[attendee.category]}`}
                        >
                          {getInitials(attendee.name)}
                        </span>
                        <span className="max-w-36 truncate font-medium">
                          {attendee.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAttendee(attendee.key)}
                          aria-label={`Remover ${attendee.name}`}
                          className="rounded-md p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Search */}
              <div className="relative mt-3.5">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Pesquisar nome ou email..."
                  aria-label="Pesquisar participantes"
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Limpar pesquisa"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mt-3 flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1">
                {categories.map(({ id, label, Icon }) => {
                  const active = activeCategory === id;
                  const count = categoryCounts[id];

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setActiveCategory(id);
                        setSearch("");
                      }}
                      aria-pressed={active}
                      className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition sm:text-sm ${
                        active
                          ? "bg-[#002950] text-white shadow-sm"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{label}</span>
                      {count > 0 && (
                        <span
                          className={`min-w-5 rounded-md px-1 py-0.5 text-[10px] tabular-nums ${
                            active
                              ? "bg-white/15 text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Compact results list */}
              <div className="mt-2.5 overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <ActiveIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span className="truncate text-xs font-medium text-gray-600">
                      {categoryLabels[activeCategory]}
                    </span>
                  </div>
                  <span className="shrink-0 text-[11px] tabular-nums text-gray-400">
                    {filteredOptions.length}{" "}
                    {filteredOptions.length === 1 ? "resultado" : "resultados"}
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto overscroll-contain">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => {
                      const isSelected = Boolean(selected[option.key]);

                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => toggleAttendee(option)}
                          aria-pressed={isSelected}
                          className={`flex w-full items-center gap-2.5 border-b border-gray-100 px-3 py-2 text-left transition last:border-b-0 ${
                            isSelected
                              ? "bg-[#002950]/[0.035]"
                              : "bg-white hover:bg-gray-50"
                          }`}
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-semibold ${categoryStyles[option.category]}`}
                          >
                            {getInitials(option.name) || (
                              <UserRound className="h-3.5 w-3.5" />
                            )}
                          </span>

                          <span className="flex min-w-0 flex-1 flex-col">
                            <span
                              className={`truncate text-[13px] ${
                                isSelected
                                  ? "font-semibold text-[#002950]"
                                  : "font-medium text-gray-800"
                              }`}
                            >
                              {option.name}
                            </span>
                            <span className="truncate text-[11px] text-gray-400">
                              {option.email ||
                                categoryLabels[option.category]}
                            </span>
                          </span>

                          <span
                            className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition ${
                              isSelected
                                ? "border-[#002950] bg-[#002950] text-white"
                                : "border-gray-300 bg-white text-transparent"
                            }`}
                          >
                            <Check className="h-3 w-3" />
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="mt-2 text-xs font-medium text-gray-700">
                        {search.trim()
                          ? "Nenhum resultado encontrado"
                          : `Sem ${categoryLabels[activeCategory].toLocaleLowerCase()} disponíveis`}
                      </p>
                      <p className="mt-1 text-[11px] text-gray-400">
                        {search.trim()
                          ? "Experimente pesquisar por outro nome ou email."
                          : "Não existem registos para apresentar."}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-2 text-[11px] text-gray-400">
                Seleccione um contacto para adicionar ou remover.
              </p>
            </section>

            <section>
              <label
                htmlFor="meeting-notes"
                className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-900"
              >
                <FileText className="h-4 w-4 text-[#002950]" />
                Agenda / notas
                <span className="font-normal text-gray-400">(opcional)</span>
              </label>
              <textarea
                id="meeting-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Adicione a agenda ou notas da reunião..."
                rows={3}
                maxLength={5000}
                className={`${inputClass} resize-y`}
              />
            </section>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}
          </div>

          <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="hidden items-center text-xs text-gray-400 sm:flex">
              {selectedAttendees.length
                ? `${selectedAttendees.length} participante(s) seleccionado(s)`
                : "A selecção de participantes é opcional."}
            </p>

            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
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
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#BD9655] px-5 py-2.5 text-sm font-semibold text-[#002950] transition hover:bg-[#C8A66E] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {submitting
                  ? "A guardar..."
                  : mode === "event"
                    ? "Criar evento"
                    : "Agendar reunião"}
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
}
