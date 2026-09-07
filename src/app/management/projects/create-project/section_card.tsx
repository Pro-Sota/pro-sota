"use client";
export function SectionCard({
  id, refCb, icon: Icon, title, description, children,
}: {
  id: string;
  refCb: (el: HTMLDivElement | null) => void;
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      ref={refCb}
      className="scroll-mt-8 rounded-2xl border border-slate-200 bg-white p-7"
    >
      <div className="mb-6 flex items-start gap-3 border-b border-slate-100 pb-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1B3A5C]/5 text-[#1B3A5C]">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
