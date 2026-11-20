/* Shared constants for the project overview page. */

/** One locale for every formatter (dates, numbers, currency). */
export const LOCALE = "pt-AO";
export const CURRENCY = "AOA";
export const PROJECT_TIME_ZONE = "Africa/Luanda";

export const NO_DEADLINE = "Sem prazo";
export const NOT_DEFINED = "Não definido";

export const REMAINING_DAYS_WARNING_THRESHOLD = 14;

/**
 * Brand styling in one place. If you add `brand` to your Tailwind theme
 * (e.g. colors: { brand: "#002950" }), swap the arbitrary values below for
 * `ring-brand` / `bg-brand` and nothing else needs to change.
 */
export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950]";
export const FOCUS_RING_INSET = `${FOCUS_RING} focus-visible:ring-inset`;
export const BRAND_BG = "bg-[#002950]";
export const PAGE_BG = "bg-[#F7F7F5]";

/* Sub-routes of /management/projects/[id]. Adjust if your routes differ. */
export const ROUTES = {
  tasks: "tasks",
  rfis: "rfis",
  submissions: "submissions",
  risks: "risks",
  edit: "edit",
} as const;

/* Section anchor ids (used by KPI cards to scroll to a section). */
export const SECTION_IDS = {
  schedule: "cronograma",
  approvals: "aprovacoes",
  rfis: "rfis",
  submissions: "submissoes",
  risks: "riscos",
  budget: "orcamento",
} as const;

// Plan vs Actual thresholds (percentage points)
export const PLAN_TOLERANCE = 5;
export const PLAN_SEVERE = 15;

export const CLOSED_STATUSES = [
  "concluído",
  "concluída",
  "respondido",
  "respondida",
  "fechado",
  "fechada",
  "aprovado",
  "aprovada",
  "rejeitado",
  "rejeitada",
  "cancelado",
  "cancelada",
] as const;


