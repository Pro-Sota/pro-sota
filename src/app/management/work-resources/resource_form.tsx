"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Save,
} from "lucide-react";

import {
  createResourceAction,
  updateResourceAction,
} from "@/actions/resources";

import type {
  Resource,
  ResourceCondition,
  ResourceLocation,
  ResourceOperationalStatus,
  ResourceStock,
  ResourceType,
} from "@/services/resources";

type ResourceFormProps = {
  mode: "create" | "edit";
  resource?: Resource | null;
  stock?: ResourceStock | null;
  locations?: ResourceLocation[];
};

type FormState = {
  resource_code: string;
  name: string;

  resource_type: ResourceType | "";

  category: string;
  brand: string;
  model: string;
  serial_number: string;

  condition_status: ResourceCondition;
  operational_status: ResourceOperationalStatus;

  acquisition_date: string;
  replacement_value: string;

  notes: string;

  unit: string;
  current_quantity: string;
  minimum_quantity: string;
  average_unit_cost: string;

  warehouse_id: string;
  supplier_id: string;

  batch_number: string;
  expiry_date: string;
};

const RESOURCE_TYPES: Array<{
  value: ResourceType;
  label: string;
}> = [
  {
    value: "material",
    label: "Material consumível",
  },
  {
    value: "equipment",
    label: "Equipamento",
  },
  {
    value: "tool",
    label: "Ferramenta",
  },
  {
    value: "ppe",
    label: "EPI",
  },
  {
    value: "vehicle",
    label: "Viatura",
  },
];

const CONDITION_OPTIONS: Array<{
  value: ResourceCondition;
  label: string;
}> = [
  {
    value: "operational",
    label: "Operacional",
  },
  {
    value: "restricted",
    label: "Com restrição",
  },
  {
    value: "maintenance",
    label: "Em manutenção",
  },
  {
    value: "damaged",
    label: "Avariado",
  },
  {
    value: "retired",
    label: "Abatido",
  },
];

const OPERATIONAL_STATUS_OPTIONS: Array<{
  value: ResourceOperationalStatus;
  label: string;
}> = [
  {
    value: "available",
    label: "Disponível",
  },
  {
    value: "in_use",
    label: "Em utilização",
  },
  {
    value: "overdue",
    label: "Em atraso",
  },
  {
    value: "missing",
    label: "Em falta",
  },
];

const UNIT_OPTIONS = [
  "unidade",
  "saco",
  "kg",
  "tonelada",
  "m³",
  "m",
  "caixa",
  "litro",
] as const;

function formatDate(
  value: string | null | undefined,
): string {
  if (!value) {
    return "";
  }

  return value.includes("T")
    ? value.slice(0, 10)
    : value;
}

function numberToString(
  value: number | null | undefined,
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value);
}

function getInitialForm(
  resource?: Resource | null,
  stock?: ResourceStock | null,
): FormState {
  return {
    resource_code:
      resource?.resource_code ?? "",

    name: resource?.name ?? "",

    resource_type:
      resource?.resource_type ?? "",

    category:
      resource?.category ?? "",

    brand:
      resource?.brand ?? "",

    model:
      resource?.model ?? "",

    serial_number:
      resource?.serial_number ?? "",

    condition_status:
      resource?.condition_status ??
      "operational",

    operational_status:
      resource?.operational_status ??
      "available",

    acquisition_date: formatDate(
      resource?.acquisition_date,
    ),

    replacement_value:
      numberToString(
        resource?.replacement_value,
      ),

    notes: resource?.notes ?? "",

    unit: stock?.unit ?? "",

    current_quantity:
      numberToString(
        stock?.current_quantity,
      ),

    minimum_quantity:
      numberToString(
        stock?.minimum_quantity,
      ),

    average_unit_cost:
      numberToString(
        stock?.average_unit_cost,
      ),

    warehouse_id:
      stock?.warehouse_id ?? "",

    supplier_id:
      stock?.supplier_id ?? "",

    batch_number:
      stock?.batch_number ?? "",

    expiry_date: formatDate(
      stock?.expiry_date,
    ),
  };
}

