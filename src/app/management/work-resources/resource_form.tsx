"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  Save,
} from "lucide-react";
import { useRouter } from "next/navigation";

import type {
  Resource,
  ResourceCondition,
  ResourceLocationType,
  ResourceType,
  UnitOfMeasure,
} from "./work_resource";

type Props = {
  resource: Resource;
};

const TYPES: ResourceType[] = [
  "Material consumível",
  "Equipamento",
  "Ferramenta",
  "EPI",
  "Viatura",
];

const CONDITIONS: ResourceCondition[] = [
  "Operacional",
  "Com restrição",
  "Em manutenção",
  "Avariado",
  "Abatido",
];

const LOCATIONS: ResourceLocationType[] = [
  "Armazém",
  "Escritório",
  "Obra",
  "Colaborador",
  "Fornecedor",
];

const UNITS: UnitOfMeasure[] = [
  "unidade",
  "saco",
  "kg",
  "tonelada",
  "m³",
  "m",
  "caixa",
  "litro",
];

export default function EditResourceForm({
  resource,
}: Props) {
  const router = useRouter();

  const [name, setName] = useState(resource.name);
  const [category, setCategory] =
    useState(resource.category ?? "");

  const [type, setType] =
    useState<ResourceType>(
      resource.resource_type,
    );

  const [condition, setCondition] =
    useState<ResourceCondition>(
      resource.condition,
    );

  const [brand, setBrand] =
    useState(resource.brand ?? "");

  const [model, setModel] =
    useState(resource.model ?? "");

  const [serialNumber, setSerialNumber] =
    useState(resource.serial_number ?? "");

  const [locationType, setLocationType] =
    useState<ResourceLocationType | "">(
      resource.location_type ?? "",
    );

  const [locationName, setLocationName] =
    useState(resource.location_name ?? "");

  const [replacementValue, setReplacementValue] =
    useState(
      resource.replacement_value?.toString() ??
        "",
    );

  const [minimumStock, setMinimumStock] =
    useState(
      resource.minimum_stock?.toString() ?? "",
    );

  const [unit, setUnit] =
    useState<UnitOfMeasure | "">(
      resource.unit_of_measure ?? "",
    );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setSaving(true);

    try {
      /*
       * Replace with your server action:
       *
       * await updateResource(resource.resource_id, {
       *   name,
       *   category,
       *   resource_type: type,
       *   condition,
       *   brand,
       *   model,
       *   serial_number: serialNumber,
       *   location_type: locationType || null,
       *   location_name: locationName,
       *   replacement_value:
       *     replacementValue
       *       ? Number(replacementValue)
       *       : null,
       *   minimum_stock:
       *     minimumStock
       *       ? Number(minimumStock)
       *       : null,
       *   unit_of_measure: unit || null,
       * })
       */

      router.push(
        `/management/work-resources/${resource.resource_id}`,
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível actualizar o recurso.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/management/work-resources/${resource.resource_id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={15} />
          Voltar ao recurso
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Editar recurso
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Actualize os dados de {resource.name}.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
          {error && (
            <div className="m-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-6 p-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Nome
              </label>

              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#002950] focus:ring-1 focus:ring-[#002950]"
              />
            </div>

            <Field
              label="Tipo"
              as="select"
              value={type}
              onChange={(value) =>
                setType(value as ResourceType)
              }
              options={TYPES}
            />

            <Field
              label="Estado"
              as="select"
              value={condition}
              onChange={(value) =>
                setCondition(
                  value as ResourceCondition,
                )
              }
              options={CONDITIONS}
            />

            <Field
              label="Categoria"
              value={category}
              onChange={setCategory}
            />

            <Field
              label="Marca"
              value={brand}
              onChange={setBrand}
            />

            <Field
              label="Modelo"
              value={model}
              onChange={setModel}
            />

            <Field
              label="N.º de série"
              value={serialNumber}
              onChange={setSerialNumber}
            />

            <Field
              label="Tipo de localização"
              as="select"
              value={locationType}
              onChange={(value) =>
                setLocationType(value as ResourceLocationType | "")
              }
              options={["", ...LOCATIONS]}
            />

            <Field
              label="Localização"
              value={locationName}
              onChange={setLocationName}
            />

            <Field
              label="Valor de substituição"
              type="number"
              value={replacementValue}
              onChange={setReplacementValue}
            />

            <Field
              label="Unidade de medida"
              as="select"
              value={unit}
              onChange={(value) =>
                setUnit(value as UnitOfMeasure | "")
              }
              options={["", ...UNITS]}
            />

            {type === "Material consumível" && (
              <Field
                label="Stock mínimo"
                type="number"
                value={minimumStock}
                onChange={setMinimumStock}
              />
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <Link
              href={`/management/work-resources/${resource.resource_id}`}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#BD9655] px-4 py-2 text-sm font-medium text-[#002950] disabled:opacity-60"
            >
              <Save size={15} />

              {saving
                ? "A guardar..."
                : "Guardar alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  as = "input",
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  as?: "input" | "select";
  options?: string[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      {as === "select" ? (
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#002950] focus:ring-1 focus:ring-[#002950]"
        >
          {options?.map((option) => (
            <option key={option} value={option}>
              {option || "Seleccionar"}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#002950] focus:ring-1 focus:ring-[#002950]"
        />
      )}
    </div>
  );
}