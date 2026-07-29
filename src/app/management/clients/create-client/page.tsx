"use client";

import { useState, type FormEvent } from "react";
import {
    User,
    Mail,
    MapPin,
    FileText,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ArrowLeft,
    ChevronRight,
} from "lucide-react";
import { Database } from "@/app/lib/supabase/models";
import { useRouter } from "next/navigation";

import CancelConfirmDialog from "@/app/components/cancel_confirm_dialog";

type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];

// All fields the form actually reads/writes need a starting value, or the
// related inputs/selects flip from "uncontrolled" to "controlled" the first
// time they're touched (React warning + flaky behavior). The previous
// version was missing status, preferred_contact_method, city, country, and
// notes even though the form below uses all of them.
const INITIAL_STATE: ClientInsert = {
    client_type: "Individual",

    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    notes: "",

    first_name: "",
    last_name: "",

    organization_name: "",
    contact_person: "",

    status: "Prospective",
    preferred_contact_method: "Email",
};

// handleChange is reused both for real DOM change events (input/select/
// textarea) and for the client-type toggle buttons, which fake an event.
// This shape covers both without needing `any`.
type FieldChangeEvent = {
    target: { name: string; value: string };
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CLIENT_TYPE_LABELS = { Individual: "Individual", Company: "Empresa", Government: "Governo" };
const STATUS_LABELS = { Active: "Ativo", Inactive: "Inativo", Prospective: "Potencial" };
const CONTACT_METHOD_LABELS = { Email: "Email", Phone: "Telefone", WhatsApp: "WhatsApp" };

const STATUS_STYLES: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-700",
    Inactive: "bg-slate-100 text-slate-600",
    Prospective: "bg-amber-50 text-amber-700",
};

const STATUS_DOT: Record<string, string> = {
    Active: "bg-emerald-500",
    Inactive: "bg-slate-400",
    Prospective: "bg-amber-500",
};

