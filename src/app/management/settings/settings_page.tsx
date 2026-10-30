
"use client";

import {
    Bell,
    Building2,
    CalendarDays,
    Check,
    CircleAlert,
    LoaderCircle,
    RotateCcw,
    Save,
    Settings2,
} from "lucide-react";

import { useState, useTransition } from "react";

import {
    saveOrganisationNotificationSettingsAction,
    saveSettingsAction,
} from "@/actions/settings";

import type {
    ManagementSettings,
    OrganisationNotificationSettings,
    OrganisationNotificationValues,
    SettingsSection,
    SettingsValue,
} from "@/services/settings";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type TabId = SettingsSection | "organisationNotifications";

type Props = {
    initialSettings: ManagementSettings;
    canManage?: boolean;

    initialOrganisationNotifications:
        | OrganisationNotificationSettings
        | null;

    canViewOrganisationNotifications: boolean;
    canManageOrganisationNotifications: boolean;
};

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

type Values = Record<
    string,
    string | number | boolean | null | undefined
>;

type Feedback = {
    success: boolean;
    message: string;
};

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

const PERSONAL_TABS: {
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
        label: "Notificações pessoais",
        description: "Notificações e preferências da sua conta.",
        icon: Bell,
    },
];

const ORGANISATION_TAB = {
    id: "organisationNotifications" as const,
    label: "Organização",
    description: "Definições globais de notificações do Pro-Sota.",
    icon: Building2,
};

/* -------------------------------------------------------------------------- */
/* Personal fields                                                            */
/* -------------------------------------------------------------------------- */

const PERSONAL_FIELDS: Record<SettingsSection, FieldDefinition[]> = {
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
            description:
                "Entre 0 e 10 080 minutos (7 dias). Use 0 para avisar à hora do evento.",
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
};

/* -------------------------------------------------------------------------- */
/* Organisation fields                                                        */
/* -------------------------------------------------------------------------- */

const ORGANISATION_FIELDS: FieldDefinition[] = [
    {
        key: "notify_messages",
        label: "Mensagens",
        description: "Notificações de novas mensagens na plataforma.",
        type: "toggle",
        group: "Actividade",
    },
    {
        key: "notify_mentions",
        label: "Menções",
        description: "Notificações quando um utilizador é mencionado.",
        type: "toggle",
        group: "Actividade",
    },
    {
        key: "notify_task_assignments",
        label: "Atribuição de tarefas",
        description: "Notificações de atribuição de tarefas.",
        type: "toggle",
        group: "Actividade",
    },
    {
        key: "notify_deadlines",
        label: "Prazos e datas limite",
        description: "Avisos de prazos, entregas e datas limite.",
        type: "toggle",
        group: "Actividade",
    },
    {
        key: "notify_approvals",
        label: "Aprovações",
        description: "Notificações de aprovações pendentes.",
        type: "toggle",
        group: "Actividade",
    },
    {
        key: "notify_project_updates",
        label: "Actualizações de projectos",
        description: "Notificações de alterações nos projectos.",
        type: "toggle",
        group: "Actividade",
    },
    {
        key: "notify_attendance",
        label: "Presença",
        description: "Notificações relacionadas com a presença da equipa.",
        type: "toggle",
        group: "Actividade",
    },
    {
        key: "channel_in_app",
        label: "Notificações na aplicação",
        description: "Permitir a entrega de notificações dentro do Pro-Sota.",
        type: "toggle",
        group: "Canais de entrega",
    },
    {
        key: "channel_email",
        label: "Notificações por e-mail",
        description: "Permitir a entrega de notificações por e-mail.",
        type: "toggle",
        group: "Canais de entrega",
    },
];

/* -------------------------------------------------------------------------- */
/* Defaults                                                                   */
/* -------------------------------------------------------------------------- */

const PERSONAL_DEFAULTS: Record<
    string,
    string | number | boolean
