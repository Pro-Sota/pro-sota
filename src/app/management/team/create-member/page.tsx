"use client";

import { useState } from "react";
import { User, Briefcase, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Database } from "@/app/lib/supabase/models";

type TeamMember = Database["public"]["Tables"]["users"]["Row"];
type Roles = Database["public"]["Enums"]["project_member_role"];
const ROLE_LABELS: Roles[] = ["Manager", "Engineer", "Architect", "Supervisor", "Viewer"];

const INITIAL_STATE: TeamMember = {
    first_name: "",
    last_name: "",
    phone_number: "",
    is_active: false,
    avatar_url: "",
    created_at: null,
    gender: null,
    role: null,
    updated_at: null,
    user_id: ""
};


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STATUS_LABELS = { Active: "Ativo", Pending: "Pendente", Inactive: "Inativo" };

const STATUS_STYLES   = {
    Active: "bg-emerald-50 text-emerald-700",
    Pending: "bg-amber-50 text-amber-700",
    Inactive: "bg-slate-100 text-slate-600",
};

const STATUS_DOT = {
    Active: "bg-emerald-500",
    Pending: "bg-amber-500",
    Inactive: "bg-slate-400",
};

const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 ${hasError ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50/60"
    }`;

export default function CreateMember() {

    const [member, setMember] = useState<TeamMember>(INITIAL_STATE);
    const [errors, setErrors] = useState<Partial<Record<keyof TeamMember, string>>>(
        {}
    );

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setMember((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const next = INITIAL_STATE;

        if (!member.first_name.trim()) next.first_name = "O primeiro nome é obrigatório.";
        if (!member.last_name.trim()) next.last_name = "O último nome é obrigatório.";
        if (!member.email.trim()) {
            next.email = "O email é obrigatório.";
        } else if (!EMAIL_REGEX.test(member.email.trim())) {
            next.email = "Introduza um endereço de email válido.";
        }
        if (!member.employeeId.trim()) next.employeeId = "O ID de funcionário é obrigatório.";
        if (!member.architectureRole) next.architectureRole = "Selecione uma função de arquitetura.";
        if (member.experience !== "" && Number(member.experience) < 0) {
            next.experience = "Os anos de experiência não podem ser negativos.";
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitError("");
        setSuccess(false);

        if (!validate()) return;

        try {
            setSubmitting(true);
            setSuccess(true);
            setMember(INITIAL_STATE);
            setErrors({});
        } catch (err) {
            setSubmitError("Ocorreu um erro ao criar o membro.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-full bg-slate-50 px-5 py-12">
            <div className="mx-auto max-w-3xl">
                <div className="mb-7">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Novo membro
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Registar Novo Membro da Equipa
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Adicione um novo membro ao Sistema de Gestão de Arquitetura. Os campos marcados com{" "}
                        <span className="text-red-500">*</span> são obrigatórios.
                    </p>
                </div>

                {success && (
                    <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        <CheckCircle2 size={18} />
                        Membro criado com sucesso.
                    </div>
                )}
                {submitError && (
                    <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        <AlertCircle size={18} />
                        {submitError}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    {/* Informação Pessoal */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 px-6 pt-5 pb-1">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                                <User size={18} className="text-indigo-600" />
                            </div>
                            <h2 className="text-sm font-semibold text-slate-900">Informação Pessoal</h2>
                        </div>

                        <div className="px-6 pb-6 pt-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                        Primeiro Nome<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="firstName"
                                        value={member.first_name}
                                        onChange={handleChange}
                                        className={inputClass(errors.first_name)}
                                    />
                                    {errors.first_name && (
                                        <p className="mt-1.5 text-xs text-red-600">{errors.first_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                        Último Nome<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="lastName"
                                        value={member.last_name}
                                        onChange={handleChange}
                                        className={inputClass(errors.last_name)}
                                    />
                                    {errors.last_name && (
                                        <p className="mt-1.5 text-xs text-red-600">{errors.last_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                        Endereço de Email<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={member.email}
                                        onChange={handleChange}
                                        className={inputClass(errors.email)}
                                    />
                                    {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                        Número de Telefone
                                    </label>
                                    <input
                                        name="phone"
                                        value={member.phone}
                                        onChange={handleChange}
                                        className={inputClass(false)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Informação de Emprego */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 px-6 pt-5 pb-1">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50">
                                <Briefcase size={18} className="text-sky-600" />
                            </div>
                            <h2 className="text-sm font-semibold text-slate-900">Informação de Emprego</h2>
                        </div>

                        <div className="px-6 pb-6 pt-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                        Cargo
                                    </label>
                                    <input
                                        name="jobTitle"
                                        value={member.jobTitle}
                                        onChange={handleChange}
                                        className={inputClass(false)}
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                        Departamento
                                    </label>
                                    <input
                                        name="department"
                                        value={member.department}
                                        onChange={handleChange}
                                        className={inputClass(false)}
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                        Função de Arquitetura<span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="architectureRole"
                                        value={member.architectureRole}
                                        onChange={handleChange}
                                        className={inputClass(false)}
                                    >
                                        <option value="">Selecionar função</option>
                                        {Object.keys(ROLE_LABELS).map((role) => (
                                            <option key={role} value={role}>
                                                {ROLE_LABELS[role]}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.architectureRole && (
                                        <p className="mt-1.5 text-xs text-red-600">{errors.architectureRole}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                        Anos de Experiência
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        name="experience"
                                        value={member.experience}
                                        onChange={handleChange}
                                        className={inputClass(errors.experience)}
                                    />
                                    {errors.experience && (
                                        <p className="mt-1.5 text-xs text-red-600">{errors.experience}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                        Estado
                                    </label>
                                    <select
                                        name="status"
                                        value={member.status}
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
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[member.status]}`}
                                >
                                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[member.status]}`} />
                                    {STATUS_LABELS[member.status]}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Botões */}
                    <div className="flex justify-end gap-3 pt-1">
                        <button
                            type="button"
                            disabled={submitting}
                            onClick={() => {
                                setMember(INITIAL_STATE);
                                setErrors({});
                                setSubmitError("");
                                setSuccess(false);
                            }}
                            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting && <Loader2 size={16} className="animate-spin" />}
                            {submitting ? "A criar..." : "Criar Membro"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}