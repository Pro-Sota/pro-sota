"use client";

import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { submitProjectBrief } from "@/actions/project_briefing";

const STEPS = [
  { title: "Dados pessoais", description: "Como podemos entrar em contacto consigo?" },
  { title: "Terreno e localização", description: "Conte-nos sobre o terreno onde pretende construir." },
  { title: "Família e estilo de vida", description: "Queremos compreender como irá viver a casa." },
  { title: "Programa arquitectónico", description: "Defina os espaços essenciais para a sua casa." },
  { title: "Estética e preferências", description: "Partilhe as referências e preferências do projecto." },
];

const INFRASTRUCTURES = ["Rede eléctrica", "Água canalizada", "Esgoto", "Estrada asfaltada", "Internet", "Nenhuma"];
const SPACES = [
  "Sala de estar", "Sala de jantar", "Cozinha", "Cozinha de apoio/exterior", "Escritório",
  "Lavandaria", "Despensa", "Quarto da empregada", "Varanda", "Terraço", "Piscina", "Jardim",
  "Churrasqueira/área gourmet", "Ginásio", "Garagem", "Outro",
];
const STYLES = ["Contemporâneo", "Minimalista", "Rústico", "Tropical", "Industrial", "Clássico", "Outro"];

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const ACCEPT = ALLOWED_TYPES.join(",");
const MAX_FILES = 5;
const MAX_FILE_MB = 8;

type BriefValues = { [key: string]: string | string[] };

const initialValues: BriefValues = {
  full_name: "", contact_phone: "", contact_email: "", decision_makers: "",
  preferred_contact: "", location_address: "", location_neighborhood: "", location_municipality: "",
  location_reference: "", location_city: "", location_province: "", map_link: "",
  land_ownership: "", land_area: "", land_length: "", land_width: "", land_type: "",
  existing_buildings: "", has_trees: "", infrastructure: [], residents_count: "",
  domestic_workers: "", domestic_workers_count: "", resident_profiles: "", family_growth: "",
  works_from_home: "", visitors_frequency: "", pets: "", current_home_dislikes: "",
  current_home_likes: "", bedrooms_count: "", suites_count: "", desired_spaces: [],
  cars_count: "", kitchen_layout: "", floor_count: "", essential_space: "", architectural_style: [],
  colour_material_preferences: "", natural_light_rating: "", privacy_rating: "",
  reference_links: "", other_information: "",
};

/* ---------- Shared class strings (Tailwind scans these as plain strings) ---------- */

const focusRing =
  "focus-within:border-[#BD9655] focus-within:ring-[3px] focus-within:ring-[#BD9655]/25";
const focusOutline =
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#BD9655]";

const inputCls =
  "w-full min-h-[45px] rounded border border-[#cfd2cf] bg-white px-[13px] py-[11px] text-sm text-[#263746] outline-none " +
  "transition-colors placeholder:text-[#8e9395] focus:border-[#BD9655] focus:ring-[3px] focus:ring-[#BD9655]/20 " +
  "motion-reduce:transition-none";
const textareaCls = `${inputCls} min-h-[100px] resize-y leading-relaxed`;
const fileInputCls = `${inputCls} p-[9px]`;

const optionBase =
  `flex min-h-[42px] cursor-pointer items-center gap-2 rounded border px-[13px] py-[9px] text-[13px] transition-colors motion-reduce:transition-none ${focusRing}`;
const optionOn = "border-[#BD9655] bg-[#fbf8f2] text-[#002950]";
const optionOff = "border-[#d3d5d1] text-[#4d565d]";

const btnBase =
  `inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-3 rounded px-4 text-[13px] font-bold no-underline transition-colors sm:min-h-[46px] sm:px-[21px] motion-reduce:transition-none ${focusOutline}`;
const btnPrimary = `${btnBase} border border-[#002950] bg-[#002950] text-white hover:bg-[#06406f] disabled:cursor-wait disabled:opacity-65`;
const btnSecondary = `${btnBase} border border-[#d6d8d6] bg-white text-[#35424d]`;

const twoCol = "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-[14px]";
const hintCls = "-mt-[3px] mb-px text-xs leading-normal text-[#6f757a]";
const brandCls = `text-[22px] font-extrabold tracking-[2px] text-[#002950] no-underline ${focusOutline}`;
const eyebrowCls = "text-[11px] font-bold tracking-[1.7px]";
const pageCls =
  "min-h-screen bg-[#F7F7F5] px-[14px] pb-[25px] font-[Arial,Helvetica,sans-serif] text-[#202a34] sm:px-6 sm:pb-10";

