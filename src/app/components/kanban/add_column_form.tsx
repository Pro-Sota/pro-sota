import { Plus } from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Add Column Form                                                           */
/* -------------------------------------------------------------------------- */

type AddColumnFormProps = {
  isAdding: boolean;
  listInput: string;
  onInputChange: (value: string) => void;
  onAddClick: () => void;
  onCancelClick: () => void;
  onToggleForm: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
};

export function AddColumnForm({
  isAdding,
  listInput,
  onInputChange,
  onAddClick,
  onCancelClick,
  onToggleForm,
  onKeyDown,
}: AddColumnFormProps) {
  if (isAdding) {
    return (
      <div className="flex h-full flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <input
          autoFocus
          type="text"
          value={listInput}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Nome da lista..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onAddClick}
            className="flex-1 rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Adicionar
          </button>

          <button
            type="button"
            onClick={onCancelClick}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggleForm}
      className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-4 text-sm font-semibold text-gray-600 transition hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900"
    >
      <Plus className="h-5 w-5" />
      Nova lista
    </button>
  );
}