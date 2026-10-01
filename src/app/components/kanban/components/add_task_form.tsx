"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export default function AddTaskForm({
  value,
  onChange,
  onSubmit,
}: Props) {
  return (
    <div className="space-y-3 border-t border-gray-200 px-4 py-4 sm:px-5">
      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onSubmit();
          }
        }}
        placeholder="Nova tarefa..."
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
      />

      <button
        type="button"
        onClick={onSubmit}
        className="w-full rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
      >
        Adicionar tarefa
      </button>
    </div>
  );
}