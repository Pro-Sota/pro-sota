import { MapPin } from "lucide-react";
import {
  inputClass,
  sectionClass,
  ANGOLA_PROVINCES,
} from "./client_form";
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
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
          <MapPin size={20} className="text-slate-600" />
        </div>

        <h2 className="text-base font-semibold text-slate-900">
          Localização
        </h2>
      </div>

      <div className="space-y-4 px-6 py-5">
        {/* País */}
        <div>
          <label
            htmlFor="country"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            País
          </label>

          <input
            id="country"
            type="text"
            name="country"
            placeholder="Angola"
            className={inputClass(false)}
            value={client.country || ""}
            onChange={onChange}
          />
        </div>

        {/* Endereço */}
        <div>
          <label
            htmlFor="address_line_1"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Endereço
          </label>

          <input
            id="address_line_1"
            type="text"
            name="address_line_1"
            placeholder="Avenida 21 de Janeiro, Rua da Independência"
            className={inputClass(false)}
            value={client.address_line_1 || ""}
            onChange={onChange}
          />
        </div>

        {/* Bairro */}
        <div>
          <label
            htmlFor="neighborhood"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Bairro
          </label>

          <input
            id="neighborhood"
            type="text"
            name="neighborhood"
            placeholder="Maianga, Talatona, Viana"
            className={inputClass(false)}
            value={client.neighborhood || ""}
            onChange={onChange}
          />
        </div>

        {/* Província & Município */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Província */}
          <div>
            <label
              htmlFor="province"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              Província
            </label>

            <CustomSelect
              name="province"
              value={client.province || ""}
              onChange={onChange}
              className={inputClass(false)}
            >
              <option value="">Selecionar província</option>

              {ANGOLA_PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </CustomSelect>
          </div>

          {/* Município / Cidade */}
          <div>
            <label
              htmlFor="city"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              Município / Cidade
            </label>

            <input
              id="city"
              type="text"
              name="city"
              placeholder="Talatona, Viana, Luanda"
              className={inputClass(false)}
              value={client.city || ""}
              onChange={onChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}