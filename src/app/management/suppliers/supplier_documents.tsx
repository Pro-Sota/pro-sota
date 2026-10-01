import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
} from "lucide-react";

import { getSupplierDocuments } from "@/services/supplier";

import { SectionTitle } from "./section_title";

type Props = {
  supplierId: string;
};

export async function SupplierDocuments({
  supplierId,
}: Props) {
  const documents =
    await getSupplierDocuments(supplierId);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <SectionTitle
        title="Documentos"
        action={
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-[#002950] hover:bg-slate-50"
          >
            + Adicionar
          </button>
        }
      />

      {documents.length === 0 ? (
        <div className="py-8 text-center">
          <FileText className="mx-auto mb-3 h-7 w-7 text-slate-300" />

          <p className="text-sm font-medium text-slate-500">
            Nenhum documento
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Adicione documentos de qualificação ou conformidade.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {documents.map((document) => (
            <div
              key={document.supplier_document_id}
              className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                <FileText className="h-4 w-4 text-slate-400" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#002950]">
                  {document.title}
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  {document.document_type || "Documento"}
                </p>
              </div>

              <DocumentStatus
                status={document.status}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function DocumentStatus({
  status,
}: {
  status: string;
}) {
  const config = {
    valid: {
      label: "Válido",
      icon: CheckCircle2,
      className: "text-emerald-600 bg-emerald-50",
    },
    expiring: {
      label: "A expirar",
      icon: Clock3,
      className: "text-amber-600 bg-amber-50",
    },
    expired: {
      label: "Expirado",
      icon: AlertCircle,
      className: "text-red-600 bg-red-50",
    },
    pending: {
      label: "Pendente",
      icon: Clock3,
      className: "text-slate-600 bg-slate-100",
    },
  };

  const current =
    config[status as keyof typeof config] ??
    config.pending;

  const Icon = current.icon;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${current.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {current.label}
    </span>
  );
}