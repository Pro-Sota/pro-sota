"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Save,
} from "lucide-react";

import { createSupplier } from "@/services/supplier_client";

const DRAFT_KEY = "supplierFormDraft";

interface FormData {
  supplier_name: string;
  nif: string;
  person_of_contact: string;
  phone_number: string;
  address_line_1: string;
  city: string;
  country: string;
  category: string;
  sub_category: string;
  rating: string;
  status: "Active" | "Inactive" | "Prospective";
  tags: string;
}

const INITIAL_FORM: FormData = {
  supplier_name: "",
  nif: "",
  person_of_contact: "",
  phone_number: "",
  address_line_1: "",
  city: "",
  country: "Angola",
  category: "",
  sub_category: "",
  rating: "",
  status: "Prospective",
  tags: "",
};

const STATUS_OPTIONS = [
  { value: "Prospective", label: "Potencial" },
  { value: "Active", label: "Ativo" },
  { value: "Inactive", label: "Inativo" },
] as const;

const CATEGORY_OPTIONS = [
  "Construção",
  "Materiais de Construção",
  "Equipamentos",
  "Ferramentas",
  "Mobiliário",
  "Serviços",
  "Transporte",
  "Limpeza",
  "Segurança",
  "Outro",
];

export default function NewSupplierPage() {
  const router = useRouter();

  const [formData, setFormData] =
    useState<FormData>(INITIAL_FORM);

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const [submitting, setSubmitting] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // ---------------------------------------------------------
  // Load draft
  // ---------------------------------------------------------

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);

      if (!saved) return;

      const parsed = JSON.parse(saved);

      setFormData({
        ...INITIAL_FORM,
        ...parsed,
      });

      setHasDraft(true);
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  // ---------------------------------------------------------
  // Auto-save draft
  // ---------------------------------------------------------

  useEffect(() => {
    const hasValues = Object.entries(formData).some(
      ([key, value]) => {
        if (key === "status" || key === "country") {
          return false;
        }

        return Boolean(value);
      }
    );

    if (!hasValues) return;

    const timer = setTimeout(() => {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify(formData)
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [formData]);

  // ---------------------------------------------------------
  // Field update
  // ---------------------------------------------------------

  const updateField = (
    field: keyof FormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
      form: "",
    }));
  };

  // ---------------------------------------------------------
  // Validation
  // ---------------------------------------------------------

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.supplier_name.trim()) {
      newErrors.supplier_name =
        "O nome do fornecedor é obrigatório.";
    }

    if (formData.rating) {
      const rating = Number(formData.rating);

      if (
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5
      ) {
        newErrors.rating =
          "A avaliação deve estar entre 1 e 5.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ---------------------------------------------------------
  // Submit
  // ---------------------------------------------------------

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validate()) return;

    setSubmitting(true);

    try {
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      await createSupplier({
        supplier_name: formData.supplier_name.trim(),

        nif: formData.nif.trim() || null,

        person_of_contact:
          formData.person_of_contact.trim() || null,

        phone_number:
          formData.phone_number.trim() || null,

        address_line_1:
          formData.address_line_1.trim() || null,

        city:
          formData.city.trim() || null,

        country:
          formData.country.trim() || "Angola",

        category:
          formData.category.trim() || null,

        sub_category:
          formData.sub_category.trim() || null,

        rating: formData.rating
          ? Number(formData.rating)
          : null,

        status: formData.status,

        tags:
          tags.length > 0
            ? tags
            : null,
      });

      // Supplier successfully created
      localStorage.removeItem(DRAFT_KEY);

      router.push("/management/suppliers");
      router.refresh();
    } catch (error) {
      console.error("Create supplier error:", error);

      setErrors({
        form:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro ao criar o fornecedor.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // Cancel
  // ---------------------------------------------------------

  const handleCancel = () => {
    const hasChanges = Object.entries(formData).some(
      ([key, value]) => {
        if (key === "status") {
          return value !== "Prospective";
        }

        if (key === "country") {
          return value !== "Angola";
        }

        return Boolean(value);
      }
    );

    if (hasChanges) {
      const confirmed = window.confirm(
        "Tem alterações não guardadas. Deseja sair sem guardar?"
      );

      if (!confirmed) return;
    }

    localStorage.removeItem(DRAFT_KEY);

    router.push("/management/suppliers");
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={handleCancel}
            className="mb-5 flex cursor-pointer items-center gap-2 text-sm text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Voltar aos fornecedores
          </button>

          <h1 className="text-3xl font-bold text-slate-900">
            Novo fornecedor
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Adicione os dados do fornecedor ao sistema.
          </p>

          {hasDraft && (
            <p className="mt-2 text-xs text-slate-500">
              Rascunho recuperado automaticamente.
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* General */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 border-b border-slate-200 pb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Informação geral
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Dados principais do fornecedor.
              </p>
            </div>

            <div className="space-y-5">

              {/* Supplier name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-900">
                  Nome do fornecedor *
                </label>

                <input
                  type="text"
                  value={formData.supplier_name}
                  onChange={(e) =>
                    updateField(
                      "supplier_name",
                      e.target.value
                    )
                  }
                  placeholder="Nome da empresa ou fornecedor"
                  className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
                    errors.supplier_name
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                      : "border-slate-300 focus:border-slate-900 focus:ring-slate-900/10"
                  }`}
                />

                {errors.supplier_name && (
                  <FieldError
                    message={errors.supplier_name}
                  />
                )}
              </div>

              {/* Category / Subcategory */}
              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900">
                    Categoria
                  </label>

                  <select
                    value={formData.category}
                    onChange={(e) =>
                      updateField(
                        "category",
                        e.target.value
                      )
                    }
                    className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  >
                    <option value="">
                      Selecionar categoria
                    </option>

                    {CATEGORY_OPTIONS.map(
                      (category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900">
                    Subcategoria
                  </label>

                  <input
                    type="text"
                    value={formData.sub_category}
                    onChange={(e) =>
                      updateField(
                        "sub_category",
                        e.target.value
                      )
                    }
                    placeholder="Ex.: Cimento, Carpintaria..."
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
              </div>

              {/* NIF / Status */}
              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900">
                    NIF
                  </label>

                  <input
                    type="text"
                    value={formData.nif}
                    onChange={(e) =>
                      updateField(
                        "nif",
                        e.target.value
                      )
                    }
                    placeholder="Número de Identificação Fiscal"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900">
                    Estado
                  </label>

                  <select
                    value={formData.status}
                    onChange={(e) =>
                      updateField(
                        "status",
                        e.target.value as FormData["status"]
                      )
                    }
                    className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  >
                    {STATUS_OPTIONS.map(
                      (status) => (
                        <option
                          key={status.value}
                          value={status.value}
                        >
                          {status.label}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* Rating */}
              <div className="max-w-xs">
                <label className="mb-2 block text-sm font-medium text-slate-900">
                  Avaliação
                </label>

                <select
                  value={formData.rating}
                  onChange={(e) =>
                    updateField(
                      "rating",
                      e.target.value
                    )
                  }
                  className={`w-full cursor-pointer rounded-xl border bg-white px-4 py-3 outline-none transition focus:ring-2 ${
                    errors.rating
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                      : "border-slate-300 focus:border-slate-900 focus:ring-slate-900/10"
                  }`}
                >
                  <option value="">
                    Sem avaliação
                  </option>
                  <option value="1">1 / 5</option>
                  <option value="2">2 / 5</option>
                  <option value="3">3 / 5</option>
                  <option value="4">4 / 5</option>
                  <option value="5">5 / 5</option>
                </select>

                {errors.rating && (
                  <FieldError
                    message={errors.rating}
                  />
                )}
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 border-b border-slate-200 pb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Contacto
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Informações para contactar o fornecedor.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-900">
                  Pessoa de contacto
                </label>

                <input
                  type="text"
                  value={formData.person_of_contact}
                  onChange={(e) =>
                    updateField(
                      "person_of_contact",
                      e.target.value
                    )
                  }
                  placeholder="Nome da pessoa de contacto"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-900">
                  Telefone
                </label>

                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) =>
                    updateField(
                      "phone_number",
                      e.target.value
                    )
                  }
                  placeholder="+244 923 000 000"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </div>
          </section>

          {/* Address */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 border-b border-slate-200 pb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Localização
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Localização e morada do fornecedor.
              </p>
            </div>

            <div className="space-y-5">

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-900">
                  Endereço
                </label>

                <input
                  type="text"
                  value={formData.address_line_1}
                  onChange={(e) =>
                    updateField(
                      "address_line_1",
                      e.target.value
                    )
                  }
                  placeholder="Rua, avenida, edifício..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900">
                    Cidade
                  </label>

                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      updateField(
                        "city",
                        e.target.value
                      )
                    }
                    placeholder="Ex.: Luanda"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900">
                    País
                  </label>

                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) =>
                      updateField(
                        "country",
                        e.target.value
                      )
                    }
                    placeholder="Angola"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Tags */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 border-b border-slate-200 pb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Organização
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Adicione etiquetas para facilitar a pesquisa e
                organização.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-900">
                Tags
              </label>

              <input
                type="text"
                value={formData.tags}
                onChange={(e) =>
                  updateField(
                    "tags",
                    e.target.value
                  )
                }
                placeholder="Ex.: Local, Confiável, Materiais"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />

              <p className="mt-2 text-xs text-slate-500">
                Separe várias tags com vírgulas.
              </p>
            </div>
          </section>

          {/* Error */}
          {errors.form && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>{errors.form}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="cursor-pointer rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />

              {submitting
                ? "A guardar..."
                : "Guardar fornecedor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FieldError({
  message,
}: {
  message: string;
}) {
  return (
    <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
      <AlertCircle size={15} />
      {message}
    </div>
  );
}
