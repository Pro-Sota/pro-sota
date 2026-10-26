"use client";
import dynamic from "next/dynamic";
import React from "react";
import {
	Building2,
	MapPin,
	CalendarDays,
	Users,
	Wallet,
	AlertTriangle,
} from "lucide-react";

import { SectionCard } from "../section_card";
import { Field } from "../components/field";
import {
	Select,
	Input,
	Textarea,
	DateInput,
	CurrencyInputField,
} from "../components/form_components";
import { TeamMemberSelector } from "../components/team_member_selector";
import {
	ProjectFormState,
	PROJECT_TYPES,
} from "../types";
import {
	calculateDuration,
} from "../utils";

interface FormSectionsProps {
	form: ProjectFormState;
	onChange: (changes: Partial<ProjectFormState>) => void;
	sectionRefs: React.MutableRefObject<
		Record<string, HTMLDivElement | null>
	>;
}

/**
 * Project information section
 *
 * Contains only information that identifies and describes
 * the project.
 *
 * Client is intentionally NOT included here.
 * Client selection is handled by the separate Client section
 * in NewProjectPage.
 */

const ProjectLocationMap = dynamic(
  () => import("../components/project_location_map"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
        A carregar o mapa...
      </div>
    ),
  }
);
export function ProjectInfoSection({ form, onChange, sectionRefs, }: FormSectionsProps) {
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target; onChange({ [name]: value, } as Partial<ProjectFormState>);
	};
	return (<SectionCard id="info" refCb={(el) => {
		sectionRefs.current.info = el;
	}}
		icon={Building2}
		title="Informação do projecto"
		description="Identificação e informações gerais do projecto." >
		<div className="grid gap-5 md:grid-cols-2">
			{/* PROJECT NAME — FULL WIDTH */}
			<div className="md:col-span-2">
				<Field label="Nome do projecto" for="title" required >
					<Input name="title" value={form.title || ""} onChange={handleInputChange} placeholder="Ex: Residência Familiar em Talatona" autoComplete="off" />
				</Field> </div> {/* PROJECT TYPE */}
			<Field label="Tipo de projecto" for="type" required >
				<Select name="type" value={form.type || ""} onChange={handleInputChange} >
					<option value=""> Seleccionar tipo... </option> {PROJECT_TYPES.map((type) => (<option key={type} value={type} > {type} </option>))} </Select>
			</Field> {/* PROJECT CODE */} <Field label="Código do projecto" for="project_code" required >
				<Input name="project_code" value={form.project_code || ""} onChange={handleInputChange} placeholder="Ex: PRO-2026-001" autoComplete="off" /> </Field> {/* DESCRIPTION — FULL WIDTH */} <div className="md:col-span-2"> <Field label="Descrição" for="description" trailing={<span className={`text-xs font-mono ${form.description && form.description.length >= 450 ? "text-rose-500" : "text-slate-400"}`} > {form.description?.length || 0}/500 </span>} > <Textarea rows={4} name="description" value={form.description || ""} onChange={handleInputChange} maxLength={500} placeholder="Escopo, objectivos e qualquer contexto relevante para o projecto..." /> </Field> </div> </div> </SectionCard>);
}
/**
 * Location section
 *
 * Complemento de endereço / address_line_2 was intentionally removed.
 */

export function LocationSection({
  form,
  onChange,
  sectionRefs,
}: FormSectionsProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    onChange({
      [name]: value,
    } as Partial<ProjectFormState>);
  };

  const handleCoordinateChange = (
    field: "latitude" | "longitude",
    value: string
  ) => {
    const coordinate =
      value.trim() === "" ? null : Number(value);

    if (
      coordinate !== null &&
      !Number.isFinite(coordinate)
    ) {
      return;
    }

    if (
      field === "latitude" &&
      coordinate !== null &&
      (coordinate < -90 || coordinate > 90)
    ) {
      return;
    }

    if (
      field === "longitude" &&
      coordinate !== null &&
      (coordinate < -180 || coordinate > 180)
    ) {
      return;
    }

    onChange({
      [field]: coordinate,
    } as Partial<ProjectFormState>);
  };

  return (
    <SectionCard
      id="location"
      refCb={(el) => {
        sectionRefs.current.location = el;
      }}
      icon={MapPin}
      title="Localização"
      description="Defina a morada e as coordenadas geográficas do projecto."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="País" for="country">
          <Input
            name="country"
            autoComplete="country-name"
            value={form.country || ""}
            onChange={handleInputChange}
            placeholder="Angola"
          />
        </Field>

        <Field label="Província" for="state_province" required>
          <Input
            name="state_province"
            value={form.state_province || ""}
            onChange={handleInputChange}
            placeholder="Ex: Luanda"
          />
        </Field>

        <Field label="Município" for="municipality" required>
          <Input
            name="municipality"
            value={form.municipality || ""}
            onChange={handleInputChange}
            placeholder="Ex: Talatona"
          />
        </Field>

        <Field label="Cidade" for="city">
          <Input
            name="city"
            value={form.city || ""}
            onChange={handleInputChange}
            placeholder="Ex: Luanda"
          />
        </Field>

        <div className="md:col-span-2">
          <Field
            label="Rua / Endereço"
            for="address_line_1"
            required
          >
            <Input
              name="address_line_1"
              value={form.address_line_1 || ""}
              onChange={handleInputChange}
              placeholder="Ex: Rua Principal, 123"
            />
          </Field>
        </div>

        <div className="md:col-span-2">
          <div className="mb-3">
            <h3 className="text-sm font-medium text-slate-800">
              Localização no mapa
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Seleccione o terreno no mapa. As coordenadas serão
              preenchidas automaticamente.
            </p>
          </div>

          <ProjectLocationMap
            latitude={form.latitude ?? null}
            longitude={form.longitude ?? null}
            onChange={({ latitude, longitude }) =>
              onChange({ latitude, longitude })
            }
          />
        </div>

        <Field label="Latitude" for="latitude">
          <Input
            name="latitude"
            inputMode="decimal"
            value={form.latitude ?? ""}
            onChange={(event) =>
              handleCoordinateChange(
                "latitude",
                event.target.value
              )
            }
            placeholder="-8.8383"
          />
        </Field>

        <Field label="Longitude" for="longitude">
          <Input
            name="longitude"
            inputMode="decimal"
            value={form.longitude ?? ""}
            onChange={(event) =>
              handleCoordinateChange(
                "longitude",
                event.target.value
              )
            }
            placeholder="13.2344"
          />
        </Field>

        <div className="md:col-span-2">
          <p className="text-xs leading-5 text-slate-400">
            As coordenadas são opcionais. Pode introduzi-las
            manualmente ou seleccionar o ponto no mapa.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}


