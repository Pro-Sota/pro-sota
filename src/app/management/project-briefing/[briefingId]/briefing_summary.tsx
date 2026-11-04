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
    cars_count: number | null;
    kitchen_layout: string | null;
    floor_count: string | null;
    essential_space: string | null;

    architectural_style: string[];
    colour_material_preferences: string | null;
    natural_light_rating: number | null;
    privacy_rating: number | null;

    reference_links: string | null;
    other_information: string | null;

    reviewed_by: string | null;
    reviewed_at: string | null;
    internal_notes: string | null;
    rejection_reason: string | null;
    converted_project_id: string | null;
};

type FormAction = (formData: FormData) => void | Promise<void>;

/** Server Actions. Omit `actions` entirely to render the page read-only. */
type Actions = {
    /** Reads `id`, `status` and optional `rejection_reason`. */
    updateStatus: FormAction;
    /** Reads `id` and `internal_notes`. */
    saveNotes: FormAction;
    /** Reads `id`. Should create the project and set status to "converted". */
    convertToProject: FormAction;
};

type Props = {
    briefing: Briefing;
    attachments: Attachment[];
    /** Resolved display name for `briefing.reviewed_by` (look it up server-side). */
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
    converted: { label: "Convertido em projecto", dot: "bg-slate-400" },
};

/** What the architect should do next, per status. */
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
        primary: { label: "Iniciar análise", status: "in_review" },
    },
    in_review: {
        hint: "Valide o terreno e o programa, depois contacte o cliente.",
        primary: { label: "Marcar como contactado", status: "contacted" },
        canReject: true,
    },
    contacted: {
        hint: "Decida se o projecto avança, com base na conversa com o cliente.",
        primary: { label: "Aprovar briefing", status: "approved" },
        canReject: true,
    },
    approved: {
        hint: "Crie o projecto para começar o estudo prévio.",
        canConvert: true,
    },
    rejected: {
        hint: "Pode reabrir a análise se o cliente voltar a contactar.",
        primary: { label: "Reabrir análise", status: "in_review" },
    },
    converted: {
        hint: "O projecto já foi criado. Continue o trabalho a partir de lá.",
    },
};

const buttonBase =
    "inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BD9655]";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function isEmpty(value: unknown) {
    return (
        value === null ||
        value === undefined ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
    );
}

function display(value: unknown): string {
    if (typeof value === "boolean") return value ? "Sim" : "Não";
    if (Array.isArray(value)) return value.join(", ");
    return String(value);
}

function formatDate(value: string | null | undefined) {
    if (!value) return null;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "Africa/Luanda",
    }).format(date);
}

