import { User } from "lucide-react";
import { CLIENT_TYPE_LABELS, sectionClass } from "./client_form";
import type { FieldChangeEvent } from "./client";

interface ClientTypeSectionProps {
  clientType: string;
  onChange: (e: FieldChangeEvent) => void;
}

export default function ClientTypeSection({
  clientType,
  onChange,
}: ClientTypeSectionProps) {
  return (
    <div className={sectionClass}>
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
          <User size={20} className="text-slate-600" />
        </div>
        <h2 className="text-base font-semibold text-slate-900">
          Tipo de Cliente
        </h2>
      </div>

      <div className="px-6 py-5">
        <div className="inline-flex gap-1.5 rounded-lg bg-slate-100 p-1.5">
          {Object.keys(CLIENT_TYPE_LABELS).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() =>
                onChange({ target: { name: "client_type", value: t } })
              }
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                clientType === t
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {CLIENT_TYPE_LABELS[t as keyof typeof CLIENT_TYPE_LABELS]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
