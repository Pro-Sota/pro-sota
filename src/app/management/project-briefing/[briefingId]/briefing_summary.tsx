import type { ReactNode } from "react";

import Link from "next/link";

import {
    ArrowLeft,
    ArrowUpRight,
    BedDouble,
    Car,
    Download,
    FileText,
    FolderKanban,
    Layers,
    Mail,
    MapPin,
    Paperclip,
    Phone,
    Ruler,
    Users,
} from "lucide-react";

import FormSubmitButton from "../components/form_submit_btn";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Attachment = {
    id: string;
    brief_id: string;
    storage_path: string;
    original_name: string;
    mime_type: string;
    file_size: number;
    created_at: string;
    signed_url: string | null;
};

type Briefing = {
    id: string;
    created_at: string;
    updated_at: string;
    status: string | null;

    full_name: string;
    contact_phone: string;
    contact_email: string;
    decision_makers: string | null;
    preferred_contact: string | null;

    location_address: string | null;
    location_neighborhood: string | null;
    location_municipality: string | null;
    location_reference: string | null;
    location_city: string | null;
    location_province: string | null;
    map_link: string | null;

    land_ownership: string | null;
    land_area: number | null;
    land_length: number | null;
    land_width: number | null;
    land_type: string | null;
    existing_buildings: string | null;
    has_trees: string | null;
    infrastructure: string[];

    residents_count: number | null;
    domestic_workers: string | null;
    domestic_workers_count: number | null;
    resident_profiles: string | null;
    family_growth: string | null;
    works_from_home: string | null;
    visitors_frequency: string | null;
    pets: string | null;

    current_home_dislikes: string | null;
    current_home_likes: string | null;

    bedrooms_count: number | null;
    suites_count: number | null;
    desired_spaces: string[];
    desired_spaces_other: string | null;
    cars_count: number | null;
    kitchen_layout: string | null;
    floor_count: string | null;
    floor_count_other: string | null;
    essential_space: string | null;

    architectural_style: string[];
    architectural_style_other: string | null;
    colour_material_preferences: string | null;
    natural_light_rating: number | null;
    privacy_rating: number | null;

    reference_links: string | null;
    other_information: string | null;
    latitude: number | null;
    longitude: number | null;

    reviewed_by: string | null;
    reviewed_at: string | null;
    internal_notes: string | null;
    rejection_reason: string | null;
    converted_project_id: string | null;
};

type FormAction = (formData: FormData) => void | Promise<void>;

type Actions = {
    updateStatus: FormAction;
    saveNotes: FormAction;
    convertToProject: FormAction;
};

type Props = {
    briefing: Briefing;
    attachments: Attachment[];
    reviewerName?: string | null;
    actions?: Actions;
};

type Item = {
    label: string;
    value: unknown;
    wide?: boolean;
};

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const STATUS: Record<string, { label: string; dot: string }> = {
    pending: { label: "Novo", dot: "bg-amber-500" },
    in_review: { label: "Em análise", dot: "bg-blue-500" },
    contacted: { label: "Contactado", dot: "bg-violet-500" },
    approved: { label: "Aprovado", dot: "bg-emerald-500" },
    rejected: { label: "Rejeitado", dot: "bg-red-500" },
    converted: {
        label: "Convertido em projecto",
        dot: "bg-slate-400",
    },
};

const NEXT_STEP: Record<
    string,
    {
        hint: string;
        primary?: { label: string; status: string };
        canReject?: boolean;
        canConvert?: boolean;
    }
> = {
    pending: {
        hint: "Leia o briefing e comece a análise.",
        primary: {
            label: "Iniciar análise",
            status: "in_review",
        },
    },
    in_review: {
        hint: "Valide o terreno e o programa, depois contacte o cliente.",
        primary: {
            label: "Marcar como contactado",
            status: "contacted",
        },
        canReject: true,
    },
    contacted: {
        hint: "Decida se o projecto avança, com base na conversa com o cliente.",
        primary: {
            label: "Aprovar briefing",
            status: "approved",
        },
        canReject: true,
    },
    approved: {
        hint: "O briefing foi aprovado. Crie o projecto para começar o estudo prévio.",
        canConvert: true,
    },
    rejected: {
        hint: "Pode reabrir a análise se o cliente voltar a contactar.",
        primary: {
            label: "Reabrir análise",
            status: "in_review",
        },
    },
    converted: {
        hint: "O projecto já foi criado. Continue o trabalho a partir daí.",
    },
};

