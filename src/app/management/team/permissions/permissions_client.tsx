
"use client";

import {
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";

import {
  ArrowLeft,
  Check,
  CheckCheck,
  ChevronDown,
  Clock3,
  Search,
  Shield,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Role = "admin" | "user";

type Permission = {
  key: string;
  label: string;
  module: string;
};

type Member = {
  profile_id: string;
  first_name: string;
  email: string;
  department: string;
  role: Role;
  initials: string;
};

type Overrides = Record<string, boolean>;

type PermissionDraft = {
  profileId: string;
  role: Role;
  overrides: Overrides;
};

type SaveResult = {
  success: boolean;
  error?: string;
};

type Props = {
  members: Member[];
  permissions: Permission[];
  roleDefaults: Record<Role, string[]>;
  initialOverrides?: Record<string, Overrides>;
  onSave: (draft: PermissionDraft) => Promise<SaveResult>;
};

const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador",
  user: "Utilizador",
};

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin: "Acesso completo ao sistema.",
  user: "Acesso conforme as responsabilidades atribuídas.",
};

const ROLES: Role[] = ["admin", "user"];

function sameOverrides(a: Overrides, b: Overrides) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  return (
    aKeys.length === bKeys.length &&
    aKeys.every(
      (key) =>
        Object.hasOwn(b, key) &&
        a[key] === b[key]
    )
  );
}

function cloneOverrides(
  value: Record<string, Overrides>
): Record<string, Overrides> {
  return Object.fromEntries(
    Object.entries(value).map(([id, overrides]) => [
      id,
      { ...overrides },
    ])
  );
}

