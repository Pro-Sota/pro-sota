
"use client";

import {
    ArrowLeft,
    Save,
    UserRound,
    Mail,
    Phone,
    CalendarDays,
    Globe,
    BriefcaseBusiness,
    Building2,
    ShieldCheck,
    FileText,
    Camera,
    X,
    LoaderCircle,
    CheckCircle2,
    Clock3,
    LockKeyhole,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
    useEffect,
    useState,
    useTransition,
    type ChangeEvent,
    type FormEvent,
    type ReactNode,
} from "react";

import CustomSelect from "@/app/components/custom_select";
import { DEPARTMENTS, TEAM_STATUSES } from "../../constants";
import type { TeamMemberProfile } from "@/services/team_profile";
import { updateTeamMember } from "@/actions/team";

type Props = {
    member: TeamMemberProfile;
};

type FormState = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    department: string;
    jobTitle: string;
    status: string;
    dob: string;
    nationality: string;
    bio: string;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const INITIAL_STATUS = "Active";

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#BD9655] focus:ring-4 focus:ring-[#BD9655]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

const labelClass =
    "mb-2 block text-sm font-medium text-slate-700";

export default function EditMemberPage({ member }: Props) {
    const router = useRouter();

    const [isPending, startTransition] = useTransition();
    const [isAdmin, setIsAdmin] = useState(false);

    const [form, setForm] = useState<FormState>({
        firstName: member.first_name ?? "",
        lastName: member.last_name ?? "",
        email: member.email ?? "",
        phone: member.phone_number ?? "",
        department: member.department ?? "",
        jobTitle: member.job_title ?? "",
        status: member.status ?? INITIAL_STATUS,
        dob: "",
        nationality: "",
        bio: "",
    });

    const [profilePicture, setProfilePicture] =
        useState<string | null>(null);

    const [selectedPicture, setSelectedPicture] =
        useState<File | null>(null);

    const [picturePreview, setPicturePreview] =
        useState<string | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    /*
     * Populate additional fields when the profile type
     * exposes them. These values must also be included
     * in the server action before they can be persisted.
     */
    useEffect(() => {
        const profile = member as TeamMemberProfile & {
            dob?: string | null;
            nationality?: string | null;
            bio?: string | null;
            profile_picture?: string | null;
        };

        setForm((previous) => ({
            ...previous,
            dob: profile.dob ?? "",
            nationality: profile.nationality ?? "",
            bio: profile.bio ?? "",
        }));

        setProfilePicture(profile.profile_picture ?? null);
    }, [member]);

    useEffect(() => {
        if (!selectedPicture) {
            setPicturePreview(null);
            return;
        }

        const objectUrl = URL.createObjectURL(selectedPicture);
        setPicturePreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedPicture]);

    const fullName =
        `${form.firstName} ${form.lastName}`.trim() ||
        "Novo colaborador";

    const initials =
        `${form.firstName.charAt(0)}${form.lastName.charAt(0)}`
            .toUpperCase() || "PS";

    const displayedPicture =
        picturePreview ?? profilePicture;

    function updateField<K extends keyof FormState>(
        field: K,
        value: FormState[K],
    ) {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));

        setError(null);
        setSuccess(null);
    }

    function handlePictureChange(
        event: ChangeEvent<HTMLInputElement>,
    ) {
        const file = event.target.files?.[0];

        if (!file) return;

        if (
            !["image/jpeg", "image/png", "image/webp"].includes(
                file.type,
            )
        ) {
            setError("Escolha uma imagem JPG, PNG ou WebP.");
            event.target.value = "";
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setError("A imagem não pode ultrapassar 5 MB.");
            event.target.value = "";
            return;
        }

        setSelectedPicture(file);
        setError(null);
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError(null);
        setSuccess(null);

        if (!form.firstName.trim() || !form.lastName.trim()) {
            setError("Preencha o nome e o apelido.");
            return;
        }

        startTransition(async () => {
            try {
                const result = await updateTeamMember({
                    profileId: member.profile_id,
                    firstName: form.firstName.trim(),
                    lastName: form.lastName.trim(),
                    email: form.email.trim(),
                    phone: form.phone.trim(),
                    department: form.department,
                    jobTitle: form.jobTitle.trim(),
                    status: form.status,
                });

                if (!result.success) {
                    setError(
                        result.error ??
                            "Não foi possível actualizar o colaborador.",
                    );
                    return;
                }

                setSuccess("Alterações guardadas com sucesso.");

                router.refresh();

                router.push(
                    `/management/team/${member.profile_id}`,
                );
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Ocorreu um erro ao guardar as alterações.",
                );
            }
        });
    }

    function goBack() {
        router.push(`/management/team/${member.profile_id}`);
    }

    return (
        <main className="min-h-screen bg-[#F7F7F5] px-4 py-6 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-5xl space-y-6 pb-28">
                {/* Breadcrumb */}
                <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#002950]"
                >
                    <ArrowLeft size={17} />
                    Voltar ao perfil
                </button>

                {/* Profile header */}
                <header className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
                    <div className="h-1.5 bg-gradient-to-r from-[#002950] via-[#BD9655] to-[#BD9655]/40" />

                    <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                        <div className="min-w-0">
                            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#BD9655]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#BD9655]" />
                                Gestão de equipa
                            </div>

                            <h1 className="text-2xl font-semibold tracking-tight text-[#002950] sm:text-3xl">
                                Editar colaborador
                            </h1>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                Actualize os dados pessoais, contactos
                                e informação profissional do colaborador.
                            </p>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                                    <ShieldCheck size={14} />
                                    Perfil de colaborador
                                </span>

                                <StatusBadge status={form.status} />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#002950] text-xl font-semibold text-white ring-4 ring-slate-100">
                                {displayedPicture ? (
                                    <img
                                        src={displayedPicture}
                                        alt={`Fotografia de ${fullName}`}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    initials
                                )}
                            </div>

                            <div className="min-w-0">
                                <p className="max-w-48 truncate font-semibold text-slate-900">
                                    {fullName}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    {form.jobTitle ||
                                        "Função não definida"}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    ID: {member.profile_id.slice(0, 8)}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Photograph */}
                    <Section
                        number="01"
                        title="Fotografia de perfil"
                        description="Uma imagem ajuda a identificar o colaborador na equipa."
                        icon={<Camera size={19} />}
                    >
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                                {displayedPicture ? (
                                    <img
                                        src={displayedPicture}
                                        alt="Pré-visualização da fotografia"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <UserRound
                                        size={36}
                                        className="text-slate-300"
                                    />
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-[#BD9655] hover:bg-amber-50/30">
                                    <Camera size={17} />
                                    Escolher fotografia
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handlePictureChange}
                                        className="sr-only"
                                    />
                                </label>

                                {selectedPicture && (
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="max-w-60 truncate text-xs text-slate-500">
                                            {selectedPicture.name}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedPicture(null);
                                                setPicturePreview(null);
                                            }}
                                            className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                                        >
                                            <X size={14} />
                                            Remover selecção
                                        </button>
                                    </div>
                                )}

                                <p className="text-xs leading-5 text-slate-400">
                                    JPG, PNG ou WebP. Máximo de 5 MB.
                                </p>
                            </div>
                        </div>
                    </Section>

                    {/* Personal information */}
                    <Section
                        number="02"
                        title="Informação pessoal"
                        description="Dados de identificação e contacto."
                        icon={<UserRound size={19} />}
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                                label="Nome"
                                value={form.firstName}
                                onChange={(value) =>
                                    updateField("firstName", value)
                                }
                                icon={<UserRound size={17} />}
                                required
                                placeholder="Nome próprio"
                            />

                            <Field
                                label="Apelido"
                                value={form.lastName}
                                onChange={(value) =>
                                    updateField("lastName", value)
                                }
                                icon={<UserRound size={17} />}
                                required
                                placeholder="Apelido"
                            />

                            <Field
                                label="Email"
                                type="email"
                                value={form.email}
                                onChange={(value) =>
                                    updateField("email", value)
                                }
                                icon={<Mail size={17} />}
                                placeholder="nome@empresa.ao"
                            />

                            <Field
                                label="Telefone"
                                type="tel"
                                value={form.phone}
                                onChange={(value) =>
                                    updateField("phone", value)
                                }
                                icon={<Phone size={17} />}
                                placeholder="+244 9XX XXX XXX"
                            />

                            <Field
                                label="Data de nascimento"
                                type="date"
                                value={form.dob}
                                onChange={(value) =>
                                    updateField("dob", value)
                                }
                                icon={<CalendarDays size={17} />}
                            />

                            <Field
                                label="Nacionalidade"
                                value={form.nationality}
                                onChange={(value) =>
                                    updateField("nationality", value)
                                }
                                icon={<Globe size={17} />}
                                placeholder="Ex.: Angolana"
                            />
                        </div>
                    </Section>

                    {/* Professional information */}
                    <Section
                        number="03"
                        title="Informação profissional"
                        description="Função e enquadramento na estrutura da empresa."
                        icon={<BriefcaseBusiness size={19} />}
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                                label="Função / Cargo"
                                value={form.jobTitle}
                                onChange={(value) =>
                                    updateField("jobTitle", value)
                                }
                                icon={<BriefcaseBusiness size={17} />}
                                placeholder="Ex.: Arquitecto"
                            />

                            <div>
                                <label className={labelClass}>
                                    Departamento
                                </label>

                                <CustomSelect
                                    value={form.department}
                                    onChange={(event) =>
                                        updateField(
                                            "department",
                                            event.target.value,
                                        )
                                    }
                                    className={inputClass}
                                    disabled={!isAdmin}
                                >
                                    <option value="">
                                        Seleccionar departamento
                                    </option>

                                    {DEPARTMENTS.map((item) => (
                                        <option
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.label}
                                        </option>
                                    ))}
                                </CustomSelect>

                                {!isAdmin && (
                                    <FieldHint>
                                        Gerido pela administração.
                                    </FieldHint>
                                )}
                            </div>
                        </div>
                    </Section>

                    {/* Account administration */}
                    <Section
                        number="04"
                        title="Conta e permissões"
                        description="Estado de acesso e configuração administrativa."
                        icon={<ShieldCheck size={19} />}
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>
                                    Estado da conta
                                </label>

                                <CustomSelect
                                    value={form.status}
                                    onChange={(event) =>
                                        updateField(
                                            "status",
                                            event.target.value,
                                        )
                                    }
                                    className={inputClass}
                                    disabled={!isAdmin}
                                >
                                    {TEAM_STATUSES.filter(
                                        (item) => item.value !== "all",
                                    ).map((item) => (
                                        <option
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.label}
                                        </option>
                                    ))}
                                </CustomSelect>

                                {!isAdmin && (
                                    <FieldHint>
                                        Apenas administradores podem alterar
                                        o estado da conta.
                                    </FieldHint>
                                )}
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
                                        <LockKeyhole size={17} />
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-slate-800">
                                            Função de acesso
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            A função e as permissões de
                                            sistema não são alteradas
                                            através deste formulário.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* Biography */}
                    <Section
                        number="05"
                        title="Apresentação"
                        description="Experiência, especialidades e outras informações relevantes."
                        icon={<FileText size={19} />}
                    >
                        <div>
                            <label
                                htmlFor="bio"
                                className={labelClass}
                            >
                                Biografia profissional
                            </label>

                            <textarea
                                id="bio"
                                value={form.bio}
                                onChange={(event) =>
                                    updateField("bio", event.target.value)
                                }
                                maxLength={1000}
                                rows={5}
                                placeholder="Descreva a experiência profissional, as competências e as áreas de especialização..."
                                className={`${inputClass} min-h-32 resize-y leading-6`}
                            />

                            <div className="mt-2 flex items-center justify-between gap-3">
                                <FieldHint>
                                    Informação apresentada no perfil do
                                    colaborador.
                                </FieldHint>

                                <span className="shrink-0 text-xs tabular-nums text-slate-400">
                                    {form.bio.length}/1000
                                </span>
                            </div>
                        </div>
                    </Section>

                    {error && (
                        <div
                            role="alert"
                            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                        >
                            <X size={18} className="mt-0.5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {success && (
                        <div
                            role="status"
                            className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
                        >
                            <CheckCircle2
                                size={18}
                                className="mt-0.5 shrink-0"
                            />
                            <p>{success}</p>
                        </div>
                    )}
                </form>
            </div>

            {/* Sticky action bar */}
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-10">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
                    <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
                        <Clock3 size={15} />
                        Confirme os dados antes de guardar.
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        <button
                            type="button"
                            onClick={goBack}
                            disabled={isPending}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:px-5"
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            disabled={isPending}
                            onClick={() => {
                                const formElement =
                                    document.querySelector<HTMLFormElement>(
                                        "form",
                                    );

                                formElement?.requestSubmit();
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#002950] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#003b70] disabled:cursor-not-allowed disabled:opacity-60 sm:px-6"
                        >
                            {isPending ? (
                                <LoaderCircle
                                    size={17}
                                    className="animate-spin"
                                />
                            ) : (
                                <Save size={17} />
                            )}

                            {isPending
                                ? "A guardar..."
                                : "Guardar alterações"}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}

function Section({
    number,
    title,
    description,
    icon,
    children,
}: {
    number: string;
    title: string;
    description: string;
    icon: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#002950]/[0.06] text-[#002950]">
                    {icon}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-semibold tracking-[0.16em] text-[#BD9655]">
                            {number}
                        </span>

                        <h2 className="font-semibold text-[#002950]">
                            {title}
                        </h2>
                    </div>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                        {description}
                    </p>
                </div>
            </div>

            <div className="p-5 sm:p-7">{children}</div>
        </section>
    );
}

function Field({
    label,
    value,
    onChange,
    icon,
    type = "text",
    placeholder,
    required = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    icon: ReactNode;
    type?: string;
    placeholder?: string;
    required?: boolean;
}) {
    const id = label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");

    return (
        <div>
            <label htmlFor={id} className={labelClass}>
                {label}
                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </label>

            <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                    {icon}
                </span>

                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={(event) =>
                        onChange(event.target.value)
                    }
                    required={required}
                    placeholder={placeholder}
                    className={`${inputClass} pl-11`}
                />
            </div>
        </div>
    );
}

function FieldHint({ children }: { children: ReactNode }) {
    return (
        <p className="mt-2 text-xs leading-5 text-slate-400">
            {children}
        </p>
    );
}

function StatusBadge({ status }: { status: string }) {
    const normalized = status.toLowerCase();

    const styles =
        normalized === "active" || normalized === "activo"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : normalized === "pending" || normalized === "pendente"
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-slate-200 bg-slate-100 text-slate-600";

    const label =
        normalized === "active"
            ? "Activo"
            : normalized === "inactive"
              ? "Inactivo"
              : normalized === "pending"
                ? "Pendente"
                : normalized === "suspended"
                  ? "Suspenso"
                  : status;

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium ${styles}`}
        >
            {label}
        </span>
    );
}
