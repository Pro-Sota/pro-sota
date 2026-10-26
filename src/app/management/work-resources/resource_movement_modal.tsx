"use client";

import {
  ArrowRightLeft,
  Check,
  Loader2,
  MapPin,
  Search,
  X,
} from "lucide-react";
import {
  useMemo,
  useState,
  type FormEvent,
} from "react";

import CustomSelect from "@/app/components/custom_select";
import type {
  Resource,
  ResourceLocation,
  ResourceMovementType,
} from "@/services/resources";

export type ResourceMovementFormInput = {
  resource_id: string;
  movement_type: ResourceMovementType;
  quantity: number | null;
  unit: string | null;
  movement_date: string;
  origin_location_id: string | null;
  destination_location_id: string | null;
  project_id: string | null;
  profile_id: string | null;
  notes: string | null;
};

export type ResourceMovementProjectOption = {
  project_id: string;
  project_code: string | null;
  title: string;
  municipality: string | null;
  status: string | null;
};

export type ResourceMovementProfileOption = {
  profile_id: string;
  first_name: string | null;
  last_name: string | null;
};

type Props = {
  open: boolean;
  resources: Resource[];
  locations: ResourceLocation[];
  projects: ResourceMovementProjectOption[];
  profiles: ResourceMovementProfileOption[];
  onCloseAction: () => void;
  onSubmitAction: (
    data: ResourceMovementFormInput,
  ) => void | Promise<void>;
};

const MOVEMENT_TYPES: {
  value: ResourceMovementType;
  label: string;
}[] = [
  { value: "entry", label: "Entrada" },
  { value: "exit", label: "Saída" },
  { value: "transfer", label: "Transferência" },
  { value: "return", label: "Devolução" },
  { value: "consumption", label: "Consumo" },
  { value: "maintenance", label: "Manutenção" },
  { value: "retirement", label: "Abate" },
];

function getProfileName(profile: ResourceMovementProfileOption) {
  const name = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || "Utilizador sem nome";
}

function getLocationLabel(location: ResourceLocation) {
  return location.name;
}

type LocationAutocompleteProps = {
  id: string;
  label: string;
  placeholder: string;
  locations: ResourceLocation[];
  value: string;
  excludeLocationId?: string;
  disabled: boolean;
  required?: boolean;
  onChange: (locationId: string) => void;
};

