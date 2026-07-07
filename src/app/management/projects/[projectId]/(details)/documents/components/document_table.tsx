import { Download, FileText, MoreVertical } from "lucide-react";
import { DocumentType } from "../types"

export default function DocumentTableView({ documents }: { documents: DocumentType[] }) {

    if (documents.length === 0) {
        return (<div className="flex h-full flex-col items-center justify-center text-center">
            <FileText className="h-8 w-8 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-900">
                Nenhum documento encontrado
            </p>
            <p className="mt-1 text-sm text-gray-500">
                Tente pesquisar por outro termo.
            </p>
        </div>)
    }
    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 mx-4 ">
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
                    {documents.map((doc) => (
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
    );
}