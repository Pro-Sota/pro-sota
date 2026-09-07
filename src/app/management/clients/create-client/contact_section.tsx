import { Mail, Phone } from "lucide-react";
import { inputClass, sectionClass, PHONE_MAX_LENGTH } from "./client_form";
import type { FieldChangeEvent, ClientInsert } from "./client";

interface ContactSectionProps {
    client: ClientInsert;
    errors: Record<string, string>;
    onChange: (e: FieldChangeEvent) => void;
    onPhoneChange: (e: FieldChangeEvent) => void;
}

export default function ContactSection({
    client,
    errors,
    onChange,
    onPhoneChange,
}: ContactSectionProps) {
    return (
        <div className={sectionClass}>
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <Mail size={20} className="text-slate-600" />
                </div>
                <h2 className="text-base font-semibold text-slate-900">Contacto</h2>
            </div>

            <div className="px-6 py-5 space-y-4">
                <div>
                    <label className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-700">
                        Email
                        <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        name="email"
                        placeholder="cliente@exemplo.com"
                        className={inputClass(!!errors.email)}
                        value={client.email || ""}
                        onChange={onChange}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>

                <div>
                    <label className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-700">
                        <Phone size={16} className="text-slate-400" />
                        Telefone
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        placeholder="+351 9 xxxx xxxx"
                        className={inputClass(!!errors.phone)}
                        value={client.phone || ""}
                        onChange={onPhoneChange}
                        maxLength={PHONE_MAX_LENGTH}
                    />
                    {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                </div>
            </div>
        </div>
    );
}