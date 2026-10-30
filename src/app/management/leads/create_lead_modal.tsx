
"use client";

import { useState, type FormEvent } from "react";
import { Loader2, UserPlus, X } from "lucide-react";
import { createLeadAction } from "@/actions/leads";


type CreateLeadModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

type LeadForm = {
  name: string;
  company: string;
  email: string;
  phone: string;
  projectName: string;
  projectType: string;
  budget: string;
  location: string;
};

const INITIAL_FORM: LeadForm = {
  name: "",
  company: "",
  email: "",
  phone: "",
  projectName: "",
  projectType: "",
  budget: "",
  location: "",
};

const PROJECT_TYPES = [
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

/**
 * Supports values such as:
 * 15000000
 * 15.000.000
 * 15,000,000
 * 15000000,50
 * 15.000.000,50
 * 15,000,000.50
 *
 * Returns null when no budget was entered.
 */
function parseBudget(value: string): number | null {
  const input = value.trim().replace(/\s/g, "").replace(/[Kk][Zz]|AOA/gi, "");

  if (!input) return null;

  if (!/^[\d.,]+$/.test(input)) {
    throw new Error("Introduza um orçamento válido.");
  }

  const lastDot = input.lastIndexOf(".");
  const lastComma = input.lastIndexOf(",");
  const lastSeparator = Math.max(lastDot, lastComma);

  let normalized: string;

  if (lastSeparator === -1) {
    normalized = input;
  } else {
    const separator = input[lastSeparator];
    const integerPart = input.slice(0, lastSeparator);
    const decimalPart = input.slice(lastSeparator + 1);

    const hasBothSeparators = input.includes(".") && input.includes(",");

    if (hasBothSeparators) {
      // The last separator is treated as the decimal separator.
      if (!/^\d{1,2}$/.test(decimalPart)) {
        throw new Error(
          "Introduza um orçamento válido, com no máximo duas casas decimais.",
        );
      }

      normalized =
        integerPart.replace(/[.,]/g, "") + "." + decimalPart;
    } else {
      const separatorCount = (input.match(/[.,]/g) ?? []).length;

      if (separatorCount > 1) {
        // Repeated separators are accepted only as thousands grouping.
        const groupedPattern =
          separator === "."
            ? /^\d{1,3}(?:\.\d{3})+$/
            : /^\d{1,3}(?:,\d{3})+$/;

        if (!groupedPattern.test(input)) {
          throw new Error("Verifique os separadores do orçamento.");
        }

        normalized = input.replace(/[.,]/g, "");
      } else if (decimalPart.length === 3) {
        // A single separator followed by three digits is treated
        // as a thousands separator, e.g. 15.000 or 15,000.
        normalized = integerPart + decimalPart;
      } else if (/^\d{1,2}$/.test(decimalPart)) {
        normalized = integerPart + "." + decimalPart;
      } else {
        throw new Error(
          "Introduza um orçamento válido, com no máximo duas casas decimais.",
        );
      }
    }
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Introduza um orçamento válido.");
  }

  return parsed;
}

export default function CreateLeadModal({
  open,
  onClose,
  onCreated,
}: CreateLeadModalProps) {
  const [form, setForm] = useState<LeadForm>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function updateField<K extends keyof LeadForm>(
    field: K,
    value: LeadForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) setError(null);
  }

  function resetForm() {
    setForm({ ...INITIAL_FORM });
    setError(null);
  }

  function handleClose() {
    if (isSubmitting) return;

    resetForm();
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    const name = form.name.trim();
    const projectName = form.projectName.trim();
    const projectType = form.projectType.trim();

    if (!name) {
      setError("Introduza o nome do contacto.");
      return;
    }

    if (!projectName) {
      setError("Introduza o nome do projecto.");
      return;
    }

    if (!projectType) {
      setError("Seleccione o tipo de projecto.");
      return;
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
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
      await createLeadAction({
        name,
        company: form.company.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        project_name: projectName,
        project_type: projectType,
        budget,
        location: form.location.trim() || null,
      });

      resetForm();

      // Notify the parent once. The parent should refresh its data
      // and close the modal in its onCreated handler.
      if (onCreated) {
        onCreated();
      } else {
        onClose();
      }
    } catch (submitError) {
      console.error("Erro ao criar lead:", submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível criar o lead. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClassName =
    "mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/15 disabled:cursor-not-allowed disabled:bg-gray-100";

  const labelClassName = "text-sm font-medium text-gray-700";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-lead-title"
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#002950]/5 text-[#002950]">
              <UserPlus size={21} aria-hidden="true" />
            </div>

            <div>
              <h2
                id="create-lead-title"
                className="text-lg font-semibold text-[#002950]"
              >
                Novo lead
              </h2>
              <p className="mt-0.5 text-sm text-gray-500">
                Registe um novo contacto e o respectivo projecto.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Fechar modal"
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="overflow-y-auto px-6 py-5">
            <div className="space-y-6">
              <section>
                <h3 className="mb-4 text-sm font-semibold text-[#002950]">
                  Dados do contacto
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="lead-name"
                      className={labelClassName}
                    >
                      Nome do contacto <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="lead-name"
                      name="name"
                      autoComplete="name"
                      required
                      maxLength={150}
                      value={form.name}
                      onChange={(event) =>
                        updateField("name", event.target.value)
                      }
                      placeholder="Nome completo"
                      className={inputClassName}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lead-company"
                      className={labelClassName}
                    >
                      Empresa
                    </label>
                    <input
                      id="lead-company"
                      name="company"
                      autoComplete="organization"
                      maxLength={150}
                      value={form.company}
                      onChange={(event) =>
                        updateField("company", event.target.value)
                      }
                      placeholder="Nome da empresa"
                      className={inputClassName}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lead-phone"
                      className={labelClassName}
                    >
                      Telefone
                    </label>
                    <input
                      id="lead-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      maxLength={40}
                      value={form.phone}
                      onChange={(event) =>
                        updateField("phone", event.target.value)
                      }
                      placeholder="+244 ..."
                      className={inputClassName}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="lead-email"
                      className={labelClassName}
                    >
                      Email
                    </label>
                    <input
                      id="lead-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      maxLength={254}
                      value={form.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      placeholder="email@empresa.com"
                      className={inputClassName}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </section>

              <div className="border-t border-gray-100" />

              <section>
                <h3 className="mb-4 text-sm font-semibold text-[#002950]">
                  Dados do projecto
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="lead-project-name"
                      className={labelClassName}
                    >
                      Nome do projecto{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="lead-project-name"
                      name="projectName"
                      required
                      maxLength={200}
                      value={form.projectName}
                      onChange={(event) =>
                        updateField("projectName", event.target.value)
                      }
                      placeholder="Ex.: Moradia em Talatona"
                      className={inputClassName}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lead-project-type"
                      className={labelClassName}
                    >
                      Tipo de projecto{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="lead-project-type"
                      name="projectType"
                      required
                      value={form.projectType}
                      onChange={(event) =>
                        updateField("projectType", event.target.value)
                      }
                      className={inputClassName}
                      disabled={isSubmitting}
                    >
                      <option value="">Seleccione uma opção</option>
                      {PROJECT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="lead-budget"
                      className={labelClassName}
                    >
                      Orçamento estimado (Kz)
                    </label>
                    <input
                      id="lead-budget"
                      name="budget"
                      type="text"
                      inputMode="decimal"
                      value={form.budget}
                      onChange={(event) =>
                        updateField("budget", event.target.value)
                      }
                      placeholder="Ex.: 15000000"
                      className={inputClassName}
                      disabled={isSubmitting}
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      Pode introduzir o valor sem separadores de milhares.
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="lead-location"
                      className={labelClassName}
                    >
                      Localização
                    </label>
                    <input
                      id="lead-location"
                      name="location"
                      autoComplete="address-level2"
                      maxLength={200}
                      value={form.location}
                      onChange={(event) =>
                        updateField("location", event.target.value)
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
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/70 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#002950] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#003866] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  A criar...
                </>
              ) : (
                <>
                  <UserPlus size={16} aria-hidden="true" />
                  Criar lead
                </>
              )}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
