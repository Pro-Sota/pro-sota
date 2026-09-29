"use client";

import {
    ArrowLeft,
    Save,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import CustomSelect from "@/app/components/custom_select";

import {
    DEPARTMENTS,
    TEAM_STATUSES,
} from "../../constants";

import type { TeamMemberProfile } from "@/services/team_profile";
import { updateTeamMember } from "@/actions/team";

type Props = {
    member: TeamMemberProfile;
};

export default function EditMemberPage({
    member,
}: Props) {
    const router = useRouter();

    const [isPending, startTransition] =
        useTransition();

    const [firstName, setFirstName] =
        useState(member.first_name ?? "");

    const [lastName, setLastName] =
        useState(member.last_name ?? "");

    const [email, setEmail] =
        useState(member.email ?? "");

    const [phone, setPhone] =
        useState(member.phone_number ?? "");

    const [department, setDepartment] =
        useState(member.department ?? "");

    const [jobTitle, setJobTitle] =
        useState(member.job_title ?? "");

    const [status, setStatus] =
        useState(member.status ?? "Active");

    const [error, setError] =
        useState<string | null>(null);

    const handleSubmit = (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError(null);

        startTransition(async () => {
            const result =
                await updateTeamMember({
                    profileId:
                        member.profile_id,
                    firstName,
                    lastName,
                    email,
                    phone,
                    department,
                    jobTitle,
                    status,
                });

            if (!result.success) {
                setError(
                    result.error ??
                        "Não foi possível actualizar o colaborador."
                );

                return;
            }

            router.push(
                `/management/team/${member.profile_id}`
            );

            router.refresh();
        });
    };

    return (
        <div className="min-h-screen p-6 md:p-10">
            <div className="mx-auto max-w-4xl space-y-6">
                <button
                    type="button"
                    onClick={() =>
                        router.push(
                            `/management/team/${member.profile_id}`
                        )
                    }
                    className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft size={16} />
                    Voltar ao perfil
                </button>

                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Editar colaborador
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Actualize os dados profissionais
                        e de contacto.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    <section className="rounded-2xl border border-slate-200 bg-white p-6">
                        <h2 className="font-semibold text-slate-900">
                            Informação pessoal
                        </h2>

                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <Field
                                label="Nome"
                                value={firstName}
                                onChange={setFirstName}
                                required
                            />

                            <Field
                                label="Apelido"
                                value={lastName}
                                onChange={setLastName}
                                required
                            />
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-6">
                        <h2 className="font-semibold text-slate-900">
                            Contactos
                        </h2>

                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <Field
                                label="Email"
                                type="email"
                                value={email}
                                onChange={setEmail}
                            />

                            <Field
                                label="Telefone"
                                value={phone}
                                onChange={setPhone}
                            />
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-6">
                        <h2 className="font-semibold text-slate-900">
                            Informação profissional
                        </h2>

                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <Field
                                label="Função"
                                value={jobTitle}
                                onChange={setJobTitle}
                                placeholder="Ex.: Arquitecto"
                            />

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Departamento
                                </label>

                                <CustomSelect
                                    value={
                                        department
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setDepartment(
                                            event.target
                                                .value
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
                                >
                                    <option value="">
                                        Seleccionar
                                    </option>

                                    {DEPARTMENTS.map(
                                        (
                                            item
                                        ) => (
                                            <option
                                                key={
                                                    item.value
                                                }
                                                value={
                                                    item.value
                                                }
                                            >
                                                {
                                                    item.label
                                                }
                                            </option>
                                        )
                                    )}
                                </CustomSelect>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Estado
                                </label>

                                <CustomSelect
                                    value={status}
                                    onChange={(
                                        event
                                    ) =>
                                        setStatus(
                                            event.target
                                                .value
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
                                >
                                    {TEAM_STATUSES.filter(
                                        (
                                            item
                                        ) =>
                                            item.value !==
                                            "all"
                                    ).map(
                                        (
                                            item
                                        ) => (
                                            <option
                                                key={
                                                    item.value
                                                }
                                                value={
                                                    item.value
                                                }
                                            >
                                                {
                                                    item.label
                                                }
                                            </option>
                                        )
                                    )}
                                </CustomSelect>
                            </div>
                        </div>
                    </section>

                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                router.back()
                            }
                            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#002950] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#002950]/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save size={16} />

                            {isPending
                                ? "A guardar..."
                                : "Guardar alterações"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    required,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
    required?: boolean;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>

            <input
                type={type}
                value={value}
                required={required}
                placeholder={placeholder}
                onChange={(event) =>
                    onChange(
                        event.target.value
                    )
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5"
            />
        </div>
    );
}