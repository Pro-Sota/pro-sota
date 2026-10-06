// src/app/components/management/projects/permissions/project_permissions.tsx

"use client";

import { useMemo, useState } from "react";
import type { Permission } from "@/app/lib/permissions/types";

import { PROJECT_PERMISSION_GROUPS } from "./types";
import type { ProjectPermissionsProps } from "./types";

import PermissionMemberHeader from "./member_header";
import PermissionGroup from "./permission_group";
import PermissionSummary from "./permission_summary";
import PermissionSaveBar from "./save_bar";

import { updateProjectPermissions } from "@/actions/project_permission";
import { useToast } from "@/app/components/toast/use_toast";

export default function ProjectPermissions({
  projectId,
  projectName,
  member,
  initialPermissions,
}: ProjectPermissionsProps) {
  const [selected, setSelected] = useState<Set<Permission>>(
    () => new Set(initialPermissions),
  );

  const toast = useToast();

  const [saving, setSaving] = useState(false);

  const initialSet = useMemo(
    () => new Set(initialPermissions),
    [initialPermissions],
  );

  const dirty = useMemo(() => {
    if (selected.size !== initialSet.size) {
      return true;
    }

    for (const permission of selected) {
      if (!initialSet.has(permission)) {
        return true;
      }
    }

    return false;
  }, [selected, initialSet]);

  function handleChange(
    permission: Permission,
    checked: boolean,
  ) {
    setSelected((current) => {
      const next = new Set(current);

      if (checked) {
        next.add(permission);
      } else {
        next.delete(permission);
      }

      return next;
    });
  }

  async function handleSave() {
    if (!dirty || saving) {
      return;
    }

    setSaving(true);

    try {
      await updateProjectPermissions(
        projectId,
        member.profileId,
        Array.from(selected),
      );

      toast.info(
        "Permissões actualizadas com sucesso.",
      );
    } catch (error) {
      console.error(error);

      toast.info(

        error instanceof Error
          ? error.message
          : "Não foi possível guardar as permissões.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="w-full">
      {/* Header */}
      <div className="border-b border-[#E8E8E2] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#BD9655]">
                {projectName}
              </p>

              <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-[#002950]">
                Permissões do projecto
              </h2>

              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-gray-500">
                Defina exactamente o que este membro pode consultar,
                criar, editar, eliminar ou gerir neste projecto.
              </p>
            </div>

            {dirty && (
              <span className="hidden shrink-0 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 sm:inline-flex">
                Alterações por guardar
              </span>
            )}
          </div>

          <PermissionMemberHeader
            member={member}
            projectName=""
            permissionCount={0}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="border-b border-[#E8E8E2] bg-[#FAFAF8] px-5 py-4 sm:px-6">
        <PermissionSummary selected={selected} />
      </div>

      {/* Permission groups */}
      <div className="p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-[#002950]">
              Acessos disponíveis
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              As permissões aplicam-se apenas a este projecto.
            </p>
          </div>

          <span className="shrink-0 text-xs font-medium text-gray-400">
            {PROJECT_PERMISSION_GROUPS.length}{" "}
            {PROJECT_PERMISSION_GROUPS.length === 1
              ? "grupo"
              : "grupos"}
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {PROJECT_PERMISSION_GROUPS.map((group) => (
            <PermissionGroup
              key={group.key}
              group={group}
              selected={selected}
              disabled={saving}
              onChange={handleChange}
            />
          ))}
        </div>
      </div>

      {/* Save bar */}
      <PermissionSaveBar
        saving={saving}
        dirty={dirty}
        onSave={handleSave}
      />
    </section>
  );
}