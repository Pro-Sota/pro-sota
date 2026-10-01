import {
  ClipboardCheck,
  FileText,
  FolderKanban,
  History,
  Pencil,
  Star,
  UserPlus,
} from "lucide-react";

import { getSupplierActivity } from "@/services/supplier";

import { SectionTitle } from "./section_title";

type Props = {
  supplierId: string;
};

export async function SupplierActivity({
  supplierId,
}: Props) {
  const activities =
    await getSupplierActivity(supplierId);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <SectionTitle title="Actividade" />

      {activities.length === 0 ? (
        <div className="py-8 text-center">
          <History className="mx-auto mb-3 h-7 w-7 text-slate-300" />

          <p className="text-sm font-medium text-slate-500">
            Sem actividade registada
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute bottom-0 left-[15px] top-2 w-px bg-slate-100" />

          <div className="space-y-6">
            {activities.map((activity) => (
              <div
                key={activity.activity_id}
                className="relative flex gap-4"
              >
                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white">
                  <ActivityIcon
                    type={activity.activity_type}
                  />
                </div>

                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-medium text-[#002950]">
                    {activity.description}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {formatActivityDate(
                      activity.created_at
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ActivityIcon({
  type,
}: {
  type: string;
}) {
  const Icon =
    {
      evaluation_created: Star,
      project_associated: FolderKanban,
      project_removed: FolderKanban,
      document_added: FileText,
      document_updated: FileText,
      supplier_updated: Pencil,
      supplier_created: UserPlus,
    }[type] ?? ClipboardCheck;

  return (
    <Icon className="h-3.5 w-3.5 text-[#BD9655]" />
  );
}

function formatActivityDate(
  value: string
) {
  return new Intl.DateTimeFormat("pt-AO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}