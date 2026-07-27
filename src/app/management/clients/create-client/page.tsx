"use client";

import { useState } from "react";
import {
    User,
    Mail,
    MapPin,
    FileText,
    CheckCircle2,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { Database } from "@/app/lib/supabase/models";

type Client = Database["public"]["Tables"]["clients"]["Row"];

const INITIAL_STATE : Client = {
    address: null,
    city: null,
    client_id: "",
    company_name: null,
    contact_person: null,
    country: null,
    created_at: null,
    email: null,
    notes: null,
    phone_number: null,
    updated_at: null
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CLIENT_TYPE_LABELS = { Individual: "Individual", Company: "Empresa", Government: "Governo" };
const STATUS_LABELS = { Active: "Ativo", Inactive: "Inativo", Prospective: "Potencial" };
const CONTACT_METHOD_LABELS = { Email: "Email", Phone: "Telefone", WhatsApp: "WhatsApp" };

const STATUS_STYLES = {
    Active: "bg-emerald-50 text-emerald-700",
    Inactive: "bg-slate-100 text-slate-600",
    Prospective: "bg-amber-50 text-amber-700",
};

const STATUS_DOT = {
    Active: "bg-emerald-500",
    Inactive: "bg-slate-400",
    Prospective: "bg-amber-500",
};

const inputClass = (hasError:boolean) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 ${hasError ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50/60"
    }`;

export default function CreateClient() {
    const [client, setClient] = useState(INITIAL_STATE);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [success, setSuccess] = useState(false);

    const isOrg = client.clientType === "Company" || client.clientType === "Government";

    const handleChange = (e) => {
        const { name, value } = e.target;
        setClient((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const validate = () => {
        const next = {};

        if (isOrg && !client.companyName.trim()) {
            next.companyName = "O nome da empresa é obrigatório.";
        }
        if (!isOrg && !client.fullName.trim()) {
            next.fullName = "O nome completo é obrigatório.";
        }
        if (isOrg && !client.contactPerson.trim()) {
            next.contactPerson = "A pessoa de contacto é obrigatória.";
        }
        if (!client.email.trim()) {
            next.email = "O email é obrigatório.";
        } else if (!EMAIL_REGEX.test(client.email.trim())) {
            next.email = "Introduza um endereço de email válido.";
        }
        if (
            (client.preferredContact === "Phone" || client.preferredContact === "WhatsApp") &&
            !client.phone.trim()
        ) {
            next.phone = `O telefone é obrigatório quando o contacto preferido é ${CONTACT_METHOD_LABELS[client.preferredContact]}.`;
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");
        setSuccess(false);

        if (!validate()) return;

        const payload = {
            ...client,
            fullName: client.fullName.trim(),
            companyName: client.companyName.trim(),
            contactPerson: client.contactPerson.trim(),
            email: client.email.trim().toLowerCase(),
            phone: client.phone.trim(),
            address: client.address.trim(),
            city: client.city.trim(),
            country: client.country.trim(),
            notes: client.notes.trim(),
        };

        try {
            setSubmitting(true);
            if (onSave) await onSave(payload);
            setSuccess(true);
            setClient(INITIAL_STATE);
            setErrors({});
        } catch (err) {
            setSubmitError(err?.message || "Ocorreu um erro ao guardar o cliente.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-full bg-slate-50 px-5 py-12">
            <div className="mx-auto max-w-3xl">
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
                                            onClick={() => handleChange({ target: { name: "clientType", value: t } })}
                                            className={`rounded-md px-3.5 py-1.5 text-sm font-semibold transition ${client.clientType === t
                                                    ? "bg-white text-slate-900 shadow-sm"
                                                    : "text-slate-500 hover:text-slate-700"
                                                }`}
                                        >
                                            {CLIENT_TYPE_LABELS[t]}
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
                                            name="companyName"
                                            className={inputClass(errors.companyName)}
                                            value={client.companyName}
                                            onChange={handleChange}
                                        />
                                        {errors.companyName && (
                                            <p className="mt-1.5 text-xs text-red-600">{errors.companyName}</p>
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
                                                name="fullName"
                                                className={inputClass(errors.fullName)}
                                                value={client.firstName}
                                                onChange={handleChange}
                                            />
                                            {errors.fullName && (
                                                <p className="mt-1.5 text-xs text-red-600">{errors.fullName}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                                Último Nome <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                className={inputClass(errors.fullName)}
                                                value={client.lastName}
                                                onChange={handleChange}
                                            />
                                            {errors.fullName && (
                                                <p className="mt-1.5 text-xs text-red-600">{errors.fullName}</p>
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
                                            name="contactPerson"
                                            className={inputClass(errors.contactPerson)}
                                            value={client.contactPerson}
                                            onChange={handleChange}
                                        />
                                        {errors.contactPerson && (
                                            <p className="mt-1.5 text-xs text-red-600">{errors.contactPerson}</p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Estado</label>
                                    <select
                                        name="status"
                                        value={client.status}
                                        onChange={handleChange}
                                        className={inputClass(false)}
                                    >
                                        {Object.keys(STATUS_LABELS).map((s) => (
                                        <option key={s} value={s}>
                                            {STATUS_LABELS[s]}
                                        </option>
                    ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4">
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[client.status]}`}
                                >
                                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[client.status]}`} />
                                    {STATUS_LABELS[client.status]}
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
                                        className={inputClass(errors.email)}
                                        value={client.email}
                                        onChange={handleChange}
                                    />
                                    {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Telefone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className={inputClass(errors.phone)}
                                        value={client.phone}
                                        onChange={handleChange}
                                    />
                                    {errors.phone && <p className="mt-1.5 text-xs text-red-600">{errors.phone}</p>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                        Método de Contacto Preferido
                                    </label>
                                    <select
                                        name="preferredContact"
                                        value={client.preferredContact}
                                        onChange={handleChange}
                                        className={inputClass(false)}
                                    >
                                        {Object.keys(CONTACT_METHOD_LABELS).map((c) => (
                                            <option key={c} value={c}>
                                                {CONTACT_METHOD_LABELS[c]}
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
                                        value={client.address}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Cidade</label>
                                    <input
                                        type="text"
                                        name="city"
                                        className={inputClass(false)}
                                        value={client.city}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">País</label>
                                    <input
                                        type="text"
                                        name="country"
                                        className={inputClass(false)}
                                        value={client.country}
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
                                value={client.notes}
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
            </div>
        </div>
    );
}