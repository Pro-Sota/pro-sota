import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Edit3,
  Hash,
  MapPin,
  Phone,
  Star,
  Tag,
  User,
} from "lucide-react";

import { getSupplierById } from "@/services/supplier";
import { SupplierStatus } from "../types";

const STATUS_LABELS = {
  Active: "Activo",
  Inactive: "Inativo",
  Prospective: "Potencial",
} as const;

const STATUS_STYLES = {
  Active:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  Inactive:
    "border-slate-200 bg-slate-100 text-slate-600",
  Prospective:
    "border-amber-200 bg-amber-50 text-amber-700",
} as const;

export default async function SupplierDetailsPage({
  params,
}: {
  params: Promise<{ supplierId: string }>;
}) {
  const { supplierId } = await params;

  const supplier = await getSupplierById(supplierId);

  if (!supplier) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-10">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/management/suppliers"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Voltar aos fornecedores
          </Link>

          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-12 text-center">
            <Building2
              size={32}
              className="mx-auto text-slate-300"
            />

            <h1 className="mt-4 text-lg font-semibold text-slate-900">
              Fornecedor não encontrado
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              O fornecedor solicitado não existe ou já foi
              removido.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const rating =
    typeof supplier.rating === "number"
      ? supplier.rating
      : 0;

  const tags = Array.isArray(supplier.tags)
    ? supplier.tags
    : [];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header navigation */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/management/suppliers"
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Fornecedores
          </Link>

          <Link
            href={`/management/suppliers/${supplier.supplier_id}/edit`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Edit3 size={16} />
            Editar fornecedor
          </Link>
        </div>

        {/* Supplier header */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#002950]/8 text-lg font-semibold text-[#002950]">
                  {getInitials(supplier.supplier_name)}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
                      {supplier.supplier_name}
                    </h1>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                        STATUS_STYLES[supplier.status as SupplierStatus]
                      }`}
                    >
                      {STATUS_LABELS[supplier.status as SupplierStatus]}
                    </span>
                  </div>

                  {supplier.nif && (
                    <p className="mt-1 text-sm text-slate-500">
                      NIF: {supplier.nif}
                    </p>
                  )}

                  {supplier.category && (
                    <p className="mt-2 text-sm text-slate-600">
                      {supplier.category}

                      {supplier.sub_category
                        ? ` · ${supplier.sub_category}`
                        : ""}
                    </p>
                  )}
                </div>
              </div>

              <Rating rating={rating} />
            </div>
          </div>
        </section>

        {/* Contact + classification */}
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Informação de contacto
              </h2>
            </div>

            <div className="grid gap-x-8 gap-y-6 p-5 sm:grid-cols-2">
              <DetailItem
                icon={User}
                label="Pessoa de contacto"
                value={supplier.person_of_contact}
              />

              <DetailItem
                icon={Phone}
                label="Telefone"
                value={supplier.phone_number}
              />

              <DetailItem
                icon={MapPin}
                label="Morada"
                value={supplier.address_line_1}
              />

              <DetailItem
                icon={Building2}
                label="Cidade"
                value={supplier.city}
              />

              <DetailItem
                icon={MapPin}
                label="País"
                value={supplier.country}
              />

              <DetailItem
                icon={Hash}
                label="NIF"
                value={supplier.nif}
              />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Classificação
              </h2>
            </div>

            <div className="space-y-5 p-5">
              <DetailItem
                icon={Building2}
                label="Categoria"
                value={supplier.category}
              />

              <DetailItem
                icon={Tag}
                label="Subcategoria"
                value={supplier.sub_category}
              />

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Etiquetas
                </p>

                {tags.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={`${String(tag)}-${index}`}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                      >
                        {String(tag)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-slate-400">
                    Sem etiquetas
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Rating + registration */}
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Avaliação
              </h2>
            </div>

            <div className="p-5">
              {rating > 0 ? (
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-semibold text-slate-900">
                    {rating.toFixed(1)}
                  </div>

                  <div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map(
                        (_, index) => (
                          <Star
                            key={index}
                            size={17}
                            className={
                              index < rating
                                ? "fill-[#BD9655] text-[#BD9655]"
                                : "text-slate-200"
                            }
                          />
                        )
                      )}
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      Avaliação actual do fornecedor
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Sem avaliação
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Ainda não existe uma avaliação
                    registada para este fornecedor.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Registo
              </h2>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2">
              <DetailItem
                icon={CalendarDays}
                label="Criado em"
                value={formatDate(supplier.created_at)}
              />

              <DetailItem
                icon={CalendarDays}
                label="Actualizado em"
                value={formatDate(supplier.updated_at)}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
        <Icon size={14} />
        {label}
      </div>

      <p className="mt-1.5 text-sm text-slate-700">
        {value || "Não informado"}
      </p>
    </div>
  );
}

function Rating({
  rating,
}: {
  rating: number;
}) {
  if (!rating) {
    return (
      <span className="text-sm text-slate-400">
        Sem avaliação
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={15}
          className={
            index < rating
              ? "fill-[#BD9655] text-[#BD9655]"
              : "text-slate-200"
          }
        />
      ))}

      <span className="ml-1 text-sm font-medium text-slate-700">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "F"
  );
}

function formatDate(
  value: string | null | undefined
) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("pt-AO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}