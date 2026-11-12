"use client";

import { createContext, useContext, useId } from "react";
import type { ReactNode } from "react";
import Image from "next/image";

import {
  ARCHITECTURAL_STYLES,
  OTHER,
  type Option,
} from "../constants";
import type { ArrayKey, StringKey } from "../values";
import {
  focusRing,
  hintCls,
  inputCls,
  optionBase,
  optionDisabled,
  optionOff,
  optionOn,
  textareaCls,
} from "../styles";

/* ---------------------------- Contexts ---------------------------- */

type FieldCtx = { inputId?: string; describedBy?: string };
const FieldContext = createContext<FieldCtx>({});
export const useFieldContext = () => useContext(FieldContext);
export const ErrorFieldContext = createContext<string | null>(null);

/* ------------------------------ Field ----------------------------- */

export function Field({
  label,
  required,
  hint,
  group = false,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  /** Use for radios, checkboxes, ratings and fields with several inputs. */
  group?: boolean;
  children: ReactNode;
}) {
  const uid = useId();
  const labelId = `${uid}-label`;
  const inputId = `${uid}-input`;
  const hintId = `${uid}-hint`;
  const labelCls = "text-sm font-bold leading-normal text-[#263746]";
  const star = required && (
    <span aria-hidden="true" className="text-[#8b6a2f]"> *</span>
  );

  return (
    <FieldContext.Provider
      value={{
        inputId: group ? undefined : inputId,
        describedBy: !group && hint ? hintId : undefined,
      }}
    >
      <div
        className="flex min-w-0 flex-col gap-[9px]"
        {...(group
          ? {
              role: "group",
              "aria-labelledby": labelId,
              "aria-describedby": hint ? hintId : undefined,
            }
          : {})}
      >
        {group ? (
          <div id={labelId} className={labelCls}>
            {label}
            {star}
          </div>
        ) : (
          <label id={labelId} htmlFor={inputId} className={labelCls}>
            {label}
            {star}
          </label>
        )}

        {hint && (
          <p id={hintId} className={hintCls}>
            {hint}
          </p>
        )}

        {children}
      </div>
    </FieldContext.Provider>
  );
}

/* --------------------------- Text input --------------------------- */

