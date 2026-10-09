
"use client";

import { useMemo, useState, useTransition } from "react";
import {
    Plus,
    Search,
    LayoutGrid,
    List,
    Users,
    HardHat,
    Building2,
    Briefcase,
    Mail,
    Phone,
    MoreVertical,
    UserRound,
    Pencil,
    FolderKanban,
    UserX,
    CheckCircle2,
    Clock3,
    ShieldAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { StatCard } from "@/app/components/StatCard";
import CustomSelect from "@/app/components/custom_select";
import { useToast } from "@/app/components/toast/use_toast";

import {
    DEPARTMENTS,
    TEAM_STATUSES,
    getDepartmentLabel,
    normalizeDepartment,
} from "./constants";

import type { TeamMember } from "@/services/team";
import { deactivateTeamMember } from "@/actions/team";

type TeamPageProps = {
    team: TeamMember[];
};

const getInitials = (
    firstName?: string | null,
    lastName?: string | null,
) => {
    return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
};

const getFullName = (
    firstName?: string | null,
    lastName?: string | null,
) => {
    return (
        [firstName, lastName]
            .filter(Boolean)
            .join(" ")
            .trim() || "Sem nome"
    );
};

const getStatusLabel = (status?: string | null) => {
    switch (status) {
        case "Active":
            return "Activo";
        case "Inactive":
            return "Inactivo";
        case "Pending":
            return "Pendente";
        case "Suspended":
            return "Suspenso";
        default:
            return status || "Sem estado";
    }
};

const getStatusClasses = (status?: string | null) => {
    switch (status) {
        case "Active":
            return "bg-emerald-50 text-emerald-700 border-emerald-100";
        case "Inactive":
            return "bg-slate-100 text-slate-600 border-slate-200";
        case "Pending":
            return "bg-amber-50 text-amber-700 border-amber-100";
        case "Suspended":
            return "bg-red-50 text-red-700 border-red-100";
        default:
            return "bg-slate-50 text-slate-500 border-slate-200";
    }
};

const getJobTitle = (employee: TeamMember) => {
    return employee.job_title || "Função não definida";
};

export default function TeamPage({ team }: TeamPageProps) {
    const router = useRouter();
    const toast = useToast();

    const [view, setView] = useState<"grid" | "list">("grid");
    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const employees = team ?? [];

    const stats = useMemo(() => {
        const architects = employees.filter((employee) => {
            const title = employee.job_title?.toLowerCase() ?? "";

            return (
                title.includes("arquitect") ||
                title.includes("architect")
            );
        }).length;

        const engineers = employees.filter((employee) => {
            const title = employee.job_title?.toLowerCase() ?? "";

            return (
                title.includes("engenheir") ||
                title.includes("engineer")
            );
        }).length;

        const departments = new Set(
            employees
                .map((employee) =>
                    normalizeDepartment(employee.department),
                )
                .filter(Boolean),
        ).size;

        return [
            {
                title: "Colaboradores",
                value: employees.length,
                icon: Users,
            },
            {
                title: "Arquitectos",
                value: architects,
                icon: Building2,
            },
            {
                title: "Engenheiros",
                value: engineers,
                icon: HardHat,
            },
            {
                title: "Departamentos",
                value: departments,
                icon: Briefcase,
            },
        ];
    }, [employees]);

    const filteredEmployees = useMemo(() => {
        const searchTerm = search.trim().toLowerCase();

        return employees.filter((employee) => {
            const firstName = employee.first_name?.toLowerCase() ?? "";
            const lastName = employee.last_name?.toLowerCase() ?? "";
            const email = employee.email?.toLowerCase() ?? "";
            const department = employee.department?.toLowerCase() ?? "";

            const normalizedDepartment = normalizeDepartment(
                employee.department,
            ).toLowerCase();

            const jobTitle = employee.job_title?.toLowerCase() ?? "";

            const matchesSearch =
                !searchTerm ||
                firstName.includes(searchTerm) ||
                lastName.includes(searchTerm) ||
                email.includes(searchTerm) ||
                department.includes(searchTerm) ||
                normalizedDepartment.includes(searchTerm) ||
                jobTitle.includes(searchTerm);

            const matchesDepartment =
                departmentFilter === "all" ||
                normalizeDepartment(employee.department) === departmentFilter;

            const employeeStatus = employee.status ?? null;

            const matchesStatus =
                statusFilter === "all" ||
                employeeStatus === statusFilter;

            return (
                matchesSearch &&
                matchesDepartment &&
                matchesStatus
            );
        });
    }, [employees, search, departmentFilter, statusFilter]);

    const handleCreateMember = () => {
        router.push("/management/team/create-member");
    };

    const handleViewProfile = (profileId: string) => {
        setOpenMenu(null);
        router.push(`/management/team/${profileId}`);
    };

    const handleEditMember = (profileId: string) => {
        setOpenMenu(null);
        router.push(`/management/team/${profileId}/edit`);
    };

    const handleViewProjects = (profileId: string) => {
        setOpenMenu(null);
        router.push(`/management/team/${profileId}/projects`);
    };

    const handleDeactivateMember = async (
        profileId: string,
        name: string,
    ) => {
        setOpenMenu(null);

        const confirmed = await toast.confirm({
            title: "Desactivar colaborador",
            message: `Tem a certeza de que pretende desactivar ${name}?`,
            confirmText: "Desactivar",
            cancelText: "Cancelar",
            variant: "destructive",
        });

        if (!confirmed) return;

        startTransition(async () => {
            try {
                const result = await deactivateTeamMember(profileId);

                if (!result.success) {
                    toast.error(
                        result.error ??
                            "Não foi possível desactivar o colaborador.",
                    );
                    return;
                }

                toast.success(
                    `${name} foi desactivado com sucesso.`,
                );

                router.refresh();
            } catch (error) {
                console.error("Erro ao desactivar colaborador:", error);

                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Ocorreu um erro ao desactivar o colaborador.",
                );
            }
        });
    };

    const clearFilters = () => {
        setSearch("");
        setDepartmentFilter("all");
        setStatusFilter("all");
    };

    const hasFilters =
        Boolean(search) ||
        departmentFilter !== "all" ||
        statusFilter !== "all";

    return (
        <div
            className="min-h-screen p-6 md:p-10"
            onClick={() => setOpenMenu(null)}
        >
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                            Team
                        </h1>

                        <p className="mt-1 text-slate-500">
                            Gerir arquitectos, engenheiros e colaboradores
                            da empresa.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleCreateMember}
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#BD9655] px-5 py-2.5 text-sm font-medium text-[#002950] transition hover:bg-[#BD9655]/90 active:scale-[0.98]"
                    >
                        <Plus size={16} />
                        Adicionar colaborador
                    </button>
                </div>

                {/* Statistics */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => (
                        <StatCard
                            key={stat.title}
                            icon={<stat.icon />}
                            title={stat.title}
                            value={String(stat.value)}
                        />
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full max-w-md">
                            <Search
                                size={16}
                                aria-hidden="true"
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Pesquisar colaborador, função ou departamento..."
                                aria-label="Pesquisar colaborador"
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/5"
                            />
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <CustomSelect
                                value={departmentFilter}
                                onChange={(event) =>
                                    setDepartmentFilter(event.target.value)
                                }
                                aria-label="Filtrar por departamento"
                                className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-slate-400 sm:w-auto"
                            >
                                <option value="all">
                                    Todos os departamentos
                                </option>

                                {DEPARTMENTS.map((department) => (
                                    <option
                                        key={department.value}
                                        value={department.value}
                                    >
                                        {department.label}
                                    </option>
                                ))}
                            </CustomSelect>

                            <CustomSelect
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(event.target.value)
                                }
                                aria-label="Filtrar por estado"
                                className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-slate-400 sm:w-auto"
                            >
                                {TEAM_STATUSES.map((status) => (
                                    <option
                                        key={status.value}
                                        value={status.value}
                                    >
                                        {status.label}
                                    </option>
                                ))}
                            </CustomSelect>

                            <div className="flex overflow-hidden rounded-lg border border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setView("grid")}
                                    aria-label="Vista em grelha"
                                    aria-pressed={view === "grid"}
                                    className={`cursor-pointer p-2.5 transition ${
                                        view === "grid"
                                            ? "bg-[#002950] text-white"
                                            : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                    }`}
                                >
                                    <LayoutGrid size={16} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setView("list")}
                                    aria-label="Vista em lista"
                                    aria-pressed={view === "list"}
                                    className={`cursor-pointer border-l border-slate-200 p-2.5 transition ${
                                        view === "list"
                                            ? "bg-[#002950] text-white"
                                            : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                    }`}
                                >
                                    <List size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        {filteredEmployees.length}{" "}
                        {filteredEmployees.length === 1
                            ? "colaborador"
                            : "colaboradores"}
                        {hasFilters ? " encontrados" : ""}
                    </p>

                    {hasFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="cursor-pointer text-sm font-medium text-slate-600 transition hover:text-slate-900"
                        >
                            Limpar filtros
                        </button>
                    )}
                </div>

                {/* Empty state */}
                {filteredEmployees.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-8 py-20 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                            <Users className="h-8 w-8 text-slate-400" />
                        </div>

                        <h3 className="mt-6 text-xl font-semibold text-slate-900">
                            Nenhum colaborador encontrado
                        </h3>

                        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                            {employees.length === 0
                                ? "Ainda não existem colaboradores registados."
                                : "Nenhum colaborador corresponde aos filtros seleccionados."}
                        </p>

                        {employees.length === 0 ? (
                            <button
                                type="button"
                                onClick={handleCreateMember}
                                className="mt-6 flex cursor-pointer items-center gap-2 rounded-lg bg-[#002950] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#002950]/90"
                            >
                                <Plus size={16} />
                                Adicionar colaborador
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="mt-6 cursor-pointer rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                Limpar filtros
                            </button>
                        )}
                    </div>
                ) : (
                    <div
                        className={
                            view === "grid"
                                ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                                : "space-y-3"
                        }
                    >
                        {filteredEmployees.map((employee) => {
                            const name = getFullName(
                                employee.first_name,
                                employee.last_name,
                            );

                            const initials = getInitials(
                                employee.first_name,
                                employee.last_name,
                            );

                            const isMenuOpen =
                                openMenu === employee.profile_id;

                            return view === "grid" ? (
                                <div
                                    key={employee.profile_id}
                                    className="group relative rounded-xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex min-w-0 items-center gap-3">
                                            {employee.profile_picture ? (
                                                <img
                                                    src={employee.profile_picture}
                                                    alt={name}
                                                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#002950] text-sm font-bold text-white">
                                                    {initials || "?"}
                                                </div>
                                            )}

                                            <div className="min-w-0">
                                                <h3
                                                    className="truncate font-medium text-slate-900"
                                                    title={name}
                                                >
                                                    {name}
                                                </h3>

                                                <p className="truncate text-sm text-slate-500">
                                                    {getJobTitle(employee)}
                                                </p>

                                                <p className="truncate text-xs text-slate-400">
                                                    {getDepartmentLabel(
                                                        employee.department,
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <MemberMenu
                                            employee={employee}
                                            name={name}
                                            isOpen={isMenuOpen}
                                            onToggle={() =>
                                                setOpenMenu((current) =>
                                                    current ===
                                                    employee.profile_id
                                                        ? null
                                                        : employee.profile_id,
                                                )
                                            }
                                            onViewProfile={() =>
                                                handleViewProfile(
                                                    employee.profile_id,
                                                )
                                            }
                                            onEdit={() =>
                                                handleEditMember(
                                                    employee.profile_id,
                                                )
                                            }
                                            onProjects={() =>
                                                handleViewProjects(
                                                    employee.profile_id,
                                                )
                                            }
                                            onDeactivate={() =>
                                                void handleDeactivateMember(
                                                    employee.profile_id,
                                                    name,
                                                )
                                            }
                                            disabled={isPending}
                                        />
                                    </div>

                                    {/* Status */}
                                    <div className="mt-4">
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                                                employee.status,
                                            )}`}
                                        >
                                            {employee.status === "Active" ? (
                                                <CheckCircle2 size={12} />
                                            ) : employee.status === "Pending" ? (
                                                <Clock3 size={12} />
                                            ) : (
                                                <ShieldAlert size={12} />
                                            )}

                                            {getStatusLabel(employee.status)}
                                        </span>
                                    </div>

                                    {/* Contact */}
                                    <div className="mt-5 space-y-2.5 text-sm text-slate-600">
                                        {employee.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail
                                                    size={14}
                                                    className="shrink-0 text-slate-400"
                                                />
                                                <span className="truncate">
                                                    {employee.email}
                                                </span>
                                            </div>
                                        )}

                                        {employee.phone_number && (
                                            <div className="flex items-center gap-2">
                                                <Phone
                                                    size={14}
                                                    className="shrink-0 text-slate-400"
                                                />
                                                <span className="truncate">
                                                    {employee.phone_number}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Projects */}
                                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                                        <span className="text-xs text-slate-400">
                                            Projectos
                                        </span>

                                        <span className="font-medium text-slate-900">
                                            {employee.project_count}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    key={employee.profile_id}
                                    className="group relative flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 transition duration-200 hover:border-slate-300 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        {employee.profile_picture ? (
                                            <img
                                                src={employee.profile_picture}
                                                alt={name}
                                                className="h-11 w-11 shrink-0 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#002950] text-sm font-bold text-white">
                                                {initials || "?"}
                                            </div>
                                        )}

                                        <div className="min-w-0">
                                            <h3
                                                className="truncate font-medium text-slate-900"
                                                title={name}
                                            >
                                                {name}
                                            </h3>

                                            <p className="truncate text-sm text-slate-500">
                                                {getJobTitle(employee)}
                                            </p>

                                            <p className="truncate text-xs text-slate-400">
                                                {getDepartmentLabel(
                                                    employee.department,
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600 sm:ml-auto">
                                        <span
                                            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                                                employee.status,
                                            )}`}
                                        >
                                            {getStatusLabel(employee.status)}
                                        </span>

                                        {employee.email && (
                                            <div className="flex min-w-0 items-center gap-2">
                                                <Mail
                                                    size={14}
                                                    className="shrink-0 text-slate-400"
                                                />
                                                <span className="max-w-[240px] truncate">
                                                    {employee.email}
                                                </span>
                                            </div>
                                        )}

                                        {employee.phone_number && (
                                            <div className="flex items-center gap-2">
                                                <Phone
                                                    size={14}
                                                    className="shrink-0 text-slate-400"
                                                />
                                                <span>
                                                    {employee.phone_number}
                                                </span>
                                            </div>
                                        )}

                                        <div>
                                            <span className="font-medium text-slate-900">
                                                {employee.project_count}
                                            </span>{" "}
                                            {employee.project_count === 1
                                                ? "projecto"
                                                : "projectos"}
                                        </div>

                                        <MemberMenu
                                            employee={employee}
                                            name={name}
                                            isOpen={isMenuOpen}
                                            onToggle={() =>
                                                setOpenMenu((current) =>
                                                    current ===
                                                    employee.profile_id
                                                        ? null
                                                        : employee.profile_id,
                                                )
                                            }
                                            onViewProfile={() =>
                                                handleViewProfile(
                                                    employee.profile_id,
                                                )
                                            }
                                            onEdit={() =>
                                                handleEditMember(
                                                    employee.profile_id,
                                                )
                                            }
                                            onProjects={() =>
                                                handleViewProjects(
                                                    employee.profile_id,
                                                )
                                            }
                                            onDeactivate={() =>
                                                void handleDeactivateMember(
                                                    employee.profile_id,
                                                    name,
                                                )
                                            }
                                            disabled={isPending}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

type MemberMenuProps = {
    employee: TeamMember;
    name: string;
    isOpen: boolean;
    disabled?: boolean;
    onToggle: () => void;
    onViewProfile: () => void;
    onEdit: () => void;
    onProjects: () => void;
    onDeactivate: () => void;
};

function MemberMenu({
    employee,
    name,
    isOpen,
    disabled,
    onToggle,
    onViewProfile,
    onEdit,
    onProjects,
    onDeactivate,
}: MemberMenuProps) {
    return (
        <div className="relative">
            <button
                type="button"
                aria-label={`Mais opções para ${name}`}
                aria-expanded={isOpen}
                onClick={(event) => {
                    event.stopPropagation();
                    onToggle();
                }}
                disabled={disabled}
                className={`shrink-0 cursor-pointer rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${
                    isOpen
                        ? "bg-slate-100 text-slate-600 opacity-100"
                        : "opacity-0 group-hover:opacity-100 focus:opacity-100"
                }`}
            >
                <MoreVertical size={17} />
            </button>

            {isOpen && (
                <div
                    onClick={(event) => event.stopPropagation()}
                    className="absolute right-0 top-9 z-50 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-xl"
                >
                    <button
                        type="button"
                        onClick={onViewProfile}
                        className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                        <UserRound
                            size={15}
                            className="text-slate-400"
                        />
                        Ver perfil
                    </button>

                    <button
                        type="button"
                        onClick={onEdit}
                        className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                        <Pencil
                            size={15}
                            className="text-slate-400"
                        />
                        Editar colaborador
                    </button>

                    <button
                        type="button"
                        onClick={onProjects}
                        className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                        <FolderKanban
                            size={15}
                            className="text-slate-400"
                        />
                        Ver projectos
                    </button>

                    {employee.status !== "Inactive" && (
                        <>
                            <div className="my-1 border-t border-slate-100" />

                            <button
                                type="button"
                                onClick={onDeactivate}
                                disabled={disabled}
                                className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <UserX size={15} />
                                Desactivar colaborador
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}