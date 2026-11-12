"use client";

import dynamic from "next/dynamic";

import {
  ARCHITECTURAL_STYLES,
  CONSTRUCTION_START,
  DECISION_MAKERS,
  FAMILY_GROWTH,
  FLOOR_COUNTS,
  GARAGE,
  INFRASTRUCTURES,
  KITCHEN_LAYOUTS,
  LAND_OWNERSHIP,
  LAND_TYPES,
  MAX_FILE_MB,
  MAX_FILES,
  MAX_PRIORITIES,
  NONE,
  OTHER,
  PREFERRED_CONTACT,
  PROJECT_PRIORITIES,
  SERVICE_SCOPES,
  SPACES,
  VISITORS,
  WORKS_FROM_HOME,
  YES_NO,
  formatBudget,
  labelOf,
} from "../constants";
import { FileUploader } from "./file_uploader";
import {
  ArchitecturalStyleOptions,
  CheckboxOptions,
  Field,
  RadioOptions,
  Rating,
  TextArea,
  TextInput,
  useFieldContext,
} from "./ui";
import { linkBtn, twoCol } from "../styles";
import type { BriefValues, Update } from "../values";

const LandLocationMap = dynamic(() => import("./location_map"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] animate-pulse rounded border border-[#cfd2cf] bg-[#ecebe7] sm:h-[360px]" />
  ),
});

type StepProps = { v: BriefValues; update: Update };

/* ------------------------------ Step 1 ----------------------------- */

export function PersonalStep({ v, update }: StepProps) {
  return (
    <>
      <Field label="1. Nome completo" required>
        <TextInput name="full_name" value={v.full_name} onChange={update} placeholder="O seu nome completo" required />
      </Field>

      <div className={twoCol}>
        <Field label="2. Contacto telefónico" required>
          <TextInput name="contact_phone" value={v.contact_phone} onChange={update} type="tel" placeholder="+244 ..." required />
        </Field>
        <Field label="3. Endereço de e-mail" required>
          <TextInput name="contact_email" value={v.contact_email} onChange={update} type="email" placeholder="nome@exemplo.com" required />
        </Field>
      </div>

      <Field label="4. Quem toma as decisões sobre o projecto?" required group>
        <RadioOptions required name="decision_makers" value={v.decision_makers} onChange={update} options={DECISION_MAKERS} />
      </Field>

      <Field label="5. Qual é a melhor forma de contacto?" required group>
        <RadioOptions required name="preferred_contact" value={v.preferred_contact} onChange={update} options={PREFERRED_CONTACT} />
      </Field>
    </>
  );
}

/* ------------------------------ Step 2 ----------------------------- */

