import { STEPS } from "./constants";
import { createInitialValues, type BriefValues } from "./values";

const KEY = "pro-sota-brief-draft-v1";
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export function hasContent(values: BriefValues) {
  const base = createInitialValues();
  return (Object.keys(base) as (keyof BriefValues)[]).some((k) =>
    JSON.stringify(values[k]) !== JSON.stringify(base[k])
  );
}

export function loadDraft(): { values: BriefValues; step: number } | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as {
      savedAt?: number;
      step?: number;
      values?: Record<string, unknown>;
    };

    if (!parsed.savedAt || !parsed.values || Date.now() - parsed.savedAt > MAX_AGE) {
      localStorage.removeItem(KEY);
      return null;
    }

    const base = createInitialValues();
    const merged: Record<string, unknown> = { ...base };

    for (const key of Object.keys(base) as (keyof BriefValues)[]) {
      const incoming = parsed.values[key];
      const ok = Array.isArray(base[key])
        ? Array.isArray(incoming) && incoming.every((i) => typeof i === "string")
        : typeof incoming === "string";
      if (ok) merged[key] = incoming;
    }

    const values = merged as BriefValues;
    if (!hasContent(values)) return null;

    const step = Math.min(Math.max(0, Number(parsed.step) || 0), STEPS.length - 1);
    return { values, step };
  } catch {
    return null;
  }
}

export function saveDraft(values: BriefValues, step: number) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ savedAt: Date.now(), step, values }));
  } catch {
    /* storage unavailable or full: ignore */
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}