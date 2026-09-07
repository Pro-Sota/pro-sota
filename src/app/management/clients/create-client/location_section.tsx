import { MapPin } from "lucide-react";
import { inputClass, sectionClass, ANGOLA_PROVINCES } from "./client_form";
import type { FieldChangeEvent, ClientInsert } from "./client";
import CustomSelect from "@/app/components/custom_select";

interface LocationSectionProps {
  client: ClientInsert;
  onChange: (e: FieldChangeEvent) => void;
}

export default function LocationSection({
  client,
  onChange,
}: LocationSectionProps) {
  return (
    <div className={sectionClass}>
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
          <MapPin size={20} className="text-slate-600" />
        </div>
        <h2 className="text-base font-semibold text-slate-900">Localização</h2>
      </div>

      <div className="px-6 py-5 space-y-4">
        {/* Street Address */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Morada
          </label>
          <input
            type="text"
            name="address"
            placeholder="Avenida 21 de Janeiro, Rua da Independência"
            className={inputClass(false)}
            value={client.address || ""}
            onChange={onChange}
          />
        </div>

        {/* Building Number & Block/Apartment */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Número
            </label>
            <input
              type="text"
              name="building_number"
              placeholder="123, Lote 45, Conj. 12"
              className={inputClass(false)}
              value={client.building_number || ""}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Bloco / Apto
            </label>
            <input
              type="text"
              name="apartment_number"
              placeholder="Bloco A, Apto 42"
              className={inputClass(false)}
              value={client.apartment_number || ""}
              onChange={onChange}
            />
          </div>
        </div>

        {/* Neighborhood & Commune */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Bairro
            </label>
            <input
              type="text"
              name="neighborhood"
              placeholder="Maianga, Cazenga, Talatona, Viana"
              className={inputClass(false)}
              value={client.neighborhood || ""}
              onChange={onChange}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Código Postal
            </label>
            <input
              type="text"
              disabled
              name="postal_code"
              placeholder="Opcional"
              className={inputClass(false)}
              value={client.postal_code || ""}
              onChange={onChange}
            />
          </div>
        </div>

        {/* Province Dropdown */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Província
          </label>
          <CustomSelect
            name="city"
            value={client.city || ""}
            onChange={onChange}
            className={inputClass(false)}
          >
            {ANGOLA_PROVINCES.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
         </CustomSelect>
        </div>
      </div>
    </div>
  );
}
