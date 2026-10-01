import { Search } from "lucide-react";

type Props = {
  query: string;
  onClear: () => void;
};

export default function EmptySearch({
  query,
  onClear,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-16 text-center">
      <Search className="mb-4 h-10 w-10 text-gray-300" />

      <p className="text-sm font-medium text-gray-900">
        Nenhuma tarefa encontrada
      </p>

      <p className="mt-1 text-sm text-gray-500">
        Nenhuma tarefa corresponde a "{query}"
      </p>

      <button
        type="button"
        onClick={onClear}
        className="mt-4 text-sm font-medium text-gray-600 underline hover:text-gray-900"
      >
        Limpar pesquisa
      </button>
    </div>
  );
}