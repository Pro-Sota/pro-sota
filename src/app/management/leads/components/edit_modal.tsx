
"use client";

import {
    useEffect,
    useState,
    type FormEvent,
} from "react";
import {
    Loader2,
    Save,
    X,
} from "lucide-react";

import {
    updateLead,
    type Lead,
} from "@/services/leads";

type EditLeadModalProps = {
    open: boolean;
    lead: Lead;
    onClose: () => void;
    onUpdated: () => void;
};

type LeadForm = {
    name: string;
    company: string;
    email: string;
    phone: string;
    project_name: string;
    project_type: string;
    budget: string;
    location: string;
};

const PROJECT_TYPES = [
    "Residential",
    "Commercial",
    "Industrial",
    "Institutional",
    "Mixed Use",
    "Renovation",
    "Interior Design",
    "Landscape",
    "Other",
];

function getFormValues(lead: Lead): LeadForm {
    return {
        name: lead.name ?? "",
        company: lead.company ?? "",
        email: lead.email ?? "",
        phone: lead.phone ?? "",
        project_name: lead.project_name ?? "",
        project_type: lead.project_type ?? "",
        budget: lead.budget == null ? "" : String(lead.budget),
        location: lead.location ?? "",
    };
}

function parseBudget(value: string): number | null {
    let input = value
        .trim()
        .replace(/\s/g, "")
        .replace(/Kz|AOA/gi, "");

    if (!input) return null;

    if (!/^[\d.,]+$/.test(input)) {
        throw new Error("Introduza um orçamento válido.");
    }

    const hasDot = input.includes(".");
    const hasComma = input.includes(",");

    if (hasDot && hasComma) {
        // The last separator is the decimal separator.
        const decimalIndex = Math.max(
            input.lastIndexOf("."),
            input.lastIndexOf(","),
        );

        const integerPart = input
            .slice(0, decimalIndex)
            .replace(/[.,]/g, "");

        const decimalPart = input.slice(decimalIndex + 1);

        if (!/^\d+$/.test(integerPart) ||
            !/^\d{1,2}$/.test(decimalPart)) {
            throw new Error("Verifique o formato do orçamento.");
        }

        input = `${integerPart}.${decimalPart}`;
    } else if (hasDot || hasComma) {
        const separator = hasDot ? "." : ",";
        const parts = input.split(separator);

        if (parts.length > 2) {
            const isThousandsGrouping =
                /^\d{1,3}(?:[.,]\d{3})+$/.test(input);

            if (!isThousandsGrouping) {
                throw new Error("Verifique os separadores do orçamento.");
            }

            input = input.replace(/[.,]/g, "");
        } else {
            const [integerPart, decimalPart] = parts;

            if (!integerPart || !decimalPart) {
                throw new Error("Introduza um orçamento válido.");
            }

            // A single separator followed by exactly three digits
            // is interpreted as a thousands separator.
            if (decimalPart.length === 3) {
                input = integerPart + decimalPart;
            } else if (/^\d{1,2}$/.test(decimalPart)) {
                input = `${integerPart}.${decimalPart}`;
            } else {
                throw new Error(
                    "O orçamento deve ter no máximo duas casas decimais.",
                );
            }
        }
    }

    const amount = Number(input);

    if (!Number.isFinite(amount) || amount < 0) {
        throw new Error("Introduza um orçamento válido.");
    }

    return amount;
}