> = {
    language: "pt-AO",
    theme: "light",
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

const ORGANISATION_DEFAULTS: OrganisationNotificationValues = {
    notify_messages: true,
    notify_mentions: true,
    notify_task_assignments: true,
    notify_deadlines: true,
    notify_approvals: true,
    notify_project_updates: true,
    notify_attendance: true,
    channel_in_app: true,
    channel_email: false,
};

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

const inputBase =
    "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-[#BD9655] focus:ring-4 focus:ring-[#BD9655]/15 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getValue(values: Values, key: string) {
    const value = values?.[key];

    return value === undefined || value === null
        ? PERSONAL_DEFAULTS[key]
        : value;
}

function validateNumber(
    field: FieldDefinition,
    raw: string,
): string | null {
    if (raw.trim() === "") {
        return "Introduza um valor.";
    }

    const number = Number(raw);

    if (!Number.isInteger(number)) {
        return "Introduza um número inteiro.";
    }

    if (field.min !== undefined && number < field.min) {
        return `O valor mínimo é ${field.min}.`;
    }

    if (field.max !== undefined && number > field.max) {
        return `O valor máximo é ${field.max}.`;
    }

    return null;
}

function pickPersonalSection(
    section: SettingsSection,
    values: Values,
): SettingsValue {
    const result: SettingsValue = {};

    for (const field of PERSONAL_FIELDS[section]) {
        const value = getValue(values, field.key);

        if (value !== undefined) {
            result[field.key] = value;
        }
    }

    return result;
}

function isPersonalSectionDirty(
    section: SettingsSection,
    current: ManagementSettings,
    saved: ManagementSettings,
) {
    const currentValues = current[section] as Values;
    const savedValues = saved[section] as Values;

    return PERSONAL_FIELDS[section].some(
        (field) =>
            getValue(currentValues, field.key) !==
            getValue(savedValues, field.key),
    );
}

