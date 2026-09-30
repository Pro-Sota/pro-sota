"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Hash,
  Loader2,
  Package,
  Save,
  Tag,
  Wrench,
} from "lucide-react";

import {
  createResourceAction,
  updateResourceAction,
  type CreateResourceActionInput,
} from "@/actions/resources";

import type {
  Resource,
  ResourceCondition,
  ResourceOperationalStatus,
  ResourceType,
} from "@/services/resources";

type ResourceStockFormInput = {
  unit: string | null;
  current_quantity: number;
  minimum_quantity: number;
  average_unit_cost: number;
  warehouse_id: string | null;
  supplier_id: string | null;
  batch_number: string | null;
  expiry_date: string | null;
};

type ResourceFormProps = {
  mode: "create" | "edit";
  resource?: Resource | null;

  initialStock?: {
    unit: string | null;
    current_quantity: number;
    minimum_quantity: number;
    average_unit_cost: number;
    warehouse_id: string | null;
    supplier_id: string | null;
    batch_number: string | null;
    expiry_date: string | null;
  } | null;

  onSaveStockAction?: (
    resourceId: string,
    data: ResourceStockFormInput,
  ) => void | Promise<void>;
};

type FormState = {
  resource_code: string;
  name: string;
  description: string;
  resource_type: ResourceType | "";
  category: string;
  brand: string;
  model: string;
  serial_number: string;
  asset_tag: string;
  unit_of_measure: CreateResourceActionInput["unit_of_measure"];
  condition_status: ResourceCondition;
  operational_status: ResourceOperationalStatus;
  acquisition_date: string;
  acquisition_value: string;
  replacement_value: string;
  notes: string;
};

type StockFormState = {
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
  description: string;
  icon: typeof Package;
}> = [
  {
    value: "material",
    label: "Material consumível",
    description: "Materiais utilizados e consumidos em obra.",
    icon: Package,
  },
  {
    value: "equipment",
    label: "Equipamento",
    description: "Equipamentos de apoio e produção.",
    icon: Wrench,
  },
  {
    value: "tool",
    label: "Ferramenta",
    description: "Ferramentas manuais e elétricas.",
    icon: Wrench,
  },
  {
    value: "ppe",
    label: "EPI",
    description: "Equipamentos de proteção individual.",
    icon: CheckCircle2,
  },
  {
    value: "vehicle",
    label: "Viatura",
    description: "Viaturas e meios de transporte.",
    icon: Boxes,
  },
];

const CONDITION_OPTIONS: Array<{
  value: ResourceCondition;
  label: string;
}> = [
  { value: "operational", label: "Operacional" },
  { value: "restricted", label: "Com restrição" },
  { value: "maintenance", label: "Em manutenção" },
  { value: "damaged", label: "Avariado" },
  { value: "retired", label: "Abatido" },
];

const OPERATIONAL_STATUS_OPTIONS: Array<{
  value: ResourceOperationalStatus;
  label: string;
}> = [
  { value: "available", label: "Disponível" },
  { value: "in_use", label: "Em utilização" },
  { value: "overdue", label: "Em atraso" },
  { value: "missing", label: "Em falta" },
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

function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  return value.includes("T") ? value.slice(0, 10) : value;
}