export default function EditLeadModal({
    open,
    lead,
    onClose,
    onUpdated,
}: EditLeadModalProps) {
    const [form, setForm] = useState<LeadForm>(() =>
        getFormValues(lead),
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setForm(getFormValues(lead));
            setError(null);
        }
    }, [open, lead]);

    useEffect(() => {
        if (!open) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape" && !isSubmitting) {
                onClose();
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, isSubmitting, onClose]);

    if (!open) return null;

    function setField<K extends keyof LeadForm>(
        field: K,
        value: LeadForm[K],
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        setError(null);
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (isSubmitting) return;

        const name = form.name.trim();
        const projectName = form.project_name.trim();
        const projectType = form.project_type.trim();
        const email = form.email.trim();

        if (!name) {
            setError("O nome do contacto é obrigatório.");
            return;
        }

        if (!projectName) {
            setError("O nome do projecto é obrigatório.");
            return;
        }

        if (!projectType) {
            setError("Seleccione o tipo de projecto.");
            return;
        }

        if (
            email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            setError("Introduza um endereço de email válido.");
            return;
        }

        let budget: number | null;

        try {
            budget = parseBudget(form.budget);
        } catch (parseError) {
            setError(
                parseError instanceof Error
                    ? parseError.message
                    : "Introduza um orçamento válido.",
            );
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await updateLead(lead.lead_id, {
                name,
                company: form.company.trim() || null,
                email: email || null,
                phone: form.phone.trim() || null,
                project_name: projectName,
                project_type: projectType,
                budget,
                location: form.location.trim() || null,
            });

            onUpdated();
        } catch (updateError) {
            console.error("Failed to edit lead:", updateError);

            setError(
                updateError instanceof Error
                    ? updateError.message
                    : "Não foi possível actualizar o lead.",
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    const inputClassName =
        "mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/15 disabled:cursor-not-allowed disabled:bg-neutral-100";

    const labelClassName =
        "text-sm font-medium text-neutral-700";

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !isSubmitting
                ) {
                    onClose();
                }
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-lead-title"
                className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
                <header className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-6 py-4">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                            Gestão de leads
                        </p>

                        <h2
                            id="edit-lead-title"
                            className="mt-1 text-lg font-semibold text-[#002950]"
                        >
                            Editar lead
                        </h2>

                        <p className="mt-1 text-sm text-neutral-500">
                            Actualize os dados de {lead.name}.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        aria-label="Fechar edição"
                        className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </header>

                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
                        <section>
                            <h3 className="mb-4 text-sm font-semibold text-[#002950]">
                                Dados do contacto
                            </h3>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label
                                        htmlFor="edit-lead-name"
                                        className={labelClassName}
                                    >
                                        Nome do contacto *
                                    </label>
                                    <input
                                        id="edit-lead-name"
                                        required
                                        maxLength={150}
                                        autoComplete="name"
                                        value={form.name}
                                        onChange={(event) =>
                                            setField("name", event.target.value)
                                        }
                                        className={inputClassName}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="edit-lead-company"
                                        className={labelClassName}
                                    >
                                        Empresa
                                    </label>
                                    <input
                                        id="edit-lead-company"
                                        maxLength={150}
                                        autoComplete="organization"
                                        value={form.company}
                                        onChange={(event) =>
                                            setField("company", event.target.value)
                                        }
                                        placeholder="Nome da empresa"
                                        className={inputClassName}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="edit-lead-phone"
                                        className={labelClassName}
                                    >
                                        Telefone
                                    </label>
                                    <input
                                        id="edit-lead-phone"
                                        type="tel"
                                        maxLength={40}
                                        autoComplete="tel"
                                        value={form.phone}
                                        onChange={(event) =>
                                            setField("phone", event.target.value)
                                        }
                                        placeholder="+244 ..."
                                        className={inputClassName}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label
                                        htmlFor="edit-lead-email"
                                        className={labelClassName}
                                    >
                                        Email
                                    </label>
                                    <input
                                        id="edit-lead-email"
                                        type="email"
                                        maxLength={254}
                                        autoComplete="email"
                                        value={form.email}
                                        onChange={(event) =>
                                            setField("email", event.target.value)
                                        }
                                        placeholder="email@empresa.com"
                                        className={inputClassName}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="border-t border-neutral-100" />

                        <section>
                            <h3 className="mb-4 text-sm font-semibold text-[#002950]">
                                Dados do projecto
                            </h3>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label
                                        htmlFor="edit-lead-project-name"
                                        className={labelClassName}
                                    >
                                        Nome do projecto *
                                    </label>
                                    <input
                                        id="edit-lead-project-name"
                                        required
                                        maxLength={200}
                                        value={form.project_name}
                                        onChange={(event) =>
                                            setField(
                                                "project_name",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Ex.: Moradia em Talatona"
                                        className={inputClassName}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="edit-lead-project-type"
                                        className={labelClassName}
                                    >
                                        Tipo de projecto *
                                    </label>
                                    <select
                                        id="edit-lead-project-type"
                                        required
                                        value={form.project_type}
                                        onChange={(event) =>
                                            setField(
                                                "project_type",
                                                event.target.value,
                                            )
                                        }
                                        className={inputClassName}
                                        disabled={isSubmitting}
                                    >
                                        <option value="">
                                            Seleccione uma opção
                                        </option>

                                        {form.project_type &&
                                            !PROJECT_TYPES.includes(
                                                form.project_type,
                                            ) && (
                                                <option value={form.project_type}>
                                                    {form.project_type}
                                                </option>
                                            )}

                                        {PROJECT_TYPES.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="edit-lead-budget"
                                        className={labelClassName}
                                    >
                                        Orçamento estimado (Kz)
                                    </label>
                                    <input
                                        id="edit-lead-budget"
                                        inputMode="decimal"
                                        value={form.budget}
                                        onChange={(event) =>
                                            setField("budget", event.target.value)
                                        }
                                        placeholder="Ex.: 15000000"
                                        className={inputClassName}
                                        disabled={isSubmitting}
                                    />
                                    <p className="mt-1 text-xs text-neutral-400">
                                        Pode deixar vazio se não existir orçamento.
                                    </p>
                                </div>

                                <div className="sm:col-span-2">
                                    <label
                                        htmlFor="edit-lead-location"
                                        className={labelClassName}
                                    >
                                        Localização
                                    </label>
                                    <input
                                        id="edit-lead-location"
                                        maxLength={200}
                                        value={form.location}
                                        onChange={(event) =>
                                            setField("location", event.target.value)
                                        }
                                        placeholder="Ex.: Luanda, Talatona"
                                        className={inputClassName}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                        </section>

                        {error && (
                            <div
                                role="alert"
                                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                            >
                                {error}
                            </div>
                        )}
                    </div>

                    <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-neutral-200 bg-neutral-50/70 px-6 py-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#002950] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#002950]/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    A guardar...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Guardar alterações
                                </>
                            )}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}
