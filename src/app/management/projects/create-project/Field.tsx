"use client";
export function Field({
  label, required, trailing, children,
}: {
  label: string;
  required?: boolean;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="flex items-center gap-1 text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-[#E8871E]">*</span>}
        </label>
        {trailing}
      </div>
      {children}
    </div>
  );
}
