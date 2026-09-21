"use client";

import { FormEvent, useState } from "react";
import { X, UserPlus, Loader2 } from "lucide-react";

import { createLead } from "@/services/leads";

type CreateLeadModalProps = {
    open: boolean;
    onClose: () => void;
    onCreated?: () => void;
};

const projectTypes = [
    "Residencial",
    "Comercial",
    "Industrial",
    "Institucional",
    "Uso misto",
    "Renovação",
    "Design de interiores",
    "Paisagismo",
    "Outro",
];

export default function CreateLeadModal({
    open,
    onClose,
    onCreated,
}: CreateLeadModalProps) {
    const [name, setName] = useState("");
    const [company, setCompany] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    const [projectName, setProjectName] = useState("");
    const [projectType, setProjectType] = useState("");
    const [budget, setBudget] = useState("");
    const [location, setLocation] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    if (!open) {
        return null;
    }

    function resetForm() {
        setName("");
        setCompany("");
        setEmail("");
        setPhone("");
        setProjectName("");
        setProjectType("");
        setBudget("");
        setLocation("");
        setError("");
    }

    function handleClose() {
        if (isSubmitting) return;

        resetForm();
        onClose();
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");

        if (!name.trim()) {
            setError("O nome do contacto é obrigatório.");
            return;
        }

        if (!projectName.trim()) {
            setError("O nome do projecto é obrigatório.");
            return;
        }

        if (!projectType) {
            setError("Seleccione o tipo de projecto.");
            return;
        }

        const parsedBudget = budget.trim()
            ? Number(budget.replace(/[^\d.,]/g, "").replace(",", "."))
            : null;

        if (
            parsedBudget !== null &&
            (!Number.isFinite(parsedBudget) || parsedBudget < 0)
        ) {
            setError("Introduza um orçamento válido.");
            return;
        }

        try {
            setIsSubmitting(true);

            await createLead({
                name,
                company: company || null,
                email: email || null,
                phone: phone || null,
                project_name: projectName,
                project_type: projectType,
                budget: parsedBudget,
                location: location || null,
            });

            resetForm();
            onCreated?.();
            onClose();
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível criar o lead.",
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
                onClick={handleClose}
            />

            <div className="relative z-10 flex max-h-[90vh] w-full max-w-[620px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#BD9655]/15 text-[#002950]">
                            <UserPlus className="h-4 w-4" />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-neutral-950">
                                Novo lead
                            </h2>

                            <p className="text-xs text-neutral-400">
                                Adicione uma nova oportunidade.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Fechar"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="min-h-0 overflow-y-auto"
                >
                    <div className="space-y-6 p-5">
                        {/* Contact */}
                        <section>
                            <div className="mb-3">
                                <h3 className="text-sm font-semibold text-neutral-900">
                                    Contacto
                                </h3>

                                <p className="mt-0.5 text-xs text-neutral-400">
                                    Informação da pessoa ou empresa interessada.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label
                                        htmlFor="lead-name"
                                        className="mb-1.5 block text-xs font-medium text-neutral-700"
                                    >
                                        Nome *
                                    </label>

                                    <input
                                        id="lead-name"
                                        type="text"
                                        value={name}
                                        onChange={(event) =>
                                            setName(event.target.value)
                                        }
                                        placeholder="Nome do contacto"
                                        required
                                        className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="lead-company"
                                        className="mb-1.5 block text-xs font-medium text-neutral-700"
                                    >
                                        Empresa
                                    </label>

                                    <input
                                        id="lead-company"
                                        type="text"
                                        value={company}
                                        onChange={(event) =>
                                            setCompany(event.target.value)
                                        }
                                        placeholder="Nome da empresa"
                                        className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="lead-phone"
                                        className="mb-1.5 block text-xs font-medium text-neutral-700"
                                    >
                                        Telefone
                                    </label>

                                    <input
                                        id="lead-phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(event) =>
                                            setPhone(event.target.value)
                                        }
                                        placeholder="+244 9XX XXX XXX"
                                        className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label
                                        htmlFor="lead-email"
                                        className="mb-1.5 block text-xs font-medium text-neutral-700"
                                    >
                                        Email
                                    </label>

                                    <input
                                        id="lead-email"
                                        type="email"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(event.target.value)
                                        }
                                        placeholder="email@exemplo.com"
                                        className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Opportunity */}
                        <section>
                            <div className="mb-3">
                                <h3 className="text-sm font-semibold text-neutral-900">
                                    Oportunidade
                                </h3>

                                <p className="mt-0.5 text-xs text-neutral-400">
                                    Informação sobre o projecto pretendido.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label
                                        htmlFor="lead-project-name"
                                        className="mb-1.5 block text-xs font-medium text-neutral-700"
                                    >
                                        Nome do projecto *
                                    </label>

                                    <input
                                        id="lead-project-name"
                                        type="text"
                                        value={projectName}
                                        onChange={(event) =>
                                            setProjectName(event.target.value)
                                        }
                                        placeholder="Ex.: Moradia em Talatona"
                                        required
                                        className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="lead-project-type"
                                        className="mb-1.5 block text-xs font-medium text-neutral-700"
                                    >
                                        Tipo de projecto *
                                    </label>

                                    <select
                                        id="lead-project-type"
                                        value={projectType}
                                        onChange={(event) =>
                                            setProjectType(event.target.value)
                                        }
                                        required
                                        className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10"
                                    >
                                        <option value="">
                                            Seleccionar tipo
                                        </option>

                                        {projectTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="lead-budget"
                                        className="mb-1.5 block text-xs font-medium text-neutral-700"
                                    >
                                        Orçamento
                                    </label>

                                    <div className="relative">
                                        <input
                                            id="lead-budget"
                                            type="text"
                                            inputMode="decimal"
                                            value={budget}
                                            onChange={(event) =>
                                                setBudget(event.target.value)
                                            }
                                            placeholder="Ex.: 15000000"
                                            className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 pr-12 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10"
                                        />

                                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400">
                                            Kz
                                        </span>
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label
                                        htmlFor="lead-location"
                                        className="mb-1.5 block text-xs font-medium text-neutral-700"
                                    >
                                        Localização
                                    </label>

                                    <input
                                        id="lead-location"
                                        type="text"
                                        value={location}
                                        onChange={(event) =>
                                            setLocation(event.target.value)
                                        }
                                        placeholder="Ex.: Talatona, Luanda"
                                        className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10"
                                    />
                                </div>
                            </div>
                        </section>

                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">
                                <p className="text-xs font-medium text-red-700">
                                    {error}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex shrink-0 items-center justify-end gap-2 border-t border-neutral-200 bg-neutral-50/70 px-5 py-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="h-10 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#BD9655] px-5 text-sm font-semibold text-[#002950] transition hover:bg-[#BD9655]/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            {isSubmitting ? "A criar..." : "Criar lead"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}