import { Plus } from "lucide-react";

type Props = {
  onClick: () => void;
};

export default function AddColumnButton({
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-fit w-80 shrink-0 items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-500 transition hover:border-gray-400 hover:text-gray-700"
    >
      <Plus className="h-4 w-4" />
      Adicionar lista
    </button>
  );
}