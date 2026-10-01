import {
  Building2,
  Tag,
} from "lucide-react";

import type { Supplier } from "./types";
import { DetailItem } from "./detail_item";
import { SectionTitle } from "./section_title";

type Props = {
  supplier: Supplier;
};

export function SupplierClassification({
  supplier,
}: Props) {
  const tags = Array.isArray(supplier.tags)
    ? supplier.tags
    : [];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <SectionTitle title="Classificação" />

      <div className="space-y-5">
        <DetailItem
          icon={Building2}
          label="Categoria"
          value={supplier.category}
        />

        <DetailItem
          icon={Building2}
          label="Subcategoria"
          value={supplier.sub_category}
        />

        <div>
          <div className="mb-2 flex items-center gap-3">
            <Tag className="h-4 w-4 text-slate-400" />

            <p className="text-xs text-slate-400">
              Etiquetas
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <span
                  key={String(tag)}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                >
                  {String(tag)}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-400">
                Sem etiquetas
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}