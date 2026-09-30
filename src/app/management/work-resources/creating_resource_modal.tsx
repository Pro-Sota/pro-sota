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
import { useRouter } from "next/navigation";

import CustomSelect from "@/app/components/custom_select";

import type {
  ResourceCondition,
  ResourceFormInput,
  ResourceType,
  UnitOfMeasure,
} from "@/services/resources";

import { createResourceAction } from "@/actions/resources";
import type { CreateResourceActionInput } from "@/actions/resources";


type CreateResourceModalProps = {
  open: boolean;
  onCloseAction: () => void;

 onSubmitAction?: (
    input: CreateResourceActionInput,
  ) => Promise<unknown>;
};
export type NewResourceState = {
  resource_code: string;
  name: string;
  description: string;

  resource_type: ResourceType;
  category: string;

  brand: string;
  model: string;
  serial_number: string;
  asset_tag: string;

  unit_of_measure: UnitOfMeasure | "";

  condition_status: ResourceCondition;
  operational_status: "available" | "in_use" | "overdue" | "missing";

  acquisition_date: string;
  acquisition_value: string;
  replacement_value: string;

  notes: string;
};

const RESOURCE_TYPES: ResourceType[] = [
  "material",
  "equipment",
  "tool",
  "ppe",
  "vehicle",
];

const RESOURCE_CONDITIONS: ResourceCondition[] = [
  "operational",
  "restricted",
  "maintenance",
  "damaged",
  "retired",
];

const OPERATIONAL_STATUSES = [
  "available",
  "in_use",
  "overdue",
  "missing",
] as const;

type OperationalStatus = (typeof OPERATIONAL_STATUSES)[number];

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

const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  material: "Material consumível",
  equipment: "Equipamento",
  tool: "Ferramenta",
  ppe: "EPI",
  vehicle: "Viatura",
};

const RESOURCE_CONDITION_LABELS: Record<ResourceCondition, string> = {
  operational: "Operacional",
  restricted: "Uso restrito",
  maintenance: "Em manutenção",
  damaged: "Danificado",
  retired: "Retirado",
};

const OPERATIONAL_STATUS_LABELS: Record<
  OperationalStatus,
  string
> = {
  available: "Disponível",
  in_use: "Em utilização",
  overdue: "Devolução em atraso",
  missing: "Em falta",
};

function createInitialResource(): NewResourceState {
  return {
    resource_code: "",
    name: "",
    description: "",

    resource_type: "material",
    category: "",

    brand: "",
    model: "",
    serial_number: "",
    asset_tag: "",

    unit_of_measure: "unidade",

    condition_status: "operational",
    operational_status: "available",

    acquisition_date: "",
    acquisition_value: "",
    replacement_value: "",

    notes: "",
  };
}

const isConsumable = (type: ResourceType) =>
  type === "material";

const isReusableResource = (type: ResourceType) =>
  type === "equipment" ||
  type === "tool" ||
  type === "ppe" ||
  type === "vehicle";

function getResourceTypeIcon(type: ResourceType) {
  switch (type) {
    case "material":
      return <Boxes size={18} />;

    case "equipment":
      return <Wrench size={18} />;

    case "tool":
      return <Wrench size={18} />;

    case "ppe":
      return <HardHat size={18} />;

    case "vehicle":
      return <Truck size={18} />;

    default:
      return <Package size={18} />;
  }
}