/* ---------- Field primitives ---------- */

function Field({ label, required, hint, htmlFor, children }: {
  label: string; required?: boolean; hint?: string; htmlFor?: string; children: React.ReactNode;
}) {
  const labelId = useId();
  const text = <>{label}{required && <span aria-hidden="true" className="text-[#8b6a2f]"> *</span>}</>;
  const labelCls = "text-sm font-bold leading-normal text-[#263746]";
  return (
    <div className="flex min-w-0 flex-col gap-[9px]" {...(htmlFor ? {} : { role: "group", "aria-labelledby": labelId })}>
      {htmlFor
        ? <label className={labelCls} htmlFor={htmlFor}>{text}</label>
        : <div className={labelCls} id={labelId}>{text}</div>}
      {hint && <p className={hintCls}>{hint}</p>}
      {children}
    </div>
  );
}

function TextInput({ name, value, onChange, type = "text", placeholder, required = false, min, ariaLabel }: {
  name: string; value: string; onChange: (name: string, value: string) => void;
  type?: string; placeholder?: string; required?: boolean; min?: number; ariaLabel?: string;
}) {
  return (
    <input
      className={inputCls} id={name} name={name} type={type} value={value} min={min}
      inputMode={type === "number" ? "numeric" : undefined}
      placeholder={placeholder} required={required} aria-label={ariaLabel}
      onChange={(e) => onChange(name, e.target.value)}
    />
  );
}

function TextArea({ name, value, onChange, placeholder, rows = 4 }: {
  name: string; value: string; onChange: (name: string, value: string) => void;
  placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      className={textareaCls} id={name} name={name} rows={rows}
      value={value} placeholder={placeholder} onChange={(e) => onChange(name, e.target.value)}
    />
  );
}

