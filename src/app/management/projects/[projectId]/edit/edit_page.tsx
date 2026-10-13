"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Banknote,
    Building2,
    ChevronDown,
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

/* -------------------------------------------------------------------------- */
/* Types & constants                                                          */
/* -------------------------------------------------------------------------- */

type Values = { [K in keyof ProjectPayload]: string };
type Errors = Partial<Record<keyof ProjectPayload | "cover_image", string>>;

export interface EditProjectFormProps {
    projectId: string;
    projectCode?: string;
    initialValues: Partial<ProjectPayload>;
    clients: { id: string; name: string }[];
    /** Server action, already bound to the project id. */
    onSave: (payload: ProjectPayload) => Promise<ActionResult>;
    /** Optional: uploads the cover (wrap a FormData server action) and returns its public URL. */
    onUploadImage?: (
        file: File,
    ) => Promise<{ success: true; url: string } | { success: false; error: string }>;
    backHref: string;
}

const URGENCY_LABELS: Record<string, string> = {
    Low: "Baixa",
    Medium: "Média",
    High: "Alta",
    Critical: "Crítica",
};

const PROVINCES = [
    "Bengo", "Benguela", "Bié", "Cabinda", "Cuando", "Cuanza Norte",
    "Cuanza Sul", "Cubango", "Cunene", "Huambo", "Huíla", "Icolo e Bengo",
    "Luanda", "Lunda Norte", "Lunda Sul", "Malanje", "Moxico",
    "Moxico Leste", "Namibe", "Uíge", "Zaire",
];

const EMPTY: Values = {
    project_code: "", title: "", description: "", type: "",
    status: "Em observação", urgency: "Medium", client_id: "",
    province: "", municipality: "", city: "",
    address_line_1: "", address_line_2: "", location: "",
    latitude: "", longitude: "", budget: "", estimated_cost: "",
    start_date: "", end_date: "", image: "",
};

const inputClass =
    "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-[#002950] outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/15";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function toValues(initial: Partial<ProjectPayload>): Values {
    const out = { ...EMPTY };
    (Object.keys(EMPTY) as (keyof ProjectPayload)[]).forEach((k) => {
        const v = initial[k];
        if (v !== null && v !== undefined) out[k] = String(v);
    });
    return out;
}

const orNull = (v: string) => (v.trim() === "" ? null : v.trim());
const numOrNull = (v: string) => (v.trim() === "" ? null : Number(v));

function validate(v: Values): Errors {
    const e: Errors = {};
    if (!v.project_code.trim()) e.project_code = "Indique o código do projecto.";
    if (!v.title.trim()) e.title = "O nome do projecto é obrigatório.";
    if (!v.municipality.trim()) e.municipality = "Indique o município.";

    (["budget", "estimated_cost"] as const).forEach((k) => {
        if (v[k].trim() !== "" && !(Number(v[k]) >= 0)) {
            e[k] = "Introduza um valor igual ou superior a zero.";
        }
    });
    if (v.latitude.trim() !== "" && !(Math.abs(Number(v.latitude)) <= 90)) {
        e.latitude = "Entre -90 e 90.";
    }
    if (v.longitude.trim() !== "" && !(Math.abs(Number(v.longitude)) <= 180)) {
        e.longitude = "Entre -180 e 180.";
    }
    if (v.start_date && v.end_date && v.end_date < v.start_date) {
        e.end_date = "A data de fim não pode ser anterior à de início.";
    }
    return e;
}

function toPayload(v: Values, image: string | null): ProjectPayload {
    return {
        project_code: v.project_code.trim(),
        title: v.title.trim(),
        description: orNull(v.description),
        type: orNull(v.type),
        status: v.status as ProjectPayload["status"],
        urgency: v.urgency as ProjectPayload["urgency"],
        client_id: orNull(v.client_id),
        province: orNull(v.province),
        municipality: v.municipality.trim(),
        city: orNull(v.city),
        address_line_1: orNull(v.address_line_1),
        address_line_2: orNull(v.address_line_2),
        location: orNull(v.location),
        latitude: numOrNull(v.latitude),
        longitude: numOrNull(v.longitude),
        budget: numOrNull(v.budget),
        estimated_cost: numOrNull(v.estimated_cost),
        start_date: orNull(v.start_date),
        end_date: orNull(v.end_date),
        image,
    };
}

