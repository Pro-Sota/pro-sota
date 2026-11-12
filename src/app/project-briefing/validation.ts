import { GARAGE, MAX_PRIORITIES, OTHER } from "./constants";
import type { BriefValues } from "./values";

export type Issue = { field: string; message: string };
export type StepIssue = Issue & { step: number };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+\d\s()-]{7,20}$/;
const MAX_TEXT = 5000;

const filled = (v: string) => v.trim() !== "";
const isInt = (v: string, min: number) =>
  /^\d+$/.test(v) && Number.isSafeInteger(Number(v)) && Number(v) >= min;
const isNonNegative = (v: string) =>
  Number.isFinite(Number(v)) && Number(v) >= 0;

export function isValidCoordinate(lat: number, lng: number) {
  return (
    Number.isFinite(lat) && Number.isFinite(lng) &&
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
  );
}

function missing(v: BriefValues, fields: [keyof BriefValues, string][]): Issue | null {
  for (const [key, label] of fields) {
    const value = v[key];
    const empty = Array.isArray(value) ? value.length === 0 : !value.trim();
    if (empty) return { field: key, message: `Campo obrigatório em falta: ${label}.` };
  }
  return null;
}

export function validateStep(step: number, v: BriefValues): Issue | null {
  switch (step) {
    case 0:
      return (
        missing(v, [
          ["full_name", "nome completo"],
          ["contact_phone", "contacto telefónico"],
          ["contact_email", "endereço de e-mail"],
          ["decision_makers", "quem toma as decisões"],
          ["preferred_contact", "melhor forma de contacto"],
        ]) ??
        (!PHONE.test(v.contact_phone.trim())
          ? { field: "contact_phone", message: "Indique um contacto telefónico válido." }
          : null) ??
        (!EMAIL.test(v.contact_email.trim())
          ? { field: "contact_email", message: "Indique um endereço de e-mail válido." }
          : null)
      );

    case 1: {
      const hasText = [
        v.location_address, v.location_neighborhood, v.location_municipality,
        v.location_city, v.location_reference,
      ].some(filled);
      const hasLat = filled(v.latitude);
      const hasLng = filled(v.longitude);

      if (hasLat !== hasLng)
        return { field: "location_address", message: "Seleccione uma localização válida no mapa." };
      if (hasLat && !isValidCoordinate(Number(v.latitude), Number(v.longitude)))
        return { field: "location_address", message: "As coordenadas seleccionadas não são válidas." };
      if (!hasText && !hasLat)
        return {
          field: "location_address",
          message: "Indique pelo menos o endereço, o bairro, o município ou seleccione a localização no mapa.",
        };

      const missingRadio = missing(v, [
        ["land_ownership", "propriedade do terreno"],
        ["land_type", "tipo de terreno"],
        ["existing_buildings", "construções existentes"],
        ["has_trees", "árvores no terreno"],
      ]);
      if (missingRadio) return missingRadio;

      for (const key of ["land_area", "land_length", "land_width"] as const) {
        if (filled(v[key]) && !isNonNegative(v[key]))
          return {
            field: key,
            message: "As dimensões do terreno devem ser números válidos e não podem ser negativas.",
          };
      }
      return null;
    }

    case 2:
      return (
        missing(v, [
          ["domestic_workers", "trabalhadores em casa"],
          ["family_growth", "crescimento da família"],
          ["works_from_home", "trabalho em casa"],
          ["visitors_frequency", "visitas e eventos"],
        ]) ??
        (!isInt(v.residents_count, 1)
          ? { field: "residents_count", message: "Indique um número inteiro válido de moradores." }
          : null) ??
        (v.domestic_workers === "yes" && filled(v.domestic_workers_count) && !isInt(v.domestic_workers_count, 1)
          ? { field: "domestic_workers_count", message: "Indique um número inteiro válido de trabalhadores." }
          : null)
      );

    case 3: {
      if (!isInt(v.bedrooms_count, 1))
        return { field: "bedrooms_count", message: "Indique um número inteiro válido de quartos." };
      if (!isInt(v.suites_count, 0))
        return { field: "suites_count", message: "Indique um número inteiro válido de suítes." };
      if (Number(v.suites_count) > Number(v.bedrooms_count))
        return { field: "suites_count", message: "O número de suítes não pode ser superior ao número de quartos." };
      if (v.desired_spaces.length === 0)
        return { field: "desired_spaces", message: "Seleccione pelo menos um espaço." };
      if (v.desired_spaces.includes(GARAGE) && filled(v.cars_count) && !isInt(v.cars_count, 1))
        return { field: "cars_count", message: "Indique um número inteiro válido de carros." };
      if (v.desired_spaces.includes(OTHER) && !filled(v.desired_spaces_other))
        return { field: "desired_spaces_other", message: "Especifique o outro espaço pretendido." };

      const m = missing(v, [
        ["kitchen_layout", "preferência para a cozinha"],
        ["floor_count", "número de pisos"],
      ]);
      if (m) return m;
      if (v.floor_count === OTHER && !filled(v.floor_count_other))
        return { field: "floor_count_other", message: "Especifique o número ou tipo de pisos pretendido." };
      return null;
    }

    case 4:
      return (
        missing(v, [
          ["service_scope", "serviços a contratar"],
          ["construction_start", "início da construção"],
        ]) ??
        (v.project_priorities.length !== MAX_PRIORITIES
          ? { field: "project_priorities", message: "Seleccione exactamente três prioridades para o projecto." }
          : null)
      );

    case 5: {
      if (v.budget_undisclosed === "yes") return null;
      const n = Number(v.budget);
      if (!/^\d+$/.test(v.budget) || !Number.isSafeInteger(n) || n > 9_999_999_999_999)
        return {
          field: "budget",
          message: "Indique um orçamento válido em kwanzas ou escolha discutir o orçamento mais tarde.",
        };
      return null;
    }

    case 6:
      if (v.architectural_style.length === 0)
        return { field: "architectural_style", message: "Seleccione pelo menos um estilo arquitectónico." };
      if (v.architectural_style.includes(OTHER) && !filled(v.architectural_style_other))
        return { field: "architectural_style_other", message: "Especifique o estilo arquitectónico seleccionado." };
      return missing(v, [
        ["natural_light_rating", "valorização da luz natural"],
        ["privacy_rating", "valorização da privacidade"],
      ]);

    default:
      return null;
  }
}

export function validateAll(v: BriefValues): StepIssue | null {
  for (let step = 0; step <= 6; step++) {
    const issue = validateStep(step, v);
    if (issue) return { ...issue, step };
  }
  for (const [key, value] of Object.entries(v)) {
    if (typeof value === "string" && value.length > MAX_TEXT)
      return { step: 6, field: key, message: "Um dos campos excede o tamanho máximo permitido." };
  }
  return null;
}