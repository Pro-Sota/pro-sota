import {
  BarChart3,
  BriefcaseBusiness,
  Calculator,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  CreditCard,
  FileCheck2,
  FileText,
  FolderOpen,
  HardHat,
  Receipt,
  Wallet,
} from "lucide-react";

export type Tab =
  | "overview"
  | "budget"
  | "costs"
  | "invoices"
  | "payments"
  | "site"
  | "documents";

export const TABS = [
  {
    id: "overview" as Tab,
    label: "Resumo",
    icon: BarChart3,
  },
  {
    id: "budget" as Tab,
    label: "Orçamento",
    icon: Calculator,
  },
  {
    id: "costs" as Tab,
    label: "Custos",
    icon: Wallet,
  },
  {
    id: "invoices" as Tab,
    label: "Facturação",
    icon: Receipt,
  },
  {
    id: "payments" as Tab,
    label: "Pagamentos",
    icon: CreditCard,
  },
  {
    id: "site" as Tab,
    label: "Obra",
    icon: HardHat,
  },
  {
    id: "documents" as Tab,
    label: "Documentos",
    icon: FolderOpen,
  },
] as const;

export const FINANCIAL_DATA = {
  approvedBudget: 12_500_000,
  contractedValue: 11_800_000,
  actualCost: 7_450_000,
  invoiced: 8_200_000,
  received: 6_500_000,
  pending: 1_700_000,
};

export const ACTIVITY_DATA = [
  {
    title: "Factura #FT-2026-004",
    description: "Factura emitida",
    value: "+ 1.200.000 Kz",
    date: "Hoje",
  },
  {
    title: "Pagamento recebido",
    description: "Transferência bancária",
    value: "+ 850.000 Kz",
    date: "Ontem",
  },
  {
    title: "Custo de materiais",
    description: "Fornecedor de materiais",
    value: "- 420.000 Kz",
    date: "22 Ago 2026",
  },
  {
    title: "Revisão do orçamento",
    description: "Revisão #03 aprovada",
    value: "12.500.000 Kz",
    date: "20 Ago 2026",
  },
];

export const SITE_SECTIONS = [
  {
    title: "Autos de medição",
    description: "Medições e trabalhos executados.",
    icon: ClipboardCheck,
  },
  {
    title: "Relatórios de obra",
    description: "Relatórios de acompanhamento.",
    icon: FileText,
  },
  {
    title: "Ocorrências",
    description: "Incidentes e situações registadas.",
    icon: HardHat,
  },
  {
    title: "Não conformidades",
    description: "Problemas e acções correctivas.",
    icon: FileCheck2,
  },
];

export const DOCUMENT_SECTIONS = [
  {
    title: "Propostas",
    description: "Propostas comerciais e versões submetidas.",
    icon: FileText,
  },
  {
    title: "Contratos",
    description: "Contratos e documentos de adjudicação.",
    icon: FileCheck2,
  },
  {
    title: "Autos",
    description: "Autos de medição e documentos de obra.",
    icon: ClipboardCheck,
  },
  {
    title: "Facturas",
    description: "Facturas emitidas e recebidas.",
    icon: Receipt,
  },
  {
    title: "Recibos",
    description: "Recibos e comprovativos de pagamento.",
    icon: CreditCard,
  },
  {
    title: "Outros documentos",
    description: "Documentos financeiros adicionais.",
    icon: FolderOpen,
  },
];