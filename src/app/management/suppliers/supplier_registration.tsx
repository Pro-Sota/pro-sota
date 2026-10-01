import {
  CalendarDays,
} from "lucide-react";

import type { Supplier } from "./types";
import { DetailItem } from "./detail_item";
import { SectionTitle } from "./section_title";

type Props = {
  supplier: Supplier;
};

export function SupplierRegistration({
  supplier,
}: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <SectionTitle title="Registo" />

      <div className="space-y-5">
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
  );
}

function formatDate(
  value: string | null
) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("pt-AO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}