/** Every user-facing string lives here (swap for an i18n library later). */
export const LABELS = {
  // KPIs
  progress: "Progresso",
  remainingDays: "Dias restantes",
  openQuestions: "Questões abertas",
  completedTasks: "Tarefas concluídas",
  pendingApprovals: "Aprovações pendentes",
  kpiAria: "Indicadores do projecto",
  overdue: "Atrasado",
  daysShort: "d",

  // Sections
  schedule: "Cronograma do projecto",
  projectRisks: "Riscos do projecto",
  recentActivities: "Actividades recentes",
  rfis: "Solicitações de informação",
  submissions: "Submissões",
  budgetByPhase: "Orçamento por fase",

  // Actions
  viewAll: "Ver todos",
  viewTasks: "Ver tarefas",
  collapse: "Recolher",
  expand: "Expandir",
  editProject: "Editar projecto",

  // Header
  location: "Localização",
  type: "Tipo",
  start: "Início",
  end: "Conclusão",
  unnamedProject: "Projecto sem nome",
  statusUndefined: "Estado não definido",
  defaultCode: "Pro-Sota",
  defaultCountry: "Angola",

  // Empty states
  dataWillAppear:
    "Esta secção será preenchida quando existirem registos disponíveis.",
  emptySchedule: "Sem fases no cronograma",
  emptyScheduleMessage:
    "Ainda não existem fases neste projecto. Adicione fases para visualizar o cronograma.",
  emptyRisks: "Sem riscos registados",
  emptyActivities: "Sem actividades recentes",
  emptyRfis: "Sem solicitações de informação",
  emptySubmissions: "Sem submissões",
  emptyApprovals: "Sem aprovações pendentes",
  emptyApprovalsMessage: "Não existem submissões pendentes de revisão.",
  emptyBudget: "Sem orçamento por fase",

  // Misc
  due: "Prazo",
  submittedOn: "Submetido em",
  unknownUser: "Utilizador desconhecido",
  unknownDate: "Data desconhecida",
  severity: "Severidade",

  // Budget
  budgetExecution: "Execução do orçamento",
  executed: "executado",
  totalExecuted: "Total executado",
  budgetNotDefined: "Orçamento não definido",
  spentWithoutBudget: "Gasto sem orçamento definido",
  overBy: "Excedido em",
  balance: "Saldo",

  // Change Orders
  changeOrders: "Ordens de alteração",
  changeOrder: "Ordem de alteração",
  changeOrderValue: "Valor da alteração",
  emptyChangeOrders: "Sem ordens de alteração",
  emptyChangeOrdersMessage:
    "Ainda não existem ordens de alteração registadas neste projecto.",

  // Team
  team: "Equipa",
  teamMember: "Membro da equipa",
  role: "Função",
  openRfis: "Solicitações abertas",
  openTasks: "Tarefas em aberto",
  overdueTasks: "Tarefas atrasadas",
  teamOpenRfis: "Pedidos de esclarecimento em aberto",
  teamOpenTasks: "Tarefas em aberto",
  teamOverdue: "Em atraso",
  emptyTeam: "Sem membros na equipa",
  emptyTeamMessage: "Ainda não existem membros associados a este projecto.",

  // Documents
  documents: "Documentos",
  document: "Documento",
  revision: "Revisão",
  uploadedBy: "Carregado por",
  uploadedAt: "Carregado em",
  downloadDocument: "Descarregar documento",
  emptyDocuments: "Sem documentos disponíveis",



  // Issues
  issues: "Ocorrências",
  issue: "Ocorrência",
  issueLocation: "Local da ocorrência",
  openIssues: "ocorrências em aberto",
  emptyIssues: "Sem ocorrências registadas",

  // Site Reports
  siteReports: "Relatórios de obra",
  siteReport: "Relatório de obra",
  headcount: "Número de trabalhadores",
  weatherDelay: "Atraso devido às condições meteorológicas",
  workers: "trabalhadores",
  emptySiteReports: "Sem relatórios de obra",

  // Site Photos
  sitePhotos: "Fotografias da obra",
  sitePhoto: "Fotografia",
  photoCaption: "Legenda",
  takenAt: "Capturado em",
  emptySitePhotos: "Sem fotografias da obra",

  // Safety
  safety: "Segurança",
  safetySummary: "Resumo de segurança",
  daysSinceIncident: "Dias sem incidentes",
  openActions: "Acções pendentes",
  incidents: "Incidentes",
  incident: "Incidente",
  emptySafety: "Sem incidentes registados",

  // Procurement
  procurement: "Aprovisionamento",
  procurementItem: "Material / Equipamento",
  expectedDelivery: "Entrega prevista",
  requiredBy: "Necessário até",
  longLead: "Prazo de fornecimento alargado",
  deliveryRisk: "Risco de atraso na entrega",
  emptyProcurement: "Sem materiais ou equipamentos registados",

  // Additional statuses
  status: "Estado",
  date: "Data",
  value: "Valor",
  title: "Título",
  name: "Nome",
  summary: "Resumo",
  description: "Descrição",
  // Site Reports

  // Status labels
  statusCompleted: "Concluído",
  statusAnswered: "Respondido",
  statusOpen: "Aberto",
  statusOverdue: "Atrasado",
  statusPending: "Pendente",
  statusForReview: "Para revisão",

  // Plan vs Actual
  planVsActual: "Planeado vs. executado",
  planBasis: "Comparação do progresso planeado com o progresso real das tarefas.",
  planned: "Planeado",
  actual: "Executado",
  ahead: "Adiantado",
  onTrack: "Dentro do prazo",
  slightlyBehind: "Ligeiramente atrasado",
  behind: "Atrasado",
  pointsShort: "p.p.",
  emptyPlan: "Sem dados de progresso",
  emptyPlanMessage:
    "Não existem tarefas com datas de início e conclusão válidas para comparar o progresso planeado com o executado.",

  // Upcoming Deadlines
  upcomingDeadlines: "Próximos prazos",
  emptyUpcoming: "Sem prazos próximos",
  emptyUpcomingMessage:
    "Não existem tarefas, marcos ou entregas com prazos próximos.",

  // Overdue Items
  overdueItems: "Itens atrasados",
  emptyOverdue: "Tudo em dia",
  emptyOverdueMessage:
    "Não existem tarefas, marcos ou entregas com prazos ultrapassados.",

  // Deadline Types
  kindTask: "Tarefa",
  kindDeliverable: "Entrega",
  kindRfi: "Solicitação de informação",
  kindSubmission: "Submissão",

  // Relative Dates
  today: "Hoje",
  tomorrow: "Amanhã",
  inDays: "Em",
  days: "dias",
  lateBy: "Atrasado há",
  oneDay: "1 dia",



} as const;