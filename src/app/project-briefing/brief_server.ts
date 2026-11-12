import {
  ARCHITECTURAL_STYLES, CONSTRUCTION_START, DECISION_MAKERS, FAMILY_GROWTH,
  FLOOR_COUNTS, INFRASTRUCTURES, KITCHEN_LAYOUTS, LAND_OWNERSHIP, LAND_TYPES,
  OTHER, PREFERRED_CONTACT, PROJECT_PRIORITIES, SERVICE_SCOPES, SPACES,
  VISITORS, WORKS_FROM_HOME, YES_NO, MAX_FILES, MAX_FILE_SIZE,
  type Option,
} from "./constants";
import { createInitialValues, type BriefValues } from "./values";
import { validateAll } from "./validation";

const ascii = (b: Uint8Array, from: number, to: number) =>
  String.fromCharCode(...b.slice(from, to));

/** Detects the real type from magic bytes instead of trusting file.type. */
export async function sniffFileType(file: File): Promise<string | null> {
  const b = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const starts = (...bytes: number[]) => bytes.every((x, i) => b[i] === x);

  if (starts(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  if (starts(0x25, 0x50, 0x44, 0x46)) return "application/pdf";
  if (ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP") return "image/webp";
  if (ascii(b, 4, 8) === "ftyp" && /^(heic|heix|hevc|heim|heis|mif1|msf1)/.test(ascii(b, 8, 12)))
    return "image/heic";
  return null;
}

export function parseBrief(formData: FormData): BriefValues {
  const base = createInitialValues();
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(base) as (keyof BriefValues)[]) {
    out[key] = Array.isArray(base[key])
      ? formData.getAll(key).filter((v): v is string => typeof v === "string").map((v) => v.trim())
      : String(formData.get(key) ?? "").trim();
  }
  return out as BriefValues;
}

/* ----------------------- Allowed-option checks ----------------------- */

const styleOptions: Option[] = [
  ...ARCHITECTURAL_STYLES.map((s) => ({ value: s.value, label: s.label })),
  { value: OTHER, label: "Outro" },
];

const SINGLE: [keyof BriefValues, Option[]][] = [
  ["decision_makers", DECISION_MAKERS],
  ["preferred_contact", PREFERRED_CONTACT],
  ["land_ownership", LAND_OWNERSHIP],
  ["land_type", LAND_TYPES],
  ["existing_buildings", YES_NO],
  ["has_trees", YES_NO],
  ["domestic_workers", YES_NO],
  ["family_growth", FAMILY_GROWTH],
  ["works_from_home", WORKS_FROM_HOME],
  ["visitors_frequency", VISITORS],
  ["kitchen_layout", KITCHEN_LAYOUTS],
  ["floor_count", FLOOR_COUNTS],
  ["service_scope", SERVICE_SCOPES],
  ["construction_start", CONSTRUCTION_START],
];

const MULTI: [keyof BriefValues, Option[]][] = [
  ["infrastructure", INFRASTRUCTURES],
  ["desired_spaces", SPACES],
  ["project_priorities", PROJECT_PRIORITIES],
  ["architectural_style", styleOptions],
];

function checkOptions(v: BriefValues): string | null {
  for (const [key, options] of SINGLE) {
    const value = v[key] as string;
    if (value !== "" && !options.some((o) => o.value === value)) return "Foi enviado um valor inválido.";
  }
  for (const [key, options] of MULTI) {
    const list = v[key] as string[];
    if (list.some((x) => !options.some((o) => o.value === x))) return "Foi enviado um valor inválido.";
  }
  for (const key of ["natural_light_rating", "privacy_rating"] as const) {
    if (!/^[1-5]$/.test(v[key])) return "Foi enviado um valor inválido.";
  }
  if (v.budget_undisclosed !== "" && v.budget_undisclosed !== "yes") return "Foi enviado um valor inválido.";
  return null;
}

/* ----------------------------- Rate limit ---------------------------- */

/** Cheap in-memory limiter. On serverless, use Redis/Upstash instead. */
const hits = new Map<string, number[]>();
export function rateLimited(key: string, limit = 5, windowMs = 60 * 60 * 1000) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > limit;
}

/* ------------------------------- Check ------------------------------- */

export async function checkBrief(formData: FormData): Promise<
  { ok: true; values: BriefValues; land: File[]; reference: File[] } | { ok: false; error: string }
> {
  if (String(formData.get("website") ?? "") !== "") return { ok: false, error: "Pedido inválido." };

  const startedAt = Number(formData.get("form_started_at"));
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 5000)
    return { ok: false, error: "Pedido inválido. Tente novamente." };

  if (formData.get("privacy_consent") !== "true")
    return { ok: false, error: "É necessário aceitar o consentimento para enviar o pedido." };

  const values = parseBrief(formData);

  const optionError = checkOptions(values);
  if (optionError) return { ok: false, error: optionError };

  const issue = validateAll(values);
  if (issue) return { ok: false, error: issue.message };

  const toFiles = (key: string) =>
    formData.getAll(key).filter((f): f is File => f instanceof File && f.size > 0);
  const land = toFiles("land_attachments");
  const reference = toFiles("reference_attachments");

  for (const list of [land, reference]) {
    if (list.length > MAX_FILES) return { ok: false, error: "Demasiados ficheiros anexados." };
    for (const file of list) {
      if (file.size > MAX_FILE_SIZE) return { ok: false, error: `"${file.name}" é demasiado grande.` };
    }
  }

  return { ok: true, values, land, reference };
}