function RadioOptions({ name, value, options, onChange, required = false }: {
  name: string; value: string; options: string[]; required?: boolean;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-[9px]">
      {options.map((option) => (
        <label className={`${optionBase} ${value === option ? optionOn : optionOff}`} key={option}>
          <input type="radio" name={name} value={option} checked={value === option}
            required={required} className="m-0 accent-[#002950]" onChange={() => onChange(name, option)} />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );
}

function CheckboxOptions({ name, value, options, onChange }: {
  name: string; value: string[]; options: string[]; onChange: (name: string, value: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-[9px]">
      {options.map((option) => (
        <label className={`${optionBase} ${value.includes(option) ? optionOn : optionOff}`} key={option}>
          <input type="checkbox" value={option} checked={value.includes(option)} className="m-0 accent-[#002950]"
            onChange={(e) => onChange(name, e.target.checked ? [...value, option] : value.filter((item) => item !== option))} />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );
}

function Rating({ name, value, onChange, low, high, required = false }: {
  name: string; value: string; onChange: (name: string, value: string) => void;
  low: string; high: string; required?: boolean;
}) {
  return (
    <div className="max-w-[440px]">
      <div className="grid grid-cols-5 gap-[9px]">
        {["1", "2", "3", "4", "5"].map((n) => (
          <label key={n}
            className={`relative grid h-[45px] cursor-pointer place-items-center rounded border font-semibold transition-colors motion-reduce:transition-none ${focusRing} ${
              value === n ? "border-[#BD9655] bg-[#fbf8f2] text-[#002950] ring-1 ring-inset ring-[#BD9655]" : "border-[#d3d5d1] text-[#5e666c]"
            }`}>
            <input type="radio" name={name} value={n} checked={value === n} required={required}
              className="absolute inset-0 m-0 cursor-pointer opacity-0" onChange={() => onChange(name, n)} />
            {n}
          </label>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-[#6f757a]"><span>{low}</span><span>{high}</span></div>
    </div>
  );
}

/* ---------- File upload (shared between steps 2 and 5) ---------- */

function FileUploader({ files, onChange, note }: {
  files: File[]; onChange: (files: File[]) => void; note: string;
}) {
  const [problem, setProblem] = useState("");

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow picking the same file again after removing it
    const issues: string[] = [];
    const next = [...files];

    for (const file of picked) {
      if (!ALLOWED_TYPES.includes(file.type)) { issues.push(`"${file.name}" não é JPG, PNG, WEBP ou PDF.`); continue; }
      if (file.size > MAX_FILE_MB * 1024 * 1024) { issues.push(`"${file.name}" excede ${MAX_FILE_MB} MB.`); continue; }
      if (next.some((f) => f.name === file.name && f.size === file.size)) continue;
      if (next.length >= MAX_FILES) { issues.push(`Máximo de ${MAX_FILES} ficheiros.`); break; }
      next.push(file);
    }
    setProblem(issues.join(" "));
    onChange(next);
  }

  return (
    <>
      <input className={fileInputCls} type="file" multiple accept={ACCEPT}
        onChange={handlePick} aria-label="Anexar ficheiros" />
      <p className={hintCls}>{note}</p>
      {problem && <p className="m-0 text-xs leading-normal text-[#8d2f25]" role="alert">{problem}</p>}
      {files.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-[7px] p-0">
          {files.map((f, i) => (
            <li key={`${f.name}-${f.size}-${i}`} className="flex justify-between gap-3 text-xs text-[#505960]">
              <span>{f.name} <small>({(f.size / 1024 / 1024).toFixed(1)} MB)</small></span>
              <button type="button"
                className={`cursor-pointer border-0 bg-transparent text-[#8b5d27] underline ${focusOutline}`}
                onClick={() => { setProblem(""); onChange(files.filter((_, idx) => idx !== i)); }}>
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/* ---------- Main form ---------- */

export default function ProjectBriefForm() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<BriefValues>(initialValues);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const isLast = step === STEPS.length - 1;
  const progress = useMemo(() => Math.round(((step + 1) / STEPS.length) * 100), [step]);

  const str = (name: string) => String(values[name] ?? "");
  const arr = (name: string) => (Array.isArray(values[name]) ? (values[name] as string[]) : []);

  const update = (name: string, value: string | string[]) =>
    setValues((current) => {
      const next = { ...current, [name]: value };
      if (name === "domestic_workers" && value !== "Sim") next.domestic_workers_count = "";
      return next;
    });

  // Move focus to the step heading when the step changes (keyboard / screen reader users)
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    headingRef.current?.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  /** Checks that native `required` cannot cover (checkbox groups, "any of" fields, cross-field rules). */
  function validateStep(): string {
    if (step === 1) {
      const hasLocation = ["location_address", "location_neighborhood", "location_municipality",
        "location_city", "location_reference", "map_link"].some((k) => str(k).trim() !== "");
      if (!hasLocation) return "Indique pelo menos o endereço, o bairro, o município ou um link do mapa.";
    }
    if (step === 3) {
      if (Number(str("suites_count")) > Number(str("bedrooms_count")))
        return "O número de suítes não pode ser superior ao número de quartos.";
      if (arr("desired_spaces").length === 0) return "Seleccione pelo menos um espaço.";
    }
    if (step === 4 && arr("architectural_style").length === 0)
      return "Seleccione pelo menos um estilo arquitectónico.";
    return "";
  }

  function goNext() {
    setError("");
    const form = document.getElementById("project-brief-form") as HTMLFormElement | null;
    if (form && !form.reportValidity()) return;
    const problem = validateStep();
    if (problem) { setError(problem); return; }
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function goBack(target: number) {
    setError("");
    setStep(target);
  }

  function submit(formData: FormData) {
    setError("");
    Object.entries(values).forEach(([key, value]) => {
      formData.delete(key);
      if (Array.isArray(value)) value.forEach((item) => formData.append(key, item));
      else formData.set(key, value);
    });
    files.forEach((file) => formData.append("attachments", file));
    startTransition(async () => {
      try {
        const result = await submitProjectBrief(formData);
        if (!result.success) {
          setError(result.error || "Não foi possível enviar o formulário. Tente novamente.");
          return;
        }
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        setError("Ocorreu um erro de ligação. Verifique a internet e tente novamente.");
      }
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Pressing Enter on an earlier step must advance, never submit the brief.
    if (!isLast) { goNext(); return; }
    const problem = validateStep();
    if (problem) { setError(problem); return; }
    submit(new FormData(e.currentTarget));
  }

  function renderStep() {
    switch (step) {
      case 0:
        return (
          <>
            <Field label="1. Nome completo" required htmlFor="full_name">
              <TextInput name="full_name" value={str("full_name")} onChange={update} placeholder="O seu nome completo" required />
            </Field>
            <div className={twoCol}>
              <Field label="2. Contacto telefónico" required htmlFor="contact_phone">
                <TextInput name="contact_phone" value={str("contact_phone")} onChange={update} type="tel" placeholder="+244 ..." required />
              </Field>
              <Field label="E-mail" required htmlFor="contact_email">
                <TextInput name="contact_email" value={str("contact_email")} onChange={update} type="email" placeholder="nome@exemplo.com" required />
              </Field>
            </div>
            <Field label="3. Quem toma as decisões sobre o projecto?" required>
              <RadioOptions required name="decision_makers" value={str("decision_makers")} onChange={update} options={["Apenas eu", "Eu e o cônjuge", "Família", "Sócios"]} />
            </Field>
            <Field label="4. Qual é a melhor forma de contacto?" required>
              <RadioOptions required name="preferred_contact" value={str("preferred_contact")} onChange={update} options={["Chamada", "WhatsApp", "E-mail", "Presencial"]} />
            </Field>
          </>
        );
      case 1:
        return (
          <>
            <Field label="5. Localização do terreno" required hint="Preencha os campos que conhece. Pode acrescentar um link do mapa.">
              <TextInput name="location_address" value={str("location_address")} onChange={update} placeholder="Endereço" ariaLabel="Endereço" />
              <div className={twoCol}>
                <TextInput name="location_neighborhood" value={str("location_neighborhood")} onChange={update} placeholder="Bairro" ariaLabel="Bairro" />
                <TextInput name="location_municipality" value={str("location_municipality")} onChange={update} placeholder="Município" ariaLabel="Município" />
              </div>
              <div className={twoCol}>
                <TextInput name="location_city" value={str("location_city")} onChange={update} placeholder="Cidade" ariaLabel="Cidade" />
                <TextInput name="location_province" value={str("location_province")} onChange={update} placeholder="Província" ariaLabel="Província" />
              </div>
              <TextInput name="location_reference" value={str("location_reference")} onChange={update} placeholder="Ponto de referência" ariaLabel="Ponto de referência" />
              <TextInput name="map_link" value={str("map_link")} onChange={update} type="url" placeholder="Link do Google Maps (opcional)" ariaLabel="Link do Google Maps" />
            </Field>
            <Field label="6. Já é proprietário do terreno?" required>
              <RadioOptions required name="land_ownership" value={str("land_ownership")} onChange={update} options={["Sim, com documentação", "Sim, sem documentação regularizada", "Ainda não"]} />
            </Field>
            <Field label="7. Área aproximada do terreno (m²)" hint="Indique a área total, se souber." htmlFor="land_area">
              <TextInput name="land_area" value={str("land_area")} onChange={update} type="number" min={0} placeholder="Área em m²" />
              <div className={twoCol}>
                <TextInput name="land_length" value={str("land_length")} onChange={update} type="number" min={0} placeholder="Comprimento (m)" ariaLabel="Comprimento em metros" />
                <TextInput name="land_width" value={str("land_width")} onChange={update} type="number" min={0} placeholder="Largura (m)" ariaLabel="Largura em metros" />
              </div>
            </Field>
            <Field label="8. Que tipo de terreno é?" required>
              <RadioOptions required name="land_type" value={str("land_type")} onChange={update} options={["Plano", "Em declive", "Aterrado", "Não sei"]} />
            </Field>
            <Field label="9. Existem construções no terreno?" required>
              <RadioOptions required name="existing_buildings" value={str("existing_buildings")} onChange={update} options={["Sim", "Não"]} />
            </Field>
            <Field label="10. Existem árvores no terreno?" required>
              <RadioOptions required name="has_trees" value={str("has_trees")} onChange={update} options={["Sim", "Não"]} />
            </Field>
            <Field label="11. Que infra-estruturas existem?" hint="Pode seleccionar mais do que uma opção.">
              <CheckboxOptions name="infrastructure" value={arr("infrastructure")} onChange={update} options={INFRASTRUCTURES} />
            </Field>
            <Field label="12. Fotografias do terreno" hint="Pode anexar fotografias, plantas ou documentos.">
              <FileUploader files={files} onChange={setFiles}
                note={`JPG, PNG, WEBP ou PDF. Máximo de ${MAX_FILES} ficheiros, ${MAX_FILE_MB} MB cada.`} />
            </Field>
          </>
        );
      case 2:
        return (
          <>
            <Field label="13. Quantas pessoas vão morar na casa?" required htmlFor="residents_count">
              <TextInput name="residents_count" value={str("residents_count")} onChange={update} type="number" min={1} placeholder="Número de pessoas" required />
            </Field>
            <Field label="14. Terá trabalhadores em casa?" required>
              <RadioOptions required name="domestic_workers" value={str("domestic_workers")} onChange={update} options={["Sim", "Não"]} />
            </Field>
            {str("domestic_workers") === "Sim" && (
              <Field label="Quantos trabalhadores?" htmlFor="domestic_workers_count">
                <TextInput name="domestic_workers_count" value={str("domestic_workers_count")} onChange={update} type="number" min={1} placeholder="Número de trabalhadores" />
              </Field>
            )}
            <Field label="15. Idades e perfis dos moradores" hint="Por exemplo: crianças, idosos ou pessoas com mobilidade reduzida." htmlFor="resident_profiles">
              <TextArea name="resident_profiles" value={str("resident_profiles")} onChange={update} placeholder="Descreva os perfis e necessidades dos moradores..." />
            </Field>
            <Field label="16. Prevê crescimento da família nos próximos 10 anos?" required>
              <RadioOptions required name="family_growth" value={str("family_growth")} onChange={update} options={["Sim", "Não", "Talvez"]} />
            </Field>
            <Field label="17. Trabalha em casa?" required>
              <RadioOptions required name="works_from_home" value={str("works_from_home")} onChange={update} options={["Sim", "Não", "Frequentemente"]} />
            </Field>
            <Field label="18. Recebe visitas ou organiza eventos em casa?" required>
              <RadioOptions required name="visitors_frequency" value={str("visitors_frequency")} onChange={update} options={["Sim, muito frequentemente", "Sim, frequentemente", "Sim, algumas vezes", "Sim, raramente", "Não recebo visitas"]} />
            </Field>
            <Field label="19. Tem animais de estimação? Quais?" htmlFor="pets">
              <TextArea name="pets" value={str("pets")} onChange={update} placeholder="Indique os animais e as suas necessidades..." rows={2} />
            </Field>
            <Field label="20. O que mais o incomoda na casa onde vive hoje?" htmlFor="current_home_dislikes">
              <TextArea name="current_home_dislikes" value={str("current_home_dislikes")} onChange={update} placeholder="O que gostaria de melhorar?" />
            </Field>
            <Field label="21. O que mais gosta na casa onde vive hoje?" htmlFor="current_home_likes">
              <TextArea name="current_home_likes" value={str("current_home_likes")} onChange={update} placeholder="O que gostaria de manter ou repetir?" />
            </Field>
          </>
        );
      case 3:
        return (
          <>
            <div className={twoCol}>
              <Field label="22. Número de quartos" required htmlFor="bedrooms_count">
                <TextInput name="bedrooms_count" value={str("bedrooms_count")} onChange={update} type="number" min={1} placeholder="N.º de quartos" required />
              </Field>
              <Field label="Quantas suítes?" required htmlFor="suites_count">
                <TextInput name="suites_count" value={str("suites_count")} onChange={update} type="number" min={0} placeholder="N.º de suítes" required />
              </Field>
            </div>
            <Field label="23. Que espaços deseja incluir?" required hint="Seleccione todos os espaços pretendidos.">
              <CheckboxOptions name="desired_spaces" value={arr("desired_spaces")} onChange={update} options={SPACES} />
            </Field>
            {arr("desired_spaces").includes("Garagem") && (
              <Field label="24. Quantos carros pretende acomodar na garagem?" htmlFor="cars_count">
                <TextInput name="cars_count" value={str("cars_count")} onChange={update} type="number" min={1} placeholder="Número de carros" />
              </Field>
            )}
            <Field label="25. Qual é a sua preferência para a cozinha?" required>
              <RadioOptions required name="kitchen_layout" value={str("kitchen_layout")} onChange={update} options={["Aberta para a sala", "Fechada", "Semi-aberta"]} />
            </Field>
            <Field label="26. Quantos pisos deseja?" required>
              <RadioOptions required name="floor_count" value={str("floor_count")} onChange={update} options={["Rés-do-chão", "1 andar", "Outro"]} />
            </Field>
            <Field label="27. Há algum espaço indispensável que não foi listado?" htmlFor="essential_space">
              <TextArea name="essential_space" value={str("essential_space")} onChange={update} placeholder="Descreva outros espaços ou necessidades..." />
            </Field>
          </>
        );
      default:
        return (
          <>
            <Field label="28. Que estilos arquitectónicos lhe agradam?" required hint="Pode seleccionar mais do que um.">
              <CheckboxOptions name="architectural_style" value={arr("architectural_style")} onChange={update} options={STYLES} />
            </Field>
            <Field label="29. Cores e materiais de que gosta ou não gosta" htmlFor="colour_material_preferences">
              <TextArea name="colour_material_preferences" value={str("colour_material_preferences")} onChange={update} placeholder="Cores, revestimentos, materiais, acabamentos..." />
            </Field>
            <Field label="30. Quanto valoriza a luz natural e a ligação com o exterior?" required>
              <Rating required name="natural_light_rating" value={str("natural_light_rating")} onChange={update} low="1 · Pouco" high="5 · Muito" />
            </Field>
            <Field label="31. Quanto valoriza a privacidade em relação à rua e aos vizinhos?" required>
              <Rating required name="privacy_rating" value={str("privacy_rating")} onChange={update} low="1 · Pouco" high="5 · Muito" />
            </Field>
            <Field label="32. Imagens ou links de referência" hint="Pode indicar links do Pinterest, Instagram ou outras referências. Também pode anexar imagens e PDFs." htmlFor="reference_links">
              <TextArea name="reference_links" value={str("reference_links")} onChange={update} placeholder="Cole aqui os links de referência..." rows={3} />
              <FileUploader files={files} onChange={setFiles}
                note={`Máximo de ${MAX_FILES} ficheiros no total (incluindo os da etapa 2), ${MAX_FILE_MB} MB cada.`} />
            </Field>
            <Field label="33. Há algo importante que não perguntámos?" htmlFor="other_information">
              <TextArea name="other_information" value={str("other_information")} onChange={update} placeholder="Partilhe qualquer outra informação importante..." />
            </Field>
            <label className="flex items-start gap-2.5 text-xs leading-relaxed text-[#62696e]">
              <input type="checkbox" name="privacy_consent" required className="mt-[3px] accent-[#002950]" />
              <span>Autorizo a PRO SOTA a utilizar estas informações para analisar e dar seguimento ao meu pedido de projecto.</span>
            </label>
            <div className="absolute left-[-10000px] h-px w-px overflow-hidden" aria-hidden="true">
              <label>Deixe este campo vazio<input name="website" tabIndex={-1} autoComplete="off" /></label>
            </div>
          </>
        );
    }
  }

  if (success) {
    return (
      <main className={pageCls}>
        <section className="mx-auto my-[12vh] max-w-[620px] rounded-lg border border-[#e9e7e1] bg-white p-[clamp(28px,6vw,64px)] text-center">
          <div className={`mb-10 block ${brandCls}`}>PRO <span className="text-[#BD9655]">SOTA</span></div>
          <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full bg-[#edf5ef] text-2xl text-[#2f7045]" aria-hidden="true">✓</div>
          <p className={`${eyebrowCls} mb-[13px] text-[#8b6a2f]`}>BRIEF RESIDENCIAL</p>
          <h1 className="mb-4 mt-2.5 text-[clamp(30px,4vw,42px)] text-[#002950]">Obrigado pela sua confiança.</h1>
          <p className="mx-auto mb-[25px] max-w-[470px] text-[15px] leading-[1.75] text-[#636b70]">
            Recebemos as informações do seu projecto. A nossa equipa irá analisar o brief e entrará em contacto consigo através do meio indicado.
          </p>
          <a className={btnPrimary} href="/">Voltar ao início</a>
        </section>
      </main>
    );
  }

  return (
    <main className={pageCls}>
      <div className="mx-auto max-w-[980px]">
        <header className="flex h-[68px] items-center justify-between border-b border-[#e7e5df] sm:h-[82px]">
          <a className={brandCls} href="/" aria-label="PRO SOTA — página inicial">PRO <span className="text-[#BD9655]">SOTA</span></a>
          <span className={`${eyebrowCls} text-[9px] tracking-[1px] text-[#6b6f72] sm:text-[11px] sm:tracking-[1.7px]`}>ANGOLA · DESDE 1997</span>
        </header>

        <section className="max-w-[680px] pb-[25px] pt-[38px] sm:pb-8 sm:pt-[52px]">
          <p className={`${eyebrowCls} mb-[13px] text-[#8b6a2f]`}>ARQUITECTURA </p>
          <h1 className="mb-4 text-[clamp(32px,5vw,48px)] font-semibold leading-[1.1] tracking-[-0.8px] text-[#002950] sm:tracking-[-1.6px]">
            Vamos dar forma ao seu projecto.
          </h1>
          <p className="max-w-[640px] text-base leading-[1.75] text-[#62696e]">
            Este brief ajuda-nos a compreender o seu terreno, a sua família e a forma como imagina viver. Reserve alguns minutos para responder às perguntas.
          </p>
        </section>

        <section className="rounded-lg border border-[#e9e7e1] bg-white px-[17px] py-[22px] shadow-[0_8px_32px_rgba(0,41,80,0.035)] sm:p-[clamp(22px,4vw,42px)]">
          <div className="flex items-start justify-between gap-5">
            <div>
              <span className={`${eyebrowCls} text-[#6b6f72]`}>ETAPA {step + 1} DE {STEPS.length}</span>
              <h2 ref={headingRef} tabIndex={-1} className="mb-[7px] mt-[9px] text-[22px] font-semibold text-[#002950] outline-none sm:text-[25px]">
                {STEPS[step].title}
              </h2>
              <p className="text-sm leading-normal text-[#656b70]">{STEPS[step].description}</p>
            </div>
            <span className="pt-[3px] text-sm font-bold text-[#002950]">{progress}%</span>
          </div>

          <div className="my-[25px] h-1 overflow-hidden rounded-lg bg-[#ecebe7]" role="progressbar"
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <div className="h-full bg-[#BD9655] transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${progress}%` }} />
          </div>

          <nav className="mb-7 grid grid-cols-5 gap-[3px] sm:mb-[34px] sm:gap-2" aria-label="Etapas do formulário">
            {STEPS.map((item, index) => {
              const active = index === step;
              const done = index < step;
              return (
                <button type="button" key={item.title} onClick={() => done && goBack(index)}
                  disabled={index > step} aria-current={active ? "step" : undefined}
                  className={`flex flex-col items-center gap-2 border-0 bg-transparent p-0 disabled:cursor-default ${done ? "cursor-pointer" : ""} ${
                    active ? "font-bold text-[#002950]" : "text-[#6f7376]"
                  } ${focusOutline}`}>
                  <span className={`grid h-[27px] w-[27px] place-items-center rounded-full border text-xs sm:h-[30px] sm:w-[30px] ${
                    active || done ? "border-[#002950] bg-[#002950] text-white" : "border-[#d9d9d4] bg-white"
                  }`}>
                    {done ? "✓" : index + 1}
                  </span>
                  <small className="text-center text-[9px] leading-[1.3] sm:text-[11px]">{item.title}</small>
                </button>
              );
            })}
          </nav>

          <form id="project-brief-form" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-[25px]">{renderStep()}</div>

            {error && (
              <div className="mt-[18px] rounded border border-[#e7b8b2] bg-[#fff2f0] px-3.5 py-3 text-[13px] text-[#8d2f25]" role="alert">
                {error}
              </div>
            )}

            <div className="mt-[34px] flex flex-col items-start justify-between gap-4 border-t border-[#ecebe7] pt-[22px] sm:flex-row sm:items-center">
              <span className="text-[11px] text-[#6f757a]"><span className="text-[#8b6a2f]">*</span> Campos obrigatórios</span>
              <div className="flex w-full items-center justify-end gap-2.5 sm:w-auto">
                {step > 0 && <button className={btnSecondary} type="button" onClick={() => goBack(step - 1)}>Anterior</button>}
                {isLast
                  ? <button className={btnPrimary} type="submit" disabled={pending}>{pending ? "A enviar..." : "Enviar brief"} <span aria-hidden="true">→</span></button>
                  : <button className={btnPrimary} type="button" onClick={goNext}>Continuar <span aria-hidden="true">→</span></button>}
              </div>
            </div>
          </form>
        </section>

        <footer className="flex flex-col justify-between gap-3 pt-[25px] text-[11px] text-[#6f757a] sm:flex-row">
          <span className="font-extrabold tracking-[1.5px] text-[#002950]">PRO SOTA</span>
          <span>Arquitectura · Engenharia · Construção</span>
        </footer>
      </div>
    </main>
  );
}