function getOrganisationValues(
    values: OrganisationNotificationSettings,
): OrganisationNotificationValues {
    return {
        notify_messages: values.notify_messages,
        notify_mentions: values.notify_mentions,
        notify_task_assignments: values.notify_task_assignments,
        notify_deadlines: values.notify_deadlines,
        notify_approvals: values.notify_approvals,
        notify_project_updates: values.notify_project_updates,
        notify_attendance: values.notify_attendance,
        channel_in_app: values.channel_in_app,
        channel_email: values.channel_email,
    };
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function Settings({
    initialSettings,
    canManage = false,
    initialOrganisationNotifications,
    canViewOrganisationNotifications,
    canManageOrganisationNotifications,
}: Props) {
    const [activeTab, setActiveTab] =
        useState<TabId>("company");

    const [settings, setSettings] =
        useState<ManagementSettings>(initialSettings);

    const [savedSettings, setSavedSettings] =
        useState<ManagementSettings>(initialSettings);

    const [organisationSettings, setOrganisationSettings] =
        useState<OrganisationNotificationValues>(
            initialOrganisationNotifications
                ? getOrganisationValues(initialOrganisationNotifications)
                : ORGANISATION_DEFAULTS,
        );

    const [savedOrganisationSettings, setSavedOrganisationSettings] =
        useState<OrganisationNotificationValues>(
            initialOrganisationNotifications
                ? getOrganisationValues(initialOrganisationNotifications)
                : ORGANISATION_DEFAULTS,
        );

    const [drafts, setDrafts] =
        useState<Record<string, string>>({});

    const [errors, setErrors] =
        useState<Record<string, string>>({});

    const [isPending, startTransition] = useTransition();

    const [feedback, setFeedback] =
        useState<Feedback | null>(null);

    const isOrganisationTab =
        activeTab === "organisationNotifications";

    const personalTab = isOrganisationTab
        ? null
        : activeTab;

    const active = isOrganisationTab
        ? ORGANISATION_TAB
        : PERSONAL_TABS.find((tab) => tab.id === activeTab)!;

    const ActiveIcon = active.icon;

    const fields = isOrganisationTab
        ? ORGANISATION_FIELDS
        : PERSONAL_FIELDS[activeTab as SettingsSection];

    const currentValues: Values = isOrganisationTab
        ? organisationSettings
        : settings[activeTab as SettingsSection] as Values;

    const disabled =
        isPending ||
        (isOrganisationTab
            ? !canManageOrganisationNotifications
            : !canManage);

    const isDirty = isOrganisationTab
        ? ORGANISATION_FIELDS.some(
              (field) =>
                  organisationSettings[
                      field.key as keyof OrganisationNotificationValues
                  ] !==
                  savedOrganisationSettings[
                      field.key as keyof OrganisationNotificationValues
                  ],
          )
        : isPersonalSectionDirty(
              activeTab as SettingsSection,
              settings,
              savedSettings,
          );

    const hasErrors = fields.some(
        (field) => Boolean(errors[field.key]),
    );

    const tabs = [
        ...PERSONAL_TABS,
        ...(canViewOrganisationNotifications
            ? [ORGANISATION_TAB]
            : []),
    ];

    /* ---------------------------------------------------------------------- */
    /* Draft management                                                       */
    /* ---------------------------------------------------------------------- */

    function clearDrafts(fieldDefinitions: FieldDefinition[]) {
        const keys = fieldDefinitions.map((field) => field.key);

        setDrafts((previous) =>
            Object.fromEntries(
                Object.entries(previous).filter(
                    ([key]) => !keys.includes(key),
                ),
            ),
        );

        setErrors((previous) =>
            Object.fromEntries(
                Object.entries(previous).filter(
                    ([key]) => !keys.includes(key),
                ),
            ),
        );
    }

    /* ---------------------------------------------------------------------- */
    /* Update values                                                          */
    /* ---------------------------------------------------------------------- */

    function updateValue(
        key: string,
        value: string | number | boolean,
    ) {
        if (isOrganisationTab) {
            if (!canManageOrganisationNotifications) return;

            setOrganisationSettings((previous) => ({
                ...previous,
                [key]: value,
            }));
        } else {
            if (!canManage || !personalTab) return;

            setSettings((previous) => ({
                ...previous,
                [personalTab]: {
                    ...previous[personalTab],
                    [key]: value,
                },
            }));
        }

        setFeedback(null);
    }

    function updateNumber(
        field: FieldDefinition,
        raw: string,
    ) {
        setDrafts((previous) => ({
            ...previous,
            [field.key]: raw,
        }));

        const error = validateNumber(field, raw);

        setErrors((previous) => {
            const next = { ...previous };

            if (error) {
                next[field.key] = error;
            } else {
                delete next[field.key];
            }

            return next;
        });

        if (!error) {
            updateValue(field.key, Number(raw));
        } else {
            setFeedback(null);
        }
    }

    /* ---------------------------------------------------------------------- */
    /* Save personal settings                                                 */
    /* ---------------------------------------------------------------------- */

    function savePersonalSettings(section: SettingsSection) {
        const values = pickPersonalSection(
            section,
            settings[section] as Values,
        );

        startTransition(async () => {
            try {
                const result = await saveSettingsAction(
                    section,
                    values,
                );

                setFeedback({
                    success: result.success,
                    message: result.message,
                });

                if (!result.success) return;

                const savedValues = result.data ?? values;

                setSettings((previous) => ({
                    ...previous,
                    [section]: {
                        ...previous[section],
                        ...savedValues,
                    },
                }));

                setSavedSettings((previous) => ({
                    ...previous,
                    [section]: {
                        ...previous[section],
                        ...savedValues,
                    },
                }));

                clearDrafts(PERSONAL_FIELDS[section]);
            } catch (error) {
                console.error("[Settings] Personal save failed:", error);

                setFeedback({
                    success: false,
                    message:
                        "Não foi possível guardar as preferências.",
                });
            }
        });
    }

    /* ---------------------------------------------------------------------- */
    /* Save organisation settings                                             */
    /* ---------------------------------------------------------------------- */

    function saveOrganisationSettings() {
        if (!canManageOrganisationNotifications) return;

        startTransition(async () => {
            try {
                const result =
                    await saveOrganisationNotificationSettingsAction(
                        organisationSettings,
                    );

                setFeedback({
                    success: result.success,
                    message: result.message,
                });

                if (!result.success) return;

                const savedValues = result.data
                    ? getOrganisationValues(result.data)
                    : organisationSettings;

                setOrganisationSettings(savedValues);
                setSavedOrganisationSettings(savedValues);

                clearDrafts(ORGANISATION_FIELDS);
            } catch (error) {
                console.error(
                    "[Settings] Organisation notification save failed:",
                    error,
                );

                setFeedback({
                    success: false,
                    message:
                        "Não foi possível guardar as definições da organização.",
                });
            }
        });
    }

    /* ---------------------------------------------------------------------- */
    /* Save dispatcher                                                        */
    /* ---------------------------------------------------------------------- */

    function save() {
        if (!isDirty || hasErrors || disabled || isPending) {
            return;
        }

        if (isOrganisationTab) {
            saveOrganisationSettings();
            return;
        }

        if (personalTab) {
            savePersonalSettings(personalTab);
        }
    }

    /* ---------------------------------------------------------------------- */
    /* Discard changes                                                        */
    /* ---------------------------------------------------------------------- */

    function discardChanges() {
        if (disabled) return;

        if (isOrganisationTab) {
            setOrganisationSettings({
                ...savedOrganisationSettings,
            });

            clearDrafts(ORGANISATION_FIELDS);
        } else if (personalTab) {
            setSettings((previous) => ({
                ...previous,
                [personalTab]: {
                    ...savedSettings[personalTab],
                },
            }));

            clearDrafts(PERSONAL_FIELDS[personalTab]);
        }

        setFeedback(null);
    }

    /* ---------------------------------------------------------------------- */
    /* Navigation                                                             */
    /* ---------------------------------------------------------------------- */

    function changeTab(tab: TabId) {
        setActiveTab(tab);
        setFeedback(null);
    }

    function tabIsDirty(tab: TabId) {
        if (tab === "organisationNotifications") {
            return ORGANISATION_FIELDS.some(
                (field) =>
                    organisationSettings[
                        field.key as keyof OrganisationNotificationValues
                    ] !==
                    savedOrganisationSettings[
                        field.key as keyof OrganisationNotificationValues
                    ],
            );
        }

        return isPersonalSectionDirty(
            tab,
            settings,
            savedSettings,
        );
    }

    /* ---------------------------------------------------------------------- */
    /* Render                                                                 */
    /* ---------------------------------------------------------------------- */

    return (
        <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:py-10">

            {/* Page header */}
            <header className="space-y-1.5">
                <h1 className="text-2xl font-semibold tracking-tight text-[#002950] sm:text-3xl">
                    Definições
                </h1>

                <p className="max-w-xl text-sm leading-6 text-gray-500">
                    Gira as suas preferências pessoais e as definições
                    globais da organização no Pro-Sota.
                </p>
            </header>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8">

                {/* Navigation */}
                <nav
                    aria-label="Categorias das definições"
                    className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 lg:sticky lg:top-6 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0"
                >
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const selected = activeTab === tab.id;
                        const dirty = tabIsDirty(tab.id);

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => changeTab(tab.id)}
                                aria-current={
                                    selected ? "page" : undefined
                                }
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

                    {/* Panel header */}
                    <div className="flex items-start gap-4 border-b border-gray-100 px-5 py-6 sm:px-8">
                        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#002950]/[0.06]">
                            <ActiveIcon
                                size={20}
                                className="text-[#002950]"
                            />
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

                    {/* Organisation scope notice */}
                    {isOrganisationTab && (
                        <div className="mx-5 mt-5 rounded-xl border border-[#BD9655]/25 bg-[#BD9655]/[0.06] px-4 py-3 sm:mx-8">
                            <div className="flex items-start gap-3">
                                <Building2
                                    size={17}
                                    className="mt-0.5 shrink-0 text-[#BD9655]"
                                />

                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-[#002950]">
                                        Definições globais da organização
                                    </p>

                                    <p className="text-xs leading-5 text-gray-600">
                                        Estas opções definem os tipos de
                                        notificações e os canais permitidos
                                        para a organização. Não substituem
                                        as preferências individuais dos
                                        utilizadores.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Read-only notice */}
                    {disabled && (
                        <div className="mx-5 mt-5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 sm:mx-8">
                            <p className="text-sm text-gray-600">
                                {isOrganisationTab
                                    ? "Tem acesso de consulta. É necessária a permissão settings.notifications.manage para alterar estas definições."
                                    : "Tem acesso de consulta às suas definições."}
                            </p>
                        </div>
                    )}

                    {/* Fields */}
                    <div className="px-5 sm:px-8">
                        {fields.map((field, index) => {
                            const value = isOrganisationTab
                                ? organisationSettings[
                                      field.key as keyof OrganisationNotificationValues
                                  ]
                                : getValue(currentValues, field.key);

                            const error = errors[field.key];

                            const showGroup =
                                Boolean(field.group) &&
                                field.group !==
                                    fields[index - 1]?.group;

                            const labelId = `label-${activeTab}-${field.key}`;
                            const descId = `desc-${activeTab}-${field.key}`;
                            const errorId = `error-${activeTab}-${field.key}`;

                            return (
                                <div key={field.key}>
                                    {showGroup && (
                                        <h3
                                            className={`pb-1 text-xs font-semibold text-gray-400 ${
                                                index === 0
                                                    ? "pt-6"
                                                    : "pt-8"
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
                                                htmlFor={`setting-${activeTab}-${field.key}`}
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
                                                    id={`setting-${activeTab}-${field.key}`}
                                                    type="button"
                                                    role="switch"
                                                    aria-checked={value === true}
                                                    aria-labelledby={labelId}
                                                    aria-describedby={
                                                        field.description
                                                            ? descId
                                                            : undefined
                                                    }
                                                    disabled={disabled}
                                                    onClick={() =>
                                                        updateValue(
                                                            field.key,
                                                            value !== true,
                                                        )
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
                                                    id={`setting-${activeTab}-${field.key}`}
                                                    value={String(value ?? "")}
                                                    disabled={disabled}
                                                    aria-describedby={
                                                        field.description
                                                            ? descId
                                                            : undefined
                                                    }
                                                    onChange={(event) =>
                                                        updateValue(
                                                            field.key,
                                                            event.target.value,
                                                        )
                                                    }
                                                    className={inputBase}
                                                >
                                                    {field.options?.map(
                                                        (option) => (
                                                            <option
                                                                key={option.value}
                                                                value={option.value}
                                                            >
                                                                {option.label}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            ) : (
                                                <div className="space-y-1.5">
                                                    <div className="relative">
                                                        <input
                                                            id={`setting-${activeTab}-${field.key}`}
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
                                                            aria-invalid={Boolean(error)}
                                                            aria-describedby={
                                                                error
                                                                    ? errorId
                                                                    : field.description
                                                                      ? descId
                                                                      : undefined
                                                            }
                                                            onChange={(event) =>
                                                                updateNumber(
                                                                    field,
                                                                    event.target.value,
                                                                )
                                                            }
                                                            className={`${inputBase} ${
                                                                field.unit
                                                                    ? "pr-12"
                                                                    : ""
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

                    {/* Footer */}
                    <div className="flex flex-col gap-4 border-t border-gray-100 bg-gray-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                        <div
                            className="min-h-5 text-sm"
                            aria-live="polite"
                        >
                            {feedback ? (
                                <p
                                    className={`inline-flex items-center gap-2 ${
                                        feedback.success
                                            ? "text-green-700"
                                            : "text-red-600"
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
                                <p className="text-gray-500">
                                    Tem alterações por guardar.
                                </p>
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
                                    <LoaderCircle
                                        size={16}
                                        className="animate-spin"
                                    />
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