export function LandStep({
  v,
  update,
  files,
  setFiles,
}: StepProps & { files: File[]; setFiles: (f: File[]) => void }) {
  return (
    <>
      <Field
        label="6. Localização do terreno"
        required
        group
        hint="Preencha os campos que conhece e marque no mapa a localização exacta do terreno."
      >
        <TextInput name="location_address" value={v.location_address} onChange={update} placeholder="Endereço" ariaLabel="Endereço" />

        <div className={twoCol}>
          <TextInput name="location_neighborhood" value={v.location_neighborhood} onChange={update} placeholder="Bairro" ariaLabel="Bairro" />
          <TextInput name="location_municipality" value={v.location_municipality} onChange={update} placeholder="Município" ariaLabel="Município" />
        </div>

        <div className={twoCol}>
          <TextInput name="location_city" value={v.location_city} onChange={update} placeholder="Cidade" ariaLabel="Cidade" />
          <TextInput name="location_province" value={v.location_province} onChange={update} placeholder="Província" ariaLabel="Província" />
        </div>

        <TextInput name="location_reference" value={v.location_reference} onChange={update} placeholder="Ponto de referência" ariaLabel="Ponto de referência" />

        <div className="pt-1">
          <p className="mb-2 text-xs font-semibold text-[#46515a]">
            Seleccione a localização no mapa
          </p>
          <LandLocationMap latitude={v.latitude} longitude={v.longitude} onChangeAction={update} />
        </div>
      </Field>

      <Field label="7. Já é proprietário do terreno?" required group>
        <RadioOptions required name="land_ownership" value={v.land_ownership} onChange={update} options={LAND_OWNERSHIP} />
      </Field>

      <Field label="8. Área aproximada do terreno (m²)" group hint="Indique a área total, se souber.">
        <TextInput name="land_area" value={v.land_area} onChange={update} type="number" min={0} step="any" placeholder="Área em m²" ariaLabel="Área em metros quadrados" />
        <div className={twoCol}>
          <TextInput name="land_length" value={v.land_length} onChange={update} type="number" min={0} step="any" placeholder="Comprimento (m)" ariaLabel="Comprimento em metros" />
          <TextInput name="land_width" value={v.land_width} onChange={update} type="number" min={0} step="any" placeholder="Largura (m)" ariaLabel="Largura em metros" />
        </div>
      </Field>

      <Field label="9. Que tipo de terreno é?" required group>
        <RadioOptions required name="land_type" value={v.land_type} onChange={update} options={LAND_TYPES} />
      </Field>

      <Field label="10. Existem construções no terreno?" required group>
        <RadioOptions required name="existing_buildings" value={v.existing_buildings} onChange={update} options={YES_NO} />
      </Field>

      <Field label="11. Existem árvores no terreno?" required group>
        <RadioOptions required name="has_trees" value={v.has_trees} onChange={update} options={YES_NO} />
      </Field>

      <Field label="12. Que infra-estruturas existem?" group hint="Pode seleccionar mais do que uma opção.">
        <CheckboxOptions name="infrastructure" value={v.infrastructure} onChange={update} options={INFRASTRUCTURES} exclusive={NONE} />
      </Field>

      <Field label="13. Fotografias e documentos do terreno" group hint="Fotografias do local, plantas ou documentos de propriedade.">
        <FileUploader
          files={files}
          onChange={setFiles}
          ariaLabel="Anexar fotografias e documentos do terreno"
          note={`JPG, PNG, WEBP, HEIC ou PDF. Máximo de ${MAX_FILES} ficheiros, ${MAX_FILE_MB} MB cada. As imagens são reduzidas automaticamente.`}
        />
      </Field>
    </>
  );
}

/* ------------------------------ Step 3 ----------------------------- */

export function LifestyleStep({ v, update }: StepProps) {
  return (
    <>
      <Field label="14. Quantas pessoas vão morar na casa?" required>
        <TextInput name="residents_count" value={v.residents_count} onChange={update} type="number" min={1} step={1} placeholder="Número de pessoas" required />
      </Field>

      <Field label="15. Terá trabalhadores em casa?" required group>
        <RadioOptions required name="domestic_workers" value={v.domestic_workers} onChange={update} options={YES_NO} />
      </Field>

      {v.domestic_workers === "yes" && (
        <Field label="Quantos trabalhadores?">
          <TextInput name="domestic_workers_count" value={v.domestic_workers_count} onChange={update} type="number" min={1} step={1} placeholder="Número de trabalhadores" />
        </Field>
      )}

      <Field label="16. Idades e perfis dos moradores" hint="Por exemplo: crianças, idosos ou pessoas com mobilidade reduzida.">
        <TextArea name="resident_profiles" value={v.resident_profiles} onChange={update} placeholder="Descreva os perfis e necessidades dos moradores..." />
      </Field>

      <Field label="17. Prevê crescimento da família nos próximos 10 anos?" required group>
        <RadioOptions required name="family_growth" value={v.family_growth} onChange={update} options={FAMILY_GROWTH} />
      </Field>

      <Field label="18. Trabalha em casa?" required group>
        <RadioOptions required name="works_from_home" value={v.works_from_home} onChange={update} options={WORKS_FROM_HOME} />
      </Field>

      <Field label="19. Recebe visitas ou organiza eventos em casa?" required group>
        <RadioOptions required name="visitors_frequency" value={v.visitors_frequency} onChange={update} options={VISITORS} />
      </Field>

      <Field label="20. Tem animais de estimação? Quais?">
        <TextArea name="pets" value={v.pets} onChange={update} placeholder="Indique os animais e as suas necessidades..." rows={2} />
      </Field>

      <Field label="21. O que mais o incomoda na casa onde vive hoje?">
        <TextArea name="current_home_dislikes" value={v.current_home_dislikes} onChange={update} placeholder="O que gostaria de melhorar?" />
      </Field>

      <Field label="22. O que mais gosta na casa onde vive hoje?">
        <TextArea name="current_home_likes" value={v.current_home_likes} onChange={update} placeholder="O que gostaria de manter ou repetir?" />
      </Field>
    </>
  );
}

