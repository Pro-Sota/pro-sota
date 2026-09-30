"use client";

import { useState } from "react";
import {
    CalendarDays,
    Clock3,
    MapPin,
    Users,
    X,
} from "lucide-react";

type NewEventModalProps = {
    open: boolean;
    onCloseAction: () => void;
    selectedDate?: string;
};

type EventForm = {
    title: string;
    type: "meeting" | "site_visit" | "deadline";
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    people: string;
    description: string;
};

const initialForm: EventForm = {
    title: "",
    type: "meeting",
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    location: "",
    people: "",
    description: "",
};

export default function NewEventModal({
    open,
    onCloseAction,
    selectedDate,
}: NewEventModalProps) {
    const [form, setForm] = useState<EventForm>({
        ...initialForm,
        date: selectedDate ?? "",
    });

    if (!open) {
        return null;
    }

    const updateField = <K extends keyof EventForm>(
        field: K,
        value: EventForm[K],
    ) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        // Server Action can be connected here later.
        console.log("New calendar event:", form);

        onCloseAction();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onCloseAction();
                }
            }}
        >
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#002950]/5">
                                <CalendarDays className="h-4 w-4 text-[#002950]" />
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-neutral-950">
                                    Novo evento
                                </h2>

                                <p className="text-xs text-neutral-500">
                                    Adicione um evento ao calendário.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onCloseAction}
                        className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                        aria-label="Fechar"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-5 px-6 py-5">
                        {/* Title */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                                Título
                            </label>

                            <input
                                value={form.title}
                                onChange={(event) =>
                                    updateField(
                                        "title",
                                        event.target.value,
                                    )
                                }
                                placeholder="Ex.: Reunião com cliente"
                                required
                                className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10"
                            />
                        </div>

                        {/* Type */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                                Tipo de evento
                            </label>

                            <select
                                value={form.type}
                                onChange={(event) =>
                                    updateField(
                                        "type",
                                        event.target
                                            .value as EventForm["type"],
                                    )
                                }
                                className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10"
                            >
                                <option value="meeting">
                                    Reunião
                                </option>

                                <option value="site_visit">
                                    Visita à obra
                                </option>

                                <option value="deadline">
                                    Prazo
                                </option>
                            </select>
                        </div>

                        {/* Date / time */}
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="sm:col-span-1">
                                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                                    Data
                                </label>

                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={(event) =>
                                        updateField(
                                            "date",
                                            event.target.value,
                                        )
                                    }
                                    required
                                    className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                                    Início
                                </label>

                                <div className="relative">
                                    <Clock3 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                                    <input
                                        type="time"
                                        value={
                                            form.startTime
                                        }
                                        onChange={(event) =>
                                            updateField(
                                                "startTime",
                                                event.target.value,
                                            )
                                        }
                                        required
                                        className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                                    Fim
                                </label>

                                <input
                                    type="time"
                                    value={form.endTime}
                                    onChange={(event) =>
                                        updateField(
                                            "endTime",
                                            event.target.value,
                                        )
                                    }
                                    required
                                    className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                                Local
                            </label>

                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                                <input
                                    value={form.location}
                                    onChange={(event) =>
                                        updateField(
                                            "location",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Local ou endereço"
                                    className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10"
                                />
                            </div>
                        </div>

                        {/* People */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                                Participantes
                            </label>

                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                                <input
                                    value={form.people}
                                    onChange={(event) =>
                                        updateField(
                                            "people",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Adicionar participantes"
                                    className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                                Descrição
                            </label>

                            <textarea
                                value={form.description}
                                onChange={(event) =>
                                    updateField(
                                        "description",
                                        event.target.value,
                                    )
                                }
                                rows={3}
                                placeholder="Detalhes do evento..."
                                className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 border-t border-neutral-200 bg-neutral-50 px-6 py-4">
                        <button
                            type="button"
                            onClick={onCloseAction}
                            className="h-10 rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="h-10 rounded-lg bg-[#BD9655] px-5 text-sm font-semibold text-[#002950] transition hover:bg-[#a9854b]"
                        >
                            Criar evento
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}