"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Save,
  Star,
  Tag,
} from "lucide-react";
import { useFormStatus } from "react-dom";

import type {
  Supplier,
} from "./types";

export default function SupplierForm({
  supplier,
  action,
  mode,
}: {
  supplier?: Supplier;
  action: (formData: FormData) => void | Promise<void>;
  mode: "create" | "edit";
}) {
  const isEdit = mode === "edit";

  const tags = Array.isArray(supplier?.tags)
    ? supplier.tags.join(", ")
    : "";

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <Link
            href={
              isEdit && supplier
                ? `/management/suppliers/${supplier.supplier_id}`
                : "/management/suppliers"
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            {isEdit
              ? "Voltar ao fornecedor"
              : "Fornecedores"}
          </Link>

          <div className="mt-5">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {isEdit
                ? "Editar fornecedor"
                : "Novo fornecedor"}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {isEdit
                ? "Actualizar os dados e a classificação do fornecedor."
                : "Registar um novo fornecedor no directório da Sota."}
            </p>
          </div>
        </div>

        <form
          action={action}
          className="space-y-6"
        >
          {supplier && (
            <input
              type="hidden"
              name="supplier_id"
              value={supplier.supplier_id}
            />
          )}

          {/* Basic information */}
          <FormSection
            icon={Building2}
            title="Informação do fornecedor"
            description="Dados principais da empresa."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Nome do fornecedor"
                name="supplier_name"
                defaultValue={
                  supplier?.supplier_name
                }
                required
                className="sm:col-span-2"
              />

              <FormField
                label="NIF"
                name="nif"
                defaultValue={supplier?.nif}
              />

              <FormField
                label="Pessoa de contacto"
                name="person_of_contact"
                defaultValue={
                  supplier?.person_of_contact
                }
              />

              <FormField
                label="Telefone"
                name="phone_number"
                defaultValue={
                  supplier?.phone_number
                }
              />

              <FormField
                label="Morada"
                name="address_line_1"
                defaultValue={
                  supplier?.address_line_1
                }
                className="sm:col-span-2"
              />

              <FormField
                label="Cidade"
                name="city"
                defaultValue={supplier?.city}
              />

              <FormField
                label="País"
                name="country"
                defaultValue={
                  supplier?.country || "Angola"
                }
              />
            </div>
          </FormSection>

          {/* Classification */}
          <FormSection
            icon={Tag}
            title="Classificação"
            description="Classifique o fornecedor para facilitar pesquisa e organização."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Categoria"
                name="category"
                defaultValue={
                  supplier?.category
                }
                placeholder="Ex.: Materiais de construção"
              />

              <FormField
                label="Subcategoria"
                name="sub_category"
                defaultValue={
                  supplier?.sub_category
                }
                placeholder="Ex.: Cimento"
              />

              <FormField
                label="Etiquetas"
                name="tags"
                defaultValue={tags}
                placeholder="Ex.: local, estratégico, obra"
                hint="Separe as etiquetas por vírgulas."
                className="sm:col-span-2"
              />
            </div>
          </FormSection>

          {/* Evaluation - edit only */}
          {isEdit && (
            <FormSection
              icon={Star}
              title="Avaliação"
              description="Registe a avaliação actual deste fornecedor."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="rating"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Avaliação
                  </label>

                  <select
                    id="rating"
                    name="rating"
                    defaultValue={
                      supplier?.rating ??
                      ""
                    }
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5"
                  >
                    <option value="">
                      Sem avaliação
                    </option>
                    <option value="1">
                      1 estrela
                    </option>
                    <option value="2">
                      2 estrelas
                    </option>
                    <option value="3">
                      3 estrelas
                    </option>
                    <option value="4">
                      4 estrelas
                    </option>
                    <option value="5">
                      5 estrelas
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="status"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Estado
                  </label>

                  <select
                    id="status"
                    name="status"
                    defaultValue={
                      supplier?.status ||
                      "Prospective"
                    }
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5"
                  >
                    <option value="Active">
                      Activo
                    </option>
                    <option value="Prospective">
                      Potencial
                    </option>
                    <option value="Inactive">
                      Inactivo
                    </option>
                  </select>
                </div>
              </div>
            </FormSection>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <Link
              href={
                isEdit && supplier
                  ? `/management/suppliers/${supplier.supplier_id}`
                  : "/management/suppliers"
              }
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancelar
            </Link>

            <SubmitButton
              label={
                isEdit
                  ? "Guardar alterações"
                  : "Criar fornecedor"
              }
            />
          </div>
        </form>
      </div>
    </div>
  );
}

function FormSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Building2;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#002950]/8 text-[#002950]">
            <Icon size={17} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              {title}
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

function FormField({
  label,
  name,
  defaultValue,
  required,
  placeholder,
  hint,
  className = "",
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5"
      />

      {hint && (
        <p className="mt-1 text-xs text-slate-400">
          {hint}
        </p>
      )}
    </div>
  );
}

function SubmitButton({
  label,
}: {
  label: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#002950] px-5 text-sm font-medium text-white transition hover:bg-[#002950]/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Save size={16} />

      {pending
        ? "A guardar..."
        : label}
    </button>
  );
}