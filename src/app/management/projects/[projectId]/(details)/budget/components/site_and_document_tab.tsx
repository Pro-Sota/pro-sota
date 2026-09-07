import { HardHat, FileText } from "lucide-react";
import { SiteCard, DocumentCard, EmptyState } from "../components/overview_tab";
import { SITE_SECTIONS, DOCUMENT_SECTIONS } from "./constants";

export function SiteTab() {
  return (
    <div className="space-y-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Obra e fiscalização
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Registos técnicos e administrativos relacionados com a execução da obra.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SITE_SECTIONS.map((item) => (
          <SiteCard
            key={item.title}
            title={item.title}
            description={item.description}
            icon={item.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <EmptyState
          icon={HardHat}
          title="Diário de obra"
          description="Registe actividades, equipas, condições da obra, materiais, equipamentos e acontecimentos diários."
        />

        <EmptyState
          icon={FileText}
          title="Pedidos de esclarecimento"
          description="Controle pedidos, respostas, responsáveis, prazos e documentação associada."
        />
      </div>
    </div>
  );
}

export function DocumentsTab() {
  return (
    <div className="space-y-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Documentos financeiros
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Documentos associados ao orçamento, execução e facturação do projecto.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DOCUMENT_SECTIONS.map((item) => (
          <DocumentCard
            key={item.title}
            title={item.title}
            description={item.description}
            icon={item.icon}
          />
        ))}
      </div>
    </div>
  );
}