function formatFileSize(bytes: number) {
    if (!Number.isFinite(bytes) || bytes < 0) return "";
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
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

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

/** A titled group of answers. Unanswered fields are hidden; empty groups too. */
function Section({
    title,
    items,
    children,
}: {
    title: string;
    items?: Item[];
    children?: ReactNode;
}) {
    const filled = items?.filter((item) => !isEmpty(item.value)) ?? [];

    if (filled.length === 0 && !children) return null;

    return (
        <section className="py-8 first:pt-0">
            <h2 className="text-base font-semibold text-[#002950]">{title}</h2>

            {filled.length > 0 && (
                <dl className="mt-5 grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
                    {filled.map((item) => (
                        <div
                            key={item.label}
                            className={item.wide ? "sm:col-span-2" : undefined}
                        >
                            <dt className="text-sm text-slate-500">
                                {item.label}
                            </dt>
                            <dd className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-6 text-slate-900">
                                {display(item.value)}
                            </dd>
                        </div>
                    ))}
                </dl>
            )}

            {children}
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
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-[#002950]">
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
        <section className="rounded-2xl bg-[#002950] p-5 text-white shadow-sm">
            <h2 className="text-base font-semibold">Próximo passo</h2>
            <p className="mt-1.5 text-sm leading-5 text-white/70">
                {step.hint}
            </p>

            <div className="mt-4 space-y-2">
                {step.primary && (
                    <form action={actions.updateStatus}>
                        <input type="hidden" name="id" value={briefingId} />
                        <input
                            type="hidden"
                            name="status"
                            value={step.primary.status}
                        />
                        <button
                            type="submit"
                            className={`${buttonBase} w-full justify-center bg-[#BD9655] text-white hover:bg-[#a98446]`}
                        >
                            {step.primary.label}
                        </button>
                    </form>
                )}

                {step.canConvert && (
                    <form action={actions.convertToProject}>
                        <input type="hidden" name="id" value={briefingId} />
                        <button
                            type="submit"
                            className={`${buttonBase} w-full justify-center bg-[#BD9655] text-white hover:bg-[#a98446]`}
                        >
                            <FolderKanban size={15} />
                            Converter em projecto
                        </button>
                    </form>
                )}

                {step.canReject && (
                    <details className="group rounded-lg bg-white/5">
                        <summary className="flex h-9 cursor-pointer list-none items-center justify-center rounded-lg text-sm font-medium text-white/80 transition hover:bg-white/10">
                            Rejeitar briefing
                        </summary>

                        <form
                            action={actions.updateStatus}
                            className="space-y-2 p-3"
                        >
                            <input type="hidden" name="id" value={briefingId} />
                            <input type="hidden" name="status" value="rejected" />
                            <label
                                htmlFor="rejection_reason"
                                className="text-xs text-white/70"
                            >
                                Motivo (fica registado)
                            </label>
                            <textarea
                                id="rejection_reason"
                                name="rejection_reason"
                                required
                                rows={3}
                                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus-visible:outline-2 focus-visible:outline-[#BD9655]"
                                placeholder="Ex.: terreno sem documentação."
                            />
                            <button
                                type="submit"
                                className={`${buttonBase} w-full justify-center bg-red-600 text-white hover:bg-red-700`}
                            >
                                Confirmar rejeição
                            </button>
                        </form>
                    </details>
                )}
            </div>
        </section>
    );
}

function Rating({ label, value }: { label: string; value: number | null }) {
    if (value === null) return null;

    return (
        <div>
            <dt className="text-sm text-slate-500">{label}</dt>
            <dd className="mt-2 flex items-center gap-1.5">
                <span
                    role="img"
                    aria-label={`${value} de 5`}
                    className="flex items-center gap-1"
                >
                    {[1, 2, 3, 4, 5].map((n) => (
                        <span
                            key={n}
                            className={`h-2 w-6 rounded-full ${
                                n <= value ? "bg-[#BD9655]" : "bg-slate-200"
                            }`}
                        />
                    ))}
                </span>
                <span className="ml-1 text-sm text-slate-500">{value}/5</span>
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
    const status = STATUS[briefing.status ?? "pending"] ?? {
        label: briefing.status ?? "Novo",
        dot: "bg-slate-400",
    };

    const referenceLinks =
        briefing.reference_links
            ?.split(/\r?\n/)
            .map((url) => url.trim())
            .filter(Boolean) ?? [];

    const place = [briefing.location_municipality, briefing.location_province]
        .filter(Boolean)
        .join(", ");

    const mapLink =
        briefing.map_link && isSafeExternalUrl(briefing.map_link)
            ? briefing.map_link
            : null;

    const reviewedAt = formatDate(briefing.reviewed_at);
    const updatedAt = formatDate(briefing.updated_at);

    const quickFacts = [
        { icon: Ruler, label: "Área", value: withUnit(briefing.land_area, "m²") },
        { icon: BedDouble, label: "Quartos", value: briefing.bedrooms_count },
        { icon: Users, label: "Moradores", value: briefing.residents_count },
        { icon: Layers, label: "Pisos", value: briefing.floor_count },
        { icon: Car, label: "Viaturas", value: briefing.cars_count },
        { icon: Paperclip, label: "Anexos", value: attachments.length },
    ].filter((fact) => !isEmpty(fact.value));

    const hasRatings =
        briefing.natural_light_rating !== null ||
        briefing.privacy_rating !== null;

    return (
        <div className="mx-auto max-w-6xl">
            {/* ------------------------------ Header ------------------------------ */}
            <header className="pb-8">
                <Link
                    href="/management/project-briefs"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-[#002950]"
                >
                    <ArrowLeft size={15} />
                    Briefings
                </Link>

                <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="break-words text-3xl font-semibold tracking-tight text-[#002950]">
                            {briefing.full_name || "Cliente sem nome"}
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Ref. {briefing.id.slice(0, 8).toUpperCase()}
                            {formatDate(briefing.created_at) &&
                                `, recebido a ${formatDate(briefing.created_at)}`}
                            {place && ` · ${place}`}
                        </p>
                    </div>

                    <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                        <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                        {status.label}
                    </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                    {briefing.contact_phone && (
                        <a
                            href={`tel:${briefing.contact_phone}`}
                            className={`${buttonBase} bg-[#002950] text-white hover:bg-[#003968]`}
                        >
                            <Phone size={15} />
                            {briefing.contact_phone}
                        </a>
                    )}

                    {briefing.contact_email && (
                        <a
                            href={`mailto:${briefing.contact_email}`}
                            className={`${buttonBase} bg-slate-100 text-[#002950] hover:bg-slate-200`}
                        >
                            <Mail size={15} />
                            {briefing.contact_email}
                        </a>
                    )}

                    {mapLink && (
                        <a
                            href={mapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${buttonBase} bg-slate-100 text-[#002950] hover:bg-slate-200`}
                        >
                            <MapPin size={15} />
                            Ver no mapa
                            <ArrowUpRight size={14} />
                        </a>
                    )}
                </div>
            </header>

            {/* ------------------------------ Content ----------------------------- */}
            <div className="grid grid-cols-1 items-start gap-10 border-t border-slate-200 pt-8 md:grid-cols-[minmax(0,1fr)_260px] md:gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
                <div className="min-w-0 divide-y divide-slate-200">
                    <Section
                        title="Cliente"
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

                    <Section
                        title="Terreno"
                        items={[
                            { label: "Endereço", value: briefing.location_address, wide: true },
                            { label: "Bairro", value: briefing.location_neighborhood },
                            { label: "Município", value: briefing.location_municipality },
                            { label: "Cidade", value: briefing.location_city },
                            { label: "Província", value: briefing.location_province },
                            { label: "Ponto de referência", value: briefing.location_reference },
                            { label: "Já é proprietário?", value: briefing.land_ownership },
                            { label: "Tipo de terreno", value: briefing.land_type },
                            { label: "Área aproximada", value: withUnit(briefing.land_area, "m²") },
                            { label: "Comprimento", value: withUnit(briefing.land_length, "m") },
                            { label: "Largura", value: withUnit(briefing.land_width, "m") },
                            { label: "Construções existentes", value: briefing.existing_buildings },
                            { label: "Árvores no terreno", value: briefing.has_trees },
                            { label: "Infra-estruturas", value: briefing.infrastructure, wide: true },
                        ]}
                    />

                    <Section
                        title="Família e estilo de vida"
                        items={[
                            { label: "Moradores", value: briefing.residents_count },
                            { label: "Trabalhadores domésticos", value: briefing.domestic_workers },
                            { label: "Número de trabalhadores", value: briefing.domestic_workers_count },
                            { label: "Animais de estimação", value: briefing.pets },
                            { label: "Idades e perfis", value: briefing.resident_profiles, wide: true },
                            { label: "Crescimento familiar (10 anos)", value: briefing.family_growth },
                            { label: "Trabalha em casa", value: briefing.works_from_home },
                            { label: "Visitas e eventos", value: briefing.visitors_frequency },
                            { label: "O que incomoda na casa actual", value: briefing.current_home_dislikes, wide: true },
                            { label: "O que mais gosta na casa actual", value: briefing.current_home_likes, wide: true },
                        ]}
                    />

                    <Section
                        title="Programa"
                        items={[
                            { label: "Quartos", value: briefing.bedrooms_count },
                            { label: "Suites", value: briefing.suites_count },
                            { label: "Viaturas", value: briefing.cars_count },
                            { label: "Pisos", value: briefing.floor_count },
                            { label: "Cozinha", value: briefing.kitchen_layout },
                            { label: "Espaços desejados", value: briefing.desired_spaces, wide: true },
                            { label: "Espaço indispensável adicional", value: briefing.essential_space, wide: true },
                        ]}
                    />

                    <Section
                        title="Estilo"
                        items={[
                            { label: "Estilo arquitectónico", value: briefing.architectural_style, wide: true },
                            { label: "Cores e materiais", value: briefing.colour_material_preferences, wide: true },
                        ]}
                    >
                        {hasRatings && (
                            <dl className="mt-5 grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
                                <Rating
                                    label="Luz natural e ligação ao exterior"
                                    value={briefing.natural_light_rating}
                                />
                                <Rating
                                    label="Privacidade"
                                    value={briefing.privacy_rating}
                                />
                            </dl>
                        )}
                    </Section>

                    <Section
                        title="Notas do cliente"
                        items={[
                            { label: "Observações", value: briefing.other_information, wide: true },
                        ]}
                    >
                        {referenceLinks.length > 0 && (
                            <div className="mt-5">
                                <p className="text-sm text-slate-500">
                                    Links de referência
                                </p>

                                <ul className="mt-2 space-y-1.5">
                                    {referenceLinks.map((url, index) => (
                                        <li key={`${url}-${index}`}>
                                            {isSafeExternalUrl(url) ? (
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex max-w-full items-center gap-1.5 break-all text-sm text-[#002950] underline decoration-slate-300 underline-offset-4 transition hover:decoration-[#BD9655]"
                                                >
                                                    {url}
                                                    <ArrowUpRight
                                                        size={14}
                                                        className="shrink-0"
                                                    />
                                                </a>
                                            ) : (
                                                <span className="break-all text-sm text-slate-600">
                                                    {url}
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </Section>

                    <Section title="Anexos">
                        {attachments.length === 0 ? (
                            <p className="mt-3 text-sm text-slate-500">
                                O cliente não enviou anexos.
                            </p>
                        ) : (
                            <ul className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
                                {attachments.map((attachment) => (
                                    <li
                                        key={attachment.id}
                                        className="flex items-center gap-3 px-4 py-3"
                                    >
                                        <FileText
                                            size={18}
                                            className="shrink-0 text-slate-400"
                                        />

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-slate-900">
                                                {attachment.original_name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {formatFileSize(attachment.file_size)}
                                            </p>
                                        </div>

                                        {attachment.signed_url && (
                                            <a
                                                href={attachment.signed_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={`Abrir ${attachment.original_name}`}
                                                title="Abrir anexo"
                                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#002950]"
                                            >
                                                <Download size={16} />
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Section>
                </div>

                {/* ------------------------------ Sidebar ----------------------------- */}
                <aside className="space-y-4 md:sticky md:top-6">
                    {/* Próximo passo */}
                    {actions && NEXT_STEP[briefing.status ?? "pending"] && (
                        <NextStep
                            briefingId={briefing.id}
                            step={NEXT_STEP[briefing.status ?? "pending"]}
                            actions={actions}
                        />
                    )}

                    {/* Resumo rápido */}
                    {quickFacts.length > 0 && (
                        <SideCard title="Resumo">
                            <ul className="grid grid-cols-2 gap-2">
                                {quickFacts.map(({ icon: Icon, label, value }) => (
                                    <li
                                        key={label}
                                        className="rounded-xl bg-slate-50 px-3 py-2.5"
                                    >
                                        <Icon
                                            size={15}
                                            className="text-[#BD9655]"
                                            aria-hidden
                                        />
                                        <p className="mt-2 text-lg font-semibold leading-none text-[#002950]">
                                            {display(value)}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {label}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </SideCard>
                    )}

                    {/* Revisão interna */}
                    <SideCard title="Revisão interna">
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm text-slate-500">Estado</dt>
                                <dd className="mt-1 flex items-center gap-2 text-[15px] font-medium text-slate-900">
                                    <span
                                        className={`h-2 w-2 rounded-full ${status.dot}`}
                                    />
                                    {status.label}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm text-slate-500">
                                    Revisão
                                </dt>
                                <dd className="mt-1.5">
                                    {briefing.reviewed_by ? (
                                        <div className="flex items-center gap-3">
                                            <span
                                                aria-hidden
                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#002950] text-xs font-semibold text-white"
                                            >
                                                {reviewerName
                                                    ? initials(reviewerName)
                                                    : "?"}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-[15px] font-medium text-slate-900">
                                                    {reviewerName ??
                                                        "Membro da equipa"}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {reviewedAt
                                                        ? `a ${reviewedAt}`
                                                        : "Data não registada"}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-[15px] text-slate-500">
                                            Ainda não revisto
                                        </p>
                                    )}
                                </dd>
                            </div>

                            {updatedAt && (
                                <div>
                                    <dt className="text-sm text-slate-500">
                                        Última actualização
                                    </dt>
                                    <dd className="mt-1 text-[15px] text-slate-900">
                                        {updatedAt}
                                    </dd>
                                </div>
                            )}

                            <div>
                                <dt className="text-sm text-slate-500">
                                    Notas internas
                                </dt>
                                <dd className="mt-1.5">
                                    {actions ? (
                                        <form
                                            action={actions.saveNotes}
                                            className="space-y-2"
                                        >
                                            <input
                                                type="hidden"
                                                name="id"
                                                value={briefing.id}
                                            />
                                            <textarea
                                                name="internal_notes"
                                                rows={5}
                                                defaultValue={
                                                    briefing.internal_notes ?? ""
                                                }
                                                placeholder="Visita ao terreno, conversa com o cliente, dúvidas..."
                                                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus-visible:border-[#BD9655] focus-visible:outline-2 focus-visible:outline-[#BD9655]/30"
                                            />
                                            <button
                                                type="submit"
                                                className={`${buttonBase} bg-slate-100 text-[#002950] hover:bg-slate-200`}
                                            >
                                                Guardar notas
                                            </button>
                                        </form>
                                    ) : (
                                        <p className="whitespace-pre-wrap rounded-xl bg-slate-50 px-3 py-2.5 text-sm leading-6 text-slate-800">
                                            {briefing.internal_notes || (
                                                <span className="text-slate-400">
                                                    Sem notas.
                                                </span>
                                            )}
                                        </p>
                                    )}
                                </dd>
                            </div>

                            {briefing.rejection_reason && (
                                <div>
                                    <dt className="text-sm text-red-700">
                                        Motivo de rejeição
                                    </dt>
                                    <dd className="mt-1.5 whitespace-pre-wrap rounded-xl bg-red-50 px-3 py-2.5 text-sm leading-6 text-red-900">
                                        {briefing.rejection_reason}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </SideCard>

                    {/* Projecto convertido */}
                    {briefing.converted_project_id && (
                        <Link
                            href={`/management/projects/${briefing.converted_project_id}`}
                            className="flex items-center gap-3 rounded-2xl border border-[#BD9655]/30 bg-[#BD9655]/5 p-4 transition hover:border-[#BD9655]/60"
                        >
                            <FolderKanban
                                size={20}
                                className="shrink-0 text-[#BD9655]"
                            />
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-medium text-[#002950]">
                                    Ver projecto
                                </span>
                                <span className="block text-xs text-slate-500">
                                    Este briefing já foi convertido.
                                </span>
                            </span>
                            <ArrowUpRight size={16} className="text-slate-400" />
                        </Link>
                    )}

                    {/* Contacto */}
                    <SideCard title="Contacto">
                        <dl className="space-y-4">
                            {briefing.preferred_contact && (
                                <div>
                                    <dt className="text-sm text-slate-500">
                                        Prefere ser contactado por
                                    </dt>
                                    <dd className="mt-1 text-[15px] text-slate-900">
                                        {briefing.preferred_contact}
                                    </dd>
                                </div>
                            )}
                        </dl>

                        <div className="mt-4 flex flex-col gap-2">
                            {briefing.contact_phone && (
                                <a
                                    href={`tel:${briefing.contact_phone}`}
                                    className={`${buttonBase} justify-center bg-[#002950] text-white hover:bg-[#003968]`}
                                >
                                    <Phone size={15} />
                                    Ligar
                                </a>
                            )}

                            {briefing.contact_email && (
                                <a
                                    href={`mailto:${briefing.contact_email}`}
                                    className={`${buttonBase} justify-center bg-slate-100 text-[#002950] hover:bg-slate-200`}
                                >
                                    <Mail size={15} />
                                    Enviar email
                                </a>
                            )}

                            {mapLink && (
                                <a
                                    href={mapLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`${buttonBase} justify-center bg-slate-100 text-[#002950] hover:bg-slate-200`}
                                >
                                    <MapPin size={15} />
                                    Abrir mapa
                                </a>
                            )}
                        </div>
                    </SideCard>
                </aside>
            </div>
        </div>
    );
}