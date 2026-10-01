// src/app/components/management/projects/permissions/types.ts

import type { Permission } from "@/app/lib/permissions/types";

export type ProjectPermissionAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "assign"
  | "approve";

export type ProjectPermissionDefinition = {
  key: Permission;
  label: string;
  action: ProjectPermissionAction;
};

export type ProjectPermissionGroup = {
  key: string;
  label: string;
  permissions: ProjectPermissionDefinition[];
};

export type ProjectPermissionMember = {
  profileId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  projectRole: string | null;
};

export type ProjectPermissionsProps = {
  projectId: string;
  projectName: string;
  member: ProjectPermissionMember;
  initialPermissions: Permission[];
};

export const ACTION_LABELS: Record<
  ProjectPermissionAction,
  string
> = {
  view: "Ver",
  create: "Criar",
  edit: "Editar",
  delete: "Eliminar",
  assign: "Atribuir",
  approve: "Aprovar",
};

export const PROJECT_PERMISSION_GROUPS: ProjectPermissionGroup[] = [
  {
    key: "projects",
    label: "Projecto",
    permissions: [
      {
        key: "projects.view",
        label: "Ver projecto",
        action: "view",
      },
      {
        key: "projects.edit",
        label: "Editar projecto",
        action: "edit",
      },
      {
        key: "projects.delete",
        label: "Eliminar projecto",
        action: "delete",
      },
    ],
  },

  {
    key: "tasks",
    label: "Tarefas",
    permissions: [
      {
        key: "tasks.view",
        label: "Ver tarefas",
        action: "view",
      },
      {
        key: "tasks.create",
        label: "Criar tarefas",
        action: "create",
      },
      {
        key: "tasks.edit",
        label: "Editar tarefas",
        action: "edit",
      },
      {
        key: "tasks.delete",
        label: "Eliminar tarefas",
        action: "delete",
      },
      {
        key: "tasks.assign",
        label: "Atribuir tarefas",
        action: "assign",
      },
    ],
  },

  {
    key: "documents",
    label: "Documentos",
    permissions: [
      {
        key: "documents.view",
        label: "Ver documentos",
        action: "view",
      },
      {
        key: "documents.create",
        label: "Carregar documentos",
        action: "create",
      },
      {
        key: "documents.edit",
        label: "Editar documentos",
        action: "edit",
      },
      {
        key: "documents.delete",
        label: "Eliminar documentos",
        action: "delete",
      },
      {
        key: "documents.approve",
        label: "Aprovar documentos",
        action: "approve",
      },
    ],
  },

  {
    key: "submissions",
    label: "Submissões",
    permissions: [
      {
        key: "submissions.view",
        label: "Ver submissões",
        action: "view",
      },
      {
        key: "submissions.create",
        label: "Criar submissões",
        action: "create",
      },
      {
        key: "submissions.edit",
        label: "Editar submissões",
        action: "edit",
      },
      {
        key: "submissions.delete",
        label: "Eliminar submissões",
        action: "delete",
      },
      {
        key: "submissions.approve",
        label: "Aprovar submissões",
        action: "approve",
      },
    ],
  },

  {
    key: "team",
    label: "Equipa",
    permissions: [
      {
        key: "team.view",
        label: "Ver equipa",
        action: "view",
      },
      {
        key: "team.create",
        label: "Adicionar membros",
        action: "create",
      },
      {
        key: "team.edit",
        label: "Editar membros",
        action: "edit",
      },
      {
        key: "team.delete",
        label: "Remover membros",
        action: "delete",
      },
    ],
  },

  {
    key: "calendar",
    label: "Calendário",
    permissions: [
      {
        key: "calendar.view",
        label: "Ver calendário",
        action: "view",
      },
    ],
  },
];