
"use client";

import {
    useEffect,
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";
import {
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    ArrowLeft,
    Upload,
    X,
    Copy,
} from "lucide-react";
import type { Database } from "@/app/lib/supabase/models";
import { useRouter } from "next/navigation";
import CancelConfirmDialog from "@/app/components/cancel_confirm_dialog";
import { createMemberAction } from "@/actions/team_creation";

type MemberInsert =
    Database["public"]["Tables"]["profiles"]["Insert"];

type MemberFormState = Omit<
    MemberInsert,
    "profile_id" | "created_at" | "updated_at" | "status"
> & {
    email: string;
    dob: string;
    nationality: string;
    profile_picture: string;
    bio: string;
    department: string;
    job_title: string;
};

const INITIAL_STATE: MemberFormState = {
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    dob: "",
    nationality: "",
    profile_picture: "",
    bio: "",
    department: "",
    job_title: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 ${
        hasError
            ? "border-red-400 bg-red-50"
            : "border-slate-200 bg-slate-50/60"
    }`;

const labelClass =
    "mb-1.5 block text-sm font-semibold text-slate-700";

type FormErrors = Partial<
    Record<keyof MemberFormState, string>
>;

export default function CreateMember() {
    const router = useRouter();

    const [member, setMember] = useState<MemberFormState>({
        ...INITIAL_STATE,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [profilePreview, setProfilePreview] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [success, setSuccess] = useState(false);
    const [temporaryPassword, setTemporaryPassword] = useState("");
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    // Release the previous object URL when the preview changes or unmounts.
    useEffect(() => {
        if (!profilePreview) return;

        return () => {
            URL.revokeObjectURL(profilePreview);
        };
    }, [profilePreview]);

    const handleProfileImageChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];

        if (!file) return;

        setSubmitError("");

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            setSubmitError("Selecione uma imagem JPG, PNG ou WebP.");
            event.target.value = "";
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setSubmitError("A fotografia não pode ultrapassar 5 MB.");
            event.target.value = "";
            return;
        }

        setProfileImage(file);
        setProfilePreview(URL.createObjectURL(file));
    };

    const removeProfileImage = () => {
        setProfileImage(null);
        setProfilePreview("");

        const input = document.getElementById(
            "profile_picture"
        ) as HTMLInputElement | null;

        if (input) input.value = "";
    };

    const handleChange = (
        event: ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;

        setMember((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => {
            const key = name as keyof MemberFormState;

            if (!previous[key]) return previous;

            const next = { ...previous };
            delete next[key];
            return next;
        });

        setSubmitError("");
        setSuccess(false);
        setTemporaryPassword("");
    };

    const validate = () => {
        const next: FormErrors = {};

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

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (submitting || !validate()) return;

        setSubmitting(true);
        setSubmitError("");
        setSuccess(false);
        setTemporaryPassword("");

        try {
            const formData = new FormData();

            formData.set("first_name", String(member.first_name ?? "").trim());
            formData.set("last_name", String(member.last_name ?? "").trim());
            formData.set("email", member.email.trim());
            formData.set(
                "phone_number",
                String(member.phone_number ?? "").trim()
            );
            formData.set("dob", member.dob);
            formData.set("nationality", member.nationality);
            formData.set("department", member.department);
            formData.set("job_title", member.job_title);
            formData.set("bio", member.bio);

            if (profileImage) {
                formData.set("profile_image", profileImage);
            }

            const result = await createMemberAction(formData);

            if (!result.success) {
                setSubmitError(result.message);
                return;
            }

            setSuccess(true);
            setTemporaryPassword(result.temporaryPassword);
            setMember({ ...INITIAL_STATE });
            setProfileImage(null);
            setProfilePreview("");
            setErrors({});

            const imageInput = document.getElementById(
                "profile_picture"
            ) as HTMLInputElement | null;

            if (imageInput) imageInput.value = "";
        } catch {
            setSubmitError(
                "Não foi possível criar o membro. Tente novamente."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelClick = () => {
        setShowCancelConfirm(true);
    };

    const confirmCancel = () => {
        router.push("/management/team");
    };

    return (
        <div className="min-h-full px-5 py-12">
            <div className="mx-auto max-w-3xl space-y-6">
                {/* Header */}
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={handleCancelClick}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar
                    </button>

                    <nav
                        aria-label="Navegação estrutural"
                        className="flex items-center gap-1.5 text-sm text-slate-500"
                    >
                        <button
                            type="button"
                            onClick={() => router.push("/management")}
                            className="cursor-pointer text-slate-500 transition hover:text-[#1B3A5C] hover:underline"
                        >
                            Dashboard
                        </button>

                        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />

                        <button
                            type="button"
                            onClick={() => router.push("/management/team")}
                            className="cursor-pointer text-slate-500 transition hover:text-[#1B3A5C] hover:underline"
                        >
                            Equipa
                        </button>

                        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />

                        <span className="font-medium text-slate-800">
                            Novo Membro
                        </span>
                    </nav>
                </div>

                {/* Page title */}
                <div className="mb-7">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Novo membro
                    </p>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Registar Novo Membro da Equipa
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Adicione um novo membro ao Sistema de Gestão de
                        Arquitectura. Os campos marcados com{" "}
                        <span className="text-red-500">*</span> são
                        obrigatórios.
                    </p>
                </div>

                {/* Success */}
                {success && (
                    <div
                        role="status"
                        className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800"
                    >
                        <div className="flex items-center gap-2 font-semibold">
                            <CheckCircle2 size={18} />
                            Membro e perfil criados com sucesso.
                        </div>

                        <p>
                            A conta foi criada com o perfil de acesso
                            Utilizador. Guarde a palavra-passe temporária
                            e comunique-a ao membro por um canal seguro.
                        </p>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <input
                                aria-label="Palavra-passe temporária"
                                type="text"
                                readOnly
                                value={temporaryPassword}
                                className="min-w-0 flex-1 rounded-lg border border-emerald-200 bg-white px-3 py-2 font-mono text-sm"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    void navigator.clipboard.writeText(
                                        temporaryPassword
                                    )
                                }
                                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 py-2 font-semibold hover:bg-emerald-100"
                            >
                                <Copy className="h-4 w-4" />
                                Copiar palavra-passe
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => router.push("/management/team")}
                            className="font-semibold underline underline-offset-2"
                        >
                            Voltar à equipa
                        </button>
                    </div>
                )}

                {/* Error */}
                {submitError && (
                    <div
                        role="alert"
                        className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                    >
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <span>{submitError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
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
                            {/* Profile picture */}
                            <div className="space-y-3 sm:col-span-2">
                                <label
                                    htmlFor="profile_picture"
                                    className={labelClass}
                                >
                                    Fotografia de perfil
                                </label>

                                <div className="flex flex-col gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-5 sm:flex-row sm:items-center">
                                    <div className="relative shrink-0">
                                        <div className="h-24 w-24 overflow-hidden rounded-full border border-slate-200 bg-white">
                                            {profilePreview ? (
                                                <img
                                                    src={profilePreview}
                                                    alt="Pré-visualização da fotografia"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-xs font-medium text-slate-400">
                                                    Sem foto
                                                </div>
                                            )}
                                        </div>

                                        {profilePreview && (
                                            <button
                                                type="button"
                                                onClick={removeProfileImage}
                                                disabled={submitting}
                                                aria-label="Remover fotografia"
                                                className="absolute -right-1 -top-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <label
                                            htmlFor="profile_picture"
                                            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                                        >
                                            <Upload className="h-4 w-4" />
                                            {profileImage
                                                ? "Alterar fotografia"
                                                : "Escolher fotografia"}
                                        </label>

                                        <input
                                            id="profile_picture"
                                            name="profile_picture"
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleProfileImageChange}
                                            disabled={submitting}
                                            className="hidden"
                                        />

                                        <p className="mt-2 text-xs text-slate-500">
                                            JPG, PNG ou WebP. Tamanho máximo:
                                            5 MB.
                                        </p>

                                        {profileImage && (
                                            <p className="mt-1 truncate text-xs font-medium text-slate-600">
                                                {profileImage.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* First name */}
                            <div>
                                <label htmlFor="first_name" className={labelClass}>
                                    Primeiro nome <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    autoComplete="given-name"
                                    value={member.first_name ?? ""}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    required
                                    className={inputClass(!!errors.first_name)}
                                />
                                {errors.first_name && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.first_name}
                                    </p>
                                )}
                            </div>

                            {/* Last name */}
                            <div>
                                <label htmlFor="last_name" className={labelClass}>
                                    Último nome <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    autoComplete="family-name"
                                    value={member.last_name ?? ""}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    required
                                    className={inputClass(!!errors.last_name)}
                                />
                                {errors.last_name && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.last_name}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className={labelClass}>
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    value={member.email}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    required
                                    className={inputClass(!!errors.email)}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label htmlFor="phone_number" className={labelClass}>
                                    Telefone
                                </label>
                                <input
                                    id="phone_number"
                                    name="phone_number"
                                    type="tel"
                                    autoComplete="tel"
                                    value={member.phone_number ?? ""}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    className={inputClass(false)}
                                />
                            </div>

                            {/* DOB */}
                            <div>
                                <label htmlFor="dob" className={labelClass}>
                                    Data de nascimento
                                </label>
                                <input
                                    id="dob"
                                    type="date"
                                    name="dob"
                                    value={member.dob}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    className={inputClass(false)}
                                />
                            </div>

                            {/* Nationality */}
                            <div>
                                <label htmlFor="nationality" className={labelClass}>
                                    Nacionalidade
                                </label>
                                <input
                                    id="nationality"
                                    name="nationality"
                                    value={member.nationality}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    className={inputClass(false)}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Professional Information */}
                    <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-6 py-5">
                            <h2 className="text-base font-semibold text-slate-900">
                                Informação Profissional
                            </h2>
                            <p className="text-sm text-slate-500">
                                Dados relacionados à função e área profissional.
                            </p>
                        </div>

                        <div className="grid gap-5 p-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="department" className={labelClass}>
                                    Departamento
                                </label>
                                <input
                                    id="department"
                                    name="department"
                                    value={member.department}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="Ex.: Arquitectura"
                                    className={inputClass(false)}
                                />
                            </div>

                            <div>
                                <label htmlFor="job_title" className={labelClass}>
                                    Cargo / Função
                                </label>
                                <input
                                    id="job_title"
                                    name="job_title"
                                    value={member.job_title}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="Ex.: Arquitecto Sénior"
                                    className={inputClass(false)}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="bio" className={labelClass}>
                                    Biografia
                                </label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    rows={4}
                                    value={member.bio}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="Breve descrição profissional..."
                                    className={inputClass(false)}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Actions */}
                    <div className="mt-6 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleCancelClick}
                            disabled={submitting}
                            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#BD9655] px-5 py-2.5 text-sm font-semibold text-[#002950] transition hover:bg-[#BD9655]/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting && (
                                <span className="animate-spin" aria-hidden="true">
                                    <svg
                                        className="h-4 w-4"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="9"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            className="opacity-30"
                                        />
                                        <path
                                            d="M21 12a9 9 0 0 0-9-9"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                        />
                                    </svg>
                                </span>
                            )}

                            {submitting ? "A criar..." : "Criar membro"}
                        </button>
                    </div>
                </form>

                {/* Cancel confirmation */}
                {showCancelConfirm && (
                    <CancelConfirmDialog
                        onKeepEditing={() => setShowCancelConfirm(false)}
                        onDiscard={confirmCancel}
                        title=""
                    />
                )}
            </div>
        </div>
    );
}
