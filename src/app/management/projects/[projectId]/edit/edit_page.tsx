"use client";

/* ==========================================================================
   PART 1 — Imports, types and constants
   ========================================================================== */

import { useEffect, useRef, useState } from "react";
import type {
    ChangeEvent,
    FormEvent,
    ReactNode,
    SelectHTMLAttributes,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Banknote,
    Building2,
    ChevronDown,
    ChevronRight,
    CircleDot,
    ImagePlus,
    Loader2,
    MapPin,
    Save,
    Upload,
    X,
} from "lucide-react";

import {
    PROJECT_STATUSES,
    PROJECT_TYPES,
    PROJECT_URGENCIES,
    type ActionResult,
    type ProjectPayload,
} from "@/app/management/projects/types";

type Values = {
    [K in keyof ProjectPayload]: string;
};

type Errors = Partial<
    Record<keyof ProjectPayload | "cover_image", string>
>;

export interface EditProjectFormProps {
    projectId: string;
    projectCode?: string;
    initialValues: Partial<ProjectPayload>;
    clients: { id: string; name: string }[];

    /** Server action already bound to the project ID. */
    onSave: (payload: ProjectPayload) => Promise<ActionResult>;

    /** Optional image upload action returning the public URL. */
    onUploadImage?: (
        file: File,
    ) => Promise<
        | { success: true; url: string }
        | { success: false; error: string }
    >;

    backHref: string;
}

const FORM_ID = "edit-project-form";

const URGENCY_LABELS: Record<string, string> = {
    Low: "Baixa",
    Medium: "Média",
    High: "Alta",
    Critical: "Crítica",
};

const URGENCY_DOT: Record<string, string> = {
    Low: "bg-emerald-400",
    Medium: "bg-amber-400",
    High: "bg-orange-500",
    Critical: "bg-red-500",
};

const PROVINCES = [
    "Bengo",
    "Benguela",
    "Bié",
    "Cabinda",
    "Cuando",
    "Cuanza Norte",
    "Cuanza Sul",
    "Cubango",
    "Cunene",
    "Huambo",
    "Huíla",
    "Icolo e Bengo",
    "Luanda",
    "Lunda Norte",
    "Lunda Sul",
    "Malanje",
    "Moxico",
    "Moxico Leste",
    "Namibe",
    "Uíge",
    "Zaire",
];

const EMPTY: Values = {
    project_code: "",
    title: "",
    description: "",
    type: "",
    status: "Em observação",
    urgency: "Medium",
    client_id: "",
    province: "",
    municipality: "",
    city: "",
    address_line_1: "",
    address_line_2: "",
    location: "",
    latitude: "",
    longitude: "",
    budget: "",
    estimated_cost: "",
    start_date: "",
    end_date: "",
    image: "",
};

const inputClass =
    "w-full rounded-xl border bg-[#FBFBFA] px-3.5 py-2.5 text-sm text-[#002950] outline-none transition placeholder:text-gray-400 hover:border-gray-300 hover:bg-white focus:border-[#BD9655] focus:bg-white focus:ring-4 focus:ring-[#BD9655]/15 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 read-only:cursor-default read-only:bg-gray-50 read-only:text-gray-500";

const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BD9655] focus-visible:ring-offset-2";


/* ==========================================================================
   PART 2 — Value conversion, validation and payload helpers
   ========================================================================== */

function toValues(initial: Partial<ProjectPayload>): Values {
    const output = { ...EMPTY };

    (Object.keys(EMPTY) as (keyof ProjectPayload)[]).forEach((key) => {
        const value = initial[key];

        if (value !== null && value !== undefined) {
            output[key] = String(value);
        }
    });

    return output;
}

const orNull = (value: string) =>
    value.trim() === "" ? null : value.trim();

const numOrNull = (value: string) => {
    if (value.trim() === "") return null;

    const number = Number(value);

    return Number.isFinite(number) ? number : null;
};

