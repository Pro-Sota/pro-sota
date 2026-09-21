"use client";

import { useState } from "react";
import {
  Boxes,
  HardHat,
  Package,
  Truck,
  Wrench,
  X,
} from "lucide-react";

import CustomSelect from "@/app/components/custom_select";

import type {
  ResourceCondition,
  ResourceType,
  UnitOfMeasure,
} from "./work_resource";
import { createResourceAction } from "@/app/actions/resources";
import { useRouter } from "next/navigation";

export type SupplierOption = {
  supplier_id: string;
  supplier_name: string;
};

type CreateResourceModalProps = {
  open: boolean;
  onClose: () => void;
  suppliers?: SupplierOption[];
  onSubmit?: (resource: NewResourceState) => void | Promise<void>;
};

export type NewResourceState = {
  code: string;
  name: string;
  resource_type: ResourceType;

  category: string;
  brand: string;
  model: string;
  serial_number: string;

  condition: ResourceCondition;

  acquisition_date: string;
  last_maintenance_date: string;
  next_maintenance_date: string;

  replacement_value: string;

  unit_of_measure: UnitOfMeasure | "";
  current_stock: string;
  minimum_stock: string;
  average_unit_cost: string;

  supplier_id: string;
  batch_number: string;
  expiry_date: string;
};

const RESOURCE_TYPES: ResourceType[] = [
  "Material consumível",
  "Equipamento",
  "Ferramenta",
  "EPI",
  "Viatura",
];

