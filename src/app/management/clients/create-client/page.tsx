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
    Phone,
    Building2,
    Check,
} from "lucide-react";
import { Database } from "@/app/lib/supabase/models";
import { useRouter } from "next/navigation";

import CancelConfirmDialog from "@/app/components/cancel_confirm_dialog";

type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];

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

type FieldChangeEvent = {
    target: { name: string; value: string };
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CLIENT_TYPE_LABELS = { Individual: "Individual", Company: "Empresa", Government: "Governo" };
const STATUS_LABELS = { Active: "Ativo", Inactive: "Inativo", Prospective: "Potencial" };
const CONTACT_METHOD_LABELS = { Email: "Email", Phone: "Telefone", WhatsApp: "WhatsApp" };

const COUNTRIES = [
    "Portugal", "Brasil", "Angola", "Moçambique", "Cabo Verde", "Timor Leste", "Guiné Bissau", "São Tomé e Príncipe",
    "Espanha", "França", "Itália", "Alemanha", "Reino Unido", "Países Baixos", "Bélgica", "Suíça",
    "Estados Unidos", "Canadá", "México", "Argentina", "Chile", "Colômbia", "Austrália", "China", "Índia", "Japão"
].sort();

const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
        hasError ? "border-red-300 bg-red-50" : "border-slate-200 bg-white hover:border-slate-300"
    }`;

const sectionClass = "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition hover:shadow-sm";

export default function CreateClient() {
    const [client, setClient] = useState<ClientInsert>(INITIAL_STATE);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [countryOpen, setCountryOpen] = useState(false);

    const router = useRouter();

    const isOrg = client.client_type === "Company" || client.client_type === "Government";

    const handleChange = (e: FieldChangeEvent) => {
        const { name, value } = e.target;
        setClient((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    // Format phone number
    const formatPhone = (value: string) => {
        return value.replace(/\D/g, "").slice(0, 12);
    };

    const handlePhoneChange = (e: FieldChangeEvent) => {
        e.target.value = formatPhone(e.target.value);
        handleChange(e);
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
            next.phone = `O telefone é obrigatório.`;
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

    // Calculate form completion
    const requiredFields = isOrg 
        ? ["organization_name", "contact_person", "email", "status"]
        : ["first_name", "last_name", "email", "status"];
    const completedFields = requiredFields.filter(
        (field) => client[field as keyof ClientInsert]?.toString().trim()
    ).length;
    const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);

    const Breadcrumb = ({ items }: { items: { label: string; href?: string }[] }) => (
        <nav className="flex items-center gap-1.5 text-sm text-slate-600">
            {items.map((item, i) => {
                const isLast = i === items.length - 1;
                return (
                    <span key={item.label} className="flex items-center gap-1.5">
                        {item.href ? (
                            <button
                                type="button"
                                onClick={() => router.push(item.href as string)}
                                className="text-slate-600 transition hover:text-slate-900 hover:underline"
                            >
                                {item.label}
                            </button>
                        ) : (
                            <span className="font-medium text-slate-900">{item.label}</span>
                        )}
                        {!isLast && <ChevronRight className="h-3.5 w-3.5 text-slate-300" />}
                    </span>
                );
            })}
        </nav>
    );

    return (
        <div className="min-h-full bg-slate-50/50 px-5 py-12">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
                    <div className="flex-1">
                        <button
                            type="button"
                            onClick={handleCancelClick}
                            className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Voltar
                        </button>

                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
                                Novo registo
                            </p>
                            <h1 className="text-3xl font-bold text-slate-900">Adicionar Cliente</h1>
                            <p className="mt-2 text-sm text-slate-600">
                                Preencha os campos obrigatórios marcados com <span className="font-semibold text-slate-900">*</span>
                            </p>
                        </div>
                    </div>

                    {/* Completion Progress */}
                </div>

                {/* Messages */}
                {success && (
                    <div className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-medium text-emerald-700">
                        <CheckCircle2 size={18} />
                        Cliente guardado com sucesso.
                    </div>
                )}

                {submitError && (
                    <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-700">
                        <AlertCircle size={18} />
                        {submitError}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    {/* Identification Section */}
                    <div className={sectionClass}>
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                                <User size={20} className="text-slate-600" />
                            </div>
                            <h2 className="text-base font-semibold text-slate-900">Identificação</h2>
                        </div>

                        <div className="px-6 py-5">
                            {/* Client Type Toggle */}
                            <div className="mb-6">
                                <label className="mb-3 block text-sm font-semibold text-slate-700">Tipo de Cliente</label>
                                <div className="inline-flex gap-1.5 rounded-lg bg-slate-100 p-1.5">
                                    {Object.keys(CLIENT_TYPE_LABELS).map((t) => (
                                        <button
                                            type="button"
                                            key={t}
                                            onClick={() => handleChange({ target: { name: "client_type", value: t } })}
                                            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                                                client.client_type === t
                                                    ? "bg-white text-slate-900 shadow-sm"
                                                    : "text-slate-600 hover:text-slate-900"
                                            }`}
                                        >
                                            {CLIENT_TYPE_LABELS[t as keyof typeof CLIENT_TYPE_LABELS]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Name Fields */}
                            {isOrg ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-700">
                                            <Building2 size={16} className="text-slate-400" />
                                            Nome da Empresa / Organização
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="organization_name"
                                            placeholder="Digite o nome da empresa"
                                            className={inputClass(!!errors.organization_name)}
                                            value={client.organization_name || ""}
                                            onChange={handleChange}
                                        />
                                        {errors.organization_name && (
                                            <p className="mt-1 text-xs text-red-600">{errors.organization_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-700">
                                            <User size={16} className="text-slate-400" />
                                            Pessoa de Contacto
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="contact_person"
                                            placeholder="Nome completo"
                                            className={inputClass(!!errors.contact_person)}
                                            value={client.contact_person || ""}
                                            onChange={handleChange}
                                        />
                                        {errors.contact_person && (
                                            <p className="mt-1 text-xs text-red-600">{errors.contact_person}</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-700">
                                            Primeiro Nome
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            placeholder="João"
                                            className={inputClass(!!errors.first_name)}
                                            value={client.first_name || ""}
                                            onChange={handleChange}
                                        />
                                        {errors.first_name && (
                                            <p className="mt-1 text-xs text-red-600">{errors.first_name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-700">
                                            Último Nome
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            placeholder="Silva"
                                            className={inputClass(!!errors.last_name)}
                                            value={client.last_name || ""}
                                            onChange={handleChange}
                                        />
                                        {errors.last_name && (
                                            <p className="mt-1 text-xs text-red-600">{errors.last_name}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Status */}
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <label className="mb-2.5 block text-sm font-semibold text-slate-700">Estado</label>
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
                    </div>

                    {/* Contact Section */}
                    <div className={sectionClass}>
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                                <Mail size={20} className="text-slate-600" />
                            </div>
                            <h2 className="text-base font-semibold text-slate-900">Contacto</h2>
                        </div>

                        <div className="px-6 py-5 space-y-4">
                            <div>
                                <label className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-700">
                                    Email
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="cliente@exemplo.com"
                                    className={inputClass(!!errors.email)}
                                    value={client.email || ""}
                                    onChange={handleChange}
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-700">
                                    <Phone size={16} className="text-slate-400" />
                                    Telefone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="+351 9 xxxx xxxx"
                                    className={inputClass(!!errors.phone)}
                                    value={client.phone || ""}
                                    onChange={handlePhoneChange}
                                />
                                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                            </div>

                            <div>
                                <label className="mb-2.5 block text-sm font-semibold text-slate-700">
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

                    {/* Location Section */}
                    <div className={sectionClass}>
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                                <MapPin size={20} className="text-slate-600" />
                            </div>
                            <h2 className="text-base font-semibold text-slate-900">Localização</h2>
                        </div>

                        <div className="px-6 py-5 space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Morada</label>
                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Rua, Avenida ou Praça"
                                    className={inputClass(false)}
                                    value={client.address || ""}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Cidade</label>
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="Lisboa"
                                        className={inputClass(false)}
                                        value={client.city || ""}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">País</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setCountryOpen(!countryOpen)}
                                            className={inputClass(false) + " text-left flex items-center justify-between"}
                                        >
                                            <span>{client.country || "Selecione um país"}</span>
                                            <ChevronRight className={`h-4 w-4 transition ${countryOpen ? "rotate-90" : ""}`} />
                                        </button>

                                        {countryOpen && (
                                            <div className="absolute top-full left-0 right-0 mt-2 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg z-10">
                                                {COUNTRIES.map((country) => (
                                                    <button
                                                        key={country}
                                                        type="button"
                                                        onClick={() => {
                                                            handleChange({ target: { name: "country", value: country } });
                                                            setCountryOpen(false);
                                                        }}
                                                        className={`w-full px-3.5 py-2.5 text-left text-sm transition ${
                                                            client.country === country
                                                                ? "bg-blue-50 text-blue-700 font-semibold"
                                                                : "hover:bg-slate-50 text-slate-700"
                                                        }`}
                                                    >
                                                        <span className="flex items-center justify-between">
                                                            {country}
                                                            {client.country === country && <Check size={16} />}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className={sectionClass}>
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                                <FileText size={20} className="text-slate-600" />
                            </div>
                            <h2 className="text-base font-semibold text-slate-900">Notas Adicionais</h2>
                        </div>

                        <div className="px-6 py-5">
                            <textarea
                                name="notes"
                                rows={4}
                                placeholder="Informação adicional sobre este cliente..."
                                className={inputClass(false)}
                                value={client.notes || ""}
                                onChange={handleChange}
                                maxLength={500}
                            />
                            <div className="mt-2 flex justify-between items-center">
                                <p className="text-xs text-slate-500"></p>
                                <p className="text-xs font-medium text-slate-600">
                                    {client.notes?.length || 0}/500
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
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
                            className="flex items-center gap-2 rounded-lg bg-slate-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
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
        </div>
    );
}