const buttonBase =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BD9655] disabled:pointer-events-none disabled:opacity-60";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function isEmpty(value: unknown) {
    return (
        value === null ||
        value === undefined ||
        value === "" ||
        (typeof value === "string" && !value.trim()) ||
        (Array.isArray(value) && value.length === 0)
    );
}

function display(value: unknown): string {
    if (typeof value === "boolean") return value ? "Sim" : "Não";
    if (Array.isArray(value)) return value.join(", ");
    return String(value);
}

/**
 * Keeps an "Outro" answer attached to the field that triggered it.
 * The custom value is displayed without hiding the original selections.
 */
function displayWithOther(value: unknown, other: string | null): unknown {
    const customValue = other?.trim();

    if (!customValue) return value;

    if (Array.isArray(value)) {
        const selections = value.filter(
            (item) => String(item).toLocaleLowerCase("pt-PT") !== "outro"
        );

        return [...selections, `Outro: ${customValue}`];
    }

    if (value === "Outro") {
        return `Outro: ${customValue}`;
    }

    if (isEmpty(value)) {
        return `Outro: ${customValue}`;
    }

    return `${display(value)}, Outro: ${customValue}`;
}

function formatDate(value: string | null | undefined) {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return null;

    return new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Africa/Luanda",
    }).format(date);
}