export default function CreateResourceModal({
  open,
  onCloseAction,
  onSubmitAction,
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

      /*
       * Serial number and asset tag are primarily useful for
       * individually tracked/reusable resources.
       */
      serial_number: isReusableResource(type)
        ? current.serial_number
        : "",

      asset_tag: isReusableResource(type)
        ? current.asset_tag
        : "",

      unit_of_measure: isConsumable(type)
        ? current.unit_of_measure || "unidade"
        : "",
    }));
  };

  const handleClose = () => {
    if (saving) {
      return;
    }

    setNewResource(createInitialResource());
    onCloseAction();
  };

  const handleSaveResource = async () => {
    if (saving) {
      return;
    }

    if (
      !newResource.resource_code.trim() ||
      !newResource.name.trim()
    ) {
      return;
    }

    try {
      setSaving(true);

      const payload: CreateResourceActionInput = {
        resource_code:
          newResource.resource_code.trim(),

        name:
          newResource.name.trim(),

        description:
          newResource.description.trim(),

        resource_type:
          newResource.resource_type,

        category:
          newResource.category.trim(),

        brand:
          newResource.brand.trim(),

        model:
          newResource.model.trim(),

        serial_number:
          newResource.serial_number.trim(),

        asset_tag:
          newResource.asset_tag.trim(),

        unit_of_measure:
          newResource.unit_of_measure,

        condition_status:
          newResource.condition_status,

        operational_status:
          newResource.operational_status,

        acquisition_date:
          newResource.acquisition_date,

        acquisition_value:
          newResource.acquisition_value,

        replacement_value:
          newResource.replacement_value,

        notes:
          newResource.notes.trim(),
      };

      if (onSubmitAction) {
        await onSubmitAction(payload);
      } else {
        await createResourceAction(payload);
      }
      setNewResource(createInitialResource());

      onCloseAction();

      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao registar recurso:",
        error,
      );

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
              Crie a ficha base do recurso. Stock, afectações,
              movimentos e manutenção são geridos separadamente.
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
                    className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center text-sm font-medium transition ${selected
                        ? "border-[#BD9655] bg-white text-[#002950] shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    aria-pressed={selected}
                  >
                    {getResourceTypeIcon(type)}

                    {RESOURCE_TYPE_LABELS[type]}
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
                    value={newResource.resource_code}
                    onChange={(event) =>
                      updateResource(
                        "resource_code",
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

                <FormField
                  label="Descrição"
                  className="md:col-span-2"
                >
                  <input
                    className={INPUT_CLASS}
                    value={newResource.description}
                    onChange={(event) =>
                      updateResource(
                        "description",
                        event.target.value,
                      )
                    }
                    placeholder="Descrição do recurso"
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
                  <>
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

                    <FormField label="Etiqueta patrimonial">
                      <input
                        className={INPUT_CLASS}
                        value={newResource.asset_tag}
                        onChange={(event) =>
                          updateResource(
                            "asset_tag",
                            event.target.value,
                          )
                        }
                        placeholder="Ex.: PAT-0001"
                      />
                    </FormField>
                  </>
                )}

                <FormField label="Estado de conservação">
                  <CustomSelect
                    value={newResource.condition_status}
                    onChange={(event) =>
                      updateResource(
                        "condition_status",
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
                        {RESOURCE_CONDITION_LABELS[condition]}
                      </option>
                    ))}
                  </CustomSelect>
                </FormField>

                <FormField label="Estado operacional">
                  <CustomSelect
                    value={newResource.operational_status}
                    onChange={(event) =>
                      updateResource(
                        "operational_status",
                        event.target.value as OperationalStatus,
                      )
                    }
                    className={INPUT_CLASS}
                  >
                    {OPERATIONAL_STATUSES.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {OPERATIONAL_STATUS_LABELS[status]}
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

                <FormField label="Valor de aquisição">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={INPUT_CLASS}
                    value={newResource.acquisition_value}
                    onChange={(event) =>
                      updateResource(
                        "acquisition_value",
                        event.target.value,
                      )
                    }
                    placeholder="0,00"
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
              </div>
            </section>

            {/* Consumables */}
            {showConsumableFields && (
              <section className="border-t border-slate-200 pt-6">
                <SectionTitle title="Informação de consumo" />

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

                  <div className="md:col-span-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-sm font-medium text-slate-700">
                      Gestão de stock
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      O stock inicial, stock mínimo, custo médio,
                      lote e validade não pertencem à ficha base do
                      recurso. Estes dados devem ser geridos através
                      do sistema de stock/movimentos.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Notes */}
            <section className="border-t border-slate-200 pt-6">
              <SectionTitle title="Observações" />

              <textarea
                rows={4}
                className={`${INPUT_CLASS} resize-none`}
                value={newResource.notes}
                onChange={(event) =>
                  updateResource(
                    "notes",
                    event.target.value,
                  )
                }
                placeholder="Observações adicionais sobre o recurso..."
              />
            </section>
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
              !newResource.resource_code.trim() ||
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