/* ------------------------------ Step 4 ----------------------------- */

export function ProgrammeStep({ v, update }: StepProps) {
  return (
    <>
      <div className={twoCol}>
        <Field label="23. Número de quartos" required>
          <TextInput name="bedrooms_count" value={v.bedrooms_count} onChange={update} type="number" min={1} step={1} placeholder="N.º de quartos" required />
        </Field>
        <Field label="24. Quantas suítes pretende?" required>
          <TextInput name="suites_count" value={v.suites_count} onChange={update} type="number" min={0} step={1} placeholder="N.º de suítes" required />
        </Field>
      </div>

      <Field label="25. Que espaços deseja incluir?" required group hint="Seleccione todos os espaços pretendidos.">
        <CheckboxOptions name="desired_spaces" value={v.desired_spaces} onChange={update} options={SPACES} />

        {v.desired_spaces.includes(OTHER) && (
          <Field label="Especifique o outro espaço" required hint="Indique o espaço adicional que pretende incluir no projecto.">
            <TextInput name="desired_spaces_other" value={v.desired_spaces_other} onChange={update} placeholder="Ex.: Sala de cinema, adega, atelier..." required />
          </Field>
        )}
      </Field>

      {v.desired_spaces.includes(GARAGE) && (
        <Field label="26. Quantos carros pretende acomodar na garagem?">
          <TextInput name="cars_count" value={v.cars_count} onChange={update} type="number" min={1} step={1} placeholder="Número de carros" />
        </Field>
      )}

      <Field label="27. Qual é a sua preferência para a cozinha?" required group>
        <RadioOptions required name="kitchen_layout" value={v.kitchen_layout} onChange={update} options={KITCHEN_LAYOUTS} />
      </Field>

      <Field label="28. Quantos pisos deseja?" required group>
        <RadioOptions required name="floor_count" value={v.floor_count} onChange={update} options={FLOOR_COUNTS} />

        {v.floor_count === OTHER && (
          <Field label="Especifique o número ou tipo de pisos" required hint="Indique a configuração pretendida.">
            <TextInput name="floor_count_other" value={v.floor_count_other} onChange={update} placeholder="Ex.: 2 pisos, cave e rés-do-chão..." required />
          </Field>
        )}
      </Field>

      <Field label="29. Há algum espaço indispensável que não foi listado?">
        <TextArea name="essential_space" value={v.essential_space} onChange={update} placeholder="Descreva outros espaços ou necessidades..." />
      </Field>
    </>
  );
}

/* ------------------------------ Step 5 ----------------------------- */

export function ScopeStep({ v, update }: StepProps) {
  const count = v.project_priorities.length;

  return (
    <>
      <Field label="30. Que serviços pretende contratar?" required group hint="Seleccione o âmbito de intervenção que melhor corresponde às suas necessidades.">
        <RadioOptions required name="service_scope" value={v.service_scope} onChange={update} options={SERVICE_SCOPES} />
      </Field>

      <Field
        label="31. Quais são as três prioridades mais importantes para o seu projecto?"
        required
        group
        hint={`Seleccione exactamente três prioridades. ${count}/${MAX_PRIORITIES} seleccionadas.`}
      >
        <CheckboxOptions
          name="project_priorities"
          value={v.project_priorities}
          options={PROJECT_PRIORITIES}
          onChange={update}
          max={MAX_PRIORITIES}
        />

        <div className="mt-3 flex items-center gap-2" aria-hidden="true">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#ecebe7]">
            <div
              className="h-full rounded-full bg-[#BD9655] transition-all"
              style={{ width: `${(count / MAX_PRIORITIES) * 100}%` }}
            />
          </div>
          <span className="text-xs font-semibold tabular-nums text-[#002950]">
            {count}/{MAX_PRIORITIES}
          </span>
        </div>
      </Field>

      <Field label="32. Quando pretende iniciar a construção?" required group>
        <RadioOptions required name="construction_start" value={v.construction_start} onChange={update} options={CONSTRUCTION_START} />
      </Field>
    </>
  );
}

/* ------------------------------ Step 6 ----------------------------- */

