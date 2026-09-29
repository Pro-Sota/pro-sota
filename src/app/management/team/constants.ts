export const DEPARTMENTS = [
    { value: "DC", label: "Comercial (DC)" },
    { value: "Administração", label: "Administração" },
    { value: "DE", label: "Engenharia (DE)" },
    { value: "DA", label: "Arquitectura (DA)" },
    { value: "DIT", label: "DIT" },
    { value: "HR", label: "Recursos Humanos (HR)" },
    { value: "Design de Interiores", label: "Design de Interiores" },
    { value: "Paisagismo", label: "Paisagismo" },
    { value: "Finanças", label: "Finanças" },
    { value: "Procurement", label: "Procurement" },
    { value: "Marketing & Comunicação", label: "Marketing & Comunicação" },
    { value: "TI/Sistemas", label: "TI/Sistemas" },
] as const;

export const DEPARTMENT_LABELS = Object.fromEntries(
    DEPARTMENTS.map((department) => [
        department.value,
        department.label,
    ])
) as Record<string, string>;

export const TEAM_STATUSES = [
    { value: "all", label: "Todos os estados" },
    { value: "Active", label: "Activos" },
    { value: "Inactive", label: "Inactivos" },
    { value: "Pending", label: "Pendentes" },
    { value: "Suspended", label: "Suspensos" },
] as const;

export const normalizeDepartment = (
    department?: string | null
): string => {
    if (!department) return "";

    const aliases: Record<string, string> = {
        Commercial: "DC",
        Comercial: "DC",

        Architecture: "DA",
        Arquitectura: "DA",
        ArchitectureDepartment: "DA",

        Engineering: "DE",
        Engenharia: "DE",

        IT: "TI/Sistemas",
        "Human Resources": "HR",
    };

    return aliases[department] ?? department;
};

export function getDepartmentLabel(
    department?: string | null
): string {
    if (!department) return "Departamento não definido";

    const normalized = normalizeDepartment(department);

    return DEPARTMENT_LABELS[normalized] ?? department;
}