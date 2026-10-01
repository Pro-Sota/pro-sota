import {
  Building2,
  Hash,
  MapPin,
  Phone,
  User,
} from "lucide-react";

import type { Supplier } from "./types";
import { DetailItem } from "./detail_item";
import { SectionTitle } from "./section_title";

type Props = {
  supplier: Supplier;
};

export function SupplierContact({
  supplier,
}: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <SectionTitle title="Informação de contacto" />

      <div className="grid gap-5 sm:grid-cols-2">
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
  );
}