const RESOURCE_CONDITIONS: ResourceCondition[] = [
  "Operacional",
  "Com restrição",
  "Em manutenção",
  "Avariado",
  "Abatido",
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

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/20";

function createInitialResource(): NewResourceState {
  return {
    code: "",
    name: "",
    resource_type: "Material consumível",

    category: "",
    brand: "",
    model: "",
    serial_number: "",

    condition: "Operacional",

    acquisition_date: "",
    last_maintenance_date: "",
    next_maintenance_date: "",

    replacement_value: "",

    unit_of_measure: "unidade",
    current_stock: "",
    minimum_stock: "",
    average_unit_cost: "",

    supplier_id: "",
    batch_number: "",
    expiry_date: "",
  };
}

const isConsumable = (type: ResourceType) =>
  type === "Material consumível";

const isReusableResource = (type: ResourceType) =>
  type === "Equipamento" ||
  type === "Ferramenta" ||
  type === "EPI" ||
  type === "Viatura";

function getResourceTypeIcon(type: ResourceType) {
  switch (type) {
    case "Material consumível":
      return <Boxes size={18} />;

    case "Equipamento":
      return <Wrench size={18} />;

    case "Ferramenta":
      return <Wrench size={18} />;

    case "EPI":
      return <HardHat size={18} />;

    case "Viatura":
      return <Truck size={18} />;

    default:
      return <Package size={18} />;
  }
}

export default function CreateResourceModal({
  open,
  onClose,
  suppliers = [],
  onSubmit,
}: CreateResourceModalProps) {

    const router = useRouter();
  const [newResource, setNewResource] =
    useState<NewResourceState>(createInitialResource());

  const [saving, setSaving] = useState(false);

  if (!open) {
    return null;
  }

  const updateResource = <K extends keyof NewResourceState>(
    field: K,
    value: NewResourceState[K],
  ) => {
    setNewResource((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleResourceTypeChange = (type: ResourceType) => {
    setNewResource((current) => ({
      ...current,
      resource_type: type,

      serial_number:
        isReusableResource(type) ? current.serial_number : "",

      unit_of_measure:
        isConsumable(type)
          ? current.unit_of_measure || "unidade"
          : "",

      current_stock:
        isConsumable(type) ? current.current_stock : "",

      minimum_stock:
        isConsumable(type) ? current.minimum_stock : "",

      average_unit_cost:
        isConsumable(type) ? current.average_unit_cost : "",

      batch_number:
        isConsumable(type) ? current.batch_number : "",

      expiry_date:
        isConsumable(type) ? current.expiry_date : "",
    }));
  };

  const handleClose = () => {
    if (saving) {
      return;
    }

    setNewResource(createInitialResource());
    onClose();
  };

  const handleSaveResource = async () => {
  if (saving) {
    return;
  }

  if (!newResource.code.trim() || !newResource.name.trim()) {
    return;
  }

  try {
    setSaving(true);

    if (onSubmit) {
      await onSubmit(newResource);
    } else {
      await createResourceAction(newResource);
    }

    setNewResource(createInitialResource());

    onClose();

    router.refresh();
  } catch (error) {
    console.error("Erro ao registar recurso:", error);

    window.alert(
      error instanceof Error
        ? error.message
        : "Não foi possível registar o recurso.",
    );
  } finally {
    setSaving(false);
  }
};

  const showReusableFields = isReusableResource(
    newResource.resource_type,
  );

  const showConsumableFields = isConsumable(
    newResource.resource_type,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-resource-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2
              id="create-resource-title"
              className="text-lg font-semibold text-slate-900"
            >
              Registar Recurso
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Crie a ficha base do recurso. Afectações, movimentos
              e entregas são geridos separadamente.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            aria-label="Fechar"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Resource type */}
          <div className="border-b border-slate-200 bg-slate-50/70 p-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tipo de recurso
            </p>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {RESOURCE_TYPES.map((type) => {
                const selected =
                  newResource.resource_type === type;

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      handleResourceTypeChange(type)
                    }
                    className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center text-sm font-medium transition ${
                      selected
                        ? "border-[#BD9655] bg-white text-[#002950] shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                    aria-pressed={selected}
                  >
                    {getResourceTypeIcon(type)}
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6">
            {/* General information */}
            <section>
              <SectionTitle title="Informação geral" />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField label="Código *">
                  <input
                    className={INPUT_CLASS}
                    value={newResource.code}
                    onChange={(event) =>
                      updateResource(
                        "code",
                        event.target.value,
                      )
                    }
                    placeholder="Ex.: EQP-0001"
                  />
                </FormField>

                <FormField
                  label="Nome *"
                  className="md:col-span-2"
                >
                  <input
                    className={INPUT_CLASS}
                    value={newResource.name}
                    onChange={(event) =>
                      updateResource(
                        "name",
                        event.target.value,
                      )
                    }
                    placeholder="Nome do recurso"
                  />
                </FormField>

                <FormField label="Categoria">
                  <input
                    className={INPUT_CLASS}
                    placeholder="Cimento, ferramenta, EPI..."
                    value={newResource.category}
                    onChange={(event) =>
                      updateResource(
                        "category",
                        event.target.value,
                      )
                    }
                  />
                </FormField>

                <FormField label="Marca">
                  <input
                    className={INPUT_CLASS}
                    placeholder="Marca"
                    value={newResource.brand}
                    onChange={(event) =>
                      updateResource(
                        "brand",
                        event.target.value,
                      )
                    }
                  />
                </FormField>

                <FormField label="Modelo">
                  <input
                    className={INPUT_CLASS}
                    placeholder="Modelo"
                    value={newResource.model}
                    onChange={(event) =>
                      updateResource(
                        "model",
                        event.target.value,
                      )
                    }
                  />
                </FormField>

                {showReusableFields && (
                  <FormField label="Número de série">
                    <input
                      className={INPUT_CLASS}
                      value={newResource.serial_number}
                      onChange={(event) =>
                        updateResource(
                          "serial_number",
                          event.target.value,
                        )
                      }
                      placeholder="Se existir"
                    />
                  </FormField>
                )}

                <FormField label="Estado de conservação">
                  <CustomSelect
                    value={newResource.condition}
                    onChange={(event) =>
                      updateResource(
                        "condition",
                        event.target.value as ResourceCondition,
                      )
                    }
                    className={INPUT_CLASS}
                  >
                    {RESOURCE_CONDITIONS.map((condition) => (
                      <option
                        key={condition}
                        value={condition}
                      >
                        {condition}
                      </option>
                    ))}
                  </CustomSelect>
                </FormField>

                <FormField label="Data de aquisição">
                  <input
                    type="date"
                    className={INPUT_CLASS}
                    value={newResource.acquisition_date}
                    onChange={(event) =>
                      updateResource(
                        "acquisition_date",
                        event.target.value,
                      )
                    }
                  />
                </FormField>

                <FormField label="Valor de substituição">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={INPUT_CLASS}
                    value={newResource.replacement_value}
                    onChange={(event) =>
                      updateResource(
                        "replacement_value",
                        event.target.value,
                      )
                    }
                    placeholder="0,00"
                  />
                </FormField>

                <FormField label="Fornecedor habitual">
                  {suppliers.length > 0 ? (
                    <CustomSelect
                      value={newResource.supplier_id}
                      onChange={(event) =>
                        updateResource(
                          "supplier_id",
                          event.target.value,
                        )
                      }
                      className={INPUT_CLASS}
                    >
                      <option value="">
                        Seleccionar fornecedor
                      </option>

                      {suppliers.map((supplier) => (
                        <option
                          key={supplier.supplier_id}
                          value={supplier.supplier_id}
                        >
                          {supplier.supplier_name}
                        </option>
                      ))}
                    </CustomSelect>
                  ) : (
                    <input
                      className={INPUT_CLASS}
                      value={newResource.supplier_id}
                      onChange={(event) =>
                        updateResource(
                          "supplier_id",
                          event.target.value,
                        )
                      }
                      placeholder="ID do fornecedor"
                    />
                  )}
                </FormField>
              </div>
            </section>

            {/* Consumables */}
            {showConsumableFields && (
              <section className="border-t border-slate-200 pt-6">
                <SectionTitle title="Gestão inicial de stock" />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField label="Unidade de medida">
                    <CustomSelect
                      value={newResource.unit_of_measure}
                      onChange={(event) =>
                        updateResource(
                          "unit_of_measure",
                          event.target.value as
                            | UnitOfMeasure
                            | "",
                        )
                      }
                      className={INPUT_CLASS}
                    >
                      {UNITS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </CustomSelect>
                  </FormField>

                  <FormField label="Stock inicial">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={INPUT_CLASS}
                      value={newResource.current_stock}
                      onChange={(event) =>
                        updateResource(
                          "current_stock",
                          event.target.value,
                        )
                      }
                      placeholder="0"
                    />
                  </FormField>

                  <FormField label="Stock mínimo">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={INPUT_CLASS}
                      value={newResource.minimum_stock}
                      onChange={(event) =>
                        updateResource(
                          "minimum_stock",
                          event.target.value,
                        )
                      }
                      placeholder="0"
                    />
                  </FormField>

                  <FormField label="Custo unitário médio">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={INPUT_CLASS}
                      value={newResource.average_unit_cost}
                      onChange={(event) =>
                        updateResource(
                          "average_unit_cost",
                          event.target.value,
                        )
                      }
                      placeholder="0,00"
                    />
                  </FormField>

                  <FormField label="Lote">
                    <input
                      className={INPUT_CLASS}
                      value={newResource.batch_number}
                      onChange={(event) =>
                        updateResource(
                          "batch_number",
                          event.target.value,
                        )
                      }
                      placeholder="Número do lote"
                    />
                  </FormField>

                  <FormField label="Validade">
                    <input
                      type="date"
                      className={INPUT_CLASS}
                      value={newResource.expiry_date}
                      onChange={(event) =>
                        updateResource(
                          "expiry_date",
                          event.target.value,
                        )
                      }
                    />
                  </FormField>
                </div>
              </section>
            )}

            {/* Maintenance */}
            {showReusableFields && (
              <section className="border-t border-slate-200 pt-6">
                <SectionTitle title="Manutenção" />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField label="Última manutenção">
                    <input
                      type="date"
                      className={INPUT_CLASS}
                      value={
                        newResource.last_maintenance_date
                      }
                      onChange={(event) =>
                        updateResource(
                          "last_maintenance_date",
                          event.target.value,
                        )
                      }
                    />
                  </FormField>

                  <FormField label="Próxima manutenção">
                    <input
                      type="date"
                      className={INPUT_CLASS}
                      value={
                        newResource.next_maintenance_date
                      }
                      onChange={(event) =>
                        updateResource(
                          "next_maintenance_date",
                          event.target.value,
                        )
                      }
                    />
                  </FormField>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-slate-50/50 px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSaveResource}
            disabled={
              saving ||
              !newResource.code.trim() ||
              !newResource.name.trim()
            }
            className="rounded-lg bg-[#002950] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#002950]/90 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
          >
            {saving ? "A guardar..." : "Registar Recurso"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Small components                                                           */
/* -------------------------------------------------------------------------- */

function SectionTitle({
  title,
}: {
  title: string;
}) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-slate-900">
        {title}
      </h3>
    </div>
  );
}

function FormField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      {children}
    </div>
  );
}