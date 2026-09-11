import { User, Building2, Hash } from "lucide-react";
import { inputClass, sectionClass } from "./client_form";
import type { FieldChangeEvent, ClientInsert } from "./client";

interface IdentificationSectionProps {
  client: ClientInsert;
  isOrg: boolean;
  errors: Record<string, string>;
  onChange: (e: FieldChangeEvent) => void;
}

export default function IdentificationSection({
  client,
  isOrg,
  errors,
  onChange,
}: IdentificationSectionProps) {
  return (
    <div className={sectionClass}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
          {isOrg ? (
            <Building2 size={20} className="text-slate-600" />
          ) : (
            <User size={20} className="text-slate-600" />
          )}
        </div>

        <h2 className="text-base font-semibold text-slate-900">
          Identificação
        </h2>
      </div>

      <div className="space-y-4 px-6 py-5">
        {isOrg ? (
          <>
            {/* Organization Name */}
            <div>
              <label
                htmlFor="organization_name"
                className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-700"
              >
                <Building2 size={16} className="text-slate-400" />
                Nome da Empresa / Organização
                <span className="text-red-500">*</span>
              </label>

              <input
                id="organization_name"
                type="text"
                name="organization_name"
                placeholder="Digite o nome da empresa ou organização"
                className={inputClass(!!errors.organization_name)}
                value={client.organization_name || ""}
                onChange={onChange}
                autoComplete="organization"
              />

              {errors.organization_name && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.organization_name}
                </p>
              )}
            </div>

            {/* NIF */}
            <div>
              <label
                htmlFor="nif"
                className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-700"
              >
                <Hash size={16} className="text-slate-400" />
                NIF
              </label>

              <input
                id="nif"
                type="text"
                name="nif"
                placeholder="Número de Identificação Fiscal"
                className={inputClass(!!errors.nif)}
                value={client.nif || ""}
                onChange={onChange}
                inputMode="numeric"
              />

              {errors.nif && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.nif}
                </p>
              )}
            </div>

            {/* Contact Person */}
            <div>
              <label
                htmlFor="contact_person"
                className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-700"
              >
                <User size={16} className="text-slate-400" />
                Pessoa de Contacto
              </label>

              <input
                id="contact_person"
                type="text"
                name="contact_person"
                placeholder="Nome completo"
                className={inputClass(!!errors.contact_person)}
                value={client.contact_person || ""}
                onChange={onChange}
                autoComplete="name"
              />

              {errors.contact_person && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.contact_person}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Individual Name */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* First Name */}
              <div>
                <label
                  htmlFor="first_name"
                  className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-700"
                >
                  Primeiro Nome
                  <span className="text-red-500">*</span>
                </label>

                <input
                  id="first_name"
                  type="text"
                  name="first_name"
                  placeholder="João"
                  className={inputClass(!!errors.first_name)}
                  value={client.first_name || ""}
                  onChange={onChange}
                  autoComplete="given-name"
                />

                {errors.first_name && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.first_name}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="last_name"
                  className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-700"
                >
                  Último Nome
                  <span className="text-red-500">*</span>
                </label>

                <input
                  id="last_name"
                  type="text"
                  name="last_name"
                  placeholder="Silva"
                  className={inputClass(!!errors.last_name)}
                  value={client.last_name || ""}
                  onChange={onChange}
                  autoComplete="family-name"
                />

                {errors.last_name && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.last_name}
                  </p>
                )}
              </div>
            </div>

            {/* NIF */}
            <div>
              <label
                htmlFor="nif"
                className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-700"
              >
                <Hash size={16} className="text-slate-400" />
                NIF
              </label>

              <input
                id="nif"
                type="text"
                name="nif"
                placeholder="Número de Identificação Fiscal"
                className={inputClass(!!errors.nif)}
                value={client.nif || ""}
                onChange={onChange}
                inputMode="numeric"
              />

              {errors.nif && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.nif}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}