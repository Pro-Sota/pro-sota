"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import {
  ACTION_LABELS,
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSIONS,
  ROLE_OPTIONS,
  type PermissionAction,
} from "./permissions";

type Profile = {
  profileId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  roleId: number | null;
  department: string | null;
};

type Props = {
  profile: Profile;
};

type PermissionState = Record<string, PermissionAction[]>;

export default function PermissionsPage({ profile }: Props) {
  const initialRole = profile.roleId ?? 4;

  const [roleId, setRoleId] = useState(initialRole);

  const [permissions, setPermissions] = useState<PermissionState>(
    DEFAULT_ROLE_PERMISSIONS[initialRole] ?? {},
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const role = useMemo(
    () => ROLE_OPTIONS.find((item) => item.id === roleId),
    [roleId],
  );

  function changeRole(nextRoleId: number) {
    setRoleId(nextRoleId);

    setPermissions(
      structuredClone(DEFAULT_ROLE_PERMISSIONS[nextRoleId] ?? {}),
    );

    setSaved(false);
  }

  function hasPermission(
    module: string,
    action: PermissionAction,
  ): boolean {
    return permissions[module]?.includes(action) ?? false;
  }

  function togglePermission(
    module: string,
    action: PermissionAction,
  ) {
    setSaved(false);

    setPermissions((current) => {
      const currentActions = current[module] ?? [];
      const exists = currentActions.includes(action);

      const nextActions = exists
        ? currentActions.filter((item) => item !== action)
        : [...currentActions, action];

      return {
        ...current,
        [module]: nextActions,
      };
    });
  }

  function toggleModule(module: string, enabled: boolean) {
    const definition = PERMISSIONS.find(
      (permission) => permission.module === module,
    );

    if (!definition) return;

    setSaved(false);

    setPermissions((current) => ({
      ...current,
      [module]: enabled ? [...definition.actions] : [],
    }));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);

    try {
      /*
       * Ligação à Server Action:
       *
       * await updateUserPermissions({
       *   profileId: profile.profileId,
       *   roleId,
       *   permissions,
       * });
       *
       * A Server Action deve validar se o utilizador actual
       * possui autorização para alterar permissões.
       */

      await new Promise((resolve) => setTimeout(resolve, 500));

      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  const fullName =
    `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim();

  return (
    <div className="min-h-full bg-[#F7F7F5]">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <div className="mb-6">
          <Link
            href="/management/team"
            className="mb-5 inline-flex items-center gap-2 text-sm text-[#667085] transition hover:text-[#002950]"
          >
            <ArrowLeft size={16} />
            Voltar à equipa
          </Link>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#002950] text-sm font-semibold text-white">
                {getInitials(profile.firstName, profile.lastName)}
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#002950]">
                  Permissões
                </h1>

                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#667085]">
                  <span>{fullName || "Utilizador"}</span>

                  {profile.department && (
                    <>
                      <span>·</span>
                      <span>{profile.department}</span>
                    </>
                  )}

                  {profile.email && (
                    <>
                      <span>·</span>
                      <span>{profile.email}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#002950] px-5 text-sm font-medium text-white transition hover:bg-[#003866] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saved && <Check size={16} />}
              {saving
                ? "A guardar..."
                : saved
                  ? "Guardado"
                  : "Guardar alterações"}
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="h-fit rounded-xl border border-[#E4E7EC] bg-white p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3F0EA] text-[#BD9655]">
                <ShieldCheck size={18} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-[#002950]">
                  Role do sistema
                </h2>

                <p className="text-xs text-[#98A2B3]">
                  Permissões base do utilizador
                </p>
              </div>
            </div>

            <div className="relative">
              <select
                value={roleId}
                onChange={(event) =>
                  changeRole(Number(event.target.value))
                }
                className="h-11 w-full appearance-none rounded-lg border border-[#D0D5DD] bg-white px-3 pr-10 text-sm font-medium text-[#344054] outline-none transition focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10"
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]"
              />
            </div>

            {role && (
              <div className="mt-4 rounded-lg bg-[#F7F7F5] p-4">
                <p className="text-sm font-medium text-[#002950]">
                  {role.name}
                </p>

                <p className="mt-1 text-xs leading-5 text-[#667085]">
                  {role.description}
                </p>
              </div>
            )}

            <div className="mt-6 border-t border-[#EAECF0] pt-5">
              <div className="flex items-start gap-3">
                <UserRound
                  size={16}
                  className="mt-0.5 text-[#667085]"
                />

                <div>
                  <p className="text-xs font-medium text-[#344054]">
                    Acesso baseado no role
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#98A2B3]">
                    Alterar o role redefine as permissões para os
                    valores padrão desse nível.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <main className="overflow-hidden rounded-xl border border-[#E4E7EC] bg-white">
            <div className="border-b border-[#EAECF0] px-6 py-5">
              <h2 className="text-base font-semibold text-[#002950]">
                Permissões do sistema
              </h2>

              <p className="mt-1 text-sm text-[#667085]">
                Define exactamente o que este utilizador pode
                consultar e executar em cada módulo.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr className="border-b border-[#EAECF0] bg-[#FCFCFB]">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                      Módulo
                    </th>

                    {getAllActions().map((action) => (
                      <th
                        key={action}
                        className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#667085]"
                      >
                        {ACTION_LABELS[action]}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {PERMISSIONS.map((permission) => {
                    const enabledCount =
                      permission.actions.filter((action) =>
                        hasPermission(permission.module, action),
                      ).length;

                    const moduleEnabled =
                      enabledCount === permission.actions.length;

                    return (
                      <tr
                        key={permission.module}
                        className="border-b border-[#F0F2F4] last:border-0"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                toggleModule(
                                  permission.module,
                                  !moduleEnabled,
                                )
                              }
                              aria-label={
                                moduleEnabled
                                  ? `Desactivar ${permission.label}`
                                  : `Activar ${permission.label}`
                              }
                              className={[
                                "flex h-5 w-5 items-center justify-center rounded border transition",
                                moduleEnabled
                                  ? "border-[#002950] bg-[#002950] text-white"
                                  : "border-[#D0D5DD] bg-white",
                              ].join(" ")}
                            >
                              {moduleEnabled && <Check size={13} />}
                            </button>

                            <div>
                              <p className="text-sm font-medium text-[#344054]">
                                {permission.label}
                              </p>

                              <p className="text-xs text-[#98A2B3]">
                                {enabledCount} de{" "}
                                {permission.actions.length} permissões
                              </p>
                            </div>
                          </div>
                        </td>

                        {getAllActions().map((action) => {
                          const available =
                            permission.actions.includes(action);

                          const checked = hasPermission(
                            permission.module,
                            action,
                          );

                          return (
                            <td
                              key={action}
                              className="px-3 py-4 text-center"
                            >
                              {available ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    togglePermission(
                                      permission.module,
                                      action,
                                    )
                                  }
                                  aria-label={`${checked ? "Remover" : "Adicionar"} ${ACTION_LABELS[action]} em ${permission.label}`}
                                  className={[
                                    "mx-auto flex h-7 w-7 items-center justify-center rounded-md border transition",
                                    checked
                                      ? "border-[#002950] bg-[#002950] text-white"
                                      : "border-[#D0D5DD] bg-white text-transparent hover:border-[#98A2B3]",
                                  ].join(" ")}
                                >
                                  <Check size={15} />
                                </button>
                              ) : (
                                <span className="text-[#D0D5DD]">
                                  —
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-[#EAECF0] bg-[#FCFCFB] px-6 py-4">
              <p className="text-xs leading-5 text-[#667085]">
                As alterações só ficam efectivas depois de serem
                guardadas.
              </p>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#002950] px-4 text-sm font-medium text-white transition hover:bg-[#003866] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "A guardar..." : "Guardar"}
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function getInitials(
  firstName: string | null,
  lastName: string | null,
) {
  const first = firstName?.trim().charAt(0) ?? "";
  const last = lastName?.trim().charAt(0) ?? "";

  return `${first}${last}`.toUpperCase() || "U";
}

function getAllActions(): PermissionAction[] {
  return ["view", "create", "edit", "delete", "assign", "approve"];
}