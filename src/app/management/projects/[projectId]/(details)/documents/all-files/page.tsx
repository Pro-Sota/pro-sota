"use client";

import { useState, useMemo, } from "react";
import { FileText, Search, Upload, Download, MoreVertical } from "lucide-react";
import DocumentTableView from "../components/document_table";
import DocumentGridView from "../components/document_grid";
import { mockDocuments } from "../data";
import { useSearchParams } from "next/navigation";


// Replace with real data (props, fetch, server component, etc.)


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

  const searchParams = useSearchParams();

    const viewMode =
    (searchParams.get("view") as "grid" | "list") ?? "list";

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


    {viewMode == "grid" && (<DocumentGridView documents={filteredDocuments}/>)}
    {viewMode == "list" && (<DocumentTableView documents={filteredDocuments}/>)}
 
    </div>
  );
}