/* -------------------------------------------------------------------------- */
/* Building blocks                                                            */
/* -------------------------------------------------------------------------- */

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
        <section className="overflow-hidden rounded-xl border border-[#E8E8E5] bg-white">
            <div className="flex items-start gap-3 border-b border-[#EEEEEB] px-5 py-5 sm:px-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#002950]/[0.06]">
                    {icon}
                </div>
                <div>
                    <h2 className="text-base font-semibold">{title}</h2>
                    <p className="mt-1 text-sm text-gray-500">{description}</p>
                </div>
            </div>
            <div className="grid gap-5 px-5 py-6 sm:grid-cols-2 sm:px-6">{children}</div>
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
    return (
        <div className={`min-w-0 space-y-2 ${wide ? "sm:col-span-2" : ""}`}>
            <label htmlFor={id} className="block text-sm font-medium text-[#002950]">
                {label}
                {required && <span className="ml-1 text-red-500" aria-hidden="true">*</span>}
            </label>
            {children}
            {(error || hint) && (
                <p
                    id={`${id}-msg`}
                    className={`text-xs ${error ? "text-red-600" : "text-gray-500"}`}
                >
                    {error ?? hint}
                </p>
            )}
        </div>
    );
}

function SelectBox({
    children,
    className = "",
    ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <div className="relative">
            <select {...props} className={`${className} appearance-none pr-10`}>
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

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function EditProjectForm({
    initialValues,
    clients,
    onSave,
    onUploadImage,
    backHref,
}: EditProjectFormProps) {
    const router = useRouter();
    const fileRef = useRef<HTMLInputElement>(null);

    const [values, setValues] = useState<Values>(() => toValues(initialValues));
    const [country, setCountry] = useState("Angola");
    const [errors, setErrors] = useState<Errors>({});
    const [coverPreview, setCoverPreview] = useState<string | null>(
        initialValues.image ?? null,
    );
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (coverPreview?.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
        };
    }, [coverPreview]);

    function clearError(key: keyof Errors) {
        setErrors((cur) => (cur[key] ? { ...cur, [key]: undefined } : cur));
    }

    /** Props shared by every input/select/textarea. */
    function bind(key: keyof ProjectPayload) {
        return {
            id: key,
            value: values[key],
            onChange: (
                e: React.ChangeEvent<
                    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
                >,
            ) => {
                setValues((cur) => ({ ...cur, [key]: e.target.value }));
                clearError(key);
            },
            "aria-invalid": errors[key] ? true : undefined,
            "aria-describedby": errors[key] ? `${key}-msg` : undefined,
            className: `${inputClass} ${errors[key] ? "border-red-400" : "border-[#E4E5E3]"}`,
        };
    }

    /* ----------------------------- image handling ---------------------------- */

    function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const fail = (message: string) => {
            setErrors((cur) => ({ ...cur, cover_image: message }));
            e.target.value = "";
        };

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            return fail("Utilize uma imagem JPG, PNG ou WebP.");
        }
        if (file.size > 5 * 1024 * 1024) return fail("A imagem não pode exceder 5 MB.");

        clearError("cover_image");
        setCoverPreview(URL.createObjectURL(file));
        setImageFile(file);
    }

    function removeImage() {
        setCoverPreview(null);
        setImageFile(null);
        if (fileRef.current) fileRef.current.value = "";
    }

    /* -------------------------------- submit -------------------------------- */

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitError(null);

        const found = validate(values);
        setErrors(found);
        const firstKey = Object.keys(found)[0];
        if (firstKey) {
            document.getElementById(firstKey)?.focus();
            return;
        }

        setSaving(true);
        try {
            // Keeps the existing remote image, or clears it if the user removed it.
            let image = coverPreview && !imageFile ? coverPreview : null;

            if (imageFile) {
                if (!onUploadImage) {
                    setSubmitError("O carregamento de imagens ainda não está configurado.");
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
            setSubmitError("Não foi possível guardar as alterações. Tente novamente.");
        } finally {
            setSaving(false);
        }
    }

    /* -------------------------------- render -------------------------------- */

    return (
        <div className="min-h-screen bg-[#F7F7F5] text-[#002950]">
            <header className="border-b border-[#E8E8E5] bg-white">
                <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        aria-label="Voltar"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E4E5E3] transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BD9655]"
                    >
                        <ArrowLeft size={18} aria-hidden="true" />
                    </button>

                    <div className="min-w-0">
                        <p className="truncate text-xs text-gray-500">
                            Projectos / {values.project_code} / Editar
                        </p>
                        <h1 className="mt-1 truncate text-xl font-semibold tracking-tight sm:text-2xl">
                            Editar projecto
                        </h1>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <p className="mb-6 text-sm text-gray-500">
                    Os campos assinalados com <span className="text-red-500">*</span> são obrigatórios.
                </p>

                {submitError && (
                    <div
                        role="alert"
                        className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        {submitError}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                        {/* ------------------------------ Main column ------------------------------ */}
                        <div className="space-y-6">
                            <Card
                                icon={<Building2 size={19} aria-hidden="true" />}
                                title="Identificação"
                                description="Nome, código e descrição do projecto."
                            >
                                <Field id="title" label="Nome do projecto" required error={errors.title} wide>
                                    <input {...bind("title")} placeholder="Ex.: Residencial Talatona" />
                                </Field>

                                <Field id="project_code" label="Código" required error={errors.project_code}>
                                    <input {...bind("project_code")} placeholder="Ex.: PS-2026-001" />
                                </Field>

                                <Field id="type" label="Tipo de projecto">
                                    <SelectBox {...bind("type")}>
                                        <option value="">Seleccionar tipo</option>
                                        {PROJECT_TYPES.map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </SelectBox>
                                </Field>

                                <Field id="client_id" label="Cliente" wide>
                                    <SelectBox {...bind("client_id")}>
                                        <option value="">Sem cliente associado</option>
                                        {clients.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
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
                                icon={<MapPin size={19} aria-hidden="true" />}
                                title="Localização"
                                description="Onde o projecto será executado."
                            >
                                <Field id="country" label="País">
                                    <input
                                        id="country"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className={inputClass}
                                    />
                                </Field>

                                <Field id="province" label="Província">
                                    <SelectBox {...bind("province")}>
                                        <option value="">Seleccionar província</option>
                                        {PROVINCES.map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </SelectBox>
                                </Field>

                                <Field id="municipality" label="Município" required error={errors.municipality}>
                                    <input {...bind("municipality")} placeholder="Ex.: Talatona" />
                                </Field>

                                <Field id="city" label="Cidade">
                                    <input {...bind("city")} />
                                </Field>

                                <Field id="address_line_1" label="Morada" wide>
                                    <input {...bind("address_line_1")} autoComplete="address-line1" />
                                </Field>

                                <Field id="address_line_2" label="Complemento" wide>
                                    <input {...bind("address_line_2")} autoComplete="address-line2" />
                                </Field>

                                <Field id="location" label="Ponto de referência" wide>
                                    <input {...bind("location")} placeholder="Ex.: junto à Via Expressa" />
                                </Field>

                                <Field id="latitude" label="Latitude" error={errors.latitude}>
                                    <input {...bind("latitude")} type="number" step="any" inputMode="decimal" placeholder="-8.9167" />
                                </Field>

                                <Field id="longitude" label="Longitude" error={errors.longitude}>
                                    <input {...bind("longitude")} type="number" step="any" inputMode="decimal" placeholder="13.1833" />
                                </Field>
                            </Card>

                            <Card
                                icon={<Banknote size={19} aria-hidden="true" />}
                                title="Orçamento e prazos"
                                description="Valores em kwanzas (AOA)."
                            >
                                <Field id="budget" label="Orçamento" error={errors.budget}>
                                    <input {...bind("budget")} type="number" min="0" step="0.01" inputMode="decimal" />
                                </Field>

                                <Field id="estimated_cost" label="Custo estimado" error={errors.estimated_cost}>
                                    <input {...bind("estimated_cost")} type="number" min="0" step="0.01" inputMode="decimal" />
                                </Field>

                                <Field id="start_date" label="Data de início">
                                    <input {...bind("start_date")} type="date" />
                                </Field>

                                <Field id="end_date" label="Data de fim" error={errors.end_date}>
                                    <input {...bind("end_date")} type="date" min={values.start_date || undefined} />
                                </Field>
                            </Card>
                        </div>

                        {/* -------------------------------- Sidebar -------------------------------- */}
                        <aside className="space-y-6 lg:sticky lg:top-6">
                            <section className="rounded-xl border border-[#E8E8E5] bg-white p-5">
                                <h2 className="text-sm font-semibold">Estado e prioridade</h2>

                                <div className="mt-4 space-y-4">
                                    <Field id="status" label="Estado">
                                        <SelectBox {...bind("status")}>
                                            {PROJECT_STATUSES.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </SelectBox>
                                    </Field>

                                    <Field id="urgency" label="Urgência">
                                        <SelectBox {...bind("urgency")}>
                                            {PROJECT_URGENCIES.map((u) => (
                                                <option key={u} value={u}>{URGENCY_LABELS[u] ?? u}</option>
                                            ))}
                                        </SelectBox>
                                    </Field>
                                </div>
                            </section>

                            <section className="overflow-hidden rounded-xl border border-[#E8E8E5] bg-white">
                                <div className="border-b border-[#EEEEEB] px-5 py-4">
                                    <h2 className="text-sm font-semibold">Imagem de capa</h2>
                                    <p className="mt-1 text-xs text-gray-500">JPG, PNG ou WebP · Máx. 5 MB</p>
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
                                            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-[#E8E8E5] bg-[#F7F7F5]">
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
                                                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-700 shadow-sm transition hover:bg-gray-100"
                                                >
                                                    <X size={16} aria-hidden="true" />
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => fileRef.current?.click()}
                                                className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E4E5E3] px-3 py-2.5 text-sm font-medium transition hover:bg-gray-50"
                                            >
                                                <Upload size={15} aria-hidden="true" />
                                                Substituir imagem
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => fileRef.current?.click()}
                                            className={`flex aspect-[4/3] w-full flex-col items-center justify-center rounded-lg border border-dashed bg-[#FAFAF8] px-4 text-center transition hover:border-[#BD9655] hover:bg-[#BD9655]/[0.04] ${errors.cover_image ? "border-red-400" : "border-[#D9DAD6]"
                                                }`}
                                        >
                                            <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-[#E8E8E5] bg-white">
                                                <ImagePlus size={20} aria-hidden="true" />
                                            </span>
                                            <span className="text-sm font-medium">Carregar imagem</span>
                                        </button>
                                    )}

                                    {errors.cover_image && (
                                        <p className="mt-2 text-xs text-red-600">{errors.cover_image}</p>
                                    )}
                                </div>
                            </section>
                        </aside>
                    </div>

                    {/* ------------------------------ Actions ------------------------------ */}
                    <div className="sticky bottom-0 -mx-4 mt-8 flex flex-col-reverse gap-3 border-t border-[#E4E5E3] bg-[#F7F7F5]/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:-mx-8 lg:px-8">
                        <p className="text-xs text-gray-500">
                            As alterações só são aplicadas depois de guardar.
                        </p>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="inline-flex items-center justify-center rounded-lg border border-[#E0E1DE] bg-white px-5 py-2.5 text-sm font-medium transition hover:bg-gray-50"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#002950] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#003B70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BD9655] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? (
                                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                                ) : (
                                    <Save size={16} aria-hidden="true" />
                                )}
                                {saving ? "A guardar…" : "Guardar alterações"}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}