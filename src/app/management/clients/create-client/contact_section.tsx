import { Mail, Phone } from "lucide-react";
import {
  inputClass,
  sectionClass,
  PHONE_MAX_LENGTH,
} from "./client_form";
import type { FieldChangeEvent, ClientInsert } from "./client";
import CustomSelect from "@/app/components/custom_select";

interface ContactSectionProps {
  client: ClientInsert;
  errors: Record<string, string>;
  onChange: (e: FieldChangeEvent) => void;
  onPhoneChange: (e: FieldChangeEvent) => void;
}

export default function ContactSection({
  client,
  errors,
  onChange,
  onPhoneChange,
}: ContactSectionProps) {
  return (
    <div className={sectionClass}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
          <Mail size={20} className="text-slate-600" />
        </div>

        <h2 className="text-base font-semibold text-slate-900">
          Contacto
        </h2>
      </div>

      <div className="space-y-4 px-6 py-5">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            name="email"
            placeholder="cliente@exemplo.com"
            className={inputClass(!!errors.email)}
            value={client.email || ""}
            onChange={onChange}
            autoComplete="email"
          />

          {errors.email && (
            <p className="mt-1 text-xs text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        {/* Telefone */}
        <div>
          <label
            htmlFor="phone"
            className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-700"
          >
            <Phone size={16} className="text-slate-400" />
            Telefone
          </label>

          <input
            id="phone"
            type="tel"
            name="phone"
            placeholder="+244 923 000 000"
            className={inputClass(!!errors.phone)}
            value={client.phone || ""}
            onChange={onPhoneChange}
            maxLength={PHONE_MAX_LENGTH}
            autoComplete="tel"
          />

          {errors.phone && (
            <p className="mt-1 text-xs text-red-600">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Método de contacto preferido */}
        <div>
          <label
            htmlFor="preferred_contact_method"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Método de contacto preferido
          </label>

          <CustomSelect
            name="preferred_contact_method"
            value={client.preferred_contact_method || ""}
            onChange={onChange}
            className={inputClass(false)}
          >
            <option value="">Selecionar método</option>
            <option value="Email">Email</option>
            <option value="Phone">Telefone</option>
            <option value="WhatsApp">WhatsApp</option>
          </CustomSelect>
        </div>
      </div>
    </div>
  );
}