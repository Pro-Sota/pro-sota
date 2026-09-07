"use client";

export function CurrencyInput({
  value,
  onChangeAction,
}: {
  value: string; // raw digits
  onChangeAction: (rawDigits: string) => void;
}) {
  const currencyFormatter = new Intl.NumberFormat("pt-PT");
  const display = value ? currencyFormatter.format(Number(value)) : "";
   const inputStyle =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1B3A5C] focus:ring-2 focus:ring-[#1B3A5C]/10";

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-400">
        Kz
      </span>
      <input
        type="text"
        name="budget"
        inputMode="numeric"
        value={display}
        onChange={(e) => onChangeAction(e.target.value)}
        className={`${inputStyle} pl-10 font-mono`}
        placeholder="0" />
    </div>
  );
}
