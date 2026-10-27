"use client";

import {
    Bell,
    CalendarDays,
    Check,
    CircleAlert,
    LoaderCircle,
    RotateCcw,
    Save,
    Settings2,
} from "lucide-react";
import { useState, useTransition } from "react";

import { saveSettingsAction } from "@/actions/settings";

import type {
    ManagementSettings,
    SettingsSection,
    SettingsValue,
} from "@/services/settings";

type Props = {
    initialSettings: ManagementSettings;
    /** Settings are personal (one row per profile). Only set to false to force read-only. */
    canManage?: boolean;
};

/* -------------------------------------------------------------------------- */
/*  Definitions (mirror public.user_settings)                                 */
/* -------------------------------------------------------------------------- */

const TABS: {
    id: SettingsSection;
    label: string;
    description: string;
    icon: typeof Settings2;
}[] = [
    {
        id: "company",
        label: "Geral",
        description: "Idioma, tema, fuso horário e apresentação.",
        icon: Settings2,
    },
    {
        id: "calendar",
        label: "Calendário",
        description: "Vista predefinida, duração das reuniões e lembretes.",
        icon: CalendarDays,
    },
    {
        id: "notifications",
        label: "Notificações",
        description: "Escolha o que pretende receber e por que canal.",
        icon: Bell,
    },
];

type FieldDefinition = {
    key: string;
    label: string;
    description?: string;
    type: "select" | "toggle" | "number";
    group?: string;
    options?: { label: string; value: string }[];
    min?: number;
    max?: number;
    unit?: string;
};

const FIELDS: Record<SettingsSection, FieldDefinition[]> = {
    company: [
        {
            key: "language",
            label: "Idioma",
            description: "Idioma utilizado na aplicação.",
            type: "select",
            options: [
                { label: "Português (Portugal)", value: "pt-PT" },
                { label: "Português (Angola)", value: "pt-AO" },
                { label: "English", value: "en" },
            ],
        },
        {
            key: "theme",
            label: "Tema",
            description: "Escolha a aparência da aplicação.",
            type: "select",
            options: [
                { label: "Claro", value: "light" },
                { label: "Escuro", value: "dark" },
                { label: "Sistema", value: "system" },
            ],
        },
        {
            key: "timezone",
            label: "Fuso horário",
            description: "Usado para apresentar datas e horas.",
            type: "select",
            options: [
                { label: "Luanda (UTC+01:00)", value: "Africa/Luanda" },
                { label: "Lisboa", value: "Europe/Lisbon" },
                { label: "Londres", value: "Europe/London" },
            ],
        },
        {
            key: "compact_mode",
            label: "Modo compacto",
            description: "Reduz o espaçamento para mostrar mais conteúdo.",
            type: "toggle",
        },
    ],
    calendar: [
        {
            key: "calendar_default_view",
            label: "Visualização predefinida",
            description: "Vista apresentada ao abrir o calendário.",
            type: "select",
            options: [
                { label: "Dia", value: "day" },
                { label: "Semana", value: "week" },
                { label: "Mês", value: "month" },
                { label: "Agenda", value: "agenda" },
            ],
        },
        {
            key: "calendar_default_meeting_duration",
            label: "Duração predefinida das reuniões",
            description: "Entre 5 e 480 minutos.",
            type: "number",
            min: 5,
            max: 480,
            unit: "min",
        },
        {
            key: "calendar_reminder_minutes",
            label: "Antecedência do lembrete",
            description: "Entre 0 e 10 080 minutos (7 dias). Use 0 para avisar à hora do evento.",
            type: "number",
            min: 0,
            max: 10080,
            unit: "min",
        },
    ],
    notifications: [
        {
            key: "notify_messages",
            label: "Mensagens",
            description: "Quando recebe uma nova mensagem.",
            type: "toggle",
            group: "Actividade",
        },
        {
            key: "notify_mentions",
            label: "Menções",
            description: "Quando alguém o menciona.",
            type: "toggle",
            group: "Actividade",
        },
        {
            key: "notify_task_assignments",
            label: "Atribuição de tarefas",
            description: "Quando lhe atribuem uma tarefa.",
            type: "toggle",
            group: "Actividade",
        },
        {
            key: "notify_deadlines",
            label: "Prazos e datas limite",
            description: "Lembretes de prazos e entregas.",
            type: "toggle",
            group: "Actividade",
        },
        {
            key: "notify_approvals",
            label: "Aprovações",
            description: "Quando existem aprovações pendentes.",
            type: "toggle",
            group: "Actividade",
        },
        {
            key: "notify_project_updates",
            label: "Actualizações de projectos",
            description: "Alterações nos projectos em que participa.",
            type: "toggle",
            group: "Actividade",
        },
        {
            key: "notify_attendance",
            label: "Presença",
            description: "Avisos relacionados com a sua presença.",
            type: "toggle",
            group: "Actividade",
        },
        {
            key: "notify_email",
            label: "Notificações por e-mail",
            description: "Receber também as notificações por e-mail.",
            type: "toggle",
            group: "Canais",
        },
    ],
    projects: [],
    team: [],
    attendance: [],
    system: [],
};

