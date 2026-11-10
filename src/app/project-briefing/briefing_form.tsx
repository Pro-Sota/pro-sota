"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import Image from "next/image";

import "leaflet/dist/leaflet.css";
import { submitProjectBrief } from "@/actions/project_briefing";
import Link from "next/link";

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

const STEPS = [
  {
    title: "Dados pessoais",
    description: "Como podemos entrar em contacto consigo?",
  },
  {
    title: "Terreno e localização",
    description: "Vamos conhecer o terreno e as suas características.",
  },
  {
    title: "Família e estilo de vida",
    description: "Queremos compreender como irá viver a casa.",
  },
  {
    title: "Programa arquitectónico",
    description: "Defina os espaços e as características da habitação.",
  },
  {
    title: "Âmbito e planeamento",
    description: "Defina os serviços, prioridades e prazo pretendido.",
  },
  {
    title: "Orçamento e investimento",
    description: "Qual é o investimento previsto para concretizar o projecto?",
  },
  {
    title: "Estética e preferências",
    description: "Partilhe os estilos, materiais e referências de que gosta.",
  },
];

const INFRASTRUCTURES = [
  "Rede eléctrica",
  "Água canalizada",
  "Esgoto",
  "Estrada asfaltada",
  "Internet",
  "Nenhuma",
];

const SPACES = [
  "Sala de estar",
  "Sala de jantar",
  "Cozinha",
  "Cozinha de apoio/exterior",
  "Escritório",
  "Lavandaria",
  "Despensa",
  "Quarto da empregada",
  "Varanda",
  "Terraço",
  "Piscina",
  "Jardim",
  "Churrasqueira/área gourmet",
  "Ginásio",
  "Garagem",
  "Outro",
];

const PROJECT_PRIORITIES = [
  "Conforto e funcionalidade",
  "Controlo do orçamento",
  "Eficiência energética",
  "Privacidade e segurança",
  "Rapidez de execução",
  "Valorização do imóvel",
  "Sustentabilidade",
  "Integração com o exterior",
  "Flexibilidade para o futuro",
];

const SERVICE_SCOPE_OPTIONS = [
  "Apenas arquitectura",
  "Arquitectura e engenharia",
  "Projecto completo (arquitectura, especialidades e fiscalização)",
  "Projecto e construção (solução chave-na-mão)",
  "Ainda não tenho a certeza",
];

const CONSTRUCTION_START_OPTIONS = [
  "O mais breve possível",
  "Dentro de 1 a 3 meses",
  "Dentro de 3 a 6 meses",
  "Dentro de 6 a 12 meses",
  "Daqui a mais de 12 meses",
  "Ainda não definido",
];

const ARCHITECTURAL_STYLE_OPTIONS = [
  {
    name: "Contemporâneo",
    description:
      "Linhas actuais, volumes marcantes e grandes vãos envidraçados.",
    image: "/images/briefing_images/contemporary.jpg",
    position: "center 55%",
  },
  {
    name: "Minimalista",
    description:
      "Formas simples, poucos elementos e uma paleta depurada.",
    image: "/images/briefing_images/minimalist.jpg",
    position: "center",
  },
  {
    name: "Rústico",
    description:
      "Materiais naturais, madeira, pedra e texturas acolhedoras.",
    image: "/images/briefing_images/rustic.jpg",
    position: "center",
  },
  {
    name: "Tropical",
    description:
      "Espaços ventilados, sombra e integração com a vegetação.",
    image: "/images/briefing_images/tropical.jpg",
    position: "center",
  },
  {
    name: "Industrial",
    description:
      "Betão, metal, estruturas aparentes e acabamentos robustos.",
    image: "/images/briefing_images/industrial.jpg",
    position: "center",
  },
  {
    name: "Clássico",
    description:
      "Simetria, proporções tradicionais e detalhes elegantes.",
    image: "/images/briefing_images/classic.png",
    position: "center",
  },
];

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const ACCEPT = ALLOWED_TYPES.join(",");

const MAX_FILES = 5;
const MAX_FILE_MB = 8;
const MAX_FILE_SIZE = MAX_FILE_MB * 1024 * 1024;

const INITIAL_BUDGET_CEILING = 5_000_000;
const BUDGET_SLIDER_STEP = 500;

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type BriefValues = Record<string, string | string[]>;

type FieldProps = {
  label: string;
  required?: boolean;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
};

/* -------------------------------------------------------------------------- */
/* Initial values                                                             */
/* -------------------------------------------------------------------------- */

const initialValues: BriefValues = {
  full_name: "",
  contact_phone: "",
  contact_email: "",

  budget: "50000000",
  decision_makers: "",
  preferred_contact: "",

  location_address: "",
  location_neighborhood: "",
  location_municipality: "",
  location_reference: "",
  location_city: "",
  location_province: "",

  land_ownership: "",
  land_area: "",
  land_length: "",
  land_width: "",
  land_type: "",
  existing_buildings: "",
  has_trees: "",
  infrastructure: [],
  latitude: "",
  longitude: "",

  residents_count: "",
  domestic_workers: "",
  domestic_workers_count: "",
  resident_profiles: "",
  family_growth: "",
  works_from_home: "",
  visitors_frequency: "",
  pets: "",
  current_home_dislikes: "",
  current_home_likes: "",

  bedrooms_count: "",
  suites_count: "",
  desired_spaces: [],
  desired_spaces_other: "",
  cars_count: "",
  kitchen_layout: "",
  floor_count: "",
  floor_count_other: "",
  essential_space: "",

  service_scope: "",
  project_priorities: [],
  construction_start: "",
  architectural_style_other: "",

  architectural_style: [],
  colour_material_preferences: "",
  natural_light_rating: "",
  privacy_rating: "",
  reference_links: "",
  other_information: "",
};

/* -------------------------------------------------------------------------- */
/* Shared styles                                                              */
/* -------------------------------------------------------------------------- */

const focusRing =
  "focus-within:border-[#BD9655] focus-within:ring-[3px] focus-within:ring-[#BD9655]/25";

const focusOutline =
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#BD9655]";

const inputCls =
  "w-full min-h-[45px] rounded border border-[#cfd2cf] bg-white px-[13px] py-[11px] text-sm text-[#263746] outline-none transition-colors placeholder:text-[#8e9395] focus:border-[#BD9655] focus:ring-[3px] focus:ring-[#BD9655]/20 motion-reduce:transition-none";

const textareaCls = `${inputCls} min-h-[100px] resize-y leading-relaxed`;

const fileInputCls = `${inputCls} p-[9px]`;

const optionBase =
  `flex min-h-[42px] cursor-pointer items-center gap-2 rounded border px-[13px] py-[9px] text-[13px] transition-colors motion-reduce:transition-none ${focusRing}`;

const optionOn = "border-[#BD9655] bg-[#fbf8f2] text-[#002950]";

const optionOff = "border-[#d3d5d1] text-[#4d565d]";

