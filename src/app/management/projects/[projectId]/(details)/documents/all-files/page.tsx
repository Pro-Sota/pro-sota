"use client";

import { useState, useMemo } from "react";
import { FileText, Search, Upload, Download, MoreVertical } from "lucide-react";

interface Document {
  id: string;
  name: string;
  category: string;
  uploadedBy: string;
  uploadedAt: string;
  size: string;
}

// Replace with real data (props, fetch, server component, etc.)
const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Contrato de Prestação de Serviços.pdf",
    category: "Contratos",
    uploadedBy: "Ana Silva",
    uploadedAt: "12 Jun 2026",
    size: "1.2 MB",
  },
  {
    id: "2",
    name: "Planta Arquitetónica - Piso 1.dwg",
    category: "Arquitetura",
    uploadedBy: "João Pereira",
    uploadedAt: "08 Jun 2026",
    size: "8.4 MB",
  },
  {
    id: "3",
    name: "Relatório de Fiscalização - Maio.pdf",
    category: "Fiscalização",
    uploadedBy: "Marta Costa",
    uploadedAt: "02 Jun 2026",
    size: "640 KB",
  },
  {
    id: "4",
    name: "Cronograma de Obra.xlsx",
    category: "Construção",
    uploadedBy: "Ana Silva",
    uploadedAt: "28 Mai 2026",
    size: "310 KB",
  },
  {
    id: "5",
    name: "Memória Descritiva.docx",
    category: "Engenharia",
    uploadedBy: "Carlos Mendes",
    uploadedAt: "20 Mai 2026",
    size: "980 KB",
  },
];

export default function AllDocuments() {
  const [query, setQuery] = useState("");

  const filteredDocuments = useMemo(() => {
    if (!query.trim()) return mockDocuments;
    const q = query.toLowerCase();
    return mockDocuments.filter(
      (doc) =>
        doc.name.toLowerCase().includes(q) ||
        doc.category.toLowerCase().includes(q) ||
        doc.uploadedBy.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 px-8 pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Todos os Documentos
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Aqui você pode ver todos os documentos do projeto.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            <Upload className="h-4 w-4" />
            Carregar Documento
          </button>
        </div>

        {/* Search */}
        <div className="relative mt-5 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar documentos..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>
      </div>

      {/* Content */}
      <div className="mt-5 flex-1 overflow-y-auto px-8 pb-8">
        {filteredDocuments.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <FileText className="h-8 w-8 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-900">
              Nenhum documento encontrado
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Tente pesquisar por outro termo.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Enviado por</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Tamanho</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-medium text-gray-900">
                        <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                        <span className="truncate">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{doc.uploadedBy}</td>
                    <td className="px-4 py-3 text-gray-600">{doc.uploadedAt}</td>
                    <td className="px-4 py-3 text-gray-600">{doc.size}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          aria-label={`Descarregar ${doc.name}`}
                          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Mais opções para ${doc.name}`}
                          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}