export default function ResourceForm({
  mode,
  resource,
  stock,
  locations = [],
}: ResourceFormProps) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [form, setForm] = useState<FormState>(
    () => getInitialForm(resource, stock),
  );

  const isMaterial = form.resource_type === "material";

  const warehouseLocations =
    locations.filter(
      (location) =>
        location.location_type ===
        "warehouse",
    );

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement |
        HTMLSelectElement |
        HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!form.resource_code.trim()) {
      return;
    }

    if (!form.name.trim()) {
      return;
    }

    if (!form.resource_type) {
      return;
    }

    setIsSubmitting(true);

    try {
      /*
       * These names now match the actual
       * resources table.
       */
      const payload = {
        resource_code:
          form.resource_code.trim(),

        name: form.name.trim(),

        resource_type:
          form.resource_type,

        category:
          form.category.trim() || null,

        brand:
          form.brand.trim() || null,

        model:
          form.model.trim() || null,

        serial_number:
          form.serial_number.trim() ||
          null,

        condition_status:
          form.condition_status,

        operational_status:
          form.operational_status,

        acquisition_date:
          form.acquisition_date || null,

        replacement_value:
          form.replacement_value.trim()
            ? Number(
                form.replacement_value,
              )
            : null,

        notes:
          form.notes.trim() || null,

        /*
         * Stock fields are included here because
         * the Server Action should handle
         * resource_stock separately.
         */
        stock: isMaterial
          ? {
              unit:
                form.unit || null,

              current_quantity:
                form.current_quantity.trim()
                  ? Number(
                      form.current_quantity,
                    )
                  : 0,

              minimum_quantity:
                form.minimum_quantity.trim()
                  ? Number(
                      form.minimum_quantity,
                    )
                  : 0,

              average_unit_cost:
                form.average_unit_cost.trim()
                  ? Number(
                      form.average_unit_cost,
                    )
                  : 0,

              warehouse_id:
                form.warehouse_id || null,

              supplier_id:
                form.supplier_id || null,

              batch_number:
                form.batch_number.trim() ||
                null,

              expiry_date:
                form.expiry_date || null,
            }
          : null,
      };

      const result =
        mode === "edit" && resource
          ? await updateResourceAction(
              resource.resource_id,
              payload,
            )
          : await createResourceAction(
              payload,
            );

      if (!result.success) {
        return;
      }

      router.push(
        "/management/work-resources",
      );

      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={() =>
              router.push(
                "/management/work-resources",
              )
            }
            className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>

          <h1 className="text-2xl font-semibold text-[#002950]">
            {mode === "edit"
              ? "Editar recurso"
              : "Novo recurso"}
          </h1>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-[#002950] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#003b70] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : (
            <Save size={16} />
          )}

          {mode === "edit"
            ? "Guardar alterações"
            : "Criar recurso"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* INFORMAÇÃO DO RECURSO */}
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-5 text-base font-semibold text-gray-900">
            Informação do recurso
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="resource_code"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Código
              </label>

              <input
                id="resource_code"
                name="resource_code"
                value={
                  form.resource_code
                }
                onChange={handleChange}
                required
                placeholder="Ex.: MAT-0001"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655]"
              />
            </div>

            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Nome
              </label>

              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Nome do recurso"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655]"
              />
            </div>

            <div>
              <label
                htmlFor="resource_type"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Tipo
              </label>

              <select
                id="resource_type"
                name="resource_type"
                value={
                  form.resource_type
                }
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#BD9655]"
              >
                <option value="">
                  Selecionar tipo
                </option>

                {RESOURCE_TYPES.map(
                  (type) => (
                    <option
                      key={type.value}
                      value={type.value}
                    >
                      {type.label}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="category"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Categoria
              </label>

              <input
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Ex.: Cimento, ferramentas elétricas..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="brand"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Marca
                </label>

                <input
                  id="brand"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655]"
                />
              </div>

              <div>
                <label
                  htmlFor="model"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Modelo
                </label>

                <input
                  id="model"
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="serial_number"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Número de série
              </label>

              <input
                id="serial_number"
                name="serial_number"
                value={
                  form.serial_number
                }
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655]"
              />
            </div>

            <div>
              <label
                htmlFor="acquisition_date"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Data de aquisição
              </label>

              <input
                id="acquisition_date"
                name="acquisition_date"
                type="date"
                value={
                  form.acquisition_date
                }
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655]"
              />
            </div>
          </div>
        </section>

        {/* ESTADO */}
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-5 text-base font-semibold text-gray-900">
            Estado e avaliação
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="condition_status"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Condição
              </label>

              <select
                id="condition_status"
                name="condition_status"
                value={
                  form.condition_status
                }
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#BD9655]"
              >
                {CONDITION_OPTIONS.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="operational_status"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Estado operacional
              </label>

              <select
                id="operational_status"
                name="operational_status"
                value={
                  form.operational_status
                }
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#BD9655]"
              >
                {OPERATIONAL_STATUS_OPTIONS.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="replacement_value"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Valor de substituição
              </label>

              <div className="relative">
                <input
                  id="replacement_value"
                  name="replacement_value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    form.replacement_value
                  }
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-14 text-sm outline-none focus:border-[#BD9655]"
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  AOA
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="notes"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Notas
              </label>

              <textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={6}
                placeholder="Observações adicionais..."
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655]"
              />
            </div>
          </div>
        </section>

        {/* STOCK */}
        {isMaterial && (
          <section className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
            <h2 className="mb-1 text-base font-semibold text-gray-900">
              Stock
            </h2>

            <p className="mb-5 text-sm text-gray-500">
              Informação de stock aplicável
              a materiais consumíveis.
            </p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label
                  htmlFor="unit"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Unidade
                </label>

                <select
                  id="unit"
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  required={isMaterial}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#BD9655]"
                >
                  <option value="">
                    Selecionar unidade
                  </option>

                  {UNIT_OPTIONS.map(
                    (unit) => (
                      <option
                        key={unit}
                        value={unit}
                      >
                        {unit}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="current_quantity"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Stock atual
                </label>

                <input
                  id="current_quantity"
                  name="current_quantity"
                  type="number"
                  min="0"
                  step="0.001"
                  value={
                    form.current_quantity
                  }
                  onChange={handleChange}
                  required={isMaterial}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655]"
                />
              </div>

              <div>
                <label
                  htmlFor="minimum_quantity"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Stock mínimo
                </label>

                <input
                  id="minimum_quantity"
                  name="minimum_quantity"
                  type="number"
                  min="0"
                  step="0.001"
                  value={
                    form.minimum_quantity
                  }
                  onChange={handleChange}
                  required={isMaterial}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655]"
                />
              </div>

              <div>
                <label
                  htmlFor="average_unit_cost"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Custo médio unitário
                </label>

                <input
                  id="average_unit_cost"
                  name="average_unit_cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    form.average_unit_cost
                  }
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655]"
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="warehouse_id"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Armazém
                </label>

                <select
                  id="warehouse_id"
                  name="warehouse_id"
                  value={
                    form.warehouse_id
                  }
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#BD9655]"
                >
                  <option value="">
                    Selecionar armazém
                  </option>

                  {warehouseLocations.map(
                    (location) => (
                      <option
                        key={
                          location.location_id
                        }
                        value={
                          location.location_id
                        }
                      >
                        {location.name}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="supplier_id"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Fornecedor
                </label>

                <input
                  id="supplier_id"
                  name="supplier_id"
                  value={
                    form.supplier_id
                  }
                  onChange={handleChange}
                  placeholder="ID do fornecedor"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655]"
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="batch_number"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Número do lote
                </label>

                <input
                  id="batch_number"
                  name="batch_number"
                  value={
                    form.batch_number
                  }
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655]"
                />
              </div>

              <div>
                <label
                  htmlFor="expiry_date"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Data de validade
                </label>

                <input
                  id="expiry_date"
                  name="expiry_date"
                  type="date"
                  value={
                    form.expiry_date
                  }
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#BD9655]"
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </form>
  );
}