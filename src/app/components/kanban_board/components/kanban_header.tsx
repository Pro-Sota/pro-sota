'use client';

import { Search, X } from 'lucide-react';

export default function KanbanHeader({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tarefas</h1>
      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Pesquisar tarefas..."
          aria-label="Pesquisar tarefas"
          className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-9 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Limpar pesquisa"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