export default function PermissionsClient({
  members,
  permissions,
  roleDefaults,
  initialOverrides = {},
  onSave,
}: Props) {
  const [selectedId, setSelectedId] = useState(
    members[0]?.profile_id ?? ""
  );

  const router = useRouter();

  const [roles, setRoles] = useState<Record<string, Role>>(() =>
    Object.fromEntries(
      members.map((member) => [member.profile_id, member.role])
    )
  );

  const [savedRoles, setSavedRoles] = useState<Record<string, Role>>(
    () =>
      Object.fromEntries(
        members.map((member) => [member.profile_id, member.role])
      )
  );

  const [overridesByMember, setOverridesByMember] =
    useState<Record<string, Overrides>>(() =>
      cloneOverrides(initialOverrides)
    );

  const [savedOverrides, setSavedOverrides] = useState<
    Record<string, Overrides>
  >(() => cloneOverrides(initialOverrides));

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("Todos");
  const [permissionSearch, setPermissionSearch] = useState("");
  const [showInherited, setShowInherited] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedMember = members.find(
    (member) => member.profile_id === selectedId
  );

  const selectedRole = roles[selectedId] ?? "user";

  const currentOverrides =
    overridesByMember[selectedId] ?? {};

  const currentSavedOverrides =
    savedOverrides[selectedId] ?? {};

  const rolePermissionKeys = roleDefaults[selectedRole] ?? [];

  const rolePermissionSet = useMemo(
    () => new Set(rolePermissionKeys),
    [rolePermissionKeys]
  );

  const moduleNames = useMemo(
    () => [
      "Todos",
      ...Array.from(new Set(permissions.map((p) => p.module))),
    ],
    [permissions]
  );

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return members.filter((member) =>
      [
        member.first_name,
        member.email,
        member.department,
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [members, search]);

  const filteredPermissions = useMemo(() => {
    const query = permissionSearch.trim().toLowerCase();

    return permissions.filter((permission) => {
      const matchesModule =
        moduleFilter === "Todos" ||
        permission.module === moduleFilter;

      const matchesSearch =
        permission.label.toLowerCase().includes(query) ||
        permission.key.toLowerCase().includes(query);

      return matchesModule && matchesSearch;
    });
  }, [permissions, moduleFilter, permissionSearch]);

  const modules = useMemo(
    () =>
      Array.from(
        new Set(filteredPermissions.map((permission) => permission.module))
      ),
    [filteredPermissions]
  );

  const isAllowed = (key: string): boolean => {
    // Administrator access is defined by the trusted role policy.
    if (selectedRole === "admin") return true;

    if (Object.hasOwn(currentOverrides, key)) {
      return currentOverrides[key] === true;
    }

    return rolePermissionSet.has(key);
  };

  const isCustomized = (key: string) =>
    Object.hasOwn(currentOverrides, key);

  const isDirty =
    selectedRole !== (savedRoles[selectedId] ?? selectedMember?.role) ||
    !sameOverrides(currentOverrides, currentSavedOverrides);

  const effectiveCount = permissions.filter((permission) =>
    isAllowed(permission.key)
  ).length;

  const customizedCount = Object.keys(currentOverrides).length;

  function clearMessages() {
    setFeedback("");
    setError("");
  }

  function togglePermission(key: string) {
    if (selectedRole === "admin" || isPending) return;

    setOverridesByMember((previous) => {
      const current = previous[selectedId] ?? {};
      const next = { ...current };

      const inherited = rolePermissionSet.has(key);
      const effective = Object.hasOwn(current, key)
        ? current[key]
        : inherited;

      const nextValue = !effective;

      // Remove the override if the desired value equals the role default.
      if (nextValue === inherited) {
        delete next[key];
      } else {
        next[key] = nextValue;
      }

      return {
        ...previous,
        [selectedId]: next,
      };
    });

    clearMessages();
  }

  function changeRole(role: Role) {
    if (isPending) return;

    setRoles((previous) => ({
      ...previous,
      [selectedId]: role,
    }));

    // Overrides are retained when changing roles.
    // Their effect is recalculated against the new role defaults.
    clearMessages();
  }

  function resetOverrides() {
    if (isPending || selectedRole === "admin") return;

    setOverridesByMember((previous) => ({
      ...previous,
      [selectedId]: {},
    }));

    clearMessages();
  }

  function discardChanges() {
    if (isPending) return;

    setRoles((previous) => ({
      ...previous,
      [selectedId]: savedRoles[selectedId] ?? selectedMember?.role ?? "user",
    }));

    setOverridesByMember((previous) => ({
      ...previous,
      [selectedId]: { ...currentSavedOverrides },
    }));

    clearMessages();
  }

  function selectMember(id: string) {
    if (id === selectedId) return;

    if (isDirty) {
      const confirmed = window.confirm(
        "Existem alterações por guardar. Pretende descartá-las?"
      );

      if (!confirmed) return;
    }

    setSelectedId(id);
    clearMessages();
  }

  function saveChanges() {
    if (!selectedMember || isPending || !isDirty) return;

    // Prevent malformed override keys from being submitted.
    const knownKeys = new Set(permissions.map((p) => p.key));

    const validatedOverrides = Object.fromEntries(
      Object.entries(currentOverrides).filter(
        ([key, value]) =>
          knownKeys.has(key) && typeof value === "boolean"
      )
    );

    setError("");
    setFeedback("");

    startTransition(async () => {
      try {
        const result = await onSave({
          profileId: selectedId,
          role: selectedRole,
          overrides: validatedOverrides,
        });

        if (!result.success) {
          setError(
            result.error ??
            "Não foi possível guardar as permissões."
          );
          return;
        }

        setSavedRoles((previous) => ({
          ...previous,
          [selectedId]: selectedRole,
        }));

        setSavedOverrides((previous) => ({
          ...previous,
          [selectedId]: { ...validatedOverrides },
        }));

        setOverridesByMember((previous) => ({
          ...previous,
          [selectedId]: { ...validatedOverrides },
        }));

        setFeedback("Permissões guardadas com sucesso.");
      } catch {
        setError("Ocorreu um erro ao guardar as permissões.");
      }
    });
  }

  return (
    <main className="min-h-screen bg-[#F7F7F5] p-4 text-[#002950] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1440px] space-y-7">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-[#002950] focus:outline-none focus:ring-2 focus:ring-[#BD9655]/30"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>

            <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
              <span>Equipa Sota</span>
              <span>/</span>
              <span>Gestão de acessos</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Permissões de acesso
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Defina as funções e os acessos de cada membro da equipa.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              window.alert(
                "Integre aqui o histórico de auditoria de permissões."
              )
            }
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-slate-50"
          >
            <Clock3 size={16} />
            Histórico de alterações
          </button>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={<Users size={19} />}
            label="Membros da equipa"
            value={members.length}
            description="Contas disponíveis"
          />

          <SummaryCard
            icon={<Shield size={19} />}
            label="Funções do sistema"
            value={ROLES.length}
            description="Admin, Director e Utilizador"
          />

          <SummaryCard
            icon={<ShieldCheck size={19} />}
            label="Acessos personalizados"
            value={
              Object.values(overridesByMember).filter(
                (overrides) => Object.keys(overrides).length > 0
              ).length
            }
            description="Membros com excepções"
          />
        </section>

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Membros da equipa</h2>

                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                  {filteredMembers.length}
                </span>
              </div>

              <div className="relative mb-4">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Pesquisar membro..."
                  aria-label="Pesquisar membro"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/15"
                />
              </div>

              <div className="space-y-1">
                {filteredMembers.map((member) => {
                  const active = member.profile_id === selectedId;

                  return (
                    <button
                      type="button"
                      key={member.profile_id}
                      onClick={() => selectMember(member.profile_id)}
                      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${active
                          ? "border-[#BD9655]/60 bg-[#BD9655]/10"
                          : "border-transparent hover:bg-slate-50"
                        }`}
                    >
                      <span
                        className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${active
                            ? "bg-[#002950] text-white"
                            : "bg-slate-100 text-[#002950]"
                          }`}
                      >
                        {member.initials}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {member.first_name}
                        </span>
                        <span className="mt-1 block truncate text-xs text-slate-500">
                          {member.department}
                        </span>
                      </span>

                      {active && (
                        <Check
                          size={16}
                          className="shrink-0 text-[#BD9655]"
                        />
                      )}
                    </button>
                  );
                })}

                {filteredMembers.length === 0 && (
                  <p className="py-6 text-center text-sm text-slate-500">
                    Nenhum membro encontrado.
                  </p>
                )}
              </div>
            </section>

            {selectedMember && (
              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-4">
                  <h2 className="font-semibold">Função base</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedMember.first_name}
                  </p>
                </div>

                <div className="space-y-2">
                  {ROLES.map((role) => (
                    <label
                      key={role}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${selectedRole === role
                          ? "border-[#BD9655] bg-[#BD9655]/5"
                          : "border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                      <input
                        type="radio"
                        name={`role-${selectedId}`}
                        value={role}
                        checked={selectedRole === role}
                        disabled={isPending}
                        onChange={() => changeRole(role)}
                        className="mt-1 accent-[#002950]"
                      />

                      <span className="min-w-0">
                        <span className="block text-sm font-medium">
                          {ROLE_LABELS[role]}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          {ROLE_DESCRIPTIONS[role]}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>

                {selectedRole === "admin" && (
                  <div className="mt-4 flex gap-2 rounded-lg bg-blue-50 p-3 text-xs leading-5 text-blue-900">
                    <ShieldCheck
                      size={17}
                      className="mt-0.5 shrink-0"
                    />
                    O acesso de administrador deve ser reservado a
                    utilizadores autorizados.
                  </div>
                )}
              </section>
            )}
          </aside>

          <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <h2 className="text-lg font-semibold">
                    Permissões por módulo
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Configure o acesso efectivo de cada membro.
                  </p>
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                  <ShieldCheck size={14} />
                  {ROLE_LABELS[selectedRole]}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Metric
                  label="Acessos efectivos"
                  value={effectiveCount}
                />

                <Metric
                  label="Excepções"
                  value={customizedCount}
                />

                <Metric
                  label="Estado"
                  value={isDirty ? "Por guardar" : "Guardado"}
                  small
                />
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={permissionSearch}
                    onChange={(event) =>
                      setPermissionSearch(event.target.value)
                    }
                    placeholder="Pesquisar permissões..."
                    aria-label="Pesquisar permissões"
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#BD9655]"
                  />
                </div>

                <div className="relative">
                  <select
                    value={moduleFilter}
                    onChange={(event) =>
                      setModuleFilter(event.target.value)
                    }
                    aria-label="Filtrar por módulo"
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-9 text-sm outline-none focus:border-[#BD9655] sm:w-48"
                  >
                    {moduleNames.map((module) => (
                      <option key={module} value={module}>
                        {module === "Todos"
                          ? "Todos os módulos"
                          : module}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <span className="size-2 rounded-full bg-slate-400" />
                  Herdada da função
                </span>

                <span className="inline-flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[#BD9655]" />
                  Personalizada
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setShowInherited((value) => !value)
                  }
                  className="ml-auto underline underline-offset-4 hover:text-[#002950]"
                >
                  {showInherited
                    ? "Ocultar origem"
                    : "Mostrar origem"}
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {modules.map((module) => {
                const items = filteredPermissions.filter(
                  (permission) => permission.module === module
                );

                return (
                  <div key={module}>
                    <div className="flex items-center justify-between bg-slate-50/80 px-5 py-3">
                      <h3 className="text-sm font-semibold">
                        {module}
                      </h3>

                      <span className="text-xs text-slate-500">
                        {
                          items.filter((item) =>
                            isAllowed(item.key)
                          ).length
                        }
                        /{items.length} acessos
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {items.map((permission) => {
                        const checked = isAllowed(permission.key);
                        const customized = isCustomized(permission.key);
                        const inherited = rolePermissionSet.has(
                          permission.key
                        );

                        return (
                          <label
                            key={permission.key}
                            className="flex cursor-pointer items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-slate-50"
                          >
                            <span className="min-w-0">
                              <span className="block text-sm font-medium text-slate-800">
                                {permission.label}
                              </span>

                              {showInherited && (
                                <span className="mt-1 block text-xs text-slate-500">
                                  {selectedRole === "admin"
                                    ? "Acesso total da função"
                                    : customized
                                      ? "Personalizada para este membro"
                                      : inherited
                                        ? "Herdada da função base"
                                        : "Não atribuída pela função base"}
                                </span>
                              )}
                            </span>

                            <span className="flex shrink-0 items-center gap-3">
                              {customized && (
                                <span
                                  title="Permissão personalizada"
                                  className="size-2 rounded-full bg-[#BD9655]"
                                />
                              )}

                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={
                                  isPending || selectedRole === "admin"
                                }
                                onChange={() =>
                                  togglePermission(permission.key)
                                }
                                aria-label={permission.label}
                                className="size-4 cursor-pointer rounded accent-[#002950] disabled:cursor-not-allowed disabled:opacity-50"
                              />
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {modules.length === 0 && (
                <div className="p-12 text-center text-sm text-slate-500">
                  Nenhuma permissão corresponde à pesquisa.
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 bg-white p-4 sm:p-5">
              {feedback && (
                <p
                  role="status"
                  className="mb-3 rounded-lg bg-green-50 p-3 text-sm text-green-800"
                >
                  {feedback}
                </p>
              )}

              {error && (
                <p
                  role="alert"
                  className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={discardChanges}
                  disabled={isPending || !isDirty}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <X size={15} />
                  Descartar alterações
                </button>

                <button
                  type="button"
                  onClick={saveChanges}
                  disabled={isPending || !selectedMember || !isDirty}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#002950] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#003B70] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCheck size={16} />
                  {isPending
                    ? "A guardar..."
                    : "Guardar alterações"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  description,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <span className="text-slate-400">{icon}</span>
      </div>

      <div className="mt-3 text-3xl font-semibold tracking-tight">
        {value}
      </div>

      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function Metric({
  label,
  value,
  small = false,
}: {
  label: string;
  value: string | number;
  small?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
      <p className="text-xs text-slate-500">{label}</p>

      <p
        className={`mt-1 font-semibold ${small ? "text-sm" : "text-xl"
          }`}
      >
        {value}
      </p>
    </div>
  );
}