export function TextInput({
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
  name: StringKey;
  value: string;
  onChange: (name: StringKey, value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number | "any";
  ariaLabel?: string;
}) {
  const ctx = useFieldContext();
  const errorField = useContext(ErrorFieldContext);

  return (
    <input
      className={inputCls}
      id={ariaLabel ? name : ctx.inputId ?? name}
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
      aria-describedby={ctx.describedBy}
      aria-invalid={errorField === name || undefined}
      onChange={(e) => onChange(name, e.target.value)}
    />
  );
}

/* ----------------------------- Textarea --------------------------- */

export function TextArea({
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  name: StringKey;
  value: string;
  onChange: (name: StringKey, value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const ctx = useFieldContext();
  const errorField = useContext(ErrorFieldContext);

  return (
    <textarea
      className={textareaCls}
      id={ctx.inputId ?? name}
      name={name}
      rows={rows}
      value={value}
      placeholder={placeholder}
      aria-describedby={ctx.describedBy}
      aria-invalid={errorField === name || undefined}
      onChange={(e) => onChange(name, e.target.value)}
    />
  );
}

/* ------------------------------ Radios ---------------------------- */

export function RadioOptions({
  name,
  value,
  options,
  onChange,
  required = false,
}: {
  name: StringKey;
  value: string;
  options: Option[];
  required?: boolean;
  onChange: (name: StringKey, value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-[9px]">
      {options.map((option) => (
        <label
          key={option.value}
          className={`${optionBase} ${value === option.value ? optionOn : optionOff}`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            required={required}
            className="m-0 accent-[#002950]"
            onChange={() => onChange(name, option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

/* ---------------------------- Checkboxes -------------------------- */

export function CheckboxOptions({
  name,
  value,
  options,
  onChange,
  max,
  exclusive,
}: {
  name: ArrayKey;
  value: string[];
  options: Option[];
  onChange: (name: ArrayKey, value: string[]) => void;
  /** Once reached, unchecked options are disabled. */
  max?: number;
  /** Value that clears every other selection (e.g. "none"). */
  exclusive?: string;
}) {
  return (
    <div className="flex flex-wrap gap-[9px]">
      {options.map((option) => {
        const checked = value.includes(option.value);
        const locked = max !== undefined && value.length >= max && !checked;

        return (
          <label
            key={option.value}
            className={`${optionBase} ${checked ? optionOn : optionOff} ${locked ? optionDisabled : ""}`}
          >
            <input
              type="checkbox"
              name={name}
              value={option.value}
              checked={checked}
              disabled={locked}
              className="m-0 accent-[#002950]"
              onChange={(e) => {
                if (!e.target.checked) {
                  onChange(name, value.filter((i) => i !== option.value));
                } else if (exclusive && option.value === exclusive) {
                  onChange(name, [option.value]);
                } else {
                  onChange(name, [
                    ...value.filter((i) => i !== exclusive),
                    option.value,
                  ]);
                }
              }}
            />
            <span>{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}

/* -------------------------- Style picker -------------------------- */

export function ArchitecturalStyleOptions({
  value,
  onChange,
  otherValue,
  onOtherChange,
}: {
  value: string[];
  onChange: (name: ArrayKey, value: string[]) => void;
  otherValue: string;
  onOtherChange: (name: StringKey, value: string) => void;
}) {
  const toggle = (style: string, checked: boolean) =>
    onChange(
      "architectural_style",
      checked ? [...value, style] : value.filter((i) => i !== style)
    );

  const otherSelected = value.includes(OTHER);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ARCHITECTURAL_STYLES.map((style) => {
          const selected = value.includes(style.value);

          return (
            <label
              key={style.value}
              className={`group relative block cursor-pointer overflow-hidden rounded-lg border text-left transition-all motion-reduce:transition-none ${
                selected
                  ? "border-[#BD9655] bg-[#fbf8f2] ring-2 ring-[#BD9655]/25"
                  : "border-[#d3d5d1] bg-white hover:border-[#b8a17d]"
              } focus-within:ring-2 focus-within:ring-[#BD9655] focus-within:ring-offset-2`}
            >
              <input
                type="checkbox"
                name="architectural_style"
                value={style.value}
                checked={selected}
                onChange={(e) => toggle(style.value, e.target.checked)}
                className="peer sr-only"
              />

              <div className="relative h-[250px] bg-[#e8e7e2] sm:h-[150px]">
                <Image
                  src={style.image}
                  alt={`Exemplo de arquitectura ${style.label.toLowerCase()}`}
                  fill
                  sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 100vw"
                  className="object-cover"
                  style={{ objectPosition: style.position }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5" />

                <span
                  aria-hidden="true"
                  className={`absolute left-3 top-3 grid h-6 w-6 place-items-center rounded border text-xs font-bold transition-colors ${
                    selected
                      ? "border-[#BD9655] bg-[#BD9655] text-white"
                      : "border-white/90 bg-white text-transparent"
                  }`}
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
                <span className="block text-sm font-bold text-[#002950]">{style.label}</span>
                <span className="mt-1 block text-xs leading-relaxed text-[#6f757a]">
                  {style.description}
                </span>
              </div>
            </label>
          );
        })}
      </div>

      <label
        className={`${optionBase} ${otherSelected ? optionOn : optionOff} min-h-[54px] w-fit`}
      >
        <input
          type="checkbox"
          name="architectural_style"
          value={OTHER}
          checked={otherSelected}
          onChange={(e) => toggle(OTHER, e.target.checked)}
          className="m-0 accent-[#002950]"
        />
        <span>Outro estilo</span>
      </label>

      {otherSelected && (
        <Field
          label="Especifique o estilo arquitectónico"
          required
          hint="Descreva o estilo que tem em mente."
        >
          <TextInput
            name="architectural_style_other"
            value={otherValue}
            onChange={onOtherChange}
            placeholder="Ex.: Mediterrânico, escandinavo, colonial..."
            required
          />
        </Field>
      )}
    </div>
  );
}

/* ------------------------------ Rating ---------------------------- */

export function Rating({
  name,
  value,
  onChange,
  low,
  high,
  required = false,
}: {
  name: StringKey;
  value: string;
  onChange: (name: StringKey, value: string) => void;
  low: string;
  high: string;
  required?: boolean;
}) {
  return (
    <div className="max-w-[440px]">
      <div className="grid grid-cols-5 gap-[9px]">
        {["1", "2", "3", "4", "5"].map((n) => (
          <label
            key={n}
            className={`relative grid h-[45px] cursor-pointer place-items-center rounded border font-semibold transition-colors motion-reduce:transition-none ${focusRing} ${
              value === n
                ? "border-[#BD9655] bg-[#fbf8f2] text-[#002950] ring-1 ring-inset ring-[#BD9655]"
                : "border-[#d3d5d1] text-[#5e666c]"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={n}
              checked={value === n}
              required={required}
              className="absolute inset-0 m-0 cursor-pointer opacity-0"
              onChange={() => onChange(name, n)}
            />
            {n}
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