/** Same defaults as the database columns. */
const DEFAULTS: Record<string, string | number | boolean> = {
    language: "pt-PT",
    theme: "system",
    timezone: "Africa/Luanda",
    compact_mode: false,
    notify_messages: true,
    notify_mentions: true,
    notify_task_assignments: true,
    notify_deadlines: true,
    notify_approvals: true,
    notify_project_updates: true,
    notify_attendance: true,
    notify_email: false,
    calendar_default_view: "month",
    calendar_default_meeting_duration: 60,
    calendar_reminder_minutes: 15,
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

type Values = Record<string, string | number | boolean | null | undefined>;

function getValue(values: Values, key: string) {
    const v = values?.[key];
    return v === undefined || v === null ? DEFAULTS[key] : v;
}

/** Keep only the columns that belong to this section (no profile_id, timestamps...). */
function pickSection(section: SettingsSection, values: Values) {
    const out: Record<string, string | number | boolean> = {};
    for (const field of FIELDS[section]) {
        out[field.key] = getValue(values, field.key) as string | number | boolean;
    }
    return out;
}

function validateNumber(field: FieldDefinition, raw: string): string | null {
    if (raw.trim() === "") return "Introduza um valor.";
    const n = Number(raw);
    if (!Number.isInteger(n)) return "Introduza um número inteiro.";
    if (field.min !== undefined && n < field.min)
        return `O valor mínimo é ${field.min}.`;
    if (field.max !== undefined && n > field.max)
        return `O valor máximo é ${field.max}.`;
    return null;
}

const inputBase =
    "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-[#BD9655] focus:ring-4 focus:ring-[#BD9655]/15 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function SettingsTabs({
    initialSettings,
    canManage = true,
}: Props) {
    const [activeTab, setActiveTab] = useState<SettingsSection>("company");
    const [settings, setSettings] = useState<ManagementSettings>(initialSettings);
    const [savedSettings, setSavedSettings] =
        useState<ManagementSettings>(initialSettings);

    // Raw text typed into number inputs + validation errors (by field key)
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [isPending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    const disabled = isPending || !canManage;

    function sectionIsDirty(section: SettingsSection) {
        const current = settings[section] as Values;
        const saved = savedSettings[section] as Values;
        return FIELDS[section].some(
            (f) => getValue(current, f.key) !== getValue(saved, f.key)
        );
    }

    const currentValues = settings[activeTab] as Values;
    const isDirty = sectionIsDirty(activeTab);
    const hasErrors = FIELDS[activeTab].some((f) => errors[f.key]);

    function clearSectionDrafts(section: SettingsSection) {
        const keys = FIELDS[section].map((f) => f.key);
        setDrafts((prev) =>
            Object.fromEntries(Object.entries(prev).filter(([k]) => !keys.includes(k)))
        );
        setErrors((prev) =>
            Object.fromEntries(Object.entries(prev).filter(([k]) => !keys.includes(k)))
        );
    }

    function updateValue(key: string, value: string | number | boolean) {
        setSettings((previous) => ({
            ...previous,
            [activeTab]: {
                ...previous[activeTab],
                [key]: value,
            },
        }));
        setFeedback(null);
    }

    function updateNumber(field: FieldDefinition, raw: string) {
        setDrafts((prev) => ({ ...prev, [field.key]: raw }));

        const error = validateNumber(field, raw);
        setErrors((prev) => {
            const next = { ...prev };
            if (error) next[field.key] = error;
            else delete next[field.key];
            return next;
        });

        if (!error) updateValue(field.key, Number(raw));
        else setFeedback(null);
    }

    function save() {
        if (hasErrors || !canManage) return;

        const section = activeTab;
        const values = pickSection(section, settings[section] as Values) as SettingsValue;

        startTransition(async () => {
            try {
                const result = await saveSettingsAction(section, values);

                setFeedback({ success: result.success, message: result.message });

                if (result.success) {
                    setSavedSettings((previous) => ({
                        ...previous,
                        [section]: { ...previous[section], ...values },
                    }));
                    clearSectionDrafts(section);
                }
            } catch {
                setFeedback({
                    success: false,
                    message: "Não foi possível guardar as alterações.",
                });
            }
        });
    }

    function discardChanges() {
        setSettings((previous) => ({
            ...previous,
            [activeTab]: { ...savedSettings[activeTab] },
        }));
        clearSectionDrafts(activeTab);
        setFeedback(null);
    }

    const active = TABS.find((tab) => tab.id === activeTab)!;
    const ActiveIcon = active.icon;
    const fields = FIELDS[activeTab];

    return (
        <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:py-10">
            {/* Page header */}
            <header className="space-y-1.5">
                <h1 className="text-2xl font-semibold tracking-tight text-[#002950] sm:text-3xl">
                    Definições
                </h1>
                <p className="max-w-xl text-sm leading-6 text-gray-500">
                    Gira as suas preferências pessoais no Pro-Sota. As alterações
                    aplicam-se apenas à sua conta.
                </p>
            </header>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8">
                {/* Navigation */}
                <nav
                    aria-label="Categorias das definições"
                    className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 lg:sticky lg:top-6 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0"
                >
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const selected = activeTab === tab.id;
                        const dirty = sectionIsDirty(tab.id);

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setFeedback(null);
                                }}
                                aria-current={selected ? "page" : undefined}
                                className={`group flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm outline-none transition focus-visible:ring-4 focus-visible:ring-[#BD9655]/25 lg:w-full ${
                                    selected
                                        ? "bg-white font-medium text-[#002950] shadow-sm ring-1 ring-gray-200"
                                        : "text-gray-600 hover:bg-white/70 hover:text-[#002950]"
                                }`}
                            >
                                <span
                                    className={`grid size-8 shrink-0 place-items-center rounded-lg transition ${
                                        selected
                                            ? "bg-[#002950] text-white"
                                            : "bg-gray-100 text-gray-500 group-hover:bg-gray-200/70"
                                    }`}
                                >
                                    <Icon size={16} />
                                </span>

                                <span className="flex-1 whitespace-nowrap">
                                    {tab.label}
                                </span>

                                {dirty && (
                                    <span
                                        className="size-2 shrink-0 rounded-full bg-[#BD9655]"
                                        title="Alterações por guardar"
                                    >
                                        <span className="sr-only">
                                            Alterações por guardar
                                        </span>
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Panel */}
                <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-start gap-4 border-b border-gray-100 px-5 py-6 sm:px-8">
                        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#002950]/[0.06]">
                            <ActiveIcon size={20} className="text-[#002950]" />
                        </div>

                        <div className="min-w-0 space-y-1">
                            <h2 className="text-base font-semibold text-gray-900">
                                {active.label}
                            </h2>
                            <p className="text-sm leading-6 text-gray-500">
                                {active.description}
                            </p>
                        </div>
                    </div>

                    <div className="px-5 sm:px-8">
                        {fields.map((field, index) => {
                            const value = getValue(currentValues, field.key);
                            const error = errors[field.key];
                            const showGroup =
                                field.group && field.group !== fields[index - 1]?.group;
                            const labelId = `label-${field.key}`;
                            const descId = `desc-${field.key}`;
                            const errorId = `error-${field.key}`;

                            return (
                                <div key={field.key}>
                                    {showGroup && (
                                        <h3
                                            className={`pb-1 text-xs font-semibold text-gray-400 ${
                                                index === 0 ? "pt-6" : "pt-8"
                                            }`}
                                        >
                                            {field.group}
                                        </h3>
                                    )}

                                    <div
                                        className={`grid grid-cols-1 gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_280px] sm:items-center sm:gap-8 ${
                                            index > 0 && !showGroup
                                                ? "border-t border-gray-100"
                                                : ""
                                        }`}
                                    >
                                        <div className="min-w-0 space-y-1">
                                            <label
                                                id={labelId}
                                                htmlFor={`setting-${field.key}`}
                                                className="block text-sm font-medium text-gray-900"
                                            >
                                                {field.label}
                                            </label>

                                            {field.description && (
                                                <p
                                                    id={descId}
                                                    className="text-sm leading-5 text-gray-500"
                                                >
                                                    {field.description}
                                                </p>
                                            )}
                                        </div>

                                        <div
                                            className={`w-full sm:justify-self-end ${
                                                field.type === "toggle"
                                                    ? "sm:flex sm:justify-end"
                                                    : ""
                                            }`}
                                        >
                                            {field.type === "toggle" ? (
                                                <button
                                                    id={`setting-${field.key}`}
                                                    type="button"
                                                    role="switch"
                                                    aria-checked={value === true}
                                                    aria-labelledby={labelId}
                                                    aria-describedby={descId}
                                                    disabled={disabled}
                                                    onClick={() =>
                                                        updateValue(field.key, value !== true)
                                                    }
                                                    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full outline-none transition-colors focus-visible:ring-4 focus-visible:ring-[#BD9655]/30 disabled:cursor-not-allowed disabled:opacity-60 ${
                                                        value === true
                                                            ? "bg-[#002950]"
                                                            : "bg-gray-300"
                                                    }`}
                                                >
                                                    <span
                                                        className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${
                                                            value === true
                                                                ? "translate-x-6"
                                                                : "translate-x-1"
                                                        }`}
                                                    />
                                                </button>
                                            ) : field.type === "select" ? (
                                                <select
                                                    id={`setting-${field.key}`}
                                                    value={String(value ?? "")}
                                                    disabled={disabled}
                                                    aria-describedby={descId}
                                                    onChange={(event) =>
                                                        updateValue(field.key, event.target.value)
                                                    }
                                                    className={inputBase}
                                                >
                                                    {field.options?.map((option) => (
                                                        <option
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                    {/* Keep unknown stored values selectable instead of silently changing them */}
                                                    {!field.options?.some(
                                                        (o) => o.value === String(value)
                                                    ) && (
                                                        <option value={String(value)}>
                                                            {String(value)}
                                                        </option>
                                                    )}
                                                </select>
                                            ) : (
                                                <div className="space-y-1.5">
                                                    <div className="relative">
                                                        <input
                                                            id={`setting-${field.key}`}
                                                            type="number"
                                                            inputMode="numeric"
                                                            step={1}
                                                            value={
                                                                drafts[field.key] ??
                                                                String(value ?? "")
                                                            }
                                                            min={field.min}
                                                            max={field.max}
                                                            disabled={disabled}
                                                            aria-invalid={!!error}
                                                            aria-describedby={
                                                                error ? errorId : descId
                                                            }
                                                            onChange={(event) =>
                                                                updateNumber(
                                                                    field,
                                                                    event.target.value
                                                                )
                                                            }
                                                            className={`${inputBase} ${
                                                                field.unit ? "pr-12" : ""
                                                            } ${
                                                                error
                                                                    ? "border-red-300 hover:border-red-300 focus:border-red-400 focus:ring-red-100"
                                                                    : ""
                                                            }`}
                                                        />
                                                        {field.unit && (
                                                            <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-xs text-gray-400">
                                                                {field.unit}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {error && (
                                                        <p
                                                            id={errorId}
                                                            className="text-xs text-red-600"
                                                        >
                                                            {error}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer / actions */}
                    <div className="flex flex-col gap-4 border-t border-gray-100 bg-gray-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                        <div className="min-h-5 text-sm" aria-live="polite">
                            {feedback ? (
                                <p
                                    className={`inline-flex items-center gap-2 ${
                                        feedback.success ? "text-green-700" : "text-red-600"
                                    }`}
                                >
                                    {feedback.success ? (
                                        <Check size={16} />
                                    ) : (
                                        <CircleAlert size={16} />
                                    )}
                                    {feedback.message}
                                </p>
                            ) : isDirty ? (
                                <p className="text-gray-500">Tem alterações por guardar.</p>
                            ) : null}
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={discardChanges}
                                disabled={!isDirty || disabled}
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm outline-none transition hover:bg-gray-50 focus-visible:ring-4 focus-visible:ring-[#BD9655]/25 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <RotateCcw size={15} />
                                Repor
                            </button>

                            <button
                                type="button"
                                onClick={save}
                                disabled={!isDirty || hasErrors || disabled}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#002950] px-4 py-2.5 text-sm font-medium text-white shadow-sm outline-none transition hover:bg-[#003968] focus-visible:ring-4 focus-visible:ring-[#002950]/30 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isPending ? (
                                    <LoaderCircle size={16} className="animate-spin" />
                                ) : (
                                    <Save size={16} />
                                )}
                                Guardar alterações
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}