function validate(values: Values): Errors {
    const errors: Errors = {};

    if (!values.project_code.trim()) {
        errors.project_code = "Indique o código do projecto.";
    }

    if (!values.title.trim()) {
        errors.title = "O nome do projecto é obrigatório.";
    }

    if (!values.municipality.trim()) {
        errors.municipality = "Indique o município.";
    }

    (["budget", "estimated_cost"] as const).forEach((key) => {
        const value = values[key].trim();

        if (value !== "" && (!Number.isFinite(Number(value)) || Number(value) < 0)) {
            errors[key] = "Introduza um valor igual ou superior a zero.";
        }
    });

    if (values.latitude.trim() !== "") {
        const latitude = Number(values.latitude);

        if (!Number.isFinite(latitude) || Math.abs(latitude) > 90) {
            errors.latitude = "Introduza uma latitude entre -90 e 90.";
        }
    }

    if (values.longitude.trim() !== "") {
        const longitude = Number(values.longitude);

        if (!Number.isFinite(longitude) || Math.abs(longitude) > 180) {
            errors.longitude = "Introduza uma longitude entre -180 e 180.";
        }
    }

    if (
        values.start_date &&
        values.end_date &&
        values.end_date < values.start_date
    ) {
        errors.end_date =
            "A data de fim não pode ser anterior à data de início.";
    }

    return errors;
}

function toPayload(
    values: Values,
    image: string | null,
): ProjectPayload {
    return {
        project_code: values.project_code.trim(),
        title: values.title.trim(),
        description: orNull(values.description),
        type: orNull(values.type),
        status: values.status as ProjectPayload["status"],
        urgency: values.urgency as ProjectPayload["urgency"],
        client_id: orNull(values.client_id),
        province: orNull(values.province),
        municipality: values.municipality.trim(),
        city: orNull(values.city),
        address_line_1: orNull(values.address_line_1),
        address_line_2: orNull(values.address_line_2),
        location: orNull(values.location),
        latitude: numOrNull(values.latitude),
        longitude: numOrNull(values.longitude),
        budget: numOrNull(values.budget),
        estimated_cost: numOrNull(values.estimated_cost),
        start_date: orNull(values.start_date),
        end_date: orNull(values.end_date),
        image,
    };
}


/* ==========================================================================
   PART 3 — Reusable card, field and select components
   ========================================================================== */

