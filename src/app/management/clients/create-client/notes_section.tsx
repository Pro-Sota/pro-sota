import { FileText } from "lucide-react";
import { inputClass, sectionClass } from "./client_form";
import type { FieldChangeEvent, ClientInsert } from "./client";

const NOTES_MAX_LENGTH = 500;

interface NotesSectionProps {
    client: ClientInsert;
    onChange: (e: FieldChangeEvent) => void;
}

export default function NotesSection({ client, onChange }: NotesSectionProps) {
    return (
        <div className={sectionClass}>
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <FileText size={20} className="text-slate-600" />
                </div>
                <h2 className="text-base font-semibold text-slate-900">Notas Adicionais</h2>
            </div>

            <div className="px-6 py-5">
                <textarea
                    name="notes"
                    rows={4}
                    placeholder="Informação adicional sobre este cliente..."
                    className={inputClass(false)}
                    value={client.notes || ""}
                    onChange={onChange}
                    maxLength={NOTES_MAX_LENGTH}
                />
                <div className="mt-2 text-right">
                    <p className="text-xs font-medium text-slate-600">
                        {client.notes?.length || 0}/{NOTES_MAX_LENGTH}
                    </p>
                </div>
            </div>
        </div>
    );
}