function formatFileSize(bytes: number) {
    if (!Number.isFinite(bytes) || bytes < 0) return "";

    if (bytes < 1024 * 1024) {
        return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isSafeExternalUrl(value: string) {
    try {
        return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
        return false;
    }
}

function initials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

function withUnit(value: number | null, unit: string) {
    return value === null ? null : `${value} ${unit}`;
}

function getFileType(mimeType: string) {
    if (mimeType.startsWith("image/")) return "IMG";
    if (mimeType === "application/pdf") return "PDF";
    if (mimeType.includes("word")) return "DOC";
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
        return "XLS";
    }

    return "FILE";
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Editorial information section.
 * Empty fields and empty sections are hidden.
 * CSS counters number only the sections that are actually rendered.
 */
function Section({
    title,
    description,
    items,
    children,
}: {
    title: string;
    description?: string;
    items?: Item[];
    children?: ReactNode;
}) {
    const filled = items?.filter((item) => !isEmpty(item.value)) ?? [];

    if (filled.length === 0 && !children) return null;

    return (
        <section className="[counter-increment:briefing-section] py-8 first:pt-5 last:pb-5 sm:py-9">
            <div className="flex items-start gap-4 sm:gap-5">
                <span
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-xs font-semibold tabular-nums tracking-wider text-[#BD9655] before:content-[counter(briefing-section,decimal-leading-zero)]"
                />

                <div className="min-w-0 flex-1">
                    <div className="border-b border-slate-100 pb-4">
                        <h2 className="text-base font-semibold text-[#002950]">
                            {title}
                        </h2>

                        {description && (
                            <p className="mt-1.5 text-sm leading-5 text-slate-500">
                                {description}
                            </p>
                        )}
                    </div>

                    {filled.length > 0 && (
                        <dl className="mt-6 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 sm:gap-y-7">
                            {filled.map((item) => (
                                <div
                                    key={item.label}
                                    className={
                                        item.wide ? "sm:col-span-2" : undefined
                                    }
                                >
                                    <dt className="text-[13px] font-medium text-slate-500">
                                        {item.label}
                                    </dt>

                                    <dd className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6 text-slate-900">
                                        {display(item.value)}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    )}

                    {children}
                </div>
            </div>
        </section>
    );
}

function SideCard({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 text-sm font-semibold text-[#002950]">
                {title}
            </h2>

            {children}
        </section>
    );
}

function NextStep({
    briefingId,
    step,
    actions,
}: {
    briefingId: string;
    step: (typeof NEXT_STEP)[string];
    actions: Actions;
}) {
    return (
        <section className="rounded-xl bg-[#002950] p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
                <FolderKanban size={17} className="text-[#BD9655]" />

                <h2 className="text-sm font-semibold text-white">
                    Próximo passo
                </h2>
            </div>

            <p className="mt-3 text-sm leading-6 text-white/75">
                {step.hint}
            </p>

            <div className="mt-6 space-y-3">
                {step.primary && (
                    <form action={actions.updateStatus}>
                        <input type="hidden" name="id" value={briefingId} />

                        <input
                            type="hidden"
                            name="status"
                            value={step.primary.status}
                        />

                        <FormSubmitButton
                            pendingLabel="A actualizar..."
                            className={`${buttonBase} w-full bg-[#BD9655] text-white hover:bg-[#a98446]`}
                        >
                            {step.primary.label}
                            <ArrowUpRight size={15} />
                        </FormSubmitButton>
                    </form>
                )}

                {step.canConvert && (
                    <form action={actions.convertToProject}>
                        <input type="hidden" name="id" value={briefingId} />

                        <FormSubmitButton
                            pendingLabel="A converter..."
                            className={`${buttonBase} w-full bg-[#BD9655] text-white hover:bg-[#a98446]`}
                        >
                            <FolderKanban size={15} />
                            Converter em projecto
                        </FormSubmitButton>
                    </form>
                )}

                {step.canReject && (
                    <details className="rounded-lg border border-white/10">
                        <summary className="flex min-h-10 cursor-pointer list-none items-center justify-center rounded-lg px-3 text-sm font-medium text-white/85 transition hover:bg-white/10">
                            Rejeitar briefing
                        </summary>

                        <form
                            action={actions.updateStatus}
                            className="space-y-4 border-t border-white/10 p-4"
                        >
                            <input
                                type="hidden"
                                name="id"
                                value={briefingId}
                            />

                            <input
                                type="hidden"
                                name="status"
                                value="rejected"
                            />

                            <div>
                                <label
                                    htmlFor="rejection_reason"
                                    className="mb-2 block text-xs font-medium text-white/75"
                                >
                                    Motivo da rejeição
                                </label>

                                <textarea
                                    id="rejection_reason"
                                    name="rejection_reason"
                                    required
                                    rows={3}
                                    className="w-full resize-y rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm leading-5 text-white placeholder:text-white/45 focus-visible:outline-2 focus-visible:outline-[#BD9655]"
                                    placeholder="Ex.: terreno sem documentação."
                                />
                            </div>

                            <FormSubmitButton
                                pendingLabel="A confirmar..."
                                className={`${buttonBase} w-full bg-red-600 text-white hover:bg-red-700`}
                            >
                                Confirmar rejeição
                            </FormSubmitButton>
                        </form>
                    </details>
                )}
            </div>
        </section>
    );
}

function Rating({
    label,
    value,
}: {
    label: string;
    value: number | null;
}) {
    if (value === null) return null;

    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <dt className="text-sm text-slate-600">{label}</dt>

            <dd className="flex items-center gap-2">
                <span
                    role="img"
                    aria-label={`${value} de 5`}
                    className="flex items-center gap-1"
                >
                    {[1, 2, 3, 4, 5].map((n) => (
                        <span
                            key={n}
                            className={`h-2 w-5 rounded-full ${n <= value
                                    ? "bg-[#BD9655]"
                                    : "bg-slate-200"
                                }`}
                        />
                    ))}
                </span>

                <span className="text-xs font-medium tabular-nums text-slate-500">
                    {value}/5
                </span>
            </dd>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function BriefingSummary({
    briefing,
    attachments,
    reviewerName,
    actions,
}: Props) {
    const currentStatus = briefing.status ?? "pending";

    const status = STATUS[currentStatus] ?? {
        label: briefing.status ?? "Novo",
        dot: "bg-slate-400",
    };

    const referenceLinks =
        briefing.reference_links
            ?.split(/\r?\n/)
            .map((url) => url.trim())
            .filter(Boolean) ?? [];

    const place = [
        briefing.location_municipality,
        briefing.location_province,
    ]
        .filter(Boolean)
        .join(", ");

    const mapLink =
        briefing.map_link && isSafeExternalUrl(briefing.map_link)
            ? briefing.map_link
            : null;

    const reviewedAt = formatDate(briefing.reviewed_at);
    const updatedAt = formatDate(briefing.updated_at);
    const createdAt = formatDate(briefing.created_at);

    const quickFacts = [
        {
            icon: Ruler,
            label: "Área",
            value: withUnit(briefing.land_area, "m²"),
        },
        {
            icon: BedDouble,
            label: "Quartos",
            value: briefing.bedrooms_count,
        },
        {
            icon: Users,
            label: "Moradores",
            value: briefing.residents_count,
        },
        {
            icon: Layers,
            label: "Pisos",
            value: briefing.floor_count,
        },
        {
            icon: Car,
            label: "Viaturas",
            value: briefing.cars_count,
        },
        {
            icon: Paperclip,
            label: "Anexos",
            value: attachments.length,
        },
    ].filter((fact) => !isEmpty(fact.value));

    const hasRatings =
        briefing.natural_light_rating !== null ||
        briefing.privacy_rating !== null;

    const nextStep = NEXT_STEP[currentStatus];

    return (
        <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
            {/* ---------------------------------------------------------------- */}
            {/* Header                                                           */}
            {/* ---------------------------------------------------------------- */}

            <header className="pb-8 sm:pb-9">
                <Link
                    href="/management/project-briefs"
                    className="mb-7 inline-flex min-h-9 items-center gap-2 rounded-lg pr-2 text-sm font-medium text-slate-500 transition hover:text-[#002950] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BD9655]"
                >
                    <ArrowLeft size={16} />
                    Voltar aos briefings
                </Link>

                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#BD9655]">
                            Briefing de projecto
                        </p>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                            <h1 className="break-words text-2xl font-semibold tracking-tight text-[#002950] sm:text-3xl">
                                {briefing.full_name || "Cliente sem nome"}
                            </h1>

                            <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700">
                                <span
                                    className={`h-2 w-2 rounded-full ${status.dot}`}
                                />
                                {status.label}
                            </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-slate-500">
                            <span className="font-medium text-slate-700">
                                BRF-{briefing.id.slice(0, 8).toUpperCase()}
                            </span>

                            {createdAt && (
                                <>
                                    <span className="text-slate-300">·</span>
                                    <span>Recebido a {createdAt}</span>
                                </>
                            )}

                            {place && (
                                <>
                                    <span className="text-slate-300">·</span>
                                    <span>{place}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact actions */}

                {(briefing.contact_phone ||
                    briefing.contact_email ||
                    mapLink) && (
                        <div className="mt-6 flex flex-wrap gap-2.5">
                            {briefing.contact_phone && (
                                <a
                                    href={`tel:${briefing.contact_phone}`}
                                    className={`${buttonBase} bg-[#002950] text-white hover:bg-[#003968]`}
                                >
                                    <Phone size={14} />
                                    {briefing.contact_phone}
                                </a>
                            )}

                            {briefing.contact_email && (
                                <a
                                    href={`mailto:${briefing.contact_email}`}
                                    className={`${buttonBase} border border-slate-200 bg-white text-[#002950] hover:bg-slate-50`}
                                >
                                    <Mail size={14} />
                                    {briefing.contact_email}
                                </a>
                            )}

                            {mapLink && (
                                <a
                                    href={mapLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`${buttonBase} border border-slate-200 bg-white text-[#002950] hover:bg-slate-50`}
                                >
                                    <MapPin size={14} />
                                    Ver localização
                                    <ArrowUpRight size={13} />
                                </a>
                            )}
                        </div>
                    )}
            </header>

            {/* ---------------------------------------------------------------- */}
            {/* Main layout                                                      */}
            {/* ---------------------------------------------------------------- */}

            <div className="grid grid-cols-1 items-start gap-7 border-t border-slate-200 pt-7 sm:gap-8 sm:pt-8 lg:grid-cols-[minmax(0,1fr)_290px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_310px] xl:gap-10">
                {/* ============================================================ */}
                {/* Main content                                                 */}
                {/* ============================================================ */}

                <div className="order-2 min-w-0 lg:order-1">
                    {/* Summary metrics */}

                    {quickFacts.length > 0 && (
                        <section className="mb-8 sm:mb-9">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                                <h2 className="text-sm font-semibold text-[#002950]">
                                    Resumo do briefing
                                </h2>

                                <span className="text-xs text-slate-500">
                                    Dados principais
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                                {quickFacts.map(
                                    ({ icon: Icon, label, value }) => (
                                        <div
                                            key={label}
                                            className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-[#BD9655]/50 sm:p-4"
                                        >
                                            <Icon
                                                size={18}
                                                strokeWidth={1.8}
                                                className="text-[#BD9655]"
                                                aria-hidden
                                            />

                                            <p className="mt-4 text-lg font-semibold leading-none text-[#002950]">
                                                {display(value)}
                                            </p>

                                            <p className="mt-2 text-xs text-slate-500">
                                                {label}
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>
                        </section>
                    )}

                    {/* Briefing sections */}

                    <div className="[counter-reset:briefing-section] divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white px-5 shadow-sm sm:px-7 lg:px-8">
                        {/* Client */}

                        <Section
                            title="Cliente"
                            description="Informações de contacto e tomada de decisões"
                            items={[
                                {
                                    label: "Quem toma as decisões",
                                    value: briefing.decision_makers,
                                },
                                {
                                    label: "Contacto preferido",
                                    value: briefing.preferred_contact,
                                },
                            ]}
                        />

                        {/* Terrain */}

                        <Section
                            title="Terreno"
                            description="Localização, dimensões e características do terreno"
                            items={[
                                {
                                    label: "Endereço",
                                    value: briefing.location_address,
                                    wide: true,
                                },
                                {
                                    label: "Bairro",
                                    value: briefing.location_neighborhood,
                                },
                                {
                                    label: "Município",
                                    value: briefing.location_municipality,
                                },
                                {
                                    label: "Cidade",
                                    value: briefing.location_city,
                                },
                                {
                                    label: "Província",
                                    value: briefing.location_province,
                                },
                                {
                                    label: "Ponto de referência",
                                    value: briefing.location_reference,
                                    wide: true,
                                },
                                {
                                    label: "Já é proprietário?",
                                    value: briefing.land_ownership,
                                },
                                {
                                    label: "Tipo de terreno",
                                    value: briefing.land_type,
                                },
                                {
                                    label: "Área aproximada",
                                    value: withUnit(briefing.land_area, "m²"),
                                },
                                {
                                    label: "Comprimento",
                                    value: withUnit(briefing.land_length, "m"),
                                },
                                {
                                    label: "Largura",
                                    value: withUnit(briefing.land_width, "m"),
                                },
                                {
                                    label: "Construções existentes",
                                    value: briefing.existing_buildings,
                                },
                                {
                                    label: "Árvores no terreno",
                                    value: briefing.has_trees,
                                },
                                {
                                    label: "Infra-estruturas",
                                    value: briefing.infrastructure,
                                    wide: true,
                                },
                            ]}
                        />

                        {/* Family */}

                        <Section
                            title="Família e estilo de vida"
                            description="Perfil dos moradores e necessidades quotidianas"
                            items={[
                                {
                                    label: "Moradores",
                                    value: briefing.residents_count,
                                },
                                {
                                    label: "Trabalhadores domésticos",
                                    value: briefing.domestic_workers,
                                },
                                {
                                    label: "Número de trabalhadores",
                                    value: briefing.domestic_workers_count,
                                },
                                {
                                    label: "Animais de estimação",
                                    value: briefing.pets,
                                },
                                {
                                    label: "Idades e perfis dos moradores",
                                    value: briefing.resident_profiles,
                                    wide: true,
                                },
                                {
                                    label: "Crescimento familiar (10 anos)",
                                    value: briefing.family_growth,
                                },
                                {
                                    label: "Trabalha em casa",
                                    value: briefing.works_from_home,
                                },
                                {
                                    label: "Visitas e eventos",
                                    value: briefing.visitors_frequency,
                                },
                                {
                                    label: "O que incomoda na casa actual",
                                    value: briefing.current_home_dislikes,
                                    wide: true,
                                },
                                {
                                    label: "O que mais gosta na casa actual",
                                    value: briefing.current_home_likes,
                                    wide: true,
                                },
                            ]}
                        />

                        {/* Architectural programme */}

                        <Section
                            title="Programa arquitectónico"
                            description="Espaços, organização e necessidades funcionais"
                            items={[
                                {
                                    label: "Quartos",
                                    value: briefing.bedrooms_count,
                                },
                                {
                                    label: "Suites",
                                    value: briefing.suites_count,
                                },
                                {
                                    label: "Viaturas",
                                    value: briefing.cars_count,
                                },
                                {
                                    label: "Pisos",
                                    value: displayWithOther(
                                        briefing.floor_count,
                                        briefing.floor_count_other
                                    ),
                                },
                                {
                                    label: "Cozinha",
                                    value: briefing.kitchen_layout,
                                },
                                {
                                    label: "Espaços desejados",
                                    value: displayWithOther(
                                        briefing.desired_spaces,
                                        briefing.desired_spaces_other
                                    ),
                                    wide: true,
                                },
                                {
                                    label: "Espaço indispensável adicional",
                                    value: briefing.essential_space,
                                    wide: true,
                                },
                            ]}
                        />

                        {/* Architectural style */}

                        <Section
                            title="Estilo arquitectónico"
                            description="Referências visuais e preferências estéticas"
                            items={[
                                {
                                    label: "Estilo arquitectónico",
                                    value: displayWithOther(
                                        briefing.architectural_style,
                                        briefing.architectural_style_other
                                    ),
                                    wide: true,
                                },
                                {
                                    label: "Cores e materiais",
                                    value: briefing.colour_material_preferences,
                                    wide: true,
                                },
                            ]}
                        >
                            {hasRatings && (
                                <div className="mt-6 rounded-xl bg-slate-50 p-4 sm:p-5">
                                    <p className="mb-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Preferências do cliente
                                    </p>

                                    <dl className="space-y-5">
                                        <Rating
                                            label="Luz natural e ligação ao exterior"
                                            value={
                                                briefing.natural_light_rating
                                            }
                                        />

                                        <Rating
                                            label="Privacidade"
                                            value={briefing.privacy_rating}
                                        />
                                    </dl>
                                </div>
                            )}
                        </Section>

                        {/* Client notes */}

                        <Section
                            title="Observações e referências"
                            description="Informações adicionais fornecidas pelo cliente"
                            items={[
                                {
                                    label: "Observações",
                                    value: briefing.other_information,
                                    wide: true,
                                },
                            ]}
                        >
                            {referenceLinks.length > 0 && (
                                <div className="mt-6">
                                    <p className="text-xs font-medium text-slate-500">
                                        Links de referência
                                    </p>

                                    <ul className="mt-3 space-y-3">
                                        {referenceLinks.map((url, index) => (
                                            <li key={`${url}-${index}`}>
                                                {isSafeExternalUrl(url) ? (
                                                    <a
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex max-w-full items-start gap-2 break-all text-sm leading-6 text-[#002950] underline decoration-slate-300 underline-offset-4 transition hover:decoration-[#BD9655]"
                                                    >
                                                        <span>{url}</span>
                                                        <ArrowUpRight
                                                            size={14}
                                                            className="mt-1 shrink-0"
                                                        />
                                                    </a>
                                                ) : (
                                                    <span className="break-all text-sm leading-6 text-slate-600">
                                                        {url}
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </Section>

                        {/* Attachments */}

                        <Section
                            title="Anexos"
                            description="Documentos e ficheiros enviados pelo cliente"
                        >
                            {attachments.length === 0 ? (
                                <p className="mt-5 text-sm leading-6 text-slate-500">
                                    O cliente não enviou anexos.
                                </p>
                            ) : (
                                <div className="mt-5">
                                    <div className="mb-4 flex items-center justify-between">
                                        <span className="text-sm text-slate-500">
                                            {attachments.length}{" "}
                                            {attachments.length === 1
                                                ? "ficheiro"
                                                : "ficheiros"}
                                        </span>
                                    </div>

                                    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {attachments.map((attachment) => (
                                            <li
                                                key={attachment.id}
                                                className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-[#BD9655]/50 sm:p-4"
                                            >
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[#002950]">
                                                    <FileText size={19} />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-slate-900">
                                                        {attachment.original_name}
                                                    </p>

                                                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                                        <span className="text-xs font-semibold uppercase tracking-wide text-[#BD9655]">
                                                            {getFileType(
                                                                attachment.mime_type
                                                            )}
                                                        </span>

                                                        <span className="text-xs text-slate-500">
                                                            {formatFileSize(
                                                                attachment.file_size
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                {attachment.signed_url &&
                                                    isSafeExternalUrl(
                                                        attachment.signed_url
                                                    ) && (
                                                        <a
                                                            href={
                                                                attachment.signed_url
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            aria-label={`Abrir ${attachment.original_name}`}
                                                            title="Abrir anexo"
                                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#002950] focus-visible:outline-2 focus-visible:outline-[#BD9655]"
                                                        >
                                                            <Download size={17} />
                                                        </a>
                                                    )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </Section>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* Sidebar                                                      */}
                {/* ============================================================ */}

                <aside className="order-1 space-y-4 lg:sticky lg:top-6 lg:order-2 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pb-2">
                    {/* Next step */}

                    {actions && nextStep && (
                        <NextStep
                            briefingId={briefing.id}
                            step={nextStep}
                            actions={actions}
                        />
                    )}

                    {/* Converted project */}

                    {briefing.converted_project_id && (
                        <Link
                            href={`/management/projects/${briefing.converted_project_id}`}
                            className="flex items-center gap-3 rounded-xl border border-[#BD9655]/30 bg-[#BD9655]/5 p-4 transition hover:border-[#BD9655]/60 hover:bg-[#BD9655]/10"
                        >
                            <FolderKanban
                                size={19}
                                className="shrink-0 text-[#BD9655]"
                            />

                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold text-[#002950]">
                                    Ver projecto
                                </span>

                                <span className="mt-1 block text-xs leading-5 text-slate-500">
                                    Este briefing já foi convertido.
                                </span>
                            </span>

                            <ArrowUpRight
                                size={16}
                                className="shrink-0 text-slate-400"
                            />
                        </Link>
                    )}

                    {/* Internal review */}

                    <SideCard title="Revisão interna">
                        <dl className="space-y-5">
                            {/* Reviewer */}

                            <div>
                                <dt className="mb-3 text-xs font-medium text-slate-500">
                                    Responsável pela revisão
                                </dt>

                                <dd>
                                    {briefing.reviewed_by ? (
                                        <div className="flex items-center gap-3">
                                            <span
                                                aria-hidden
                                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#002950] text-xs font-semibold text-white"
                                            >
                                                {reviewerName
                                                    ? initials(reviewerName)
                                                    : "?"}
                                            </span>

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-slate-900">
                                                    {reviewerName ??
                                                        "Membro da equipa"}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {reviewedAt
                                                        ? `Revisto a ${reviewedAt}`
                                                        : "Data não registada"}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm leading-6 text-slate-500">
                                            Ainda não revisto
                                        </p>
                                    )}
                                </dd>
                            </div>

                            {/* Last update */}

                            {updatedAt && (
                                <>
                                    <div className="border-t border-slate-100" />

                                    <div>
                                        <dt className="text-xs font-medium text-slate-500">
                                            Última actualização
                                        </dt>

                                        <dd className="mt-1.5 text-sm text-slate-900">
                                            {updatedAt}
                                        </dd>
                                    </div>
                                </>
                            )}

                            {/* Rejection reason */}

                            {briefing.rejection_reason && (
                                <>
                                    <div className="border-t border-slate-100" />

                                    <div>
                                        <dt className="text-xs font-medium text-red-700">
                                            Motivo de rejeição
                                        </dt>

                                        <dd className="mt-2 whitespace-pre-wrap rounded-lg bg-red-50 p-3.5 text-sm leading-6 text-red-900">
                                            {briefing.rejection_reason}
                                        </dd>
                                    </div>
                                </>
                            )}
                        </dl>
                    </SideCard>

                    {/* Internal notes */}

                    <SideCard title="Notas internas">
                        {actions ? (
                            <form
                                action={actions.saveNotes}
                                className="space-y-4"
                            >
                                <input
                                    type="hidden"
                                    name="id"
                                    value={briefing.id}
                                />

                                <textarea
                                    name="internal_notes"
                                    rows={6}
                                    defaultValue={briefing.internal_notes ?? ""}
                                    placeholder="Visita ao terreno, conversa com o cliente, dúvidas..."
                                    className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-500 transition focus-visible:border-[#BD9655] focus-visible:outline-2 focus-visible:outline-[#BD9655]/30"
                                />

                                <FormSubmitButton
                                    pendingLabel="A guardar..."
                                    className={`${buttonBase} w-full bg-[#002950] text-white hover:bg-[#003968]`}
                                >
                                    Guardar notas
                                </FormSubmitButton>
                            </form>
                        ) : (
                            <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-800">
                                {briefing.internal_notes || (
                                    <span className="text-slate-500">
                                        Sem notas internas.
                                    </span>
                                )}
                            </p>
                        )}
                    </SideCard>
                </aside>
            </div>
        </div>
    );
}