function LocationAutocomplete({
  id,
  label,
  placeholder,
  locations,
  value,
  excludeLocationId,
  disabled,
  required = false,
  onChange,
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const selectedLocation = locations.find(
    (location) => location.location_id === value,
  );

  const filteredLocations = locations.filter((location) => {
    if (location.location_id === excludeLocationId) return false;

    const search = query.trim().toLocaleLowerCase();
    return !search || getLocationLabel(location).toLocaleLowerCase().includes(search);
  });

  const displayValue = isOpen
    ? query
    : selectedLocation
      ? getLocationLabel(selectedLocation)
      : "";

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium text-slate-700"
      >
        {label}{required ? " *" : ""}
      </label>

      <div className="relative">
        <MapPin
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          id={id}
          type="text"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={`${id}-suggestions`}
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          required={required && !value}
          onFocus={() => {
            setQuery("");
            setIsOpen(true);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
            if (value) onChange("");
          }}
          onBlur={() => {
            // Delay closing briefly so a suggestion click can complete.
            window.setTimeout(() => setIsOpen(false), 120);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setIsOpen(false);
          }}
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1B3A5C] focus:ring-2 focus:ring-[#1B3A5C]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
        />
        <Search
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>

      {isOpen && !disabled && (
        <div
          id={`${id}-suggestions`}
          role="listbox"
          className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {filteredLocations.length ? (
            filteredLocations.map((location) => (
              <button
                key={location.location_id}
                type="button"
                role="option"
                aria-selected={location.location_id === value}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(location.location_id);
                  setQuery("");
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <MapPin size={14} className="shrink-0 text-slate-400" />
                  <span className="truncate">{getLocationLabel(location)}</span>
                </span>
                {location.location_id === value && (
                  <Check size={15} className="shrink-0 text-[#002950]" />
                )}
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-sm text-slate-500">
              Nenhum local encontrado.
            </p>
          )}
        </div>
      )}

      {value && selectedLocation && (
        <p className="mt-1.5 text-[11px] text-slate-500">
          Local seleccionado: {getLocationLabel(selectedLocation)}
        </p>
      )}
    </div>
  );
}

export default function ResourceMovementModal({
  open,
  resources,
  locations,
  projects,
  profiles,
  onCloseAction,
  onSubmitAction,
}: Props) {
  const [resourceId, setResourceId] = useState("");
  const [movementType, setMovementType] =
    useState<ResourceMovementType>("transfer");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [movementDate, setMovementDate] = useState(() => {
    const now = new Date();
    const localDate = new Date(
      now.getTime() - now.getTimezoneOffset() * 60_000,
    );
    return localDate.toISOString().slice(0, 16);
  });
  const [originLocationId, setOriginLocationId] = useState("");
  const [destinationLocationId, setDestinationLocationId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [profileId, setProfileId] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedResource = useMemo(
    () =>
      resources.find((resource) => resource.resource_id === resourceId) ?? null,
    [resources, resourceId],
  );

  const selectedResourceUnit = selectedResource?.unit_of_measure ?? "";

  const originRequired = movementType === "transfer" || movementType === "exit";
  const destinationRequired = movementType === "transfer" || movementType === "entry";

  if (!open) return null;

  function getLocalDateTimeValue() {
    const now = new Date();
    const localDate = new Date(
      now.getTime() - now.getTimezoneOffset() * 60_000,
    );
    return localDate.toISOString().slice(0, 16);
  }

  function resetForm() {
    setResourceId("");
    setMovementType("transfer");
    setQuantity("");
    setUnit("");
    setMovementDate(getLocalDateTimeValue());
    setOriginLocationId("");
    setDestinationLocationId("");
    setProjectId("");
    setProfileId("");
    setNotes("");
    setError(null);
    setIsSubmitting(false);
  }

  function handleClose() {
    if (isSubmitting) return;
    resetForm();
    onCloseAction();
  }

  function validate(): string | null {
    if (!resourceId) return "Selecione o recurso.";
    if (!movementType) return "Selecione o tipo de movimento.";

    if (!movementDate || Number.isNaN(new Date(movementDate).getTime())) {
      return "Indique uma data e hora válidas para o movimento.";
    }

    if (quantity.trim()) {
      const parsedQuantity = Number(quantity);
      if (!Number.isFinite(parsedQuantity)) {
        return "Introduza uma quantidade válida.";
      }
      if (parsedQuantity <= 0) {
        return "A quantidade deve ser superior a zero.";
      }
      if (Number(parsedQuantity.toFixed(3)) !== parsedQuantity) {
        return "A quantidade não pode ter mais de três casas decimais.";
      }
    }

    if (originRequired && !originLocationId) {
      return "Selecione o local de origem.";
    }

    if (destinationRequired && !destinationLocationId) {
      return "Selecione o local de destino.";
    }

    if (
      originLocationId &&
      destinationLocationId &&
      originLocationId === destinationLocationId
    ) {
      return "A origem e o destino não podem ser iguais.";
    }

    if (movementType === "consumption" && !projectId) {
      return "Selecione a obra para registar um consumo.";
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const parsedQuantity = quantity.trim() ? Number(quantity) : null;

    try {
      setIsSubmitting(true);

      await onSubmitAction({
        resource_id: resourceId,
        movement_type: movementType,
        quantity: parsedQuantity,
        unit: unit.trim() || null,
        movement_date: new Date(movementDate).toISOString(),
        origin_location_id: originLocationId || null,
        destination_location_id: destinationLocationId || null,
        project_id: projectId || null,
        profile_id: profileId || null,
        notes: notes.trim() || null,
      });

      resetForm();
      onCloseAction();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Não foi possível registar o movimento.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resource-movement-title"
    >
      <div className="flex max-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#002950] text-white">
              <ArrowRightLeft size={18} />
            </div>
            <div>
              <h2
                id="resource-movement-title"
                className="text-base font-semibold text-slate-950"
              >
                Registar movimento
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Registe a movimentação de um recurso.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Fechar"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="space-y-6 px-6 py-6">
            <section className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Recurso</p>
                <p className="mt-1 text-xs text-slate-500">
                  Selecione o recurso que será movimentado.
                </p>
              </div>

              <div>
                <label
                  htmlFor="movement-resource"
                  className="mb-1.5 block text-xs font-medium text-slate-700"
                >
                  Recurso
                </label>
                <CustomSelect
                  id="movement-resource"
                  value={resourceId}
                  onChange={(event) => {
                    const nextResourceId = event.target.value;
                    setResourceId(nextResourceId);
                    const nextResource = resources.find(
                      (resource) => resource.resource_id === nextResourceId,
                    );
                    setUnit(nextResource?.unit_of_measure ?? "");
                  }}
                  disabled={isSubmitting}
                >
                  <option value="">Selecionar recurso</option>
                  {resources.map((resource) => (
                    <option key={resource.resource_id} value={resource.resource_id}>
                      {resource.resource_code} — {resource.name}
                    </option>
                  ))}
                </CustomSelect>
              </div>

              {selectedResource && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {selectedResource.name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {selectedResource.resource_code}
                        {selectedResource.category
                          ? ` · ${selectedResource.category}`
                          : ""}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-500 ring-1 ring-slate-200">
                      {selectedResource.resource_type}
                    </span>
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Movimento</p>
                <p className="mt-1 text-xs text-slate-500">
                  Defina o tipo, quantidade, unidade e data do movimento.
                </p>
              </div>

              <div>
                <label
                  htmlFor="movement-type"
                  className="mb-1.5 block text-xs font-medium text-slate-700"
                >
                  Tipo de movimento
                </label>
                <CustomSelect
                  id="movement-type"
                  value={movementType}
                  onChange={(event) =>
                    setMovementType(event.target.value as ResourceMovementType)
                  }
                  disabled={isSubmitting}
                >
                  {MOVEMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </CustomSelect>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="movement-quantity"
                    className="mb-1.5 block text-xs font-medium text-slate-700"
                  >
                    Quantidade
                  </label>
                  <input
                    id="movement-quantity"
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    placeholder="Ex.: 10"
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1B3A5C] focus:ring-2 focus:ring-[#1B3A5C]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="movement-unit"
                    className="mb-1.5 block text-xs font-medium text-slate-700"
                  >
                    Unidade de medida
                  </label>
                  <input
                    id="movement-unit"
                    type="text"
                    value={unit}
                    onChange={(event) => setUnit(event.target.value)}
                    placeholder={selectedResourceUnit || "Ex.: unidade, kg, m³"}
                    disabled={isSubmitting}
                    maxLength={50}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1B3A5C] focus:ring-2 focus:ring-[#1B3A5C]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="movement-date"
                  className="mb-1.5 block text-xs font-medium text-slate-700"
                >
                  Data e hora do movimento
                </label>
                <input
                  id="movement-date"
                  type="datetime-local"
                  value={movementDate}
                  onChange={(event) => setMovementDate(event.target.value)}
                  disabled={isSubmitting}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#1B3A5C] focus:ring-2 focus:ring-[#1B3A5C]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
                <p className="mt-1.5 text-[11px] text-slate-400">
                  A data é guardada como timestamp com fuso horário.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Localização</p>
                <p className="mt-1 text-xs text-slate-500">
                  Pesquise e seleccione locais existentes. Numa transferência, origem e destino são obrigatórios.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <LocationAutocomplete
                  id="movement-origin"
                  label="Origem"
                  placeholder="Pesquisar local de origem..."
                  locations={locations}
                  value={originLocationId}
                  excludeLocationId={destinationLocationId}
                  disabled={isSubmitting}
                  required={originRequired}
                  onChange={setOriginLocationId}
                />
                <LocationAutocomplete
                  id="movement-destination"
                  label="Destino"
                  placeholder="Pesquisar local de destino..."
                  locations={locations}
                  value={destinationLocationId}
                  excludeLocationId={originLocationId}
                  disabled={isSubmitting}
                  required={destinationRequired}
                  onChange={setDestinationLocationId}
                />
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Associação</p>
                <p className="mt-1 text-xs text-slate-500">
                  Associe o movimento a uma obra e/ou responsável.
                </p>
              </div>

              <div>
                <label
                  htmlFor="movement-project"
                  className="mb-1.5 block text-xs font-medium text-slate-700"
                >
                  Obra
                </label>
                <CustomSelect
                  id="movement-project"
                  value={projectId}
                  onChange={(event) => setProjectId(event.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">Selecionar obra</option>
                  {projects.map((project) => (
                    <option key={project.project_id} value={project.project_id}>
                      {project.project_code
                        ? `${project.project_code} — ${project.title}`
                        : project.title}
                    </option>
                  ))}
                </CustomSelect>
              </div>

              <div>
                <label
                  htmlFor="movement-profile"
                  className="mb-1.5 block text-xs font-medium text-slate-700"
                >
                  Responsável
                </label>
                <CustomSelect
                  id="movement-profile"
                  value={profileId}
                  onChange={(event) => setProfileId(event.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">Selecionar responsável</option>
                  {profiles.map((profile) => (
                    <option key={profile.profile_id} value={profile.profile_id}>
                      {getProfileName(profile)}
                    </option>
                  ))}
                </CustomSelect>
              </div>
            </section>

            <section>
              <label
                htmlFor="movement-notes"
                className="mb-1.5 block text-xs font-medium text-slate-700"
              >
                Observações
              </label>
              <textarea
                id="movement-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                placeholder="Adicione alguma observação sobre este movimento..."
                disabled={isSubmitting}
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1B3A5C] focus:ring-2 focus:ring-[#1B3A5C]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </section>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-10 rounded-lg border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !resourceId}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#002950] px-5 text-sm font-medium text-white transition hover:bg-[#003965] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? "A registar..." : "Registar movimento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
