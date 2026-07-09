import { DocumentType, FolderType } from "./types";

export const mockDocuments: DocumentType[] = [
  {
    id: "1",
    name: "Contrato de Prestação de Serviços.pdf",
    category: "Contratos",
    createdBy: "Ana Silva",
    uploadedAt: "12 Jun 2026",
    folder_id: "5",
    document_type: "pdf",
    revision_id: ""
  },
  {
    id: "2",
    name: "Planta Arquitetónica - Piso 1.dwg",
    category: "Arquitetura",
    createdBy: "João Pereira",
    uploadedAt: "08 Jun 2026",
    folder_id: "1",
    document_type: "dwg",
    revision_id: ""
  },
  {
    id: "3",
    name: "Relatório de Fiscalização - Maio.pdf",
    category: "Fiscalização",
    createdBy: "Marta Costa",
    uploadedAt: "02 Jun 2026",
    folder_id: "4",
    document_type: "pdf",
    revision_id: ""
  },
  {
    id: "4",
    name: "Cronograma de Obra.xlsx",
    category: "Construção",
    createdBy: "Ana Silva",
    uploadedAt: "28 Mai 2026",
    folder_id: "2",
    document_type: "xlsx",
    revision_id: ""
  },
  {
    id: "5",
    name: "Memória Descritiva.docx",
    category: "Engenharia",
    createdBy: "Carlos Mendes",
    uploadedAt: "20 Mai 2026",
    folder_id: "3",
    document_type: "docx",
    revision_id: ""
  },
];

export const folders: FolderType[] = [
  {
    id: "1",
    name: "architecture",
    parent_folder_id: "null",
    project_id: "1",
    createdBy: "System",
    createdAt: ""
  },
  {
    id: "1.2",
    name: "studies",
    parent_folder_id: "1",
    project_id: "1",
    createdBy: "System",
    createdAt: "",
  },
  {
    id: "1.3",
    name: "plants",
    parent_folder_id: "1",
    project_id: "1",
    createdBy: "System",
    createdAt: "",
  },
  {
    id: "1.4",
    name: "renders",
    parent_folder_id: "1",
    project_id: "1",
    createdBy: "System",
    createdAt: "",
  },

  {
    id: "2",
    name: "engineering",
    parent_folder_id: "null",
    project_id: "1",
    createdBy: "System",
    createdAt: ""
  },
  {
    id: "2.1",
    name: "memory-calculation",
    parent_folder_id: "2",
    project_id: "1",
    createdBy: "System",
    createdAt: "",
  },
  {
    id: "2.2",
    name: "plants",
    parent_folder_id: "2",
    project_id: "1",
    createdBy: "System",
    createdAt: "",
  },
  {
    id: "3",
    name: "construction",
    parent_folder_id: "null",
    project_id: "1",
    createdBy: "System",
    createdAt: ""
  },
  {
    id: "3.1",
    name: "chronogram",
    parent_folder_id: "3",
    project_id: "1",
    createdBy: "System",
    createdAt: "",
  },
  {
    id: "3.2",
    name: "work-plan",
    parent_folder_id: "3",
    project_id: "1",
    createdBy: "System",
    createdAt: "",
  },
  {
    id: "3.3",
    name: "daily-work-report",
    parent_folder_id: "3",
    project_id: "1",
    createdBy: "System",
    createdAt: "",
  },
  {
    id: "3.4",
    name: "photographic-report",
    parent_folder_id: "3",
    project_id: "1",
    createdBy: "System",
    createdAt: "",
  },
  {
    id: "3.5",
    name: "requisition",
    parent_folder_id: "3",
    project_id: "1",
    createdBy: "System",
    createdAt: "",
  },
  {
    id: "4",
    name: "inspection",
    parent_folder_id: "null",
    project_id: "1",
    createdBy: "System",
    createdAt: "",
  },
  {
    id: "5",
    name: "budget",
    parent_folder_id: "null",
    project_id: "1",
    createdBy: "System",
    createdAt: "",
  },
];