function numberToString(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function getInitialForm(resource?: Resource | null): FormState {
  return {
    resource_code: resource?.resource_code ?? "",
    name: resource?.name ?? "",
    description: resource?.description ?? "",
    resource_type: resource?.resource_type ?? "",
    category: resource?.category ?? "",
    brand: resource?.brand ?? "",
    model: resource?.model ?? "",
    serial_number: resource?.serial_number ?? "",
    asset_tag: resource?.asset_tag ?? "",
    unit_of_measure: resource?.unit_of_measure ?? "",
    condition_status: resource?.condition_status ?? "operational",
    operational_status: resource?.operational_status ?? "available",
    acquisition_date: formatDate(resource?.acquisition_date),
    acquisition_value: numberToString(resource?.acquisition_value),
    replacement_value: numberToString(resource?.replacement_value),
    notes: resource?.notes ?? "",
  };
}

function getInitialStock(
  stock?: ResourceFormProps["initialStock"],
): StockFormState {
  return {
    unit: stock?.unit ?? "",
    current_quantity:
      stock?.current_quantity != null
        ? String(stock.current_quantity)
        : "",
    minimum_quantity:
      stock?.minimum_quantity != null
        ? String(stock.minimum_quantity)
        : "",
    average_unit_cost:
      stock?.average_unit_cost != null
        ? String(stock.average_unit_cost)
        : "",
    warehouse_id: stock?.warehouse_id ?? "",
    supplier_id: stock?.supplier_id ?? "",
    batch_number: stock?.batch_number ?? "",
    expiry_date: formatDate(stock?.expiry_date),
  };
}

function parseNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#BD9655] focus:ring-4 focus:ring-[#BD9655]/10";

const selectClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-[#BD9655] focus:ring-4 focus:ring-[#BD9655]/10";

const textareaClassName =
  "w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#BD9655] focus:ring-4 focus:ring-[#BD9655]/10";

function SectionHeader({
  icon: Icon,
  title,
  description,
  badge,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-7">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#002950]">
          <Icon size={18} />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      {badge && (
        <span className="shrink-0 rounded-full bg-[#002950]/5 px-3 py-1 text-[11px] font-medium text-[#002950]">
          {badge}
        </span>
      )}
    </div>
  );
}

export default function ResourceForm({
  mode,
  resource,
  initialStock,
  onSaveStockAction,
}: ResourceFormProps) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<FormState>(() =>
    getInitialForm(resource),
  );

  const [stock, setStock] = useState<StockFormState>(() =>
    getInitialStock(initialStock),
  );

  const isMaterial = form.resource_type === "material";

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleStockChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;

    setStock((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.resource_code.trim()) return;
    if (!form.name.trim()) return;
    if (!form.resource_type) return;

    setIsSubmitting(true);

    try {
      const payload: CreateResourceActionInput = {
        resource_code: form.resource_code.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        resource_type: form.resource_type,
        category: form.category.trim(),
        brand: form.brand.trim(),
        model: form.model.trim(),
        serial_number: form.serial_number.trim(),
        asset_tag: form.asset_tag.trim(),
        unit_of_measure: form.unit_of_measure,
        condition_status: form.condition_status,
        operational_status: form.operational_status,
        acquisition_date: form.acquisition_date,
        acquisition_value: form.acquisition_value,
        replacement_value: form.replacement_value,
        notes: form.notes.trim(),
      };

      const result =
        mode === "edit" && resource
          ? await updateResourceAction(
              resource.resource_id,
              payload,
            )
          : await createResourceAction(payload);

      if (!result.success || !result.resource_id) {
        console.error(result.error);
        return;
      }

      if (
        isMaterial &&
        onSaveStockAction
      ) {
        await onSaveStockAction(
          result.resource_id,
          {
            unit: stock.unit.trim() || null,
            current_quantity: parseNumber(
              stock.current_quantity,
            ),
            minimum_quantity: parseNumber(
              stock.minimum_quantity,
            ),
            average_unit_cost: parseNumber(
              stock.average_unit_cost,
            ),
            warehouse_id:
              stock.warehouse_id.trim() || null,
            supplier_id:
              stock.supplier_id.trim() || null,
            batch_number:
              stock.batch_number.trim() || null,
            expiry_date: stock.expiry_date || null,
          },
        );
      }

      router.push("/management/work-resources");
      router.refresh();
    } catch (error) {
      console.error(
        "ResourceForm submit error:",
        error,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-5xl px-4 pb-20 pt-2 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() =>
            router.push("/management/work-resources")
          }
          disabled={isSubmitting}
          className="mb-5 inline-flex items-center gap-2 rounded-lg px-1 py-1 text-sm font-medium text-slate-500 transition hover:text-[#002950] disabled:opacity-50"
        >
          <ArrowLeft size={15} />
          Recursos de obra
        </button>

        <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#002950] text-white shadow-sm">
                {mode === "edit" ? (
                  <Wrench size={21} />
                ) : (
                  <Package size={21} />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight text-[#002950]">
                    {mode === "edit"
                      ? "Editar recurso"
                      : "Novo recurso"}
                  </h1>

                  {mode === "edit" &&
                    resource?.resource_code && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
                        {resource.resource_code}
                      </span>
                    )}
                </div>

                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                  Registe a identificação, características,
                  estado e informação financeira do recurso.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:self-end">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                {mode === "edit"
                  ? "Edição"
                  : "Novo registo"}
              </span>

              {isMaterial && (
                <span className="rounded-full bg-[#BD9655]/10 px-3 py-1.5 text-xs font-medium text-[#8a682f]">
                  Com stock
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Single column content */}
      <div className="space-y-7">
        {/* Information */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            icon={FileText}
            title="Informação do recurso"
            description="Identificação e características principais."
          />

          <div className="space-y-6 p-6 sm:p-7">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="resource_code"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Código
                  <span className="ml-1 text-[#BD9655]">*</span>
                </label>

                <div className="relative">
                  <Hash
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="resource_code"
                    name="resource_code"
                    value={form.resource_code}
                    onChange={handleChange}
                    required
                    placeholder="MAT-0001"
                    className={`${inputClassName} pl-10`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="asset_tag"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Etiqueta patrimonial
                </label>

                <div className="relative">
                  <Tag
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="asset_tag"
                    name="asset_tag"
                    value={form.asset_tag}
                    onChange={handleChange}
                    placeholder="PAT-0001"
                    className={`${inputClassName} pl-10`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Nome
                <span className="ml-1 text-[#BD9655]">*</span>
              </label>

              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Ex.: Cimento Portland 42.5"
                className={inputClassName}
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Descrição
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Descreva o recurso, finalidade ou características relevantes..."
                className={textareaClassName}
              />
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="block text-sm font-medium text-slate-700">
                  Tipo
                  <span className="ml-1 text-[#BD9655]">*</span>
                </label>

                <span className="text-xs text-slate-400">
                  Selecione uma categoria
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {RESOURCE_TYPES.map((type) => {
                  const Icon = type.icon;
                  const selected =
                    form.resource_type === type.value;

                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          resource_type: type.value,
                          unit_of_measure:
                            type.value === "material"
                              ? current.unit_of_measure
                              : current.unit_of_measure,
                        }))
                      }
                      className={[
                        "group min-h-[96px] rounded-xl border p-4 text-left transition",
                        selected
                          ? "border-[#BD9655] bg-[#BD9655]/5 shadow-sm ring-1 ring-[#BD9655]"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={[
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition",
                            selected
                              ? "bg-[#002950] text-white"
                              : "bg-slate-100 text-slate-500 group-hover:bg-slate-200",
                          ].join(" ")}
                        >
                          <Icon size={17} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800">
                            {type.label}
                          </p>

                          <p className="mt-1 text-[11px] leading-4 text-slate-500">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Categoria
                </label>

                <input
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Ex.: Cimento"
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="unit_of_measure"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Unidade de medida
                </label>

                <select
                  id="unit_of_measure"
                  name="unit_of_measure"
                  value={form.unit_of_measure}
                  onChange={handleChange}
                  className={selectClassName}
                >
                  <option value="">
                    Selecionar unidade
                  </option>

                  {UNIT_OPTIONS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="brand"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Marca
                </label>

                <input
                  id="brand"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="Ex.: Bosch"
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="model"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Modelo
                </label>

                <input
                  id="model"
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  placeholder="Modelo"
                  className={inputClassName}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="serial_number"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Número de série
              </label>

              <input
                id="serial_number"
                name="serial_number"
                value={form.serial_number}
                onChange={handleChange}
                placeholder="Número de série do fabricante"
                className={inputClassName}
              />
            </div>
          </div>
        </section>

        {/* Status */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            icon={CheckCircle2}
            title="Estado do recurso"
            description="Defina a condição física e a disponibilidade operacional."
          />

          <div className="grid gap-5 p-6 sm:p-7 md:grid-cols-2">
            <div>
              <label
                htmlFor="condition_status"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Condição
              </label>

              <select
                id="condition_status"
                name="condition_status"
                value={form.condition_status}
                onChange={handleChange}
                required
                className={selectClassName}
              >
                {CONDITION_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="operational_status"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Estado operacional
              </label>

              <select
                id="operational_status"
                name="operational_status"
                value={form.operational_status}
                onChange={handleChange}
                required
                className={selectClassName}
              >
                {OPERATIONAL_STATUS_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Stock */}
        {isMaterial && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              icon={Boxes}
              title="Controlo de stock"
              description="Quantidades, custos, localização, lote e validade do material."
              badge="Material"
            />

            <div className="space-y-6 p-6 sm:p-7">
              <div className="rounded-xl border border-[#BD9655]/20 bg-[#BD9655]/5 p-4">
                <div className="flex items-start gap-3">
                  <ClipboardList
                    size={18}
                    className="mt-0.5 shrink-0 text-[#BD9655]"
                  />

                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Stock separado do recurso
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      A informação de stock será guardada em{" "}
                      <span className="font-medium text-slate-700">
                        resource_stock
                      </span>
                      , mantendo o registo principal do recurso
                      separado do controlo de inventário.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="stock_unit"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Unidade de stock
                  </label>

                  <select
                    id="stock_unit"
                    name="unit"
                    value={stock.unit}
                    onChange={handleStockChange}
                    className={selectClassName}
                  >
                    <option value="">
                      Selecionar unidade
                    </option>

                    {UNIT_OPTIONS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="current_quantity"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Quantidade actual
                  </label>

                  <input
                    id="current_quantity"
                    name="current_quantity"
                    type="number"
                    min="0"
                    step="0.001"
                    value={stock.current_quantity}
                    onChange={handleStockChange}
                    placeholder="0"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="minimum_quantity"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Stock mínimo
                  </label>

                  <input
                    id="minimum_quantity"
                    name="minimum_quantity"
                    type="number"
                    min="0"
                    step="0.001"
                    value={stock.minimum_quantity}
                    onChange={handleStockChange}
                    placeholder="0"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="average_unit_cost"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Custo médio unitário
                  </label>

                  <div className="relative">
                    <input
                      id="average_unit_cost"
                      name="average_unit_cost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={stock.average_unit_cost}
                      onChange={handleStockChange}
                      placeholder="0.00"
                      className={`${inputClassName} pr-14`}
                    />

                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                      AOA
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="warehouse_id"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Armazém
                  </label>

                  <input
                    id="warehouse_id"
                    name="warehouse_id"
                    value={stock.warehouse_id}
                    onChange={handleStockChange}
                    placeholder="ID do armazém"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="supplier_id"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Fornecedor
                  </label>

                  <input
                    id="supplier_id"
                    name="supplier_id"
                    value={stock.supplier_id}
                    onChange={handleStockChange}
                    placeholder="ID do fornecedor"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="batch_number"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Número do lote
                  </label>

                  <input
                    id="batch_number"
                    name="batch_number"
                    value={stock.batch_number}
                    onChange={handleStockChange}
                    placeholder="Lote"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="expiry_date"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Data de validade
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={15}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="expiry_date"
                      name="expiry_date"
                      type="date"
                      value={stock.expiry_date}
                      onChange={handleStockChange}
                      className={`${inputClassName} pl-10`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Acquisition */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            icon={Tag}
            title="Aquisição e avaliação"
            description="Informação financeira e patrimonial do recurso."
          />

          <div className="grid gap-5 p-6 sm:p-7 md:grid-cols-3">
            <div>
              <label
                htmlFor="acquisition_date"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Data de aquisição
              </label>

              <div className="relative">
                <CalendarDays
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="acquisition_date"
                  name="acquisition_date"
                  type="date"
                  value={form.acquisition_date}
                  onChange={handleChange}
                  className={`${inputClassName} pl-10`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="acquisition_value"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Valor de aquisição
              </label>

              <div className="relative">
                <input
                  id="acquisition_value"
                  name="acquisition_value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.acquisition_value}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`${inputClassName} pr-14`}
                />

                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                  AOA
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="replacement_value"
                className="mb-2 block text-sm font-medium text-slate-700"
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
                  value={form.replacement_value}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`${inputClassName} pr-14`}
                />

                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                  AOA
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Notes */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            icon={FileText}
            title="Notas"
            description="Observações, restrições ou informação adicional."
          />

          <div className="p-6 sm:p-7">
            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={6}
              placeholder="Adicione observações relevantes sobre este recurso..."
              className={textareaClassName}
            />
          </div>
        </section>

        {/* Bottom actions */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {mode === "edit"
                ? "Pronto para guardar?"
                : "Pronto para criar o recurso?"}
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {mode === "edit"
                ? "As alterações serão aplicadas ao registo actual."
                : "Confirme os dados antes de criar o registo."}
            </p>
          </div>

          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() =>
                router.push("/management/work-resources")
              }
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#002950] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#003b70] disabled:cursor-not-allowed disabled:opacity-60"
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
        </div>
      </div>
    </form>
  );
}