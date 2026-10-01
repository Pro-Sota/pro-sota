import SearchBox from "./search_box";

type Props = {
  projectId: string | null;
  searchQuery: string;
  onSearchChange: (
    value: string,
  ) => void;
};

export default function BoardHeader({
  projectId,
  searchQuery,
  onSearchChange,
}: Props) {
  return (
    <div className="mb-8 border-b border-gray-200 pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            Tarefas
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            {projectId
              ? "Organize as tarefas deste projecto."
              : "Consulte as tarefas gerais da equipa."}
          </p>
        </div>

        <SearchBox
          value={searchQuery}
          onChange={onSearchChange}
        />
      </div>
    </div>
  );
}