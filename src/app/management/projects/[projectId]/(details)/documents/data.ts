import { DocumentType, FolderType } from "./types";

export const mockDocuments: DocumentType[] = [
  {
    id: "1",
    name: "Contrato de Prestação de Serviços.pdf",
    category: "Pdf",
    createdBy: "Ana Silva",
    uploadedAt: "12 Jun 2026",
    folder_id: "5",
    document_type: ".pdf",
    revision_id: ""
  },
  {
    id: "2",
    name: "Planta Arquitetónica - Piso 1.dwg",
    category: "Dwg",
    createdBy: "João Pereira",
    uploadedAt: "08 Jun 2026",
    folder_id: "1.2",
    document_type: ".dwg",
    revision_id: ""
  },
  {
    id: "3",
    name: "Relatório de Fiscalização - Maio.pdf",
    category: "Pdf",
    createdBy: "Marta Costa",
    uploadedAt: "02 Jun 2026",
    folder_id: "4",
    document_type: ".pdf",
    revision_id: ""
  },
  {
    id: "4",
    name: "Cronograma de Obra.xlsx",
    category: "Xlsx",
    createdBy: "Ana Silva",
    uploadedAt: "28 Mai 2026",
    folder_id: "2.2",
    document_type: ".xlsx",
    revision_id: ""
  },
  {
    id: "5",
    name: "Memória Descritiva.docx",
    category: "Docx",
    createdBy: "Carlos Mendes",
    uploadedAt: "20 Mai 2026",
    folder_id: "3.2",
    document_type: ".docx",
    revision_id: ""
  },
];

export const folders: FolderType[] = [
  {
    id: "1",
    name: "Arquitectura",
    parent_folder_id: "null",
    project_id: "1",
    createdBy: "System",
    createdAt: "20 Mai 2026",
    path: "/architecture"
  },
  {
    id: "1.2",
    name: "Estudos",
    parent_folder_id: "1",
    project_id: "1",
    createdBy: "System",
    createdAt: "20 Mai 2026",
    path: "/architecture/studies"
  },
  {
    id: "1.3",
    name: "Plantas",
    parent_folder_id: "1",
    project_id: "1",
    createdBy: "System",
    createdAt: "20 Mai 2026",
    path: "/architecture/plants"
  },
  {
    id: "1.4",
    name: "Renders",
    parent_folder_id: "1",
    project_id: "1",
    createdBy: "System",
    createdAt: "20 Mai 2026",
    path: "/architecture/renders"
  },

  {
    id: "2",
    name: "Engenharia",
    parent_folder_id: "null",
    project_id: "1",
    createdBy: "System",
    createdAt: "20 Mai 2026",
    path: "/engineering"
  },
  {
    id: "2.1",
    name: "Memória de Cálculo",
    parent_folder_id: "2",
    project_id: "1",
    createdBy: "System",
    createdAt: "20 Mai 2026",
    path: "/engineering/memory-calculation"
  },
  {
    id: "2.2",
    name: "Plantas",
    parent_folder_id: "2",
    project_id: "1",
    createdBy: "System",
    createdAt: "20 Mai 2026",
    path: "/engineering/plants"
  },
  {
    id: "3",
    name: "Construção",
    parent_folder_id: "null",
    project_id: "1",
    createdBy: "System",
    createdAt: "20 Mai 2026",
    path: "/construction"
  },
  {
    id: "3.1",
    name: "Cronograma",
    parent_folder_id: "3",
    project_id: "1",
    createdBy: "System",
    createdAt: "20 Mai 2026",
    path: "/construction/chronogram"
  },
  {
    id: "3.2",
    name: "Plano de obra",
    parent_folder_id: "3",
    project_id: "1",
    createdBy: "System",
    createdAt: "20 Mai 2026",
    path: "/construction/work-plan"
  },
  {
    id: "3.3",
    name: "Relatório diário de obra",
    parent_folder_id: "3",
    project_id: "1",
    createdBy: "System",
    createdAt: "20 Mai 2026",
    path: "/construction/daily-work-report"
  },
  {
    id: "3.4",
    name: "Relatório fotográfico",
    parent_folder_id: "3",
    project_id: "1",
    createdBy: "System",
    createdAt: "20 Mai 2026",
    path: "/construction/photographic-report"
  },
  {
    id: "3.5",
    name: "Requisição",
    parent_folder_id: "3",
    project_id: "1",
    createdBy: "System",
    createdAt: "20 Mai 2026",
    path: "/construction/requisition"
  },
  {
    id: "4",
    name: "Fiscalização",
    parent_folder_id: "null",
    project_id: "1",
    createdBy: "System",
    createdAt: "20 Mai 2026",
    path: "/inspection"
  },
  {
    id: "5",
    name: "Orçamento",
    parent_folder_id: "null",
    project_id: "1",
    createdBy: "System",
    createdAt: "20 Mai 2026",
    path: "/budget"
  },
];