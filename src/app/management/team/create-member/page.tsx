"use client";

import { useState, type ChangeEvent } from "react";
import {
    User,
    Briefcase,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ChevronRight,
    ArrowLeft,
} from "lucide-react";
import { Database } from "@/app/lib/supabase/models";
import { useRouter } from "next/navigation";
import CancelConfirmDialog from "@/app/components/cancel_confirm_dialog";

type MemberInsert = Database["public"]["Tables"]["profiles"]["Insert"];

type MemberStatus =
    | "Pending"
    | "Active"
    | "Inactive"
    | "Suspended";

type MemberFormState = MemberInsert & {
    email: string;
    dob: string;
    nationality: string;
    profile_picture: string;
    bio: string;
    department: string;
    hire_date: string;
    status: MemberStatus
};

const INITIAL_STATE: MemberFormState = {
    profile_id: "",

    first_name: "",
    last_name: "",

    phone_number: "",
    email: "",

    dob: "",
    nationality: "",

    profile_picture: "",
    bio: "",

    department: "",
    hire_date: "",

    status: "Pending",

    created_at: null,
    updated_at: null,
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 ${hasError ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50/60"
    }`;

function initials(firstName: string, lastName: string) {
    const a = firstName.trim().slice(0, 1);
    const b = lastName.trim().slice(0, 1);
    return `${a}${b}`.toUpperCase() || "?";
}

export default function CreateMember() {
    const [member, setMember] = useState<MemberFormState>({
        ...INITIAL_STATE,
    });

    const [errors, setErrors] = useState<
        Partial<Record<keyof MemberFormState, string>>
    >({});

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const handleChange = (
        e: ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;

        setMember((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    function handleCancelClick() {
        setShowCancelConfirm(true);
    }

    const validate = () => {
        const next: Partial<Record<keyof MemberFormState, string>> = {};

        if (!member.first_name.trim()) {
            next.first_name = "O primeiro nome é obrigatório.";
        }

        if (!member.last_name.trim()) {
            next.last_name = "O último nome é obrigatório.";
        }

        if (!member.email.trim()) {
            next.email = "O email é obrigatório.";
        } else if (!EMAIL_REGEX.test(member.email.trim())) {
            next.email = "Introduza um endereço de email válido.";
        }

        setErrors(next);

        return Object.keys(next).length === 0;
    };


    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        setSubmitError("");
        setSuccess(false);

        if (!validate()) return;


        const payload = {
            first_name: member.first_name.trim(),
            last_name: member.last_name.trim(),
            email: member.email.trim().toLowerCase(),
            phone_number: member.phone_number?.trim() || null,
            dob: member.dob || null,
            nationality: member.nationality.trim() || null,
            profile_picture: member.profile_picture.trim() || null,
            bio: member.bio.trim() || null,
            department: member.department.trim() || null,
            hire_date: member.hire_date || null,
            status: member.status,
        };


        try {
            setSubmitting(true);

            console.log(payload);

            // Replace later with Supabase insert
            await new Promise((resolve) =>
                setTimeout(resolve, 800)
            );


            setSuccess(true);
            setMember({
                ...INITIAL_STATE,
            });

            setErrors({});

        } catch (error) {
            setSubmitError(
                "Ocorreu um erro ao criar o membro."
            );

        } finally {
            setSubmitting(false);
        }
    };

    const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";


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

    const router = useRouter();

    function confirmCancel(): void {
        router.push("/management/team")
    }

    return (
        <div className="min-h-full bg-slate-50 px-5 py-12">

            <div className="mx-auto max-w-3xl space-y-6">
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
                            { label: "Team", href: "/management/team" },
                            { label: "Novo Membro" },
                        ]}
                    />
                </div>
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

                {/* Personal Information */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-6 py-5">
                        <h2 className="text-base font-semibold text-slate-900">
                            Informação Pessoal
                        </h2>
                        <p className="text-sm text-slate-500">
                            Dados básicos de identificação do membro.
                        </p>
                    </div>

                    <div className="grid gap-5 p-6 sm:grid-cols-2">

                        {/* Avatar */}
                        <div className="sm:col-span-2 flex items-center gap-5">
                            {member.profile_picture ? (
                                <img
                                    src={member.profile_picture}
                                    className="h-20 w-20 rounded-full object-cover ring-4 ring-slate-100"
                                />
                            ) : (
                                <div className="
                    flex h-20 w-20 items-center justify-center
                    rounded-full bg-indigo-100
                    text-xl font-bold text-indigo-600
                ">
                                    {initials(
                                        member.first_name,
                                        member.last_name
                                    )}
                                </div>
                            )}

                            <div className="flex-1">
                                <label className="label">
                                    Foto de perfil
                                </label>

                                <input
                                    name="profile_picture"
                                    value={member.profile_picture}
                                    onChange={handleChange}
                                    placeholder="https://imagem.com/avatar.png"
                                    className={inputClass(false)}
                                />
                            </div>
                        </div>


                        <div>
                            <label className="label">
                                Primeiro nome *
                            </label>

                            <input
                                name="first_name"
                                value={member.first_name}
                                onChange={handleChange}
                                className={inputClass(
                                    !!errors.first_name
                                )}
                            />
                        </div>


                        <div>
                            <label className="label">
                                Último nome *
                            </label>

                            <input
                                name="last_name"
                                value={member.last_name}
                                onChange={handleChange}
                                className={inputClass(
                                    !!errors.last_name
                                )}
                            />
                        </div>


                        <div>
                            <label className="label">
                                Email *
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={member.email}
                                onChange={handleChange}
                                className={inputClass(
                                    !!errors.email
                                )}
                            />
                        </div>


                        <div>
                            <label className="label">
                                Telefone
                            </label>

                            <input
                                name="phone_number"
                                value={
                                    member.phone_number ?? ""
                                }
                                onChange={handleChange}
                                className={inputClass(false)}
                            />
                        </div>


                        <div>
                            <label className="label">
                                Data de nascimento
                            </label>

                            <input
                                type="date"
                                name="dob"
                                value={member.dob}
                                onChange={handleChange}
                                className={inputClass(false)}
                            />
                        </div>


                        <div>
                            <label className="label">
                                Nacionalidade
                            </label>

                            <input
                                name="nationality"
                                value={member.nationality}
                                onChange={handleChange}
                                className={inputClass(false)}
                            />
                        </div>

                    </div>
                </section>



                {/* Employment */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-100 px-6 py-5 ">
                        <h2 className="text-base font-semibold">
                            Informação Profissional
                        </h2>

                        <p className="text-sm text-slate-500">
                            Dados relacionados ao trabalho.
                        </p>
                    </div>

                    <div className="grid gap-5 p-6 sm:grid-cols-2">
                        <div>
                            <label className="label">
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
                            <label className="label">
                                Data de contratação
                            </label>

                            <input
                                type="date"
                                name="hire_date"
                                value={member.hire_date}
                                onChange={handleChange}
                                className={inputClass(false)}
                            />
                        </div>

                        <div>
                            <label className="label">
                                Estado
                            </label>

                            <select
                                name="status"
                                value={member.status}
                                onChange={handleChange}
                                className={inputClass(false)}
                            >
                                <option value="Pending">
                                    Pendente
                                </option>

                                <option value="Active">
                                    Ativo
                                </option>

                                <option value="Inactive">
                                    Inativo
                                </option>

                                <option value="Suspended">
                                    Suspenso
                                </option>

                            </select>
                        </div>

                        <div className="sm:col-span-2">

                            <label className="label">
                                Biografia
                            </label>

                            <textarea
                                name="bio"
                                rows={4}
                                value={member.bio}
                                onChange={handleChange}
                                placeholder="
            Breve descrição profissional...
            "
                                className={inputClass(false)}
                            />
                        </div>
                    </div>
                </section>

                {showCancelConfirm && (
                    <CancelConfirmDialog
                        onKeepEditing={() => setShowCancelConfirm(false)}
                        onDiscard={confirmCancel}
                        title={""}
                    />
                )}
            </div>
        </div>
    )
}