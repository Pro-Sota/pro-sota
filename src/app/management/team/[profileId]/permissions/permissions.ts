export type PermissionAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "assign"
  | "approve";

export type PermissionDefinition = {
  key: string;
  label: string;
  module: string;
  actions: PermissionAction[];
};

export const PERMISSIONS: PermissionDefinition[] = [
  {
    key: "dashboard",
    label: "Visão geral",
    module: "dashboard",
    actions: ["view"],
  },
  {
    key: "leads",
    label: "Leads",
    module: "leads",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    key: "projects",
    label: "Projectos",
    module: "projects",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    key: "tasks",
    label: "Tarefas",
    module: "tasks",
    actions: ["view", "create", "edit", "delete", "assign"],
  },
  {
    key: "calendar",
    label: "Calendário",
    module: "calendar",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    key: "messages",
    label: "Mensagens",
    module: "messages",
    actions: ["view", "create", "delete"],
  },
  {
    key: "documents",
    label: "Documentos",
    module: "documents",
    actions: ["view", "create", "edit", "delete", "approve"],
  },
  {
    key: "clients",
    label: "Clientes",
    module: "clients",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    key: "team",
    label: "Equipa Sota",
    module: "team",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    key: "attendance",
    label: "Presença",
    module: "attendance",
    actions: ["view", "create", "edit"],
  },
  {
    key: "work_resources",
    label: "Recursos de obra",
    module: "work_resources",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    key: "suppliers",
    label: "Fornecedores",
    module: "suppliers",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    key: "reports",
    label: "Relatórios",
    module: "reports",
    actions: ["view", "create"],
  },
  {
    key: "users",
    label: "Utilizadores",
    module: "users",
    actions: ["view", "create", "edit", "delete"],
  },
];

export const ACTION_LABELS: Record<PermissionAction, string> = {
  view: "Ver",
  create: "Criar",
  edit: "Editar",
  delete: "Apagar",
  assign: "Atribuir",
  approve: "Aprovar",
};

export const ROLE_OPTIONS = [
  {
    id: 1,
    name: "Superadmin",
    description: "Acesso total ao sistema.",
  },
  {
    id: 2,
    name: "Admin",
    description: "Gestão administrativa e operacional.",
  },
  {
    id: 3,
    name: "Director",
    description: "Supervisão e gestão da sua área.",
  },
  {
    id: 4,
    name: "Utilizador",
    description: "Acesso às funcionalidades operacionais.",
  },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<
  number,
  Record<string, PermissionAction[]>
> = {
  1: {
    dashboard: ["view"],
    leads: ["view", "create", "edit", "delete"],
    projects: ["view", "create", "edit", "delete"],
    tasks: ["view", "create", "edit", "delete", "assign"],
    calendar: ["view", "create", "edit", "delete"],
    messages: ["view", "create", "delete"],
    documents: ["view", "create", "edit", "delete", "approve"],
    clients: ["view", "create", "edit", "delete"],
    team: ["view", "create", "edit", "delete"],
    attendance: ["view", "create", "edit"],
    work_resources: ["view", "create", "edit", "delete"],
    suppliers: ["view", "create", "edit", "delete"],
    reports: ["view", "create"],
    users: ["view", "create", "edit", "delete"],
  },

  2: {
    dashboard: ["view"],
    leads: ["view", "create", "edit"],
    projects: ["view", "create", "edit"],
    tasks: ["view", "create", "edit", "assign"],
    calendar: ["view", "create", "edit"],
    messages: ["view", "create"],
    documents: ["view", "create", "edit", "approve"],
    clients: ["view", "create", "edit"],
    team: ["view", "edit"],
    attendance: ["view"],
    work_resources: ["view", "create", "edit"],
    suppliers: ["view", "create", "edit"],
    reports: ["view", "create"],
    users: ["view", "edit"],
  },

  3: {
    dashboard: ["view"],
    leads: ["view"],
    projects: ["view", "create", "edit"],
    tasks: ["view", "create", "edit", "assign"],
    calendar: ["view", "create", "edit"],
    messages: ["view", "create"],
    documents: ["view", "create", "edit", "approve"],
    clients: ["view", "edit"],
    team: ["view"],
    attendance: ["view"],
    work_resources: ["view"],
    suppliers: ["view"],
    reports: ["view"],
    users: ["view"],
  },

  4: {
    dashboard: ["view"],
    projects: ["view"],
    tasks: ["view", "create", "edit"],
    calendar: ["view", "create", "edit"],
    messages: ["view", "create"],
    documents: ["view", "create"],
    clients: ["view"],
    attendance: ["view"],
  },
};