/**
 * Timeline section
 */
export function TimelineSection({
	form,
	onChange,
	sectionRefs,
}: FormSectionsProps) {
	const handleDateChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const { name, value } = e.target;

		onChange({
			[name]: value,
		} as Partial<ProjectFormState>);
	};

	const duration = calculateDuration(
		form.start_date!,
		form.end_date!
	);

	return (
		<SectionCard
			id="timeline"
			refCb={(el) => {
				sectionRefs.current.timeline = el;
			}}
			icon={CalendarDays}
			title="Cronologia"
			description="Datas chave para planeamento e acompanhamento do projecto."
		>
			<div className="grid gap-5 md:grid-cols-2">
				{/* START DATE */}
				<Field
					label="Data de início"
					for="start_date"
					required
				>
					<DateInput
						name="start_date"
						value={form.start_date || ""}
						onChange={handleDateChange}
					/>
				</Field>

				{/* END DATE */}
				<Field
					label="Data de término"
					for="end_date"
					required
				>
					<DateInput
						name="end_date"
						value={form.end_date || ""}
						onChange={handleDateChange}
					/>
				</Field>
			</div>

			{/* DURATION */}
			{duration &&
				duration.label && (
					<div
						className={`mt-4 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${duration.invalid
							? "border-rose-200 bg-rose-50 text-rose-600"
							: "border-[#1B3A5C]/10 bg-[#1B3A5C]/5 text-[#1B3A5C]"
							}`}
					>
						{duration.invalid && (
							<AlertTriangle className="h-4 w-4 shrink-0" />
						)}

						{duration.invalid ? (
							<span>
								A data de término deve ser depois da
								data de início.
							</span>
						) : (
							<span>
								Duração do projecto:{" "}
								<span className="font-semibold">
									{duration.label}
								</span>
							</span>
						)}
					</div>
				)}
		</SectionCard>
	);
}

/**
 * Team section
 *
 * Kept for compatibility with other parts of the application.
 * It is NOT rendered by the new project page.
 */
export function TeamSection({
	form,
	onChange,
	sectionRefs,
}: FormSectionsProps) {
	return (
		<SectionCard
			id="team"
			refCb={(el) => {
				sectionRefs.current.team = el;
			}}
			icon={Users}
			title="Equipa para o projecto"
			description="Quem é responsável pela entrega deste projecto."
		>
			<div className="grid gap-5 md:grid-cols-2">
				<Field
					label="Gestor do projecto"
					for="projectManagerId"
				>
					<Input
						name="projectManagerId"
						placeholder="Seleccionar responsável"
					/>
				</Field>

				<Field
					label="Membros da equipa"
					for="team_members"
				>
					<TeamMemberSelector
						members={form.teamMembers || []}
						onChange={(members) =>
							onChange({
								teamMembers: members,
							} as Partial<ProjectFormState>)
						}
					/>
				</Field>
			</div>
		</SectionCard>
	);
}

/**
 * Financial section
 *
 * Kept for compatibility with other parts of the application.
 * It is NOT rendered by the new project page.
 */
export function FinancialSection({
	form,
	onChange,
	sectionRefs,
}: FormSectionsProps) {
	const handleBudgetChange = (
		value: string
	) => {
		const numeric =
			value === ""
				? null
				: Number(value);

		onChange({
			budget: numeric,
		});
	};

	return (
		<SectionCard
			id="financial"
			refCb={(el) => {
				sectionRefs.current.financial = el;
			}}
			icon={Wallet}
			title="Finanças"
			description="Orçamento e números do contrato."
		>
			<div className="grid gap-5 md:grid-cols-2">
				<Field
					label="Estimativa de orçamento"
					for="budget"
					required
				>
					<CurrencyInputField
						value={
							form.budget?.toString() || ""
						}
						onChange={handleBudgetChange}
					/>
				</Field>
			</div>
		</SectionCard>
	);
}