function BudgetInput({ v, update }: StepProps) {
  const { inputId, describedBy } = useFieldContext();
  const undisclosed = v.budget_undisclosed === "yes";

  return (
    <>
      <div className="relative">
        <input
          id={inputId ?? "budget"}
          name="budget"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          required={!undisclosed}
          disabled={undisclosed}
          value={v.budget}
          aria-describedby={describedBy}
          onChange={(e) => update("budget", e.target.value.replace(/\D/g, ""))}
          placeholder="0"
          className="h-14 w-full rounded-xl border border-[#DCDCD6] bg-white pl-5 pr-20 text-lg font-medium tracking-tight text-[#002950] outline-none transition-all duration-200 placeholder:text-[#B8B8B1] hover:border-[#BD9655] focus:border-[#BD9655] focus:ring-4 focus:ring-[#BD9655]/10 disabled:cursor-not-allowed disabled:bg-[#f4f4f1]"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5">
          <span className="text-sm font-semibold text-[#8B8B83]">Kz</span>
        </div>
      </div>

      <p className="text-xs text-[#85857D]">
        {undisclosed
          ? "Poderemos conversar sobre o orçamento mais tarde."
          : v.budget
            ? `Orçamento indicado: ${formatBudget(v.budget)} Kz`
            : "Introduza o valor em kwanzas angolanos. Use apenas números, sem separadores."}
      </p>

      <label className="flex w-fit cursor-pointer items-center gap-2 text-[13px] text-[#4d565d]">
        <input
          type="checkbox"
          name="budget_undisclosed"
          value="yes"
          checked={undisclosed}
          className="m-0 accent-[#002950]"
          onChange={(e) => {
            update("budget_undisclosed", e.target.checked ? "yes" : "");
            if (e.target.checked) update("budget", "");
          }}
        />
        Prefiro discutir o orçamento numa reunião
      </label>
    </>
  );
}

export function InvestmentStep({ v, update }: StepProps) {
  return (
    <Field
      label="33. Qual é o orçamento previsto para o projecto?"
      required
      hint="Indique o valor aproximado que prevê investir, ou escolha discuti-lo mais tarde."
    >
      <BudgetInput v={v} update={update} />
    </Field>
  );
}

/* ------------------------------ Step 7 ----------------------------- */

export function PreferencesStep({
  v,
  update,
  files,
  setFiles,
}: StepProps & { files: File[]; setFiles: (f: File[]) => void }) {
  return (
    <>
      <Field
        label="34. Que estilos arquitectónicos lhe agradam?"
        required
        group
        hint="Pode seleccionar mais do que um estilo. Se escolher Outro, poderá especificá-lo."
      >
        <ArchitecturalStyleOptions
          value={v.architectural_style}
          onChange={update}
          otherValue={v.architectural_style_other}
          onOtherChange={update}
        />
      </Field>

      <Field label="35. Cores e materiais de que gosta ou não gosta">
        <TextArea name="colour_material_preferences" value={v.colour_material_preferences} onChange={update} placeholder="Cores, revestimentos, materiais, acabamentos..." />
      </Field>

      <Field label="36. Quanto valoriza a luz natural e a ligação com o exterior?" required group>
        <Rating required name="natural_light_rating" value={v.natural_light_rating} onChange={update} low="1 · Pouco" high="5 · Muito" />
      </Field>

      <Field label="37. Quanto valoriza a privacidade em relação à rua e aos vizinhos?" required group>
        <Rating required name="privacy_rating" value={v.privacy_rating} onChange={update} low="1 · Pouco" high="5 · Muito" />
      </Field>

      <Field
        label="38. Imagens ou links de referência"
        group
        hint="Pode indicar links do Pinterest, Instagram ou outras referências. Também pode anexar imagens e PDFs."
      >
        <TextArea name="reference_links" value={v.reference_links} onChange={update} placeholder="Cole aqui os links de referência..." rows={3} />
        <FileUploader
          files={files}
          onChange={setFiles}
          ariaLabel="Anexar imagens de referência"
          note={`Máximo de ${MAX_FILES} ficheiros, ${MAX_FILE_MB} MB cada.`}
        />
      </Field>

      <Field label="39. Há algo importante que não perguntámos?">
        <TextArea name="other_information" value={v.other_information} onChange={update} placeholder="Partilhe qualquer outra informação importante..." />
      </Field>
    </>
  );
}

/* ------------------------------ Step 8 ----------------------------- */

