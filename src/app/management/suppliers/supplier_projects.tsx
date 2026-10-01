import Link from "next/link";
import {
  ArrowRight,
  Building2,
  FolderKanban,
} from "lucide-react";

import { getSupplierProjects } from "@/services/supplier";

import { SectionTitle } from "./section_title";

type Props = {
  supplierId: string;
};

export async function SupplierProjects({
  supplierId,
}: Props) {
  const projects =
    await getSupplierProjects(supplierId);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <SectionTitle
        title="Projectos associados"
        action={
          projects.length > 0 ? (
            <Link
              href={`/management/suppliers/${supplierId}/projects`}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#002950]"
            >
              Ver todos
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : null
        }
      />

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FolderKanban className="mb-3 h-7 w-7 text-slate-300" />

          <p className="text-sm font-medium text-slate-500">
            Nenhum projecto associado
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Este fornecedor ainda não está associado a nenhum projecto.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {projects.slice(0, 5).map((item) => (
            <Link
              key={item.supplier_project_id}
              href={`/management/projects/${item.project?.project_id}`}
              className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                <Building2 className="h-4 w-4 text-slate-400" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#002950]">
                  {item.project?.name || "Projecto"}
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  {item.category ||
                    item.project?.project_code ||
                    "Projecto"}
                </p>
              </div>

              <Status status={item.project?.status} />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function Status({
  status,
}: {
  status?: string | null;
}) {
  if (!status) {
    return null;
  }

  return (
    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
      {status}
    </span>
  );
}