function Card({
    icon,
    title,
    description,
    children,
}: {
    icon: ReactNode;
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-2xl border border-[#E8E8E5] bg-white shadow-[0_1px_2px_rgba(0,41,80,0.04)]">
            <div className="flex items-center gap-4 border-b border-[#F0F0ED] px-5 py-4 sm:px-7 sm:py-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#BD9655]/12 text-[#8E6B2F] ring-1 ring-inset ring-[#BD9655]/25">
                    {icon}
                </div>

                <div className="min-w-0">
                    <h2 className="text-base font-semibold tracking-tight">
                        {title}
                    </h2>
                    <p className="mt-0.5 text-sm text-gray-500">
                        {description}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-x-5 gap-y-5 px-5 py-6 sm:grid-cols-2 sm:px-7">
                {children}
            </div>
        </section>
    );
}

function Field({
    id,
    label,
    required,
    error,
    hint,
    wide,
    children,
}: {
    id: string;
    label: string;
    required?: boolean;
    error?: string;
    hint?: string;
    wide?: boolean;
    children: ReactNode;
}) {
    const message = error ?? hint;

    return (
        <div className={`min-w-0 space-y-1.5 ${wide ? "sm:col-span-2" : ""}`}>
            <label
                htmlFor={id}
                className="block text-[13px] font-medium text-[#002950]/90"
            >
                {label}

                {required && (
                    <span className="ml-0.5 text-red-500" aria-hidden="true">
                        *
                    </span>
                )}
            </label>

            {children}

            {message && (
                <p
                    id={`${id}-msg`}
                    className={`text-xs leading-5 ${
                        error ? "text-red-600" : "text-gray-500"
                    }`}
                >
                    {message}
                </p>
            )}
        </div>
    );
}

function SelectBox({
    children,
    className = "",
    ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <div className="relative">
            <select
                {...props}
                className={`${className} cursor-pointer appearance-none pr-10`}
            >
                {children}
            </select>

            <ChevronDown
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
        </div>
    );
}

function Chip({
    children,
    dotClass,
}: {
    children: ReactNode;
    dotClass?: string;
}) {
    return (
        <span className="inline-flex max-w-full items-center gap-1.5 truncate rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/90 ring-1 ring-inset ring-white/15">
            {dotClass && (
                <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`}
                />
            )}
            <span className="truncate">{children}</span>
        </span>
    );
}


/* ==========================================================================
   PART 4 — Form state, input bindings and image handling
   ========================================================================== */

export default function EditProjectForm({
    projectId,
    projectCode,
    initialValues,
    clients,
    onSave,
    onUploadImage,
    backHref,
}: EditProjectFormProps) {
    const router = useRouter();
    const fileRef = useRef<HTMLInputElement>(null);

    const [values, setValues] = useState<Values>(
        () => toValues(initialValues),
    );

    // Snapshot used to detect unsaved changes.
    const initialSnapshot = useRef<string>(
        JSON.stringify(toValues(initialValues)),
    );
    const initialImage = useRef<string | null>(initialValues.image ?? null);

    const [errors, setErrors] = useState<Errors>({});

    const [coverPreview, setCoverPreview] = useState<string | null>(
        initialValues.image ?? null,
    );

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const dirty =
        JSON.stringify(values) !== initialSnapshot.current ||
        coverPreview !== initialImage.current;

    // Avoid leaking temporary object URLs when the preview changes or unmounts.
    useEffect(() => {
        return () => {
            if (coverPreview?.startsWith("blob:")) {
                URL.revokeObjectURL(coverPreview);
            }
        };
    }, [coverPreview]);

    function clearError(key: keyof Errors) {
        setErrors((current) => {
            if (!current[key]) return current;

            const next = { ...current };
            delete next[key];

            return next;
        });
    }

    function bind(key: keyof ProjectPayload) {
        const hasError = Boolean(errors[key]);

        return {
            id: key,
            name: key,
            value: values[key],

            onChange: (
                event: ChangeEvent<
                    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
                >,
            ) => {
                const value = event.target.value;

                setValues((current) => ({
                    ...current,
                    [key]: value,
                }));

                clearError(key);
            },

            "aria-invalid": hasError || undefined,
            "aria-describedby": hasError ? `${key}-msg` : undefined,

            className: `${inputClass} ${
                hasError ? "border-red-400" : "border-[#E4E5E3]"
            }`,
        };
    }

    function pickImage(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file) return;

        const fail = (message: string) => {
            setErrors((current) => ({
                ...current,
                cover_image: message,
            }));

            event.target.value = "";
        };

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            fail("Utilize uma imagem JPG, PNG ou WebP.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            fail("A imagem não pode exceder 5 MB.");
            return;
        }

        clearError("cover_image");

        setImageFile(file);
        setCoverPreview(URL.createObjectURL(file));
    }

    function removeImage() {
        setCoverPreview(null);
        setImageFile(null);

        if (fileRef.current) {
            fileRef.current.value = "";
        }

        clearError("cover_image");
    }


    /* ==========================================================================
       PART 5 — Form submission and save handling
       ========================================================================== */

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (saving) return;

        setSubmitError(null);

        const foundErrors = validate(values);

        setErrors(foundErrors);

        const firstError = Object.keys(foundErrors)[0];

        if (firstError) {
            document.getElementById(firstError)?.focus();
            return;
        }

        setSaving(true);

        try {
            // Preserve the existing URL unless the user removed the image.
            let image =
                coverPreview && !imageFile ? coverPreview : null;

            if (imageFile) {
                if (!onUploadImage) {
                    setSubmitError(
                        "O carregamento de imagens ainda não está configurado.",
                    );
                    return;
                }

                const upload = await onUploadImage(imageFile);

                if (!upload.success) {
                    setSubmitError(upload.error);
                    return;
                }

                image = upload.url;
            }

            const result = await onSave(toPayload(values, image));

            if (!result.success) {
                setSubmitError(result.error);
                return;
            }

            router.push(backHref);
            router.refresh();
        } catch {
            setSubmitError(
                "Não foi possível guardar as alterações. Tente novamente.",
            );
        } finally {
            setSaving(false);
        }
    }


    /* ==========================================================================
       PART 6 — Page header, identification, location and budget cards
       ========================================================================== */

    const displayCode = projectCode || values.project_code || projectId;
    const displayTitle = values.title.trim() || "Projecto sem nome";
    const place = [values.municipality.trim(), values.province]
        .filter(Boolean)
        .join(", ");

    const saveLabel = saving ? "A guardar…" : "Guardar alterações";
    const saveIcon = saving ? (
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
    ) : (
        <Save size={16} aria-hidden="true" />
    );

    return (
        <div className="min-h-screen bg-[#F5F5F2] text-[#002950]">
            <header className="relative isolate overflow-hidden bg-[#002950] text-white">
                {/* Soft gold glow, top-right */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-24 -top-32 -z-10 h-80 w-80 rounded-full bg-[#BD9655]/25 blur-3xl"
                />
                {/* Gold hairline along the bottom edge */}
                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-[#BD9655] to-transparent"
                />

                <div className="mx-auto max-w-6xl px-4 pb-8 pt-5 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between gap-4">
                        <nav
                            aria-label="Navegação"
                            className="flex min-w-0 items-center gap-1.5 text-xs text-white/60"
                        >
                            <button
                                type="button"
                                onClick={() => router.back()}
                                aria-label="Voltar"
                                className={`mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 ${focusRing} focus-visible:ring-offset-[#002950]`}
                            >
                                <ArrowLeft size={16} aria-hidden="true" />
                            </button>

                            <Link
                                href={backHref}
                                className="shrink-0 transition hover:text-white"
                            >
                                Projectos
                            </Link>

                            <ChevronRight
                                size={14}
                                aria-hidden="true"
                                className="shrink-0 text-white/30"
                            />

                            <span className="truncate">{displayCode}</span>

                            <ChevronRight
                                size={14}
                                aria-hidden="true"
                                className="shrink-0 text-white/30"
                            />

                            <span className="shrink-0 text-white">Editar</span>
                        </nav>

                        {/* Desktop actions */}
                        <div className="hidden items-center gap-2 md:flex">
                            <button
                                type="button"
                                onClick={() => router.push(backHref)}
                                disabled={saving}
                                className={`rounded-xl px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-60 ${focusRing} focus-visible:ring-offset-[#002950]`}
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                form={FORM_ID}
                                disabled={saving}
                                className={`inline-flex items-center gap-2 rounded-xl bg-[#BD9655] px-4 py-2 text-sm font-semibold text-[#002950] shadow-sm transition hover:bg-[#CCA766] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing} focus-visible:ring-offset-[#002950]`}
                            >
                                {saveIcon}
                                {saveLabel}
                            </button>
                        </div>
                    </div>

                    <div className="mt-7 flex items-center gap-4 sm:gap-5">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/10 ring-1 ring-inset ring-white/20 sm:h-20 sm:w-20">
                            {coverPreview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={coverPreview}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <Building2
                                    size={28}
                                    aria-hidden="true"
                                    className="text-[#BD9655]"
                                />
                            )}
                        </div>

                        <div className="min-w-0">
                            <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                                {displayTitle}
                            </h1>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                {values.project_code && (
                                    <Chip>{values.project_code}</Chip>
                                )}

                                {values.status && (
                                    <Chip dotClass="bg-[#BD9655]">
                                        {values.status}
                                    </Chip>
                                )}

                                <Chip
                                    dotClass={
                                        URGENCY_DOT[values.urgency] ??
                                        "bg-gray-400"
                                    }
                                >
                                    Urgência{" "}
                                    {(
                                        URGENCY_LABELS[values.urgency] ??
                                        values.urgency
                                    ).toLowerCase()}
                                </Chip>

                                {place && (
                                    <Chip>
                                        <span className="inline-flex items-center gap-1">
                                            <MapPin
                                                size={12}
                                                aria-hidden="true"
                                            />
                                            {place}
                                        </span>
                                    </Chip>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <p className="mb-6 text-sm text-gray-500">
                    Os campos assinalados com{" "}
                    <span className="text-red-500">*</span> são obrigatórios.
                </p>

                {submitError && (
                    <div
                        role="alert"
                        className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        {submitError}
                    </div>
                )}

                <form id={FORM_ID} onSubmit={handleSubmit} noValidate>
                    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                        {/* Main column */}
                        <div className="min-w-0 space-y-6">
                            <Card
                                icon={<Building2 size={20} aria-hidden="true" />}
                                title="Identificação"
                                description="Nome, código e descrição do projecto."
                            >
                                <Field
                                    id="title"
                                    label="Nome do projecto"
                                    required
                                    error={errors.title}
                                    wide
                                >
                                    <input
                                        {...bind("title")}
                                        placeholder="Ex.: Residencial Talatona"
                                    />
                                </Field>

                                <Field
                                    id="project_code"
                                    label="Código"
                                    required
                                    error={errors.project_code}
                                >
                                    <input
                                        {...bind("project_code")}
                                        placeholder="Ex.: PS-2026-001"
                                    />
                                </Field>

                                <Field id="type" label="Tipo de projecto">
                                    <SelectBox {...bind("type")}>
                                        <option value="">Seleccionar tipo</option>

                                        {PROJECT_TYPES.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </SelectBox>
                                </Field>

                                <Field id="client_id" label="Cliente" wide>
                                    <SelectBox {...bind("client_id")}>
                                        <option value="">
                                            Sem cliente associado
                                        </option>

                                        {clients.map((client) => (
                                            <option
                                                key={client.id}
                                                value={client.id}
                                            >
                                                {client.name}
                                            </option>
                                        ))}
                                    </SelectBox>
                                </Field>

                                <Field id="description" label="Descrição" wide>
                                    <textarea
                                        {...bind("description")}
                                        rows={4}
                                        placeholder="Âmbito dos trabalhos e objectivos do projecto…"
                                        className={`${bind("description").className} resize-y`}
                                    />
                                </Field>
                            </Card>

                            <Card
                                icon={<MapPin size={20} aria-hidden="true" />}
                                title="Localização"
                                description="Onde o projecto será executado."
                            >
                                <Field id="country" label="País">
                                    <input
                                        id="country"
                                        value="Angola"
                                        readOnly
                                        aria-readonly="true"
                                        className={`${inputClass} border-[#E4E5E3]`}
                                    />
                                </Field>

                                <Field id="province" label="Província">
                                    <SelectBox {...bind("province")}>
                                        <option value="">
                                            Seleccionar província
                                        </option>

                                        {PROVINCES.map((province) => (
                                            <option
                                                key={province}
                                                value={province}
                                            >
                                                {province}
                                            </option>
                                        ))}
                                    </SelectBox>
                                </Field>

                                <Field
                                    id="municipality"
                                    label="Município"
                                    required
                                    error={errors.municipality}
                                >
                                    <input
                                        {...bind("municipality")}
                                        placeholder="Ex.: Talatona"
                                    />
                                </Field>

                                <Field id="city" label="Cidade">
                                    <input {...bind("city")} />
                                </Field>

                                <Field
                                    id="address_line_1"
                                    label="Morada"
                                    wide
                                >
                                    <input
                                        {...bind("address_line_1")}
                                        autoComplete="address-line1"
                                    />
                                </Field>

                                <Field
                                    id="address_line_2"
                                    label="Complemento"
                                    wide
                                >
                                    <input
                                        {...bind("address_line_2")}
                                        autoComplete="address-line2"
                                    />
                                </Field>

                                <Field
                                    id="reference_point"
                                    label="Ponto de referência"
                                    wide
                                >
                                    <input
                                        {...bind("location")}
                                        placeholder="Ex.: junto à Via Expressa"
                                    />
                                </Field>

                                <Field
                                    id="latitude"
                                    label="Latitude"
                                    error={errors.latitude}
                                >
                                    <input
                                        {...bind("latitude")}
                                        type="number"
                                        step="any"
                                        inputMode="decimal"
                                        placeholder="-8.9167"
                                    />
                                </Field>

                                <Field
                                    id="longitude"
                                    label="Longitude"
                                    error={errors.longitude}
                                >
                                    <input
                                        {...bind("longitude")}
                                        type="number"
                                        step="any"
                                        inputMode="decimal"
                                        placeholder="13.1833"
                                    />
                                </Field>
                            </Card>

                            <Card
                                icon={<Banknote size={20} aria-hidden="true" />}
                                title="Orçamento e prazos"
                                description="Valores em kwanzas (AOA)."
                            >
                                <Field
                                    id="budget"
                                    label="Orçamento"
                                    error={errors.budget}
                                >
                                    <input
                                        {...bind("budget")}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        inputMode="decimal"
                                    />
                                </Field>

                                <Field
                                    id="estimated_cost"
                                    label="Custo estimado"
                                    error={errors.estimated_cost}
                                >
                                    <input
                                        {...bind("estimated_cost")}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        inputMode="decimal"
                                    />
                                </Field>

                                <Field id="start_date" label="Data de início">
                                    <input
                                        {...bind("start_date")}
                                        type="date"
                                    />
                                </Field>

                                <Field
                                    id="end_date"
                                    label="Data de fim"
                                    error={errors.end_date}
                                >
                                    <input
                                        {...bind("end_date")}
                                        type="date"
                                        min={values.start_date || undefined}
                                    />
                                </Field>
                            </Card>
                        </div>


                        {/* ==========================================================================
                           PART 7 — Sidebar, cover image and sticky action bar
                           ========================================================================== */}

                        <aside className="min-w-0 space-y-6 lg:sticky lg:top-6">
                            {/* Status and urgency */}
                            <section className="rounded-2xl border border-[#E8E8E5] bg-white p-5 shadow-[0_1px_2px_rgba(0,41,80,0.04)]">
                                <h2 className="text-sm font-semibold">
                                    Estado e prioridade
                                </h2>

                                <div className="mt-4 space-y-4">
                                    <Field id="status" label="Estado">
                                        <SelectBox {...bind("status")}>
                                            {PROJECT_STATUSES.map((status) => (
                                                <option
                                                    key={status}
                                                    value={status}
                                                >
                                                    {status}
                                                </option>
                                            ))}
                                        </SelectBox>
                                    </Field>

                                    <Field id="urgency" label="Urgência">
                                        <SelectBox {...bind("urgency")}>
                                            {PROJECT_URGENCIES.map((urgency) => (
                                                <option
                                                    key={urgency}
                                                    value={urgency}
                                                >
                                                    {URGENCY_LABELS[urgency] ?? urgency}
                                                </option>
                                            ))}
                                        </SelectBox>
                                    </Field>
                                </div>
                            </section>

                            {/* Cover image */}
                            <section className="overflow-hidden rounded-2xl border border-[#E8E8E5] bg-white shadow-[0_1px_2px_rgba(0,41,80,0.04)]">
                                <div className="border-b border-[#F0F0ED] px-5 py-4">
                                    <h2 className="text-sm font-semibold">
                                        Imagem de capa
                                    </h2>

                                    <p className="mt-1 text-xs text-gray-500">
                                        JPG, PNG ou WebP, até 5 MB
                                    </p>
                                </div>

                                <div className="p-5">
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={pickImage}
                                        className="hidden"
                                        aria-label="Seleccionar imagem do projecto"
                                    />

                                    {coverPreview ? (
                                        <div className="space-y-3">
                                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-[#E8E8E5] bg-[#F5F5F2]">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={coverPreview}
                                                    alt="Pré-visualização da imagem do projecto"
                                                    className="h-full w-full object-cover"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={removeImage}
                                                    aria-label="Remover imagem"
                                                    className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-gray-700 shadow transition hover:bg-white hover:text-red-600 ${focusRing}`}
                                                >
                                                    <X
                                                        size={16}
                                                        aria-hidden="true"
                                                    />
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    fileRef.current?.click()
                                                }
                                                className={`flex w-full items-center justify-center gap-2 rounded-xl border border-[#E4E5E3] px-3 py-2.5 text-sm font-medium transition hover:bg-gray-50 ${focusRing}`}
                                            >
                                                <Upload
                                                    size={15}
                                                    aria-hidden="true"
                                                />
                                                Substituir imagem
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                fileRef.current?.click()
                                            }
                                            aria-describedby={
                                                errors.cover_image
                                                    ? "cover_image-msg"
                                                    : undefined
                                            }
                                            aria-invalid={
                                                errors.cover_image
                                                    ? true
                                                    : undefined
                                            }
                                            className={`flex aspect-[4/3] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed bg-[#FBFBFA] px-4 text-center transition hover:border-[#BD9655] hover:bg-[#BD9655]/[0.05] ${focusRing} ${
                                                errors.cover_image
                                                    ? "border-red-400"
                                                    : "border-[#D9DAD6]"
                                            }`}
                                        >
                                            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#BD9655]/12 text-[#8E6B2F]">
                                                <ImagePlus
                                                    size={22}
                                                    aria-hidden="true"
                                                />
                                            </span>

                                            <span className="text-sm font-medium">
                                                Carregar imagem
                                            </span>

                                            <span className="mt-1 text-xs text-gray-500">
                                                Seleccione um ficheiro
                                            </span>
                                        </button>
                                    )}

                                    {errors.cover_image && (
                                        <p
                                            id="cover_image-msg"
                                            role="alert"
                                            className="mt-2 text-xs text-red-600"
                                        >
                                            {errors.cover_image}
                                        </p>
                                    )}
                                </div>
                            </section>
                        </aside>
                    </div>

                    {/* Sticky actions */}
                    <div className="sticky bottom-3 z-20 mt-8 pb-[env(safe-area-inset-bottom)]">
                        <div className="flex flex-col-reverse gap-3 rounded-2xl border border-[#E4E5E3] bg-white/90 p-3 shadow-[0_8px_30px_rgba(0,41,80,0.10)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:pl-5">
                            <p
                                className="flex items-center gap-2 text-xs leading-5 text-gray-500"
                                aria-live="polite"
                            >
                                {dirty ? (
                                    <>
                                        <CircleDot
                                            size={14}
                                            aria-hidden="true"
                                            className="text-[#BD9655]"
                                        />
                                        Tem alterações por guardar.
                                    </>
                                ) : (
                                    "As alterações só são aplicadas depois de guardar."
                                )}
                            </p>

                            <div className="flex flex-col-reverse gap-2 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => router.push(backHref)}
                                    disabled={saving}
                                    className={`inline-flex items-center justify-center rounded-xl border border-[#E0E1DE] bg-white px-5 py-2.5 text-sm font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#002950] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#003B70] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
                                >
                                    {saveIcon}
                                    {saveLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}