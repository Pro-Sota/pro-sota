import { FileText } from "lucide-react";
import { inputClass, sectionClass } from "./client_form";
import type { FieldChangeEvent, ClientInsert } from "./client";

const NOTES_MAX_LENGTH = 500;

interface NotesSectionProps {
  client: ClientInsert;
  onChange: (e: FieldChangeEvent) => void;
}

export default function NotesSection({
  client,
  onChange,
}: NotesSectionProps) {
  const notesLength = client.notes?.length ?? 0;

  return (
    <div className={sectionClass}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
          <FileText size={20} className="text-slate-600" />
        </div>

        <h2 className="text-base font-semibold text-slate-900">
          Notas Adicionais
        </h2>
      </div>

      <div className="px-6 py-5">
        <label
          htmlFor="notes"
          className="mb-1.5 block text-sm font-semibold text-slate-700"
        >
          Observações
        </label>

        <textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder="Informação adicional sobre este cliente..."
          className={inputClass(false)}
          value={client.notes || ""}
          onChange={onChange}
          maxLength={NOTES_MAX_LENGTH}
        />

        <div className="mt-2 flex justify-end">
          <p
            className="text-xs font-medium text-slate-600"
            aria-live="polite"
          >
            {notesLength}/{NOTES_MAX_LENGTH}
          </p>
        </div>
      </div>
    </div>
  );
}