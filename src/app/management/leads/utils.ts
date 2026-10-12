
import type { Lead, LeadStatus } from "@/services/leads";

export type LeadsView = "pipeline" | "closed" | "all";
export type LeadsSort = "newest" | "budget";

export const PIPELINE_COLUMNS: {
    id: LeadStatus;
    title: string;
}[] = [
    { id: "new", title: "Novos" },
    { id: "contacted", title: "Contactados" },
    { id: "qualified", title: "Qualificados" },
    { id: "proposal", title: "Proposta enviada" },
    { id: "negotiation", title: "Negociação" },
];

export const CLOSED_COLUMNS: {
    id: LeadStatus;
    title: string;
}[] = [
    { id: "won", title: "Ganhos" },
    { id: "lost", title: "Perdidos" },
];

export const ALL_COLUMNS = [
    ...PIPELINE_COLUMNS,
    ...CLOSED_COLUMNS,
];

export const STATUS_LABELS: Record<LeadStatus, string> = {
    new: "Novo",
    contacted: "Contactado",
    qualified: "Qualificado",
    proposal: "Proposta enviada",
    negotiation: "Negociação",
    won: "Ganho",
    lost: "Perdido",
};

export const VIEW_LABELS: Record<LeadsView, string> = {
    pipeline: "Pipeline",
    closed: "Fechados",
    all: "Todos",
};

export function isClosedLead(lead: Lead) {
    return lead.status === "won" || lead.status === "lost";
}

export function getInitials(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

export function formatCurrency(value: number | null) {
    if (value === null || !Number.isFinite(value)) {
        return "Não definido";
    }

    return `${new Intl.NumberFormat("pt-AO", {
        maximumFractionDigits: 0,
    }).format(value)} Kz`;
}

export function formatCompactCurrency(value: number) {
    if (!Number.isFinite(value)) {
        return "0 Kz";
    }

    const absoluteValue = Math.abs(value);

    if (absoluteValue >= 1_000_000) {
        return `${(value / 1_000_000).toLocaleString("pt-AO", {
            maximumFractionDigits: 1,
        })} M Kz`;
    }

    if (absoluteValue >= 10_000) {
        return `${Math.round(value / 1_000)} mil Kz`;
    }

    return formatCurrency(value);
}

export function formatDate(value: string) {
    const date = new Date(value);

    if (!value || Number.isNaN(date.getTime())) {
        return "Data não disponível";
    }

    return new Intl.DateTimeFormat("pt-AO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

export function filterAndSortLeads(
    leads: Lead[],
    search: string,
    sortBy: LeadsSort,
) {
    const query = search.trim().toLocaleLowerCase("pt-AO");

    return leads
        .filter((lead) => {
            if (!query) return true;

            const searchableFields = [
                lead.name,
                lead.company,
                lead.project_name,
                lead.project_type,
                lead.location,
                lead.email,
                lead.phone,
            ];

            return searchableFields.some((field) =>
                field?.toLocaleLowerCase("pt-AO").includes(query),
            );
        })
        .sort((a, b) => {
            if (sortBy === "budget") {
                return (b.budget ?? 0) - (a.budget ?? 0);
            }

            return (
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            );
        });
}