const btnBase =
  `inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-3 rounded px-4 text-[13px] font-bold no-underline transition-colors sm:min-h-[46px] sm:px-[21px] motion-reduce:transition-none ${focusOutline}`;

const btnPrimary =
  `${btnBase} border border-[#002950] bg-[#002950] text-white hover:bg-[#06406f] disabled:cursor-not-allowed disabled:opacity-60`;

const btnSecondary =
  `${btnBase} border border-[#d6d8d6] bg-white text-[#35424d] hover:bg-[#f7f7f5]`;

const twoCol = "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-[14px]";

const hintCls = "-mt-[3px] mb-px text-xs leading-normal text-[#6f757a]";

const brandCls =
  `text-[22px] font-extrabold tracking-[2px] text-[#002950] no-underline ${focusOutline}`;

const eyebrowCls = "text-[11px] font-bold tracking-[1.7px]";

const pageCls =
  "min-h-screen bg-[#F7F7F5] px-[14px] pb-[25px] font-[Arial,Helvetica,sans-serif] text-[#202a34] sm:px-6 sm:pb-10";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatBudget(value: number) {
  return `${new Intl.NumberFormat("pt-PT", {
    maximumFractionDigits: 0,
  }).format(value)} Kz`;
}

function isValidCoordinate(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/* -------------------------------------------------------------------------- */
/* Field                                                                      */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  required,
  hint,
  htmlFor,
  children,
}: FieldProps) {
  const labelId = useId();

  return (
    <div
      className="flex min-w-0 flex-col gap-[9px]"
      role="group"
      aria-labelledby={labelId}
    >
      <div
        className="text-sm font-bold leading-normal text-[#263746]"
        id={labelId}
      >
        {label}

        {required && (
          <span aria-hidden="true" className="text-[#8b6a2f]">
            {" "}*
          </span>
        )}
      </div>

      {hint && <p className={hintCls}>{hint}</p>}

      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Text input                                                                 */
/* -------------------------------------------------------------------------- */

function TextInput({
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  min,
  max,
  step,
  ariaLabel,
}: {
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  ariaLabel?: string;
}) {
  return (
    <input
      className={inputCls}
      id={name}
      name={name}
      type={type}
      value={value}
      min={min}
      max={max}
      step={step}
      inputMode={type === "number" ? "decimal" : undefined}
      placeholder={placeholder}
      required={required}
      aria-label={ariaLabel}
      onChange={(event) => onChange(name, event.target.value)}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Textarea                                                                   */
/* -------------------------------------------------------------------------- */

function TextArea({
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      className={textareaCls}
      id={name}
      name={name}
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(name, event.target.value)}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Radio options                                                              */
/* -------------------------------------------------------------------------- */

function RadioOptions({
  name,
  value,
  options,
  onChange,
  required = false,
}: {
  name: string;
  value: string;
  options: string[];
  required?: boolean;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-[9px]">
      {options.map((option) => (
        <label
          className={`${optionBase} ${value === option ? optionOn : optionOff
            }`}
          key={option}
        >
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            required={required}
            className="m-0 accent-[#002950]"
            onChange={() => onChange(name, option)}
          />

          <span>{option}</span>
        </label>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Checkbox options                                                           */
/* -------------------------------------------------------------------------- */

function CheckboxOptions({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: string[];
  options: string[];
  onChange: (name: string, value: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-[9px]">
      {options.map((option) => {
        const checked = value.includes(option);

        return (
          <label
            className={`${optionBase} ${checked ? optionOn : optionOff
              }`}
            key={option}
          >
            <input
              type="checkbox"
              name={name}
              value={option}
              checked={checked}
              className="m-0 accent-[#002950]"
              onChange={(event) => {
                onChange(
                  name,
                  event.target.checked
                    ? [...value, option]
                    : value.filter((item) => item !== option)
                );
              }}
            />

            <span>{option}</span>
          </label>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Architectural styles                                                       */
/* -------------------------------------------------------------------------- */

function ArchitecturalStyleOptions({
  value,
  onChange,
  otherValue,
  onOtherValueChange,
}: {
  value: string[];
  onChange: (name: string, value: string[]) => void;
  otherValue: string;
  onOtherValueChange: (name: string, value: string) => void;
}) {
  function toggle(style: string, checked: boolean) {
    onChange(
      "architectural_style",
      checked
        ? [...value, style]
        : value.filter((item) => item !== style)
    );

    if (style === "Outro" && !checked) {
      onOtherValueChange("architectural_style_other", "");
    }
  }

  const otherSelected = value.includes("Outro");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ARCHITECTURAL_STYLE_OPTIONS.map((style) => {
          const selected = value.includes(style.name);

          return (
            <label
              key={style.name}
              className={`group relative block cursor-pointer overflow-hidden rounded-lg border text-left transition-all motion-reduce:transition-none ${selected
                ? "border-[#BD9655] bg-[#fbf8f2] ring-2 ring-[#BD9655]/25"
                : "border-[#d3d5d1] bg-white hover:border-[#b8a17d]"
                }`}
            >
              <input
                type="checkbox"
                name="architectural_style"
                value={style.name}
                checked={selected}
                onChange={(event) =>
                  toggle(style.name, event.target.checked)
                }
                className="peer sr-only"
              />

              <div
                role="img"
                aria-label={`Exemplo de arquitectura ${style.name.toLowerCase()}`}
                className="relative h-[250px] bg-[#e8e7e2] bg-cover bg-center sm:h-[150px]"
                style={{
                  backgroundImage: `url("${style.image}")`,
                  backgroundPosition: style.position,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5" />

                <span
                  className={`absolute left-3 top-3 grid h-6 w-6 place-items-center rounded border text-xs font-bold transition-colors ${selected
                    ? "border-[#BD9655] bg-[#BD9655] text-white"
                    : "border-white/90 bg-white text-transparent"
                    }`}
                  aria-hidden="true"
                >
                  ✓
                </span>

                {selected && (
                  <span className="absolute right-3 top-3 rounded bg-[#002950] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    Seleccionado
                  </span>
                )}
              </div>

              <div className="p-3.5">
                <span className="block text-sm font-bold text-[#002950]">
                  {style.name}
                </span>

                <span className="mt-1 block text-xs leading-relaxed text-[#6f757a]">
                  {style.description}
                </span>
              </div>
            </label>
          );
        })}
      </div>

      {/* Other style option */}
      <label
        className={`${optionBase} ${otherSelected ? optionOn : optionOff
          } min-h-[54px] w-fit`}
      >
        <input
          type="checkbox"
          name="architectural_style"
          value="Outro"
          checked={otherSelected}
          onChange={(event) =>
            toggle("Outro", event.target.checked)
          }
          className="m-0 accent-[#002950]"
        />

        <span>Outro estilo</span>
      </label>

      {/* Conditional input */}
      {otherSelected && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <Field
            label="Especifique o estilo arquitectónico"
            required
            hint="Descreva o estilo que tem em mente."
          >
            <TextInput
              name="architectural_style_other"
              value={otherValue}
              onChange={onOtherValueChange}
              placeholder="Ex.: Mediterrânico, escandinavo, colonial..."
              required
            />
          </Field>
        </div>
      )}
    </div>
  );
}
/* -------------------------------------------------------------------------- */
/* Rating                                                                     */
/* -------------------------------------------------------------------------- */

function Rating({
  name,
  value,
  onChange,
  low,
  high,
  required = false,
}: {
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  low: string;
  high: string;
  required?: boolean;
}) {
  return (
    <div className="max-w-[440px]">
      <div className="grid grid-cols-5 gap-[9px]">
        {["1", "2", "3", "4", "5"].map((number) => (
          <label
            key={number}
            className={`relative grid h-[45px] cursor-pointer place-items-center rounded border font-semibold transition-colors motion-reduce:transition-none ${focusRing} ${value === number
              ? "border-[#BD9655] bg-[#fbf8f2] text-[#002950] ring-1 ring-inset ring-[#BD9655]"
              : "border-[#d3d5d1] text-[#5e666c]"
              }`}
          >
            <input
              type="radio"
              name={name}
              value={number}
              checked={value === number}
              required={required}
              className="absolute inset-0 m-0 cursor-pointer opacity-0"
              onChange={() => onChange(name, number)}
            />

            {number}
          </label>
        ))}
      </div>

      <div className="mt-2 flex justify-between text-[11px] text-[#6f757a]">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* File uploader                                                              */
/* -------------------------------------------------------------------------- */

function FileUploader({
  files,
  onChange,
  note,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  note: string;
}) {
  const [problem, setProblem] = useState("");

  function handlePick(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);

    // Allows selecting the same file again after removing it.
    event.target.value = "";

    const issues: string[] = [];
    const next = [...files];

    for (const file of picked) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        issues.push(
          `"${file.name}" não é JPG, PNG, WEBP ou PDF.`
        );
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        issues.push(
          `"${file.name}" excede o limite de ${MAX_FILE_MB} MB.`
        );
        continue;
      }

      const duplicate = next.some(
        (existing) =>
          existing.name === file.name &&
          existing.size === file.size &&
          existing.lastModified === file.lastModified
      );

      if (duplicate) continue;

      if (next.length >= MAX_FILES) {
        issues.push(`Máximo de ${MAX_FILES} ficheiros.`);
        break;
      }

      next.push(file);
    }

    setProblem(issues.join(" "));
    onChange(next);
  }

  function removeFile(index: number) {
    setProblem("");
    onChange(files.filter((_, fileIndex) => fileIndex !== index));
  }

  return (
    <>
      <input
        className={fileInputCls}
        type="file"
        multiple
        accept={ACCEPT}
        onChange={handlePick}
        aria-label="Anexar ficheiros"
        disabled={files.length >= MAX_FILES}
      />

      <p className={hintCls}>{note}</p>

      {files.length >= MAX_FILES && (
        <p className="text-xs text-[#8b6a2f]">
          Atingiu o limite de ficheiros. Remova um ficheiro para adicionar outro.
        </p>
      )}

      {problem && (
        <p
          className="m-0 text-xs leading-normal text-[#8d2f25]"
          role="alert"
        >
          {problem}
        </p>
      )}

      {files.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-[9px] p-0">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${file.lastModified}`}
              className="flex items-center justify-between gap-3 rounded border border-[#ecebe7] bg-[#fafaf8] px-3 py-2.5 text-xs text-[#505960]"
            >
              <span className="min-w-0 break-all">
                {file.name}

                <small className="ml-1 text-[#8e9395]">
                  ({(file.size / 1024 / 1024).toFixed(1)} MB)
                </small>
              </span>

              <button
                type="button"
                className={`shrink-0 cursor-pointer border-0 bg-transparent text-[#8b5d27] underline ${focusOutline}`}
                onClick={() => removeFile(index)}
                aria-label={`Remover ${file.name}`}
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Interactive Leaflet map                                                    */
/* -------------------------------------------------------------------------- */

function LandLocationMap({
  latitude,
  longitude,
  onChange,
}: {
  latitude: string;
  longitude: string;
  onChange: (name: string, value: string) => void;
}) {
  const mapElement = useRef<HTMLDivElement>(null);

  const mapInstance = useRef<
    import("leaflet").Map | null
  >(null);

  const markerInstance = useRef<
    import("leaflet").Marker | null
  >(null);

  const onChangeRef = useRef(onChange);

  const coordinatesRef = useRef({
    latitude,
    longitude,
  });

  // Keep callbacks and coordinates current without recreating the map.
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    coordinatesRef.current = {
      latitude,
      longitude,
    };

    if (!markerInstance.current) return;

    if (!latitude.trim() || !longitude.trim()) return;

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!isValidCoordinate(lat, lng)) return;

    markerInstance.current.setLatLng([lat, lng]);

    mapInstance.current?.setView(
      [lat, lng],
      Math.max(mapInstance.current.getZoom(), 15)
    );
  }, [latitude, longitude]);

  useEffect(() => {
    let cancelled = false;

    async function initialiseMap() {
      if (!mapElement.current || mapInstance.current) return;

      try {
        const L = await import("leaflet");

        if (cancelled || !mapElement.current) return;

        const current = coordinatesRef.current;

        const hasCoordinates =
          current.latitude.trim() !== "" &&
          current.longitude.trim() !== "";

        let initialLat = -8.839;
        let initialLng = 13.289;

        if (hasCoordinates) {
          const lat = Number(current.latitude);
          const lng = Number(current.longitude);

          if (isValidCoordinate(lat, lng)) {
            initialLat = lat;
            initialLng = lng;
          }
        }

        const map = L.map(mapElement.current, {
          scrollWheelZoom: true,
          zoomControl: true,
        }).setView(
          [initialLat, initialLng],
          hasCoordinates ? 15 : 11
        );

        L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
          }
        ).addTo(map);

        const customIcon = L.divIcon({
          className: "pro-sota-map-marker",
          html: `
    <svg
      width="36"
      height="46"
      viewBox="0 0 36 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 1C8.6 1 1 8.6 1 18C1 30 18 44 18 44C18 44 35 30 35 18C35 8.6 27.4 1 18 1Z"
        fill="#002950"
        stroke="white"
        stroke-width="2"
      />
      <circle
        cx="18"
        cy="18"
        r="6"
        fill="#BD9655"
        stroke="white"
        stroke-width="2"
      />
    </svg>
  `,
          iconSize: [36, 46],
          iconAnchor: [18, 44],
        });

        const marker = L.marker(
          [initialLat, initialLng],
          {
            draggable: true,
            icon: customIcon,
          }
        ).addTo(map);

        const publishCoordinates = (
          lat: number,
          lng: number
        ) => {
          if (!isValidCoordinate(lat, lng)) return;
          onChangeRef.current("latitude", lat.toFixed(7));
          onChangeRef.current("longitude", lng.toFixed(7));
        };

        marker.on("dragend", () => {
          const point = marker.getLatLng();

          publishCoordinates(point.lat, point.lng);
        });

        map.on("click", (event) => {
          marker.setLatLng(event.latlng);

          publishCoordinates(
            event.latlng.lat,
            event.latlng.lng
          );
        });

        if (cancelled) {
          map.remove();
          return;
        }

        mapInstance.current = map;
        markerInstance.current = marker;

        map.whenReady(() => {
          map.invalidateSize();
        });
      } catch (error) {
        console.error("Erro ao inicializar o mapa:", error);
      }
    }

    initialiseMap();

    return () => {
      cancelled = true;

      mapInstance.current?.remove();

      mapInstance.current = null;
      markerInstance.current = null;
    };
  }, []);

  return (
    <div className="overflow-hidden rounded border border-[#cfd2cf]">
      <div
        ref={mapElement}
        className="z-0 h-[300px] w-full sm:h-[360px]"
        role="application"
        aria-label="Mapa interactivo para seleccionar a localização do terreno"
      />

      <div className="grid grid-cols-1 gap-3 bg-[#fafaf8] p-3 sm:grid-cols-2">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wide text-[#737a7e]">
            Latitude
          </span>

          <span className="text-sm font-semibold tabular-nums text-[#002950]">
            {latitude || "Não seleccionada"}
          </span>
        </div>

        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wide text-[#737a7e]">
            Longitude
          </span>

          <span className="text-sm font-semibold tabular-nums text-[#002950]">
            {longitude || "Não seleccionada"}
          </span>
        </div>
      </div>

      <p className="border-t border-[#ecebe7] bg-[#fafaf8] px-3 pb-3 text-[11px] text-[#737a7e]">
        Clique no mapa ou arraste o marcador para indicar a localização exacta.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Dual-handle budget range                                                   */
/* -------------------------------------------------------------------------- */




/* -------------------------------------------------------------------------- */
/* Main form                                                                  */
/* -------------------------------------------------------------------------- */

export default function ProjectBriefForm() {
  const [step, setStep] = useState(0);

  const [values, setValues] = useState<BriefValues>(() => ({
    ...initialValues,
    infrastructure: [],
    desired_spaces: [],
    architectural_style: [],
  }));

  const [files, setFiles] = useState<File[]>([]);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState(false);

  const [pending, startTransition] = useTransition();

  const headingRef = useRef<HTMLHeadingElement>(null);

  const isLast = step === STEPS.length - 1;

  const progress = useMemo(
    () => Math.round(((step + 1) / STEPS.length) * 100),
    [step]
  );

  const str = useCallback(
    (name: string) => String(values[name] ?? ""),
    [values]
  );

  const arr = useCallback(
    (name: string) =>
      Array.isArray(values[name])
        ? (values[name] as string[])
        : [],
    [values]
  );

  const update = useCallback(
    (name: string, value: string | string[]) => {
      setValues((current) => {
        const next = {
          ...current,
          [name]: value,
        };

        if (
          name === "domestic_workers" &&
          value !== "Sim"
        ) {
          next.domestic_workers_count = "";
        }

        if (name === "desired_spaces" && Array.isArray(value)) {
          if (!value.includes("Garagem")) {
            next.cars_count = "";
          }

          if (!value.includes("Outro")) {
            next.desired_spaces_other = "";
          }
        }

        if (name === "floor_count" && value !== "Outro") {
          next.floor_count_other = "";
        }

        if (
          name === "budget_max" &&
          typeof value === "string"
        ) {
          next.budget = value;
        }

        return next;
      });
    },
    []
  );

  /* ------------------------------------------------------------------------ */
  /* Navigation                                                               */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    headingRef.current?.focus();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [step]);

  /* ------------------------------------------------------------------------ */
  /* Validation                                                               */
  /* ------------------------------------------------------------------------ */

  function validateStep(): string {
    if (step === 5) {
      const budgetValue = str("budget").trim();
      const budget = Number(budgetValue);

      if (
        budgetValue === "" ||
        !Number.isFinite(budget) ||
        budget < 0
      ) {
        return "Indique um orçamento válido.";
      }
    }

    if (step === 1) {
      const hasLocation = [
        "location_address",
        "location_neighborhood",
        "location_municipality",
        "location_city",
        "location_reference",
      ].some((key) => str(key).trim() !== "");

      const latitude = str("latitude").trim();
      const longitude = str("longitude").trim();

      const hasLatitude = latitude !== "";
      const hasLongitude = longitude !== "";

      if (hasLatitude !== hasLongitude) {
        return "Seleccione uma localização válida no mapa.";
      }

      if (hasLatitude && hasLongitude) {
        if (
          !isValidCoordinate(
            Number(latitude),
            Number(longitude)
          )
        ) {
          return "As coordenadas seleccionadas não são válidas.";
        }
      }

      if (!hasLocation && !hasLatitude) {
        return "Indique pelo menos o endereço, o bairro, o município ou seleccione a localização no mapa.";
      }

      const area = str("land_area").trim();
      const length = str("land_length").trim();
      const width = str("land_width").trim();

      if (
        (area !== "" && Number(area) < 0) ||
        (length !== "" && Number(length) < 0) ||
        (width !== "" && Number(width) < 0)
      ) {
        return "As dimensões do terreno não podem ser negativas.";
      }
    }

    if (step === 2) {
      if (
        Number(str("residents_count")) < 1 ||
        !Number.isInteger(Number(str("residents_count")))
      ) {
        return "Indique um número válido de moradores.";
      }

      if (
        str("domestic_workers") === "Sim" &&
        str("domestic_workers_count") !== "" &&
        Number(str("domestic_workers_count")) < 1
      ) {
        return "Indique um número válido de trabalhadores.";
      }
    }

    if (step === 3) {
      const bedrooms = Number(str("bedrooms_count"));
      const suites = Number(str("suites_count"));

      if (suites > bedrooms) {
        return "O número de suítes não pode ser superior ao número de quartos.";
      }

      if (arr("desired_spaces").length === 0) {
        return "Seleccione pelo menos um espaço.";
      }

      if (
        arr("desired_spaces").includes("Garagem") &&
        str("cars_count") !== "" &&
        Number(str("cars_count")) < 1
      ) {
        return "Indique um número válido de carros.";
      }

      if (
        arr("desired_spaces").includes("Outro") &&
        !str("desired_spaces_other").trim()
      ) {
        return "Especifique o outro espaço pretendido.";
      }

      if (
        str("floor_count") === "Outro" &&
        !str("floor_count_other").trim()
      ) {
        return "Especifique o número ou tipo de pisos pretendido.";
      }
    }
    if (step === 4) {
      if (arr("project_priorities").length !== 3) {
        return "Seleccione exactamente três prioridades para o projecto.";
      }
    }

    if (
      step === 6 &&
      arr("architectural_style").length === 0
    ) {
      return "Seleccione pelo menos um estilo arquitectónico.";
    }

    if (
      step === 6 &&
      arr("architectural_style").includes("Outro") &&
      !str("architectural_style_other").trim()
    ) {
      return "Especifique o estilo arquitectónico seleccionado.";
    }

    return "";
  }

  /* ------------------------------------------------------------------------ */
  /* Step navigation                                                          */
  /* ------------------------------------------------------------------------ */

  function goNext() {
    setError("");

    const form = document.getElementById(
      "project-brief-form"
    ) as HTMLFormElement | null;

    if (form && !form.reportValidity()) {
      return;
    }

    const problem = validateStep();

    if (problem) {
      setError(problem);
      return;
    }

    setStep((current) =>
      Math.min(current + 1, STEPS.length - 1)
    );
  }

  function goBack(target: number) {
    setError("");

    setStep(Math.max(0, Math.min(target, step - 1)));
  }

  /* ------------------------------------------------------------------------ */
  /* Submission                                                               */
  /* ------------------------------------------------------------------------ */

  function submit(formData: FormData) {
    setError("");

    // Rebuild the payload using the complete state.
    // This is important because previous steps are unmounted.
    Object.entries(values).forEach(([key, value]) => {
      formData.delete(key);

      if (Array.isArray(value)) {
        value.forEach((item) => {
          formData.append(key, item);
        });

        return;
      }

      formData.set(key, value);
    });

    // Remove any stale attachment values.
    formData.delete("attachments");

    files.forEach((file) => {
      formData.append("attachments", file);
    });

    startTransition(async () => {
      try {
        const result = await submitProjectBrief(formData);

        if (!result.success) {
          setError(
            result.error ||
            "Não foi possível enviar o formulário. Tente novamente."
          );

          return;
        }

        setSuccess(true);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } catch (submissionError) {
        console.error(
          "Erro ao submeter o brief:",
          submissionError
        );

        setError(
          "Ocorreu um erro de ligação. Verifique a internet e tente novamente."
        );
      }
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pending) return;

    if (!isLast) {
      goNext();
      return;
    }

    const problem = validateStep();

    if (problem) {
      setError(problem);
      return;
    }

    submit(new FormData(event.currentTarget));
  }

  /* ------------------------------------------------------------------------ */
  /* Step 1 — Personal details                                                */
  /* ------------------------------------------------------------------------ */

  function renderPersonalDetails() {
    return (
      <>
        <Field label="1. Nome completo" required>
          <TextInput
            name="full_name"
            value={str("full_name")}
            onChange={update}
            placeholder="O seu nome completo"
            required
          />
        </Field>

        <div className={twoCol}>
          <Field label="2. Contacto telefónico" required>
            <TextInput
              name="contact_phone"
              value={str("contact_phone")}
              onChange={update}
              type="tel"
              placeholder="+244 ..."
              required
            />
          </Field>

          <Field label="3. Endereço de e-mail" required>
            <TextInput
              name="contact_email"
              value={str("contact_email")}
              onChange={update}
              type="email"
              placeholder="nome@exemplo.com"
              required
            />
          </Field>
        </div>

        <Field
          label="4. Quem toma as decisões sobre o projecto?"
          required
        >
          <RadioOptions
            required
            name="decision_makers"
            value={str("decision_makers")}
            onChange={update}
            options={[
              "Apenas eu",
              "Eu e o cônjuge",
              "Família",
              "Sócios",
            ]}
          />
        </Field>

        <Field
          label="5. Qual é a melhor forma de contacto?"
          required
        >
          <RadioOptions
            required
            name="preferred_contact"
            value={str("preferred_contact")}
            onChange={update}
            options={[
              "Chamada",
              "WhatsApp",
              "E-mail",
              "Presencial",
            ]}
          />
        </Field>
      </>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Step 2 — Land and location                                               */
  /* ------------------------------------------------------------------------ */

  function renderLandDetails() {
    return (
      <>
        <Field
          label="6. Localização do terreno"
          required
          hint="Preencha os campos que conhece e marque no mapa a localização exacta do terreno."
        >
          <TextInput
            name="location_address"
            value={str("location_address")}
            onChange={update}
            placeholder="Endereço"
            ariaLabel="Endereço"
          />

          <div className={twoCol}>
            <TextInput
              name="location_neighborhood"
              value={str("location_neighborhood")}
              onChange={update}
              placeholder="Bairro"
              ariaLabel="Bairro"
            />

            <TextInput
              name="location_municipality"
              value={str("location_municipality")}
              onChange={update}
              placeholder="Município"
              ariaLabel="Município"
            />
          </div>

          <div className={twoCol}>
            <TextInput
              name="location_city"
              value={str("location_city")}
              onChange={update}
              placeholder="Cidade"
              ariaLabel="Cidade"
            />

            <TextInput
              name="location_province"
              value={str("location_province")}
              onChange={update}
              placeholder="Província"
              ariaLabel="Província"
            />
          </div>

          <TextInput
            name="location_reference"
            value={str("location_reference")}
            onChange={update}
            placeholder="Ponto de referência"
            ariaLabel="Ponto de referência"
          />

          <div className="pt-1">
            <p className="mb-2 text-xs font-semibold text-[#46515a]">
              Seleccione a localização no mapa
            </p>

            <LandLocationMap
              latitude={str("latitude")}
              longitude={str("longitude")}
              onChange={update}
            />

            <input
              type="hidden"
              name="latitude"
              value={str("latitude")}
            />

            <input
              type="hidden"
              name="longitude"
              value={str("longitude")}
            />
          </div>
        </Field>

        <Field label="7. Já é proprietário do terreno?" required>
          <RadioOptions
            required
            name="land_ownership"
            value={str("land_ownership")}
            onChange={update}
            options={[
              "Sim, com documentação",
              "Sim, sem documentação regularizada",
              "Ainda não",
            ]}
          />
        </Field>

        <Field
          label="8. Área aproximada do terreno (m²)"
          hint="Indique a área total, se souber."
        >
          <TextInput
            name="land_area"
            value={str("land_area")}
            onChange={update}
            type="number"
            min={0}
            placeholder="Área em m²"
          />

          <div className={twoCol}>
            <TextInput
              name="land_length"
              value={str("land_length")}
              onChange={update}
              type="number"
              min={0}
              placeholder="Comprimento (m)"
              ariaLabel="Comprimento em metros"
            />

            <TextInput
              name="land_width"
              value={str("land_width")}
              onChange={update}
              type="number"
              min={0}
              placeholder="Largura (m)"
              ariaLabel="Largura em metros"
            />
          </div>
        </Field>

        <Field label="9. Que tipo de terreno é?" required>
          <RadioOptions
            required
            name="land_type"
            value={str("land_type")}
            onChange={update}
            options={[
              "Plano",
              "Em declive",
              "Aterrado",
              "Não sei",
            ]}
          />
        </Field>

        <Field
          label="10. Existem construções no terreno?"
          required
        >
          <RadioOptions
            required
            name="existing_buildings"
            value={str("existing_buildings")}
            onChange={update}
            options={["Sim", "Não"]}
          />
        </Field>

        <Field label="11. Existem árvores no terreno?" required>
          <RadioOptions
            required
            name="has_trees"
            value={str("has_trees")}
            onChange={update}
            options={["Sim", "Não"]}
          />
        </Field>

        <Field
          label="12. Que infra-estruturas existem?"
          hint="Pode seleccionar mais do que uma opção."
        >
          <CheckboxOptions
            name="infrastructure"
            value={arr("infrastructure")}
            onChange={update}
            options={INFRASTRUCTURES}
          />
        </Field>

        <Field
          label="13. Fotografias do terreno"
          hint="Pode anexar fotografias, plantas ou documentos."
        >
          <FileUploader
            files={files}
            onChange={setFiles}
            note={`JPG, PNG, WEBP ou PDF. Máximo de ${MAX_FILES} ficheiros, ${MAX_FILE_MB} MB cada.`}
          />
        </Field>
      </>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Step 3 — Family and lifestyle                                            */
  /* ------------------------------------------------------------------------ */

  function renderLifestyle() {
    return (
      <>
        <Field
          label="14. Quantas pessoas vão morar na casa?"
          required
        >
          <TextInput
            name="residents_count"
            value={str("residents_count")}
            onChange={update}
            type="number"
            min={1}
            step={1}
            placeholder="Número de pessoas"
            required
          />
        </Field>

        <Field label="15. Terá trabalhadores em casa?" required>
          <RadioOptions
            required
            name="domestic_workers"
            value={str("domestic_workers")}
            onChange={update}
            options={["Sim", "Não"]}
          />
        </Field>

        {str("domestic_workers") === "Sim" && (
          <Field label="Quantos trabalhadores?">
            <TextInput
              name="domestic_workers_count"
              value={str("domestic_workers_count")}
              onChange={update}
              type="number"
              min={1}
              step={1}
              placeholder="Número de trabalhadores"
            />
          </Field>
        )}

        <Field
          label="16. Idades e perfis dos moradores"
          hint="Por exemplo: crianças, idosos ou pessoas com mobilidade reduzida."
        >
          <TextArea
            name="resident_profiles"
            value={str("resident_profiles")}
            onChange={update}
            placeholder="Descreva os perfis e necessidades dos moradores..."
          />
        </Field>

        <Field
          label="17. Prevê crescimento da família nos próximos 10 anos?"
          required
        >
          <RadioOptions
            required
            name="family_growth"
            value={str("family_growth")}
            onChange={update}
            options={["Sim", "Não", "Talvez"]}
          />
        </Field>

        <Field label="18. Trabalha em casa?" required>
          <RadioOptions
            required
            name="works_from_home"
            value={str("works_from_home")}
            onChange={update}
            options={[
              "Sim",
              "Não",
              "Frequentemente",
            ]}
          />
        </Field>

        <Field
          label="19. Recebe visitas ou organiza eventos em casa?"
          required
        >
          <RadioOptions
            required
            name="visitors_frequency"
            value={str("visitors_frequency")}
            onChange={update}
            options={[
              "Sim, muito frequentemente",
              "Sim, frequentemente",
              "Sim, algumas vezes",
              "Sim, raramente",
              "Não recebo visitas",
            ]}
          />
        </Field>

        <Field label="20. Tem animais de estimação? Quais?">
          <TextArea
            name="pets"
            value={str("pets")}
            onChange={update}
            placeholder="Indique os animais e as suas necessidades..."
            rows={2}
          />
        </Field>

        <Field label="21. O que mais o incomoda na casa onde vive hoje?">
          <TextArea
            name="current_home_dislikes"
            value={str("current_home_dislikes")}
            onChange={update}
            placeholder="O que gostaria de melhorar?"
          />
        </Field>

        <Field label="22. O que mais gosta na casa onde vive hoje?">
          <TextArea
            name="current_home_likes"
            value={str("current_home_likes")}
            onChange={update}
            placeholder="O que gostaria de manter ou repetir?"
          />
        </Field>
      </>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Step 4 — Architectural programme                                         */
  /* ------------------------------------------------------------------------ */

  function renderArchitecturalProgramme() {
    return (
      <>
        <div className={twoCol}>
          <Field label="23. Número de quartos" required>
            <TextInput
              name="bedrooms_count"
              value={str("bedrooms_count")}
              onChange={update}
              type="number"
              min={1}
              step={1}
              placeholder="N.º de quartos"
              required
            />
          </Field>

          <Field label="24. Quantas suítes pretende?" required>
            <TextInput
              name="suites_count"
              value={str("suites_count")}
              onChange={update}
              type="number"
              min={0}
              step={1}
              placeholder="N.º de suítes"
              required
            />
          </Field>
        </div>

        <Field
          label="25. Que espaços deseja incluir?"
          required
          hint="Seleccione todos os espaços pretendidos."
        >
          <CheckboxOptions
            name="desired_spaces"
            value={arr("desired_spaces")}
            onChange={update}
            options={SPACES}
          />

          {arr("desired_spaces").includes("Outro") && (
            <Field
              label="Especifique o outro espaço"
              required
              hint="Indique o espaço adicional que pretende incluir no projecto."
            >
              <TextInput
                name="desired_spaces_other"
                value={str("desired_spaces_other")}
                onChange={update}
                placeholder="Ex.: Sala de cinema, adega, atelier..."
                required
              />
            </Field>
          )}
        </Field>

        {arr("desired_spaces").includes("Garagem") && (
          <Field label="26. Quantos carros pretende acomodar na garagem?">
            <TextInput
              name="cars_count"
              value={str("cars_count")}
              onChange={update}
              type="number"
              min={1}
              step={1}
              placeholder="Número de carros"
            />
          </Field>
        )}

        <Field
          label="27. Qual é a sua preferência para a cozinha?"
          required
        >
          <RadioOptions
            required
            name="kitchen_layout"
            value={str("kitchen_layout")}
            onChange={update}
            options={[
              "Aberta para a sala",
              "Fechada",
              "Semi-aberta",
            ]}
          />
        </Field>

        <Field label="28. Quantos pisos deseja?" required>
          <RadioOptions
            required
            name="floor_count"
            value={str("floor_count")}
            onChange={update}
            options={[
              "Rés-do-chão",
              "1 andar",
              "Outro",
            ]}
          />

          {str("floor_count") === "Outro" && (
            <Field
              label="Especifique o número ou tipo de pisos"
              required
              hint="Indique a configuração pretendida."
            >
              <TextInput
                name="floor_count_other"
                value={str("floor_count_other")}
                onChange={update}
                placeholder="Ex.: 2 pisos, cave e rés-do-chão..."
                required
              />
            </Field>
          )}
        </Field>

        <Field label="29. Há algum espaço indispensável que não foi listado?">
          <TextArea
            name="essential_space"
            value={str("essential_space")}
            onChange={update}
            placeholder="Descreva outros espaços ou necessidades..."
          />
        </Field>
      </>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Step 5 — Aesthetics and preferences                                      */
  /* ------------------------------------------------------------------------ */

  function renderPreferences() {
    return (
      <>
        <Field
          label="34. Que estilos arquitectónicos lhe agradam?"
          required
          hint="Pode seleccionar mais do que um estilo. Se escolher Outro, poderá especificá-lo."
        >
          <ArchitecturalStyleOptions
            value={arr("architectural_style")}
            onChange={update}
            otherValue={str("architectural_style_other")}
            onOtherValueChange={update}
          />
        </Field>

        <Field label="35. Cores e materiais de que gosta ou não gosta">
          <TextArea
            name="colour_material_preferences"
            value={str("colour_material_preferences")}
            onChange={update}
            placeholder="Cores, revestimentos, materiais, acabamentos..."
          />
        </Field>

        <Field
          label="36. Quanto valoriza a luz natural e a ligação com o exterior?"
          required
        >
          <Rating
            required
            name="natural_light_rating"
            value={str("natural_light_rating")}
            onChange={update}
            low="1 · Pouco"
            high="5 · Muito"
          />
        </Field>

        <Field
          label="37. Quanto valoriza a privacidade em relação à rua e aos vizinhos?"
          required
        >
          <Rating
            required
            name="privacy_rating"
            value={str("privacy_rating")}
            onChange={update}
            low="1 · Pouco"
            high="5 · Muito"
          />
        </Field>

        <Field
          label="38. Imagens ou links de referência"
          hint="Pode indicar links do Pinterest, Instagram ou outras referências. Também pode anexar imagens e PDFs."
        >
          <TextArea
            name="reference_links"
            value={str("reference_links")}
            onChange={update}
            placeholder="Cole aqui os links de referência..."
            rows={3}
          />

          <FileUploader
            files={files}
            onChange={setFiles}
            note={`Máximo de ${MAX_FILES} ficheiros no total, ${MAX_FILE_MB} MB cada.`}
          />
        </Field>

        <Field label="39. Há algo importante que não perguntámos?">
          <TextArea
            name="other_information"
            value={str("other_information")}
            onChange={update}
            placeholder="Partilhe qualquer outra informação importante..."
          />
        </Field>

        <label className="flex items-start gap-2.5 text-xs leading-relaxed text-[#62696e]">
          <input
            type="checkbox"
            name="privacy_consent"
            value="true"
            required
            className="mt-[3px] accent-[#002950]"
          />

          <span>
            Autorizo a PRO SOTA a utilizar estas informações para
            analisar e dar seguimento ao meu pedido de projecto.
          </span>
        </label>

        {/* Honeypot anti-spam field */}
        <div
          className="absolute left-[-10000px] h-px w-px overflow-hidden"
          aria-hidden="true"
        >
          <label>
            Deixe este campo vazio

            <input
              name="website"
              tabIndex={-1}
              autoComplete="off"
            />
          </label>
        </div>
      </>
    );
  }

  function formatBudget(value: string) {
    if (!value) return "";

    const number = Number(value);

    if (!Number.isFinite(number)) return "";

    return new Intl.NumberFormat("pt-AO", {
      maximumFractionDigits: 0,
    }).format(number);
  }

  function renderInvestment() {
    const budget = str("budget");

    return (
      <Field
        label="33. Qual é o orçamento previsto para o projecto?"
        required
        hint="Indique o orçamento aproximado que prevê investir no projecto."
      >
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            name="budget"
            value={formatBudget(budget)}
            onChange={(event) => {
              const rawValue = event.target.value.replace(/\D/g, "");

              update("budget", rawValue);
            }}
            placeholder="0"
            autoComplete="off"
            className="
                        w-full h-14
                        rounded-xl
                        border border-[#DCDCD6]
                        bg-white
                        pl-5 pr-20
                        text-lg font-medium
                        tracking-tight
                        text-[#002950]
                        outline-none
                        transition-all duration-200
                        placeholder:text-[#B8B8B1]
                        hover:border-[#BD9655]
                        focus:border-[#BD9655]
                        focus:ring-4 focus:ring-[#BD9655]/10
                    "
          />

          <div className="
                    pointer-events-none
                    absolute inset-y-0 right-0
                    flex items-center
                    pr-5
                ">
            <span className="
                        text-sm font-semibold
                        text-[#8B8B83]
                    ">
              Kz
            </span>
          </div>
        </div>

        <p className="mt-2 text-xs text-[#85857D]">
          {budget
            ? `Orçamento indicado: ${formatBudget(budget)} Kz`
            : "Introduza o valor em kwanzas angolanos."}
        </p>
      </Field>
    );
  }
  function renderScopeAndPlanning() {
    return (
      <>
        <Field
          label="30. Que serviços pretende contratar?"
          required
          hint="Seleccione o âmbito de intervenção que melhor corresponde às suas necessidades."
        >
          <RadioOptions
            required
            name="service_scope"
            value={str("service_scope")}
            onChange={update}
            options={SERVICE_SCOPE_OPTIONS}
          />
        </Field>

        <Field
          label="31. Quais são as três prioridades mais importantes para o seu projecto?"
          required
          hint={`Seleccione exactamente três prioridades. ${arr("project_priorities").length}/3 seleccionadas.`}
        >
          <CheckboxOptions
            name="project_priorities"
            value={arr("project_priorities")}
            options={PROJECT_PRIORITIES}
            onChange={(name, selected) => {
              if (selected.length <= 3) {
                update(name, selected);
                setError("");
              } else {
                setError(
                  "Seleccione apenas três prioridades para o projecto."
                );
              }
            }}
          />

          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#ecebe7]">
              <div
                className="h-full rounded-full bg-[#BD9655] transition-all"
                style={{
                  width: `${(arr("project_priorities").length / 3) * 100}%`,
                }}
              />
            </div>

            <span className="text-xs font-semibold tabular-nums text-[#002950]">
              {arr("project_priorities").length}/3
            </span>
          </div>
        </Field>

        <Field
          label="32. Quando pretende iniciar a construção?"
          required
        >
          <RadioOptions
            required
            name="construction_start"
            value={str("construction_start")}
            onChange={update}
            options={CONSTRUCTION_START_OPTIONS}
          />
        </Field>
      </>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Render current step                                                      */
  /* ------------------------------------------------------------------------ */

  function renderStep() {
    switch (step) {
      case 0:
        return renderPersonalDetails();

      case 1:
        return renderLandDetails();

      case 2:
        return renderLifestyle();

      case 3:
        return renderArchitecturalProgramme();

      case 4:
        return renderScopeAndPlanning();

      case 5:
        return renderInvestment();

      case 6:
        return renderPreferences();

      default:
        return null;
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Success screen                                                           */
  /* ------------------------------------------------------------------------ */

  if (success) {
    return (
      <main className={pageCls}>
        <section className="mx-auto my-[12vh] max-w-[620px] rounded-lg border border-[#e9e7e1] bg-white p-[clamp(28px,6vw,64px)] text-center">
          <div className={`mb-10 block ${brandCls}`}>
            PRO <span className="text-[#BD9655]">SOTA</span>
          </div>

          <div
            className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full bg-[#edf5ef] text-2xl text-[#2f7045]"
            aria-hidden="true"
          >
            ✓
          </div>

          <p className={`${eyebrowCls} mb-[13px] text-[#8b6a2f]`}>
            BRIEF RESIDENCIAL
          </p>

          <h1 className="mb-4 mt-2.5 text-[clamp(30px,4vw,42px)] font-semibold text-[#002950]">
            Obrigado pela sua confiança.
          </h1>

          <p className="mx-auto mb-[25px] max-w-[470px] text-[15px] leading-[1.75] text-[#636b70]">
            Recebemos as informações do seu projecto. A nossa
            equipa irá analisar o brief e entrará em contacto
            consigo através do meio indicado.
          </p>

          <a className={btnPrimary} href="/">
            Voltar ao início
          </a>
        </section>
      </main>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Main page                                                                */
  /* ------------------------------------------------------------------------ */

  return (
    <main className={pageCls}>
      <div className="mx-auto max-w-[980px]">

        {/* Header */}
        <header className="flex h-[68px] items-center justify-between border-b border-[#e7e5df] sm:h-[82px]">
          <Link
            href="/management"
            aria-label="Ir para a visão geral"
          >
            <Image
              src="/images/logo.png"
              alt="Pro-Sota"
              width={150}
              height={60}
              priority
              className="h-auto max-w-full object-contain"
            />
          </Link>
        </header>

        {/* Introduction */}
        <section className="max-w-[680px] pb-[25px] pt-[38px] sm:pb-8 sm:pt-[52px]">
          <p className={`${eyebrowCls} mb-[13px] text-[#8b6a2f]`}>
            ARQUITECTURA
          </p>

          <h1 className="mb-4 text-[clamp(32px,5vw,48px)] font-semibold leading-[1.1] tracking-[-0.8px] text-[#002950] sm:tracking-[-1.6px]">
            Vamos dar forma ao seu projecto.
          </h1>

          <p className="max-w-[640px] text-base leading-[1.75] text-[#62696e]">
            Este brief ajuda-nos a compreender o seu terreno, a
            sua família e a forma como imagina viver. Reserve
            alguns minutos para responder às perguntas.
          </p>
        </section>

        {/* Form card */}
        <section className="rounded-lg border border-[#e9e7e1] bg-white px-[17px] py-[22px] shadow-[0_8px_32px_rgba(0,41,80,0.035)] sm:p-[clamp(22px,4vw,42px)]">

          {/* Step heading */}
          <div className="flex items-start justify-between gap-5">
            <div>
              <span className={`${eyebrowCls} text-[#6b6f72]`}>
                ETAPA {step + 1} DE {STEPS.length}
              </span>

              <h2
                ref={headingRef}
                tabIndex={-1}
                className="mb-[7px] mt-[9px] text-[22px] font-semibold text-[#002950] outline-none sm:text-[25px]"
              >
                {STEPS[step].title}
              </h2>

              <p className="text-sm leading-normal text-[#656b70]">
                {STEPS[step].description}
              </p>
            </div>

            <span className="pt-[3px] text-sm font-bold text-[#002950]">
              {progress}%
            </span>
          </div>

          {/* Progress bar */}
          <div
            className="my-[25px] h-1 overflow-hidden rounded-lg bg-[#ecebe7]"
            role="progressbar"
            aria-label="Progresso do formulário"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="h-full bg-[#BD9655] transition-[width] duration-300 motion-reduce:transition-none"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          {/* Step navigation */}
          <nav
            className="mb-7 grid grid-cols-4 gap-2 sm:mb-[34px] sm:grid-cols-7 sm:gap-2"
            aria-label="Etapas do formulário"
          >
            {STEPS.map((item, index) => {
              const active = index === step;
              const done = index < step;

              return (
                <button
                  type="button"
                  key={item.title}
                  onClick={() => {
                    if (done) goBack(index);
                  }}
                  disabled={index > step || pending}
                  aria-current={active ? "step" : undefined}
                  aria-label={`Etapa ${index + 1}: ${item.title}`}
                  className={`flex flex-col items-center gap-2 border-0 bg-transparent p-0 disabled:cursor-default ${done ? "cursor-pointer" : ""
                    } ${active
                      ? "font-bold text-[#002950]"
                      : "text-[#6f7376]"
                    } ${focusOutline}`}
                >
                  <span
                    className={`grid h-[27px] w-[27px] place-items-center rounded-full border text-xs sm:h-[30px] sm:w-[30px] ${active || done
                      ? "border-[#002950] bg-[#002950] text-white"
                      : "border-[#d9d9d4] bg-white"
                      }`}
                  >
                    {done ? "✓" : index + 1}
                  </span>

                  <small className="text-center text-[9px] leading-[1.3] sm:text-[11px]">
                    {item.title}
                  </small>
                </button>
              );
            })}
          </nav>

          {/* Form */}
          <form
            id="project-brief-form"
            onSubmit={handleSubmit}
            noValidate={false}
          >
            <div className="flex flex-col gap-[25px]">
              {renderStep()}
            </div>

            {/* Errors */}
            {error && (
              <div
                className="mt-[18px] rounded border border-[#e7b8b2] bg-[#fff2f0] px-3.5 py-3 text-[13px] leading-relaxed text-[#8d2f25]"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-[34px] flex flex-col items-start justify-between gap-4 border-t border-[#ecebe7] pt-[22px] sm:flex-row sm:items-center">
              <span className="text-[11px] text-[#6f757a]">
                <span className="text-[#8b6a2f]">*</span>{" "}
                Campos obrigatórios
              </span>

              <div className="flex w-full items-center justify-end gap-2.5 sm:w-auto">
                {step > 0 && (
                  <button
                    className={btnSecondary}
                    type="button"
                    onClick={() => goBack(step - 1)}
                    disabled={pending}
                  >
                    Anterior
                  </button>
                )}

                {isLast ? (
                  <button
                    className={btnPrimary}
                    type="submit"
                    disabled={pending}
                  >
                    {pending ? (
                      <>
                        <span
                          className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                          aria-hidden="true"
                        />
                        A enviar...
                      </>
                    ) : (
                      <>
                        Enviar brief
                        <span aria-hidden="true">→</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    className={btnPrimary}
                    type="button"
                    onClick={goNext}
                    disabled={pending}
                  >
                    Continuar
                    <span aria-hidden="true">→</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        </section>

        {/* Footer */}
        <footer className="flex flex-col justify-between gap-3 pt-[25px] text-[11px] text-[#6f757a] sm:flex-row">
          <span className="font-extrabold tracking-[1.5px] text-[#002950]">
            PRO SOTA
          </span>

          <span>
            Arquitectura · Engenharia · Construção
          </span>
        </footer>
      </div>
    </main>
  );
}