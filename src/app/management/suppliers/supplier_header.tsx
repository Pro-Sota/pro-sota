import Link from "next/link";
import {
  ArrowLeft,
  Edit3,
  Star,
} from "lucide-react";

import type { Supplier } from "./types";

type Props = {
  supplier: Supplier;
};

export function SupplierHeader({
  supplier,
}: Props) {
  const initials = getInitials(supplier.supplier_name);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/management/suppliers"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#002950]"
        >
          <ArrowLeft className="h-4 w-4" />
          Fornecedores
        </Link>

        <Link
          href={`/management/suppliers/${supplier.supplier_id}/edit`}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-[#002950] transition hover:border-slate-300"
        >
          <Edit3 className="h-4 w-4" />
          Editar fornecedor
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#002950] text-sm font-semibold text-white">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-semibold text-[#002950]">
                {supplier.supplier_name || "—"}
              </h1>

              <StatusBadge status={supplier.status} />
            </div>

            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
              <span>
                NIF: {supplier.nif || "—"}
              </span>

              {supplier.category && (
                <span>
                  {supplier.category}
                  {supplier.sub_category
                    ? ` · ${supplier.sub_category}`
                    : ""}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-[#002950]">
            <Star className="h-4 w-4 fill-[#BD9655] text-[#BD9655]" />

            {supplier.rating != null
              ? supplier.rating.toFixed(1)
              : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: Supplier["status"];
}) {
  const styles = {
    Active:
      "bg-emerald-50 text-emerald-700",
    Inactive:
      "bg-slate-100 text-slate-600",
    Prospective:
      "bg-amber-50 text-amber-700",
  };

  const labels = {
    Active: "Activo",
    Inactive: "Inactivo",
    Prospective: "Potencial",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status as keyof typeof styles] ??
        "bg-slate-100 text-slate-600"
      }`}
    >
      {labels[status as keyof typeof labels] ?? status}
    </span>
  );
}

function getInitials(name: string | null) {
  if (!name) return "SF";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}