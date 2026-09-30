import type { EventType } from "./types";

export const eventStyles: Record<
    EventType,
    {
        label: string;
        className: string;
    }
> = {
    project: {
        label: "Projecto",
        className:
            "bg-orange-50 text-orange-700 border-orange-100",
    },

    task: {
        label: "Tarefa",
        className:
            "bg-blue-50 text-blue-700 border-blue-100",
    },

    meeting: {
        label: "Reunião",
        className:
            "bg-purple-50 text-purple-700 border-purple-100",
    },

    site_visit: {
        label: "Visita à obra",
        className:
            "bg-emerald-50 text-emerald-700 border-emerald-100",
    },

    deadline: {
        label: "Prazo",
        className:
            "bg-red-50 text-red-700 border-red-100",
    },
};

export const weekDays = [
    "Seg",
    "Ter",
    "Qua",
    "Qui",
    "Sex",
    "Sáb",
    "Dom",
];