function SummaryGroup({
  title,
  step,
  rows,
  goTo,
}: {
  title: string;
  step: number;
  rows: [string, string][];
  goTo: (step: number) => void;
}) {
  return (
    <section className="rounded border border-[#ecebe7] bg-[#fafaf8] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-[#002950]">{title}</h3>
        <button type="button" className={`${linkBtn} text-xs`} onClick={() => goTo(step)}>
          Editar
        </button>
      </div>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-xs sm:grid-cols-[180px_1fr]">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="font-semibold text-[#6f757a]">{label}</dt>
            <dd className="m-0 break-words text-[#263746]">{value || "—"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ReviewStep({
  v,
  landFiles,
  referenceFiles,
  goTo,
}: {
  v: BriefValues;
  landFiles: File[];
  referenceFiles: File[];
  goTo: (step: number) => void;
}) {
  const place = [v.location_address, v.location_neighborhood, v.location_municipality, v.location_city, v.location_province]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");

  const withOther = (values: string[], other: string, options: { value: string; label: string }[]) =>
    values.map((x) => (x === OTHER && other.trim() ? `Outro: ${other.trim()}` : labelOf(options, x))).join(", ");

  const styles = [
    ...ARCHITECTURAL_STYLES,
    { value: OTHER, label: "Outro estilo", description: "", image: "", position: "" },
  ];

  return (
    <>
      <SummaryGroup title="Contacto" step={0} goTo={goTo} rows={[
        ["Nome", v.full_name],
        ["Telefone", v.contact_phone],
        ["E-mail", v.contact_email],
        ["Contacto preferido", labelOf(PREFERRED_CONTACT, v.preferred_contact)],
      ]} />

      <SummaryGroup title="Terreno" step={1} goTo={goTo} rows={[
        ["Localização", place],
        ["Coordenadas", v.latitude && v.longitude ? `${v.latitude}, ${v.longitude}` : ""],
        ["Propriedade", labelOf(LAND_OWNERSHIP, v.land_ownership)],
        ["Tipo de terreno", labelOf(LAND_TYPES, v.land_type)],
        ["Ficheiros anexados", `${landFiles.length}`],
      ]} />

      <SummaryGroup title="Família" step={2} goTo={goTo} rows={[
        ["Moradores", v.residents_count],
        ["Trabalhadores em casa", labelOf(YES_NO, v.domestic_workers)],
        ["Visitas e eventos", labelOf(VISITORS, v.visitors_frequency)],
      ]} />

      <SummaryGroup title="Programa" step={3} goTo={goTo} rows={[
        ["Quartos / suítes", `${v.bedrooms_count} / ${v.suites_count}`],
        ["Espaços", withOther(v.desired_spaces, v.desired_spaces_other, SPACES)],
        ["Cozinha", labelOf(KITCHEN_LAYOUTS, v.kitchen_layout)],
        ["Pisos", v.floor_count === OTHER ? v.floor_count_other : labelOf(FLOOR_COUNTS, v.floor_count)],
      ]} />

      <SummaryGroup title="Âmbito e orçamento" step={4} goTo={goTo} rows={[
        ["Serviços", labelOf(SERVICE_SCOPES, v.service_scope)],
        ["Prioridades", v.project_priorities.map((p) => labelOf(PROJECT_PRIORITIES, p)).join(", ")],
        ["Início da obra", labelOf(CONSTRUCTION_START, v.construction_start)],
        ["Orçamento", v.budget_undisclosed === "yes" ? "A discutir numa reunião" : v.budget ? `${formatBudget(v.budget)} Kz` : ""],
      ]} />

      <SummaryGroup title="Estética" step={6} goTo={goTo} rows={[
        ["Estilos", withOther(v.architectural_style, v.architectural_style_other, styles)],
        ["Luz natural / privacidade", `${v.natural_light_rating} / ${v.privacy_rating}`],
        ["Imagens de referência", `${referenceFiles.length}`],
      ]} />

      <label className="flex items-start gap-2.5 text-xs leading-relaxed text-[#62696e]">
        <input type="checkbox" name="privacy_consent" value="true" required className="mt-[3px] accent-[#002950]" />
        <span>
          Autorizo a PRO SOTA a utilizar estas informações para analisar e dar seguimento ao meu pedido de projecto.
        </span>
      </label>

      {/* Honeypot anti-spam field */}
      <div className="absolute left-[-10000px] h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Deixe este campo vazio
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
    </>
  );
}