const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 ${hasError ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50/60"
    }`;

export default function CreateClient() {
    const [client, setClient] = useState<ClientInsert>(INITIAL_STATE);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const router = useRouter();


    const isOrg = client.client_type === "Company" || client.client_type === "Government";

    const handleChange = (e: FieldChangeEvent) => {
        const { name, value } = e.target;
        setClient((prev) => ({ ...prev, [name]: value }));
    };

    function confirmCancel() {
        router.push("/management/clients");
    }

    const validate = () => {
        const next: Record<string, string> = {};

        if (isOrg && !client.organization_name?.trim()) {
            next.organization_name = "O nome da empresa é obrigatório.";
        }
        if (!isOrg && !client.first_name?.trim()) {
            next.first_name = "O primeiro nome é obrigatório.";
        }
        if (!isOrg && !client.last_name?.trim()) {
            next.last_name = "O último nome é obrigatório.";
        }
        if (isOrg && !client.contact_person?.trim()) {
            next.contact_person = "A pessoa de contacto é obrigatória.";
        }
        if (!client.email?.trim()) {
            next.email = "O email é obrigatório.";
        } else if (!EMAIL_REGEX.test(client.email.trim())) {
            next.email = "Introduza um endereço de email válido.";
        }
        if (
            (client.preferred_contact_method === "Phone" || client.preferred_contact_method === "WhatsApp") &&
            !client.phone?.trim()
        ) {
            next.phone = `O telefone é obrigatório quando o contacto preferido é ${CONTACT_METHOD_LABELS[client.preferred_contact_method]}.`;
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitError("");
        setSuccess(false);

        if (!validate()) return;

        const payload = {
            ...client,
            name: isOrg
                ? client.organization_name?.trim()
                : `${client.first_name?.trim() ?? ""} ${client.last_name?.trim() ?? ""}`.trim(),
            organization_name: client.organization_name?.trim(),
            contact_person: client.contact_person?.trim(),
            email: client.email?.trim().toLowerCase(),
            phone: client.phone?.trim(),
            address: client.address?.trim(),
            city: client.city?.trim(),
            country: client.country?.trim(),
            notes: client.notes?.trim(),
        };

        try {
            setSubmitting(true);
            // TODO: replace with the real request, e.g.
            // const [data, error] = await createClient(payload);
            // if (error) throw new Error(error.message ?? JSON.stringify(error));
            await new Promise((resolve) => setTimeout(resolve, 800));

            setSuccess(true);
            setClient(INITIAL_STATE);
            setErrors({});
        } catch (err) {
            setSubmitError("Ocorreu um erro ao guardar o cliente.");
        } finally {
            setSubmitting(false);
        }
    };

    function handleCancelClick() {
        setShowCancelConfirm(true);
    }


    function Breadcrumb({
        items,
    }: {
        items: { label: string; href?: string }[];
    }) {
        const router = useRouter();
        return (
            <nav className="flex items-center gap-1.5 text-sm text-slate-500">
                {items.map((item, i) => {
                    const isLast = i === items.length - 1;
                    return (
                        <span key={item.label} className="flex items-center gap-1.5">
                            {item.href ? (
                                <button
                                    type="button"
                                    onClick={() => router.push(item.href as string)}
                                    className="cursor-pointer text-slate-500 transition hover:text-[#1B3A5C] hover:underline"
                                >
                                    {item.label}
                                </button>
                            ) : (
                                <span className="font-medium text-slate-800">{item.label}</span>
                            )}
                            {!isLast && <ChevronRight className="h-3.5 w-3.5 text-slate-300" />}
                        </span>
                    );
                })}
            </nav>
        );
    }

    return (
        <div className="min-h-full bg-slate-50 px-5 py-12">

            <div className="mx-auto max-w-3xl">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={handleCancelClick}
                        className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar
                    </button>

                    <Breadcrumb
                        items={[
                            { label: "Dashboard", href: "/management" },
                            { label: "Clients", href: "/management/clients" },
                            { label: "Novo Cliente" },
                        ]}
                    />
                </div>
                
                <div className="mb-7">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Novo registo
                    </p>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Adicionar Cliente</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Os campos marcados com <span className="text-red-500">*</span> são obrigatórios.
                    </p>
                </div>

                {success && (
                    <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        <CheckCircle2 size={18} />
                        Cliente guardado com sucesso.
                    </div>
                )}

                {submitError && (
                    <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        <AlertCircle size={18} />
                        {submitError}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    {/* Identidade */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 px-6 pt-5 pb-1">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                                <User size={18} className="text-indigo-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900">Identificação do Cliente</h3>
                        </div>

                        <div className="px-6 pb-6 pt-4">
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Tipo de Cliente
                                </label>
                                <div className="inline-flex gap-1 rounded-lg bg-slate-100 p-1">
                                    {Object.keys(CLIENT_TYPE_LABELS).map((t) => (
                                        <button
                                            type="button"
                                            key={t}
                                            onClick={() => handleChange({ target: { name: "client_type", value: t } })}
                                            className={`rounded-md px-3.5 py-1.5 text-sm font-semibold transition ${client.client_type === t
                                                ? "bg-white text-slate-900 shadow-sm"
                                                : "text-slate-500 hover:text-slate-700"
                                                }`}
                                        >
                                            {CLIENT_TYPE_LABELS[t as keyof typeof CLIENT_TYPE_LABELS]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {isOrg ? (
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                            Nome da Empresa / Organização<span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="organization_name"
                                            className={inputClass(!!errors.organization_name)}
                                            value={client.organization_name || ""}
                                            onChange={handleChange}
                                        />
                                        {errors.organization_name && (
                                            <p className="mt-1.5 text-xs text-red-600">{errors.organization_name}</p>
                                        )}
                                    </div>
                                ) : (

                                    <div className="flex gap-3 block ">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                                Primeiro Nome <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="first_name"
                                                className={inputClass(!!errors.first_name)}
                                                value={client.first_name || ""}
                                                onChange={handleChange}
                                            />
                                            {errors.first_name && (
                                                <p className="mt-1.5 text-xs text-red-600">{errors.first_name}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                                Último Nome <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="last_name"
                                                className={inputClass(!!errors.last_name)}
                                                value={client.last_name || ""}
                                                onChange={handleChange}
                                            />
                                            {errors.last_name && (
                                                <p className="mt-1.5 text-xs text-red-600">{errors.last_name}</p>
                                            )}
                                        </div>

                                    </div>
                                )}

                                {isOrg && (
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                            Pessoa de Contacto<span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="contact_person"
                                            className={inputClass(!!errors.contact_person)}
                                            value={client.contact_person || ""}
                                            onChange={handleChange}
                                        />
                                        {errors.contact_person && (
                                            <p className="mt-1.5 text-xs text-red-600">{errors.contact_person}</p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Estado</label>
                                    <select
                                        name="status"
                                        value={client.status || ""}
                                        onChange={handleChange}
                                        className={inputClass(false)}
                                    >
                                        {Object.keys(STATUS_LABELS).map((s) => (
                                            <option key={s} value={s}>
                                                {STATUS_LABELS[s as keyof typeof STATUS_LABELS]}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4">
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[client.status ?? "Prospective"]}`}
                                >
                                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[client.status ?? "Prospective"]}`} />
                                    {STATUS_LABELS[(client.status ?? "Prospective") as keyof typeof STATUS_LABELS]}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Contacto */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 px-6 pt-5 pb-1">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50">
                                <Mail size={18} className="text-sky-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900">Contacto</h3>
                        </div>

                        <div className="px-6 pb-6 pt-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                        Email<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        className={inputClass(!!errors.email)}
                                        value={client.email || ""}
                                        onChange={handleChange}
                                    />
                                    {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Telefone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className={inputClass(!!errors.phone)}
                                        value={client.phone || ""}
                                        onChange={handleChange}
                                    />
                                    {errors.phone && <p className="mt-1.5 text-xs text-red-600">{errors.phone}</p>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                        Método de Contacto Preferido
                                    </label>
                                    <select
                                        name="preferred_contact_method"
                                        value={client.preferred_contact_method || ""}
                                        onChange={handleChange}
                                        className={inputClass(false)}
                                    >
                                        {Object.keys(CONTACT_METHOD_LABELS).map((c) => (
                                            <option key={c} value={c}>
                                                {CONTACT_METHOD_LABELS[c as keyof typeof CONTACT_METHOD_LABELS]}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Localização */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 px-6 pt-5 pb-1">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                                <MapPin size={18} className="text-emerald-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900">Localização</h3>
                        </div>

                        <div className="px-6 pb-6 pt-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Morada</label>
                                    <input
                                        type="text"
                                        name="address"
                                        className={inputClass(false)}
                                        value={client.address || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Cidade</label>
                                    <input
                                        type="text"
                                        name="city"
                                        className={inputClass(false)}
                                        value={client.city || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">País</label>
                                    <input
                                        type="text"
                                        name="country"
                                        className={inputClass(false)}
                                        value={client.country || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notas */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 px-6 pt-5 pb-1">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                                <FileText size={18} className="text-amber-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900">Notas</h3>
                        </div>

                        <div className="px-6 pb-6 pt-4">
                            <textarea
                                name="notes"
                                rows={4}
                                placeholder="Alguma informação adicional sobre este cliente..."
                                className={inputClass(false)}
                                value={client.notes || ""}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-1">
                        <button
                            type="button"
                            disabled={submitting}
                            onClick={() => {
                                setClient(INITIAL_STATE);
                                setErrors({});
                                setSubmitError("");
                                setSuccess(false);
                            }}
                            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Repor
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting && <Loader2 size={16} className="animate-spin" />}
                            {submitting ? "A guardar..." : "Guardar Cliente"}
                        </button>
                    </div>
                </form>

                {showCancelConfirm && (
                    <CancelConfirmDialog
                        onKeepEditing={() => setShowCancelConfirm(false)}
                        onDiscard={confirmCancel}
                        title={""}
                    />
                )}
            </div>
        </div>)
}
