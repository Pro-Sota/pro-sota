"use client";


export function Field({
  label, required, trailing, children, for: htmlFor,
}: {
  label: string;
  for: string;
  required?: boolean;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="flex items-center gap-1 text-sm font-medium text-slate-700" htmlFor={htmlFor}>
          {label}
          {required && <span className="text-[#E8871E]">*</span>}
        </label>
        {trailing}
      </div>
      {children}
    </div>
  );
}
